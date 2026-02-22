# ecommerce-app-nestjs

A minimal **NestJS‑based microservices** example that demonstrates a simple e‑commerce backend composed of four services:

- **auth** – user registration, login and JWT issuance.
- **product** – CRUD for products, cached in Redis.
- **order** – Creates orders after validating product availability.
- **gateway** – API gateway that proxies calls to the three services and protects the `order` endpoint with JWT authentication.

All services are built with **Express** (via NestJS’s underlying HTTP server) and communicate through a **Docker‑Compose** environment that also provides:

- **PostgreSQL** (user, product and order data)
- **Redis** (product list caching)

## Repository structure
```
├─ apps/
│  ├─ auth/        # Auth service (Express + JWT)
│  ├─ product/     # Product service (PostgreSQL + Redis)
│  ├─ order/       # Order service (calls product, stores orders)
│  └─ gateway/     # API gateway (JWT‑protected order routes)
├─ docker-compose.yml   # Spins up all services + DBs
├─ init.sql              # Initial DB schema (create tables)
└─ package.json          # Workspace root (Yarn/NPM workspaces)
```

## Getting started
### Prerequisites
- Docker & Docker‑Compose
- Node.js (if you want to run services locally without Docker)

### Running with Docker Compose
```bash
# From the repository root
docker-compose up --build
```
This will start:
- `postgres` on **5432**
- `redis` on **6379**
- `gateway` on **3000** (exposed on host)
- `auth` on **3001**
- `product` on **3002**
- `order` on **3003**

You can now interact with the API via the gateway, e.g.:
```bash
# Register a user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'

# Login to obtain a JWT token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}' | jq -r .accessToken)

# Create a product (no auth required)
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Cool Gadget","price":99.99}'

# List products (cached in Redis)
curl http://localhost:3000/products

# Create an order (JWT protected)
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'
```

### Running services locally (without Docker)
```bash
cd apps/auth && npm install && node src/main.js   # repeat for product, order, gateway
```
Make sure you have a PostgreSQL instance running and the appropriate environment variables set (`DATABASE_URL`, `JWT_SECRET`, etc.).

## License
This project is provided for educational purposes and is licensed under the MIT License.
