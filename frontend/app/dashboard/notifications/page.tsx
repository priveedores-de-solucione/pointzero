'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { notifications as notificationsApi, Notification, PaginatedResponse } from '@/lib/api';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { data, loading, refetch } = useApi<PaginatedResponse<Notification>>(() =>
    notificationsApi.list({ limit: 50 }),
  );

  const [marking, setMarking] = useState(false);

  const items = data?.items ?? [];
  const unreadCount = items.filter((n) => !n.read_at).length;

  const handleReadAll = async () => {
    setMarking(true);
    try {
      await notificationsApi.readAll();
      refetch();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications as read');
    } finally {
      setMarking(false);
    }
  };

  const handleReadOne = async (id: string) => {
    try {
      await notificationsApi.readOne(id);
      refetch();
    } catch {
      // silently fail on individual read
    }
  };

  return (
    <DashboardShell type="member" title="Notifications" subtitle="Stay up to date">
      <div className="max-w-2xl space-y-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
              <Button variant="ghost" size="sm" onClick={handleReadAll} disabled={marking || unreadCount === 0}>
                Mark All as Read
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read_at && handleReadOne(n.id)}
                  className={cn(
                    'flex items-start gap-4 rounded-xl border border-border p-4 transition-colors',
                    !n.read_at && 'bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10',
                  )}
                >
                  <div className="rounded-full bg-primary/10 p-2">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      <Badge variant="outline" className="capitalize text-xs shrink-0">{n.type}</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-10">No notifications yet</p>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
