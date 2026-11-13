'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminList, fmtDate, runAction } from '@/components/shared/admin-list';
import { admin as adminApi, Partner } from '@/lib/api';
import { humanize } from '@/lib/mappers';

export default function AdminPartnersPage() {
  return (
    <DashboardShell type="admin" title="Partners" subtitle="Manage ecosystem partners">
      <AdminList<Partner>
        filters={['PENDING', 'APPROVED', 'REJECTED']}
        fetcher={({ page, limit, filter }) => adminApi.partners({ page, limit, status: filter })}
        emptyTitle="No partners"
        columns={[
          {
            header: 'Organization',
            cell: (p) => (
              <div>
                <p className="font-medium">{p.organization}</p>
                {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">{p.website}</a>}
              </div>
            ),
          },
          { header: 'Type', cell: (p) => <Badge variant="secondary" className="text-xs">{humanize(p.partner_type)}</Badge> },
          { header: 'Contact', cell: (p) => <span className="text-sm text-muted-foreground">{p.contact_email ?? '—'}</span> },
          { header: 'Status', cell: (p) => <Badge variant={p.status === 'APPROVED' ? 'default' : 'outline'} className="text-xs">{humanize(p.status)}</Badge> },
          { header: 'Applied', cell: (p) => <span className="text-xs text-muted-foreground">{fmtDate(p.created_at)}</span> },
        ]}
        actions={(p, refetch) => (
          <>
            {p.status !== 'APPROVED' && (
              <Button variant="ghost" size="sm" onClick={() => runAction(() => adminApi.approvePartner(p.id), 'Partner approved', refetch)}>Approve</Button>
            )}
            {p.status !== 'REJECTED' && (
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => runAction(() => adminApi.rejectPartner(p.id), 'Partner rejected', refetch)}>Reject</Button>
            )}
          </>
        )}
      />
    </DashboardShell>
  );
}
