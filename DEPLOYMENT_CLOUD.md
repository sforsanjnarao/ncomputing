# Deployment guide — managed platforms (Vercel + Render/Railway + Neon)

An alternative to [`DEPLOYMENT.md`](DEPLOYMENT.md) (single Docker host with
Caddy). No servers to patch, no TLS certs to renew — four managed services
instead:

| Piece | Where | Why |
|---|---|---|
| `apps/web` (Next.js) | **Vercel** | Built for Next.js specifically |
| `apps/http_server` (Express API) **+ the email worker, in-process** | **Render** — Web Service | Needs to stay running, not a serverless function. See below for why the worker rides along here instead of its own deployment |
| Postgres | **Neon** | You already named it |
| Redis | **Upstash** | Still needed even with the worker in-process — BullMQ's queue lives in Redis regardless of who's consuming it |

`apps/worker` exists as its own deployable app (used by the self-hosted Docker
path in `DEPLOYMENT.md`, where a dedicated container costs nothing extra),
but on managed platforms a *dedicated* background-worker service is either
paid outright (Render: $7/mo minimum, no free tier) or billed separately
enough to be its own thing to manage (Railway). Neither is worth it for a
queue this small, so `http_server` runs the same consumer logic in its own
process instead — one `EMBED_EMAIL_WORKER=true` env var, no second service,
no second provider, no cross-provider Redis-URL mismatch to get wrong. See
[`emailWorker.ts`](apps/http_server/src/emailWorker.ts) — it's the exact same
job-processing logic as `apps/worker/src/index.ts`, just started from
`index.ts` instead of deployed on its own. The flag defaults to **off**, so
this doesn't change anything for the Docker or Render+Railway paths — it's
purely additive.

If you'd rather isolate the worker onto its own service anyway (more headroom
if the queue ever gets busy, or you just prefer the separation), that's still
fully supported — see the collapsed note at the end of §3 for the Railway or
paid-Render version.

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
3. **Root `package.json` had no upper bound on Node** (`>=18`). Left alone,
   Render picked the newest available runtime — 26.7.0, a line Prisma
   explicitly hasn't signed off on (`Prisma only supports Node.js versions
   20.19+, 22.12+, 24.0+`) and nothing in this repo has ever run on. Pinned to
   `>=20.19.0 <21.0.0` — the line the Docker images (`node:20-alpine`) and
   local dev already use.

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

## 3. Render — `http_server` (Web Service, email worker included)

New Web Service → connect the repo.

- **Root Directory**: leave as repo root (it's a pnpm/turbo monorepo — the
  build needs to see `pnpm-workspace.yaml`).
- **Build Command**:
  ```bash
  npm i -g pnpm && NODE_ENV=development pnpm install --frozen-lockfile && pnpm exec turbo run build --filter=http_server...
  ```
  (`--filter=http_server...` also builds `@repo/db` and `@repo/types`, its
  workspace dependencies — same command the existing `docker/Dockerfile.http`
  uses. Two Render-specific things baked into this command, not obvious from
  reading it: `corepack enable` fails here — Render's build filesystem has
  `/usr/bin` read-only, so corepack can't write its `pnpm` symlink, hence
  `npm i -g pnpm` instead. And Render sets `NODE_ENV=production` for the
  build step, which makes pnpm skip `devDependencies` — silently dropping
  `turbo` itself, since it's a devDependency. `NODE_ENV=development` for just
  the install step fixes that without touching the app's actual runtime
  `NODE_ENV`, which Render sets separately and which the app correctly
  depends on.)
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
  | `RESEND_API_KEY` | From resend.com/api-keys |
  | `MAIL_FROM` | See §6 — placeholder until a domain is verified |
  | `LEAD_NOTIFY_TO` | Internal inbox for new-lead alerts |
  | `EMBED_EMAIL_WORKER` | `true` — starts the BullMQ consumer inside this same process ([`emailWorker.ts`](apps/http_server/src/emailWorker.ts)) instead of needing a separate worker deployment |

  Don't set `PORT` — Render injects it, and `index.ts` already reads
  `process.env.PORT`.

Once deployed, check the logs for **both** `Server started on port ...` and
`Email worker started in-process, listening on the email queue` — if only the
first one shows up, `EMBED_EMAIL_WORKER` isn't set to exactly `true`.

Note the public URL Render gives you (e.g. `https://ncomputing-api.onrender.com`)
— you'll need it for §4 and §5. Point the Razorpay webhook (dashboard →
Webhooks) at `https://<that-url>/api/payments/webhook` for the
`payment.captured` event.

