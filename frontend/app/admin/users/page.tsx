import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserRole } from '@/lib/types';

const mockUsers = [
  { id: 'u1', name: 'Jeremiah Adewale', email: 'j@example.com', role: 'founder' as UserRole, joined: '2025-12-01' },
  { id: 'u2', name: 'Tolu Adebayo', email: 'tolu@example.com', role: 'builder' as UserRole, joined: '2026-01-02' },
  { id: 'u3', name: 'Zara Ibrahim', email: 'zara@example.com', role: 'mentor' as UserRole, joined: '2025-11-15' },
  { id: 'u4', name: 'Femi Cole', email: 'femi@example.com', role: 'investor' as UserRole, joined: '2025-10-10' },
];

const roles: UserRole[] = ['founder', 'builder', 'student', 'mentor', 'investor', 'partner', 'admin'];

export default function AdminUsersPage() {
  return (
    <DashboardShell type="admin" title="Users" subtitle="Manage all ecosystem members">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input placeholder="Search users…" className="max-w-xs" />
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <Badge key={r} variant="outline" className="cursor-pointer capitalize hover:bg-muted">{r}</Badge>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{u.role}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.joined}</TableCell>
                  <TableCell><Button variant="ghost" size="sm">Manage</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardShell>
  );
}