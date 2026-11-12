import { createClient } from '@supabase/supabase-js';

/**
 * Single shared Supabase browser client.
 * (Creating more than one client causes "Multiple GoTrueClient instances" warnings
 * and racy session handling, so every module must import this one.)
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
