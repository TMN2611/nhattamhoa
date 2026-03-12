-- ============================================================
-- Migration 003: Sync Supabase Schema with Codebase
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PRODUCTS: add missing columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category text;

-- 2. ORDERS: add missing columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS permanence_type text DEFAULT 'temporary';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id uuid;

-- 3. CUSTOMERS: add missing column
ALTER TABLE customers ADD COLUMN IF NOT EXISTS receiver_name text;

-- 4. CERTIFICATES: add missing columns
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS hash text;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS blockchain_tx text;

-- 5. FK: orders.customer_id → customers.id
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

-- 6. FK: orders.product_id → products.id (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_product_id_fkey' AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 7. FK: certificates.order_id → orders.id (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'certificates_order_id_fkey' AND table_name = 'orders'
  ) THEN
    ALTER TABLE certificates
      ADD CONSTRAINT certificates_order_id_fkey
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- 8. CHECK constraints
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

-- 9. Indexes
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders (phone);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_public_vow_feed ON orders (created_at DESC) WHERE public_vow = true;
CREATE INDEX IF NOT EXISTS idx_certificates_order_id ON certificates (order_id);

-- 10. UNIQUE constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_certificate_id_key' AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_certificate_id_key UNIQUE (certificate_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'certificates_certificate_code_key' AND table_name = 'certificates'
  ) THEN
    ALTER TABLE certificates ADD CONSTRAINT certificates_certificate_code_key UNIQUE (certificate_code);
  END IF;
END $$;

-- 11. Enable RLS + allow full access (same as original migration)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policies for products
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Products are manageable by anyone" ON products;
CREATE POLICY "Products are manageable by anyone" ON products FOR ALL USING (true) WITH CHECK (true);

-- Policies for orders
DROP POLICY IF EXISTS "Orders are viewable by everyone" ON orders;
CREATE POLICY "Orders are viewable by everyone" ON orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Orders are manageable by anyone" ON orders;
CREATE POLICY "Orders are manageable by anyone" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Policies for certificates
DROP POLICY IF EXISTS "Certificates are viewable by everyone" ON certificates;
CREATE POLICY "Certificates are viewable by everyone" ON certificates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Certificates are manageable by anyone" ON certificates;
CREATE POLICY "Certificates are manageable by anyone" ON certificates FOR ALL USING (true) WITH CHECK (true);

-- Policies for customers
DROP POLICY IF EXISTS "Customers are viewable by everyone" ON customers;
CREATE POLICY "Customers are viewable by everyone" ON customers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Customers are manageable by anyone" ON customers;
CREATE POLICY "Customers are manageable by anyone" ON customers FOR ALL USING (true) WITH CHECK (true);
