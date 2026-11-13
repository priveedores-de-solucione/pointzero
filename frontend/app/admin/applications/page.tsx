'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { StatusBadge } from '@/components/shared/pz-cards';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminList, fmtDate, runAction } from '@/components/shared/admin-list';
import { admin as adminApi, Application } from '@/lib/api';
import { humanize } from '@/lib/mappers';
import type { ApplicationStatus } from '@/lib/types';

const statuses = ['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW', 'ACCEPTED', 'REJECTED', 'WAITLISTED', 'WITHDRAWN'];
const DECIDABLE = ['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW', 'WAITLISTED'];
const DECISION_TOAST = {
  accept: 'Application accepted',
  reject: 'Application rejected',
  waitlist: 'Application waitlisted',
  'request-info': 'More information requested',
};

const applicantName = (a: Application) =>
  [a.answers?.first_name, a.answers?.last_name].filter(Boolean).join(' ') || 'Applicant';

export default function AdminApplicationsPage() {
  const [reviewing, setReviewing] = useState<{ app: Application; refetch: () => void } | null>(null);
  const [note, setNote] = useState('');

  const decide = (decision: 'accept' | 'reject' | 'waitlist' | 'request-info') => {
    if (!reviewing) return;
    const { app, refetch } = reviewing;
    runAction(() => adminApi.decideApplication(app.id, decision, note || undefined), DECISION_TOAST[decision], refetch);
    setReviewing(null);
    setNote('');
  };

  const app = reviewing?.app;

  return (
    <DashboardShell type="admin" title="Applications" subtitle="Review and manage applications">
      <AdminList<Application>
        filters={statuses}
        fetcher={({ page, limit, filter }) => adminApi.applications({ page, limit, status: filter })}
        emptyTitle="No applications"
        columns={[
          { header: 'Name', cell: (a) => <span className="font-medium">{applicantName(a)}</span> },
          { header: 'Type', cell: (a) => humanize(a.application_type) },
          { header: 'Email', cell: (a) => <span className="text-muted-foreground">{a.answers?.email ?? '—'}</span> },
          { header: 'Status', cell: (a) => <StatusBadge status={a.status.toLowerCase() as ApplicationStatus} /> },
          { header: 'Submitted', cell: (a) => <span className="text-muted-foreground">{fmtDate(a.submitted_at)}</span> },
        ]}
        actions={(a, refetch) => (
          <Button variant="ghost" size="sm" onClick={() => setReviewing({ app: a, refetch })}>Review</Button>
        )}
      />

      <Dialog open={!!reviewing} onOpenChange={(o) => !o && setReviewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{app && `${applicantName(app)} · ${humanize(app.application_type)}`}</DialogTitle></DialogHeader>
          {app && (
            <div className="space-y-4">
              <dl className="max-h-72 space-y-2 overflow-y-auto text-sm">
                {Object.entries(app.answers ?? {}).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted-foreground">{humanize(k)}</dt>
                    <dd className="whitespace-pre-line">{String(v)}</dd>
                  </div>
                ))}
              </dl>
              {DECIDABLE.includes(app.status) ? (
                <>
                  <div className="space-y-1.5">
                    <Label>Note to applicant (optional; required for “request info”)</Label>
                    <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
                  </div>
                  <DialogFooter className="flex-wrap gap-2">
                    <Button variant="outline" onClick={() => decide('request-info')} disabled={!note.trim()}>Request info</Button>
                    <Button variant="outline" onClick={() => decide('waitlist')}>Waitlist</Button>
                    <Button variant="destructive" onClick={() => decide('reject')}>Reject</Button>
                    <Button onClick={() => decide('accept')}>Accept</Button>
                  </DialogFooter>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">This application is {humanize(app.status).toLowerCase()} and can no longer be decided.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
