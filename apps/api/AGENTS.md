# AGENTS.md

## Mission

Build and maintain an extremely fast, low-latency, production-grade API for PawsAcademy.

Primary workload: high-volume question-bank reads.

Optimize for:

* Lowest possible latency
* Maximum throughput
* Minimal CPU and memory usage
* PostgreSQL efficiency
* PgBouncer compatibility
* Minimal allocations
* Small response payloads
* Predictable query plans
* Horizontal scalability
* Strong TypeScript type safety
* Simple maintainable architecture

Performance is a feature. Never trade significant runtime performance for unnecessary abstraction.

---

## Stack

* Runtime: Bun
* Language: TypeScript
* Framework: Hono
* ORM: Drizzle ORM
* Database: PostgreSQL
* Connection pooling: PgBouncer
* Validation: Zod
* API style: REST
* Package manager/runtime: Bun only

Never introduce:

* Node.js-specific APIs
* Express
* NestJS
* Prisma
* Sequelize
* TypeORM
* Redis unless explicitly required
* Docker unless explicitly required
* Another ORM
* Another runtime

Use native Bun APIs where practical.

---

## Non-Negotiable Rules

1. Never guess about performance.
2. Never optimize blindly.
3. Inspect query plans for important database queries.
4. Avoid unnecessary database queries.
5. Avoid N+1 queries.
6. Never load columns that the endpoint does not need.
7. Never fetch unbounded datasets.
8. Never use `SELECT *` in production API queries.
9. Always paginate large collections.
10. Prefer keyset/cursor pagination for large datasets.
11. Prefer indexed queries.
12. Keep hot paths simple.
13. Avoid unnecessary middleware on hot endpoints.
14. Avoid unnecessary serialization/deserialization.
15. Avoid unnecessary object transformations.
16. Do not add abstractions without a measurable benefit.
17. Do not add dependencies when the platform or existing stack already solves the problem.
18. Do not introduce caching until the actual bottleneck is identified.
19. Never solve a database problem with application-level hacks.
20. Never solve an application problem by blindly adding database indexes.

---

## Code Style

* Strict TypeScript.
* No `any`.
* Prefer inferred types where clear.
* Explicit return types for important public/service functions.
* Use Zod at untrusted boundaries.
* Reuse existing schemas and types.
* Avoid duplicate types.
* Keep modules focused.
* Prefer small pure functions.
* Avoid deeply nested control flow.
* Avoid unnecessary classes.
* Prefer functions and composition.
* Avoid premature generic abstractions.
* No unnecessary dependency injection containers.
* No unnecessary repositories/services/factories.
* Keep hot-path code obvious.

### Comments

Do not write code comments.

Do not add:

* Inline comments
* Block comments
* TODO comments
* Explanatory comments
* Commented-out code

Code must be self-explanatory through naming and structure.

---

## Architecture

Current structure:

```text
src/
├── auth.ts
├── db/
│   ├── index.ts
│   ├── migrate.ts
│   ├── migrations/
│   └── schema/
├── lib/
├── middleware/
├── routes/
├── services/
└── index.ts
```

Preserve this architecture unless there is a concrete reason to change it.

Recommended dependency direction:

```text
routes
  ↓
services
  ↓
db/schema
  ↓
PostgreSQL
```

Infrastructure utilities may be used by any appropriate layer.

Do not allow:

* Routes containing large database/business logic
* Services depending on HTTP-specific objects unnecessarily
* Database code depending on route implementations
* Circular dependencies

---

# Performance Engineering

## General

Every change to a hot endpoint must consider:

```text
request
→ middleware
→ validation
→ route
→ service
→ database
→ serialization
→ response
```

Minimize work at every stage.

Prefer:

```text
one optimized request
→ one optimized query
→ minimal transformation
→ compact JSON
```

over:

```text
request
→ multiple middleware layers
→ multiple service calls
→ multiple queries
→ large object transformations
→ large JSON response
```

---

## Hono

Use Hono's native routing and context APIs.

Prefer:

```ts
app.get("/questions", handler)
```

over unnecessary routing abstractions.

Keep hot routes shallow.

Avoid expensive middleware globally when it is only required for a subset of routes.

