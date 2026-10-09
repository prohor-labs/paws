<!-- BEGIN:turborepo-agent-rules -->

# Turborepo Architecture & Agent Guidance

Turborepo configuration, task behavior, and CLI commands can vary between installed versions. Resolve the `turbo` package from this workspace directory. Read bundled documentation in `node_modules/turbo/` when configuring pipelines or scripts. Heed deprecation notices and keep task pipelines (`build`, `dev`, `lint`, `check-types`) clean and cached.

<!-- END:turborepo-agent-rules -->

# Project Architecture & Full Refactor Guide

This repository (`paws.academy`) is undergoing a complete architectural refactor:
1. **Backend Migration**: Full rewrite of `apps/api/` (Bun + Hono) into **`apps/server/`** using **NestJS**.
2. **Frontend Renaming**: Rename `apps/web/` to **`apps/client/`** (Next.js 16 + React 19).
3. **SDK Elimination**: Completely deprecate and remove `packages/sdk`. The client communicates directly with the NestJS backend using type-safe API clients and **TanStack Query**.

---

## Workspace Structure (Target State)

```text
paws.academy/
├── apps/
│   ├── server/           # NestJS REST backend (replaces apps/api)
│   └── client/           # Next.js App Router frontend (renamed from apps/web)
├── packages/             # Shared packages (packages/sdk removed)
├── package.json          # Root workspace configuration
├── turbo.json            # Turbo pipeline definition
└── skills-lock.json      # Registered agent skills
```

---

## Agent Skills Reference & Required Guidelines

All agents working on this refactor **MUST** adhere to the following specialized skills:

### 1. `nestjs-best-practices` (`skills/nestjs-best-practices/SKILL.md`)
- **Modularity & Structure**:
  - Organize `apps/server` into cohesive domain feature modules: `AuthModule`, `BillingModule`, `ExamModule`, `QbModule` (Question Bank), `WatchModule`, `UploadModule`, and `HealthModule`.
  - Place cross-cutting concerns in `core/` (guards, interceptors, filters, pipes) and shared database/utility modules in `common/`.
- **Dependency Injection**: Always inject dependencies via constructor injection. Use interface tokens / custom providers where appropriate.
- **DTOs & Validation**:
  - Enforce strict input validation using `ValidationPipe` with `class-validator` and `class-transformer` (or Zod validation pipes).
  - Use `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true` in global validation pipes.
- **Database Layer**:
  - Maintain the existing PostgreSQL + Drizzle ORM schema or integrate Drizzle cleanly as an injectable database service (`DrizzleService` / `DatabaseModule`).
- **Authentication & Authorization**:
  - Migrate auth flow (Better Auth or NestJS Passport/JWT guards) with custom decorators (`@CurrentUser()`, `@Roles()`).
- **Exception Handling**:
  - Use NestJS built-in `HttpException` hierarchy or custom exception filters returning standardized error envelopes.

### 2. `postgresql-table-design` (`skills/postgresql-table-design/SKILL.md`) - Reimagining PostgreSQL for Peak Performance
- **Schema Optimization & Normalization**:
  - Re-architect and modernize the database schema to clean 3NF standards, removing data redundancy and update anomalies. Denormalize only for measured, high-ROI query paths.
  - Enforce strict `NOT NULL` constraints across all columns where semantically required; define explicit `DEFAULT` values for common states.
- **Data Types for Performance & Correctness**:
  - **Primary Keys**: Prefer `BIGINT GENERATED ALWAYS AS IDENTITY` for high-throughput relational reference tables. Use `UUID` (`uuidv7()` or `gen_random_uuid()`) only when distributed or opaque keys are required. Avoid legacy `SERIAL`.
  - **Timestamps**: Always use `TIMESTAMPTZ` (UTC with timezone). Strictly avoid `timestamp` (without time zone) or `timetz`.
  - **Monetary / Decimal**: Use `NUMERIC(precision, scale)` for all currency, pricing, and balances. Avoid `FLOAT`, `DOUBLE`, and PostgreSQL's legacy `MONEY` type.
  - **Strings**: Use `TEXT` (with `CHECK (LENGTH(col) <= n)` where length boundaries exist). Avoid arbitrary `VARCHAR(n)` or fixed `CHAR(n)`.
  - **Booleans**: Always `BOOLEAN NOT NULL` unless explicitly tri-state.
  - **Semi-structured Attributes**: Use `JSONB` (never plain `JSON`) solely for optional or dynamic attributes, indexed with GIN.
