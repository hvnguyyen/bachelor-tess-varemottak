# TESS Digitalt Varemottak

PoC web application for authentication, goods receipt registration, tracking, and receipt history in collaboration with TESS.

The project was originally designed around internal Next.js proxy routes for TESS data. The final solution uses a mixed architecture:

- direct browser calls to TESS API for user, order, and warehouse data
- internal backend/API routes only for receipt persistence and retrieval
- PostgreSQL-backed receipt history for shared storage across sessions and browsers

## 1. Final Architecture

### Runtime architecture

The deployed application consists of these parts:

- `Next.js web app`
  - login flow
  - dashboard
  - goods receipt
  - parcel tracking
  - receipt history
- `TESS API`
  - authentication
  - `/user`
  - `/order/...`
  - `/warehouse`
  - `/warehouse/getAllCustomerWarehouse?...`
- `Receipt API` inside the app
  - `GET /api/receipts`
  - `POST /api/receipts`
- `PostgreSQL`
  - persistent storage of previously registered receipts

### Data flow

#### Authentication

Authentication is completed through TESS / Entra ID in the browser. After successful login, the app validates the user through:

- `GET ${NEXT_PUBLIC_API_BASE_URL}/user`

with:

- `credentials: "include"`

This means the solution depends on the browser being allowed to send the TESS session cookies.

#### Orders and warehouses

Orders and warehouses are fetched directly from the browser to TESS API:

- `GET https://api.tessix.no/order/...`
- `GET https://api.tessix.no/warehouse`
- `GET https://api.tessix.no/warehouse/getAllCustomerWarehouse?...`

These calls no longer go through internal proxy routes in the active UI flow.

#### Receipts

Registered goods receipts are stored through the app's own backend:

- frontend submits receipt payload to `POST /api/receipts`
- backend persists the receipt to PostgreSQL when `DATABASE_URL` is configured
- receipt history is fetched through `GET /api/receipts`

## 2. Local Setup

### Prerequisites

- Node.js 20+
- npm
- access to TESS login flow
- browser that allows third-party cookies during login/testing

### Install dependencies

```bash
npm install
```

### Local environment

Create or update:

- `/Users/jakob/Desktop/2026/Bachelor/Kode/bachelor-tess-varemottak/.env.local`

Recommended baseline:

```txt
NEXT_PUBLIC_API_BASE_URL=https://api.tessix.no
TESS_API_BASE_URL=https://api.tessix.no

NEXT_PUBLIC_USE_MOCK_API=false
USE_MOCK_API=false

DATABASE_URL=postgres://...
```

Notes:

- `NEXT_PUBLIC_API_BASE_URL` is the critical variable for browser calls to TESS.
- `NEXT_PUBLIC_USE_MOCK_API=false` disables the temporary TTM/mock login in the normal setup.
- If you change a `NEXT_PUBLIC_*` variable, restart the dev server.

### Start locally

```bash
npm run dev
```

Default local URL:

