# 📸 Faces

> An async team photo wall for remote organisations. Sign in with Google, snap your picture, drop it on an infinite canvas shared with your whole company.

---

## What It Does

Faces lets distributed teams see each other — literally. Every employee signs in with their work Google account, takes a photo, adds their name and team, and it appears on a shared infinite canvas that everyone in the organisation can explore. Supports up to 2,000 employees per organisation, with multiple organisations living side by side on the same platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| Auth | Auth.js v5 — Google OAuth provider |
| Database | Neon (serverless Postgres) |
| ORM | Prisma |
| File Storage | Cloudinary |
| Hosting | Netlify |
| CI/CD | GitHub → Netlify (automatic) |

---

## Project Structure

```
faces/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx              # Google Sign-In entry point
│   ├── (app)/
│   │   ├── onboarding/
│   │   │   └── page.tsx              # Create org or auto-join by domain
│   │   └── [orgSlug]/
│   │       ├── wall/
│   │       │   └── page.tsx          # Infinite photo wall
│   │       └── capture/
│   │           └── page.tsx          # Take your photo
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts          # Auth.js handler
│   │   ├── orgs/
│   │   │   └── route.ts              # Create / look up organisations
│   │   └── photos/
│   │       ├── route.ts              # List + create photos
│   │       └── [id]/
│   │           └── route.ts          # Single photo operations
│   └── layout.tsx
│
├── components/
│   ├── wall/
│   │   ├── InfiniteCanvas.tsx        # Core virtualised canvas
│   │   ├── PhotoCard.tsx             # Individual face card
│   │   ├── PhotoGrid.tsx             # Chunked grid renderer
│   │   └── WallControls.tsx          # Zoom, pan, search, filter
│   ├── capture/
│   │   ├── CameraCapture.tsx         # Webcam via MediaDevices API
│   │   ├── PhotoPreview.tsx          # Review before posting
│   │   └── PhotoForm.tsx             # Name + team fields
│   └── ui/                           # shadcn/ui components
│
├── lib/
│   ├── auth.ts                       # Auth.js config + Google provider
│   ├── prisma.ts                     # Prisma client singleton
│   ├── cloudinary.ts                 # Upload helpers
│   └── org.ts                        # Domain → org matching logic
│
├── prisma/
│   └── schema.prisma
│
├── netlify.toml
└── .env.local
```

---

## Data Model

```prisma
model Organisation {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique       // e.g. "acme-corp" → /acme-corp/wall
  domain    String   @unique       // e.g. "acme.com" — gate for auto-join
  createdAt DateTime @default(now())
  members   Member[]
  photos    Photo[]
}

model Member {
  id        String       @id @default(cuid())
  email     String       @unique
  name      String?
  orgId     String
  org       Organisation @relation(fields: [orgId], references: [id])
  role      Role         @default(MEMBER)   // OWNER | ADMIN | MEMBER
  photos    Photo[]
  createdAt DateTime     @default(now())
}

model Photo {
  id          String       @id @default(cuid())
  url         String                          // Cloudinary URL
  memberName  String                          // Display name on card
  team        String                          // e.g. "Design", "Engineering"
  memberId    String
  member      Member       @relation(fields: [memberId], references: [id])
  orgId       String
  org         Organisation @relation(fields: [orgId], references: [id])
  x           Int                             // Canvas x position
  y           Int                             // Canvas y position
  createdAt   DateTime     @default(now())
}

enum Role {
  OWNER
  ADMIN
  MEMBER
}
```

---

## Auth & Onboarding Flow

```
User clicks "Sign in with Google"
  ↓
Google OAuth returns user.email
  ↓
Extract domain from email (e.g. "acme.com")
  ↓
Domain matches existing org in DB?
  ├── YES → Auto-join as MEMBER → redirect to /acme-corp/wall
  └── NO  → Onboarding page
              → Enter organisation name
              → Slug auto-generated (e.g. "Acme Corp" → "acme-corp")
              → User becomes OWNER
              → redirect to /acme-corp/wall
```

**Domain is the access gate.** Only `@acme.com` email addresses can access `/acme-corp/wall`. This is enforced at the API layer via session checks on every request.

---

## Pages & Routes

