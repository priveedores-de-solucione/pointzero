'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminList, fmtDate, runAction } from '@/components/shared/admin-list';
import { admin as adminApi, Mentor } from '@/lib/api';
import { fullName } from '@/lib/mappers';

export default function AdminMentorsPage() {
  return (
    <DashboardShell type="admin" title="Mentors" subtitle="Manage ecosystem mentors">
      <AdminList<Mentor>
        filters={['VERIFIED', 'UNVERIFIED']}
        fetcher={({ page, limit, filter }) =>
          adminApi.mentors({ page, limit, is_verified: filter ? filter === 'VERIFIED' : undefined })
        }
        emptyTitle="No mentors"
        columns={[
          {
            header: 'Mentor',
            cell: (m) => (
              <div>
                <p className="font-medium">{fullName(m.profiles, 'Mentor')}</p>
                <p className="text-xs text-muted-foreground">{m.profiles?.email}</p>
              </div>
            ),
          },
          {
            header: 'Expertise',
            cell: (m) => (
              <div className="flex max-w-xs flex-wrap gap-1">
                {(m.expertise ?? []).map((e) => <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>)}
              </div>
            ),
          },
          { header: 'Availability', cell: (m) => <span className="text-sm text-muted-foreground">{m.availability ?? '—'}</span> },
          { header: 'Status', cell: (m) => <Badge variant={m.is_verified ? 'default' : 'outline'} className="text-xs">{m.is_verified ? 'Verified' : 'Pending'}</Badge> },
          { header: 'Added', cell: (m) => <span className="text-xs text-muted-foreground">{fmtDate(m.created_at)}</span> },
        ]}
        actions={(m, refetch) =>
          !m.is_verified && (
            <Button variant="ghost" size="sm" onClick={() => runAction(() => adminApi.verifyMentor(m.id), 'Mentor verified', refetch)}>Verify</Button>
          )
        }
      />
    </DashboardShell>
  );
}
