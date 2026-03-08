import { supabase } from './supabase'

export async function ensureTablesExist() {
  const { error: productsError } = await supabase
    .from('products')
    .select('id')
    .limit(1)

  if (productsError) {
    console.warn('Products table may not exist:', productsError.message)
  }

  const { error: ordersError } = await supabase
    .from('orders')
    .select('id')
    .limit(1)

  if (ordersError) {
    console.warn('Orders table may not exist:', ordersError.message)
  }
}
