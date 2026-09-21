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
