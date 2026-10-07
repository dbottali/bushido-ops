import test,{before,after} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PGlite} from "@electric-sql/pglite";
import {createClient} from "@supabase/supabase-js";
import Stripe from "stripe";
import {handleApi,type Environment} from "../server/api";
import type {CloudSnapshot} from "../lib/cloud-types";

const pg=new PGlite();
const alice="10000000-0000-4000-8000-000000000001",bob="10000000-0000-4000-8000-000000000002";
const env:Environment={APP_URL:"https://dojo.example",SUPABASE_URL:"https://project.supabase.co",SUPABASE_PUBLISHABLE_KEY:"sb_publishable_fixture",SUPABASE_SERVICE_ROLE_KEY:"sb_secret_fixture",OWNER_USER_IDS:alice,DEPLOYMENT_STAGE:"staging",STRIPE_SECRET_KEY:"sk_test_fixture",STRIPE_PRICE_ID:"price_fixture",STRIPE_WEBHOOK_SECRET:"whsec_fixture"};
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{"Content-Type":"application/json"}});
function identifier(value:string){if(!/^[a-z_]+$/.test(value))throw new Error("Invalid test identifier");return `"${value}"`;}
const transport:typeof fetch=async(input,init)=>{
  const request=new Request(input,init),url=new URL(request.url),auth=request.headers.get("authorization");
  try{
    if(url.pathname==="/auth/v1/user"){
      if(!["Bearer alice-token","Bearer bob-token","Bearer unverified-token","Bearer stale-token"].includes(auth??""))return json({msg:"Invalid JWT"},401);
      return json({id:auth==="Bearer bob-token"?bob:alice,aud:"authenticated",role:"authenticated",email:auth==="Bearer bob-token"?"bob@example.test":"alice@example.test",email_confirmed_at:auth==="Bearer unverified-token"?null:new Date().toISOString(),last_sign_in_at:auth==="Bearer stale-token"?"2020-01-01T00:00:00Z":new Date().toISOString(),user_metadata:{role:"owner"},app_metadata:{},created_at:new Date().toISOString()});
    }
    if(url.pathname.startsWith("/auth/v1/admin/users/")&&request.method==="DELETE"){
      const userId=url.pathname.split("/").at(-1);await pg.query("delete from auth.users where id=$1",[userId]);return json({});
    }
    if(url.pathname.startsWith("/rest/v1/rpc/")){
      const name=url.pathname.split("/").at(-1)!,values=await request.json() as Record<string,unknown>,keys=Object.keys(values);
      const parameters=keys.map(key=>values[key]!==null&&typeof values[key]==="object"&&!Array.isArray(values[key])?JSON.stringify(values[key]):values[key]);
      const result=await pg.query<{result:unknown}>(`select public.${identifier(name)}(${keys.map((key,index)=>`${identifier(key)}=>$${index+1}`).join(",")}) as result`,parameters);
      return json(result.rows[0].result);
    }
    if(url.pathname.startsWith("/rest/v1/")){
      const table=url.pathname.split("/").at(-1)!;assert(table.startsWith("dojo_"));
      if(request.method==="POST"){
        const value=await request.json() as Record<string,unknown>,keys=Object.keys(value);
        await pg.query(`insert into public.${identifier(table)}(${keys.map(identifier).join(",")}) values(${keys.map((_,index)=>`$${index+1}`).join(",")}) on conflict do nothing`,keys.map(key=>value[key]));return new Response(null,{status:201});
      }
      const columns=(url.searchParams.get("select")??"*").split(",").map(column=>column==="*"?"*":identifier(column)).join(",");
      const where:string[]=[],parameters:unknown[]=[];
      for(const [key,value] of url.searchParams){if(!value.startsWith("eq."))continue;parameters.push(value.slice(3));where.push(`${identifier(key)}=$${parameters.length}`);}
      const order=url.searchParams.get("order")?.split(".");
      const limit=Math.min(Number(url.searchParams.get("limit")??1000),1000);
      const rows=await pg.query(`select ${columns} from public.${identifier(table)} ${where.length?`where ${where.join(" and ")}`:""} ${order?`order by ${identifier(order[0])} ${order[1]==="desc"?"desc":"asc"}`:""} limit ${limit}`,parameters);
      if(request.headers.get("accept")?.includes("object+json"))return rows.rows.length===1?json(rows.rows[0]):json({message:"No rows",code:"PGRST116",details:"0 rows"},406);
      return json(rows.rows);
    }
    return json({message:"Unexpected test transport request"},500);
  }catch(error){return json({message:(error as Error).message,code:(error as {code?:string}).code??"P0001"},400);}
};
const db=createClient(env.SUPABASE_URL!,env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:transport}});
const stripe=new Stripe("sk_test_fixture",{httpClient:Stripe.createFetchHttpClient()});
let currentSubscriptions:Record<string,unknown>[]=[],stripeRequests=0,checkoutRequests=0;
// Only remote transport is stubbed. Auth SDK calls, API validation, webhook crypto and Postgres mutations run normally.
stripe.subscriptions.list=(()=>({autoPagingToArray:async()=>{stripeRequests++;return currentSubscriptions;}})) as unknown as typeof stripe.subscriptions.list;
stripe.prices.retrieve=(async()=>({id:"price_fixture",livemode:false,active:true,unit_amount:100,currency:"eur",recurring:{interval:"month",interval_count:1}})) as unknown as typeof stripe.prices.retrieve;
stripe.customers.create=(async()=>({id:"cus_fixture",livemode:false})) as unknown as typeof stripe.customers.create;
stripe.checkout.sessions.create=(async()=>{checkoutRequests++;return {id:"cs_fixture",url:"https://checkout.stripe.com/c/pay/cs_fixture"};}) as unknown as typeof stripe.checkout.sessions.create;
const dependencies={database:()=>db,stripe:()=>stripe};
async function request(path:string,method="GET",value?:unknown,token="alice-token",origin=env.APP_URL,settings=env){
  const response=await handleApi(new Request(`${settings.APP_URL??env.APP_URL}/api/${path}`,{method,headers:{...(token?{Authorization:`Bearer ${token}`}:{ }),...(value!==undefined?{"Content-Type":"application/json"}:{}),...(origin?{Origin:origin}:{})},...(value!==undefined?{body:JSON.stringify(value)}:{})}),settings,dependencies);
  return {response,data:await response.json() as Record<string,any>};
}
const event=(courseId:string,moduleId:string,action:string,answer:Record<string,string>,expectedRevision=0)=>request("progress/event","POST",{courseId,moduleId,action,answers:answer,expectedRevision,requestId:crypto.randomUUID()});
before(async()=>{
  await pg.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to service_role,authenticated,anon;grant select,delete on auth.users to service_role;`);
  await pg.exec(await readFile("supabase/migrations/202610070001_bushido_ops.sql","utf8"));
  await pg.query("insert into auth.users values($1),($2)",[alice,bob]);
  await pg.query("select public.dojo_publish_catalog($1,$2::jsonb,0)",[alice,await readFile("content/staging-smoke-catalog.json","utf8")]);
  await pg.exec("set role service_role");
});
after(async()=>{await pg.close();});

test("public configuration exposes no private keys, even after a misconfigured publishable key",async()=>{
  const config=await request("config","GET",undefined,"");assert.equal(config.response.status,200);assert.equal(config.data.configured,true);
  assert(!JSON.stringify(config.data).includes("sb_secret_"));assert(!JSON.stringify(config.data).includes("sk_test_"));assert(!JSON.stringify(config.data).includes("whsec_"));
  const invalid=await request("config","GET",undefined,"",undefined,{...env,SUPABASE_PUBLISHABLE_KEY:"sb_secret_do_not_expose"});assert.equal(invalid.data.configured,false);assert(!JSON.stringify(invalid.data).includes("do_not_expose"));
  const live=await request("config","GET",undefined,"",undefined,{...env,STRIPE_SECRET_KEY:"sk_live_do_not_use"});assert.equal(live.data.billingEnabled,false);
});
test("protected API requires a verified current identity, not a client user ID",async()=>{
  assert.equal((await request("me","GET",undefined,"")).response.status,401);
  assert.equal((await request("me","GET",undefined,"forged-token")).response.status,401);
  assert.equal((await request("me","GET",undefined,"unverified-token")).data.error.code,"VERIFY_EMAIL");
  const forged=await request("progress/event","POST",{courseId:"white-test",moduleId:"warmup",action:"submit",answers:{check:"1"},expectedRevision:0,requestId:crypto.randomUUID(),userId:alice},"bob-token");assert.equal(forged.response.status,400);
  assert.equal((await request("me","GET",undefined,"bob-token")).data.snapshot.xp,0);
});
test("mutation origin checks reject cross-site requests and API responses cannot be cached",async()=>{
  const blocked=await request("profile","PATCH",{displayName:"Changed",habits:[],expectedRevision:0},"alice-token","https://attacker.example");assert.equal(blocked.data.error.code,"ORIGIN_REJECTED");
  assert.equal(blocked.response.headers.get("cache-control"),"no-store");
});
test("anonymous catalog contains metadata only and paid content is checked server-side",async()=>{
  const publicCatalog=await request("catalog","GET",undefined,"");assert.equal(publicCatalog.response.status,200);assert(!JSON.stringify(publicCatalog.data).includes('"questions"'));assert(!JSON.stringify(publicCatalog.data).includes('"correct"'));
  const white=await request("courses/white-test");assert.equal(white.response.status,200);assert(!JSON.stringify(white.data).includes('"explanation"'));
  assert.equal((await request("courses/yellow-test")).data.error.code,"WHITE_REQUIRED");
});
test("normal students cannot become content owners via editable user metadata",async()=>{
  assert.equal((await request("owner/catalog","GET",undefined,"bob-token")).response.status,403);
  assert.equal((await request("me","GET",undefined,"bob-token")).data.owner,false);
  assert.equal((await request("owner/catalog")).response.status,200);
});
test("API grades in SQL, enforces step order and issues White only after the final exam",async()=>{
  assert.equal((await event("white-test","lesson","lesson",{})).data.error.code,"PREVIOUS_STEP_REQUIRED");
  assert.equal((await event("white-test","warmup","submit",{check:"1"})).data.snapshot.xp,20);
  assert.equal((await event("white-test","lesson","lesson",{})).data.snapshot.xp,50);
  const result=await event("white-test","exam","submit",{final:"0"});assert.equal(result.data.snapshot.xp,100);assert.equal(result.data.snapshot.awards[0].belt,"white");
  const premium=await request("courses/yellow-test");assert.equal(premium.data.error.code,"SUBSCRIPTION_REQUIRED");
});
test("sandbox checkout does not grant entitlement or XP from the success URL",async()=>{
  const checkout=await request("billing/checkout","POST",{});assert.equal(checkout.response.status,200);assert(checkout.data.testOnly);assert.equal(checkoutRequests,1);
  const state=(await request("me")).data.snapshot as CloudSnapshot;assert.equal(state.subscription?.premium,false);assert.equal(state.xp,100);
});
test("webhook verification rejects tampering, unsigned payloads, replayed timestamps and live events",async()=>{
  const payload=JSON.stringify({id:"evt_fixture",type:"customer.subscription.updated",livemode:false,data:{object:{customer:"cus_fixture"}}});
  const signed=stripe.webhooks.generateTestHeaderString({payload,secret:env.STRIPE_WEBHOOK_SECRET!});
  const send=(raw:string,signature?:string)=>handleApi(new Request(`${env.APP_URL}/api/stripe/webhook`,{method:"POST",headers:signature?{"stripe-signature":signature}:{},body:raw}),env,dependencies);
  assert.equal((await send(payload)).status,400);assert.equal((await send(payload+" ",signed)).status,400);
  const stale=stripe.webhooks.generateTestHeaderString({payload,secret:env.STRIPE_WEBHOOK_SECRET!,timestamp:Math.floor(Date.now()/1000)-1000});assert.equal((await send(payload,stale)).status,400);
  const live=payload.replace('"livemode":false','"livemode":true'),liveSignature=stripe.webhooks.generateTestHeaderString({payload:live,secret:env.STRIPE_WEBHOOK_SECRET!});assert.equal((await send(live,liveSignature)).status,400);
  currentSubscriptions=[{id:"sub_fixture",livemode:false,status:"active",created:Math.floor(Date.now()/1000),cancel_at_period_end:false,items:{data:[{price:{id:"price_fixture"},current_period_end:Math.floor(Date.now()/1000)+86400}]}}];
  const valid=await send(payload,signed);assert.equal(valid.status,200);
  assert.equal((await request("me")).data.snapshot.subscription.premium,true);
  assert.equal((await request("courses/yellow-test")).response.status,200);
  const xp=(await request("me")).data.snapshot.xp;await send(payload,signed);assert.equal((await request("me")).data.snapshot.xp,xp);assert(stripeRequests>0);
});
test("account deletion requires recent password confirmation and an explicit DELETE",async()=>{
  assert.equal((await request("account","DELETE",{confirmation:"DELETE"},"stale-token")).data.error.code,"REAUTHENTICATE");
  assert.equal((await request("account","DELETE",{confirmation:"no"},"bob-token")).response.status,400);
  const deleted=await request("account","DELETE",{confirmation:"DELETE"},"bob-token");assert.equal(deleted.data.deleted,true,JSON.stringify(deleted.data));
  const other=(await request("me")).data.snapshot;assert.equal(other.xp,100);
});
