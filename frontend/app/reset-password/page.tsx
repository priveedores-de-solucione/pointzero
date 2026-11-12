'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type Phase = 'checking' | 'ready' | 'invalid' | 'done';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword, signOut } = useAuth();
  const [phase, setPhase] = useState<Phase>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // The emailed link carries a recovery token; supabase-js turns it into a temporary session.
  useEffect(() => {
    let cancelled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' && !cancelled) setPhase('ready');
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) setPhase('ready');
      else setTimeout(() => { if (!cancelled) setPhase((p) => (p === 'checking' ? 'invalid' : p)); }, 1500);
    });

    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await updatePassword(password);
      setPhase('done');
      // End the recovery session so the user signs in fresh with the new password.
      await signOut();
      setTimeout(() => router.replace('/login'), 1800);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Could not update password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/logo.png" alt="Point Zero" height={24} width={96} priority />
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold">Set new password</h1>
        </div>

        {phase === 'checking' && (
          <p className="text-center text-sm text-muted-foreground">Verifying your reset link…</p>
        )}

        {phase === 'invalid' && (
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm text-muted-foreground">
              This reset link is invalid or has expired. Request a new one to continue.
            </p>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Request a new link
            </Link>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <p className="text-sm text-muted-foreground">
              Your password has been updated. Redirecting you to sign in…
            </p>
            <Link href="/login" className="text-sm text-primary hover:underline">Sign In</Link>
          </div>
        )}

        {phase === 'ready' && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                required
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