| Route | Description | Access |
|---|---|---|
| `/` | Landing page — "Sign in with your work Google account" | Public |
| `/login` | Google OAuth trigger | Public |
| `/onboarding` | Create org or confirm domain auto-join | Authenticated |
| `/[orgSlug]/wall` | The infinite photo wall | Org members only |
| `/[orgSlug]/capture` | Take your photo | Org members only |
| `/[orgSlug]/settings` | Org admin panel | OWNER / ADMIN only |

---

## The Infinite Wall

The core UI challenge. Designed to handle 2,000+ photo cards performantly.

### Strategy: Virtualised Chunked Grid

- The canvas is divided into 400×400px logical chunks
- Only chunks within the current viewport + 1 buffer zone are rendered
- As the user pans, new chunks are fetched on demand via SWR
- Photos are assigned stable grid positions with subtle per-card rotation (±3°) for a natural feel
- Chunk coordinates are indexed in Postgres on `(x, y)` for fast spatial queries

### Photo Card

Each card displays:
- 📸 Circular photo crop
- Full name (bold)
- Team badge (colour-coded pill — consistent colour per team name)
- "Joined N days ago" timestamp
- Subtle drop shadow + slight random rotation

### Controls

- **Pan** — click and drag
- **Zoom** — scroll wheel or pinch on touch
- **Search** — find a colleague by name
- **Filter** — filter wall by team

---

## Capture Flow

```
/[orgSlug]/capture

1. CameraCapture     → Live webcam preview via MediaDevices API
2. Snap              → canvas.toBlob() → shown in PhotoPreview
3. Retake or confirm
4. PhotoForm         → Name (pre-filled from Google account), Team (searchable dropdown)
5. Submit            → Upload to Cloudinary → POST /api/photos → redirect to wall
                       → New card appears on the wall
```

Camera permission errors are handled gracefully with a shadcn `Alert` component.

---

## Performance at Scale (2,000 employees)

| Challenge | Solution |
|---|---|
| Rendering 2,000 cards | Viewport culling — only ~50–80 cards rendered at once |
| Image loading | Cloudinary CDN + lazy loading via IntersectionObserver |
| DB query speed | Spatial index on `(x, y, orgId)` columns |
| First load | Server-render initial viewport chunk |
| New photos appearing | Optimistic UI insert on the posting user's client |

---

## Key shadcn/ui Components

- `Button`, `Input`, `Label`, `Form` — auth and capture forms
- `Avatar` — photo cards
- `Badge` — team labels
- `Dialog` — expanded photo detail on click
- `Toast` — "Photo posted!" confirmation
- `Alert` — camera permission errors
- `Skeleton` — loading states for wall chunks
- `Command` — team search/select in the capture form
- `HoverCard` — quick profile peek on hover

---

## CI/CD: GitHub → Netlify

Netlify watches your GitHub repo directly. No workflow files needed.

```
git push origin main
  ↓
Netlify detects push automatically
  ↓
Runs: npm run build
  ↓
Deploys /dist to your .netlify.app URL
  ↓
Live in ~1 minute
```

Pull request preview deployments are automatic — every PR gets a unique preview URL.

### One-time Netlify setup

1. Connect your GitHub repo in the Netlify dashboard
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add all environment variables (see below)

---

## Environment Variables

```bash
# .env.local

# Auth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth (console.cloud.google.com)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Neon Postgres
DATABASE_URL=postgresql://...

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Build Phases

### Phase 1 — Foundation
- Next.js + TypeScript + shadcn/ui + Tailwind scaffold
- Prisma schema + Neon connection
- Auth.js with Google provider
- Domain extraction + org matching logic
- Onboarding flow (create org / auto-join)

### Phase 2 — Capture
- `CameraCapture` component (MediaDevices API)
- Photo preview + retake
- `PhotoForm` with team dropdown
- Cloudinary upload
- `POST /api/photos` — save to DB with canvas position

### Phase 3 — Wall MVP
- Static grid wall rendering
- `PhotoCard` component
- Basic pan and zoom
- Domain-gated access check

### Phase 4 — Infinite Canvas
- Chunk-based virtualisation
- SWR on-demand chunk fetching
- Smooth pan with momentum
- Zoom with focal point

### Phase 5 — Polish
- Name search
- Team filter
- Click-to-expand photo dialog
- Settings page for org admins (rename org, view member list)
- Mobile-responsive capture flow

---

## Local Development

```bash
# Install dependencies
npm install

# Set up the database
npx prisma migrate dev

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Licence

MIT
