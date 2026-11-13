'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminList, runAction } from '@/components/shared/admin-list';
import { admin as adminApi, AppEvent } from '@/lib/api';
import { humanize } from '@/lib/mappers';

const TYPES = ['WORKSHOP', 'HACKATHON', 'DEMO_DAY', 'MEETUP', 'INVESTOR_SESSION', 'COMMUNITY'];
const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const empty = { title: '', description: '', location: '', event_type: 'WORKSHOP', start_time: '', end_time: '', capacity: '', status: 'DRAFT' };

const fmt = (v: string) => new Date(v).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export default function AdminEventsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [reloadKey, setReloadKey] = useState(0);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await runAction(
      () =>
        adminApi.createEvent({
          title: form.title,
          description: form.description || undefined,
          location: form.location || undefined,
          event_type: form.event_type,
          start_time: new Date(form.start_time).toISOString(),
          end_time: new Date(form.end_time).toISOString(),
          capacity: form.capacity ? Number(form.capacity) : undefined,
          status: form.status,
        }),
      'Event created',
      () => setReloadKey((k) => k + 1),
    );
    if (ok) {
      setOpen(false);
      setForm(empty);
    }
  };

  return (
    <DashboardShell type="admin" title="Events" subtitle="Create and manage events">
      <AdminList<AppEvent>
        reloadKey={reloadKey}
        filters={STATUSES}
        fetcher={({ page, limit, filter }) => adminApi.events({ page, limit, status: filter })}
        toolbar={<Button size="sm" onClick={() => setOpen(true)}>Create Event</Button>}
        emptyTitle="No events yet"
        columns={[
          { header: 'Event', cell: (e) => <span className="font-medium">{e.title}</span> },
          { header: 'Type', cell: (e) => <Badge variant="outline" className="text-xs">{humanize(e.event_type)}</Badge> },
          { header: 'Starts', cell: (e) => <span className="text-sm text-muted-foreground">{fmt(e.start_time)}</span> },
          { header: 'Status', cell: (e) => <Badge variant={e.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-xs">{humanize(e.status)}</Badge> },
          { header: 'Capacity', cell: (e) => <span className="text-sm text-muted-foreground">{e.capacity ?? '—'}</span> },
        ]}
        actions={(e, refetch) => (
          <>
            {e.status === 'PUBLISHED' && (
              <Button variant="ghost" size="sm" asChild><Link href={`/events/${e.slug}`}>View</Link></Button>
            )}
            {e.status === 'DRAFT' && (
              <Button variant="ghost" size="sm" onClick={() => runAction(() => adminApi.updateEvent(e.id, { status: 'PUBLISHED' }), 'Event published', refetch)}>
                Publish
              </Button>
            )}
            {e.status !== 'ARCHIVED' && (
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => runAction(() => adminApi.archiveEvent(e.id), 'Event archived', refetch)}>
                Archive
              </Button>
            )}
          </>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create event</DialogTitle></DialogHeader>
          <form onSubmit={create} className="space-y-3">
            <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={set('title')} required /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={set('description')} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.event_type} onValueChange={(v) => setForm((f) => ({ ...f, event_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{humanize(t)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.slice(0, 2).map((s) => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Starts</Label><Input type="datetime-local" value={form.start_time} onChange={set('start_time')} required /></div>
              <div className="space-y-1.5"><Label>Ends</Label><Input type="datetime-local" value={form.end_time} onChange={set('end_time')} required /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Location</Label><Input value={form.location} onChange={set('location')} /></div>
              <div className="space-y-1.5"><Label>Capacity</Label><Input type="number" min={1} value={form.capacity} onChange={set('capacity')} /></div>
            </div>
            <DialogFooter><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
