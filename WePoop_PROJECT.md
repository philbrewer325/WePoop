# WePoop — Project Specification

## Project Name

**WePoop**

**Tagline:** *The social tracker for friendly logs.*

## Project Overview

WePoop is a web site and mobile app that turns a normal bodily function into a lighthearted social competition. Users create a simple username-based account, track how many times they poop, and compete with friends in weekly **Showdowns** to see who has the highest count.

The product should feel fun, social, modern, and polished without requiring users to provide an email address or other unnecessary personal information.

The application should be designed as a responsive web application with a mobile-friendly experience and an architecture that can support native mobile apps in the future.

---

# Core Product Principles

1. **Fast to use**
   - Logging a poop should take only a few seconds.
   - The primary action should always be easy to find.

2. **No email required**
   - Users create accounts using a username.
   - Do not require email verification.
   - Do not require a password unless a future authentication strategy requires one.
   - Account recovery should be considered separately because username-only accounts have limited recovery options.

3. **Privacy-conscious**
   - Avoid collecting unnecessary personal information.
   - Public content should expose only the information required for the social experience.
   - Private Showdowns must not be discoverable or joinable by unauthorized users.

4. **Social competition**
   - Users should be able to create and participate in Showdowns.
   - Showdowns are weekly by default.
   - Users can see standings and compare their counts with friends.

5. **Fun, not crude**
   - The branding can be humorous, but the interface should remain modern and semi-professional.
   - Avoid making the product feel like a novelty website that is difficult to use.

---

# Account System

## Account Creation

Users should be able to create an account with:

- Username
- Optional avatar/profile image in a future release

No email address should be required.

### Username Requirements

- Unique username
- Case-insensitive uniqueness
- Recommended length: 3–20 characters
- Allow letters, numbers, underscores, and optionally hyphens
- Prevent impersonation of system/reserved usernames
- Prevent offensive or inappropriate usernames using a configurable moderation list

### Authentication

The initial version should support username-based account creation and login without requiring email.

The authentication architecture should be designed so additional authentication methods can be added later without requiring a major database redesign.

Potential future options:

- Passkeys
- Device-based authentication
- Optional password
- OAuth/social login

Do not make any of these required for the initial MVP.

---

# Poop Tracking

The primary function of WePoop is recording a poop.

## Log Entry

A user can create a poop log with one tap.

Each log should contain at minimum:

- User ID
- Timestamp
- Date
- Unique log ID

Optional future fields:

- Hashtags
- Emoji
- Notes
- Location category (not precise GPS)
- Bristol stool type
- Duration

These optional fields should not be required for the MVP.

## Logging Rules

- Users can log multiple poops per day.
- Each poop counts toward the user's daily total.
- Counts roll up into weekly totals.
- A user should be able to see their historical totals.
- Users should be able to delete an accidental log.
- Deleted logs should no longer count toward Showdown standings.

## Primary UI

The home screen should prominently display:

- Today's poop count
- Current weekly count
- Large **"Log a Poop"** button
- Current Showdowns
- Recent activity

---

# Hashtags

Users should be able to associate predefined hashtags with their poop logs.

## Important Requirement

Users should **not** be able to create arbitrary hashtags in the MVP.

The application should maintain a predefined, administrator-managed list.

Examples:

- `#Morning`
- `#Coffee`
- `#Work`
- `#Home`
- `#Weekend`
- `#AfterDinner`
- `#RoadTrip`
- `#Vacation`
- `#BigOne`
- `#Emergency`
- `#TacoTuesday`

The exact initial list should be configurable through the backend/admin interface.

## Hashtag Rules

- A log can have zero or more hashtags.
- Hashtags must come from the approved list.
- Admins can enable/disable hashtags.
- Disabled hashtags should remain associated with historical records but should not be selectable for new logs.
- Hashtags should be searchable/filterable.

---

# Showdowns

A **Showdown** is a competition between users based on poop counts during a defined period.

## Default Showdown

The primary Showdown format is weekly.

Example:

> Monday 12:00 AM through Sunday 11:59 PM

At the end of the period, the user with the highest number of valid poop logs has the highest total.

## Creating a Showdown

Any authenticated user can create a Showdown.

Required fields:

- Showdown name
- Start date
- End date
- Visibility

Optional fields:

- Description
- Maximum participants
- Hashtag/theme
- Custom emoji/icon

### Visibility

Showdowns must support:

#### Public

- Anyone can discover the Showdown.
- Anyone can request/join the Showdown according to configured participation rules.
- Public Showdowns can appear in discovery/search.
- Standings are visible to participants and potentially publicly depending on the final privacy model.

#### Private

- The Showdown is not publicly discoverable.
- The creator can invite specific users.
- Users can join only through an invitation.
- An invitation should be represented by a secure invite mechanism.

