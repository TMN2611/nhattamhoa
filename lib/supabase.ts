// Supabase has been replaced with Replit's built-in PostgreSQL database.
// All database access now uses lib/db.ts (pg Pool via DATABASE_URL).
// This file exports a compatibility shim so old imports don't break during migration.

import pool from './db'

// supabaseAdmin shim - converts chained Supabase-style calls to pg queries
// This is NOT used in production; all routes have been migrated to direct pg calls.
export const supabaseAdmin = pool
export const supabase = pool
export default pool
