-- Bushido Ops 0.5. Run once in a NEW staging Supabase project.
-- Student roles can read only their rows. Only the server's service_role can execute mutations.
begin;

create table public.dojo_catalog (
  singleton boolean primary key default true check (singleton), revision integer not null default 0,
  document jsonb not null default '{"schemaVersion":2,"courses":[]}', updated_at timestamptz not null default now()
);
insert into public.dojo_catalog(singleton) values (true);
create table public.dojo_catalog_versions (
  revision integer primary key, document jsonb not null, published_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table public.dojo_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (length(display_name) <= 60), habits text[] not null default '{}',
  revision integer not null default 0, guest_imported boolean not null default false, created_at timestamptz not null default now()
);
create table public.dojo_module_progress (
  user_id uuid not null references auth.users(id) on delete cascade, course_id text not null, module_id text not null,
  answers jsonb not null default '{}', completed boolean not null default false, submitted boolean not null default false,
  revision integer not null default 0, feedback jsonb, updated_at timestamptz not null default now(),
  primary key(user_id, course_id, module_id)
);
create table public.dojo_attempts (
  user_id uuid not null references auth.users(id) on delete cascade, request_id uuid not null,
  course_id text not null, module_id text not null, action text not null, result jsonb not null,
  created_at timestamptz not null default now(), primary key(user_id, request_id)
);
create table public.dojo_xp_ledger (
  user_id uuid not null references auth.users(id) on delete cascade, course_id text not null, module_id text not null,
  reward integer not null check (reward between 0 and 1000), earned_at timestamptz not null default now(),
  primary key(user_id, course_id, module_id)
);
create table public.dojo_belt_awards (
  user_id uuid not null references auth.users(id) on delete cascade, belt text not null,
  course_id text not null, awarded_at timestamptz not null default now(), primary key(user_id, belt),
  check (belt in ('white','yellow','orange','green','blue','purple','brown','black'))
);
create table public.dojo_customers (
  user_id uuid primary key references auth.users(id) on delete cascade, stripe_customer_id text not null unique
);
create table public.dojo_checkouts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  request_id uuid not null default gen_random_uuid(), parameters jsonb not null, expires_at timestamptz not null
);
create table public.dojo_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade, stripe_subscription_id text not null,
  status text not null, current_period_end timestamptz, cancel_at_period_end boolean not null default false,
  observed_at timestamptz not null, updated_at timestamptz not null default now()
);
create table public.dojo_webhook_events (event_id text primary key, received_at timestamptz not null default now());
create table public.dojo_audit (
  id bigint generated always as identity primary key, actor uuid references auth.users(id) on delete set null,
  action text not null, detail jsonb not null default '{}', created_at timestamptz not null default now()
);

alter table public.dojo_catalog enable row level security;
alter table public.dojo_catalog_versions enable row level security;
alter table public.dojo_profiles enable row level security;
alter table public.dojo_module_progress enable row level security;
alter table public.dojo_attempts enable row level security;
alter table public.dojo_xp_ledger enable row level security;
alter table public.dojo_belt_awards enable row level security;
alter table public.dojo_customers enable row level security;
alter table public.dojo_checkouts enable row level security;
alter table public.dojo_subscriptions enable row level security;
alter table public.dojo_webhook_events enable row level security;
alter table public.dojo_audit enable row level security;

create policy own_profile on public.dojo_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy own_progress on public.dojo_module_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy own_attempts on public.dojo_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy own_xp on public.dojo_xp_ledger for select to authenticated using ((select auth.uid()) = user_id);
create policy own_awards on public.dojo_belt_awards for select to authenticated using ((select auth.uid()) = user_id);
create policy own_subscription on public.dojo_subscriptions for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.dojo_catalog, public.dojo_catalog_versions, public.dojo_profiles, public.dojo_module_progress,
  public.dojo_attempts, public.dojo_xp_ledger, public.dojo_belt_awards, public.dojo_customers,
  public.dojo_checkouts, public.dojo_subscriptions, public.dojo_webhook_events, public.dojo_audit from anon, authenticated;
