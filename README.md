# Dwellio — Housing & Roommate Platform (Frontend)

A production-style rental platform where **tenants** find verified rooms and shared flats, **owners** list properties and delegate them to **managers**, and **admins** moderate the marketplace — rent, deposits and utility bills are collected through **SSLCommerz** (sandbox).

This repository is the **Next.js 16 App Router frontend**. The backend is a separate Express / Prisma / PostgreSQL service that exposes a REST API under `/api/v1`; it is not vendored here.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Features](#features)
- [Routes](#routes)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Demo accounts](#demo-accounts)
- [Authentication & session](#authentication--session)
- [Payments (SSLCommerz)](#payments-sslcommerz)
- [API & data layer](#api--data-layer)
- [UI & conventions](#ui--conventions)
- [Scripts](#scripts)

---

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | [Next.js 16.3](https://nextjs.org) (App Router, Turbopack, React Compiler) |
| UI runtime | React 19 |
| Language | TypeScript (strict, no `any`) |
| Styling | Tailwind CSS v4 (CSS-first tokens in `src/app/globals.css`) |
| Components | [shadcn](https://ui.shadcn.com) `base-nova` built on [Base UI](https://base-ui.com) (not Radix) |
| Data fetching | [TanStack Query v5](https://tanstack.com/query) + [`ofetch`](https://github.com/unjs/ofetch) |
| Forms & validation | [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev) |
| Charts | [Recharts](https://recharts.org) |
| Auth | JWT in cookies (`jsonwebtoken`), verified in `src/proxy.ts` |
| Tooling | [Biome](https://biomejs.dev) (lint + format), `tsc --noEmit` |

---

## Features

### Public / guest
- **Marketing landing page** with a prefilled listing search form (`areaId`, `area`, `from`, `to`, `type`).
- **Search results** — every available room/flat for the selected area and dates, with rent, amenities and landlord verification. All filters live in the URL.
- **Listing detail** — gallery, description, availability-aware date picker, and an apply flow that redirects signed-out visitors back to login.
- **Account profile** — read-only account details plus an editable profile form.

### Tenant
- **Dashboard** of every application and its stay, with per-application status and a one-click **Withdraw** when the application is still actionable.
- **Application detail** bringing together the advertisement, stay, installments and maintenance:
  - **Rent invoices** unlocked one at a time (only the earliest due installment is payable) and all pending **utility bills** payable.
  - **Maintenance requests** — tenants can open a request once their stay is `CONFIRMED`, and track status/priority.

### Owner
- **Dashboard** with portfolio stats (properties, owned flats, confirmed stays, total collection), a property table and an add-property dialog.
- **Manage flats** — flat table (image, property, floor, beds/baths/area, room badges, assigned manager, status) with URL-driven search and property filter.
- **Flat detail** — cover image, details, manager assignment/revocation, image gallery management, room cards and add/edit room dialogs.

### Manager
- **Dashboard** scoped to the flats assigned to the signed-in manager, with active-ad and rent/utility collection stats.

### Shared Owner + Manager
- **Manage advertisements** — create (whole-flat or single-room), edit, and move through statuses (`DRAFT` → published; draft is never re-selectable), plus a per-advertisement applications dialog.
- **Manage applications** — server-paginated application table joined with stays; approve/reject decisions, stat cards, status/search filters and a detail sheet.
- **Manage maintenance** — priority/status desk with stat cards, status filter, search, and a detail sheet to set **status**, **scheduledFor** and **resolvedAt**.

### Admin
- **Admin dashboard** with role and inventory charts (Recharts), a users table, and inline status toggles (`ACTIVE` / `SUSPENDED`).
- **Manage areas** — tabbed cities/areas CRUD with search and filters.

### Cross-cutting
- Role-aware navigation for all four roles (`ADMIN`, `OWNER`, `MANAGER`, `TENANT`).
- Route-level skeletons (`loading.tsx`) and error boundaries (`error.tsx`) on every data-fetching route.
- All list state (search, sort, status, pagination, open drawer) is **URL-driven** via `useSearchParams`.
- Toast feedback for mutations and query failures; empty states everywhere.

---

## Routes

### Public

| Route | Description | Access |
| --- | --- | --- |
| `/` | Landing page + search entry point | Public |
| `/listings` | Available rooms/flats for the selected area & dates | Public |
| `/listings/[id]` | Listing detail + apply panel | Public (apply requires login) |
| `/profile` | Account details + profile form | Any signed-in user |
| `/logout` | Clears session cookies, redirects home | Public |
| `/payment/success/[transactionReference]` | SSLCommerz success landing (re-checks gateway status) | Public |
| `/payment/cancel` | Payment cancelled / declined | Public |
| `/payment/cancel/[transactionReference]` | Cancelled payment with reference | Public |

### Auth

| Route | Description | Access |
| --- | --- | --- |
| `/login` | Sign in, with one-click demo logins | Signed-out |
| `/register` | Create a tenant / owner / manager account | Signed-out |
| `/verify-email` | Verify email with `?email=` | Signed-out |

### Tenant

| Route | Description | Access |
| --- | --- | --- |
| `/tenant/dashboard` | Applications + stays overview, withdraw action | `TENANT` |
| `/tenant/application/[id]` | Application, stay, invoices and maintenance | `TENANT` |

### Owner

| Route | Description | Access |
| --- | --- | --- |
| `/owner/dashboard` | Portfolio stats + properties | `OWNER` |
| `/owner/manage-flats` | Flat table, add flat, room sheets | `OWNER` |
| `/owner/flats/[flatId]` | Flat detail, manager assignment, images, rooms | `OWNER` |

### Manager

| Route | Description | Access |
| --- | --- | --- |
| `/manager/dashboard` | Assigned flats + collection stats | `MANAGER` |

### Admin

| Route | Description | Access |
| --- | --- | --- |
| `/admin` | Stats, role/inventory charts, user moderation | `ADMIN` |
| `/manage-areas` | Cities & areas management | `ADMIN` |

### Shared (Owner + Manager)

| Route | Description | Access |
| --- | --- | --- |
| `/manage-advertisement` | Advertisements CRUD + status workflow | `OWNER`, `MANAGER` |
| `/manage-application` | Application review & decisions | `OWNER`, `MANAGER` |
| `/manage-maintenance` | Maintenance request triage & updates | `OWNER`, `MANAGER` |

Access is enforced by `src/proxy.ts` **and** re-checked in each route group's `layout.tsx` from verified JWT claims.

---

## Project structure

```
src/
├─ app/
│  ├─ (auth)/            # login, register, verify-email
│  ├─ (public)/          # home, listings, profile, payment, logout
│  ├─ (tenant)/          # tenant dashboard + application detail
│  ├─ (owner)/           # owner dashboard, flats
│  ├─ (manager)/         # manager dashboard
│  ├─ (admin)/           # admin dashboard, manage-areas
│  └─ (advertisement)/   # shared owner+manager desks
├─ api/                  # typed API modules (one per backend resource)
├─ components/
│  ├─ ui/                # shadcn / Base UI primitives
│  ├─ shared/            # DataTable, StatCard, StatusBadge, FilterTabs, …
│  ├─ modules/           # feature components grouped by domain
│  ├─ form/              # login, register, verify, listing search
│  ├─ charts/            # Recharts wrappers
│  └─ site/              # header, footer
├─ hooks/                # TanStack Query hooks + useDebounce, useApiErrorToast
├─ lib/                  # api-client, session, format, error helpers
├─ providers/            # QueryProvider + Toaster
├─ types/                # shared domain + API envelope types
├─ validation/           # Zod schemas used by forms
└─ proxy.ts              # Next 16 middleware: JWT verify + role gating
```

---

## Getting started

### Prerequisites
- Node.js 20+
- The backend running at `http://localhost:5000` (or a deployed URL)

### 1. Install
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in the values:

```env
# Backend origin (the client appends /api/v1)
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000

# Secrets used by proxy.ts / server-session.ts to verify JWTs locally
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
```

> `NEXT_PUBLIC_*` values are inlined at build time — restart the dev server after changing them.

### 3. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo accounts

Seeded on the backend; every demo user shares the password `password123`. The login page offers **one-click demo login** for each role.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@housing.com` | `password123` |
| Owner | `szdesco@gmail.com` | `password123` |
| Manager | `sz.munim@gmail.com` | `password123` |
| Tenant | `szmunim9@gmail.com` | `password123` |

---

## Authentication & session

- **Transport:** access + refresh tokens are set as cookies by the backend and also returned in the login body; `Authorization: Bearer <token>` is supported as a fallback.
- **Verification:** `src/proxy.ts` verifies the access token with `JWT_ACCESS_SECRET` on every matched request. If it is invalid but the refresh token (verified with `JWT_REFRESH_SECRET`) is valid, the proxy calls `POST /api/v1/auth/refresh-token` and rotates the access-token cookie transparently.
- **Route gating:** signed-out users hitting a private route are redirected to `/login?from=<path>`, signed-in users hitting an auth route are sent to their role home, and role mismatches are redirected to the correct dashboard.
- **Server pages** read trusted claims via `getSessionClaims()` and fetch with `authedFetchJson()` (httpOnly cookie, `cache: "no-store"`). **Client hooks** use `apiClient` (ofetch, `credentials: "include"`) wrapped in TanStack Query.
- Role homes: `ADMIN → /admin`, `OWNER → /owner/dashboard`, `MANAGER → /manager/dashboard`, `TENANT → /tenant/dashboard`.

---

## Payments (SSLCommerz)

Payments are **SSLCommerz sandbox only** — cash-on-delivery and manual status flips are deliberately not supported.

1. Selecting a payable invoice calls `POST /api/v1/payments/create/:invoiceId`, which returns a gateway URL the browser is redirected to.
2. The gateway redirects back to `/payment/success/[transactionReference]` or `/payment/cancel[/...]`.
3. Those landing pages **never trust the URL** — they re-read the authoritative status via `GET /api/v1/payments/check/:transactionReference` and render it.

Invoice rules: rent installments unlock one at a time (only the earliest due installment is payable), while all pending utility bills are payable at any time.

---

## API & data layer

- **Base URL:** `${NEXT_PUBLIC_BACKEND_API_URL}/api/v1`.
- **Uniform envelope:**
  ```ts
  { success: boolean, statusCode: number, message: string, data: T, meta?: Meta }
  // meta: { page, limit, total, totalPages } on paginated lists
  ```
  Errors return `success: false` with an `error` object.
- **Client:** `ofetch` instance with `credentials: "include"`, zero retries, and an `Authorization` header injected from the stored token.
- **Server:** `authedFetchJson<T>()` reads the httpOnly cookie and calls the backend with `cache: "no-store"`.
- **Queries:** one hook module per resource (`src/hooks/*.hook.ts`) with typed keys, mutations and cache invalidation. API modules (`src/api/*.api.ts`) isolate every endpoint.
- **Validation:** Zod schemas in `src/validation/` are shared by forms; TanStack Query handles server state and `toApiError()` normalises failures for toasts.

---

## UI & conventions

- **Design tokens are CSS-first** — theme colors, radii and light/dark palettes live in `src/app/globals.css` (Tailwind v4, no `tailwind.config.*`).
- **Components are Base UI based**; generated shadcn components use `data-slot` attributes and the `render`/`.Props` patterns. `cn` comes from the `cn` package.
- **Server Components by default**, `"use client"` only for interactivity. Images render through `next/image`.
- **URL is the source of truth** for search, filters, sorting, pagination and any open drawer/sheet (`search`, `status`, `page`, `limit`, plus `requestId` / `applicationId` / `flatId`).
- **Reusable primitives** in `src/components/shared` — `DataTable`, `StatCard`, `StatusBadge`, `MaintenancePriorityBadge`, `FilterTabs`, `TableSearch`, skeletons — and hooks such as `useDebounce` and `useApiErrorToast` keep features DRY.
- **Loading & errors:** each data route ships a `loading.tsx` skeleton (not a spinner) and an `error.tsx` boundary; mutations surface failures as toasts and empty results render empty states.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Biome lint + format check |
| `npx biome check --write` | Autofix lint, formatting and import order |
| `npx tsc --noEmit` | Type-check |

Recommended verification order:

```bash
npx next typegen        # generate route types (needed on a fresh clone)
npx biome check --write
npx tsc --noEmit
npm run build
```

---

## License

Built as an assignment project for educational purposes.
