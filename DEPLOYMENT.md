# Deployment guide — self-hosted Docker

For managed platforms (Vercel, Render/Railway, Neon) instead of running your
own server, see [`DEPLOYMENT_CLOUD.md`](DEPLOYMENT_CLOUD.md) instead — it's a
different setup, not a continuation of this one.

Production is five containers on one Docker host, driven by
[`docker-compose.prod.yml`](docker-compose.prod.yml):

```
                 ┌────────┐
  browser ─443──▶│ caddy  │──/──────▶ web (Next.js, :3000)
                 │  :443  │──/api/*─▶ http_server (Express, :4000)
                 └────────┘──/health┘
                                        │            │
                                    postgres:5432  redis:6379
                                                        ▲
                                                        │
                                                    worker (BullMQ,
                                                    sends email via Resend)
```

`caddy` terminates TLS for `$DOMAIN` and puts `web` and `http_server` on one
public origin — required because `CORS_ORIGIN` and `NEXT_PUBLIC_API_URL` both
assume a single `https://` origin, and neither app container does TLS itself.
`worker` has no public port; it only consumes the `email` queue in Redis that
`http_server` enqueues jobs onto (order confirmations, lead notifications).

## 1. Prerequisites

- A Linux host with Docker Engine + the Compose plugin (`docker compose version`).
- A domain's DNS **A record pointed at the host's public IP** before you start
  Caddy — it requests a Let's Encrypt certificate on first boot and needs that
  record to already resolve.
- Ports 80 and 443 open inbound (Let's Encrypt's HTTP-01 challenge uses 80;
  Caddy redirects it to 443 afterwards).
- Live Razorpay keys and a Resend API key (see §4 below for the email caveat).

## 2. Get the code and configure it

```bash
git clone <this-repo-url> ncomputing
cd ncomputing
cp .env.example .env
```

Fill in `.env` — this is what `docker-compose.prod.yml` reads for every
`${VAR}` substitution:

| Variable | Notes |
|---|---|
| `DOMAIN` | Bare hostname, no protocol — e.g. `shop.ncomputing.in` |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Not defaulted to the dev placeholders in production |
| `JWT_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | Live-mode keys from the Razorpay dashboard |
| `RESEND_API_KEY` | See §4 |
| `MAIL_FROM` | See §4 |
| `LEAD_NOTIFY_TO` | Internal inbox that gets a copy of every new lead. Empty = skipped |

Per-app `.env`/`.env.example` files (`apps/http_server`, `apps/worker`,
`apps/web`, `packages/db`) are for local `pnpm dev` only — the Docker build
strips them (`rm -f .env apps/*/.env ...`) so nothing in them leaks into the
image, and the values above are what actually reach the containers.

## 3. First boot

```bash
docker compose -f docker-compose.prod.yml up -d --build postgres redis
```

Wait for both to report healthy (`docker compose -f docker-compose.prod.yml ps`),
then push the schema — this project uses `prisma db push` rather than tracked
migrations (there's no `prisma/migrations` directory), so this is also the
command you'd re-run after a schema change:

```bash
docker compose -f docker-compose.prod.yml run --rm \
  -e DATABASE_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@postgres:5432/$POSTGRES_DB?schema=public" \
  http_server sh -c "cd /app && pnpm --filter @repo/db db:push"
```

Registration always creates a `USER`, so promote your own account to admin
directly in the database once you've signed up through the site:

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'you@example.com';"
```

Now bring up everything else:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Caddy will request its certificate on first start; watch for it:

```bash
docker compose -f docker-compose.prod.yml logs -f caddy
```

## 4. Email — read this before assuming it works

Resend's shared `onboarding@resend.dev` sender **only delivers to the email
address of your own Resend account** — it will silently reject mail to anyone
else. To send order confirmations and lead acknowledgements to real
customers:

1. Verify a domain at [resend.com/domains](https://resend.com/domains) (add
   the DNS records it gives you).
2. Set `MAIL_FROM` to an address on that domain, e.g.
   `"NComputing India <orders@ncomputing.in>"`.

Until a domain is verified, mail only reaches whatever address
`LEAD_NOTIFY_TO` (or your own Resend account address) is set to — useful for
testing, not a substitute for the real fix.

## 5. Verify

```bash
curl -I https://$DOMAIN/health          # -> 200, from http_server via Caddy
curl -I https://$DOMAIN/                # -> 200, from web
docker compose -f docker-compose.prod.yml ps          # all "healthy" / "running"
docker compose -f docker-compose.prod.yml logs worker  # "Worker started, listening on the email queue"
```

Then walk the golden path once for real: register an account, place a test
order with Razorpay in live mode (a small real amount, refundable from the
Razorpay dashboard) or point `RAZORPAY_*` at test-mode keys first if you'd
rather not, and submit the "Talk to sales" lead form — confirm both the order
confirmation and the lead alert actually land.

Point the Razorpay webhook (dashboard → Webhooks) at
`https://$DOMAIN/api/payments/webhook` for the `payment.captured` event —
without it, payments only confirm via the browser callback, with no
server-side fallback if the customer closes the tab mid-flow.

## 6. Redeploying after a change

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build <service...>
```

Omit `<service...>` to rebuild everything, or name specific services
(`web`, `http_server`, `worker`) to rebuild only what changed. If the change
touched `packages/db/prisma/schema.prisma`, re-run the `db:push` command from
§3 before restarting `http_server`/`worker`.

## 7. Backups

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > backup-$(date +%F).sql.gz
```

Automate this off-host (cron + object storage) — `postgres_data_prod` is a
local Docker volume with no replication.

## 8. Hardening to consider

- `postgres` (5432) and `redis` (6379) currently publish directly to the host
  in `docker-compose.prod.yml`, reachable from the public internet unless the
  host firewall blocks them. Nothing in the app needs them exposed —
  `http_server` and `worker` reach both over the internal Docker network by
  service name. Unless you specifically need external DB access, drop the
  `ports:` blocks for both, or at minimum firewall 5432/6379 to your own IP.
- Rotate `JWT_SECRET` invalidates every logged-in session — expect complaints
  if you do it on a live site.
