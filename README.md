# Bachelor Project – Digital Goods Receipt (POC)
**Collaboration with TESS AS**
![TESS Logo](https://ny.tess.no/globalassets/logoer/tess/logo_header.svg?h=30&q=80)
A **Proof of Concept** application for digital goods receipt on tablet, developed as a bachelor's thesis in collaboration with TESS AS.

## Background
TESS AS has over 140 locations in Norway and a central warehouse. Today, manual packing slips are used for supplies from the central warehouse to locations. This project explores how a digital goods receipt on tablet can replace pen and paper, save time and streamline the process.

## Goals of the POC
- Display overview of orders that are on the way (tracking via Bring integration)
- Facilitate digital goods receipt (future barcode scanning + API registration)
- Demonstrate simple, intuitive user experience adapted to tablet in landscape mode
- Use TESS's existing backend API via proxy routes

**Important:** This is a **Proof of Concept** – not a full production solution.

## Tech Stack
- **Frontend**: Next.js 16.1.6 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Microsoft Entra ID (Azure AD)
- **API**: Proxy routes in Next.js → TESS backend API
- **Target Platform**: Tablet (landscape/portrait mode), responsive design

## Swagger UI and Proxy API
https://30011-proxyapi-cuafeua6bha7ckby.norwayeast-01.azurewebsites.net/swagger/#/

## Primary Functions (POC level)
1. [ ] Login with Entra ID through Tenant and SSO (SSO temporary paused)
3. [ ] Goods receipt with barcode scanner
2. [ ] Overview with possibility for detailed view on orders in transit
4. [ ] Possibile expansion with tracking link to Bring (outside of primary scope)

## Getting Started
### Prerequisites
- Node.js ≥ 18
- npm / pnpm / yarn

### Installation
```bash
# 1. Clone the repo
git clone https://github.com/hvnguyyen/bachelor-tess-varemottak.git
cd bachelor-tess-varemottak

# 2. Install dependencies
npm install
# or pnpm install / yarn install

# 3. Start development server
npm run dev
# Open http://localhost:3000 in the browser
