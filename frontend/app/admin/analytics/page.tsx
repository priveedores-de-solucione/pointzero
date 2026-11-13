'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { StatCard } from '@/components/shared/pz-cards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ErrorState, LoadingState } from '@/components/shared/states';
import { Users, Building2, TrendingUp, Calendar } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { admin as adminApi, AdminAnalytics } from '@/lib/api';

const SERIES: { key: keyof AdminAnalytics; label: string }[] = [
  { key: 'applications', label: 'Applications' },
  { key: 'user_growth', label: 'New users' },
  { key: 'startup_growth', label: 'New startups' },
  { key: 'investor_activity', label: 'Intro requests' },
  { key: 'event_registrations', label: 'Event registrations' },
];

const monthLabel = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

export default function AdminAnalyticsPage() {
  const { data, loading, error, refetch } = useApi(() => adminApi.analytics(6), []);
  const current = (key: keyof AdminAnalytics) => data?.[key].at(-1)?.count ?? 0;
  const months = data?.applications.map((r) => r.month) ?? [];

  return (
    <DashboardShell type="admin" title="Analytics" subtitle="Ecosystem performance overview">
      {loading ? (
        <LoadingState />
      ) : error || !data ? (
        <ErrorState description={error ?? undefined} onRetry={refetch} />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="New Users (this month)" value={current('user_growth')} icon={Users} />
            <StatCard label="New Startups (this month)" value={current('startup_growth')} icon={Building2} />
            <StatCard label="Applications (this month)" value={current('applications')} icon={TrendingUp} />
            <StatCard label="Event Registrations (this month)" value={current('event_registrations')} icon={Calendar} />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Last 6 months</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    {months.map((m) => <TableHead key={m} className="text-right">{monthLabel(m)}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SERIES.map(({ key, label }) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{label}</TableCell>
                      {data[key].map((r) => <TableCell key={r.month} className="text-right tabular-nums">{r.count}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
