import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import Stripe from "stripe";
import { z } from "zod";
import { studentCourse, validateCloudCatalog } from "../lib/cloud-catalog";
import type { CatalogDocument, CloudSnapshot, CourseListing, PrivateCourse, PublicConfig } from "../lib/cloud-types";
import { ApiError, databaseError } from "./errors";

export type Environment = {
  SUPABASE_URL?: string; SUPABASE_PUBLISHABLE_KEY?: string; SUPABASE_SERVICE_ROLE_KEY?: string;
  APP_URL?: string; OWNER_USER_IDS?: string; DEPLOYMENT_STAGE?: string; SUPPORT_EMAIL?: string;
  STRIPE_SECRET_KEY?: string; STRIPE_WEBHOOK_SECRET?: string; STRIPE_PRICE_ID?: string;
};
type Dependencies = { database?: (env: Environment) => SupabaseClient; stripe?: (env: Environment) => Stripe };
const uuid = z.string().uuid();
const stableId = z.string().regex(/^[a-z][a-z0-9-]{0,79}$/);
const answers = z.record(stableId, z.string().regex(/^(|[0-9])$/)).refine(value => Object.keys(value).length <= 50);
const learningBody = z.object({ courseId: stableId, moduleId: stableId, action: z.enum(["draft", "submit", "lesson", "retry"]), answers: answers.optional(), expectedRevision: z.number().int().min(0), requestId: uuid }).strict();
const guestBody = z.object({ courseId: stableId, moduleId: stableId, answers, requestId: uuid }).strict();
const profileBody = z.object({ displayName: z.string().trim().max(60), habits: z.array(z.enum(["order", "respect", "honor"])).max(3), expectedRevision: z.number().int().min(0) }).strict();
const LIMIT = 1024 * 1024;

