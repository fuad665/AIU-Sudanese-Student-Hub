// ─────────────────────────────────────────────
//  Supabase Client
//  src/lib/supabase.js
//
//  Single shared instance for the entire app.
//  Reads credentials from .env (VITE_ prefix).
// ─────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://oydscytbdhpwyrmffosj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZHNjeXRiZGhwd3lybWZmb3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTYzOTYsImV4cCI6MjA5NTczMjM5Nn0.DExaTVuNCZgw2FsOUO8uC_iRJf0434Mlwmcit-eIL_w';

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
