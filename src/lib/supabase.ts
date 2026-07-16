import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side supabase instance (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side helper if you need service role access
export function getServerSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing Service Role Key');
  return createClient(supabaseUrl, serviceKey);
}