- **Index Architecture**:
  - **Foreign Key Indexing**: PostgreSQL **does not** automatically index foreign keys. Add explicit B-Tree indexes on every foreign key column to prevent full-table sequential scans during joins and cascading deletes.
  - **Composite & Partial Indexes**: Build composite indexes aligned with query access patterns (equality columns first, then range/sort columns). Use partial indexes (e.g. `WHERE status = 'active'`) for frequently filtered subsets to reduce index bloat.
  - **GIN Indexing**: Apply GIN indexes with `jsonb_path_ops` for high-speed containment queries inside `JSONB` documents.
- **MVCC & Concurrency Optimization (1k CCU Baseline)**:
  - Avoid wide-row hot update churn. Separate volatile status/counter fields from wide static tables to minimize vacuum pressure and dead tuple accumulation.
  - Avoid long transactions to prevent lock contention and table bloat.

### 3. `tanstack-query-best-practices` (`skills/tanstack-query-best-practices/SKILL.md`)
- **Direct Backend Integration**:
  - `apps/client` communicates directly with `apps/server` endpoints without an intermediate SDK wrapper.
  - Implement a lightweight, typed fetcher / API client (`lib/api-client.ts`) utilizing shared TypeScript contracts.
- **Query Key Factories**:
  - Define deterministic query key factories for all features (e.g., `examKeys.all`, `examKeys.detail(id)`, `billingKeys.orders(filter)`). Never use arbitrary string arrays inline.
- **Custom React Hooks**:
  - Wrap all queries and mutations in dedicated custom hooks (e.g., `useExams()`, `useCreateOrder()`).
  - Keep data fetching logic decoupled from presentational components.
- **Mutation & Cache Updates**:
  - Always implement proper cache invalidation (`queryClient.invalidateQueries`) or optimistic updates (`onMutate`, `onError`, `onSettled`).
- **Server State vs. Client State**:
  - Use React Query solely for server state; do not sync query data into `useState` or `useEffect`.
  - Configure sensible defaults: `staleTime: 60 * 1000` (1 min), `retry: 1`, with explicit garbage collection (`gcTime`).

