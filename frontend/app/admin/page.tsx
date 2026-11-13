'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { StatCard, StatusBadge } from '@/components/shared/pz-cards';
import { Users, Building2, GraduationCap, Briefcase, FileText, Rocket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/states';
import { useApi } from '@/hooks/use-api';
import { admin as adminApi, programs as programsApi } from '@/lib/api';
import { humanize } from '@/lib/mappers';
import { fmtDate } from '@/components/shared/admin-list';
import type { ApplicationStatus } from '@/lib/types';

export default function AdminOverviewPage() {
  const { data: stats, loading, error, refetch } = useApi(() => adminApi.dashboard(), []);
  const { data: recent } = useApi(() => adminApi.applications({ limit: 5 }), []);
  const { data: active } = useApi(() => programsApi.list({ status: 'ACTIVE', limit: 10 }), []);

  return (
    <DashboardShell type="admin" title="Overview" subtitle="POINTZERO Ecosystem Dashboard">
      <div className="space-y-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : error || !stats ? (
          <ErrorState description={error ?? undefined} onRetry={refetch} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total Users" value={stats.total_users} icon={Users} />
            <StatCard label="Startups" value={stats.startups} icon={Building2} />
            <StatCard label="Active Founders" value={stats.active_founders} icon={Rocket} />
            <StatCard label="Programs" value={stats.programs} icon={GraduationCap} />
            <StatCard label="Verified Investors" value={stats.investors} change={`${stats.pending_investors} pending`} icon={Briefcase} />
            <StatCard label="Applications" value={stats.applications} change={`${stats.pending_applications} pending`} icon={FileText} />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Applications</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(recent?.items ?? []).map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">
                      {[a.answers?.first_name, a.answers?.last_name].filter(Boolean).join(' ') || a.answers?.email || 'Applicant'}
                      <span className="text-muted-foreground"> — {humanize(a.application_type)}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      {fmtDate(a.submitted_at)}
                      <StatusBadge status={a.status.toLowerCase() as ApplicationStatus} />
                    </span>
                  </div>
                ))}
                {recent && recent.items.length === 0 && <p className="text-sm text-muted-foreground">No applications yet.</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Active Programs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(active?.items ?? []).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span>{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.capacity ? `${p.enrolled ?? 0}/${p.capacity}` : humanize(p.type)}</span>
                  </div>
                ))}
                {active && active.items.length === 0 && <p className="text-sm text-muted-foreground">No active programs.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