grant select on public.dojo_profiles, public.dojo_module_progress, public.dojo_attempts,
  public.dojo_xp_ledger, public.dojo_belt_awards to authenticated;
grant select(user_id, status, current_period_end, cancel_at_period_end) on public.dojo_subscriptions to authenticated;
grant all on public.dojo_catalog, public.dojo_catalog_versions, public.dojo_profiles, public.dojo_module_progress,
  public.dojo_attempts, public.dojo_xp_ledger, public.dojo_belt_awards, public.dojo_customers,
  public.dojo_checkouts, public.dojo_subscriptions, public.dojo_webhook_events, public.dojo_audit to service_role;
grant usage, select on sequence public.dojo_audit_id_seq to service_role;

create function public.dojo_has_premium(p_user uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from dojo_subscriptions where user_id = p_user and status in ('active','trialing') and current_period_end > now());
$$;

create function public.dojo_course_complete(p_user uuid, p_course jsonb) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select p_course->>'availability' = 'available' and jsonb_array_length(p_course->'modules') > 0
    and not exists(select 1 from jsonb_array_elements(p_course->'modules') m where not exists(
      select 1 from dojo_module_progress p where p.user_id = p_user and p.course_id = p_course->>'id' and p.module_id = m->>'id' and p.completed));
$$;

create function public.dojo_access_reason(p_user uuid, p_course jsonb) returns text
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare prerequisite text; other jsonb;
begin
  if p_course is null or p_course->>'availability' <> 'available' then return 'COURSE_UNAVAILABLE'; end if;
  if p_user is null then return 'ACCOUNT_REQUIRED'; end if;
  if p_course->>'belt' <> 'white' then
    if not exists(select 1 from dojo_belt_awards where user_id = p_user and belt = 'white') then return 'WHITE_REQUIRED'; end if;
    if not dojo_has_premium(p_user) then return 'SUBSCRIPTION_REQUIRED'; end if;
  end if;
  for prerequisite in select jsonb_array_elements_text(p_course->'prerequisites') loop
    select c into other from dojo_catalog, jsonb_array_elements(document->'courses') c where c->>'id' = prerequisite;
    if other is null or not dojo_course_complete(p_user, other) then return 'PREREQUISITE_REQUIRED'; end if;
  end loop;
  return 'OPEN';
end;
$$;

create function public.dojo_snapshot(p_user uuid) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare result jsonb;
begin
  insert into dojo_profiles(user_id) values(p_user) on conflict do nothing;
  select jsonb_build_object(
    'revision', p.revision,
    'profile', jsonb_build_object('display_name',p.display_name,'habits',p.habits,'revision',p.revision,'guest_imported',p.guest_imported),
    'modules',coalesce((select jsonb_agg(to_jsonb(m) - 'user_id' order by m.course_id,m.module_id) from dojo_module_progress m where m.user_id = p_user),'[]'),
    'xp',coalesce((select sum(reward) from dojo_xp_ledger where user_id = p_user),0),
    'awards',coalesce((select jsonb_agg(to_jsonb(a) - 'user_id' order by a.awarded_at) from dojo_belt_awards a where a.user_id = p_user),'[]'),
    'subscription',(select jsonb_build_object('status',s.status,'current_period_end',s.current_period_end,'cancel_at_period_end',s.cancel_at_period_end,'premium',dojo_has_premium(p_user)) from dojo_subscriptions s where s.user_id = p_user)
  ) into result from dojo_profiles p where p.user_id = p_user;
  return result;
end;
$$;

create function public.dojo_apply_event(p_user uuid, p_course_id text, p_module_id text, p_action text,
  p_answers jsonb, p_expected_revision integer, p_request_id uuid) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare course jsonb; step jsonb; earlier jsonb; reason text; previous dojo_module_progress;
  q jsonb; choice text; score integer := 0; total integer := 0; passed boolean := false;
  graded_feedback jsonb; responses jsonb := '[]'; result jsonb; prior_result jsonb;