### 4. REST API Design & Performance Skills
- **`api-design-principles` (`skills/api-design-principles/SKILL.md`)**:
  - Resource-oriented URLs (`/exams`, `/exams/:id/questions`, `/billing/orders`).
  - Standard HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`).
  - Consistent response payloads: wrap standard responses in `{ data, meta?, error? }` or predictable REST envelopes.
- **`api-pagination` (`skills/api-pagination/SKILL.md`)**:
  - All paginated endpoints in `apps/server` must consume `PaginationQueryDto` (`page` 1-indexed, `limit` with default 20, max 100).
  - Return `{ data: T[], pagination: { page, limit, total, totalPages, hasNext, hasPrev } }`.
- **`api-filtering-sorting` (`skills/api-filtering-sorting/SKILL.md`)**:
  - Standardize query parameter formats: `sort=createdAt:desc`, `filter[status]=active`, search strings sanitized and validated.
  - Whitelist allowed sort/filter fields in DTOs to prevent database injection or invalid queries.
- **`api-response-optimization` (`skills/api-response-optimization/SKILL.md`)**:
  - Add compression (e.g. `@fastify/compress` or `compression`), selective projection on queries, and proper HTTP caching headers (`Cache-Control`, `ETag`) where applicable.

### 5. `typescript-advanced-types` (`skills/typescript-advanced-types/SKILL.md`)
- **Type Safety Without SDK**:
  - Share contracts/types between `apps/server` and `apps/client` (via a shared types package or exported type contracts).
  - Use generics, discriminated unions, utility types (`Omit`, `Pick`, `Extract`), and branded types where appropriate.
  - Disallow `any` across the entire codebase.

### 6. `vercel-react-best-practices` (`skills/vercel-react-best-practices/SKILL.md`)
- **Next.js 16 App Router**:
  - Maintain clear separation between React Server Components (RSC) and Client Components (`'use client'`).
  - Prefetch queries on the server with `prefetchQuery` and hydrate using `HydrationBoundary` where SSR data is needed.
- **Performance**:
  - Avoid unnecessary client re-renders; memoize callbacks and computationally heavy transforms.
  - Optimize dynamic imports, bundle size, and font/image loading.

### 7. `graphify` Knowledge Graph (`/root/.gemini/config/skills/graphify/SKILL.md`)
- **Dependency & Symbol Tracking**:
  - Before modifying large dependency graphs, consult `graphify query "<symbol>"` or review [`graphify-out/GRAPH_REPORT.md`](file:///root/paws.academy/graphify-out/GRAPH_REPORT.md).
  - After completing workspace and route restructuring, run `bun run graphify` to rebuild the knowledge graph and verify that all references to old packages (`@paws/sdk`, `apps/api`, `apps/web`) have been cleaned up.

---

## UI Component Integrity Rules

1. **Do NOT Modify `components/ui/*`**:
   - Files under `apps/client/src/components/ui/` (`pagination.tsx`, `button.tsx`, `card.tsx`, etc.) are pristine shadcn / base-ui primitives.
   - Compose or wrap them in feature components or `components/shared/*`.
2. **Pagination UI**:
   - Use standard `<Pagination>` primitives from `@/components/ui/pagination`.
   - Sync pagination with TanStack Query and URL search params; reset `page` to `1` when filters or searches change.

---

## Core Engineering Constraints & Performance Standards

1. **Strict "No Comments" Rule**:
   - Write clean, self-documenting code with expressive naming for variables, functions, interfaces, and classes.
   - **Do NOT add code comments**: No explanatory inline comments, method summaries, step-by-step commentary, or AI notes (e.g., avoid `// inject service`, `// fetch data`, `// return response`).
   - Preserve existing third-party/vendor docstrings or license headers where untouched, but do not author new comments in written code.

2. **1,000 Concurrent Users Baseline (1k CCU Target)**:
   - All backend (`apps/server`) and frontend (`apps/client`) code must be architected and optimized to handle **1,000 concurrent users** under load:
     - **Database & Pooling**: Configure PostgreSQL connection pooling efficiently. Enforce strict index usage on queried columns, eliminate N+1 queries, and avoid long-running transactions.
     - **Non-Blocking Asynchronous Operations**: 100% async/await for all I/O. Never block the Node/Bun event loop with CPU-heavy synchronous work, synchronous FS calls, or unoptimized JSON serialization.
     - **Memory & Resource Efficiency**: Prevent memory leaks by avoiding unbounded in-memory storage, streaming large responses/uploads, and maintaining low per-request memory allocation.
     - **Caching & Throttling**: Use response caching headers, selective query projection, rate-limiting safeguards, and TanStack Query request deduplication/`staleTime` to prevent thundering herd problems.

---

## Migration Roadmap & Step-by-Step Execution

1. **Phase 1: Workspace & Package Cleanup**
   - Rename directory `apps/web` to `apps/client`.
   - Update `package.json` names: `@paws/web` → `@paws/client`.
   - Remove `packages/sdk` and purge all `@paws/sdk` references in `apps/client`.
   - Update root `package.json` and `turbo.json` workspace configurations.
2. **Phase 2: NestJS Server (`apps/server`) & PostgreSQL Redesign**
   - Initialize NestJS project in `apps/server` (`@paws/server`).
   - Re-architect and reimagine the PostgreSQL schema using `postgresql-table-design` (strict 3NF, identity PKs, explicit FK indexes, partial indexes, `TIMESTAMPTZ`, and `NUMERIC` for monetary values).
   - Port redesigned schema into Drizzle ORM and integrate via NestJS `DatabaseModule` / `DrizzleService`.
   - Rewrite routes (`billing`, `exam`, `qb`, `upload`, `watch`, `health`, `auth`) into modular NestJS controllers, services, and DTOs following `nestjs-best-practices`.
   - Implement `api-pagination`, `api-filtering-sorting`, and validation pipes.
3. **Phase 3: TanStack Query Client Refactor (`apps/client`)**
   - Replace old `@paws/sdk` calls in `src/hooks/*`, `src/components/*`, and `src/lib/*` with direct type-safe API client and TanStack Query hooks.
   - Structure query key factories and mutations with deterministic cache invalidation.
4. **Phase 4: Verification & Graph Update**
   - Run `turbo run check-types` across all workspaces.
   - Run `turbo run lint` and `turbo run build`.
   - Run `bun run graphify` to regenerate the project knowledge graph and ensure zero broken links.
