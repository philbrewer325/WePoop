alter table public.notifications drop constraint notifications_type_check;
alter table public.notifications add constraint notifications_type_check
check (type in ('friend_request', 'friend_accepted', 'showdown_invitation', 'showdown_invitation_accepted'));

create or replace function public.invite_to_private_showdown(p_showdown_id uuid, p_invitee_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare current_user_id uuid := public.require_active_user(); invitation_id uuid; showdown_end timestamptz;
begin
  select end_at into showdown_end from public.showdowns
  where id = p_showdown_id and creator_id = current_user_id and status in ('scheduled', 'active');
  if showdown_end is null then raise exception 'Showdown not found or invitations are closed'; end if;
  if not exists (select 1 from public.friendships where status = 'accepted' and
    ((requester_id = current_user_id and recipient_id = p_invitee_id) or (recipient_id = current_user_id and requester_id = p_invitee_id))) then
    raise exception 'You can invite accepted friends only'; end if;
  if exists (select 1 from public.showdown_participants where showdown_id = p_showdown_id and user_id = p_invitee_id and status = 'active') then
    raise exception 'This friend already joined the Showdown'; end if;
  insert into public.showdown_invitations (showdown_id, inviter_id, invitee_id, expires_at)
  values (p_showdown_id, current_user_id, p_invitee_id, showdown_end)
  on conflict (showdown_id, invitee_id) do update set status = 'pending', expires_at = excluded.expires_at, created_at = now(), responded_at = null
  where showdown_invitations.status in ('declined', 'revoked', 'expired')
  returning id into invitation_id;
  if invitation_id is null then raise exception 'Invitation already pending'; end if;
  insert into public.notifications (user_id, actor_id, type, reference_id) values (p_invitee_id, current_user_id, 'showdown_invitation', invitation_id);
  return invitation_id;
end;
$$;

create or replace function public.list_showdown_invitations()
returns table (id uuid, showdown_name text, inviter_username text, expires_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare current_user_id uuid := public.require_active_user();
begin
 return query select i.id, s.name, p.username, i.expires_at from public.showdown_invitations i
 join public.showdowns s on s.id=i.showdown_id join public.profiles p on p.id=i.inviter_id
 where i.invitee_id=current_user_id and i.status='pending' and i.expires_at>now() order by i.created_at desc;
end; $$;

create or replace function public.respond_to_showdown_invitation(p_invitation_id uuid, p_accept boolean)
returns void language plpgsql security definer set search_path = public as $$
declare current_user_id uuid := public.require_active_user(); target_showdown uuid; target_creator uuid; participant_limit integer;
begin
 select i.showdown_id, s.creator_id, s.max_participants into target_showdown, target_creator, participant_limit
 from public.showdown_invitations i join public.showdowns s on s.id=i.showdown_id
 where i.id=p_invitation_id and i.invitee_id=current_user_id and i.status='pending' and i.expires_at>now() and s.status in ('scheduled','active');
 if target_showdown is null then raise exception 'Invitation is unavailable'; end if;
 if p_accept and (select count(*) from public.showdown_participants where showdown_id=target_showdown and status='active') >= participant_limit then raise exception 'This Showdown is full'; end if;
 update public.showdown_invitations set status=case when p_accept then 'accepted' else 'declined' end, responded_at=now() where id=p_invitation_id;
 if p_accept then
  insert into public.showdown_participants (showdown_id,user_id) values (target_showdown,current_user_id)
  on conflict (showdown_id,user_id) do update set status='active', joined_at=now(), left_at=null;
  insert into public.notifications (user_id,actor_id,type,reference_id) values (target_creator,current_user_id,'showdown_invitation_accepted',p_invitation_id);
 end if;
end; $$;

revoke all on function public.invite_to_private_showdown(uuid,uuid) from public;
revoke all on function public.list_showdown_invitations() from public;
revoke all on function public.respond_to_showdown_invitation(uuid,boolean) from public;
grant execute on function public.invite_to_private_showdown(uuid,uuid) to authenticated;
grant execute on function public.list_showdown_invitations() to authenticated;
grant execute on function public.respond_to_showdown_invitation(uuid,boolean) to authenticated;
