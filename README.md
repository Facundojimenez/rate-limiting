# Rate Limiter Monorepo

A monorepo containing two TypeScript services:

- **backend**: A mock Express.js API with payment endpoints.
- **rate-limiter**: An Express.js reverse proxy that enforces per-user rate limits using a Sliding Window algorithm backed by Redis.

## Architecture

```
Client → rate-limiter (:4000) → backend (:3000)
                   ↕
                 Redis
```

All incoming requests should target the **rate-limiter** service. It validates rate limits and, if allowed, forwards the request to the backend.

## Project Structure

```
desafio_rate_limitting_iol/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── package.json
└── packages/
    ├── backend/
    │   ├── Dockerfile
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts
    │       ├── app.ts
    │       ├── routes/payment.routes.ts
    │       ├── controllers/payment.controller.ts
    │       └── services/payment.service.ts
    └── rate-limiter/
        ├── Dockerfile
        ├── tsconfig.json
        └── src/
            ├── index.ts
            ├── app.ts
            ├── config/rules.ts
            ├── redis/client.ts
            ├── middleware/rateLimiter.middleware.ts
            ├── services/rateLimiter.service.ts
            └── routes/proxy.routes.ts
```

## Services

### Backend (`packages/backend`)

| Method | Path               | Description           |
|--------|--------------------|-----------------------|
| POST   | `/payments/insert` | Creates a new payment |
| POST   | `/payments/get`    | Retrieves payments    |

### Rate Limiter (`packages/rate-limiter`)

Exposes the same routes as the backend. Applies rate limiting before proxying:

| Route                   | Default Limit              |
|-------------------------|----------------------------|
| `POST /payments/insert` | 5 requests / 60s per user  |
| `POST /payments/get`    | 10 requests / 60s per user |

The `userId` field must be present in every request body to identify the caller.

### Rate Limit Response Headers

Every response from the rate-limiter includes:

| Header                  | Description                              |
|-------------------------|------------------------------------------|
| `X-RateLimit-Limit`     | Maximum requests allowed in the window   |
| `X-RateLimit-Remaining` | Remaining requests in the current window |
| `X-RateLimit-Window`    | Window duration in seconds               |

When the limit is exceeded, the service responds with `429 Too Many Requests`.

## Sliding Window Algorithm

The rate limiter uses a **Sliding Window** algorithm implemented with a Redis Sorted Set:

1. Each request is stored as a unique member (`timestamp-UUID`) with its timestamp as the score.
2. On every request, entries older than the current window are removed atomically.
3. The number of remaining members (via `ZCARD`) determines whether the request is within the allowed limit.
4. All Redis operations run inside a single pipeline for atomicity.

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Running the full stack

```bash
docker-compose up --build
```

This command builds both TypeScript services (compiling TS → JS inside Docker) and starts Redis, backend, and rate-limiter.

### Environment Variables

Copy `.env.example` to `.env` to customize the configuration:

| Variable                | Default | Description                             |
|-------------------------|---------|-----------------------------------------|
| `BACKEND_PORT`          | `3000`  | Host port for the backend service       |
| `RATE_LIMITER_PORT`     | `4000`  | Host port for the rate-limiter service  |
| `REDIS_PORT`            | `6379`  | Host port for Redis                     |
| `INSERT_MAX_REQUESTS`   | `5`     | Max requests for `/payments/insert`     |
| `INSERT_WINDOW_SECONDS` | `60`    | Window size (seconds) for insert        |
| `GET_MAX_REQUESTS`      | `10`    | Max requests for `/payments/get`        |
| `GET_WINDOW_SECONDS`    | `60`    | Window size (seconds) for fetching      |

## Example Requests

**Insert a payment:**
```bash
curl -X POST http://localhost:4000/payments/insert \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123", "amount": 100, "currency": "ARS"}'
```

**Get payments:**
```bash
curl --location --request GET 'http://localhost:4000/payments/get' \
--header 'Content-Type: application/json' \
  --data '{
    "userId": "user-123"
  }'
```
