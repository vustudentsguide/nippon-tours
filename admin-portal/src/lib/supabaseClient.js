import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || (!supabaseServiceRoleKey && !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables. Please create a .env file.')
}

// Use service role key for admin operations (bypasses RLS), fallback to anon key
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey)
