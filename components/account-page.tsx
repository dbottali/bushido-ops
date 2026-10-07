"use client";

import { useEffect,useState,type FormEvent,type ReactNode,type RefObject } from "react";
import { useCloud } from "./cloud-provider";
import { DojoPageHeader,DojoPageFooter } from "./dojo-page-chrome";
import { AnimatedFighter } from "./animated-fighter";
import { PREVIEW_COURSE,PREVIEW_MODULE } from "@/lib/guest-preview";
import { downloadJson } from "@/lib/browser-download";
export type AccountMode="profile"|"signup"|"login"|"forgot"|"reset";
type Props={brand:ReactNode;headingRef:RefObject<HTMLHeadingElement|null>;mode:AccountMode};

function AuthForm({mode}:{mode:AccountMode}) {
  const cloud=useCloud();
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[name,setName]=useState("");
  const [working,setWorking]=useState(false),[notice,setNotice]=useState<string|null>(null),[failure,setFailure]=useState<string|null>(null),[verificationEmail,setVerificationEmail]=useState("");
  const selected=mode==="profile"?"signup":mode;
  useEffect(()=>{setPassword("");setNotice(null);setFailure(null);},[mode]);
  const submit=async(event:FormEvent)=>{
    event.preventDefault(); if(!cloud.client) return;setWorking(true);setFailure(null);setNotice(null);
    try {
      if(selected==="signup") {
        const result=await cloud.client.auth.signUp({email:email.trim(),password,options:{data:{display_name:name.trim()},emailRedirectTo:`${cloud.config!.appUrl}/#account`}});
        if(result.error) throw result.error;
        setVerificationEmail(email.trim());setPassword("");setNotice("Check your inbox and confirm your email. Then sign in to continue White for free. Your preview stays on this device.");
      } else if(selected==="login") {
        const result=await cloud.client.auth.signInWithPassword({email:email.trim(),password});if(result.error)throw result.error;
        setPassword("");window.location.hash="#my-dojo";
      } else if(selected==="forgot") {
        const result=await cloud.client.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${cloud.config!.appUrl}/?auth=recovery#account/reset`});if(result.error)throw result.error;
        setNotice("If this email has an account, a password reset link will arrive shortly. Check your spam folder too.");
      } else {
        if(!cloud.session||!cloud.recovery) throw new Error("Open a password reset link from your email first.");
        const result=await cloud.client.auth.updateUser({password});if(result.error)throw result.error;
        cloud.finishRecovery();setPassword("");setNotice("Password updated. You can return to your dojo.");window.location.hash="#account";
      }
    } catch(error){setFailure((error as Error).message);}finally{setWorking(false);}
  };
  const resend=async()=>{if(!cloud.client||!verificationEmail)return;setWorking(true);setFailure(null);try{const result=await cloud.client.auth.resend({type:"signup",email:verificationEmail,options:{emailRedirectTo:`${cloud.config!.appUrl}/#account`}});if(result.error)throw result.error;setNotice("A new confirmation link was requested. Check your inbox.");}catch(error){setFailure((error as Error).message);}finally{setWorking(false);}};
  return <section className="account-card pixel-frame"><p className="eyebrow">{selected==="signup"?"WHITE IS FREE / NO CARD REQUIRED":selected==="login"?"WELCOME BACK":selected==="forgot"?"RECOVER YOUR ACCOUNT":"CHOOSE A NEW PASSWORD"}</p><h2>{selected==="signup"?"START YOUR FREE ACCOUNT.":selected==="login"?"RETURN TO YOUR DOJO.":selected==="forgot"?"GET A RESET LINK.":"A FRESH START."}</h2>
    {!cloud.ready?<p role="status">Connecting to the account service…</p>:!cloud.config?.configured?<div className="configuration-note" role="status"><strong>GUEST PREVIEW AVAILABLE</strong><p>Accounts and cloud progress need the staging services connected first. You can already try the three-question preview.</p><a className="pixel-button" href="#dojo">TRY WHITE ➜</a></div>:<>
      {selected!=="forgot"&&selected!=="reset"&&<nav className="account-tabs" aria-label="Account access"><a href="#account/signup" aria-current={selected==="signup"?"page":undefined}>CREATE ACCOUNT</a><a href="#account/login" aria-current={selected==="login"?"page":undefined}>SIGN IN</a></nav>}
      <form onSubmit={submit} className="account-form">{selected==="signup"&&<label>DOJO NAME <span>Optional</span><input value={name} onChange={e=>setName(e.target.value)} maxLength={60} autoComplete="nickname"/></label>}{selected!=="reset"&&<label>EMAIL<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" autoCapitalize="none" spellCheck={false}/></label>}{selected!=="forgot"&&<label>{selected==="reset"?"NEW PASSWORD":"PASSWORD"}<input type="password" required minLength={selected==="login"?1:12} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={selected==="login"?"current-password":"new-password"}/>{selected!=="login"&&<small>Use at least 12 characters.</small>}</label>}
        <button className="pixel-button" type="submit" disabled={working||(selected==="reset"&&(!cloud.session||!cloud.recovery))}>{working?"WORKING…":selected==="signup"?"CREATE FREE ACCOUNT ➜":selected==="login"?"SIGN IN ➜":selected==="forgot"?"SEND RESET LINK":"SAVE NEW PASSWORD"}</button>
      </form>{selected==="login"&&<a className="about-text-link" href="#account/forgot">FORGOT YOUR PASSWORD?</a>}
      {notice&&<div className="feedback success" role="status"><p>{notice}</p>{verificationEmail&&<button type="button" className="about-text-link" disabled={working} onClick={()=>void resend()}>RESEND CONFIRMATION</button>}</div>}{failure&&<div className="feedback" role="alert"><p>{failure}</p></div>}
    </>}
  </section>;
}

export function GuestMigration() {
  const cloud=useCloud();const [working,setWorking]=useState(false),[dismissed,setDismissed]=useState(false),[failure,setFailure]=useState<string|null>(null);
  if(!cloud.session||!cloud.snapshot||!cloud.guest.submitted||cloud.snapshot.profile.guest_imported||dismissed)return null;
  const transfer=async()=>{setWorking(true);setFailure(null);try{await cloud.api("progress/import-guest","POST",{courseId:PREVIEW_COURSE,moduleId:PREVIEW_MODULE,answers:cloud.guest.answers,requestId:crypto.randomUUID()});cloud.saveGuest({...cloud.guest,importedBy:cloud.session!.user.id});await cloud.refresh();}catch(error){setFailure((error as Error).message);}finally{setWorking(false);}};
  return <section className="guest-migration pixel-frame"><p className="eyebrow">YOUR PREVIEW CAME WITH YOU</p><h2>KEEP YOUR FIRST STEP.</h2><p>Add these three answers to your account. The server checks them again and counts earned XP once. Your other device will then see the same progress.</p><div className="practice-actions"><button className="pixel-button" disabled={working} onClick={()=>void transfer()}>{working?"SAVING PREVIEW…":"SAVE PREVIEW TO MY ACCOUNT"}</button><button className="pixel-button pixel-button-light" disabled={working} onClick={()=>setDismissed(true)}>KEEP ONLY ON THIS DEVICE</button></div>{failure&&<p role="alert">{failure}</p>}</section>;
}

function BillingCard() {
  const cloud=useCloud();const [working,setWorking]=useState(false),[failure,setFailure]=useState<string|null>(null),[notice,setNotice]=useState<string|null>(null);
  const [offer,setOffer]=useState<{currency:string;unitAmount:number;interval:string;intervalCount:number}|null>(null);
  const subscription=cloud.snapshot?.subscription,white=cloud.snapshot?.awards.some(award=>award.belt==="white");
  const premiumReady=cloud.courses.some(course=>course.belt!=="white"&&course.availability==="available");
  const existing=subscription&&!['none','canceled','incomplete_expired'].includes(subscription.status);
  useEffect(()=>{let active=true;if(cloud.config?.billingEnabled)void cloud.api<typeof offer>("billing/offer").then(value=>{if(active)setOffer(value);}).catch(()=>{if(active)setOffer(null);});return()=>{active=false;};},[cloud.api,cloud.config?.billingEnabled]);
  const act=async(kind:"checkout"|"portal"|"refresh")=>{setWorking(true);setFailure(null);try{const result=await cloud.api<{url?:string}>(`billing/${kind}`,"POST",{});if(result.url){const destination=new URL(result.url);if(destination.protocol!=="https:"||!['checkout.stripe.com','billing.stripe.com'].includes(destination.hostname))throw new Error("Unexpected billing address.");window.location.assign(destination.href);}else{await cloud.refresh();setNotice("Subscription status refreshed from Stripe.");}}catch(error){setFailure((error as Error).message);}finally{setWorking(false);}};
  useEffect(()=>{const url=new URL(window.location.href),status=url.searchParams.get("billing");if(!status)return;url.searchParams.delete("billing");window.history.replaceState(null,"",url.pathname+url.search+url.hash);if(status==="success"){setNotice("Checkout returned. Checking the subscription with Stripe…");void act("refresh");}else if(status==="cancel")setNotice("Checkout closed. Your training progress is unchanged.");},[]); // A return URL never grants access.
  let label="Test price appears after Stripe is connected.";
  if(offer){const formatter=new Intl.NumberFormat("en",{style:"currency",currency:offer.currency});const digits=formatter.resolvedOptions().maximumFractionDigits??2;label=`${formatter.format(offer.unitAmount/Math.pow(10,digits))} / ${offer.intervalCount>1?`${offer.intervalCount} `:""}${offer.interval}${offer.intervalCount>1?"s":""} · sandbox price`;}
  return <section className="account-card pixel-frame"><p className="eyebrow">YELLOW AND ABOVE / STRIPE SANDBOX</p><h2>ACCESS IS A SUBSCRIPTION.<br/>BELTS ARE EARNED.</h2><p>White stays free. Premium training requires your White belt and an active subscription. Passing the course exam earns the next belt.</p><p className="billing-price">{label}</p><span className="course-status">{subscription?.premium?subscription.cancel_at_period_end?"ACTIVE / ENDS AT PERIOD END":"TEST SUBSCRIPTION ACTIVE":existing?subscription.status.toUpperCase():"NO ACTIVE SUBSCRIPTION"}</span>{subscription?.current_period_end&&<p>{subscription.cancel_at_period_end?"Scheduled end":"Current period ends"}: {new Date(subscription.current_period_end).toLocaleDateString("en",{year:"numeric",month:"short",day:"numeric"})}.</p>}
    <p>{!premiumReady?"Premium courses are still in development. There is nothing to subscribe to yet.":!white?"Finish the complete White course and final exam before starting premium.":"Only test cards are accepted in 0.5. No real payment is collected."}</p>
    <div className="practice-actions">{existing?<button className="pixel-button" disabled={working||!cloud.config?.billingEnabled} onClick={()=>void act("portal")}>MANAGE TEST SUBSCRIPTION ➜</button>:<button className="pixel-button" disabled={working||!cloud.config?.billingEnabled||!white||!premiumReady||!offer} onClick={()=>void act("checkout")}>{working?"CONNECTING…":"TRY SANDBOX CHECKOUT ➜"}</button>}<button className="pixel-button pixel-button-light" disabled={working||!cloud.config?.billingEnabled} onClick={()=>void act("refresh")}>REFRESH STATUS</button></div>{notice&&<p role="status">{notice}</p>}{failure&&<p role="alert">{failure}</p>}
  </section>;
}

function AccountSettings() {
  const cloud=useCloud();const [name,setName]=useState(cloud.snapshot?.profile.display_name??""),[working,setWorking]=useState(false),[notice,setNotice]=useState<string|null>(null),[failure,setFailure]=useState<string|null>(null);
  const [password,setPassword]=useState(""),[newPassword,setNewPassword]=useState(""),[deleteOpen,setDeleteOpen]=useState(false),[confirmation,setConfirmation]=useState("");
  useEffect(()=>{setName(cloud.snapshot?.profile.display_name??"");},[cloud.snapshot?.profile.display_name]);
  const run=async(action:()=>Promise<void>)=>{setWorking(true);setFailure(null);setNotice(null);try{await action();}catch(error){setFailure((error as Error).message);}finally{setWorking(false);setPassword("");}};
  const reauthenticate=async()=>{if(!cloud.client||!cloud.session?.user.email)throw new Error("Sign in again first.");const result=await cloud.client.auth.signInWithPassword({email:cloud.session.user.email,password});if(result.error)throw result.error;};
  return <section className="account-card pixel-frame"><p className="eyebrow">YOUR ACCOUNT</p><h2>KEEP YOUR DOJO IN ORDER.</h2><p className="account-email">{cloud.session?.user.email}</p>
    <form className="account-form" onSubmit={event=>{event.preventDefault();void run(async()=>{await cloud.updateProfile(name,cloud.snapshot?.profile.habits??[]);setNotice("Dojo name saved.");});}}><label>DOJO NAME<input value={name} maxLength={60} autoComplete="nickname" onChange={event=>setName(event.target.value)}/></label><button className="pixel-button" disabled={working||cloud.busy||!cloud.snapshot} type="submit">SAVE NAME</button></form>
    <div className="practice-actions"><a href="#my-dojo" className="pixel-button pixel-button-light">MY DOJO ➜</a><button className="pixel-button pixel-button-light" disabled={working} onClick={()=>void run(async()=>{downloadJson("bushido-ops-account-export.json",await cloud.api("account/export"));setNotice("Your account data was exported. A backup cannot grant XP or a subscription.");})}>EXPORT MY DATA</button><button className="pixel-button pixel-button-light" disabled={working} onClick={()=>void run(async()=>{await cloud.signOut();window.location.hash="#account/login";})}>SIGN OUT</button>{cloud.owner&&<a className="pixel-button pixel-button-light" href="#owner">OWNER / CONTENT IMPORT ➜</a>}</div>
    <details className="account-details"><summary>CHANGE PASSWORD</summary><form className="account-form" onSubmit={event=>{event.preventDefault();void run(async()=>{await reauthenticate();const result=await cloud.client!.auth.updateUser({password:newPassword});if(result.error)throw result.error;setNewPassword("");setNotice("Password updated.");});}}><label>CURRENT PASSWORD<input type="password" value={password} required autoComplete="current-password" onChange={event=>setPassword(event.target.value)}/></label><label>NEW PASSWORD<input type="password" value={newPassword} required minLength={12} autoComplete="new-password" onChange={event=>setNewPassword(event.target.value)}/></label><button className="pixel-button" disabled={working}>UPDATE PASSWORD</button></form></details>
    <details className="account-details" open={deleteOpen} onToggle={event=>setDeleteOpen(event.currentTarget.open)}><summary>DELETE ACCOUNT</summary><p>This deletes your cloud profile, answers, XP and belt awards, and stops your test subscription. Export your data first if you want a copy.</p><form className="account-form" onSubmit={event=>{event.preventDefault();void run(async()=>{await reauthenticate();await cloud.api("account","DELETE",{confirmation});await cloud.signOut();window.location.hash="#account/signup";});}}><label>CURRENT PASSWORD<input type="password" value={password} required autoComplete="current-password" onChange={event=>setPassword(event.target.value)}/></label><label>TYPE DELETE<input value={confirmation} required pattern="DELETE" autoComplete="off" onChange={event=>setConfirmation(event.target.value)}/></label><button className="pixel-button" disabled={working||confirmation!=="DELETE"}>DELETE MY ACCOUNT</button></form></details>
    {notice&&<p className="feedback success" role="status">{notice}</p>}{failure&&<p className="feedback" role="alert">{failure}</p>}
  </section>;
}

export function AccountPage({brand,headingRef,mode}:Props) {
  const cloud=useCloud(),signedIn=!!cloud.session&&mode!=="reset"&&!cloud.recovery;
  return <div className="dojo-page-shell"><DojoPageHeader brand={brand} currentPage="account"/><main id="account-content" className="account-main" tabIndex={-1}><div className="training-intro"><div><p className="eyebrow">YOUR ACCOUNT / BUSHIDO OPS 0.5</p><h1 ref={headingRef} tabIndex={-1}>{signedIn?"YOUR PLACE IN THE DOJO.":<>THREE QUESTIONS.<br/>THEN YOUR OWN DOJO.</>}</h1><p>Try White as a guest. Finish White with a free account. Earn the next belts through premium practice.</p></div><AnimatedFighter role="training" className="training-fighter"/></div>{cloud.error&&cloud.config?.configured&&<div className="feedback" role="alert"><p>{cloud.error}</p><button className="about-text-link" disabled={cloud.busy} onClick={()=>void cloud.refresh()}>RECONNECT</button></div>}{signedIn?<><GuestMigration/><div className="account-grid"><AccountSettings/><BillingCard/></div></>:<div className="account-entry"><AuthForm mode={cloud.recovery?"reset":mode}/><aside className="account-benefits"><p className="eyebrow">ONE CLEAR PATH</p><h2>WHITE IS YOUR FREE START.</h2><ul><li>Your preview answers come with you.</li><li>Continue your training on another device.</li><li>XP counts once. Belts follow the exam rules.</li><li>Subscribe only after White, when premium courses are ready.</li></ul><a className="about-text-link" href="#dojo">TRY THE GUEST PREVIEW ➜</a></aside></div>}</main><DojoPageFooter/></div>;
}
