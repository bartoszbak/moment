# Faces

Async team photo wall for remote organisations. The intended product flow is: sign in with your work Google account, join or create your organisation, take a photo, and appear on a shared wall.

Frontend direction: this project should use official shadcn/ui components from https://ui.shadcn.com/, added to the repo as source code via the shadcn CLI.

## Current Status

This repo is partially implemented.

- Working now:
  - Next.js 15 app scaffold with App Router
  - Prisma ORM 7 on PostgreSQL
  - local Postgres development setup
  - capture UI with webcam, preview, retake, and member details form
  - Cloudinary upload helper
  - `POST /api/photos` and `GET /api/photos`
  - stable photo placement coordinates in the database

- Still placeholder:
  - Auth.js / Google OAuth
  - organisation creation and auto-join flow
  - domain-gated session checks
  - wall rendering beyond a placeholder page
  - settings/admin surface
  - shadcn/ui project setup and official component usage

- Important frontend note:
  - the current UI is mostly custom Tailwind markup
  - it is not yet implemented with official shadcn/ui components from `ui.shadcn.com`
  - the docs below describe the intended frontend standard, not the current frontend implementation

## What To Do Next

Based on [BuildMe.md](/Users/bartbak/Repo/moment/BuildMe.md), the next sensible step is to finish the missing parts of Phase 1 before moving deeper into the wall work.

Recommended order:

1. Initialize shadcn/ui from https://ui.shadcn.com/ and add the project config plus core components.
2. Rebuild the current auth/capture surfaces with official shadcn/ui components instead of custom Tailwind-only markup.
3. Implement Auth.js v5 with Google OAuth in [app/api/auth/[...nextauth]/route.ts](/Users/bartbak/Repo/moment/app/api/auth/%5B...nextauth%5D/route.ts).
4. Implement organisation lookup/create in [app/api/orgs/route.ts](/Users/bartbak/Repo/moment/app/api/orgs/route.ts).
5. Replace the temporary email fallback in the capture flow with the authenticated session user.
6. Build Phase 3 wall MVP on top of the now-working auth and org model.

Reason: the current Phase 2 capture flow works, but it is using a temporary email field because real authentication and onboarding are not in place yet, and the UI layer has not been migrated to official shadcn/ui components.

## Stack

- Next.js 15
- TypeScript
- shadcn/ui from https://ui.shadcn.com/
- Tailwind CSS
- motion.dev
- Prisma ORM 7.6
- PostgreSQL
- Cloudinary
- Netlify

## Runtime

Node.js 24 is required. The repo is pinned via [.node-version](/Users/bartbak/Repo/moment/.node-version).

## Local Development

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open `http://localhost:3000`.

## Local Database

This project uses native local PostgreSQL in development.

Create the database once:

```bash
createdb moment
```

Default local connection string:

```bash
DATABASE_URL=postgresql://bartbak@localhost:5432/moment?schema=public
```

Useful commands:

```bash
npx prisma studio
psql moment
dropdb moment
createdb moment
```

Prisma CLI reads from [.env](/Users/bartbak/Repo/moment/.env). Next.js reads from [.env.local](/Users/bartbak/Repo/moment/.env.local). Keep `DATABASE_URL` in both files for local development.

## Environment Variables

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Notes:

- `DATABASE_URL` should point to local Postgres in development.
- replace it with Neon later for production.
- Cloudinary values are required for the current capture upload flow.
- Google OAuth values are not used yet because auth is still a placeholder.

## Current Route Status

| Route | Status | Notes |
|---|---|---|
| `/` | working | Landing page |
| `/login` | placeholder | UI exists, no OAuth yet |
| `/onboarding` | placeholder | Copy only |
| `/[orgSlug]/capture` | working | Real capture flow |
| `/[orgSlug]/wall` | placeholder | No wall UI yet |
| `/api/auth/[...nextauth]` | placeholder | Returns 501 |
| `/api/orgs` | placeholder | Returns 501 |
| `/api/photos` | working | List + create photos |

## Frontend Standard

The intended frontend stack is:

- Next.js App Router
- shadcn/ui from `ui.shadcn.com`
- Tailwind CSS as the styling foundation under shadcn/ui
- motion.dev for animation

That means:

- use official shadcn/ui components for forms, alerts, badges, dialogs, avatars, skeletons, and other shared UI
- add components to the repo via the shadcn CLI instead of hand-rolling every control with raw Tailwind classes
- avoid describing the frontend as “just Tailwind” because that is not the intended architecture here

## Data Model

The current schema includes:

- `Organisation`
- `Member`
- `Photo`
- `Role`

Photos are indexed by `orgId`, `x`, and `y` for later wall queries.

## Verification

The current repo passes:

```bash
npm run typecheck
npm run build
npx prisma migrate dev
```

## Deployment

Netlify is the intended deployment target. Before deploying, set the same environment variables there and swap `DATABASE_URL` from local Postgres to Neon.
