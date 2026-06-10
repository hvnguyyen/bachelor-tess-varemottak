# Architecture Overview

> Oppdatert for `fase3-sporing`. Tidlegare versjon dekka fase1 med simulert login og mock-data.

---

## Systemarkitektur – request-flyt

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER                            │
│                                                         │
│  LoginPage  DashboardPage  TrackParcelPage  GoodsReceipt│
│      │            │               │               │     │
│      └────────────┴───────────────┴───────────────┘     │
│                          │                              │
│            fetch(..., {credentials: "include"})         │
└──────────────────────────┼──────────────────────────────┘
                           │  HTTP + httpOnly accessToken cookie
┌──────────────────────────▼──────────────────────────────┐
│               NEXT.JS API ROUTES (server)               │
│                                                         │
│  /api/auth/login     /api/auth/logout                   │
│  /api/me             /api/mock-auth/[mode]              │
│  /api/orders         /api/warehouses                    │
│  /api/receipts                                          │
│                                                         │
│  ┌─────────────────────────────────────────┐            │
│  │ isMockApiMode()                         │            │
│  │  USE_MOCK_API=true  ──► mock-respons    │            │
│  │  (elles)            ──► ekte TESS API   │            │
│  └─────────────────────────────────────────┘            │
│                                                         │
│  ordersProxy.ts → tessOrdersClient (Axios)              │
│    Token-prioritet:                                     │
│    1. request.cookies.get("accessToken")                │
│    2. process.env.TESS_ACCESS_TOKEN  (dev-fallback)     │
└────────────────┬────────────────────────────────────────┘
                 │  Cookie: accessToken=...
    ┌────────────▼────────────────────┐
    │   TESS_ORDERS_API_BASE_URL      │  ← Azure proxy
    │   (30011-proxyapi-*.azure..)    │
    └────────────┬────────────────────┘
                 │
    ┌────────────▼────────────────────┐
    │   api.tessix.no                 │  ← Ekte TESS-backend
    └─────────────────────────────────┘
```

---

## Auth-flyt

```
         Browser          Next.js API        MS Entra ID       TESS API
            │                  │                  │                │
── PROD ────┼──────────────────┼──────────────────┼────────────────┼──
            │ click "Tenant"   │                  │                │
            ├── POST /api/auth/logout ────────────►                │
            │◄── 200 (cookie cleared) ────────────┤                │
            │                  │                  │                │
            │ redirect ────────────────────────────► MS Entra ID   │
            │◄── redirect /auth/complete ──────────┤                │
            │                  │                  │                │
            ├── fetch NEXT_PUBLIC_API_BASE_URL/user (credentials: include) ──►
            │◄── {userName, customerNumber, ...} ──────────────────┤
            │ saveUserProfile → localStorage       │                │
            │ router.push("/dashboard")            │                │
            │                  │                  │                │
── DEV ─────┼──────────────────┼──────────────────┼────────────────┼──
            │ click "TTM ID"   │                  │                │
            ├── GET /api/mock-auth/tenant ────────►│                │
            │◄── redirect /login?mockAuth=success  │                │
            │                  │                  │                │
            ├── POST /api/auth/login ─────────────►│                │
            │  {idToken, accessToken}              │                │
            │         isMockApiMode()=true         │                │
            │         set httpOnly cookie          │                │
            │◄── {ok: true, mock: true} ──────────┤                │
            │                  │                  │                │
            ├── GET /api/me ──────────────────────►│                │
            │         returns getMockMeResponse()  │                │
            │◄── {userName, customerNumber} ───────┤                │
            │ saveUserProfile → localStorage       │                │
            │ router.push("/dashboard")            │                │
