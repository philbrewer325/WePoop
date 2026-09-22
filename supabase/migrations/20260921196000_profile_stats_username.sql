create or replace function public.get_my_profile_stats()
returns table (username text, lifetime_count bigint, week_count bigint, showdowns_participated bigint, showdown_wins bigint)
language plpgsql security definer set search_path = public as $$
declare current_user_id uuid := public.require_active_user();
begin
 return query select p.username,
  (select count(*) from public.poop_logs l where l.user_id=current_user_id and l.deleted_at is null),
  (select count(*) from public.poop_logs l where l.user_id=current_user_id and l.deleted_at is null and l.logged_at>=date_trunc('week', now())),
  (select count(*) from public.showdown_participants sp where sp.user_id=current_user_id and sp.status='active'),
  0::bigint
 from public.profiles p where p.id=current_user_id;
end; $$;

create or replace function public.update_my_username(p_username text)
returns void language plpgsql security definer set search_path = public as $$
declare current_user_id uuid := public.require_active_user();
begin
 update public.profiles set username=trim(p_username), updated_at=now() where id=current_user_id;
end; $$;

revoke all on function public.get_my_profile_stats() from public;
revoke all on function public.update_my_username(text) from public;
grant execute on function public.get_my_profile_stats() to authenticated;
grant execute on function public.update_my_username(text) to authenticated;