Do not perform database work in middleware unless the data is required for routing/authentication.

Do not create middleware that executes queries for every request unless absolutely necessary.

---

## Bun

Bun is the required runtime.

Use Bun APIs where they provide a clear benefit.

Do not introduce Node compatibility layers unless unavoidable.

Avoid:

* unnecessary filesystem access during requests
* synchronous blocking operations
* spawning subprocesses in request paths
* expensive cryptographic work in hot public endpoints
* repeated environment parsing
* repeated configuration construction

Initialize static configuration once at startup.

Reuse database pools and clients.

---

# PostgreSQL

PostgreSQL is the primary performance boundary.

Database performance has priority over ORM convenience.

## Query Rules

Never:

```sql
SELECT *
```

Always select only required columns.

Prefer indexed predicates:

```sql
WHERE id = ?
WHERE slug = ?
WHERE subject_id = ?
WHERE chapter_id = ?
```

Avoid expressions that prevent index usage when an indexed predicate can be used.

Avoid unnecessary joins.

Avoid fetching related records separately when a well-designed query can retrieve the required data efficiently.

Avoid application-side filtering of large database result sets.

Filter in PostgreSQL.

---

## Query Plan

For important queries, inspect:

```sql
EXPLAIN (ANALYZE, BUFFERS)
```

Check:

* execution time
* planning time
* sequential scans
* index scans
* rows removed by filter
* estimated vs actual rows
* join strategy
* sort operations
* memory usage
* buffer hits
* buffer reads

Never assume an index is useful without verifying the query pattern.

---

## Indexes

Indexes must serve real query patterns.

Before adding an index:

1. Identify the actual query.
2. Identify WHERE conditions.
3. Identify JOIN conditions.
4. Identify ORDER BY.
5. Check existing indexes.
6. Inspect the query plan.
7. Add the smallest useful index.
8. Verify the query plan again.

Avoid:

* duplicate indexes
* overlapping indexes without justification
* indexing every column
* excessive composite indexes
* indexes that are never queried

Remember:

Indexes improve reads but increase:

* storage
* write cost
* vacuum work
* maintenance
* cache pressure

---

# PgBouncer

The API runs behind PgBouncer.

Assume connection pooling is already handled externally.

Do not create unnecessary application-level pools on top of PgBouncer.

Keep database connections long-lived and reuse them.

Avoid per-request database connection creation.

Be careful with PostgreSQL session-dependent behavior.

Do not depend on session state unless the PgBouncer pooling mode guarantees it.

Avoid unnecessary prepared-statement assumptions.

Database configuration must remain compatible with PgBouncer.

---

# Drizzle ORM

Use Drizzle for type-safe database access.

Prefer simple SQL generated by Drizzle.

Avoid complicated ORM abstractions that generate inefficient SQL.

Always inspect generated SQL when optimizing a query.

Prefer:

```ts
db
  .select({
    id: questions.id,
    type: questions.type,
  })
  .from(questions)
```

over selecting complete rows.

Use relations only when they produce the desired query shape and performance.

Do not blindly use relational query APIs for hot paths.

For critical queries, explicit SQL/query builders are preferred when they produce clearer and more efficient SQL.

Raw SQL is allowed when necessary for:

* PostgreSQL-specific features
* performance-critical queries
* complex aggregations
* query-plan control

Do not use raw SQL merely because it is shorter.

---

# Question Bank Performance

The question bank is the primary read-heavy workload.

Optimize for:

```text
taxonomy
→ subject
→ paper
→ chapter
→ topic
→ questions
```

and:

```text
institute
→ year/session
→ questions
```

and combined filtering:

```text
academic hierarchy
+
institute
+
year
+
topic
+
question type
```

The database must remain the source of truth.

Never duplicate questions simply to make browsing easier.

Use junction tables for many-to-many relationships.

---

## Question Listing

Question-list endpoints must:

* paginate
* select only required fields
* use indexed filters
* avoid N+1 queries
* avoid huge joins
* avoid returning unnecessary answer/explanation content
* return stable ordering
* use cursor pagination for large datasets

Default limits must be bounded.

Never allow:

```text
?limit=999999
```

or equivalent.

Clamp user-controlled limits to a safe maximum.

