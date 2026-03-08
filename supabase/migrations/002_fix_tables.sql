-- ============================================================
-- COPY AND PASTE THIS ENTIRE SCRIPT INTO:
-- Supabase Dashboard > SQL Editor > New Query > Run
-- 
-- This fixes ALL issues:
-- 1. Adds missing columns to orders table
-- 2. Fixes RLS policies so orders can be inserted
-- 3. Ensures certificates table is correct
-- ============================================================


-- STEP 1: Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ritual_type text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS offering text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS certificate_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS blockchain_hash text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS public_vow boolean DEFAULT true;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_id uuid;


-- STEP 2: Make certificate_id unique (ignore if already set)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_certificate_id_key'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_certificate_id_key UNIQUE (certificate_id);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- STEP 3: Fix RLS policies on orders (drop all existing, recreate)
DO $$
DECLARE
  pol RECORD;
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


-- STEP 4: Fix RLS policies on certificates
DO $$
DECLARE
  pol RECORD;
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


-- STEP 5: Fix RLS policies on products
DO $$
DECLARE
  pol RECORD;
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


-- STEP 6: Verify everything worked
SELECT 'ORDERS COLUMNS:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders' ORDER BY ordinal_position;

SELECT 'CERTIFICATES COLUMNS:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'certificates' ORDER BY ordinal_position;

SELECT 'RLS POLICIES:' as info;
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename IN ('orders', 'certificates', 'products');
