# Faces

Async team photo wall for remote organisations. The intended product flow is: sign in with your work Google account, join or create your organisation, take a photo, and appear on a shared wall.

Frontend direction: this project should use official shadcn/ui components from https://ui.shadcn.com/, added to the repo as source code via the shadcn CLI.

## Current Status

This repo is partially implemented.

- Working now:
  - Next.js 15 app scaffold with App Router
  - Prisma ORM 7 on PostgreSQL
  - local Postgres development setup
  - Auth.js v5 beta with Google sign-in
  - organisation auto-join/create flow by email domain
  - capture UI with webcam, preview, retake, and member details form
  - Cloudflare R2 upload helper
  - `POST /api/photos` and `GET /api/photos`
  - org-gated wall and capture routes
  - stable photo placement coordinates in the database

- Still placeholder:
  - settings/admin surface
  - admin export/download actions for the wall
  - full photo dialog/detail interactions

## What To Do Next

Based on [BuildMe.md](/Users/bartbak/Repo/moment/BuildMe.md), the next sensible step is Phase 5 polish and admin actions on top of the current wall/canvas implementation.

Recommended order:

1. Add admin-only wall export actions.
2. Start with `Export viewport as PNG` for `OWNER` / `ADMIN`.
3. Add expanded photo dialog/detail interactions.
4. Add org settings/admin routes.
5. Refine mobile wall and capture UX.

Reason: the app now has auth, onboarding, uploads, and chunked canvas rendering. The highest-value missing pieces are admin workflows and polish.

## Stack

- Next.js 15
- TypeScript
- shadcn/ui from https://ui.shadcn.com/
- Tailwind CSS
- motion.dev
- Prisma ORM 7.6
- PostgreSQL
- Cloudflare R2
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
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

Notes:

- `DATABASE_URL` should point to local Postgres in development.
- replace it with Neon later for production.
- `R2_PUBLIC_URL` should be the public bucket URL or your custom image domain.
- R2 values are required for the current capture upload flow.
- Google OAuth values are required because auth is live.

## Current Route Status

| Route | Status | Notes |
|---|---|---|
| `/` | working | Landing page |
| `/login` | working | Real Google OAuth trigger |
| `/onboarding` | working | Auto-join or create org |
| `/[orgSlug]/capture` | working | Real capture flow with session-gated access |
| `/[orgSlug]/wall` | working | Chunked infinite canvas with search/filter/pan/zoom |
| `/api/auth/[...nextauth]` | working | Auth.js handlers |
| `/api/orgs` | working | Session-based org lookup/create |
| `/api/photos` | working | List + create photos |

## Frontend Standard

The frontend stack in this repo is:

- Next.js App Router
- shadcn/ui from `ui.shadcn.com`
- Tailwind CSS as the styling foundation under shadcn/ui
- motion.dev for animation

That means:

- use official shadcn/ui components for forms, alerts, badges, dialogs, avatars, skeletons, and other shared UI
- add components to the repo via the shadcn CLI instead of hand-rolling every control with raw Tailwind classes
- keep route transitions aligned with [agents.md](/Users/bartbak/Repo/moment/agents.md) so page content does not blink on first paint

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

Netlify is the intended deployment target. Before deploying, set the same environment variables there, swap `DATABASE_URL` from local Postgres to Neon, and make sure your R2 bucket is public through either an `r2.dev` URL or a custom domain.
