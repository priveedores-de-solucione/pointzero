'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      // Always show the same message so we never reveal whether an email is registered.
      setSent(true);
    } catch (err: unknown) {
      const e2 = err as { status?: number; message?: string };
      if (e2.status === 429) {
        toast.error('Too many requests. Please wait a minute and try again.');
      } else {
        // Don't leak account existence; treat other errors as "sent".
        setSent(true);
      }
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
          <h1 className="mt-6 font-display text-2xl font-bold">Reset password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email and we will send a reset link.
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <p className="text-sm text-muted-foreground">
              If that email is in our system, you will receive a reset link shortly.
            </p>
            <Link href="/login" className="text-sm text-primary hover:underline">Back to Sign In</Link>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send Reset Link'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">Back to Sign In</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}