---

# Private Showdown Invitations

Private Showdowns should support inviting friends without requiring email.

Possible MVP approach:

1. Creator selects **Invite Friends**.
2. Creator searches for friends by username.
3. Creator selects one or more users.
4. The system creates invitations.
5. Invited users see the invitation in their WePoop notification/invitation center.
6. User accepts or declines.

A secondary shareable invite link/code can also be supported.

Example:

`wepoop.app/join/ABC123`

The invite token should:

- Be unpredictable
- Expire when the Showdown ends or after a configurable period
- Be revocable by the Showdown creator
- Not expose private Showdown data before authorization

---

# Friends / Social Graph

Users should be able to find other users by username.

MVP functionality:

- Search users by username
- View basic public profile
- Send friend request
- Accept/decline friend request
- Remove friend
- Invite friends to Showdowns

Future functionality:

- Follow users
- Friend activity feed
- Reactions
- Comments
- Direct messaging

Do not implement direct messaging in the MVP.

---

# Profiles

A user profile should display:

- Username
- Avatar
- Total lifetime poops
- Current weekly count
- Showdowns participated in
- Showdown wins
- Recent public activity, subject to privacy settings

Do not expose:

- Email
- Authentication credentials
- Precise location
- Other private account information

---

# Leaderboards

## Weekly Leaderboard

Users should be able to see:

- Rank
- Username
- Poop count
- Difference from the leader

Example:

| Rank | User | Count |
|---|---|---:|
| 1 | Phil | 18 |
| 2 | Mike | 15 |
| 3 | Sarah | 12 |

Avoid displaying sensitive information.

## Showdown Leaderboard

Every Showdown has its own leaderboard.

Showdowns should support:

- Current standings
- Final standings
- Participant count
- Remaining time
- Start/end dates
- Individual participant totals

Ties should be supported.

For tied final counts, display the users as tied rather than arbitrarily assigning a winner.

---

# Activity Feed

The application may include a lightweight social activity feed.

Examples:

- `Phil logged a poop`
- `Mike joined Weekend Warriors`
- `Sarah created a new Showdown`
- `Phil finished #1 in Friday Night Logs`

The feed should avoid exposing exact timestamps if privacy concerns arise.

Users should never be required to publicly share individual poop logs.

---

# Notifications

MVP notifications should support:

- Private Showdown invitation
- Friend request
- Friend request accepted
- Showdown starting soon
- Showdown ending soon
- Showdown completed
- Final Showdown result

Push notifications should be architected as a future capability.

---

# Admin / Moderation

An administrator interface should allow management of:

- Users
- Usernames
- Hashtags
- Showdowns
- Reported content
- Suspended users
- Banned users
- Reserved usernames
- System configuration

Admins should be able to:

- Disable a user
- Delete inappropriate content
- Disable hashtags
- Review reports
- Manage public Showdowns

---

# Privacy and Safety

Although the application is intentionally humorous, it should be designed like a real social application.

## Privacy Requirements

- Do not require email.
- Do not collect unnecessary personal information.
- Do not expose account credentials.
- Do not expose precise location.
- Private Showdowns must remain private.
- Users should be able to leave Showdowns.
- Users should be able to delete their account.

## Abuse Prevention

Implement basic protections against:

- Username impersonation
- Spam friend requests
- Automated account creation
- Excessive API requests
- Fake/automated poop logging
- Abuse of public Showdowns

Rate limiting should be applied to important endpoints.

---

# Anti-Cheat Considerations

Because Showdowns are based on counts, the system should assume users may attempt to inflate their totals.

MVP protections:

- Server-side timestamps
- Server-generated log IDs
- Rate limits on logging
- Audit records for deleted logs
- Do not trust client-provided timestamps
- Detect unusually high logging frequency

Do not impose an arbitrary hard limit on poops per day in the MVP unless abuse becomes a demonstrated problem.

Future functionality could include anomaly detection.

---

# Suggested Data Model

## User

```text
User
- id
- username
- normalizedUsername
- avatarUrl
- createdAt
- updatedAt
- status
```

## PoopLog

```text
PoopLog
- id
- userId
- loggedAt
- createdAt
- deletedAt
```

## Hashtag

```text
Hashtag
- id
- name
- slug
- enabled
- createdAt
```

## PoopLogHashtag

```text
PoopLogHashtag
- poopLogId
- hashtagId
```

## Friendship

```text
Friendship
- id
- requesterId
- recipientId
- status
- createdAt
- updatedAt
```

## Showdown

```text
Showdown
- id
- creatorId
- name
- description
- visibility
- startAt
- endAt
- status
- maxParticipants
- createdAt
- updatedAt
```

## ShowdownParticipant

