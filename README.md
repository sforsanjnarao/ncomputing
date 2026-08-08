# NComputing India — Platform & Portal

A complete web solution for NComputing India featuring a marketing site, ordering portal with Razorpay checkout, background email processing, lead capture with automatic visitor intent tracking, and an internal admin dashboard.

---

## 🏗️ Repository Architecture

This project is structured as a **Turborepo + pnpm monorepo**:

```text
ncomputing/
├── apps/
│   ├── web/            Next.js 14 (App Router) + Tailwind CSS (Frontend)
│   ├── http_server/    Express + TypeScript REST API (Backend)
│   └── worker/         BullMQ background worker for email queues
└── packages/
    ├── db/             @repo/db — Prisma schema, PostgreSQL client & migrations
    ├── types/          @repo/types — Shared TypeScript interfaces & DTOs
    ├── typescript-config/
    └── eslint-config/
```

---

## ⚡ Quick Start (Local Setup)

### Prerequisites
- **Node.js**: `>= 20.19.0`
- **pnpm**: `pnpm` package manager installed (`npm i -g pnpm`)
- **PostgreSQL**: Local database or Neon connection string
- **Redis**: Local Redis instance or Upstash URL (for background queues)

### 1. Installation & Environment Setup

Clone the repository and install dependencies:

```bash
pnpm install
```

Copy the example environment files:

```bash
cp apps/http_server/.env.example apps/http_server/.env
cp apps/web/.env.example apps/web/.env.local
cp packages/db/.env.example packages/db/.env
```

*Update the `.env` files with your local PostgreSQL credentials, Redis URL, JWT Secret, and Razorpay Sandbox keys.*

### 2. Database Initialization

Generate the Prisma client and push the schema to your database:

```bash
pnpm --filter @repo/db build
pnpm --filter @repo/db db:push
```

Seed initial product data (optional):

```bash
pnpm --filter @repo/db seed
```

### 3. Run Development Servers

Start all applications (web app on `:3000`, API on `:4000`) simultaneously:

```bash
pnpm dev
```

---

## ✨ Key Features

- **Marketing Website**: Includes interactive savings calculator, product comparisons, and responsive design.
- **Ordering Portal**: Cart management, server-side price validation (paise precision), checkout flow, and **Razorpay** sandbox payment integration.
- **Visitor Intent Tracking & CRM**: Anonymous visitor cookie tracking (page views, cart additions, checkout steps) with automatic lead scoring and contact prompts.
- **Admin Dashboard**: Real-time order management, status updates (Pending, Processing, Shipped, Delivered), and lead tracking with visitor activity history.
- **Asynchronous Email Queue**: **BullMQ + Redis + Resend** for non-blocking email receipts and lead notifications.

---

## 🤝 Contribution Guide

We welcome contributions! Please follow these guidelines to get started:

### 1. Branch Naming Convention
- `feat/feature-name` for new features
- `fix/bug-description` for bug fixes
- `docs/update-info` for documentation changes

### 2. Development Workflow
1. Fork the repo and create a new branch from `main`.
2. Ensure code is typed cleanly and follows existing workspace patterns.
3. Keep code clean and self-explanatory.
4. Verify local build and linting before committing:

```bash
pnpm build
pnpm lint
```

### 3. Submitting Pull Requests
- Open a PR against the `main` branch.
- Include a clear title and description explaining what changed and why.
- Provide screenshots or recordings for UI changes.

---

## 🚀 Deployment

- **Cloud Platform Setup**: See [`DEPLOYMENT_CLOUD.md`](DEPLOYMENT_CLOUD.md) for deploying to Vercel (web), Render/Railway (API & worker), and Neon (PostgreSQL).
- **Self-Hosted Docker**: See [`DEPLOYMENT.md`](DEPLOYMENT.md) for single-instance deployment using Docker Compose & Caddy.

---

## 📄 License

This repository is maintained for NComputing India assessment and development purposes.
