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
- **Font**: DejaVuSans.ttf for Vietnamese support in PDFs

## Pages

### Public Pages
- `/` - Home page with hero + product grid + live vow feed
- `/product/[id]` - Product detail (from Supabase, fallback to static)
- `/ready` - Ritual readiness with reflective questions + dual buttons
- `/moment` - Describe moment/intention
- `/moments` - Vow wall (loads from Supabase orders, fallback to static)
- `/ritual` - Commitment checkboxes (3 promises before continuing)
- `/offering` - Choose offering (3 products with prices)
- `/checkout` - Checkout form + AI message + certificate preview + public_vow toggle
- `/lookup` - Certificate code search
- `/certificate/[code]` - Certificate display + PDF download
- `/ve-chung-toi` - About us
- `/nghe-thuat-bao-ton` - Conservation art
- `/hoi-dap` - FAQ

### Admin Pages
- `/admin/login` - Admin authentication (credentials: adm1/123)
- `/admin/dashboard` - Orders + Products management (tabs)

## Ritual Flow

### First-time User
Product Detail → /ready → /moment → /ritual → /offering → /checkout

### Returning User (localStorage `ntt_returning_user`)
Product Detail → /ready → /checkout (quick ritual)

### Flow Enforcement
Each step sets `ntt_ritual_step` in localStorage. Pages check the step and redirect to /ready if out of order.

## Database (Supabase)

### Products Table
id, name, description, price, image_url, category, created_at

### Orders Table
id, product_id, sender_name, receiver_name, phone, message, ritual_type, offering, certificate_id, blockchain_hash, public_vow, status, created_at

### Certificates Table
id, certificate_code, order_id, blockchain_hash, created_at

### Setup
1. If tables don't exist: Run `supabase/migrations/001_create_tables.sql` in Supabase SQL Editor
2. If tables exist but orders fail: Run `supabase/migrations/002_fix_tables.sql` to add missing columns and fix RLS policies

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
- `GET /api/orders/[id]` - Get order
- `PUT /api/orders/[id]` - Update order (admin auth)
- `DELETE /api/orders/[id]` - Delete order (admin auth)
- `POST /api/orders/record` - Update order status (admin auth)
- `GET /api/orders/stats` - Dashboard stats (admin auth)

### Other
- `POST /api/generate-message` - AI message generation (OpenAI or templates)
- `GET /api/certificate/[code]` - Certificate lookup (JSON data)
- `GET /api/certificate/[code]/pdf` - Certificate PDF download (server-side, Vietnamese text, QR code)

## Certificate System

- **Code**: Generated as NTH-XXXXXXXX (alphanumeric)
- **Hash**: SHA256 of sender|receiver|message|ritual|timestamp
- **PDF**: Generated server-side with pdfkit (Vietnamese font + QR code linking to /certificate/[code])
- **Lookup**: /lookup → /certificate/[code]
- **QR Code**: Each PDF contains a QR code linking to the certificate verification page

## Admin Authentication

- Server-side: Bearer token validation (Base64 of username:password)
- Client-side: localStorage session + token
- Credentials: adm1 / 123

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- `OPENAI_API_KEY` (optional) - For AI message generation
- `DATABASE_URL` (legacy) - SQLite path (no longer primary)

## Dev Setup

- Dev server: `pnpm run dev` on port 5000
- Build: `pnpm run build`
- Start: `pnpm run start`

## Deployment

- Target: autoscale
- Build: `pnpm run build`
- Run: `pnpm run start`
