create table public.showdowns (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles (id) on delete restrict,
  name text not null check (char_length(trim(name)) between 3 and 60),
  description text check (description is null or char_length(trim(description)) <= 500),
  visibility text not null default 'private' check (visibility = 'private'),
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('draft', 'scheduled', 'active', 'completed', 'cancelled')),
  max_participants integer not null default 20 check (max_participants between 2 and 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index showdowns_creator_status_idx
on public.showdowns (creator_id, status, start_at desc);

create table public.showdown_participants (
  id uuid primary key default gen_random_uuid(),
  showdown_id uuid not null references public.showdowns (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'left', 'removed')),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  unique (showdown_id, user_id),
  check (
    (status = 'active' and left_at is null)
    or (status in ('left', 'removed') and left_at is not null)
  )
);

create index showdown_participants_active_showdown_idx
on public.showdown_participants (showdown_id, user_id)
where status = 'active';

create table public.showdown_invitations (
  id uuid primary key default gen_random_uuid(),
  showdown_id uuid not null references public.showdowns (id) on delete cascade,
  inviter_id uuid not null references public.profiles (id) on delete cascade,
  invitee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'revoked', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (showdown_id, invitee_id),
  check (inviter_id <> invitee_id),
  check (
    (status = 'pending' and responded_at is null)
    or (status in ('accepted', 'declined', 'revoked', 'expired') and responded_at is not null)
  )
);

create index showdown_invitations_pending_invitee_idx
on public.showdown_invitations (invitee_id, created_at desc)
where status = 'pending';

create or replace function public.set_showdown_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger showdowns_set_updated_at
before update on public.showdowns
for each row execute function public.set_showdown_updated_at();

alter table public.showdowns enable row level security;
alter table public.showdown_participants enable row level security;
alter table public.showdown_invitations enable row level security;

revoke all on public.showdowns from anon, authenticated;
revoke all on public.showdown_participants from anon, authenticated;
revoke all on public.showdown_invitations from anon, authenticated;
