"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { CloudSnapshot, CourseListing, GuestPreview, LearningEvent, PublicConfig } from "@/lib/cloud-types";
import { decodeGuest, emptyGuest, GUEST_KEY } from "@/lib/guest-preview";

export class CloudError extends Error {
  constructor(message: string, public code = "NETWORK_ERROR", public status = 0) { super(message); }
}
async function fetchJson<T>(path: string, token?: string, method = "GET", value?: unknown): Promise<T> {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`/api/${path}`, { method, signal: controller.signal, cache: "no-store", headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(value !== undefined ? { "Content-Type": "application/json" } : {}) }, ...(value !== undefined ? { body: JSON.stringify(value) } : {}) });
    const data = await response.json().catch(() => null) as {error?:{message?:string;code?:string}}|null;
    if (!response.ok || !data) throw new CloudError(data?.error?.message ?? "The account service is not connected here. You can try the guest preview.", data?.error?.code ?? "NOT_CONFIGURED", response.status);
    return data as T;
  } catch (error) { if (error instanceof CloudError) throw error; throw new CloudError("Connection interrupted. Your answers are kept on this device. Reconnect and try again."); }
  finally { clearTimeout(timer); }
}
type EventResponse = { snapshot: CloudSnapshot; replayed?: boolean };
type CloudContextValue = {
  ready: boolean; config: PublicConfig | null; client: SupabaseClient | null; session: Session | null;
  snapshot: CloudSnapshot | null; courses: CourseListing[]; catalogRevision: number; owner: boolean;
  busy: boolean; error: string | null; recovery: boolean;
  guest: GuestPreview; guestReady: boolean; guestSaved: boolean; saveGuest: (next: GuestPreview) => void;
  api: <T>(path: string, method?: string, value?: unknown) => Promise<T>;
  refresh: () => Promise<void>; event: (input: LearningEvent) => Promise<EventResponse>;
  updateProfile: (displayName: string, habits: string[]) => Promise<void>;
  signOut: () => Promise<void>; clearError: () => void; finishRecovery: () => void;
};
const Context = createContext<CloudContextValue | null>(null);
export function useCloud() { const value = useContext(Context); if (!value) throw new Error("CloudProvider missing"); return value; }

