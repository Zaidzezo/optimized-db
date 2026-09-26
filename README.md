# optimized-db

Learning real system design by breaking and fixing a real PostgreSQL app under load.

## Stack
- Node.js + Express + Prisma
- PostgreSQL (Docker)
- Load testing: k6

## The App
Conduit — a Medium.com clone with users, articles, comments, follows, and favorites.

## Benchmark Results

| Stage | avg | p(95) | requests |
|---|---|---|---|
| Empty DB | 351ms | 1.72s | 14,353 |
| 5k articles, no indexes | 1,120ms | 4.07s | 9,506 |
| After indexes | 846ms | 2.44s | 10,523 |

## Optimizations Applied
- [x] Indexes on `createdAt`, `slug`, `authorId`, `articleId`

## Next
- [ ] Connection pooling
- [ ] Redis caching
- [ ] N+1 query fix
- [ ] Partitioning
- [ ] Read replicas
- [ ] Sharding