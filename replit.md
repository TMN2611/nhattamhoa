# Project Overview

A Vietnamese-language Next.js 16 luxury flower ritual platform "Nhất Tâm Hoa" (Eternal Roses). Built with TypeScript, Tailwind CSS v4, shadcn/ui components, Supabase PostgreSQL database, and blockchain-style certificate hashing.

## Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Package Manager**: npm
- **Database**: Supabase PostgreSQL (`lib/supabase.ts` — exports `supabase` for public client, `supabaseAdmin` for service-role operations). All API routes use Supabase as primary database.
- **Database (legacy)**: Replit built-in PostgreSQL (`lib/db.ts`) — no longer used by any API routes
- **Certificate**: SHA256 hash + server-side PDF generation (pdfkit + qrcode)
- **AI**: OpenAI API (with fallback templates)
- **Email**: nodemailer (optional, requires SMTP config)
- **Font**: fonts/DejaVuSans.ttf (actually NotoSans-Regular.ttf, 569KB) for Vietnamese support in PDFs

## Database Setup

The primary database is Supabase PostgreSQL. All API routes use `supabaseAdmin` from `lib/supabase.ts`. The Replit PostgreSQL is still provisioned but no longer used by any API routes.

### Database Connection
- **Supabase (primary)**: `lib/supabase.ts` exports `supabase` (anon key, for public reads) and `supabaseAdmin` (service role key, for admin writes)
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/publishable key
  - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (secret)
- **Replit PostgreSQL (legacy)**: `lib/db.ts` exports a `pg.Pool` using `DATABASE_URL` — no longer used

### Tables

**products**: id (uuid), name, description, price, image_url, category, is_permanent_available (boolean), created_at

**orders**: id (uuid), product_id, customer_id, sender_name, receiver_name, phone, message, ritual_type, offering, certificate_id, blockchain_hash, public_vow, permanence_type, status, created_at, receiver_phone*, receiver_address*, quantity* (*pending migration 005)

**certificates**: id (uuid), certificate_code, order_id, hash, blockchain_hash, blockchain_tx, qr_url, created_at

**customers**: id (uuid), phone, phone_normalized, sender_name, receiver_name, email, total_orders, first_order_at, last_order_at, created_at, updated_at, receiver_phone*, receiver_address*, last_ai_message* (*pending migration 005)

### Order Status Lifecycle
`pending` → `paid` → `minting` → `minted` (or → `revoked` from minted)

### Immutability Rules
- **minted/revoked**: Fully immutable, no edits allowed
- **minting**: No edits allowed (in progress)
- **paid**: Only `message` field can be updated
- **permanent type**: `sender_name` and `receiver_name` cannot be changed at any status
- **Delete**: Blocked if a certificate exists for the order (FK constraint)

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
- `GET /api/customers?phone=X` - Lookup customer by phone (public)
- `POST /api/customers` - Upsert customer (auto-called from order creation)

### Public
- `GET /api/orders/lookup?phone=X` - Phone lookup returning sender_name, receiver_name, receiver_phone, receiver_address, last_ai_message, total_orders
- `GET /api/vows?limit=N` - Public vows feed (used by home page + moments page)
- `GET /api/certificate/[code]` - Certificate lookup (JSON)
- `GET /api/certificate/[code]/pdf` - Certificate PDF download
- `POST /api/generate-message` - AI message generation (OpenAI or templates)
- `POST /api/create-certificate` - Blockchain certificate creation

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

- Dev server: `npm run dev` on port 5000
- Build: `npm run build`
- Start: `npm run start`