---

# Pagination

Prefer cursor/keyset pagination for large question collections.

Avoid deep OFFSET pagination:

```sql
OFFSET 100000
```

when a keyset query can be used.

Prefer:

```text
WHERE id > cursor
ORDER BY id
LIMIT n
```

or another stable indexed ordering.

Cursor requirements:

* opaque to clients
* validated
* stable
* deterministic
* tied to the ordering strategy

Never use an unstable ordering for cursor pagination.

---

# Filtering

Validate every filter.

Only allow known filter fields.

Never dynamically interpolate arbitrary SQL identifiers or operators from user input.

Prefer explicit filter maps.

Example concept:

```text
allowed:
subject
chapter
topic
institute
year
type
difficulty
```

Reject unknown filters when appropriate.

Keep filtering database-side.

---

# API Responses

Responses must be intentionally shaped.

Do not expose complete database rows.

Prefer compact DTOs.

Example:

```json
{
  "data": [],
  "nextCursor": null
}
```

Avoid unnecessary wrapper nesting.

Do not return:

* internal database metadata
* unused relations
* internal IDs unless required
* timestamps unless useful
* duplicated fields
* debug information

For large datasets, response size matters as much as query speed.

---

# Serialization

Minimize serialization work.

Do not repeatedly map the same dataset through multiple intermediate objects.

Prefer a single transformation.

Avoid expensive computed properties on large result sets.

Do not construct huge nested objects if the frontend does not require them.

---

# Caching

Caching is not automatically good.

Before adding a cache:

1. Measure the endpoint.
2. Identify the bottleneck.
3. Determine whether PostgreSQL or application processing is the bottleneck.
4. Verify cache invalidation requirements.
5. Estimate memory cost.
6. Verify cache hit rate expectations.

Prefer database/index/query optimization before introducing another infrastructure dependency.

Static taxonomy data may be cached when:

* it changes rarely
* invalidation is clear
* the cache meaningfully reduces database work

Never cache mutable data indefinitely.

---

# Authentication

Authentication must be cheap on hot public endpoints.

Do not perform unnecessary database queries during authentication.

If authentication requires database access:

* select only required columns
* use indexed identifiers
* avoid loading full user records
* avoid repeated auth lookups within one request

Never trust client-provided identity fields.

Validate tokens securely.

---

# Validation

Validate all external input with Zod.

Validate:

* path parameters
* query parameters
* request bodies
* pagination
* filters
* authentication input

Do not validate internal trusted values repeatedly.

Avoid expensive validation of enormous payloads.

Reject invalid requests early.

---

# Error Handling

Use centralized error handling.

Do not expose:

* stack traces
* SQL
* database credentials
* internal paths
* implementation details

Production errors must be stable and machine-readable.

Avoid throwing errors for normal control flow.

Return appropriate HTTP status codes.

---

# Security

Security and performance must coexist.

Always protect against:

* SQL injection
* XSS
* malformed input
* authentication bypass
* authorization bypass
* excessive request sizes
* excessive pagination
* abusive filtering
* rate-limit bypass

Never interpolate user input into SQL.

Never trust IDs supplied by clients.

Authorization must happen server-side.

Do not leak whether sensitive resources exist when the security model requires indistinguishable responses.

---

# Rate Limiting

Rate limiting should protect expensive endpoints without unnecessarily slowing normal traffic.

Prioritize rate limits for:

* authentication
* uploads
* expensive searches
* exam generation
* administrative operations

Do not add expensive per-request rate-limit logic to every public read endpoint unless required.

---

# API Design

Use versioned APIs:

```text
/api/v1/...
```

Routes should be predictable.

Use nouns for resources.

Prefer:

```text
GET /api/v1/questions
GET /api/v1/questions/:id
```

over action-heavy routes.

Keep response formats consistent.

Do not break existing API contracts unnecessarily.

---

# Database Schema

Schema design must reflect actual access patterns.

For every table consider:

* primary key
* foreign keys
* nullability
* uniqueness
* indexes
* cardinality
* query patterns
* write frequency

Use PostgreSQL constraints to enforce invariants.

Do not rely exclusively on application validation for database integrity.

Prefer normalized data for source-of-truth entities.

