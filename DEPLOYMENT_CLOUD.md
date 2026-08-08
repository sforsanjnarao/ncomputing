# Deployment guide — managed platforms (Vercel + Render/Railway + Neon)

An alternative to [`DEPLOYMENT.md`](DEPLOYMENT.md) (single Docker host with
Caddy). No servers to patch, no TLS certs to renew — four managed services
instead:

| Piece | Where | Why |
|---|---|---|
| `apps/web` (Next.js) | **Vercel** | Built for Next.js specifically |
| `apps/http_server` (Express API) | **Render** — Web Service | Needs to stay running, not a serverless function |
| `apps/worker` (BullMQ consumer) | **Render** — Background Worker | Same reason, no public port needed |
| Postgres | **Neon** | You already named it |
| Redis | **Upstash** | Works from any of the above with one TLS URL; not tied to whichever host runs the API |

Railway works as a drop-in swap for Render — same two services (one with a
public port, one without), see the note at the end.

## Two code changes this deployment needed (already applied)

Splitting the app across separate domains — `*.vercel.app` and
`*.onrender.com` instead of one `$DOMAIN` behind a single proxy — broke two
assumptions the code made about staying on one origin:

1. **The login cookie was `SameSite=Lax`.** That's fine when the browser only
   ever talks to one origin, but browsers refuse to attach a `Lax` cookie to a
   cross-site request — so the API would issue the cookie and the web app
   would silently never see it again. Fixed in
   [`user.controller.ts`](apps/http_server/src/controllers/user.controller.ts:14):
   `SameSite=None; Secure` in production, still `Lax` for local `http://localhost` dev
   (`None` requires HTTPS, which localhost doesn't have).
2. **Redis only accepted a bare `host`/`port`.** Upstash/Railway/Render Redis
   all hand out one `rediss://user:pass@host:port` URL instead. Both
   [`http_server/src/redis.ts`](apps/http_server/src/redis.ts) and
   [`worker/src/redis.ts`](apps/worker/src/redis.ts) now use `REDIS_URL` when
   it's set, falling back to `REDIS_HOST`/`REDIS_PORT` for local dev.

## 1. Neon (Postgres)

1. Create a project at neon.tech. Copy the **pooled** connection string
   (the one with `-pooler` in the hostname) — that's `DATABASE_URL`
   everywhere below. It already includes `?sslmode=require`, which is all
   `packages/db` needs (plain `pg` + `@prisma/adapter-pg`, no special
   serverless driver required).
2. Push the schema once, from your machine, pointed at Neon:
   ```bash
   DATABASE_URL="<neon-pooled-url>" pnpm --filter @repo/db db:push
   ```
   (This project uses `prisma db push`, not tracked migrations — there's no
   `prisma/migrations` directory. Re-run this after any schema change.)
3. Register your own account through the deployed site once it's live, then
   promote it to admin — registration always creates a `USER`:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
   ```
   Run it from Neon's SQL editor in the dashboard, or `psql "<neon-url>"`.

## 2. Upstash (Redis)

1. Create a Redis database at upstash.com — pick a region close to wherever
   Render/Railway runs (US-East or similar, whatever they offer).
2. Copy the **`rediss://` connection string** (not the REST API URL — this
   project uses `ioredis`/BullMQ, which needs the Redis protocol one). That's
   `REDIS_URL` below.

## 3. Render — `http_server` (Web Service)

New Web Service → connect the repo.

- **Root Directory**: leave as repo root (it's a pnpm/turbo monorepo — the
  build needs to see `pnpm-workspace.yaml`).
- **Build Command**:
  ```bash
  corepack enable && pnpm install --frozen-lockfile && pnpm exec turbo run build --filter=http_server...
  ```
  (`--filter=http_server...` also builds `@repo/db` and `@repo/types`, its
  workspace dependencies — same command the existing `docker/Dockerfile.http`
  uses.)
