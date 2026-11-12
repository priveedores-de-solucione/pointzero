import { DashboardShell } from '@/components/shared/dashboard-layout';
import { StatusBadge } from '@/components/shared/pz-cards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApplicationStatus } from '@/lib/types';

const mockApplications = [
  { id: 'a1', name: 'Tolu Adebayo', type: 'founder', email: 'tolu@example.com', status: 'submitted' as ApplicationStatus, date: '2026-01-10' },
  { id: 'a2', name: 'Kemi Osei', type: 'builder', email: 'kemi@example.com', status: 'under_review' as ApplicationStatus, date: '2026-01-08' },
  { id: 'a3', name: 'Emeka Nwosu', type: 'student', email: 'emeka@example.com', status: 'interview' as ApplicationStatus, date: '2026-01-05' },
  { id: 'a4', name: 'Zara Ibrahim', type: 'mentor', email: 'zara@example.com', status: 'accepted' as ApplicationStatus, date: '2026-01-03' },
  { id: 'a5', name: 'Femi Cole', type: 'investor', email: 'femi@example.com', status: 'rejected' as ApplicationStatus, date: '2025-12-28' },
];

const statuses: ApplicationStatus[] = ['draft', 'submitted', 'under_review', 'interview', 'accepted', 'rejected', 'waitlisted'];

export default function AdminApplicationsPage() {
  return (
    <DashboardShell type="admin" title="Applications" subtitle="Review and manage applications">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input placeholder="Search applications…" className="max-w-xs" />
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <Badge key={s} variant="outline" className="cursor-pointer capitalize hover:bg-muted">
                {s.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockApplications.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell className="capitalize">{a.type}</TableCell>
                  <TableCell className="text-muted-foreground">{a.email}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{a.date}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Review</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardShell>
  );
}