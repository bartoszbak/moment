# Moment

An async team photo wall for remote organisations. Sign in with your work Google account, take a photo, and appear on a shared infinite canvas with your whole company.

## Stack

Next.js 15 · TypeScript · shadcn/ui · Auth.js (Google OAuth) · Prisma · Neon Postgres · Cloudinary · Netlify

## Getting Started

```bash
npm install
npx prisma migrate dev
npm run dev
```

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

## How It Works

- Sign in with Google → domain matched to your organisation
- No org for your domain yet? Create one — you become the owner
- Take a photo, add your name and team → it drops on the shared wall
- Pan and zoom the infinite canvas to find your teammates

## Deployment

Connected to Netlify via GitHub. Every push to `main` deploys automatically.