<details>
<summary>Prefer a dedicated worker service instead? (Railway, or paid Render)</summary>

Leave `EMBED_EMAIL_WORKER` unset on `http_server` and deploy `apps/worker` on
its own — useful if the queue ever gets busy enough to want separate scaling,
or you just prefer the isolation.

**Railway** (usage-billed, no free/paid split like Render's):
1. New Project → Deploy from GitHub repo → this repo.
2. If Railway's monorepo picker offers to scope the service to one app
   folder, skip it — set **Root Directory to `/`** (repo root) instead, so
   the build can see `pnpm-workspace.yaml` and compile `@repo/db`/`@repo/types`
   first via turbo. Railway's per-package auto-detection for this exact
   pnpm+turbo shape has open bug reports — don't rely on it.
3. Build Command: `npm i -g pnpm && NODE_ENV=development pnpm install --frozen-lockfile && pnpm exec turbo run build --filter=worker...`
   (Nixpacks has first-class corepack support, so §3's Render-specific
   `corepack enable` failure doesn't apply here — same command anyway, since
   it's already proven to work.)
4. Start Command: `pnpm --filter worker start`
5. Settings → Networking: leave empty — no domain, no port. That absence is
   what makes it a background service on Railway.
6. Variables: `DATABASE_URL` (same Neon string), `REDIS_URL` (**the exact
   same** Upstash string `http_server` uses — a mismatch here means jobs
   vanish into a queue nothing is listening to, with no error anywhere),
   `RESEND_API_KEY`, `MAIL_FROM`, `LEAD_NOTIFY_TO`.

Check the logs for `Worker started, listening on the email queue` with
**nothing else after it** — on Railway, that clean output (no port-scan
noise) is what confirms it's configured as a background service correctly.

**Render** (New → **Background Worker**, not Web Service — that mismatch is
what causes a crash-loop, since a Web Service expects a bound port and a
worker never opens one): same Build/Start commands as `http_server` above but
with `--filter=worker...`, same variable list as the Railway table, minus
`EMBED_EMAIL_WORKER`. $7/mo minimum, no free tier.
</details>

## 4. Vercel — `web`

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
  Vercel's own pnpm install step doesn't hit the `NODE_ENV=production` /
  missing-`turbo` problem from §3 — if it ever does, prefix with
  `NODE_ENV=development pnpm install --frozen-lockfile &&` the same way.
- **Environment Variables**:

  | Key | Value |
  |---|---|
  | `NEXT_PUBLIC_API_URL` | The Render `http_server` URL from §3 |
  | `API_URL` | Same URL — there's no private network between Vercel and Render, so server components hit the same public URL the browser does |

Redeploy once `CORS_ORIGIN` on Render actually matches the Vercel URL Vercel
assigns you (chicken-and-egg on the very first deploy — deploy once to get
the URL, set `CORS_ORIGIN`, redeploy `http_server`).

## 5. Verify

```bash
curl -I https://<render-http-server-url>/health   # -> 200
```

Then for real: open the Vercel URL, register an account, place a test order
(Razorpay test-mode keys recommended for this pass), and submit the "Talk to
sales" lead form. Confirm login persists across a page reload (that's the
cookie fix from §0 actually working) and that both emails arrive.

## 6. Email — same caveat as the Docker guide

Resend's shared `onboarding@resend.dev` sender only delivers to your own
Resend account address. Verify a domain at resend.com/domains and point
`MAIL_FROM` at it before expecting real customers to receive anything.

## Moving `http_server` to Railway too

If you'd rather run `http_server` (worker embedded, same as §3) on Railway
instead of Render: same Build/Start commands, Railway auto-injects `PORT` the
same way Render does, same environment variables including
`EMBED_EMAIL_WORKER=true`. Railway also offers its own Redis plugin (one
click, gives you a `REDIS_URL` directly) if you'd rather not add Upstash as a
separate vendor on top.
