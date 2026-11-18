-- Two-user row-security test for Steadfast Health, run on a throwaway Postgres only.
\set ON_ERROR_STOP on
insert into auth.users values ('aaaaaaaa-0000-0000-0000-000000000001', 'a@example.com'), ('bbbbbbbb-0000-0000-0000-000000000002', 'b@example.com');

create or replace function pg_temp.check(cond boolean, msg text) returns void language plpgsql as $$
begin if not cond then raise exception 'FAIL: %', msg; end if; raise notice 'ok   %', msg; end $$;

-- A writes rows the way the app does (signed in, user_id filled by default)
set role authenticated;
select set_config('request.jwt.claim.sub', 'aaaaaaaa-0000-0000-0000-000000000001', false);
insert into public.settings (key, value) values ('name', 'A'), ('setup_done', '1');
insert into public.weight_log (date, weight) values ('2026-11-17', 250);
insert into public.bp_log (taken_at, systolic, diastolic) values ('2026-11-17T07:00', 128, 82);
insert into public.foods_custom (food_id, data) values ('eggs', '{}');
insert into public.meal_prefs (meal_id) values ('m1');
insert into public.plans (week_start) values ('2026-11-16');
insert into public.gym_workouts (workout, exercise) values ('A', 'squat');
insert into public.blog_posts (date) values ('2026-11-17');
insert into public.checkins (date, energy) values ('2026-11-17', 7);
select pg_temp.check((select count(*) from public.weight_log) = 1, 'A sees his own weigh-in');

-- B: sees nothing of A's in any of the 15 personal tables, cannot change or delete it, cannot write as A
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-0000-0000-000000000002', false);
do $$
declare t text; n bigint;
begin
  foreach t in array array['settings','weight_log','bp_log','foods_custom','meal_prefs','plans','gym_sets','gym_workouts','blog_posts','checkins','ai_messages','ai_cards','meals_custom','pantry','activities'] loop
    execute format('select count(*) from public.%I', t) into n;
    if n <> 0 then raise exception 'FAIL: B can read % row(s) of A in %', n, t; end if;
    execute format('with u as (update public.%I set user_id = user_id returning 1) select count(*) from u', t) into n;
    if n <> 0 then raise exception 'FAIL: B changed A''s rows in %', t; end if;
    execute format('with d as (delete from public.%I returning 1) select count(*) from d', t) into n;
    if n <> 0 then raise exception 'FAIL: B deleted A''s rows in %', t; end if;
    raise notice 'ok   B cannot read, change or delete A''s rows in %', t;
  end loop;
end $$;
do $$ begin
  begin
    insert into public.weight_log (user_id, date, weight) values ('aaaaaaaa-0000-0000-0000-000000000001', '2026-11-18', 200);
    raise exception 'FAIL: B wrote a weigh-in as A';
  exception when insufficient_privilege then raise notice 'ok   B cannot write a row under A''s id';
  end;
end $$;
insert into public.weight_log (date, weight) values ('2026-11-17', 300);
select pg_temp.check((select count(*) from public.weight_log) = 1, 'B sees only his own weigh-in');

-- the AI tables are for the server only
do $$
declare t text;
begin
  foreach t in array array['ai_config','app_owners','ai_usage','user_ai_keys'] loop
    begin
      execute format('select count(*) from public.%I', t);
      raise exception 'FAIL: a signed-in person read %', t;
    exception when insufficient_privilege then raise notice 'ok   a signed-in person cannot read %', t;
    end;
  end loop;
end $$;

-- not signed in: nothing at all
reset role;
set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$
declare t text;
begin
  foreach t in array array['settings','weight_log','bp_log','foods_custom','meal_prefs','plans','gym_sets','gym_workouts','blog_posts','checkins','ai_messages','ai_cards','meals_custom','pantry','activities','ai_config','app_owners','ai_usage','user_ai_keys'] loop
    begin
      execute format('select count(*) from public.%I', t);
      raise exception 'FAIL: a visitor read %', t;
    exception when insufficient_privilege then null;
    end;
  end loop;
  raise notice 'ok   a visitor cannot read any of the 19 tables';
  begin
    perform public.delete_me();
    raise exception 'FAIL: a visitor ran delete_me';
  exception when insufficient_privilege then raise notice 'ok   a visitor cannot run delete_me';
  end;
end $$;

-- B deletes his account: his rows go, A's stay
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', 'bbbbbbbb-0000-0000-0000-000000000002', false);
select public.delete_me();
reset role;
select pg_temp.check((select count(*) from auth.users where id = 'bbbbbbbb-0000-0000-0000-000000000002') = 0, 'delete_me removed B');
select pg_temp.check((select count(*) from public.weight_log where user_id = 'bbbbbbbb-0000-0000-0000-000000000002') = 0, 'B''s rows went with him');
select pg_temp.check((select count(*) from public.weight_log where user_id = 'aaaaaaaa-0000-0000-0000-000000000001') = 1, 'A''s weigh-in is untouched');
select pg_temp.check((select count(*) from public.settings where user_id = 'aaaaaaaa-0000-0000-0000-000000000001') = 2, 'A''s settings are untouched');
\echo ALL STEADFAST ROW RULE CHECKS PASS