begin
  insert into dojo_profiles(user_id) values(p_user) on conflict do nothing;
  perform 1 from dojo_profiles where user_id = p_user for update;
  select a.result into prior_result from dojo_attempts a where a.user_id = p_user and a.request_id = p_request_id;
  if found then
    if prior_result->>'courseId' <> p_course_id or prior_result->>'moduleId' <> p_module_id or prior_result->>'action' <> p_action then raise exception 'INVALID_ANSWERS'; end if;
    return prior_result || jsonb_build_object('snapshot',dojo_snapshot(p_user),'replayed',true);
  end if;
  select c into course from dojo_catalog, jsonb_array_elements(document->'courses') c where c->>'id' = p_course_id;
  reason := dojo_access_reason(p_user, course);
  if reason <> 'OPEN' then raise exception '%', reason; end if;
  select m into step from jsonb_array_elements(course->'modules') m where m->>'id' = p_module_id;
  if step is null then raise exception 'STEP_NOT_FOUND'; end if;
  for earlier in select value from jsonb_array_elements(course->'modules') loop
    exit when earlier->>'id' = p_module_id;
    if not exists(select 1 from dojo_module_progress where user_id=p_user and course_id=p_course_id and module_id=earlier->>'id' and completed) then raise exception 'PREVIOUS_STEP_REQUIRED'; end if;
  end loop;
  insert into dojo_module_progress(user_id,course_id,module_id) values(p_user,p_course_id,p_module_id) on conflict do nothing;
  select * into previous from dojo_module_progress where user_id=p_user and course_id=p_course_id and module_id=p_module_id for update;
  if previous.revision <> p_expected_revision then raise exception 'REVISION_CONFLICT'; end if;
  if p_action not in ('draft','submit','lesson','retry') then raise exception 'INVALID_ANSWERS'; end if;
  if p_action in ('draft','submit') then
    if step->>'kind' = 'lesson' or jsonb_typeof(p_answers) <> 'object' or p_answers is null then raise exception 'INVALID_ANSWERS'; end if;
    if previous.submitted then raise exception 'RETRY_REQUIRED'; end if;
    if exists(select 1 from jsonb_object_keys(p_answers) k where not exists(select 1 from jsonb_array_elements(step->'questions') item where item->>'id'=k)) then raise exception 'INVALID_ANSWERS'; end if;
    for q in select value from jsonb_array_elements(step->'questions') loop
      choice := coalesce(p_answers->> (q->>'id'),'');
      if choice <> '' and (choice !~ '^[0-9]$' or choice::integer >= jsonb_array_length(q->'options')) then raise exception 'INVALID_ANSWERS'; end if;
      if p_answers ? (q->>'id') and jsonb_typeof(p_answers->(q->>'id')) <> 'string' then raise exception 'INVALID_ANSWERS'; end if;
      if p_action='submit' and choice='' then raise exception 'INVALID_ANSWERS'; end if;
      total := total+1;
      if choice<>'' and choice::integer = (q->>'correct')::integer then score := score+1; end if;
      responses := responses || jsonb_build_array(jsonb_build_object('id',q->>'id','correct',choice<>'' and choice::integer=(q->>'correct')::integer,'explanation',q->>'explanation'));
    end loop;
  end if;
  if p_action='lesson' and step->>'kind'<>'lesson' then raise exception 'INVALID_ANSWERS'; end if;
  if p_action='retry' and step->>'kind'='lesson' then raise exception 'INVALID_ANSWERS'; end if;
  passed := p_action='lesson' or (p_action='submit' and score >= (step->>'passingScore')::integer);
  if p_action='submit' then graded_feedback := jsonb_build_object('score',score,'total',total,'passed',passed,'questions',responses); end if;
  update dojo_module_progress set
    answers=case when p_action='retry' then '{}' when p_action in ('draft','submit') then p_answers else answers end,
    completed=completed or passed, submitted=p_action='submit', feedback=graded_feedback,
    revision=revision+1, updated_at=now()
    where user_id=p_user and course_id=p_course_id and module_id=p_module_id;
  if passed then
    insert into dojo_xp_ledger(user_id,course_id,module_id,reward) values(p_user,p_course_id,p_module_id,(step->>'reward')::integer) on conflict do nothing;
    if (course->>'awardsBelt')::boolean and dojo_course_complete(p_user,course) then
      insert into dojo_belt_awards(user_id,belt,course_id) values(p_user,course->>'belt',p_course_id) on conflict do nothing;
    end if;
  end if;
  update dojo_profiles set revision=revision+1 where user_id=p_user;
  result := jsonb_build_object('courseId',p_course_id,'moduleId',p_module_id,'action',p_action,'feedback',graded_feedback,'replayed',false);
  -- Store every request, including drafts, to make lost network responses safe to retry.
  insert into dojo_attempts(user_id,request_id,course_id,module_id,action,result) values(p_user,p_request_id,p_course_id,p_module_id,p_action,result);
  return result || jsonb_build_object('snapshot',dojo_snapshot(p_user));
