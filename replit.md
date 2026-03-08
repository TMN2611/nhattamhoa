# Project Overview

A Vietnamese-language Next.js 16 luxury flower brand website "Nhất Tâm Hoa" (Eternal Roses). Built with TypeScript, Tailwind CSS v4, shadcn/ui components, Prisma ORM, and blockchain integration on Polygon.

## Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Package Manager**: pnpm
- **Database**: SQLite via better-sqlite3 (direct driver)
- **Blockchain**: Ethers.js for Polygon smart contract interaction

## Pages

### Public Pages
- `/` - Home page
- `/san-sang` - Readiness check
- `/khoanh-khac` - Commitment moments showcase
- `/nghi-thuc` - Ritual ceremony
- `/chon-vat-chung` - Product selection
- `/checkout` - Checkout form
- `/hoi-dap` - FAQ
- `/loi-the` - Benefits
- `/nghe-thuat-bao-ton` - Conservation art
- `/nghi-thuc` - Ceremony
- `/quy-uoc` - Conventions
- `/ve-chung-toi` - About us
- `/product/[id]` - Product detail

### Admin Pages
- `/admin/login` - Admin authentication (credentials: adm1/123)
- `/admin/dashboard` - Order management dashboard

## Database

- **Driver**: better-sqlite3 (direct, no ORM adapter issues)
- **DB File**: `prisma/dev.db` (SQLite)
- **Schema**: Order table with id, buyerName, recipientName, phoneNumber, loveLetter, status, txHash, createdAt
- **Helper**: `lib/db.ts` - singleton pattern with auto-table creation
- **Status Values**: pending, recorded
- **Note**: Prisma v7 schema retained for reference but API routes use better-sqlite3 directly for reliability

## API Routes

- `POST /api/orders/create` - Create new order
- `GET /api/orders` - List all orders (admin)
- `POST /api/orders/record` - Record order on blockchain
- `GET /api/orders/stats` - Dashboard statistics

## Blockchain Integration

- **Smart Contract**: NhatTamCertificate.sol (Polygon network)
- **Functions**: createCertificate() stores order hash and emits events
- **Helper**: `lib/blockchain.ts` with saveCertificateOnChain()
- **Requires**: NEXT_PUBLIC_RPC_URL, NEXT_PUBLIC_CONTRACT_ADDRESS, PRIVATE_KEY

## Customer Flow

1. Browse website → Read about ritual
2. `/san-sang` - Readiness check
3. `/khoanh-khac` - View commitment moments
4. `/nghi-thuc` - Understand ritual
5. `/chon-vat-chung` - Select eternal rose tier
6. `/checkout` - Submit order
7. Order stored in database (pending status)
8. Admin reviews and clicks "Record on Blockchain"
9. Certificate becomes permanent with blockchain proof

## Admin Workflow

1. Navigate to `/admin/login`
2. Login with credentials (adm1/123)
3. Dashboard shows:
   - Total Orders, Pending, Recorded stats
   - Table of all orders with details
   - "Record on Blockchain" buttons for pending orders
4. Click button to record order and update status

## Dev Setup

- Dev server runs on `0.0.0.0:5000` via `pnpm run dev`
- Database: SQLite at `prisma/dev.db`
- Prisma config at `prisma.config.ts` with `DATABASE_URL="file:./prisma/dev.db"`

## Deployment

- Target: autoscale
- Build: `pnpm run build`
- Run: `pnpm run start`
- Requires environment variables: PRIVATE_KEY, NEXT_PUBLIC_RPC_URL, NEXT_PUBLIC_CONTRACT_ADDRESS
