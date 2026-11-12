import { DashboardShell } from '@/components/shared/dashboard-layout';
import { events } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminEventsPage() {
  return (
    <DashboardShell type="admin" title="Events" subtitle="Create and manage events">
      <div className="space-y-4">
        <div className="flex justify-end"><Button size="sm">Create Event</Button></div>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.title}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize text-xs">{e.type.replace('_', ' ')}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.date}</TableCell>
                  <TableCell><Badge variant={e.status === 'upcoming' ? 'default' : 'secondary'} className="capitalize text-xs">{e.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.registered}/{e.capacity}</TableCell>
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