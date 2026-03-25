# Project Overview

A Vietnamese-language Next.js 16 luxury flower ritual platform "Nhất Tâm Hoa" (Eternal Roses). Built with TypeScript, Tailwind CSS v4, shadcn/ui components, Replit's built-in PostgreSQL database, and blockchain-style certificate hashing.

## Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Package Manager**: pnpm
- **Database**: Supabase PostgreSQL (`lib/supabase.ts` — exports a Supabase server client using `SUPABASE_SERVICE_ROLE_KEY`). All API routes use `@supabase/supabase-js` query builder.
- **Certificate**: Real Polygon blockchain (Amoy testnet) + SHA256 hash + server-side PDF generation (pdfkit + qrcode)
- **AI**: OpenAI API (with fallback templates)
- **Email**: nodemailer (optional, requires SMTP config)
- **Font**: fonts/DejaVuSans.ttf for Vietnamese support in PDFs

## Database Setup

All data is stored in **Supabase** (PostgreSQL). The Supabase client is initialized in `lib/supabase.ts`.

### Database Connection
- `lib/supabase.ts` exports a `supabase` server client using `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- All API routes import `{ supabase } from '@/lib/supabase'` and use the Supabase JS query builder
- Browser client (anon key) available via `createBrowserClient()` for future client-side use
- Supabase project: `boodwpdbinacuhwwvtuq.supabase.co`

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key (for browser client)
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (bypasses RLS, used server-side only)

### Tables

**products**: id (uuid), name, description, price, image_url, category, is_permanent_available (boolean), product_type, extra_images (jsonb array of URLs), description_images (jsonb array of URLs), created_at

**orders**: id (uuid), product_id, customer_id, sender_name, receiver_name, phone, message, ritual_type, offering, certificate_id, blockchain_hash, public_vow, permanence_type, status, created_at, receiver_phone, receiver_address, quantity

**certificates**: id (uuid), certificate_code, order_id, hash, blockchain_hash, blockchain_tx, qr_url, created_at

**customers**: id (uuid), phone, phone_normalized (generated), sender_name, receiver_name, email, total_orders, first_order_at, last_order_at, created_at, updated_at, receiver_phone, receiver_address, last_ai_message, fixed_receiver_name

### Order Status Lifecycle
`pending` → `paid` → `minting` → `minted` (or → `revoked` from minted)

### Immutability Rules
- **minted/revoked**: Fully immutable, no edits allowed
- **minting**: No edits allowed (in progress)
- **paid**: Only `message` field can be updated
- **permanent type**: `sender_name` and `receiver_name` cannot be changed at any status
- **Delete**: Blocked if a certificate exists for the order (FK constraint)

## Blockchain Certificate System

Real Polygon blockchain integration for immutable certificate storage.

### Deployed Contract
- **Network**: Polygon Amoy Testnet (free, EVM-compatible)
- **Contract**: `0x7Ec23f56591d0246bc1a3358916809174b70a76E`
- **Explorer**: https://amoy.polygonscan.com/address/0x7Ec23f56591d0246bc1a3358916809174b70a76E
- **Deployment info**: `blockchain/deployment-amoy.json`
- **Compiled ABI**: `blockchain/compiled.json`

### Environment Variables Required
- `PRIVATE_KEY` (Replit Secret) — wallet private key for signing transactions
- `NEXT_PUBLIC_RPC_URL` — set to `https://rpc-amoy.polygon.technology`
- `NEXT_PUBLIC_CONTRACT_ADDRESS` — set to the deployed contract address above
- `NEXT_PUBLIC_BLOCKCHAIN_NETWORK` — set to `amoy`

### Key Files
- `contracts/NhatTamCertificate.sol` — Solidity smart contract
- `lib/blockchain.ts` — `saveCertificateOnChain()` — sends real on-chain tx; falls back to simulated hash if env vars missing
- `scripts/compile-contract.js` — compiles contract (pnpm blockchain:compile)
- `scripts/generate-wallet.js` — generates new wallet (pnpm blockchain:wallet)
- `scripts/deploy-contract.js` — deploys to Amoy or mainnet (pnpm blockchain:deploy)

### Mint Flow
Order (status=paid) → POST /api/orders/[id]/mint → saveCertificateOnChain() → Polygon tx confirmed → certificate saved to DB with blockchain_tx → order status = minted

### Verify Page
`/verify/[code]` — shows certificate with clickable "Xem trên Polygon Blockchain ↗" link to PolygonScan

## Two Customer Flows

### Gift Flow
Product (from Gift Collection) → `/product/[id]?flow=gift` → "Đặt ngay" → `/checkout?flow=gift`
- All fields editable (sender, receiver, receiver_phone, receiver_address required)
- Returning customers: auto-fills but all fields remain editable

### Ritual Flow
Product (from Ritual Collection) → `/product/[id]?flow=ritual` → "Bắt đầu nghi lễ" → `/nghi-thuc?product_id=X` → `/chon-vat-chung` → `/checkout?flow=ritual`
- Returning customers: sender_name and receiver_name are locked
- receiver_phone and receiver_address are optional