function applicationUrl(env: Environment): string {
  try {
    const url = new URL(env.APP_URL ?? "");
    const local = ["localhost", "127.0.0.1", "terminal.local"].includes(url.hostname);
    if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error();
    return url.origin;
  } catch { throw new ApiError(503, "NOT_CONFIGURED", "The account service is being configured. You can try the guest preview."); }
}
function configured(env: Environment): boolean {
  try { applicationUrl(env); } catch { return false; }
  let publicKey=false;
  if(env.SUPABASE_PUBLISHABLE_KEY?.startsWith("sb_publishable_"))publicKey=true;
  else {
    try{const payload=JSON.parse(atob((env.SUPABASE_PUBLISHABLE_KEY??"").split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));publicKey=payload.role==="anon";}catch{/* Reject private or malformed keys rather than exposing them. */}
  }
  return !!(env.SUPABASE_URL?.startsWith("https://") && publicKey && env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_PUBLISHABLE_KEY!==env.SUPABASE_SERVICE_ROLE_KEY && (!env.DEPLOYMENT_STAGE || env.DEPLOYMENT_STAGE === "staging"));
}
function billingConfigured(env: Environment) { return !!(configured(env) && env.STRIPE_SECRET_KEY?.startsWith("sk_test_") && env.STRIPE_PRICE_ID?.startsWith("price_") && env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_")); }
function defaultDatabase(env: Environment) { return createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }); }
function defaultStripe(env: Environment) {
  if (!billingConfigured(env)) throw new ApiError(503, "BILLING_NOT_CONFIGURED", "Test subscriptions are not connected yet.");
  return new Stripe(env.STRIPE_SECRET_KEY!, { httpClient: Stripe.createFetchHttpClient(), timeout: 15000, maxNetworkRetries: 1, telemetry: false });
}
function requireOwner(user: User, env: Environment) {
  if (!(env.OWNER_USER_IDS ?? "").split(",").map(value => value.trim()).filter(Boolean).includes(user.id)) throw new ApiError(403, "OWNER_ONLY", "Only the project owner can manage training content.");
}
async function readRaw(request: Request): Promise<string> {
  if (Number(request.headers.get("content-length") ?? 0) > LIMIT) throw new ApiError(413, "TOO_LARGE", "The import is too large. Maximum: 1 MB.");
  const reader = request.body?.getReader();
  if (!reader) return "";
  let size = 0; const parts: Uint8Array[] = [];
  while (true) {
    const chunk = await reader.read(); if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > LIMIT) { await reader.cancel(); throw new ApiError(413, "TOO_LARGE", "The import is too large. Maximum: 1 MB."); }
    parts.push(chunk.value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const part of parts) { bytes.set(part, offset); offset += part.byteLength; }
  return new TextDecoder().decode(bytes);
}
async function body<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) throw new ApiError(415, "JSON_REQUIRED", "Send a JSON document.");
  let input: unknown;
  try { input = JSON.parse(await readRaw(request)); } catch (error) { if (error instanceof ApiError) throw error; throw new ApiError(400, "INVALID_JSON", "This is not a valid JSON document."); }
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new ApiError(400, "INVALID_INPUT", "Some fields are missing or invalid. Check your answers and try again.");
  return parsed.data;
}
async function rpc<T>(db: SupabaseClient, name: string, values: Record<string, unknown>): Promise<T> {
  const { data, error } = await db.rpc(name, values);
  if (error) throw databaseError(error.message);
  return data as T;
}
async function catalog(db: SupabaseClient) {
  const { data, error } = await db.from("dojo_catalog").select("revision,document").eq("singleton", true).single();
  if (error || !data) throw new ApiError(503, "DATABASE_NOT_READY", "The training database is being prepared. Try the guest preview.");
  return { revision: data.revision as number, document: data.document as CatalogDocument };
}
async function verifiedUser(request: Request, db: SupabaseClient, optional = false): Promise<User | null> {
  const authorization = request.headers.get("authorization");
  if (!authorization && optional) return null;
  if (!authorization?.startsWith("Bearer ") || authorization.length > 8192) throw new ApiError(401, "SIGN_IN_REQUIRED", "Sign in to continue your free White training.");
  const { data, error } = await db.auth.getUser(authorization.slice(7));
  if (error || !data.user) throw new ApiError(401, "SESSION_EXPIRED", "Your session expired. Sign in again; your progress is saved.");
  if (!data.user.email_confirmed_at) throw new ApiError(403, "VERIFY_EMAIL", "Confirm your email before continuing your White training.");
  return data.user;
}
function courseComplete(state: CloudSnapshot, course: PrivateCourse) { return course.modules.length > 0 && course.modules.every(module => state.modules.some(item => item.course_id === course.id && item.module_id === module.id && item.completed)); }
function listing(course: PrivateCourse, state: CloudSnapshot | null, doc: CatalogDocument): CourseListing {
  const { modules, ...metadata } = course;
  let access: CourseListing["access"] = "open";
  if (course.availability === "planned") access = "planned";
  else if (!state) access = "account";
  else if (course.belt !== "white" && !state.awards.some(item => item.belt === "white")) access = "prerequisite";
  else if (course.belt !== "white" && !state.subscription?.premium) access = "subscription";
  else if (course.prerequisites.some(id => { const other = doc.courses.find(c => c.id === id); return !other || !courseComplete(state, other); })) access = "prerequisite";
  return { ...metadata, moduleCount: modules.length, maxXp: modules.reduce((sum, module) => sum + module.reward, 0), steps: modules.map(({id,title,kind,reward})=>({id,title,kind,reward})), access };
}
async function customer(db: SupabaseClient, stripe: Stripe, user: User) {
  const existing = await db.from("dojo_customers").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (existing.error) throw databaseError(existing.error.message);
  if (existing.data) return existing.data.stripe_customer_id as string;
  const created = await stripe.customers.create({ email: user.email, metadata: { bushido_user_id: user.id } }, { idempotencyKey: `bushido-customer-${user.id}` });
  if (created.livemode) throw new ApiError(503, "TEST_ONLY", "Only sandbox subscriptions are supported in this release.");
  const saved = await db.from("dojo_customers").upsert({ user_id: user.id, stripe_customer_id: created.id }, { onConflict: "user_id", ignoreDuplicates: true });
  if (saved.error) throw databaseError(saved.error.message);
  const row = await db.from("dojo_customers").select("stripe_customer_id").eq("user_id", user.id).single();
  if (row.error) throw databaseError(row.error.message);
  return row.data.stripe_customer_id as string;
}

