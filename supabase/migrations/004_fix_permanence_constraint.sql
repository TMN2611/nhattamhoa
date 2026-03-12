-- ============================================================
-- Migration 004: Fix permanence_type constraint on Supabase
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ============================================================

-- Drop existing broken constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_permanence_type_check;

-- Re-create with correct values (allow NULL for backward compat)
ALTER TABLE orders ADD CONSTRAINT orders_permanence_type_check
  CHECK (permanence_type IS NULL OR permanence_type IN ('temporary', 'permanent'));

-- Set proper default
ALTER TABLE orders ALTER COLUMN permanence_type SET DEFAULT 'temporary';