- **Start Command**: `pnpm --filter http_server start`
- **Environment**:

  | Key | Value |
  |---|---|
  | `DATABASE_URL` | Neon pooled connection string |
  | `REDIS_URL` | Upstash `rediss://` string |
  | `JWT_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
  | `CORS_ORIGIN` | Your Vercel URL, e.g. `https://ncomputing.vercel.app` |
  | `NODE_ENV` | `production` |
  | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | Live-mode keys |

  Don't set `PORT` — Render injects it, and `index.ts` already reads
  `process.env.PORT`.

Once deployed, note the public URL Render gives you (e.g.
`https://ncomputing-api.onrender.com`) — you'll need it for §5 and §6. Point
the Razorpay webhook (dashboard → Webhooks) at
`https://<that-url>/api/payments/webhook` for the `payment.captured` event.

## 4. Render — `worker` (Background Worker)

New Background Worker → same repo. A Background Worker has no public URL and
no health-check port, which matches `apps/worker` exactly — it only consumes
the `email` queue in Redis.

- **Build Command**:
  ```bash
  corepack enable && pnpm install --frozen-lockfile && pnpm exec turbo run build --filter=worker...
  ```
- **Start Command**: `pnpm --filter worker start`
- **Environment**:

  | Key | Value |
  |---|---|
  | `DATABASE_URL` | Same Neon string |
  | `REDIS_URL` | Same Upstash string |
  | `RESEND_API_KEY` | From resend.com/api-keys |
  | `MAIL_FROM` | See §7 — placeholder until a domain is verified |
  | `LEAD_NOTIFY_TO` | Internal inbox for new-lead alerts |

Check Render's current pricing for Background Workers before committing —
some platforms don't offer an always-on worker process on their free tier,
since (unlike a Web Service) it can't be idled between requests.

## 5. Vercel — `web`

Import the repo, then in Project Settings:

- **Root Directory**: `apps/web`. Vercel detects `pnpm-workspace.yaml` at the
  repo root automatically and installs the whole workspace, not just
  `apps/web`.
- **Framework Preset**: Next.js (auto-detected).
- **Build Command** (override the default — `web` depends on `@repo/types`,
  which must be compiled first):
  ```bash
  cd ../.. && pnpm exec turbo run build --filter=web...
  ```
- **Environment Variables**:

  | Key | Value |
  |---|---|
  | `NEXT_PUBLIC_API_URL` | The Render `http_server` URL from §3 |
  | `API_URL` | Same URL — there's no private network between Vercel and Render, so server components hit the same public URL the browser does |

Redeploy once `CORS_ORIGIN` on Render actually matches the Vercel URL Vercel
assigns you (chicken-and-egg on the very first deploy — deploy once to get
the URL, set `CORS_ORIGIN`, redeploy `http_server`).

## 6. Verify

```bash
curl -I https://<render-http-server-url>/health   # -> 200
```

Then for real: open the Vercel URL, register an account, place a test order
(Razorpay test-mode keys recommended for this pass), and submit the "Talk to
sales" lead form. Confirm login persists across a page reload (that's the
cookie fix from §0 actually working) and that both emails arrive.

## 7. Email — same caveat as the Docker guide

Resend's shared `onboarding@resend.dev` sender only delivers to your own
Resend account address. Verify a domain at resend.com/domains and point
`MAIL_FROM` at it before expecting real customers to receive anything.

## Using Railway instead of Render

Railway's model is close enough that the settings translate directly:

- `http_server` → a Railway service with the same build/start commands,
  Railway auto-injects `PORT` the same way.
- `worker` → a Railway service with the same build/start commands but **no
  exposed port** (don't set one in Railway's networking tab) — that's what
  makes it a background service instead of a web one.
- Same environment variables in both cases.
- Railway also offers its own Redis plugin (one click, gives you a
  `REDIS_URL` directly) if you'd rather not add Upstash as a fourth vendor.
