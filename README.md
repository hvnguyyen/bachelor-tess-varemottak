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
- **Target Platform**: Tablet (landscape mode), responsive design

## Primary Functions (POC level)
1. [ ] Login with Entra ID
2. [ ] Overview of ongoing orders in transit (mock → real API)
3. [ ] Detailed view of order with tracking link to Bring
4. [ ] Possibility for goods receipt via barcode scan

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
