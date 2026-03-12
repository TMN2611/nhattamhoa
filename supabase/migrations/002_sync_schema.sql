-- ============================================================
-- Migration 002: Sync Schema with Application Logic
-- Project: Nhất Tâm Hoa (Eternal Roses)
-- Date: 2026-03-12
-- Description:
--   1. Create `customers` table for returning customer tracking
--   2. Add `permanence_type` column to `orders` (if missing)
--   3. Add `is_permanent_available` to `products` (if missing)
--   4. Add `customer_id` FK to `orders` linking to `customers`
--   5. Add indexes for performance
--   6. Add CHECK constraints for data integrity
-- ============================================================

-- =====================
-- 1. CUSTOMERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS customers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone         text NOT NULL,
  phone_normalized text GENERATED ALWAYS AS (REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) STORED,
  sender_name   text NOT NULL,
  receiver_name text NOT NULL,
  email         text,
  total_orders  integer NOT NULL DEFAULT 0,
  first_order_at timestamp with time zone,
  last_order_at  timestamp with time zone,
  created_at    timestamp with time zone DEFAULT now(),
  updated_at    timestamp with time zone DEFAULT now()
);

-- Unique constraint on normalized phone to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_phone_normalized
  ON customers (REGEXP_REPLACE(phone, '[^0-9]', '', 'g'));

-- =====================
-- 2. PRODUCTS: ensure `is_permanent_available` column exists
-- =====================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_permanent_available'
  ) THEN
    ALTER TABLE products ADD COLUMN is_permanent_available boolean DEFAULT true;
  END IF;
END $$;

-- =====================
-- 3. ORDERS: ensure all required columns exist
-- =====================

-- 3a. permanence_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'permanence_type'
  ) THEN
    ALTER TABLE orders ADD COLUMN permanence_type text DEFAULT 'temporary';
  END IF;
END $$;

-- 3b. public_vow
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'public_vow'
  ) THEN
    ALTER TABLE orders ADD COLUMN public_vow boolean DEFAULT true;
  END IF;
END $$;

-- 3c. phone (nullable → ensure exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'phone'
  ) THEN
    ALTER TABLE orders ADD COLUMN phone text;
  END IF;
END $$;

-- 3d. customer_id FK column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_id uuid;
  END IF;
END $$;

-- 3e. Add FK constraint: orders.customer_id → customers.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_customer_id_fkey' AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_customer_id_fkey
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =====================
-- 4. CHECK CONSTRAINTS
-- =====================

-- permanence_type must be 'temporary' or 'permanent'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'orders_permanence_type_check'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_permanence_type_check
      CHECK (permanence_type IN ('temporary', 'permanent'));
  END IF;
END $$;

-- status must be one of the valid lifecycle values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'orders_status_check'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_status_check
      CHECK (status IN ('pending', 'paid', 'minting', 'minted', 'revoked'));
  END IF;
END $$;

-- =====================
-- 5. INDEXES for performance
-- =====================

-- Orders: lookup by phone (normalized for consistent matching)
CREATE INDEX IF NOT EXISTS idx_orders_phone_normalized
  ON orders (REGEXP_REPLACE(phone, '[^0-9]', '', 'g'));

-- Orders: lookup by customer_id
CREATE INDEX IF NOT EXISTS idx_orders_customer_id
  ON orders (customer_id);

-- Orders: public vow feed (newest first, only public vows)
CREATE INDEX IF NOT EXISTS idx_orders_public_vow_feed
  ON orders (created_at DESC)
  WHERE public_vow = true AND status IN ('pending', 'paid', 'minted');

-- Orders: by status for admin dashboard
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders (status);

-- Certificates: lookup by order_id
CREATE INDEX IF NOT EXISTS idx_certificates_order_id
  ON certificates (order_id);

-- =====================
-- 6. BACKFILL CUSTOMERS FROM EXISTING ORDERS
-- =====================
-- This populates the customers table from existing order data.
-- For each unique normalized phone, it takes the most recent order's names.
INSERT INTO customers (phone, sender_name, receiver_name, total_orders, first_order_at, last_order_at)
SELECT
  o.phone,
  o.sender_name,
  o.receiver_name,
  o.order_count,
  o.first_order,
  o.last_order
FROM (
  SELECT DISTINCT ON (REGEXP_REPLACE(phone, '[^0-9]', '', 'g'))
    phone,
    sender_name,
    receiver_name,
    COUNT(*) OVER (PARTITION BY REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) AS order_count,
    MIN(created_at) OVER (PARTITION BY REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) AS first_order,
    MAX(created_at) OVER (PARTITION BY REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) AS last_order
  FROM orders
  WHERE phone IS NOT NULL AND phone != ''
  ORDER BY REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), created_at DESC
) o
ON CONFLICT DO NOTHING;

-- Link existing orders to their customer records
UPDATE orders o
SET customer_id = c.id
FROM customers c
WHERE o.customer_id IS NULL
  AND o.phone IS NOT NULL
  AND o.phone != ''
  AND REGEXP_REPLACE(o.phone, '[^0-9]', '', 'g') = REGEXP_REPLACE(c.phone, '[^0-9]', '', 'g');

-- =====================
-- 7. FUNCTION: auto-update `updated_at` on customers
-- =====================
CREATE OR REPLACE FUNCTION update_customer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_updated_at();

-- ============================================================
-- SCHEMA SUMMARY AFTER MIGRATION:
--
-- products
--   id                     uuid PK (gen_random_uuid)
--   name                   text NOT NULL
--   description            text
--   price                  numeric NOT NULL
--   image_url              text
--   category               text
--   is_permanent_available boolean DEFAULT true
--   created_at             timestamptz DEFAULT now()
--
-- customers (NEW)
--   id                uuid PK (gen_random_uuid)
--   phone             text NOT NULL
--   phone_normalized  text (GENERATED: digits only)
--   sender_name       text NOT NULL
--   receiver_name     text NOT NULL
--   email             text
--   total_orders      integer DEFAULT 0
--   first_order_at    timestamptz
--   last_order_at     timestamptz
--   created_at        timestamptz DEFAULT now()
--   updated_at        timestamptz DEFAULT now()
--   UNIQUE INDEX on phone_normalized
--
-- orders
--   id              uuid PK (gen_random_uuid)
--   product_id      uuid FK → products(id) ON DELETE SET NULL
--   customer_id     uuid FK → customers(id) ON DELETE SET NULL  (NEW)
--   sender_name     text NOT NULL
--   receiver_name   text NOT NULL
--   phone           text
--   message         text NOT NULL
--   ritual_type     text
--   offering        text
--   certificate_id  text UNIQUE
--   blockchain_hash text
--   public_vow      boolean DEFAULT true
--   permanence_type text DEFAULT 'temporary' CHECK (IN temporary, permanent)
--   status          text NOT NULL DEFAULT 'pending' CHECK (lifecycle values)
--   created_at      timestamptz DEFAULT now()
--
-- certificates
--   id               uuid PK (gen_random_uuid)
--   certificate_code text NOT NULL UNIQUE
--   order_id         uuid FK → orders(id) ON DELETE RESTRICT
--   hash             text
--   blockchain_hash  text
--   blockchain_tx    text
--   qr_url           text
--   created_at       timestamptz DEFAULT now()
--
-- FK RELATIONSHIPS:
--   orders.product_id  → products.id  (ON DELETE SET NULL)
--   orders.customer_id → customers.id (ON DELETE SET NULL)
--   certificates.order_id → orders.id (ON DELETE RESTRICT)
-- ============================================================