```text
ShowdownParticipant
- id
- showdownId
- userId
- joinedAt
- status
```

## ShowdownInvitation

```text
ShowdownInvitation
- id
- showdownId
- inviterId
- inviteeId
- token
- status
- expiresAt
- createdAt
```

## Notification

```text
Notification
- id
- userId
- type
- referenceId
- readAt
- createdAt
```

---

# Counting Architecture

Do not store only a manually maintained total count.

Poop logs should be the source of truth.

Weekly Showdown totals should be calculated from valid PoopLog records within the Showdown's start/end timestamps.

For performance, the system may later maintain cached/aggregated counts.

Example query concept:

```text
COUNT(PoopLog)
WHERE
  userId = participant.userId
  AND loggedAt >= showdown.startAt
  AND loggedAt <= showdown.endAt
  AND deletedAt IS NULL
```

The server must perform the authoritative calculation.

---

# API Requirements

The backend should expose authenticated API endpoints for:

## Authentication

```text
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/me
```

## Poop Logs

```text
POST   /poops
GET    /poops
GET    /poops/today
DELETE /poops/:id
```

## Users

```text
GET /users/search
GET /users/:username
```

## Friends

```text
POST   /friends/:userId
GET    /friends
POST   /friends/:requestId/accept
DELETE /friends/:requestId
```

## Showdowns

```text
POST   /showdowns
GET    /showdowns
GET    /showdowns/:id
PATCH  /showdowns/:id
DELETE /showdowns/:id
POST   /showdowns/:id/join
POST   /showdowns/:id/leave
GET    /showdowns/:id/leaderboard
```

## Invitations

```text
POST /showdowns/:id/invitations
GET  /invitations
POST /invitations/:id/accept
POST /invitations/:id/decline
```

## Hashtags

```text
GET /hashtags
```

Hashtag creation/modification should be admin-only.

---

# Web Application

The web application should be responsive and optimized for mobile browsers.

Primary screens:

1. Landing page
2. Username creation/login
3. Home/dashboard
4. Log poop confirmation
5. History
6. Friends
7. Showdowns
8. Showdown details
9. Showdown leaderboard
10. Create Showdown
11. Invitations
12. Profile
13. Settings
14. Admin dashboard

---

# Mobile App

The backend and API should support a future native mobile application.

Recommended mobile priorities:

- Fast launch
- One-tap poop logging
- Push notifications
- Showdown leaderboard
- Friend invitations
- Minimal navigation

Potential future platforms:

- iOS
- Android

The initial implementation may use a responsive web/PWA architecture if that accelerates MVP development.

---

# Recommended MVP

The first release should focus on:

### Required

- Username-only account creation
- Username login/session management
- User search
- Poop logging
- Daily count
- Weekly count
- Predefined hashtags
- Friend requests
- Public Showdowns
- Private Showdowns
- Private Showdown invitations
- Showdown leaderboards
- Basic notifications/in-app invitation center
- User profiles
- Account deletion
- Basic moderation
- Rate limiting

### Defer

- Native iOS application
- Native Android application
- Email authentication
- Social OAuth
- Direct messaging
- Comments
- Reactions
- Advanced analytics
- Location tracking
- Bristol stool tracking
- Paid features
- Advertising
- AI features

---

# UX Requirements

The application should have a playful visual identity while remaining clean and modern.

Avoid:

- Overly childish UI
- Excessive cartoon imagery
- Cluttered dashboards
- Too many required fields
- Long onboarding flows

Prioritize:

- Large obvious primary actions
- Clear counts
- Simple navigation
- Fun microcopy
- Smooth animations used sparingly
- Mobile-first layouts

Example button copy:

- **Log It 💩**
- **Start a Showdown**
- **Challenge Friends**
- **Join Showdown**
- **Drop Out**
- **View the Damage**

Use humor in appropriate places without making the interface difficult to understand.

---

# Technical Architecture

The exact stack can be selected during implementation, but the architecture should follow these principles:

- API-first backend
- Relational database
- Secure session/authentication system
- Server-side authorization
- Responsive frontend
- Mobile-ready API
- Database migrations
- Environment-based configuration
- Automated testing
- CI/CD
- Logging and monitoring
- Rate limiting
- Input validation
- Secure secret management

Potential stack:

### Frontend

- Next.js / React
- TypeScript
- Responsive CSS/Tailwind

### Backend

Either:

- Next.js API/server
- Node.js + TypeScript
- NestJS

### Database

- PostgreSQL

### ORM

- Prisma or equivalent

### Hosting

Choose a deployment architecture appropriate for the final implementation.

The project should be container-friendly and deployable using Docker.

---

# Security Requirements