end;
$$;

create function public.dojo_import_guest(p_user uuid, p_course_id text, p_module_id text, p_answers jsonb, p_request_id uuid) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare result jsonb; course jsonb; step jsonb; current_revision integer;
begin
  insert into dojo_profiles(user_id) values(p_user) on conflict do nothing;
  perform 1 from dojo_profiles where user_id=p_user for update;
  if exists(select 1 from dojo_profiles where user_id=p_user and guest_imported) then return jsonb_build_object('snapshot',dojo_snapshot(p_user),'replayed',true); end if;
  select c into course from dojo_catalog,jsonb_array_elements(document->'courses') c where c->>'id'=p_course_id;
  select value into step from jsonb_array_elements(course->'modules') where value->>'id'=p_module_id;
  if course->>'belt' <> 'white' or step->>'kind' <> 'warmup' or step->>'id' <> course->'modules'->0->>'id' then raise exception 'INVALID_ANSWERS'; end if;
  select coalesce(revision,0) into current_revision from dojo_module_progress where user_id=p_user and course_id=p_course_id and module_id=p_module_id;
  if exists(select 1 from dojo_module_progress where user_id=p_user and course_id=p_course_id and module_id=p_module_id and submitted) then
    result := jsonb_build_object('snapshot',dojo_snapshot(p_user));
  else
    result := dojo_apply_event(p_user,p_course_id,p_module_id,'submit',p_answers,coalesce(current_revision,0),p_request_id);
  end if;
  update dojo_profiles set guest_imported=true,revision=revision+1 where user_id=p_user;
  return result || jsonb_build_object('snapshot',dojo_snapshot(p_user));
end;
$$;

create function public.dojo_update_profile(p_user uuid, p_name text, p_habits text[], p_expected_revision integer) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into dojo_profiles(user_id) values(p_user) on conflict do nothing;
  perform 1 from dojo_profiles where user_id=p_user for update;
  if not exists(select 1 from dojo_profiles where user_id=p_user and revision=p_expected_revision) then raise exception 'REVISION_CONFLICT'; end if;
  if length(p_name)>60 or cardinality(p_habits)>3 or not p_habits <@ array['order','respect','honor']::text[] then raise exception 'INVALID_ANSWERS'; end if;
  update dojo_profiles set display_name=trim(p_name),habits=p_habits,revision=revision+1 where user_id=p_user;
  return dojo_snapshot(p_user);
end;
$$;

create function public.dojo_publish_catalog(p_actor uuid, p_document jsonb, p_expected_revision integer) returns integer
language plpgsql security definer set search_path = public, pg_temp as $$
declare previous jsonb; replacement jsonb; revision_next integer;
begin
  perform 1 from dojo_catalog where singleton for update;
  if not exists(select 1 from dojo_catalog where revision=p_expected_revision) then raise exception 'CATALOG_CONFLICT'; end if;
  if p_document->>'schemaVersion'<>'2' or jsonb_typeof(p_document->'courses')<>'array' then raise exception 'INVALID_ANSWERS'; end if;
  for previous in select c from dojo_catalog,jsonb_array_elements(document->'courses') c loop
    if exists(select 1 from dojo_module_progress where course_id=previous->>'id') then
      select c into replacement from jsonb_array_elements(p_document->'courses') c where c->>'id'=previous->>'id';
      if replacement is distinct from previous then raise exception 'CONTENT_IN_USE'; end if;
    end if;
  end loop;
  update dojo_catalog set document=p_document,revision=revision+1,updated_at=now() where singleton returning revision into revision_next;
  insert into dojo_catalog_versions(revision,document,published_by) values(revision_next,p_document,p_actor);
  insert into dojo_audit(actor,action,detail) values(p_actor,'catalog-published',jsonb_build_object('revision',revision_next));
  return revision_next;
