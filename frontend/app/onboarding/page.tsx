'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, dashboardPathForRole, needsOnboarding } from '@/context/auth-context';
import { auth as authApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ROLES = [
  { value: 'FOUNDER', label: 'Founder', description: 'Building a startup' },
  { value: 'BUILDER', label: 'Builder', description: 'Technical talent / freelancer' },
  { value: 'STUDENT', label: 'Student', description: 'Learning and exploring' },
  { value: 'MENTOR', label: 'Mentor', description: 'Guiding founders' },
  { value: 'INVESTOR', label: 'Investor', description: 'Funding opportunities' },
  { value: 'PARTNER', label: 'Partner', description: 'Organisation or ecosystem partner' },
] as const;

type Role = typeof ROLES[number]['value'];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser, loading } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill names if the backend already has them (e.g. after email sign-up).
  useEffect(() => {
    if (user) {
      if (user.first_name) setFirstName(user.first_name);
      if (user.last_name) setLastName(user.last_name);
    }
  }, [user]);

  // If the user is already fully onboarded, skip this page.
  useEffect(() => {
    if (!loading && user && !needsOnboarding(user)) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [user, loading, router]);

  // Not logged in — send to login.
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error('Please choose a role to continue');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.completeProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role: selectedRole,
      });
      const fresh = await refreshUser();
      toast.success('Profile complete — welcome to POINTZERO!');
      router.replace(dashboardPathForRole(fresh?.role ?? selectedRole));
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/logo.png" alt="Point Zero" height={24} width={96} priority />
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold">Complete your profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us who you are so we can personalise your experience.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                required
                placeholder="Jeremiah"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                required
                placeholder="Adewale"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>I am joining as a…</Label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setSelectedRole(r.value)}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-colors',
                    selectedRole === r.value
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border bg-background hover:bg-accent',
                  )}
                >
                  <p className="text-sm font-semibold">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting || !selectedRole}>
            {submitting ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}