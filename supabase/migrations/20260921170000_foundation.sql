create table public.reserved_usernames (
  username text primary key check (username = lower(username)),
  created_at timestamptz not null default now()
);

insert into public.reserved_usernames (username)
values ('admin'), ('administrator'), ('api'), ('moderator'), ('support'), ('system'), ('wepoop')
on conflict do nothing;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_-]{3,20}$'),
  normalized_username text generated always as (lower(username)) stored,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'suspended', 'banned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (normalized_username)
);

create or replace function public.reject_reserved_username()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.reserved_usernames
    where username = lower(new.username)
  ) then
    raise exception 'username is reserved';
  end if;
  return new;
end;
$$;

create trigger profiles_reject_reserved_username
before insert or update of username on public.profiles
for each row execute function public.reject_reserved_username();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

create trigger auth_user_creates_profile
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);
