# NComputing India — marketing site, ordering portal and admin dashboard

A three-part project built around one NComputing product line: a marketing site that
explains desktop virtualisation to a non-technical Indian buyer, an ordering portal with
Razorpay checkout, and an internal dashboard for orders and leads.

This is a **Turborepo + pnpm** monorepo:

```
ncomputing/
├── apps/
│   ├── http_server/   Express + TypeScript API (layered: controllers/routes/zod/middleware)
│   └── web/           Next.js 14 (App Router) + Tailwind
└── packages/
    ├── db/                @repo/db — Prisma schema, generated client, pg-adapter singleton
    ├── types/             @repo/types — shared constants + DTO types
    ├── typescript-config/  @repo/typescript-config
    └── eslint-config/      @repo/eslint-config
```

## Running it locally

You need Node 20.19+ (for `require(ESM)`) and a PostgreSQL database — Neon, or a local one
via `docker compose up -d`.

```bash
pnpm install

# 1. Point the API and the db package at your database
cp apps/http_server/.env.example apps/http_server/.env   # fill DATABASE_URL + JWT_SECRET
cp packages/db/.env.example packages/db/.env             # same DATABASE_URL

# 2. Build the shared packages and create the tables (no seed data)
pnpm --filter @repo/db build
pnpm --filter @repo/db db:push

# 3. Run everything
pnpm dev            # turbo runs http_server (:4000) and web (:3000)
```

The web app reads `NEXT_PUBLIC_API_URL` (browser) and `API_URL` (server components);
both default to `http://localhost:4000`. Copy `apps/web/.env.example` to
`apps/web/.env.local` to override.

> The first admin is created by a direct DB change — registration always yields a `USER`.

### Test payments

With Razorpay in test mode: card `4111 1111 1111 1111`, any future expiry, any CVV.
To exercise the webhook locally, expose the API and point a Razorpay webhook at
`https://<your-tunnel>/api/payments/webhook` for the `payment.captured` event.

## How authentication works

Two layers, deliberately:

1. **Client route guards** — `apps/web/src/app/(protected)/layout.tsx` redirects anonymous
   users away from `/account` and `/checkout`, and the admin layout sends non-admins away
   from `/admin`. This is UX, not security.
2. **`apps/http_server/src/middleware/protected.ts`** — `protectMiddleware` and
   `requireRole('ADMIN')` guard every protected route, and controllers enforce ownership
   (a `USER` can only read their own orders even with a valid token). This is the real
   boundary; the API is reachable directly.

The API signs a JWT and sets it as an **httpOnly cookie** on its own origin. The browser
calls the API directly with `credentials: "include"` (CORS allows the web origin), so the
cookie travels on every request and client-side JavaScript can never read it. In
production the cookie is `SameSite=None; Secure`, so `CORS_ORIGIN` must list the web origin.

## Notes on a few decisions

- **Money is integer paise everywhere.** Floats are never used for currency.
- **The server prices every order.** The browser sends product ids, quantities and option
  ids; the API looks up what those cost. A tampered cart in localStorage achieves nothing.
- **Orders are created before payment.** An abandoned checkout leaves a `PENDING` order
  rather than no record at all.
- **Payment confirmation is idempotent.** The browser callback and the Razorpay webhook
  both funnel through one function, so a duplicate never sends a second receipt.
- **Product marketing copy lives in `apps/web/src/content/why.ts`,** not the database.

## Deployment

`docker-compose.prod.yml` builds and runs `postgres + http_server + web` (see
`docker/Dockerfile.http` and `docker/Dockerfile.web`). Set `DOMAIN`, `JWT_SECRET`, the
Postgres credentials, and the Razorpay/Resend keys in the environment. `CORS_ORIGIN` /
`NEXT_PUBLIC_API_URL` must point at the public domain.