```

---

## Rute- og sidekart

| Rute | Feature-modul | Formål |
| --- | --- | --- |
| `/` | – | Redirect til `/login` |
| `/login` | `features/auth/login/` | Innloggingsside (Tenant / SSO / TTM ID) |
| `/auth/complete` | `app/auth/complete/` | Callback etter Entra ID-login, henter brukarprofil |
| `/dashboard` | `features/dashboard/` | Hovudmeny med handlingskort |
| `/goods-receipt` | `features/goods-receipt/` | Varemottak (strekkodeskanning + manuell) |
| `/track-parcel` | `features/track-parcel/` | Ordresporing med filter og paginering |
| `/receipts` | `features/receipts/` | Historikk over registrerte varemottak |
| `/archive` | `features/archive/` | Placeholder (ikkje i scope) |

---

## Komponenttre

```
RootLayout (app/layout.tsx)
│
├── LoginPage (features/auth/login/LoginPage.tsx)
│   ├── Knapp: "Logg inn som Tenant"  → redirect Entra ID CIAM
│   ├── Knapp: "SSO"                  → redirect Entra ID SSO
│   └── Knapp: "TTM ID" (dev)         → GET /api/mock-auth/tenant
│
├── AuthCompletePage (app/auth/complete/page.tsx)
│   └── Hentar brukarprofil → localStorage → /dashboard
│
├── DashboardPage (features/dashboard/)
│   ├── Header: brukarnamn + logout
│   └── ActionCard × 2
│       ├── → /goods-receipt   "Varemottak"
│       └── → /track-parcel    "Sporing"
│
├── GoodsReceiptPage (features/goods-receipt/)
│   ├── Scanner             (html5-qrcode, kamera)
│   ├── ManualEntry         (tekstfelt-fallback)
│   ├── ItemsList           (skanna varer + submit)
│   ├── OrdersOverview      (ordrar for kunden)
│   └── ReceiptConfirmationModal
│
├── TrackParcelPage (features/track-parcel/)
│   └── Søk + filter + paginert ordreoversikt
│       (lager-filter, status-kode-filter, fritekstsøk)
│
├── ReceiptHistoryPage (features/receipts/)
│   └── Historikk frå localStorage (useSyncExternalStore)
│
└── ArchivePage (features/archive/)
    └── Statisk placeholder
```

---

## Datamodell

```
Order
├── orderId: number
├── orderNumber: string
├── date: string (ISO)
├── customerNumber: string
├── companyName?: string
├── warehouseName?: string
├── orderAmendedDate?: string (ISO)
└── orderLines: OrderLine[]
       ├── orderLineNumber: number
       ├── itemNumber / itemName: string
       ├── quantity: number
       ├── unit: string              ("stk", "pkt" …)
       ├── netPrice / lineSum: number
       ├── lineStatus: number        (statuskode 1–9)
       └── orderLineAmendedDate?: string (ISO)

       │  mapOrderToTrackingOrder()
       ▼

TrackingOrder  (avleda visningsmodell i lib/tracking.ts)
├── currentLocationLabel: string   (companyName + warehouseName)
├── statusValues: number[]         (unike statuskodane, sortert)
├── statusLabel: string            ("Kode 2" / "Koder 1 / 3 / 5")
├── lastUpdatedAt: string | null   (maks av alle amended-datoar)
└── orderLines: OrderLine[]

Warehouse
├── warehouseNumber: string
└── warehouseName: string          (filtrert: tom + "BRUKES IKKE" fjerna)

StoredReceipt  (localStorage)
├── receiptId: "temp-receipt-{timestamp}"
├── submittedAt: number
├── customerNumber / employeeId: string
└── items: { barcode: string, timestamp: number }[]

