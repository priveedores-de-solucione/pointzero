import { DashboardShell } from '@/components/shared/dashboard-layout';
import { auditLogs } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminAuditLogsPage() {
  return (
    <DashboardShell type="admin" title="Audit Logs" subtitle="All platform activity">
      <div className="space-y-4">
        <Input placeholder="Search logs…" className="max-w-xs" />
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium text-sm">{log.action}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.actor}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.target}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{log.details}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardShell>
  );
}