create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> recipient_id)
);

create unique index friendships_active_pair_idx
on public.friendships (least(requester_id, recipient_id), greatest(requester_id, recipient_id))
where status in ('pending', 'accepted');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type text not null check (type in ('friend_request', 'friend_accepted')),
  reference_id uuid not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.user_search_rate_limits (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0)
);

create index notifications_user_unread_idx
on public.notifications (user_id, created_at desc)
where read_at is null;

alter table public.friendships enable row level security;
alter table public.notifications enable row level security;
alter table public.user_search_rate_limits enable row level security;

grant select on public.notifications to authenticated;
revoke all on public.friendships from anon, authenticated;
revoke insert, update, delete on public.notifications from anon, authenticated;
revoke all on public.user_search_rate_limits from anon, authenticated;

create policy "Users can read their own notifications"
on public.notifications for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.search_users(p_query text)
returns table (id uuid, username text)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_active_user();
  search_term text := lower(trim(p_query));
  search_request_count integer;
begin
  insert into public.user_search_rate_limits (user_id, window_started_at, request_count)
  values (current_user_id, now(), 1)
  on conflict (user_id) do update
  set
    request_count = case
      when user_search_rate_limits.window_started_at <= now() - interval '1 minute' then 1
      else user_search_rate_limits.request_count + 1
    end,
    window_started_at = case
      when user_search_rate_limits.window_started_at <= now() - interval '1 minute' then now()
      else user_search_rate_limits.window_started_at
    end
  returning request_count into search_request_count;

  if search_request_count > 30 then
    raise exception 'Too many searches. Try again shortly';
  end if;

  if length(search_term) < 2 then
    raise exception 'Enter at least 2 characters to search';
  end if;

  return query
  select profiles.id, profiles.username
  from public.profiles
  where profiles.id <> current_user_id
    and profiles.status = 'active'
    and profiles.normalized_username like search_term || '%'
  order by profiles.normalized_username
  limit 20;
end;
$$;

create or replace function public.send_friend_request(p_recipient_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_active_user();
  friendship_id uuid;
  existing_requester_id uuid;
  existing_status text;
begin
  if p_recipient_id = current_user_id then
    raise exception 'You cannot add yourself as a friend';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = p_recipient_id and status = 'active'
  ) then
    raise exception 'User not found';
  end if;

  if (
    select count(*)
    from public.friendships
    where requester_id = current_user_id
      and created_at > now() - interval '1 hour'
  ) >= 20 then
    raise exception 'Too many friend requests. Try again later';
  end if;

  select requester_id, status
  into existing_requester_id, existing_status
  from public.friendships
  where least(requester_id, recipient_id) = least(current_user_id, p_recipient_id)
    and greatest(requester_id, recipient_id) = greatest(current_user_id, p_recipient_id)
    and status in ('pending', 'accepted')
  limit 1;

  if existing_status = 'accepted' then
    raise exception 'You are already friends';
  end if;
  if existing_status = 'pending' and existing_requester_id = current_user_id then
    raise exception 'Friend request already sent';
  end if;
  if existing_status = 'pending' then
    raise exception 'This user has already sent you a friend request';
  end if;

  insert into public.friendships (requester_id, recipient_id)
  values (current_user_id, p_recipient_id)
  returning id into friendship_id;

  insert into public.notifications (user_id, actor_id, type, reference_id)
  values (p_recipient_id, current_user_id, 'friend_request', friendship_id);

  return friendship_id;
end;
$$;

create or replace function public.respond_to_friend_request(p_friendship_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_active_user();
  requester uuid;
begin
  update public.friendships
  set status = case when p_accept then 'accepted' else 'declined' end,
      updated_at = now()
  where id = p_friendship_id
    and recipient_id = current_user_id
    and status = 'pending'
  returning requester_id into requester;

  if requester is null then
    raise exception 'Friend request not found or already handled';
  end if;

  update public.notifications
  set read_at = now()
  where user_id = current_user_id
    and reference_id = p_friendship_id
    and type = 'friend_request'
    and read_at is null;

  if p_accept then
    insert into public.notifications (user_id, actor_id, type, reference_id)
    values (requester, current_user_id, 'friend_accepted', p_friendship_id);
  end if;
end;
$$;

create or replace function public.list_friends()
returns table (id uuid, username text)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_active_user();
begin
  return query
  select profiles.id, profiles.username
  from public.friendships
  join public.profiles on profiles.id = case
    when friendships.requester_id = current_user_id then friendships.recipient_id
    else friendships.requester_id
  end
  where friendships.status = 'accepted'
    and current_user_id in (friendships.requester_id, friendships.recipient_id)
  order by profiles.normalized_username;
end;
$$;

create or replace function public.list_notifications()
returns table (
  id uuid,
  type text,
  reference_id uuid,
  actor_username text,
  read_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_active_user();
begin
  return query
  select notifications.id, notifications.type, notifications.reference_id,
    coalesce(profiles.username, 'A former user'),
    notifications.read_at, notifications.created_at
  from public.notifications
  left join public.profiles on profiles.id = notifications.actor_id
  where notifications.user_id = current_user_id
  order by notifications.created_at desc
  limit 30;
end;
$$;

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_active_user();
begin
  update public.notifications
  set read_at = now()
  where id = p_notification_id
    and user_id = current_user_id
    and read_at is null;
end;
$$;

revoke all on function public.search_users(text) from public;
revoke all on function public.send_friend_request(uuid) from public;
revoke all on function public.respond_to_friend_request(uuid, boolean) from public;
revoke all on function public.list_friends() from public;
revoke all on function public.list_notifications() from public;
revoke all on function public.mark_notification_read(uuid) from public;
grant execute on function public.search_users(text) to authenticated;
grant execute on function public.send_friend_request(uuid) to authenticated;
grant execute on function public.respond_to_friend_request(uuid, boolean) to authenticated;
grant execute on function public.list_friends() to authenticated;
grant execute on function public.list_notifications() to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
