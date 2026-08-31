# NAAZ Ecommerce — Medusa v2 Setup & Architecture Guide

## Overview

This project uses **Medusa v2** (`@medusajs/medusa` v2.19.0) as its core headless commerce engine. Medusa serves as the single source of truth for all commerce primitives including product catalog management, inventory tracking, cart management, pricing, customer management, orders, and sales channels.

---

## System Requirements & Prerequisites

- **Node.js**: v20.19+ or v24.x
- **Package Manager**: `npm` / `pnpm`
- **Database Engine**: PostgreSQL 16+ (Embedded or Local Service on Port `5432`)

---

## Project Structure

```
HandBags/
├── backend/                  # Official Medusa v2 Backend Monorepo
│   └── apps/
│       └── backend/          # Core Medusa v2 Application (@dtc/backend)
│           ├── src/          # Custom Modules, Workflows & API Routes
│           ├── medusa-config.ts # Medusa Configuration
│           ├── .env          # Active Environment Variables
│           └── .env.example  # Clean Environment Template
├── scripts/
│   └── start-postgres.js    # Embedded PostgreSQL 16 Database Daemon
├── public/                   # NAAZ Frontend & Branding Layer (index.html)
└── MEDUSA_SETUP.md           # Setup Documentation (This file)
```

---

## Development Setup & Installation

### Step 1: Start PostgreSQL Database Server

Start the local PostgreSQL 16 database engine:
```bash
node scripts/start-postgres.js
```
*This starts a local PostgreSQL instance listening on `postgres://postgres@localhost:5432/postgres`.*

### Step 2: Configure Environment Variables

Create `.env` in `backend/apps/backend/`:

```env
STORE_CORS=http://localhost:8000,http://localhost:9000,http://localhost:5173
ADMIN_CORS=http://localhost:5173,http://localhost:9000,http://localhost:7001
AUTH_CORS=http://localhost:5173,http://localhost:9000,http://localhost:7001
JWT_SECRET=supersecret_naaz_jwt_token_key_2026
COOKIE_SECRET=supersecret_naaz_cookie_token_key_2026
DATABASE_URL=postgres://postgres@localhost:5432/postgres
DB_NAME=postgres
```

### Step 3: Run Medusa Database Migrations

Execute Medusa database migrations:
```bash
cd backend/apps/backend
npx @medusajs/cli db:migrate
```

### Step 4: Start Medusa Backend & Admin Dashboard

Run the development server:
```bash
cd backend/apps/backend
npm run dev
```

The Medusa server starts at:
- **Store API**: `http://localhost:9000/store`
- **Admin API**: `http://localhost:9000/admin`
- **Admin Dashboard**: `http://localhost:9000/app` (or `http://localhost:7001`)

---

## Frontend Architecture & Integration (NAAZ Storefront)

The custom NAAZ frontend (`public/index.html`) consumes Medusa's REST API endpoints:

```
NAAZ Frontend (public/index.html)
       │
       ▼  HTTP REST Requests
Medusa Storefront API (http://localhost:9000/store)
       │
       ▼
Medusa Commerce Primitives (Products, Carts, Orders, Regions)
       │
       ▼
PostgreSQL Database (Port 5432)
```

### Key API Mappings:
- **Fetch Products**: `GET /store/products`
- **Create Cart**: `POST /store/carts`
- **Add Line Item**: `POST /store/carts/{id}/line-items`
- **Complete Order**: `POST /store/carts/{id}/complete`

---

## Markaz CSV Integration Architecture

Markaz product imports flow through Medusa's standard product import workflow:

```
Markaz CSV File (Supplier Feed)
       │
       ▼  Parse & Transform
Medusa Admin Product Import API / Workflow
       │
       ▼
Medusa Catalog & Inventory Modules
       │
       ▼
NAAZ Storefront Catalog
```

---

## Security Primitives

- Admin credentials, supplier cost structures, and secrets remain strictly in `backend/apps/backend/.env`.
- Public storefront only accesses `/store` endpoints.
