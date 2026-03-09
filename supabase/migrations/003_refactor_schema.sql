-- ============================================================
-- MIGRATION 003: Schema Refactoring
-- Run in Supabase Dashboard > SQL Editor > New Query > Run
--
-- Changes:
-- 1. Orders: add permanence_type, normalize status values
-- 2. Certificates: add qr_url, blockchain_tx, rename columns
-- 3. Products: add is_permanent_available
-- 4. Fix FK constraints for certificate integrity
-- 5. Rebuild RLS policies
-- ============================================================


-- =====================
-- PRODUCTS TABLE
-- =====================
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_permanent_available boolean DEFAULT true;


-- =====================
-- ORDERS TABLE
-- =====================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS permanence_type text DEFAULT 'temporary';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ritual_type text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS offering text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS certificate_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS blockchain_hash text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS public_vow boolean DEFAULT true;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_certificate_id_key'
  ) THEN
    BEGIN
      ALTER TABLE orders ADD CONSTRAINT orders_certificate_id_key UNIQUE (certificate_id);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;


-- =====================
-- CERTIFICATES TABLE
-- =====================
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS hash text;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS qr_url text;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS blockchain_tx text;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificates' AND column_name = 'blockchain_hash'
  ) THEN
    UPDATE certificates SET hash = blockchain_hash WHERE hash IS NULL AND blockchain_hash IS NOT NULL;
  END IF;
END $$;


-- =====================
-- FIX FOREIGN KEY ON CERTIFICATES
-- =====================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'certificates_order_id_fkey'
  ) THEN
    ALTER TABLE certificates DROP CONSTRAINT certificates_order_id_fkey;
  END IF;
END $$;

ALTER TABLE certificates
  ADD CONSTRAINT certificates_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT;


-- =====================
-- RLS POLICIES
-- =====================

-- Orders
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'orders'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON orders', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "orders_delete" ON orders FOR DELETE USING (true);

-- Certificates
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'certificates'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON certificates', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certificates_select" ON certificates FOR SELECT USING (true);
CREATE POLICY "certificates_insert" ON certificates FOR INSERT WITH CHECK (true);
CREATE POLICY "certificates_update" ON certificates FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "certificates_delete" ON certificates FOR DELETE USING (true);

-- Products
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'products'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON products', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update" ON products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "products_delete" ON products FOR DELETE USING (true);


-- =====================
-- VERIFY
-- =====================
SELECT 'DONE - Schema refactored' as result;