- [http://localhost:8080](http://localhost:8080)

### Local verification

Expected working flow:

1. login with `Tenant` or `SSO`
2. app validates user through TESS `/user`
3. `goods-receipt` fetches orders directly from TESS
4. `track-parcel` fetches orders and warehouses directly from TESS
5. `receipts` reads/writes receipt history through `/api/receipts`

## 3. Render Setup

### Required environment variables

Set these on the Render web service:

```txt
NEXT_PUBLIC_API_BASE_URL=https://api.tessix.no
TESS_API_BASE_URL=https://api.tessix.no

NEXT_PUBLIC_USE_MOCK_API=false
USE_MOCK_API=false

DATABASE_URL=postgres://...
```

Notes:

- `NEXT_PUBLIC_*` variables are build-time variables in Next.js.
- If you change `NEXT_PUBLIC_USE_MOCK_API`, you must redeploy.
- The web service should point to the branch containing the final flow you want to run.

### Browser requirement

In practice, authentication and direct TESS API access depend on browser cookies being allowed.

For testing, especially in incognito/private windows, make sure:

- third-party cookies are allowed

If not, login may fail when the app tries to validate:

- `GET https://api.tessix.no/user`

### Expected deployed behavior

In the final deployed solution:

- `/dashboard` should not be directly usable without a valid local profile state
- `goods-receipt` should call TESS API directly for orders
- `track-parcel` should call TESS API directly for warehouse/order data
- `/receipts` should show persisted receipt history from backend storage

## 4. Receipts Database

### What is stored

The receipt backend stores:

- receipt id
- submitted timestamp
- employee id
- customer number
- number of scanned items
- registered barcodes and scan timestamps

### Backend implementation

Relevant files:

- `/Users/jakob/Desktop/2026/Bachelor/Kode/bachelor-tess-varemottak/app/api/receipts/route.ts`
- `/Users/jakob/Desktop/2026/Bachelor/Kode/bachelor-tess-varemottak/lib/server/receiptStore.ts`

The store will:

- use PostgreSQL when `DATABASE_URL` is present
- create required schema automatically on first use
- read/write receipts from the database

### Seed and fallback behavior

The project still contains:

- `/Users/jakob/Desktop/2026/Bachelor/Kode/bachelor-tess-varemottak/data/receipts.json`

This file is used as:

- seed/fallback source
- migration source if the database starts empty

This means earlier locally stored receipt examples can appear in the deployed history if they were imported when the database was initialized.

### Why this matters

This is the main phase 4 backend improvement:

- receipt history is no longer limited to one browser's `localStorage`
- previously registered goods receipts can be read back through backend storage
- receipt history is shared across sessions as long as the app uses the same backend database

## 5. Known Limitations and Architectural Compromises

### Browser-based TESS data integration

The original architecture aimed to use internal proxy routes for TESS order and warehouse calls. That was not kept as the final active path.

Final compromise:

- the browser calls TESS API directly for `/user`, `/order`, and `/warehouse`
- the app backend is used only for receipt persistence

Reason:

- a stable and verifiable server-side session/token bridge between TESS authentication and the app backend was not achieved within project constraints

Consequence:

- the solution is less architecturally clean than a full backend-mediated model
- the frontend is more tightly coupled to TESS API behavior and browser cookie handling

### Cookie dependency

The solution depends on:

- browser session state with TESS
- `credentials: "include"`
- third-party cookies being allowed in the browser during testing

If cookies are blocked, login and direct TESS data calls may fail.

### Receipt storage scope

The receipt solution is backend-based and database-backed, but it is still a PoC-oriented implementation.

It should be understood as:

- strong enough for the project and demonstration
- not a full enterprise-grade receipt platform

### Security model

The application relies on TESS authentication for access to TESS data, but the app does not implement a full standalone authorization model for receipt storage beyond the current request/user context used in the PoC.

## Relevant Files

### Authentication and user flow

- `/Users/jakob/Desktop/2026/Bachelor/Kode/bachelor-tess-varemottak/features/auth/login/LoginPage.tsx`
- `/Users/jakob/Desktop/2026/Bachelor/Kode/bachelor-tess-varemottak/app/auth/complete/page.tsx`
- `/Users/jakob/Desktop/2026/Bachelor/Kode/bachelor-tess-varemottak/lib/useRequiredUserProfile.ts`
- `/Users/jakob/Desktop/2026/Bachelor/Kode/bachelor-tess-varemottak/lib/userProfile.ts`

### TESS data access

- `/Users/jakob/Desktop/2026/Bachelor/Kode/bachelor-tess-varemottak/lib/ordersClient.ts`
- `/Users/jakob/Desktop/2026/Bachelor/Kode/bachelor-tess-varemottak/lib/warehousesClient.ts`

### Receipts

- `/Users/jakob/Desktop/2026/Bachelor/Kode/bachelor-tess-varemottak/features/goods-receipt/GoodsReceiptPage.tsx`
- `/Users/jakob/Desktop/2026/Bachelor/Kode/bachelor-tess-varemottak/features/receipts/ReceiptHistoryPage.tsx`
- `/Users/jakob/Desktop/2026/Bachelor/Kode/bachelor-tess-varemottak/app/api/receipts/route.ts`
- `/Users/jakob/Desktop/2026/Bachelor/Kode/bachelor-tess-varemottak/lib/server/receiptStore.ts`

## Summary

The final solution delivers:

- working authentication through TESS/Entra in browser context
- working goods receipt and parcel tracking through direct browser calls to TESS API
- backend-based persistent receipt history through the app's own API and PostgreSQL

This represents the final practical architecture chosen for the project after the original proxy-based approach proved too unstable for reliable deployment within the available timeframe.
