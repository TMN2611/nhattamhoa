import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://boodwpdbinacuhwwvtuq.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_5nDvWEkLlTk3h9LP9kDpDw_mBqboDqg"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
