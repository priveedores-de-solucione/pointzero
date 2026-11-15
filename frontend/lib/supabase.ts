import { createClient } from '@supabase/supabase-js';

/**
 * True when this page load is a Supabase auth redirect (Google/GitHub OAuth or an email
 * verification link) that carries the session in the URL hash. Captured at import time,
 * before the Supabase client strips the tokens from the URL. Password-recovery links are
 * excluded — those are handled by /reset-password.
 */
export const landedFromAuthRedirect: boolean = (() => {
  if (typeof window === 'undefined') return false;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return hash.has('access_token') && hash.get('type') !== 'recovery';
})();

/**
 * Single shared Supabase browser client.
 * (Creating more than one client causes "Multiple GoTrueClient instances" warnings
 * and racy session handling, so every module must import this one.)
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
