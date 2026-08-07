# NComputing India — marketing site, ordering portal and admin dashboard

A three-part project built around one NComputing product line: a marketing site that
explains desktop virtualisation to a non-technical Indian buyer, an ordering portal with
Razorpay checkout, and an internal dashboard for orders and leads.

```
ncomputing/
├── backend/    Express + TypeScript + Prisma API
└── frontend/   Next.js 14 (App Router) + Tailwind
```

## Running it locally

You need Node 20+ and a PostgreSQL database. Either use Neon (what the deployment uses)
or start a local one with `docker compose up -d`.

**1. Backend**

```bash
cd backend
cp .env.example .env      # then fill in DATABASE_URL and JWT_SECRET
npm install
npx prisma db push        # create the tables
npm run seed              # 3 products + an admin and a customer account
npm run dev               # http://localhost:4000
```

**2. Frontend** (in a second terminal)

```bash
cd frontend
cp .env.example .env.local   # JWT_SECRET must match the backend exactly
npm install
npm run dev                  # http://localhost:3000
```

### Seeded accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@ncomputing.in` | `Admin@12345` |
| Customer | `ravi@sunrisepublicschool.in` | `Buyer@12345` |

### Test payments

With Razorpay in test mode, card `4111 1111 1111 1111`, any future expiry, any CVV.

To exercise the webhook locally, expose the API and point a Razorpay webhook at
`https://<your-tunnel>/api/payments/webhook` for the `payment.captured` event.

## How authentication works

Three layers, deliberately:

1. **`frontend/src/middleware.ts`** — redirects anonymous users away from `/account`,
   `/checkout` and `/admin`, and non-admins away from `/admin`. This is UX, not security.
2. **`backend/src/middlewares/auth.ts`** — `requireAuth` and `requireRole('ADMIN')` guard
   every protected route. This is the real boundary; the API is reachable directly.
3. **Ownership checks in the services** — a signed-in `USER` can only read their own
   orders even with a perfectly valid token, because middleware cannot see the data.

The token itself never touches client-side JavaScript. The API signs a JWT; the Next.js
app stores it in an httpOnly cookie on its own origin and replays it as a Bearer header
through `frontend/src/app/api/[...path]/route.ts`. That keeps the session readable by
Next.js middleware without the frontend and API having to share a parent domain, and
makes every browser request same-origin.

## Notes on a few decisions

- **Money is integer paise everywhere.** Floats are never used for currency.
- **The server prices every order.** The browser sends product ids, quantities and option
  ids; the API looks up what those cost. A tampered cart in localStorage achieves nothing.
- **Orders are created before payment.** An abandoned checkout leaves a `PENDING` order
  rather than no record at all.
- **Payment confirmation is idempotent.** The browser callback and the Razorpay webhook
  both funnel through one function, so a duplicate never sends a second receipt.
- **Product marketing copy lives in `frontend/src/content/why.ts`,** not the database.
  It is prose that gets rendered, never queried — so it belongs in code review, not a CMS.

## Deployment

- **Frontend → Vercel.** Set `API_URL` and `JWT_SECRET`.
- **Backend → Render / Railway.** Build `npm run build`, start `npm start`. Set
  `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, and the Razorpay/Resend keys.
- **Database → Neon.**

`JWT_SECRET` must be identical on both sides.
