<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## What this is

B7A7 frontend for a **Housing & Roommate Platform**. This repo is the Next.js app only; the backend is a **separate** Express/Prisma/PostgreSQL service (see `req-res/backend-readme.md`) and is not vendored here. Base URL in `.env` is `http://localhost:5000`.

## Commands

| Task | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Lint + format check | `npm run lint` (Biome) |
| Autofix lint/format/imports | `npx biome check --write` |
| Typecheck | `npx tsc --noEmit` |
| Add a shadcn component | `npx shadcn add <name>` |

Non-obvious:

- **Biome is the only linter.** There is no ESLint config and `next lint` was removed in Next 16; `next build` does not lint. Do not add ESLint/Prettier.
- **`npm run lint` fails on a clean checkout today** — 5 pre-existing formatting errors in `globals.css`, `layout.tsx`, `page.tsx`, `ui/button.tsx`, `lib/utils.ts`. `npx biome check --write` clears all of them.
- **`npm run format` is not enough.** It is only `biome format --write`; it will not fix lint rules or the `organizeImports` assist. Use `npx biome check --write`.
- **On a fresh clone `npx tsc --noEmit` fails** because the generated route types are missing. Run `npx next typegen` (or `npm run dev` / `npm run build`) first.
- Verification order that matters: `npx biome check --write` → `npx tsc --noEmit` → `npm run build`.
- **No test framework, no test script, no CI** — tests are an open TODO. Do not assume `npm test` exists.

## Next.js 16 specifics (verified against bundled docs)

- **`params` / `searchParams` / `cookies()` / `headers()` / `draftMode()` are async.** Sync access is fully removed; always `await`.
- **`PageProps<'/route'>`, `LayoutProps<'/route'>`, `RouteContext<'/route'>` are ambient globals** emitted to `.next/types/routes.d.ts` and `.next/dev/types/routes.d.ts` (both in `tsconfig.json` `include`). `src/app/layout.tsx` already uses `LayoutProps<"/">`. Re-run `npx next typegen` after adding routes.
- **Auth middleware goes in `src/proxy.ts`, not `src/middleware.ts`.** Export `function proxy(request: NextRequest)`; the `middleware` name is deprecated. The proxy runtime is `nodejs` only — the `edge` runtime is not supported.
- **Turbopack is the default** for `next dev` and `next build`; do not add `--turbopack`.
- **React Compiler is enabled** (`reactCompiler: true` in `next.config.ts`). Don't hand-add `useMemo`/`useCallback` for render performance.
- `revalidateTag` now requires a second `cacheLife` argument; the single-arg form is deprecated.
- `typedRoutes` is **off**, so `<Link href>` is not statically checked. Route-level type helpers still exist.
- Bundled docs worth reading first: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`, `.../01-app/03-api-reference/03-file-conventions/`, `.../01-app/02-guides/ai-agents.md` (dev-server/MCP verification loop).

## UI stack

- **Tailwind v4, CSS-first.** There is no `tailwind.config.*`. All theme tokens, radii, and the light/dark palettes live in `src/app/globals.css`; add new tokens there, not in a config file.
- **shadcn style is `base-nova`, which builds on Base UI — not Radix.** Generated components import from `@base-ui/react/*` and use `data-slot` attributes and Base UI's `render`/`.Props` patterns. Do not hand-port Radix snippets.
- **`cn` comes from the `cn` npm package** (shadcn's compiled Tailwind class merger, drop-in for `clsx` + `tailwind-merge`). It is re-exported from `src/lib/utils.ts` but generated components import it directly from `"cn"`. Don't reintroduce `clsx`/`tailwind-merge`.
- `components.json` aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks` (that last directory does not exist yet). Add components with the CLI so `globals.css` and aliases stay in sync.

## Backend integration

- **Read `req-res/backend-readme.md` before writing any API code** — it is the complete, current contract (every module, role gate, and business rule). `req-res/Housing-Rental.postman_collection.json` has raw requests. `req-res/project-requirements.md` and `req-res/General-instruciton.md` are the assignment spec.
- **`req-res/` is gitignored** (see `.gitignore`), so it is local-only and will be missing on a fresh clone or for a collaborator.
- `.env` defines only `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000`; backend routes live under **`/api/v1`**, so the client layer must join them. `NEXT_PUBLIC_*` values are inlined at build time.
- **Response envelope is uniform:** `{ success, statusCode, message, data, meta? }`. `meta` (`page`, `limit`, `total`, `totalPages`) appears on paginated lists. Errors return `success: false` with an `error` object. Type this once and reuse it.
- **Auth:** access + refresh tokens are set as `httpOnly` cookies *and* returned in the login body; `Authorization: Bearer <token>` also works. Refresh via `POST /api/v1/auth/refresh-token`. Design the session layer around cookie transport with Bearer as fallback.
- **Roles are `ADMIN | OWNER | MANAGER | TENANT`** — build a distinct dashboard and nav for all four, and one-click demo login on the login page for each (the assignment requires 3; demo buttons and working demo credentials are graded).
- **Payments are SSLCommerz sandbox only.** `POST /api/v1/payments/create/:invoiceId` initiates; `POST /api/v1/payments/confirm/:status` is the gateway callback. Cash-on-delivery or manual status flips are explicitly rejected by the assignment.
- `ofetch`, `@tanstack/react-query`, `@tanstack/react-form`, and `zod` are installed but unused — they are the intended stack. Build the client/hooks layer on them instead of adding `axios`, SWR, or `react-hook-form`.
- Still missing for the assignment: a toast library (`sonner` or `react-hot-toast`) and a chart library (`recharts`). Neither is installed yet.

## Assignment rules that constrain implementation

- No mock data, hardcoded JSON, placeholder images, or lorem ipsum in any core flow — real API only.
- All filtering, sorting, searching, and pagination must live in the URL via `useSearchParams`.
- Every data-fetching route needs a `loading.tsx` skeleton (not a spinner) and empty states; API failures surface as toasts, page crashes in `error.tsx`.
- Use Server Components by default; add `"use client"` only for interactivity. Images via `next/image`. No `any`.
- Extract repeated logic into custom hooks (`@/hooks`) and shared components (`DataTable`, `StatCard`, `StatusBadge`, `useDebounce`) — copy-pasted UI is graded down.
- 18+ real pages, and 20+ meaningful commits with conventional prefixes (`feat:`, `fix:`). History is currently 2 commits.

## Git gotcha

`.gitignore` lists `AGENTS.md`, `CLAUDE.md`, `.gitignore`, and `req-res`, but `AGENTS.md`, `CLAUDE.md`, and `.gitignore` are **already tracked** — changes to them still show up in `git status`. Only `req-res/` is genuinely untracked.
