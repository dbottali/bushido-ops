import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { validateCloudCatalog, studentCourse } from "../lib/cloud-catalog";
import type { CatalogDocument, CloudSnapshot, PrivateCourse } from "../lib/cloud-types";

const db = new PGlite();
const alice = "00000000-0000-4000-8000-000000000001", bob = "00000000-0000-4000-8000-000000000002";
const belts = ["white", "yellow", "orange", "green", "blue", "purple", "brown", "black"] as const;
const fixture: CatalogDocument = { schemaVersion: 2, courses: belts.map((belt, index): PrivateCourse => ({
  id: `${belt}-test`, belt, title: `${belt} TEST CONTENT`, summary: "Synthetic infrastructure fixture", availability: "available", prerequisites: index ? [`${belts[index - 1]}-test`] : [], awardsBelt: true, testContent: true,
  modules: [
    { id: "warmup", kind: "warmup", title: "Warm-up", intro: "Test preview", reward: 20, passingScore: 1, questions: [{ id: "check", prompt: "Select the test answer", options: ["Test A", "Test B"], correct: 1, explanation: "Synthetic explanation" }] },
    { id: "lesson", kind: "lesson", title: "Lesson", intro: "Test lesson", reward: 30, sections: [{ title: "Test section", body: "Synthetic content" }] },
    { id: "exam", kind: "exam", title: "Final exam", intro: "Test exam", reward: 50, passingScore: 1, questions: [{ id: "final", prompt: "Select the final test answer", options: ["Test A", "Test B"], correct: 0, explanation: "Synthetic final explanation" }] },
  ],
})) };
async function call<T = Record<string, unknown>>(name: string, parameters: unknown[]) {
  const result = await db.query<{ result: T }>(`select public.${name}(${parameters.map((_, index) => `$${index + 1}`).join(",")}) as result`, parameters);
  return result.rows[0].result;
}
const snapshot = (user = alice) => call<CloudSnapshot>("dojo_snapshot", [user]);
const event = (module: string, action: string, answer: Record<string, string>, revision: number, course = "white-test", user = alice, requestId = crypto.randomUUID()) => call<{ snapshot: CloudSnapshot; replayed: boolean }>("dojo_apply_event", [user, course, module, action, JSON.stringify(answer), revision, requestId]);
before(async () => {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema public,auth to anon,authenticated,service_role;
    grant execute on function auth.uid() to anon,authenticated,service_role;`);
  await db.exec(await readFile("supabase/migrations/202610070001_bushido_ops.sql", "utf8"));
  await db.query("insert into auth.users values($1),($2)", [alice, bob]);
  await call("dojo_publish_catalog", [alice, JSON.stringify(validateCloudCatalog(fixture)), 0]);
  await snapshot(); await snapshot(bob);
});
after(async () => { await db.close(); });

test("catalog validation rejects cycles, duplicate IDs, invalid choices and unearned belt shortcuts", () => {
  assert.equal(validateCloudCatalog(fixture).courses.length, 8);
  const invalid = structuredClone(fixture); invalid.courses[0].modules[0].questions![0].correct = 2;
  assert.throws(() => validateCloudCatalog(invalid), /outside/);
  invalid.courses[0] = structuredClone(fixture.courses[0]); invalid.courses[1].prerequisites = [];
  assert.throws(() => validateCloudCatalog(invalid), /previous belt/);
  invalid.courses[1] = structuredClone(fixture.courses[1]); invalid.courses[1].modules[1].id = "warmup";
  assert.throws(() => validateCloudCatalog(invalid), /duplicate module/);
});
test("student content has no answer keys or explanations", () => {
  const safe = JSON.stringify(studentCourse(fixture.courses[0]));
  assert(!safe.includes('"correct"')); assert(!safe.includes('"explanation"')); assert(safe.includes('"options"'));
});
test("database rejects skipped steps and premium access before White", async () => {
  await assert.rejects(event("lesson", "lesson", {}, 0), /PREVIOUS_STEP_REQUIRED/);
  await assert.rejects(event("warmup", "submit", { check: "1" }, 0, "yellow-test"), /WHITE_REQUIRED/);
  await assert.rejects(event("warmup", "submit", { check: "8" }, 0), /INVALID_ANSWERS/);
  assert.equal((await snapshot()).xp, 0);
});
test("draft revisions prevent stale devices from overwriting answers", async () => {
  const saved = await event("warmup", "draft", { check: "0" }, 0);
  assert.equal(saved.snapshot.modules[0].revision, 1);
  await assert.rejects(event("warmup", "draft", { check: "1" }, 0), /REVISION_CONFLICT/);
  assert.equal((await snapshot()).modules[0].answers.check, "0");
});
test("grading happens in Postgres; forged completion fields cannot grant XP", async () => {
  const failed = await event("warmup", "submit", { check: "0" }, 1);
  assert.equal(failed.snapshot.xp, 0); assert.equal(failed.snapshot.modules[0].feedback?.passed, false);
  await assert.rejects(event("warmup", "submit", { check: "1" }, 2), /RETRY_REQUIRED/);
  await event("warmup", "retry", {}, 2);
  const passed = await event("warmup", "submit", { check: "1" }, 3);
  assert.equal(passed.snapshot.xp, 20); assert.equal(passed.snapshot.modules[0].feedback?.score, 1);
});
test("lost responses are idempotent and retries cannot duplicate XP", async () => {
  const requestId = crypto.randomUUID();
  const first = await event("lesson", "lesson", {}, 0, "white-test", alice, requestId);
  const repeated = await event("lesson", "lesson", {}, 0, "white-test", alice, requestId);
  assert.equal(first.snapshot.xp, 50); assert.equal(repeated.snapshot.xp, 50); assert.equal(repeated.replayed, true);
  await assert.rejects(event("exam", "submit", { final: "0" }, 0, "white-test", alice, requestId), /INVALID_ANSWERS/);
  const completed = await event("exam", "submit", { final: "0" }, 0);
  assert.equal(completed.snapshot.xp, 100); assert.equal(completed.snapshot.awards[0].belt, "white");
  await event("exam", "retry", {}, 1); await event("exam", "submit", { final: "0" }, 2);
  assert.equal((await snapshot()).xp, 100); assert.equal((await snapshot()).awards.length, 1);
});
test("White stays free; premium needs an active unexpired subscription and prerequisites", async () => {
  await assert.rejects(event("warmup", "submit", { check: "1" }, 0, "yellow-test"), /SUBSCRIPTION_REQUIRED/);
  await call("dojo_sync_subscription", [alice, "sub_test", "active", new Date(Date.now() + 86400000).toISOString(), false, new Date().toISOString(), "evt_first"]);
  await assert.rejects(event("warmup", "submit", { check: "1" }, 0, "orange-test"), /PREREQUISITE_REQUIRED/);
  await event("warmup", "submit", { check: "1" }, 0, "yellow-test");
  await event("lesson", "lesson", {}, 0, "yellow-test"); await event("exam", "submit", { final: "0" }, 0, "yellow-test");
  assert.equal((await snapshot()).xp, 200); assert.equal((await snapshot()).awards.length, 2);
});
test("cancellation preserves progress; expiry and unpaid renewal revoke premium", async () => {
  const time = new Date().toISOString();
  await call("dojo_sync_subscription", [alice, "sub_test", "active", new Date(Date.now()+86400000).toISOString(), true, time, "evt_cancel_scheduled"]);
  assert.equal((await snapshot()).subscription?.premium, true);
  await call("dojo_sync_subscription", [alice, "sub_test", "active", new Date(Date.now()-1000).toISOString(), true, new Date().toISOString(), "evt_expired"]);
  await assert.rejects(event("warmup", "submit", { check: "1" }, 0, "orange-test"), /SUBSCRIPTION_REQUIRED/);
  await call("dojo_sync_subscription", [alice, "sub_test", "past_due", new Date(Date.now()+86400000).toISOString(), false, new Date().toISOString(), "evt_unpaid"]);
  assert.equal((await snapshot()).subscription?.premium, false); assert.equal((await snapshot()).awards.length, 2);
  await event("exam", "retry", {}, 3); await event("exam", "submit", { final: "0" }, 4);
  assert.equal((await snapshot()).xp, 200);
});
test("duplicate and delayed webhook observations cannot restore old access", async () => {
  assert.equal(await call("dojo_sync_subscription", [alice,"sub_test","active",new Date(Date.now()+86400000).toISOString(),false,"2020-01-01T00:00:00Z","evt_old"]), true);
  assert.equal((await snapshot()).subscription?.status, "past_due");
  assert.equal(await call("dojo_sync_subscription", [alice,"sub_test","active",new Date(Date.now()+86400000).toISOString(),false,new Date().toISOString(),"evt_unpaid"]), false);
  assert.equal((await snapshot()).subscription?.status, "past_due");
});
test("guest import regrades answers, never trusts local XP, and imports only once", async () => {
  const imported = await call<{snapshot: CloudSnapshot}>("dojo_import_guest", [bob,"white-test","warmup",JSON.stringify({check:"1"}),crypto.randomUUID()]);
  assert.equal(imported.snapshot.xp, 20); assert(imported.snapshot.profile.guest_imported);
  const repeated = await call<{snapshot: CloudSnapshot}>("dojo_import_guest", [bob,"white-test","warmup",JSON.stringify({check:"1"}),crypto.randomUUID()]);
  assert.equal(repeated.snapshot.xp, 20);
  assert.equal((await snapshot()).xp, 200);
});
test("a published course with progress cannot be silently rewritten", async () => {
  const changed = structuredClone(fixture); changed.courses[0].modules[0].reward = 999;
  await assert.rejects(call("dojo_publish_catalog", [alice,JSON.stringify(changed),1]), /CONTENT_IN_USE/);
  await assert.rejects(call("dojo_publish_catalog", [alice,JSON.stringify(fixture),0]), /CATALOG_CONFLICT/);
});
test("students cannot edit content, their own rewards, another account or execute server RPCs", async () => {
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [bob]);
  await db.exec("set role authenticated");
  try {
    const rows = await db.query<{user_id:string}>("select user_id from public.dojo_profiles");
    assert.deepEqual(rows.rows.map(row => row.user_id), [bob]);
    await assert.rejects(db.query("update public.dojo_profiles set display_name='injected'"), /permission denied/);
    await assert.rejects(db.query("select document from public.dojo_catalog"), /permission denied/);
    await assert.rejects(db.query("insert into public.dojo_belt_awards values($1,'black','black-test',now())",[bob]), /permission denied/);
    await assert.rejects(call("dojo_snapshot", [alice]), /permission denied/);
  } finally { await db.exec("reset role"); }
  await db.exec("set role anon");
  try { await assert.rejects(db.query("select * from public.dojo_profiles"), /permission denied/); }
  finally { await db.exec("reset role"); }
});
test("checkout creation reuses one idempotency key across repeated clicks", async () => {
  const first = await call<{request_id:string,parameters:Record<string,unknown>}>("dojo_prepare_checkout",[alice,JSON.stringify({customer:"cus_test",mode:"subscription"})]);
  const next = await call<{request_id:string,parameters:Record<string,unknown>}>("dojo_prepare_checkout",[alice,JSON.stringify({customer:"cus_test",mode:"subscription"})]);
  assert.equal(first.request_id,next.request_id); assert.deepEqual(first.parameters,next.parameters);
});
test("deleting an account cascades its progress while preserving other learners", async () => {
  await db.query("delete from auth.users where id=$1", [bob]);
  const rows = await db.query("select * from public.dojo_module_progress where user_id=$1", [bob]);
  assert.equal(rows.rows.length,0); assert.equal((await snapshot()).xp,200);
});
