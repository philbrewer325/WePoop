create or replace function public.get_showdown_leaderboard(p_showdown_id uuid)
returns table (rank bigint, username text, poop_count bigint, difference_from_leader bigint)
language plpgsql security definer set search_path = public as $$
declare current_user_id uuid := public.require_active_user();
begin
 if not exists (select 1 from public.showdown_participants where showdown_id=p_showdown_id and user_id=current_user_id and status='active') then raise exception 'You are not a participant in this private Showdown'; end if;
 return query with counts as (
   select p.username, count(l.id)::bigint as poop_count from public.showdown_participants sp
   join public.profiles p on p.id=sp.user_id join public.showdowns s on s.id=sp.showdown_id
   left join public.poop_logs l on l.user_id=sp.user_id and l.deleted_at is null and l.logged_at>=s.start_at and l.logged_at<=s.end_at
   where sp.showdown_id=p_showdown_id and sp.status='active' group by p.username
 ), ranked as (
   select dense_rank() over(order by counts.poop_count desc) as rank, counts.username, counts.poop_count,
     max(counts.poop_count) over() as leader_count from counts
 )
 select ranked.rank, ranked.username, ranked.poop_count, ranked.leader_count-ranked.poop_count
 from ranked order by ranked.rank, ranked.username;
end; $$;
