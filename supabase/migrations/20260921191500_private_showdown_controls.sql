create or replace function public.create_private_showdown(
  p_name text,
  p_description text,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_max_participants integer default 20
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := public.require_active_user();
  showdown_id uuid;
begin
  if p_start_at < now() - interval '5 minutes' then raise exception 'Showdowns cannot start in the past'; end if;
  if p_end_at <= p_start_at or p_end_at > p_start_at + interval '31 days' then raise exception 'Choose a duration between 1 minute and 31 days'; end if;

  insert into public.showdowns (creator_id, name, description, start_at, end_at, max_participants)
  values (current_user_id, trim(p_name), nullif(trim(p_description), ''), p_start_at, p_end_at, p_max_participants)
  returning id into showdown_id;

  insert into public.showdown_participants (showdown_id, user_id)
  values (showdown_id, current_user_id);
  return showdown_id;
end;
$$;

create or replace function public.list_my_private_showdowns()
returns table (id uuid, name text, description text, start_at timestamptz, end_at timestamptz, status text, max_participants integer)
language plpgsql security definer set search_path = public as $$
declare current_user_id uuid := public.require_active_user();
begin
  return query select s.id, s.name, s.description, s.start_at, s.end_at, s.status, s.max_participants
  from public.showdowns s where s.creator_id = current_user_id order by s.start_at desc;
end;
$$;

create or replace function public.update_private_showdown(
  p_showdown_id uuid, p_name text, p_description text, p_start_at timestamptz, p_end_at timestamptz, p_max_participants integer
) returns void language plpgsql security definer set search_path = public as $$
declare current_user_id uuid := public.require_active_user();
begin
  update public.showdowns set name = trim(p_name), description = nullif(trim(p_description), ''),
    start_at = p_start_at, end_at = p_end_at, max_participants = p_max_participants
  where id = p_showdown_id and creator_id = current_user_id and status in ('draft', 'scheduled') and start_at > now();
  if not found then raise exception 'Showdown not found or no longer editable'; end if;
end;
$$;

create or replace function public.cancel_private_showdown(p_showdown_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare current_user_id uuid := public.require_active_user();
begin
  update public.showdowns set status = 'cancelled'
  where id = p_showdown_id and creator_id = current_user_id and status in ('draft', 'scheduled', 'active');
  if not found then raise exception 'Showdown not found or cannot be cancelled'; end if;
end;
$$;

revoke all on function public.create_private_showdown(text, text, timestamptz, timestamptz, integer) from public;
revoke all on function public.list_my_private_showdowns() from public;
revoke all on function public.update_private_showdown(uuid, text, text, timestamptz, timestamptz, integer) from public;
revoke all on function public.cancel_private_showdown(uuid) from public;
grant execute on function public.create_private_showdown(text, text, timestamptz, timestamptz, integer) to authenticated;
grant execute on function public.list_my_private_showdowns() to authenticated;
grant execute on function public.update_private_showdown(uuid, text, text, timestamptz, timestamptz, integer) to authenticated;
grant execute on function public.cancel_private_showdown(uuid) to authenticated;
