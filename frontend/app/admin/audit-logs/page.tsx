'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { AdminList } from '@/components/shared/admin-list';
import { admin as adminApi, AuditLog } from '@/lib/api';

export default function AdminAuditLogsPage() {
  return (
    <DashboardShell type="admin" title="Audit Logs" subtitle="All platform activity">
      <AdminList<AuditLog>
        limit={50}
        fetcher={({ page, limit }) => adminApi.auditLogs({ page, limit })}
        emptyTitle="No activity yet"
        columns={[
          { header: 'Action', cell: (l) => <span className="text-sm font-medium">{l.action}</span> },
          { header: 'Actor', cell: (l) => <span className="font-mono text-xs text-muted-foreground">{l.user_id?.slice(0, 8) ?? 'system'}</span> },
          { header: 'Target', cell: (l) => <span className="text-sm text-muted-foreground">{l.entity_type} · <span className="font-mono text-xs">{l.entity_id.slice(0, 8)}</span></span> },
          {
            header: 'Details',
            cell: (l) => {
              const details = l.metadata && Object.keys(l.metadata).length ? JSON.stringify(l.metadata) : '';
              return <span className="block max-w-xs truncate text-xs text-muted-foreground" title={details}>{details || '—'}</span>;
            },
          },
          { header: 'Timestamp', cell: (l) => <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span> },
        ]}
      />
    </DashboardShell>
  );
}
