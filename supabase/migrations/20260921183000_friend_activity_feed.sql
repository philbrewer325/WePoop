create or replace function public.get_friend_activity(
  p_limit integer default 20,
  p_timezone text default 'UTC'
)
returns table (username text, activity_date date)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_active_user();
begin
  if not exists (
    select 1 from pg_timezone_names where name = p_timezone
  ) then
    raise exception 'Invalid time zone';
  end if;

  return query
  select
    profiles.username,
    (poop_logs.logged_at at time zone p_timezone)::date
  from public.poop_logs
  join public.friendships on friendships.status = 'accepted'
    and (
      (friendships.requester_id = current_user_id and friendships.recipient_id = poop_logs.user_id)
      or (friendships.recipient_id = current_user_id and friendships.requester_id = poop_logs.user_id)
    )
  join public.profiles on profiles.id = poop_logs.user_id
  where poop_logs.deleted_at is null
  order by poop_logs.logged_at desc
  limit least(greatest(p_limit, 1), 50);
end;
$$;

revoke all on function public.get_friend_activity(integer, text) from public;
grant execute on function public.get_friend_activity(integer, text) to authenticated;
