'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminList, fmtDate, runAction } from '@/components/shared/admin-list';
import { admin as adminApi, Investor, IntroductionRequest } from '@/lib/api';
import { fullName, humanize } from '@/lib/mappers';

export default function AdminInvestorsPage() {
  return (
    <DashboardShell type="admin" title="Investors" subtitle="Review and manage investors">
      <Tabs defaultValue="investors">
        <TabsList>
          <TabsTrigger value="investors">Investors</TabsTrigger>
          <TabsTrigger value="introductions">Introduction requests</TabsTrigger>
        </TabsList>

        <TabsContent value="investors" className="mt-6">
          <AdminList<Investor>
            filters={['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED']}
            fetcher={({ page, limit, filter }) => adminApi.investors({ page, limit, verification_status: filter })}
            emptyTitle="No investors"
            columns={[
              {
                header: 'Investor',
                cell: (i) => (
                  <div>
                    <p className="font-medium">{fullName(i.profiles, '—')}</p>
                    <p className="text-xs text-muted-foreground">{i.profiles?.email}</p>
                  </div>
                ),
              },
              { header: 'Organization', cell: (i) => i.organization },
              { header: 'Type', cell: (i) => <Badge variant="secondary" className="text-xs">{humanize(i.investor_type)}</Badge> },
              { header: 'Status', cell: (i) => <Badge variant={i.verification_status === 'VERIFIED' ? 'default' : 'outline'} className="text-xs">{humanize(i.verification_status)}</Badge> },
              { header: 'Applied', cell: (i) => <span className="text-xs text-muted-foreground">{fmtDate(i.created_at)}</span> },
            ]}
            actions={(i, refetch) => (
              <>
                {i.verification_status !== 'VERIFIED' && (
                  <Button variant="ghost" size="sm" onClick={() => runAction(() => adminApi.setInvestorStatus(i.id, 'verify'), 'Investor verified', refetch)}>Verify</Button>
                )}
                {i.verification_status === 'PENDING' && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => runAction(() => adminApi.setInvestorStatus(i.id, 'reject'), 'Investor rejected', refetch)}>Reject</Button>
                )}
                {i.verification_status === 'VERIFIED' && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => runAction(() => adminApi.setInvestorStatus(i.id, 'suspend'), 'Investor suspended', refetch)}>Suspend</Button>
                )}
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="introductions" className="mt-6">
          <AdminList<IntroductionRequest>
            filters={['pending_review', 'founder_pending', 'accepted', 'declined', 'rejected']}
            fetcher={({ page, limit, filter }) => adminApi.introductions({ page, limit, status: filter })}
            emptyTitle="No introduction requests"
            columns={[
              { header: 'Investor', cell: (r) => r.investors?.organization ?? '—' },
              { header: 'Startup', cell: (r) => <span className="font-medium">{r.startups?.name ?? '—'}</span> },
              { header: 'Message', cell: (r) => <span className="block max-w-sm truncate text-sm text-muted-foreground" title={r.message}>{r.message}</span> },
              { header: 'Status', cell: (r) => <Badge variant="outline" className="text-xs">{humanize(r.status)}</Badge> },
              { header: 'Requested', cell: (r) => <span className="text-xs text-muted-foreground">{fmtDate(r.created_at)}</span> },
            ]}
            actions={(r, refetch) =>
              r.status === 'pending_review' && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => runAction(() => adminApi.reviewIntroduction(r.id, 'approve'), 'Sent to founders', refetch)}>Approve</Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => runAction(() => adminApi.reviewIntroduction(r.id, 'reject'), 'Request rejected', refetch)}>Reject</Button>
                </>
              )
            }
          />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
