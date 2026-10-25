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

Tested Prisma pool sizes using k6 with up to 500 virtual users and 5,000 articles.

| Pool size | avg | p(95) | req/s | failures |
|---|---|---|---|---|
| Default | 798ms | 2.81s | 88.59 | 0% |
| 5 | 448ms | 1.78s | 109.19 | 0% |
| **10** | **475ms** | **1.38s** | **107.15** | **0%** |
| 20 | 764ms | 2.77s | 90.22 | 0% |

Selected `connection_limit=10`, achieving approximately **51% lower p95 latency** than the default in initial benchmarks. Results are based on one run per configuration.

### N+1 Investigation

Enabled Prisma query logging and tested `/api/articles` with 1, 10, and 100 articles.

All three requests executed **7 article-related SQL queries**, confirming that Prisma was batching the relationships rather than exhibiting an N+1 pattern in this endpoint.

### Favorite Relationship Optimization

Found that the API loaded all users who favorited an article just to calculate `favorited` and `favoritesCount`.

Optimized this by filtering `favoritedBy` to the authenticated user and using `_count.favoritedBy` for the total.

Verified authenticated and unauthenticated behavior, including favoriting and unfavoriting. Performance impact has not yet been benchmarked.

## Optimizations Applied

- [x] Indexes on `createdAt`, `slug`, `authorId`, `articleId`
- [x] Connection pool tuning — selected 10 connections
- [x] N+1 investigation — no N+1 pattern found in `/api/articles`
- [x] Reduced unnecessary favorite relationship loading

## Next

- [ ] Optimize follower relationship loading
- [ ] Redis caching
- [ ] Partitioning
- [ ] Read replicas
- [ ] Sharding