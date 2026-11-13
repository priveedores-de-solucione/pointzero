'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminList, fmtDate, runAction } from '@/components/shared/admin-list';
import { admin as adminApi, programs as programsApi, Program } from '@/lib/api';
import { humanize } from '@/lib/mappers';

const TYPES = ['POINTZERO_90', 'ACADEMY', 'RESIDENCY', 'LABS', 'DEMO_DAY'];
const STATUSES = ['UPCOMING', 'ACTIVE', 'CLOSED'];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const empty = { name: '', slug: '', description: '', type: 'POINTZERO_90', status: 'UPCOMING', start_date: '', end_date: '', application_deadline: '', capacity: '' };

export default function AdminProgramsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [reloadKey, setReloadKey] = useState(0);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value, ...(k === 'name' ? { slug: slugify(e.target.value) } : {}) }));

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await runAction(
      () =>
        adminApi.createProgram({
          name: form.name,
          slug: form.slug,
          description: form.description || undefined,
          type: form.type,
          status: form.status,
          start_date: form.start_date || undefined,
          end_date: form.end_date || undefined,
          application_deadline: form.application_deadline ? new Date(form.application_deadline).toISOString() : undefined,
          capacity: form.capacity ? Number(form.capacity) : undefined,
        }),
      'Program created',
      () => setReloadKey((k) => k + 1),
    );
    if (ok) {
      setOpen(false);
      setForm(empty);
    }
  };

  return (
    <DashboardShell type="admin" title="Programs" subtitle="Manage programs and cohorts">
      <AdminList<Program>
        reloadKey={reloadKey}
        filters={STATUSES}
        fetcher={({ page, limit, filter }) => programsApi.list({ page, limit, status: filter })}
        toolbar={<Button size="sm" onClick={() => setOpen(true)}>Create Program</Button>}
        emptyTitle="No programs yet"
        columns={[
          { header: 'Program', cell: (p) => <span className="font-medium">{p.name}</span> },
          { header: 'Type', cell: (p) => <Badge variant="outline" className="text-xs">{humanize(p.type)}</Badge> },
          {
            header: 'Status',
            cell: (p) => (
              <Select
                defaultValue={p.status}
                onValueChange={(status) => runAction(() => adminApi.updateProgram(p.id, { status }), 'Status updated', () => undefined)}
              >
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}</SelectContent>
              </Select>
            ),
          },
          {
            header: 'Applications',
            cell: (p) => (
              <Switch
                defaultChecked={!!p.application_open}
                onCheckedChange={(v) =>
                  runAction(() => adminApi.updateProgram(p.id, { application_open: v }), v ? 'Applications opened' : 'Applications closed', () => undefined)
                }
              />
            ),
          },
          { header: 'Capacity', cell: (p) => <span className="text-xs text-muted-foreground">{p.capacity ?? '—'}</span> },
          { header: 'Deadline', cell: (p) => <span className="text-xs text-muted-foreground">{fmtDate(p.application_deadline)}</span> },
        ]}
        actions={(p, refetch) => (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => runAction(() => adminApi.deleteProgram(p.id), 'Program deleted', refetch)}>
            Delete
          </Button>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create program</DialogTitle></DialogHeader>
          <form onSubmit={create} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={set('name')} required /></div>
              <div className="space-y-1.5"><Label>Slug</Label><Input value={form.slug} onChange={set('slug')} required /></div>
            </div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={set('description')} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{humanize(t)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Start date</Label><Input type="date" value={form.start_date} onChange={set('start_date')} /></div>
              <div className="space-y-1.5"><Label>End date</Label><Input type="date" value={form.end_date} onChange={set('end_date')} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Application deadline</Label><Input type="datetime-local" value={form.application_deadline} onChange={set('application_deadline')} /></div>
              <div className="space-y-1.5"><Label>Capacity</Label><Input type="number" min={1} value={form.capacity} onChange={set('capacity')} /></div>
            </div>
            <DialogFooter><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