Denormalize only when there is a measured performance requirement.

---

# Migrations

Never manually rewrite historical migrations that have already been applied.

Create a new migration for schema changes.

Before migration:

* inspect current schema
* inspect existing indexes
* understand production data volume
* consider locking
* consider migration duration

Avoid long table locks on large production tables.

For large data changes, prefer staged migrations.

---

# Counts

Question counts are performance-sensitive.

Do not execute expensive `COUNT(*)` queries on every request if a maintained count can provide the required behavior.

Existing count-related schema/services must be inspected before introducing another counting mechanism.

Do not maintain duplicate counting systems without justification.

Counts must remain correct.

---

# Hot Endpoint Checklist

Before merging a hot endpoint, verify:

* [ ] Query is bounded
* [ ] No `SELECT *`
* [ ] Correct indexes exist
* [ ] No N+1 queries
* [ ] No unnecessary joins
* [ ] Stable ordering
* [ ] Pagination implemented
* [ ] Query plan inspected
* [ ] Response payload minimized
* [ ] Validation is bounded
* [ ] No unnecessary middleware
* [ ] No unnecessary allocations
* [ ] PgBouncer compatible
* [ ] Authentication is efficient
* [ ] Error path is cheap
* [ ] Existing API contract preserved

---

# Performance Verification

Do not claim an optimization is faster without measurement.

For database changes compare:

```text
before
→ EXPLAIN ANALYZE
→ execution time
→ buffers
→ rows
```

against:

```text
after
→ EXPLAIN ANALYZE
→ execution time
→ buffers
→ rows
```

For API changes measure:

* p50 latency
* p95 latency
* p99 latency
* throughput
* CPU
* memory
* database execution time

Focus especially on p95/p99 for production user experience.

---

# Load Testing

When testing high-read endpoints, test realistic workloads.

Include:

* cold cache
* warm cache
* small result sets
* large result sets
* common filters
* combined filters
* pagination
* concurrent users

Do not optimize only for a single synthetic request.

---

# Dependency Rules

Before installing a dependency:

1. Check whether Bun provides the functionality.
2. Check whether Hono provides it.
3. Check whether Drizzle/PostgreSQL already solves it.
4. Check runtime cost.
5. Check bundle/install complexity.
6. Check maintenance status.
7. Check whether it adds measurable value.

Prefer fewer dependencies.

---

# Installed Skills

Project skills currently include:

* API design principles
* API filtering and sorting
* API gateway configuration
* API pagination
* API rate limiting
* API security hardening
* API response optimization
* API reference documentation
* API error handling
* API contract testing
* API authentication
* Bun/Hono integration
* Hono routing
* REST API design
* PostgreSQL table design

Use the relevant skill before making substantial changes in its domain.

Do not blindly follow a skill if it conflicts with:

* the existing architecture
* measured performance
* PostgreSQL correctness
* PgBouncer requirements
* project requirements

Verify generated recommendations against the actual codebase.

---

# Agent Workflow

Before changing code:

1. Inspect the relevant files.
2. Understand the existing implementation.
3. Search for existing utilities/types/services.
4. Inspect database schema and indexes when database-related.
5. Inspect migrations when schema-related.
6. Check installed skills relevant to the task.
7. Make the smallest correct change.

After changing code:

1. Run type checking.
2. Run formatting.
3. Run relevant tests/checks.
4. Inspect generated SQL for database changes.
5. Verify migrations.
6. Verify affected endpoints.
7. Review for unnecessary allocations and queries.

Never rewrite unrelated code.

Never perform broad refactors during a focused performance fix unless required.

---

# Definition of Done

A change is complete only when:

* It is correct.
* It is type-safe.
* It follows the existing architecture.
* It does not introduce unnecessary dependencies.
* It does not introduce N+1 queries.
* It does not create unbounded queries.
* It preserves PgBouncer compatibility.
* It preserves API contracts unless intentionally changed.
* It has appropriate indexes.
* It has appropriate pagination.
* It has appropriate validation.
* It has appropriate security controls.
* It passes project checks.
* Performance-sensitive behavior has been measured when relevant.

When performance and elegance conflict, prefer the simpler implementation that is measurably faster and still maintainable.