end;
$$;

create function public.dojo_sync_subscription(p_user uuid, p_subscription_id text, p_status text, p_period_end timestamptz,
  p_cancel_at_period_end boolean, p_observed_at timestamptz, p_event_id text default null) returns boolean
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform 1 from dojo_profiles where user_id=p_user for update;
  if p_event_id is not null then
    insert into dojo_webhook_events(event_id) values(p_event_id) on conflict do nothing;
    if not found then return false; end if;
  end if;
  insert into dojo_subscriptions(user_id,stripe_subscription_id,status,current_period_end,cancel_at_period_end,observed_at)
    values(p_user,p_subscription_id,p_status,p_period_end,p_cancel_at_period_end,p_observed_at)
    on conflict(user_id) do update set stripe_subscription_id=excluded.stripe_subscription_id,status=excluded.status,
      current_period_end=excluded.current_period_end,cancel_at_period_end=excluded.cancel_at_period_end,
      observed_at=excluded.observed_at,updated_at=now() where dojo_subscriptions.observed_at <= excluded.observed_at;
  update dojo_profiles set revision=revision+1 where user_id=p_user;
  return true;
end;
$$;

create function public.dojo_prepare_checkout(p_user uuid, p_parameters jsonb) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare row dojo_checkouts; expiry timestamptz := now()+interval '23 hours';
begin
  perform 1 from dojo_profiles where user_id=p_user for update;
  select * into row from dojo_checkouts where user_id=p_user;
  if not found or row.expires_at <= now()+interval '1 minute' then
    insert into dojo_checkouts(user_id,parameters,expires_at)
      values(p_user,p_parameters || jsonb_build_object('expires_at',floor(extract(epoch from expiry))),expiry)
      on conflict(user_id) do update set request_id=gen_random_uuid(),parameters=excluded.parameters,expires_at=excluded.expires_at
      returning * into row;
  end if;
  return jsonb_build_object('request_id',row.request_id,'parameters',row.parameters);
end;
$$;

-- Prevent PUBLIC's default EXECUTE grant from bypassing the API's verified user and owner checks.
revoke all on function public.dojo_has_premium(uuid),public.dojo_course_complete(uuid,jsonb),public.dojo_access_reason(uuid,jsonb),
  public.dojo_snapshot(uuid),public.dojo_apply_event(uuid,text,text,text,jsonb,integer,uuid),
  public.dojo_import_guest(uuid,text,text,jsonb,uuid),public.dojo_update_profile(uuid,text,text[],integer),
  public.dojo_publish_catalog(uuid,jsonb,integer),public.dojo_sync_subscription(uuid,text,text,timestamptz,boolean,timestamptz,text),public.dojo_prepare_checkout(uuid,jsonb)
  from public,anon,authenticated;
grant execute on function public.dojo_has_premium(uuid),public.dojo_course_complete(uuid,jsonb),public.dojo_access_reason(uuid,jsonb),
  public.dojo_snapshot(uuid),public.dojo_apply_event(uuid,text,text,text,jsonb,integer,uuid),
  public.dojo_import_guest(uuid,text,text,jsonb,uuid),public.dojo_update_profile(uuid,text,text[],integer),
  public.dojo_publish_catalog(uuid,jsonb,integer),public.dojo_sync_subscription(uuid,text,text,timestamptz,boolean,timestamptz,text),public.dojo_prepare_checkout(uuid,jsonb)
  to service_role;

commit;
