'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, postAuthPath } from '@/context/auth-context';

/**
 * Landing page for OAuth (Google/GitHub) and email-verification redirects.
 * Loads the backend profile INTO the auth context (via refreshUser → loadProfile) so the
 * rest of the app has user state immediately, then routes to onboarding or the role dashboard.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // avoid double-run in React strict mode
    ran.current = true;

    (async () => {
      try {
        const profile = await refreshUser();
        router.replace(profile ? postAuthPath(profile) : '/login');
      } catch {
        router.replace('/login');
      }
    })();
  }, [refreshUser, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground text-sm">Signing you in…</p>
    </div>
  );
}
