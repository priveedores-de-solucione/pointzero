'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PzMark } from '@/components/shared/public-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ApplicationType } from '@/lib/types';
import { Building2, Hammer, GraduationCap, Users, Briefcase, Handshake, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { applications } from '@/lib/api';
import { toast } from 'sonner';

const roles: { type: ApplicationType; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'founder', label: 'Founder', description: 'I have a startup idea or early product.', icon: Building2 },
  { type: 'builder', label: 'Builder', description: 'I want to build and contribute to startups.', icon: Hammer },
  { type: 'student', label: 'Student', description: 'I want to learn and participate.', icon: GraduationCap },
  { type: 'mentor', label: 'Mentor', description: 'I want to support and guide founders.', icon: Users },
  { type: 'investor', label: 'Investor', description: 'I want to discover and fund startups.', icon: Briefcase },
  { type: 'partner', label: 'Partner', description: 'I represent an organization.', icon: Handshake },
];

export default function ApplyPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<ApplicationType | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', country: '', city: '', motivation: '' });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await applications.submit({
        application_type: selected,
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        country: form.country || undefined,
        city: form.city || undefined,
        answers: form.motivation ? { motivation: form.motivation } : undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const segments = [1, 2, 3];

  const shell = (children: React.ReactNode) => (
    <div className="flex min-h-screen flex-col bg-pz-void">
      {/* minimal chrome */}
      <header className="border-b border-pz-border">
        <div className="pz-container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="POINTZERO home">
            <PzMark />
            <span className="font-display text-[15px] font-semibold tracking-[-0.02em] text-pz-white">POINTZERO</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-pz-text-dim transition-colors duration-150 hover:text-pz-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to site
          </Link>
        </div>
        <div className="flex gap-1" aria-hidden>
          {segments.map((n) => (
            <div key={n} className="h-0.5 flex-1 bg-pz-border">
              <div className={cn('h-full bg-pz-signal transition-all duration-200', submitted || n <= step ? 'w-full' : 'w-0')} />
            </div>
          ))}
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-12 md:py-20">{children}</main>
    </div>
  );

  if (submitted) {
    return shell(
      <div className="max-w-md">
        <CheckCircle2 className="h-10 w-10 text-pz-signal" />
        <h1 className="mt-6 font-display text-3xl font-bold tracking-[-0.03em] text-pz-white">Application submitted</h1>
        <p className="mt-3 leading-relaxed text-pz-text">
          We received your application. Our team reviews applications within 5 business days.
        </p>
        <Link href="/" className="mt-8 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-pz-text hover:text-pz-signal">
          Back to site <ArrowRight className="h-4 w-4" />
        </Link>
      </div>,
    );
  }

  const field = 'h-11 border-pz-border bg-pz-surface';

  return shell(
    <div className="w-full max-w-3xl">
      <p className="font-mono text-xs text-pz-signal">Step {step} of 3</p>

      {step === 1 && (
        <>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] text-pz-white">What are you here to do?</h1>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Role">
            {roles.map((r) => {
              const active = selected === r.type;
              return (
                <button
                  key={r.type}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelected(r.type)}
                  className={cn(
                    'flex flex-col items-start justify-start rounded-lg border p-5 text-left transition-colors duration-150',
                    active
                      ? 'border-pz-signal bg-pz-signal-dim'
                      : 'border-pz-border bg-pz-surface hover:border-pz-muted',
                  )}
                >
                  <r.icon className={cn('h-6 w-6', active ? 'text-pz-signal' : 'text-pz-text-dim')} />
                  <h3 className="mt-4 font-display text-base font-semibold text-pz-white">{r.label}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-pz-text-dim">{r.description}</p>
                </button>
              );
            })}
          </div>
          <Button size="lg" className="mt-10" disabled={!selected} onClick={() => setStep(2)}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </>
      )}

      {step === 2 && (
        <form
          className="max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(3);
          }}
        >
          <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] text-pz-white">About you</h1>
          <p className="mt-2 font-mono text-xs capitalize text-pz-text-dim">Applying as {selected}</p>
          <div className="mt-10 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" required className={field} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" required className={field} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required className={field} value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" type="tel" className={field} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" className={field} value={form.country} onChange={(e) => set('country', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="mt-10 flex gap-3">
            <Button type="button" size="lg" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" size="lg">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form className="max-w-xl" onSubmit={handleSubmit}>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] text-pz-white">Why POINTZERO?</h1>
          <div className="mt-10 space-y-1.5">
            <Label htmlFor="motivation">Why do you want to join POINTZERO?</Label>
            <Textarea
              id="motivation"
              rows={6}
              required
              className="border-pz-border bg-pz-surface"
              value={form.motivation}
              onChange={(e) => set('motivation', e.target.value)}
              placeholder="Tell us about your goals and what you hope to build..."
            />
          </div>
          <div className="mt-10 flex gap-3">
            <Button type="button" size="lg" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit application'}
            </Button>
          </div>
        </form>
      )}
    </div>,
  );
}
