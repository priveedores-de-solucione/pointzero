import { DashboardShell } from '@/components/shared/dashboard-layout';
import { startups } from '@/lib/mock-data';
import { StatusBadge } from '@/components/shared/pz-cards';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminStartupsPage() {
  return (
    <DashboardShell type="admin" title="Startups" subtitle="Manage and approve startups">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Input placeholder="Search startups…" className="max-w-xs" />
          <Button size="sm">Add Startup</Button>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Startup</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Program</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {startups.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-7 w-7 rounded-md">
                        <AvatarImage src={s.logo} />
                        <AvatarFallback className="rounded-md">{s.name[0]}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">{s.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.industry}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize text-xs">{s.stage.replace('_', ' ')}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="capitalize text-xs">{s.visibility}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.program}</TableCell>
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