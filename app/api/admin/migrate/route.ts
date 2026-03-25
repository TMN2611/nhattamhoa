export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/admin-utils'
import { Pool } from 'pg'

const BANNERS_DDL = `
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  image_url text NOT NULL,
  link_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
`

const PRODUCTS_EXTRA_COLS = `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='extra_images') THEN
    ALTER TABLE public.products ADD COLUMN extra_images jsonb DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='description_images') THEN
    ALTER TABLE public.products ADD COLUMN description_images jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
`

export async function POST(req: Request) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  const dbUrl = process.env.SUPABASE_DB_URL
  if (!dbUrl) {
    return NextResponse.json({ error: 'SUPABASE_DB_URL not set' }, { status: 500 })
  }

  const pool = new Pool({ connectionString: dbUrl, max: 1, connectionTimeoutMillis: 10000, ssl: { rejectUnauthorized: false } })

  try {
    const client = await pool.connect()
    try {
      const hostCheck = await client.query("SELECT inet_server_addr() as host, current_database() as db")
      results.push(`Connected to: ${JSON.stringify(hostCheck.rows[0])}`)

      await client.query(BANNERS_DDL)
      results.push('Banners table: OK')

      await client.query(PRODUCTS_EXTRA_COLS)
      results.push('Products extra columns: OK')

      // Notify PostgREST to reload schema cache
      await client.query("NOTIFY pgrst, 'reload schema'")
      results.push('Schema cache reload notified')

    } finally {
      client.release()
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, results }, { status: 500 })
  } finally {
    await pool.end()
  }
}
