'use client';

import Link from 'next/link';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminList, fmtDate } from '@/components/shared/admin-list';
import { admin as adminApi, Startup } from '@/lib/api';

export default function AdminStartupsPage() {
  return (
    <DashboardShell type="admin" title="Startups" subtitle="Manage and approve startups">
      <AdminList<Startup>
        searchPlaceholder="Search startups…"
        fetcher={({ page, limit, q }) => adminApi.startups({ page, limit, q })}
        emptyTitle="No startups yet"
        columns={[
          {
            header: 'Startup',
            cell: (s) => (
              <div className="flex items-center gap-3">
                <Avatar className="h-7 w-7 rounded-md">
                  <AvatarImage src={s.logo_url} />
                  <AvatarFallback className="rounded-md">{s.name[0]}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{s.name}</p>
              </div>
            ),
          },
          { header: 'Industry', cell: (s) => <span className="text-sm text-muted-foreground">{s.industry ?? '—'}</span> },
          { header: 'Stage', cell: (s) => (s.stage ? <Badge variant="secondary" className="text-xs">{s.stage}</Badge> : '—') },
          {
            header: 'Visibility',
            cell: (s) => (
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">{s.is_public ? 'Public' : 'Private'}</Badge>
                {s.investor_visible && <Badge variant="outline" className="text-xs">Investors</Badge>}
              </div>
            ),
          },
          { header: 'Created', cell: (s) => <span className="text-xs text-muted-foreground">{fmtDate(s.created_at)}</span> },
        ]}
        actions={(s) => (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/startups/${s.slug}`}>View</Link>
          </Button>
        )}
      />
    </DashboardShell>
  );
}
