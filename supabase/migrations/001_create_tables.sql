-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  category text,
  created_at timestamp with time zone DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  sender_name text NOT NULL,
  receiver_name text NOT NULL,
  phone text NOT NULL,
  message text NOT NULL,
  ritual_type text,
  offering text,
  certificate_id text UNIQUE,
  blockchain_hash text,
  public_vow boolean DEFAULT true,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Allow public insert for products (admin will use anon key)
CREATE POLICY "Products are insertable by anyone" ON products
  FOR ALL USING (true) WITH CHECK (true);

-- Allow public read access to orders (for certificate lookup)
CREATE POLICY "Orders are viewable by everyone" ON orders
  FOR SELECT USING (true);

-- Allow public insert/update/delete for orders
CREATE POLICY "Orders are manageable by anyone" ON orders
  FOR ALL USING (true) WITH CHECK (true);

-- Seed initial products
INSERT INTO products (name, description, price, image_url, category) VALUES
  ('Hồng Đỏ Vĩnh Cửu', 'Một bông hồng đỏ thắm được bảo tồn vĩnh viễn trong hộp nhung đen sang trọng. Biểu tượng của tình yêu bất diệt.', 2500000, '/images/product-1.jpg', 'Hoa Hồng'),
  ('Hồng Hồng Trong Lồng Kính', 'Bông hồng hồng pastel được bảo tồn trong lồng kính pha lê, đế gỗ tự nhiên. Như câu chuyện Hoàng Tử Bé.', 3200000, '/images/product-2.jpg', 'Lồng Kính'),
  ('Hộp Hồng Trắng Tinh Khôi', 'Bộ sưu tập hồng trắng bất tử trong hộp quà đen matte. Sự thuần khiết của một lời hứa trọn đời.', 4800000, '/images/product-3.jpg', 'Hộp Quà'),
  ('Hồng Nhung Trái Tim', 'Hồng nhung burgundy trong hộp trái tim nhung đen, điểm vàng lá. Dành cho người bạn yêu nhất.', 3500000, '/images/product-4.jpg', 'Hộp Quà'),
  ('Bộ Sưu Tập Hoàng Gia', 'Bộ sưu tập hồng vàng và đỏ phối hợp trong hộp vuông luxury. Dành cho những dịp đặc biệt nhất.', 8500000, '/images/product-5.jpg', 'Bộ Sưu Tập')
ON CONFLICT DO NOTHING;

-- If tables already exist, add public_vow column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'public_vow'
  ) THEN
    ALTER TABLE orders ADD COLUMN public_vow boolean DEFAULT true;
  END IF;
END $$;