- Hash any passwords if passwords are eventually introduced.
- Never store plaintext credentials.
- Validate all user input server-side.
- Use parameterized database queries/ORM.
- Enforce authorization on every protected resource.
- Do not rely solely on frontend restrictions.
- Protect private Showdown endpoints.
- Use secure session cookies or equivalent secure authentication tokens.
- Apply CSRF protections where applicable.
- Apply rate limits to authentication, logging, search, invitations, and friend requests.
- Sanitize user-generated content.
- Log security-relevant events.

---

# Development Milestones

## Phase 1 — Foundation

- Repository setup
- Application architecture
- Database
- Authentication
- User model
- Basic UI framework
- CI/CD
- Environment configuration

## Phase 2 — Poop Tracking

- PoopLog model
- Log poop UI
- Daily count
- Weekly count
- History
- Delete log
- Basic anti-abuse controls

## Phase 3 — Social

- User search
- Profiles
- Friend requests
- Notifications

## Phase 4 — Showdowns

- Create Showdown
- Public Showdowns
- Private Showdowns
- Invitations
- Join/leave
- Leaderboards
- Weekly scoring

## Phase 5 — Hashtags

- Predefined hashtag database
- Hashtag selection
- Hashtag filtering
- Admin hashtag management

## Phase 6 — Polish

- Responsive design
- Animations
- Empty states
- Error handling
- Accessibility
- Performance optimization
- Security review
- Automated tests

---

# Acceptance Criteria

The MVP is considered functional when:

1. A new user can create an account using only a unique username.
2. A user can log a poop in a single interaction.
3. The user's daily and weekly counts update correctly.
4. A user can delete an accidental log.
5. Deleted logs are excluded from Showdown totals.
6. Users can search for other users by username.
7. Users can send and accept friend requests.
8. A user can create a public Showdown.
9. A user can create a private Showdown.
10. A private Showdown cannot be discovered or joined by unauthorized users.
11. A Showdown creator can invite friends by username.
12. Invited users can accept or decline invitations.
13. Showdown standings correctly calculate poop logs during the defined competition period.
14. Ties are handled correctly.
15. Users can select hashtags only from the administrator-defined list.
16. Users cannot create arbitrary hashtags.
17. Basic rate limiting prevents obvious automated abuse.
18. Users can delete their accounts.
19. No email address is required anywhere in the MVP account creation flow.
20. The application works on desktop and mobile browser sizes.

---

# Product Naming

Primary name:

**WePoop**

Tagline:

**The social tracker for friendly logs.**

Possible supporting copy:

> Track it. Share it. Showdown.

> Who poops more?

> Your friends. Your logs. Your leaderboard.

Keep the branding playful but avoid making the product feel like a joke that users would not want to actually use.

---

# Future Ideas

Potential post-MVP features:

- Daily challenges
- Monthly Showdowns
- Team Showdowns
- Streaks
- Achievements/badges
- Custom Showdown rules
- Private friend groups
- Public community Showdowns
- Reactions
- Comments
- Push notifications
- PWA installation
- Native mobile applications
- Home-screen quick action for logging
- Widgets
- Anonymous/public statistics
- Advanced poop analytics
- Optional health-oriented tracking
- Custom profile themes
- Seasonal events

Any future health-related functionality should be implemented carefully and should not imply medical diagnosis or medical advice.

---

# Development Guidance for GitHub Copilot / Coding Agents

When implementing this project:

1. Treat this document as the product requirements baseline.
2. Favor a simple, maintainable architecture over unnecessary complexity.
3. Build the MVP in small, testable increments.
4. Keep authentication username-based and do not introduce email requirements.
5. Keep PoopLog records as the source of truth for counts.
6. Enforce private Showdown authorization server-side.
7. Do not allow arbitrary hashtag creation by normal users.
8. Write automated tests for counting and Showdown date boundaries.
9. Test timezone behavior explicitly.
10. Test authorization boundaries between public and private Showdowns.
11. Do not expose private user or Showdown information through APIs.
12. Document all environment variables.
13. Include database migrations.
14. Include seed data for the initial hashtag list.
15. Keep the API suitable for a future native mobile client.
16. Use TypeScript and strong typing if the selected stack supports it.
17. Favor accessible UI components.
18. Keep the UI humorous but professional.
19. Do not implement features listed as deferred unless they are required to support the MVP.
20. Before considering the MVP complete, run the full test suite and verify all acceptance criteria.

## Definition of Done

A feature is not complete until:

- Implementation is complete.
- Database migrations are included where applicable.
- API validation is implemented.
- Authorization is implemented.
- UI states include loading, empty, success, and error states.
- Automated tests cover core behavior.
- Mobile and desktop layouts have been considered.
- Documentation is updated.
- No secrets are committed.
- Existing tests continue to pass.