UserProfile  (localStorage)
├── employeeId / name: string
├── defaultCustomerNumber: string | null
├── defaultWarehouseNumber: string | null
└── customerNumbers: string[]
```

---

## API-ruter

| Rute | Metode | Mock? | Proxies til | Formål |
| --- | --- | --- | --- | --- |
| `/api/auth/login` | POST | Ja | `TESS_API_BASE_URL/login/cookie` | Exchange tokens → httpOnly cookie |
| `/api/auth/logout` | POST | – | – | Slett cookie |
| `/api/me` | GET | Ja | `TESS_API_BASE_URL/user` | Hent brukarprofil |
| `/api/mock-auth/[mode]` | GET | Kun dev | – | Generer mock-tokens (krev USE_MOCK_API=true) |
| `/api/orders` | GET | Nei | `TESS_ORDERS_API_BASE_URL/order/{customerNr}` | Hent ordrar med paginering |
| `/api/warehouses` | GET | Nei | `TESS_ORDERS_API_BASE_URL/warehouse/getAllCustomerWarehouse` | Hent lagerliste |
| `/api/receipts` | POST | Ja | – | Registrer varemottak (localStorage) |

---

## Kva brukar ekte API vs mock

| Feature | Ekte API | Mock | Lagring |
| --- | --- | --- | --- |
| Login (Tenant/SSO) | ✓ | – | httpOnly cookie |
| Login (TTM ID) | – | ✓ | httpOnly cookie |
| Brukarprofil (/api/me) | ✓ | fallback | localStorage |
| Ordrehenting | ✓ | – | – |
| Lagerliste | ✓ | – | – |
| Varemottak-submit | – | ✓ | localStorage |
| Kvitteringshistorikk | – | – | localStorage |

---

## Avhengigheiter mellom lib-filer

```
apiMode.ts            ← isMockApiMode() – brukt av alle API-ruter
tessClient.ts         ← Axios-instans mot TESS_API_BASE_URL (login, /user)
ordersProxy.ts        ← token-henting + proxy-kall for ordrar
  ├── ordersClient.ts ← Axios-instans mot TESS_ORDERS_API_BASE_URL
  └── orders.ts       ← typar (Order, OrderLine, GetOrdersApiResponse)
tracking.ts           ← mapOrderToTrackingOrder(), TrackingOrder-type
warehousesClient.ts   ← Axios-instans for lagerkall
warehouses.ts         ← Warehouse-type + normalizeWarehouses()
userProfile.ts        ← extract/save/get UserProfile ↔ localStorage
receiptHistory.ts     ← localStorage + custom events for useSyncExternalStore
receipts.ts           ← StoredReceipt-type + createReceipt()
```

---

## Miljøvariablar

| Variabel | Side | Formål |
| --- | --- | --- |
| `TESS_API_BASE_URL` | Server | Hovud-TESS API (login, /user) |
| `TESS_ORDERS_API_BASE_URL` | Server | Azure-proxy for ordrar/lager |
| `TESS_ACCESS_TOKEN` | Server | Dev-fallback token (viss inga cookie) |
| `USE_MOCK_API` | Server | `"true"` = aktiver mock-modus |
| `NEXT_PUBLIC_API_BASE_URL` | Klient | Ekstern TESS-base for auth-redirect |
| `NEXT_PUBLIC_USE_MOCK_API` | Klient | `"true"` = vis TTM ID-knapp i login |

---

## Viktige designval

| Val | Løysing | Grunn |
| --- | --- | --- |
| Page-mønster | Tynne `app/`-wrapparar + `features/`-modular | Skil routing frå forretningslogikk |
| Session | httpOnly cookie (`accessToken`) | JS-koden kjem ikkje til tokenen |
| Orders API | Azure-proxy framfor direkte `api.tessix.no` | Cloudflare blokkerer server-side kall til tessix.no |
| Token-fallback | `TESS_ACCESS_TOKEN` i `.env.local` | Lokal dev utan full login-flyt |
| Varemottak-lagring | localStorage (ikkje TESS API) | API-integrasjon ikkje tilgjengeleg i POC |
| Kvitteringshistorikk | `useSyncExternalStore` + custom events | Sanntidsoppdatering på tvers av faner |
| Filtrering | Blanding server-side (paginering) + klient-side (søk/filter) | Reduserer API-kall, fleksibel UI |
