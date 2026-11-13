'use client';

import { useState } from 'react';
import { PublicPage } from '@/components/shared/public-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { partners as partnersApi } from '@/lib/api';

const partnerCategories = ['Technology', 'Capital', 'Education', 'Infrastructure', 'Media', 'Corporate', 'Government', 'Community'];

export default function PartnerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', organization: '', website: '', email: '', category: '', message: '' });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) {
      toast.error('Please select a partner category');
      return;
    }
    setSubmitting(true);
    try {
      await partnersApi.apply({
        organization: form.organization,
        partner_type: form.category,
        contact_email: form.email,
        website: form.website || undefined,
        description: `Contact: ${form.firstName} ${form.lastName}\n\n${form.message}`,
      });
      setSubmitted(true);
    } catch (err) {
      toast.error((err as Error).message || 'Could not submit inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <PublicPage>
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <CheckCircle2 className="h-16 w-16 text-primary" />
          <h2 className="mt-4 font-display text-3xl font-bold">Thank You</h2>
          <p className="mt-3 max-w-sm text-muted-foreground">
            We received your partnership inquiry. We will be in touch within 3 business days.
          </p>
        </div>
      </PublicPage>
    );
  }

  return (
    <PublicPage>
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight">Become a Partner</h1>
            <p className="mt-4 text-muted-foreground">
              Support the next generation of African builders and get access to talent, deal flow, and community.
            </p>
          </div>

          <form
            className="mt-10 space-y-5"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>First Name</Label>
                <Input required placeholder="Ada" value={form.firstName} onChange={set('firstName')} />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input required placeholder="Obi" value={form.lastName} onChange={set('lastName')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Organization</Label>
              <Input required placeholder="Company or institution name" value={form.organization} onChange={set('organization')} />
            </div>
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input type="url" placeholder="https://yourorg.com" value={form.website} onChange={set('website')} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" required placeholder="you@org.com" value={form.email} onChange={set('email')} />
            </div>
            <div className="space-y-1.5">
              <Label>Partner Category</Label>
              <Select required value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {partnerCategories.map((c) => (
                    <SelectItem key={c} value={c.toUpperCase()}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>How would you like to partner?</Label>
              <Textarea required rows={4} placeholder="Describe your partnership interest…" value={form.message} onChange={set('message')} />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Inquiry'}</Button>
          </form>
        </div>
      </section>
    </PublicPage>
  );
}