'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingState } from '@/components/shared/states';
import { toast } from 'sonner';
import { useApi } from '@/hooks/use-api';
import { investors as investorsApi, ApiError, Investor } from '@/lib/api';
import { humanize } from '@/lib/mappers';

const investorTypes = ['ANGEL', 'VC', 'FAMILY_OFFICE', 'CORPORATE_VC', 'ACCELERATOR', 'FUND', 'SYNDICATE', 'INSTITUTION'];
const typeLabel = (t: string) => (t === 'VC' || t === 'CORPORATE_VC' ? t.replace('_', ' ').replace('CORPORATE', 'Corporate') : humanize(t));

const list = (v: string) => v.split(',').map((s) => s.trim()).filter(Boolean);

type Form = {
  organization: string; investor_type: string; website: string; linkedin: string; country: string;
  investment_thesis: string; industries: string; investment_stage: string; geographies: string;
  investment_range_min: string; investment_range_max: string;
};

const toForm = (i?: Investor | null): Form => ({
  organization: i?.organization ?? '',
  investor_type: i?.investor_type ?? '',
  website: i?.website ?? '',
  linkedin: i?.linkedin ?? '',
  country: i?.country ?? '',
  investment_thesis: i?.investment_thesis ?? '',
  industries: (i?.industries ?? []).join(', '),
  investment_stage: (i?.investment_stage ?? []).join(', '),
  geographies: (i?.geographies ?? []).join(', '),
  investment_range_min: i?.investment_range_min?.toString() ?? '',
  investment_range_max: i?.investment_range_max?.toString() ?? '',
});

export default function InvestorProfilePage() {
  // 404 = no investor profile yet → this page becomes the application form.
  const { data: investor, loading, refetch } = useApi(
    () => investorsApi.me().catch((e: ApiError) => (e.status === 404 ? null : Promise.reject(e))),
    [],
  );
  const [form, setForm] = useState<Form>(toForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(toForm(investor)), [investor]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body: Partial<Investor> = {
      organization: form.organization,
      investor_type: form.investor_type,
      website: form.website || undefined,
      linkedin: form.linkedin || undefined,
      country: form.country || undefined,
      investment_thesis: form.investment_thesis || undefined,
      industries: list(form.industries),
      investment_stage: list(form.investment_stage),
      geographies: list(form.geographies),
      investment_range_min: form.investment_range_min ? Number(form.investment_range_min) : undefined,
      investment_range_max: form.investment_range_max ? Number(form.investment_range_max) : undefined,
    };
    setSaving(true);
    try {
      if (investor) await investorsApi.updateMe(body);
      else await investorsApi.apply(body);
      toast.success(investor ? 'Profile saved' : 'Application submitted. We will verify your account shortly.');
      refetch();
    } catch (err) {
      toast.error((err as ApiError).message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell type="investor" title="Profile" subtitle={investor ? 'Manage your investor profile' : 'Apply for investor access'}>
      {loading ? (
        <LoadingState />
      ) : (
        <form onSubmit={submit} className="max-w-2xl space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Investor Information</CardTitle>
              {investor?.verification_status && (
                <Badge variant={investor.verification_status === 'VERIFIED' ? 'default' : 'secondary'}>
                  {humanize(investor.verification_status)}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Organization</Label><Input placeholder="Firm or fund" value={form.organization} onChange={set('organization')} required /></div>
                <div className="space-y-1.5">
                  <Label>Investor Type</Label>
                  <Select value={form.investor_type} onValueChange={(v) => setForm({ ...form, investor_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {investorTypes.map((t) => <SelectItem key={t} value={t}>{typeLabel(t)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Website</Label><Input type="url" placeholder="https://" value={form.website} onChange={set('website')} /></div>
                <div className="space-y-1.5"><Label>LinkedIn</Label><Input placeholder="linkedin.com/in/you" value={form.linkedin} onChange={set('linkedin')} /></div>
              </div>
              <div className="space-y-1.5"><Label>Country</Label><Input value={form.country} onChange={set('country')} /></div>
              <div className="space-y-1.5"><Label>Investment Thesis</Label><Textarea rows={4} placeholder="What do you look for in founders and startups?" value={form.investment_thesis} onChange={set('investment_thesis')} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Min cheque (USD)</Label><Input type="number" min={0} value={form.investment_range_min} onChange={set('investment_range_min')} /></div>
                <div className="space-y-1.5"><Label>Max cheque (USD)</Label><Input type="number" min={0} value={form.investment_range_max} onChange={set('investment_range_max')} /></div>
              </div>
              <div className="space-y-1.5"><Label>Industries (comma separated)</Label><Input placeholder="FinTech, AgriTech" value={form.industries} onChange={set('industries')} /></div>
              <div className="space-y-1.5"><Label>Stages (comma separated)</Label><Input placeholder="Pre-seed, Seed" value={form.investment_stage} onChange={set('investment_stage')} /></div>
              <div className="space-y-1.5"><Label>Geographies (comma separated)</Label><Input placeholder="Nigeria, Kenya" value={form.geographies} onChange={set('geographies')} /></div>
              <Button type="submit" disabled={saving || !form.organization || !form.investor_type}>
                {saving ? 'Saving…' : investor ? 'Save Profile' : 'Submit Application'}
              </Button>
            </CardContent>
          </Card>
        </form>
      )}
    </DashboardShell>
  );
}
