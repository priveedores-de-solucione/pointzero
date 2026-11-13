'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminList, fmtDate, runAction } from '@/components/shared/admin-list';
import { useAuth } from '@/context/auth-context';
import { admin as adminApi, User } from '@/lib/api';
import { fullName, humanize } from '@/lib/mappers';

const roles = ['FOUNDER', 'BUILDER', 'STUDENT', 'MENTOR', 'INVESTOR', 'PARTNER', 'STAFF', 'ADMIN', 'SUPER_ADMIN'];

export default function AdminUsersPage() {
  const { user: me } = useAuth();

  return (
    <DashboardShell type="admin" title="Users" subtitle="Manage all ecosystem members">
      <AdminList<User>
        searchPlaceholder="Search users…"
        filters={roles}
        fetcher={({ page, limit, q, filter }) => adminApi.users({ page, limit, q, role: filter })}
        emptyTitle="No users found"
        columns={[
          {
            header: 'User',
            cell: (u) => (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={u.avatar_url} />
                  <AvatarFallback>{(fullName(u) || u.email)[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{fullName(u, '—')}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </div>
            ),
          },
          {
            header: 'Role',
            cell: (u) =>
              u.id === me?.id ? (
                <Badge variant="secondary">{humanize(u.role)}</Badge>
              ) : (
                <RoleSelect user={u} />
              ),
          },
          {
            header: 'Status',
            cell: (u) => <Badge variant={u.status === 'ACTIVE' ? 'outline' : 'destructive'}>{humanize(u.status)}</Badge>,
          },
          { header: 'Joined', cell: (u) => <span className="text-sm text-muted-foreground">{fmtDate(u.created_at)}</span> },
        ]}
        actions={(u, refetch) =>
          u.id === me?.id ? null : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                runAction(
                  () => adminApi.updateUser(u.id, { status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }),
                  u.status === 'ACTIVE' ? 'User suspended' : 'User reactivated',
                  refetch,
                )
              }
            >
              {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
            </Button>
          )
        }
      />
    </DashboardShell>
  );
}

function RoleSelect({ user }: { user: User }) {
  return (
    <Select
      defaultValue={user.role}
      onValueChange={(role) => runAction(() => adminApi.updateUser(user.id, { role }), 'Role updated', () => undefined)}
    >
      <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
      <SelectContent>
        {roles.map((r) => <SelectItem key={r} value={r}>{humanize(r)}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
