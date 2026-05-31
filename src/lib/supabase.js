// ─────────────────────────────────────────────
//  Supabase Client
//  src/lib/supabase.js
//
//  Single shared instance for the entire app.
//  Reads credentials from .env (VITE_ prefix).
// ─────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[SSA] Missing Supabase credentials. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Store Supabase session in localStorage automatically
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
