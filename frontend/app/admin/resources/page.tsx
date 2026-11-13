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
import { AdminList, fmtDate, runAction } from '@/components/shared/admin-list';
import { admin as adminApi, resources as resourcesApi, Resource } from '@/lib/api';
import { humanize } from '@/lib/mappers';

const CATEGORIES = ['STARTUP', 'ENGINEERING', 'PRODUCT', 'DESIGN', 'FUNDRAISING', 'AI', 'BLOCKCHAIN', 'FOUNDER_STORIES'];
const empty = { title: '', description: '', content: '', category: 'STARTUP', status: 'PUBLISHED' };

export default function AdminResourcesPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [reloadKey, setReloadKey] = useState(0);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await runAction(() => adminApi.createResource(form), 'Resource created', () => setReloadKey((k) => k + 1));
    if (ok) {
      setOpen(false);
      setForm(empty);
    }
  };

  return (
    <DashboardShell type="admin" title="Resources" subtitle="Manage published resources">
      {/* The API only lists published resources; drafts are not listed here. */}
      <AdminList<Resource>
        reloadKey={reloadKey}
        searchPlaceholder="Search resources…"
        filters={CATEGORIES}
        fetcher={({ page, limit, q, filter }) => resourcesApi.list({ page, limit, q, category: filter })}
        toolbar={<Button size="sm" onClick={() => setOpen(true)}>Create Resource</Button>}
        emptyTitle="No published resources"
        columns={[
          { header: 'Title', cell: (r) => <span className="block max-w-xs truncate font-medium">{r.title}</span> },
          { header: 'Category', cell: (r) => <Badge variant="secondary" className="text-xs">{humanize(r.category)}</Badge> },
          { header: 'Published', cell: (r) => <span className="text-sm text-muted-foreground">{fmtDate(r.published_at)}</span> },
        ]}
        actions={(r, refetch) => (
          <>
            <Button variant="ghost" size="sm" asChild><Link href={`/resources/${r.slug}`}>View</Link></Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => runAction(() => adminApi.archiveResource(r.id), 'Resource archived', refetch)}>
              Archive
            </Button>
          </>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Create resource</DialogTitle></DialogHeader>
          <form onSubmit={create} className="space-y-3">
            <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={set('title')} required /></div>
            <div className="space-y-1.5"><Label>Summary</Label><Textarea rows={2} value={form.description} onChange={set('description')} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{humanize(c)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['DRAFT', 'PUBLISHED'].map((s) => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Content</Label><Textarea rows={10} value={form.content} onChange={set('content')} /></div>
            <DialogFooter><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