/** Refetch Stripe's current state instead of trusting webhook arrival order or a Checkout redirect. */
async function synchronizeSubscription(db: SupabaseClient, stripe: Stripe, userId: string, customerId: string, priceId: string, eventId?: string) {
  const observedAt = new Date().toISOString();
  const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 }).autoPagingToArray({ limit: 1000 });
  const relevant = subscriptions.filter(subscription => !subscription.livemode && subscription.items.data.some(item => item.price.id === priceId));
  const ranked = relevant.sort((a, b) => Number(["active", "trialing"].includes(b.status)) - Number(["active", "trialing"].includes(a.status)) || b.created - a.created);
  const current = ranked[0];
  const periodEnd = current?.items.data.filter(item => item.price.id === priceId).reduce((end, item) => Math.min(end, item.current_period_end), Infinity);
  await rpc(db, "dojo_sync_subscription", { p_user: userId, p_subscription_id: current?.id ?? "none", p_status: current?.status ?? "none", p_period_end: periodEnd && Number.isFinite(periodEnd) ? new Date(periodEnd * 1000).toISOString() : null, p_cancel_at_period_end: current?.cancel_at_period_end ?? false, p_observed_at: observedAt, p_event_id: eventId ?? null });
  return current;
}

async function webhook(request: Request, env: Environment, db: SupabaseClient, stripe: Stripe) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) throw new ApiError(400, "INVALID_SIGNATURE", "Missing webhook signature.");
  let event: Stripe.Event;
  try { event = await stripe.webhooks.constructEventAsync(await readRaw(request), signature, env.STRIPE_WEBHOOK_SECRET!, 300, Stripe.createSubtleCryptoProvider()); }
  catch (error) { if (error instanceof ApiError) throw error; throw new ApiError(400, "INVALID_SIGNATURE", "Invalid webhook signature."); }
  if (event.livemode) throw new ApiError(400, "TEST_ONLY", "Live events are disabled in this release.");
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted", "invoice.paid", "invoice.payment_failed"].includes(event.type)) return { received: true, ignored: true };
  const object = event.data.object as unknown as { customer?: string | { id: string } };
  const customerId = typeof object.customer === "string" ? object.customer : object.customer?.id;
  if (!customerId) return { received: true, ignored: true };
  const { data, error } = await db.from("dojo_customers").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
  if (error) throw databaseError(error.message);
  if (!data) return { received: true, ignored: true };
  await synchronizeSubscription(db, stripe, data.user_id, customerId, env.STRIPE_PRICE_ID!, event.id);
  return { received: true };
}

