import { DashboardShell } from '@/components/shared/dashboard-layout';
import { resources } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminResourcesPage() {
  return (
    <DashboardShell type="admin" title="Resources" subtitle="Manage published resources">
      <div className="space-y-4">
        <div className="flex justify-end"><Button size="sm">Create Resource</Button></div>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Published</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium max-w-xs truncate">{r.title}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize text-xs">{r.category.replace('_', ' ')}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.author}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.publishedDate}</TableCell>
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