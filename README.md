# Moment

An async team photo wall for remote organisations. Sign in with your work Google account, take a photo, and appear on a shared infinite canvas with your whole company.

## Stack

Next.js 15 · TypeScript · shadcn/ui · Auth.js (Google OAuth) · Prisma ORM 7 · PostgreSQL · Cloudinary · Netlify

## Runtime

Node.js 24 is required. The repo is pinned via [.node-version](/Users/bartbak/Repo/moment/.node-version).

## Getting Started

```bash
npm install
npx prisma migrate dev
npm run dev
```

## Local Database

The repo is set up to use a native local PostgreSQL database in development.

```bash
createdb moment
```

On this machine, PostgreSQL tools are available through Postgres.app, and the default local connection string is already set in [.env.local](/Users/bartbak/Repo/moment/.env.local):

```bash
DATABASE_URL=postgresql://bartbak@localhost:5432/moment?schema=public
```

If you ever need to recreate the database:

```bash
dropdb moment
createdb moment
```

Useful commands:

```bash
npx prisma studio
psql moment
```

Prisma CLI loads `DATABASE_URL` from [.env](/Users/bartbak/Repo/moment/.env). Next.js uses [.env.local](/Users/bartbak/Repo/moment/.env.local), so keep the local database URL in both files.

## Environment Variables

```bash
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

For local development, `DATABASE_URL` should point to your native local Postgres instance. For production, replace it with your Neon connection string.

## How It Works

- Sign in with Google → domain matched to your organisation
- No org for your domain yet? Create one — you become the owner
- Take a photo, add your name and team → it drops on the shared wall
- Pan and zoom the infinite canvas to find your teammates

## Deployment

Connected to Netlify via GitHub. Every push to `main` deploys automatically.
