# WePoop

WePoop is a responsive, username-first social tracker for friendly logs. This repository contains the web client; Supabase supplies the API, PostgreSQL database, and session layer used by this client and future Android applications.

## Stack

- React 19, TypeScript, and Vite
- Supabase Auth and PostgreSQL with Row Level Security
- Zod validation and Vitest

The browser client uses Supabase Auth's password hashing with a username/password user experience. A username is internally mapped to a reserved-domain Auth address; no personal email address is requested, collected, or exposed. The same Auth API and database schema are suitable for a future Android client.

## Local setup

1. Create a Supabase project.
2. In **Authentication → Providers**, enable **Email** and disable **Confirm email**. WePoop maps a username to an internal reserved-domain Auth address, so users never enter or expose a personal email address.
3. Apply the migrations in `supabase/migrations` in timestamp order with the Supabase CLI or SQL editor.
4. Copy `.env.example` to `.env` and set the project's URL and publishable key. Never put a service-role key in a `VITE_` variable.
5. Run `npm install` and `npm run dev`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local web client |
| `npm run lint` | Run static linting |
| `npm run test -- --run` | Run the unit suite once |
| `npm run build` | Type-check and produce a production build |

## Database foundation

The initial migration creates:

- `profiles`, keyed by `auth.users.id`, with a case-insensitive unique username
- a configurable `reserved_usernames` list
- a database trigger that creates a profile transactionally when Auth creates a user
- an RLS policy allowing users to read only their own profile

Later features must expose public profiles, user search, friendships, logs, and Showdowns through narrowly scoped RLS policies or server-side RPC/Edge Functions; do not loosen this base policy.

## Poop tracking

The poop-log migration provides server-authoritative operations:

- `log_poop()` creates an active log with the database timestamp; clients cannot supply a timestamp or user ID.
- `get_poop_summary(timezone)` calculates the current day and ISO week (Monday start) from active logs in the supplied IANA timezone.
- `delete_poop_log(id)` soft-deletes only the authenticated user's active log and creates a non-client-readable audit event.

The direct database table permits only per-user reads. Inserts, updates, and deletes are exclusively performed by the authenticated RPC functions. A ten-second server-side cooldown protects against rapid automated logging without imposing a daily count cap.

## Social graph

The social migration adds server-authorized username discovery, friend requests, acceptance/decline actions, and in-app notifications. Profiles remain private by default: the only discovery endpoint is a rate-limited-prefix search RPC, which returns a username and opaque ID only. Friendship and notification mutations are RPC-only; direct table mutations are not available to browser clients.

## Friends’ activity feed

The friend-activity feed is derived from accepted friendships and active poop logs by an authenticated RPC. It exposes a friend’s username and local calendar day only—never the precise timestamp or a log ID—and automatically excludes soft-deleted logs.

## Private Showdown foundation

The private-Showdown migration establishes `showdowns`, `showdown_participants`, and `showdown_invitations`. Every Showdown is currently constrained to `private`; all three tables have RLS enabled and direct browser access revoked. Future creator, invitation, participant, and leaderboard RPCs must preserve this private-by-default boundary.

Creator controls provide authenticated RPCs to create, list, edit, and cancel private Showdowns. Creation automatically makes the creator an active participant and uses a weekly default in the web UI.

## Project status

Phases 1 through 3 are in progress. The foundation, poop tracking, social graph, and private-Showdown data model are implemented. Private Showdown behavior, hashtags, and public Showdowns remain upcoming milestones.
