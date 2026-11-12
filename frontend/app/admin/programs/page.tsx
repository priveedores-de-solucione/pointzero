import { DashboardShell } from '@/components/shared/dashboard-layout';
import { programs } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminProgramsPage() {
  return (
    <DashboardShell type="admin" title="Programs" subtitle="Manage programs and cohorts">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Input placeholder="Search programs…" className="max-w-xs" />
          <Button size="sm">Create Program</Button>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cohort</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize text-xs">{p.type}</Badge></TableCell>
                  <TableCell><Badge variant={p.status === 'active' ? 'default' : p.status === 'upcoming' ? 'secondary' : 'outline'} className="capitalize text-xs">{p.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.cohort}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.enrolled}/{p.capacity}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.applicationDeadline}</TableCell>
                  <TableCell><Button variant="ghost" size="sm">Edit</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardShell>
  );
}