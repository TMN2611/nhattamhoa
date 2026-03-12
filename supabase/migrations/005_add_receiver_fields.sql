-- Migration 005: Add receiver_phone, receiver_address, last_ai_message
-- Run in Supabase SQL Editor

ALTER TABLE orders ADD COLUMN IF NOT EXISTS receiver_phone text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS receiver_address text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1;

ALTER TABLE customers ADD COLUMN IF NOT EXISTS receiver_phone text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS receiver_address text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_ai_message text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS fixed_receiver_name text;