export async function handleApi(request: Request, env: Environment, dependencies: Dependencies = {}): Promise<Response> {
  const requestId = crypto.randomUUID();
  const respond = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "X-Request-Id": requestId } });
  try {
    const path = new URL(request.url).pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
    const method = request.method;
    if (path === "config" && method === "GET") {
      const enabled = configured(env);
      const config: PublicConfig = { version: "0.5.0", configured: enabled, billingEnabled: billingConfigured(env), environment: "staging", ...(enabled ? { supabaseUrl: env.SUPABASE_URL, publishableKey: env.SUPABASE_PUBLISHABLE_KEY, appUrl: applicationUrl(env) } : {}), ...(env.SUPPORT_EMAIL && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.SUPPORT_EMAIL) ? { supportEmail: env.SUPPORT_EMAIL } : {}) };
      return respond(config);
    }
    if (path === "health" && method === "GET") return respond({ version: "0.5.0", configured: configured(env), billing: billingConfigured(env), environment: "staging" });
    if (!configured(env)) throw new ApiError(503, "NOT_CONFIGURED", "Accounts and cloud progress are being connected. The guest preview is available.");
    const isWebhook = path === "stripe/webhook" && method === "POST";
    if (!isWebhook && !["GET", "HEAD"].includes(method)) {
      if (request.headers.get("origin") !== applicationUrl(env)) throw new ApiError(403, "ORIGIN_REJECTED", "This request must come from your dojo.");
    }
    const db = (dependencies.database ?? defaultDatabase)(env);
    if (isWebhook) return respond(await webhook(request, env, db, (dependencies.stripe ?? defaultStripe)(env)));
    const user = await verifiedUser(request, db, path === "catalog");
    if (path === "catalog" && method === "GET") {
      const current = await catalog(db);
      const state = user ? await rpc<CloudSnapshot>(db, "dojo_snapshot", { p_user: user.id }) : null;
      return respond({ revision: current.revision, courses: current.document.courses.map(course => listing(course, state, current.document)) });
    }
    if (!user) throw new ApiError(401, "SIGN_IN_REQUIRED", "Sign in to continue.");
    if (path === "me" && method === "GET") {
      let owner = false; try { requireOwner(user, env); owner = true; } catch { /* Normal student. */ }
      return respond({ snapshot: await rpc(db, "dojo_snapshot", { p_user: user.id }), owner });
    }
    if (path.startsWith("courses/") && method === "GET") {
      const courseId = path.slice(8);
      const current = await catalog(db), course = current.document.courses.find(item => item.id === courseId);
      if (!course) throw new ApiError(404, "COURSE_NOT_FOUND", "This course is not part of the current path.");
      const reason = await rpc<string>(db, "dojo_access_reason", { p_user: user.id, p_course: course });
      if (reason !== "OPEN") throw databaseError(reason);
      return respond({ revision: current.revision, course: studentCourse(course) });
    }
    if (path === "progress/event" && method === "POST") {
      const input = await body(request, learningBody);
      return respond(await rpc(db, "dojo_apply_event", { p_user: user.id, p_course_id: input.courseId, p_module_id: input.moduleId, p_action: input.action, p_answers: input.answers ?? {}, p_expected_revision: input.expectedRevision, p_request_id: input.requestId }));
    }
    if (path === "progress/import-guest" && method === "POST") {
      const input = await body(request, guestBody);
      return respond(await rpc(db, "dojo_import_guest", { p_user: user.id, p_course_id: input.courseId, p_module_id: input.moduleId, p_answers: input.answers, p_request_id: input.requestId }));
    }
    if (path === "profile" && method === "PATCH") {
      const input = await body(request, profileBody);
      return respond({ snapshot: await rpc(db, "dojo_update_profile", { p_user: user.id, p_name: input.displayName, p_habits: [...new Set(input.habits)], p_expected_revision: input.expectedRevision }) });
    }
    if (path === "account/export" && method === "GET") return respond({ app: "bushido-ops", version: "0.5.0", exportedAt: new Date().toISOString(), account: { id: user.id, email: user.email }, snapshot: await rpc(db, "dojo_snapshot", { p_user: user.id }) });
    if (path.startsWith("owner/")) {
      requireOwner(user, env);
      if (path === "owner/catalog" && method === "GET") return respond(await catalog(db));
      if (["owner/catalog/validate", "owner/catalog/publish"].includes(path) && method === "POST") {
        const input = await body(request, z.object({ document: z.unknown(), expectedRevision: z.number().int().min(0) }).strict());
        let document: CatalogDocument;
        try { document = validateCloudCatalog(input.document); } catch (error) { throw new ApiError(400, "INVALID_CATALOG", (error as Error).message); }
        if (path.endsWith("validate")) return respond({ valid: true, courses: document.courses.length, available: document.courses.filter(c => c.availability === "available").length, assessments: document.courses.reduce((sum, c) => sum + c.modules.filter(m => m.kind !== "lesson").length, 0), testContent: document.courses.some(c => c.testContent), expectedRevision: input.expectedRevision });
        return respond({ revision: await rpc(db, "dojo_publish_catalog", { p_actor: user.id, p_document: document, p_expected_revision: input.expectedRevision }) });
      }
      if (path === "owner/audit" && method === "GET") {
        const { data, error } = await db.from("dojo_audit").select("action,detail,created_at").order("created_at", { ascending: false }).limit(50);
        if (error) throw databaseError(error.message); return respond({ entries: data });
      }
    }
    if (path === "billing/offer" && method === "GET") {
      const stripe = (dependencies.stripe ?? defaultStripe)(env);
      const price = await stripe.prices.retrieve(env.STRIPE_PRICE_ID!);
      if (price.livemode || !price.active || !price.recurring || price.unit_amount === null) throw new ApiError(503, "INVALID_TEST_PRICE", "Configure one active recurring sandbox price.");
      return respond({ testOnly: true, currency: price.currency, unitAmount: price.unit_amount, interval: price.recurring.interval, intervalCount: price.recurring.interval_count });
    }
    if (["billing/checkout", "billing/portal", "billing/refresh"].includes(path) && method === "POST") {
      await body(request, z.object({}).strict());
      const stripe = (dependencies.stripe ?? defaultStripe)(env), customerId = await customer(db, stripe, user);
      const current = await synchronizeSubscription(db, stripe, user.id, customerId, env.STRIPE_PRICE_ID!);
      if (path === "billing/refresh") return respond({ snapshot: await rpc(db, "dojo_snapshot", { p_user: user.id }) });
      if (path === "billing/portal") {
        const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${applicationUrl(env)}/#account` });
        return respond({ url: session.url });
      }
      const state = await rpc<CloudSnapshot>(db, "dojo_snapshot", { p_user: user.id });
      if (!state.awards.some(award => award.belt === "white")) throw databaseError("WHITE_REQUIRED");
      const { document } = await catalog(db);
      if (!document.courses.some(course => course.belt !== "white" && course.availability === "available")) throw new ApiError(409, "PREMIUM_NOT_READY", "Premium training is still in development. No subscription is needed yet.");
      if (current && !["canceled", "incomplete_expired"].includes(current.status)) throw new ApiError(409, "SUBSCRIPTION_EXISTS", "Manage your existing test subscription in the billing portal.");
      const price = await stripe.prices.retrieve(env.STRIPE_PRICE_ID!);
      if (price.livemode || !price.active || !price.recurring) throw new ApiError(503, "INVALID_TEST_PRICE", "Configure an active recurring sandbox price.");
      const prepared = await rpc<{ request_id: string; parameters: Stripe.Checkout.SessionCreateParams }>(db, "dojo_prepare_checkout", { p_user: user.id, p_parameters: { mode: "subscription", customer: customerId, line_items: [{ price: env.STRIPE_PRICE_ID!, quantity: 1 }], client_reference_id: user.id, subscription_data: { metadata: { bushido_user_id: user.id } }, success_url: `${applicationUrl(env)}/?billing=success#account`, cancel_url: `${applicationUrl(env)}/?billing=cancel#account` } });
      const session = await stripe.checkout.sessions.create(prepared.parameters, { idempotencyKey: `bushido-checkout-${prepared.request_id}` });
      if (!session.url) throw new ApiError(503, "CHECKOUT_UNAVAILABLE", "Test checkout is temporarily unavailable.");
      return respond({ url: session.url, testOnly: true });
    }
    if (path === "account" && method === "DELETE") {
      const input = await body(request, z.object({ confirmation: z.literal("DELETE") }).strict());
      if (!input || !user.last_sign_in_at || Date.now() - Date.parse(user.last_sign_in_at) > 5 * 60 * 1000) throw new ApiError(401, "REAUTHENTICATE", "Confirm your password again before deleting your account.");
      const { data: mapping, error } = await db.from("dojo_customers").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
      if (error) throw databaseError(error.message);
      if (mapping) {
        const stripe = (dependencies.stripe ?? defaultStripe)(env);
        const subscriptions = await stripe.subscriptions.list({ customer: mapping.stripe_customer_id, status: "all", limit: 100 }).autoPagingToArray({ limit: 1000 });
        for (const subscription of subscriptions) if (!["canceled", "incomplete_expired"].includes(subscription.status)) {
          if (subscription.livemode) throw new ApiError(503, "TEST_ONLY", "Live billing cannot be changed in this release.");
          await stripe.subscriptions.cancel(subscription.id, {}, { idempotencyKey: `bushido-delete-${user.id}-${subscription.id}` });
        }
        const sessions = await stripe.checkout.sessions.list({ customer: mapping.stripe_customer_id, status: "open", limit: 100 });
        for (const session of sessions.data) await stripe.checkout.sessions.expire(session.id);
        await stripe.customers.del(mapping.stripe_customer_id);
      }
      const deleted = await db.auth.admin.deleteUser(user.id);
      if (deleted.error) throw new ApiError(503, "DELETE_FAILED", "Account deletion could not finish. Your test subscription has been stopped; try again.");
      return respond({ deleted: true });
    }
    throw new ApiError(404, "NOT_FOUND", "This dojo endpoint could not be found.");
  } catch (error) {
    const failure = error instanceof ApiError ? error : new ApiError(503, "SERVICE_UNAVAILABLE", "The dojo service is temporarily unavailable. Please try again.");
    // No credentials, request bodies or email addresses are logged.
    if (!(error instanceof ApiError)) console.error("Bushido API failure", requestId);
    return respond({ error: { code: failure.code, message: failure.message, requestId } }, failure.status);
  }
}
