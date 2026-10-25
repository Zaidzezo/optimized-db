# optimized-db

Learning real system design by breaking and fixing a real PostgreSQL app under load.

## Stack
- Node.js + Express + Prisma
- PostgreSQL (Docker)
- Load testing: k6

## The App
Conduit — a Medium.com clone with users, articles, comments, follows, and favorites.

## Benchmark Results

### Database Indexing

| Stage | avg | p(95) | requests |
|---|---|---|---|
| Empty DB | 351ms | 1.72s | 14,353 |
| 5k articles, no indexes | 1,120ms | 4.07s | 9,506 |
| After indexes | 846ms | 2.44s | 10,523 |

### Connection Pooling

Tested different Prisma connection pool sizes using k6 with up to 500 virtual users and 5,000 articles in PostgreSQL.

| Pool size | avg | p(95) | requests | req/s | failures |
|---|---|---|---|---|---|
| Default | 798ms | 2.81s | 10,899 | 88.59 | 0% |
| 5 | 448ms | 1.78s | 13,410 | 109.19 | 0% |
| **10** | **475ms** | **1.38s** | **13,083** | **107.15** | **0%** |
| 20 | 764ms | 2.77s | 11,061 | 90.22 | 0% |

A pool size of **10 connections** achieved the lowest p95 latency while maintaining throughput close to the best-performing configuration.

Compared to Prisma's default pool configuration:
- **51% lower p95 latency** (2.81s → 1.38s)
- **40% lower average latency** (798ms → 475ms)
- **21% higher throughput** (88.59 → 107.15 req/s)

Increasing the pool to 20 connections worsened performance, suggesting that allowing more concurrent database queries isn't always beneficial.

The selected configuration is `connection_limit=10` in `DATABASE_URL`.

Results are from one benchmark run per configuration, so additional runs would be needed to confirm consistency.

## Optimizations Applied
- [x] Indexes on `createdAt`, `slug`, `authorId`, `articleId`
- [x] Prisma connection pool tuning — benchmarked default, 5, 10, and 20 connections; selected 10 based on p95 latency

## Next
- [ ] Redis caching
- [ ] N+1 query fix
- [ ] Partitioning
- [ ] Read replicas
- [ ] Sharding