export function CloudProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false), [config, setConfig] = useState<PublicConfig | null>(null);
  const [client, setClient] = useState<SupabaseClient | null>(null), [session, setSession] = useState<Session | null>(null);
  const [snapshot, setSnapshot] = useState<CloudSnapshot | null>(null), [courses, setCourses] = useState<CourseListing[]>([]);
  const [catalogRevision, setCatalogRevision] = useState(0), [owner, setOwner] = useState(false);
  const [busyCount, setBusyCount] = useState(0), [error, setError] = useState<string | null>(null), [recovery, setRecovery] = useState(false);
  const [guest,setGuest]=useState(emptyGuest),[guestReady,setGuestReady]=useState(false),[guestSaved,setGuestSaved]=useState(true);
  const clientRef = useRef<SupabaseClient | null>(null), sessionRef = useRef<Session | null>(null), epoch = useRef(0), alive = useRef(true);
  const configuredRef=useRef(false);
  const accept = useCallback((state: CloudSnapshot) => setSnapshot(previous => !previous || state.revision >= previous.revision ? state : previous), []);
  const api = useCallback(async <T,>(path: string, method = "GET", value?: unknown): Promise<T> => {
    const generation=epoch.current, expectedUser=sessionRef.current?.user.id;
    const auth = clientRef.current;
    const current = auth ? (await auth.auth.getSession()).data.session : null;
    if(generation!==epoch.current||current?.user.id!==expectedUser)throw new CloudError("The account changed. Try again with the current account.","ACCOUNT_CHANGED");
    if (!current && path !== "catalog") throw new CloudError("Sign in to continue your free White training.", "SIGN_IN_REQUIRED", 401);
    const result=await fetchJson<T>(path, current?.access_token, method, value);
    if(generation!==epoch.current)throw new CloudError("The account changed. Try again with the current account.","ACCOUNT_CHANGED");
    return result;
  }, []);
  const refresh = useCallback(async () => {
    const current = sessionRef.current, generation = epoch.current;
    if(!configuredRef.current)return;
    if (!current) {
      try{const catalog=await api<{revision:number;courses:CourseListing[]}>("catalog");if(alive.current&&generation===epoch.current){setCourses(catalog.courses);setCatalogRevision(catalog.revision);}}
      catch{/* Guest preview remains available if the remote catalog is offline. */}
      return;
    }
    setBusyCount(count => count + 1);
    try {
      const [account, catalog] = await Promise.all([api<{snapshot:CloudSnapshot;owner:boolean}>("me"),api<{revision:number;courses:CourseListing[]}>("catalog")]);
      if (!alive.current || generation !== epoch.current) return;
      accept(account.snapshot); setOwner(account.owner); setCourses(catalog.courses); setCatalogRevision(catalog.revision); setError(null);
    } catch (failure) { if (alive.current && generation === epoch.current) setError((failure as Error).message); }
    finally { if (alive.current) setBusyCount(count => Math.max(0,count-1)); }
  }, [api, accept]);

  useEffect(() => {
    alive.current = true; let cancelled = false; let unsubscribe: (() => void) | undefined;
    try {
      const current=decodeGuest(window.localStorage.getItem(GUEST_KEY));
      if(Object.keys(current.answers).length===0) {
        const legacy=JSON.parse(window.localStorage.getItem("bushido-ops.progress")??"null");
        const pilot=legacy?.progress?.courses?.["white-phishing-pilot"]?.modules?.quiz;
        setGuest(pilot?.submitted ? decodeGuest(JSON.stringify({version:1,answers:pilot.answers,submitted:true})) : current);
      } else setGuest(current);
    } catch { setGuestSaved(false); }
    setGuestReady(true);
    const updateSession = (next: Session | null) => {
      if (sessionRef.current?.user.id !== next?.user.id) {
        epoch.current++; setSnapshot(null); setCourses([]); setOwner(false);
      }
      sessionRef.current = next; setSession(next);
    };
    const initialize = async () => {
      try {
        const settings = await fetchJson<PublicConfig>("config");
        if (cancelled) return; setConfig(settings);configuredRef.current=settings.configured;
        if (!settings.configured || !settings.supabaseUrl || !settings.publishableKey) return;
        const {createClient}=await import("@supabase/supabase-js");
        if(cancelled)return;
        const auth = createClient(settings.supabaseUrl,settings.publishableKey,{auth:{flowType:"pkce",persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:"bushido-ops.auth"}});
        clientRef.current=auth; setClient(auth);
        const { data } = auth.auth.onAuthStateChange((event,next) => {
          if (cancelled) return;
          updateSession(next);
          if (event === "PASSWORD_RECOVERY") { setRecovery(true); window.location.hash="#account/reset"; }
          // Supabase auth callbacks run under an auth lock; perform network reads outside the callback.
          if (event !== "TOKEN_REFRESHED") setTimeout(() => { if (!cancelled) void refresh(); },0);
        });
        unsubscribe=()=>data.subscription.unsubscribe();
        const url=new URL(window.location.href), hash=url.searchParams.get("token_hash"), type=url.searchParams.get("type");
        if (hash && ["email","recovery","email_change"].includes(type ?? "")) {
          // Custom email templates use token_hash, so confirmation works when mail opens on another device.
          const verified=await auth.auth.verifyOtp({token_hash:hash,type:type as "email"|"recovery"|"email_change"});
          url.searchParams.delete("token_hash"); url.searchParams.delete("type");
          window.history.replaceState(null,"",url.pathname+url.search+url.hash);
          if (verified.error) throw new CloudError("This email link expired or was already used. Sign in or request a new link.","EMAIL_LINK_EXPIRED");
          if (type==="recovery") { setRecovery(true); window.location.hash="#account/reset"; }
          else window.location.hash="#account";
        }
        const current=await auth.auth.getSession();
        if (cancelled) return; updateSession(current.data.session);
        await refresh();
      } catch (failure) {
        if (!cancelled) {
          setError((failure as Error).message);
          setConfig(previous=>previous ?? {version:"0.5.0",configured:false,billingEnabled:false,environment:"staging"});
        }
      } finally { if (!cancelled) setReady(true); }
    };
    void initialize();
    const reload=()=>{ if (document.visibilityState!=="hidden") void refresh(); };
    window.addEventListener("online",reload); window.addEventListener("focus",reload); document.addEventListener("visibilitychange",reload);
    const interval=setInterval(reload,60000);
    return ()=>{cancelled=true;alive.current=false;unsubscribe?.();clearInterval(interval);window.removeEventListener("online",reload);window.removeEventListener("focus",reload);document.removeEventListener("visibilitychange",reload);};
  },[refresh]);

  const event = useCallback(async (input: LearningEvent) => {
    const generation=epoch.current;
    const result=await api<EventResponse>("progress/event","POST",input).catch(async failure=>{if(failure instanceof CloudError && failure.status===409) await refresh();throw failure;});
    if(generation!==epoch.current) throw new CloudError("The account changed. Sign in again before saving.","ACCOUNT_CHANGED");
    accept(result.snapshot); return result;
  },[api,accept,refresh]);
  const updateProfile = useCallback(async (displayName:string,habits:string[])=>{
    if(!snapshot) return; setBusyCount(count=>count+1);
    try { const result=await api<EventResponse>("profile","PATCH",{displayName,habits,expectedRevision:snapshot.profile.revision});accept(result.snapshot);setError(null); }
    catch(failure){await refresh();setError((failure as Error).message);throw failure;}
    finally{setBusyCount(count=>Math.max(0,count-1));}
  },[snapshot,api,accept,refresh]);
  const signOut=useCallback(async()=>{
    const result=await clientRef.current?.auth.signOut({scope:"local"});
    if(result?.error) throw result.error;
    sessionRef.current=null;epoch.current++;setSession(null);setSnapshot(null);setCourses([]);setOwner(false);setError(null);setRecovery(false);
    // Clear provisional private answers from a shared device on explicit sign-out.
    try { for(const key of Object.keys(window.localStorage)) if(key.startsWith("bushido-ops.cloud-draft.")) window.localStorage.removeItem(key); } catch { /* Storage may be denied. */ }
  },[]);
  const saveGuest=useCallback((next:GuestPreview)=>{setGuest(next);try{window.localStorage.setItem(GUEST_KEY,JSON.stringify(next));setGuestSaved(true);}catch{setGuestSaved(false);}},[]);
  return <Context.Provider value={{ready,config,client,session,snapshot,courses,catalogRevision,owner,busy:busyCount>0,error,recovery,guest,guestReady,guestSaved,saveGuest,api,refresh,event,updateProfile,signOut,clearError:()=>setError(null),finishRecovery:()=>setRecovery(false)}}>{children}</Context.Provider>;
}
