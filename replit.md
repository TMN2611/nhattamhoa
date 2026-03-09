# Project Overview

A Vietnamese-language Next.js 16 luxury flower ritual platform "Nhất Tâm Hoa" (Eternal Roses). Built with TypeScript, Tailwind CSS v4, shadcn/ui components, Supabase database, and blockchain-style certificate hashing.

## Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Package Manager**: pnpm
- **Database**: Supabase (PostgreSQL)
- **Certificate**: SHA256 hash + server-side PDF generation (pdfkit + qrcode)
- **AI**: OpenAI API (with fallback templates)
- **Email**: nodemailer (optional, requires SMTP config)
- **Font**: fonts/DejaVuSans.ttf (actually NotoSans-Regular.ttf, 569KB) for Vietnamese support in PDFs

## Pages

### Public Pages
- `/` - Home page with hero + product grid + live vow feed
- `/product/[id]` - Product detail (from Supabase, fallback to static)
- `/ready` - Ritual readiness with reflective questions + dual buttons
- `/moment` - Describe moment/intention
- `/moments` - Vow wall (loads from Supabase orders, fallback to static)
- `/ritual` - Commitment checkboxes (3 promises before continuing)
- `/offering` - Choose offering (products from Supabase with permanent/temporary selector)
- `/checkout` - Checkout form + AI message + certificate preview + public_vow toggle + permanence_type
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

### Flow Enforcement
Each step sets `ntt_ritual_step` in localStorage. Pages check the step and redirect to /ready if out of order.

### localStorage Keys
- `ntt_ritual_step` - Current ritual step
- `ntt_moment` - Moment/intention text
- `ntt_ritual_type` - Ritual type
- `ntt_offering` - Selected offering name
- `ntt_selected_product` - Selected product ID
- `ntt_permanence_type` - "temporary" or "permanent"
- `ntt_returning_user` - Returning user flag

## Database (Supabase)

### Products Table
id, name, description, price, image_url, category, is_permanent_available (boolean, default true), created_at

### Orders Table
id, product_id, sender_name, receiver_name, phone, message, ritual_type, offering, certificate_id, blockchain_hash, public_vow, permanence_type (text, default 'temporary'), status, created_at

### Certificates Table
id, certificate_code, order_id, hash, blockchain_hash, blockchain_tx, qr_url, created_at

### Order Status Lifecycle
`pending` → `paid` → `minting` → `minted` (or → `revoked` from minted)

### Immutability Rules
- **minted/revoked**: Fully immutable, no edits allowed
- **minting**: No edits allowed (in progress)
- **paid**: Only `message` field can be updated
- **permanent type**: `sender_name` and `receiver_name` cannot be changed at any status
- **Delete**: Blocked if a certificate exists for the order (FK constraint)

### Setup
1. Run `supabase/migrations/001_create_tables.sql` in Supabase SQL Editor
2. Run `supabase/migrations/002_fix_tables.sql` to add missing columns and fix RLS policies
3. Run `supabase/migrations/003_refactor_schema.sql` for lifecycle schema (permanence_type, certificate hash/tx/qr, is_permanent_available)

## API Routes

### Products
- `GET /api/products` - List all products (includes is_permanent_available)
- `GET /api/products/[id]` - Get single product
- `POST /api/products` - Create product (admin auth, includes is_permanent_available)
- `PUT /api/products/[id]` - Update product (admin auth)
- `DELETE /api/products/[id]` - Delete product (admin auth)

### Orders
- `POST /api/orders/create` - Create order (public, accepts permanence_type, no certificate created)
- `GET /api/orders` - List orders (admin auth)
- `GET /api/orders/[id]` - Get single order
- `PUT /api/orders/[id]` - Update order (admin auth, enforces immutability rules)
- `DELETE /api/orders/[id]` - Delete order (admin auth, blocked if certificate exists)
- `POST /api/orders/[id]/mint` - Mint certificate + blockchain hash (admin auth, pending/paid → minting → minted)
- `POST /api/orders/[id]/revoke` - Revoke order (admin auth, sets status=revoked)
- `GET /api/orders/stats` - Dashboard stats (admin auth)

### Certificates
- `GET /api/certificate/[code]` - Certificate lookup (JSON, includes hash/blockchain_tx/qr_url)
- `GET /api/certificate/[code]/pdf` - Certificate PDF download (server-side, Vietnamese text, QR → /verify/[code])

### Other
- `POST /api/generate-message` - AI message generation (OpenAI or templates)

## Certificate System

- **Code**: Generated as NTH-XXXXXXXX (alphanumeric)
- **Hash**: SHA256 of sender|receiver|message|ritual|timestamp
- **Blockchain TX**: Simulated blockchain transaction hash
- **PDF**: Generated server-side with pdfkit (Vietnamese font + QR code linking to /verify/[code])
- **Lookup**: /lookup → /certificate/[code]
- **Verify**: /verify/[code] — public page showing cert status, hash, blockchain data
- **QR Code**: Each PDF contains a QR code linking to /verify/[code]
- **Creation**: Certificates are created during admin mint action ONLY (not on order creation)
- **Mint rollback**: On mint failure, order reverts to 'paid' status

## Admin Dashboard

- **Order lifecycle buttons**: Mark Paid (pending→paid), Mint (→minting→minted), Revoke (minted→revoked)
- **Edit form**: Respects immutability rules (disables locked fields, shows warnings)
- **Delete**: Only for pending orders without certificates
- **Products tab**: Full CRUD with is_permanent_available toggle

## Admin Authentication

- Server-side: Bearer token validation (Base64 of username:password)
- Client-side: localStorage session + token
- Credentials: adm1 / 123
- Token: `YWRtMToxMjM=`

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- `OPENAI_API_KEY` (optional) - For AI message generation

## Dev Setup

- Dev server: `pnpm run dev` on port 5000
- Build: `pnpm run build`
- Start: `pnpm run start`

## Deployment

- Target: autoscale
- Build: `pnpm run build`
- Run: `pnpm run start`
