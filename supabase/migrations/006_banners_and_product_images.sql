CREATE TABLE IF NOT EXISTS public.banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  image_url text NOT NULL,
  link_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='extra_images') THEN
    ALTER TABLE public.products ADD COLUMN extra_images jsonb DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='description_images') THEN
    ALTER TABLE public.products ADD COLUMN description_images jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
