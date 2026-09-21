create table public.poop_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (deleted_at is null or deleted_at >= created_at)
);

create index poop_logs_active_user_logged_at_idx
on public.poop_logs (user_id, logged_at desc)
where deleted_at is null;

create table public.poop_log_audit (
  id uuid primary key default gen_random_uuid(),
  poop_log_id uuid not null references public.poop_logs (id) on delete restrict,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null check (action in ('deleted')),
  occurred_at timestamptz not null default now()
);

alter table public.poop_logs enable row level security;
alter table public.poop_log_audit enable row level security;

grant select on public.poop_logs to authenticated;
revoke insert, update, delete on public.poop_logs from anon, authenticated;
revoke all on public.poop_log_audit from anon, authenticated;

create policy "Users can read their active poop logs"
on public.poop_logs for select
to authenticated
using ((select auth.uid()) = user_id and deleted_at is null);

create or replace function public.require_active_user()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'authentication required';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = current_user_id and status = 'active'
  ) then
    raise exception 'active user account required';
  end if;

  return current_user_id;
end;
$$;

create or replace function public.log_poop()
returns table (id uuid, logged_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_active_user();
begin
  if exists (
    select 1 from public.poop_logs
    where user_id = current_user_id
      and deleted_at is null
      and poop_logs.logged_at > now() - interval '10 seconds'
  ) then
    raise exception 'Please wait 10 seconds before logging again';
  end if;

  return query
  insert into public.poop_logs (user_id)
  values (current_user_id)
  returning poop_logs.id, poop_logs.logged_at;
end;
$$;

create or replace function public.delete_poop_log(p_poop_log_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_active_user();
  deleted_log_id uuid;
begin
  update public.poop_logs
  set deleted_at = now()
  where id = p_poop_log_id
    and user_id = current_user_id
    and deleted_at is null
  returning id into deleted_log_id;

  if deleted_log_id is null then
    raise exception 'Poop log not found or already deleted';
  end if;

  insert into public.poop_log_audit (poop_log_id, actor_id, action)
  values (deleted_log_id, current_user_id, 'deleted');
end;
$$;

create or replace function public.get_poop_summary(p_timezone text default 'UTC')
returns table (today_count bigint, week_count bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_active_user();
  day_start timestamptz;
  week_start timestamptz;
begin
  if not exists (
    select 1 from pg_timezone_names where name = p_timezone
  ) then
    raise exception 'Invalid time zone';
  end if;

  day_start := date_trunc('day', now() at time zone p_timezone) at time zone p_timezone;
  week_start := date_trunc('week', now() at time zone p_timezone) at time zone p_timezone;

  return query
  select
    count(*) filter (where logged_at >= day_start),
    count(*) filter (where logged_at >= week_start)
  from public.poop_logs
  where user_id = current_user_id
    and deleted_at is null;
end;
$$;

revoke all on function public.require_active_user() from public;
revoke all on function public.log_poop() from public;
revoke all on function public.delete_poop_log(uuid) from public;
revoke all on function public.get_poop_summary(text) from public;
grant execute on function public.log_poop() to authenticated;
grant execute on function public.delete_poop_log(uuid) to authenticated;
grant execute on function public.get_poop_summary(text) to authenticated;
