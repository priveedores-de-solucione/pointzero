'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { fmtDate, runAction } from '@/components/shared/admin-list';
import { useApi } from '@/hooks/use-api';
import { admin as adminApi, programs as programsApi } from '@/lib/api';
import { humanize } from '@/lib/mappers';

const empty = { program_id: '', name: '', number: '', start_date: '', end_date: '' };

export default function AdminCohortsPage() {
  const { data: cohorts, loading, error, refetch } = useApi(() => adminApi.cohorts(), []);
  const { data: programs } = useApi(() => programsApi.list({ limit: 100 }), []);
  const programName = (id: string) => programs?.items.find((p) => p.id === id)?.name ?? '';

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await runAction(
      () =>
        adminApi.createCohort(form.program_id, {
          name: form.name,
          number: Number(form.number),
          start_date: form.start_date || undefined,
          end_date: form.end_date || undefined,
        }),
      'Cohort created',
      refetch,
    );
    if (ok) {
      setOpen(false);
      setForm(empty);
    }
  };

  return (
    <DashboardShell type="admin" title="Cohorts" subtitle="Manage program cohorts">
      <div className="space-y-4">
        <div className="flex justify-end"><Button size="sm" onClick={() => setOpen(true)}>Create Cohort</Button></div>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : (cohorts ?? []).length === 0 ? (
          <EmptyState title="No cohorts yet" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cohorts!.map((c) => (
              <Card key={c.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    {c.status && <Badge variant={c.status === 'ACTIVE' ? 'default' : 'secondary'}>{humanize(c.status)}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p>{programName(c.program_id)} · Cohort {c.number}</p>
                  <p>{fmtDate(c.start_date)} → {fmtDate(c.end_date)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create cohort</DialogTitle></DialogHeader>
          <form onSubmit={create} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Program</Label>
              <Select value={form.program_id} onValueChange={(v) => setForm((f) => ({ ...f, program_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                <SelectContent>{(programs?.items ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
              <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={set('name')} required /></div>
              <div className="space-y-1.5"><Label>Number</Label><Input type="number" min={1} value={form.number} onChange={set('number')} required /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Start date</Label><Input type="date" value={form.start_date} onChange={set('start_date')} /></div>
              <div className="space-y-1.5"><Label>End date</Label><Input type="date" value={form.end_date} onChange={set('end_date')} /></div>
            </div>
            <DialogFooter><Button type="submit" disabled={!form.program_id}>Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