### Customer Recognition
- Phone number stored in `localStorage` as `ntt_phone`
- On checkout, phone lookup via `/api/orders/lookup` returns customer data
- Customer data auto-upserted via `/api/customers` on order creation

## Pages

### Public Pages
- `/` - Home page with hero + 3 sections: "Gift Collection" (product grid) + "Ritual Collection" (product grid with ritual badges) + Live vows + Commitment
- `/product/[id]` - Product detail with two CTAs based on `?flow=gift|ritual`
- `/ready` - Ritual readiness with reflective questions + dual buttons
- `/moment` - Describe moment/intention
- `/moments` - Vow wall (loads from `/api/vows`, fallback to static)
- `/nghi-thuc` - Commitment checkboxes (3 promises before continuing); supports `?product_id=` query param to set selected product
- `/chon-vat-chung` - Select token/tier (sets product and routes to checkout with ritual flow)
- `/offering` - Choose offering
- `/checkout` - Checkout form with flow-aware fields (gift vs ritual), order summary with product image + quantity selector, AI message, certificate preview, public_vow toggle, permanence_type
- `/lookup` - Certificate code search
- `/certificate/[code]` - Certificate display + PDF download
- `/verify/[code]` - Public certificate verification page (QR target)
- `/ve-chung-toi` - About us
- `/nghe-thuat-bao-ton` - Conservation art
- `/hoi-dap` - FAQ

### Admin Pages
- `/admin/login` - Admin authentication (credentials: adm1/123)
- `/admin/dashboard` - Orders + Products management with full lifecycle controls

## Ritual Flow

### First-time User
Product Detail → /ready → /moment → /ritual → /offering → /checkout

### Returning User (localStorage `ntt_returning_user`)
Product Detail → /ready → /checkout (quick ritual)

### localStorage Keys
- `ntt_ritual_step` - Current ritual step
- `ntt_moment` - Moment/intention text
- `ntt_ritual_type` - Ritual type
- `ntt_offering` - Selected offering name
- `ntt_selected_product` - Selected product ID
- `ntt_permanence_type` - "temporary" or "permanent"
- `ntt_returning_user` - Returning user flag
- `ntt_phone` - Saved phone number for returning customer recognition
- `ntt_flow` - Current flow type ("gift" or "ritual")

## API Routes

### Products
- `GET /api/products` - List all products
- `GET /api/products/[id]` - Get single product
- `POST /api/products` - Create product (admin auth)
- `PUT /api/products/[id]` - Update product (admin auth)
- `DELETE /api/products/[id]` - Delete product (admin auth)

### Orders
- `POST /api/orders/create` - Create order (public)
- `GET /api/orders` - List orders (admin auth)
- `GET /api/orders/[id]` - Get single order (admin auth)
- `PUT /api/orders/[id]` - Update order (admin auth, enforces immutability rules)
- `DELETE /api/orders/[id]` - Delete order (admin auth, blocked if certificate exists)
- `POST /api/orders/[id]/mint` - Mint certificate (admin auth)
- `POST /api/orders/[id]/revoke` - Revoke order (admin auth)
- `GET /api/orders/stats` - Dashboard stats (admin auth)

### Customers
- `GET /api/customers?phone=X` - Lookup customer by phone
- `POST /api/customers` - Upsert customer (auto-called from order creation)

### Public
- `GET /api/orders/lookup?phone=X` - Phone lookup returning sender_name, receiver_name, receiver_phone, receiver_address, total_orders
- `GET /api/vows?limit=N` - Public vows feed (used by home page + moments page)
- `GET /api/certificate/[code]` - Certificate lookup (JSON)
- `GET /api/certificate/[code]/pdf` - Certificate PDF download
- `POST /api/generate-message` - AI message generation (OpenAI or templates)
- `POST /api/create-certificate` - Blockchain certificate creation
- `POST /api/upload` - Image upload (admin auth), saves to /public/uploads/

## Certificate System

- **Code**: Generated as NTH-XXXXXXXX (alphanumeric)
- **Hash**: SHA256 of sender|receiver|message|ritual|timestamp
- **Blockchain TX**: Simulated or real blockchain transaction hash
- **PDF**: Generated server-side with pdfkit (Vietnamese font + QR code linking to /verify/[code])

## Admin Authentication

- Server-side: Bearer token validation (Base64 of username:password)
- Client-side: localStorage session + token
- Credentials: adm1 / 123

## Environment Variables

- `DATABASE_URL` - Replit PostgreSQL connection string (set automatically)
- `OPENAI_API_KEY` (optional) - For AI message generation
- `NEXT_PUBLIC_RPC_URL` (optional) - Blockchain RPC URL
- `PRIVATE_KEY` (optional) - Blockchain wallet private key
- `NEXT_PUBLIC_CONTRACT_ADDRESS` (optional) - Smart contract address

## Dev Setup

- Dev server: `pnpm run dev` on port 5000
- Build: `pnpm run build`
- Start: `pnpm run start`
