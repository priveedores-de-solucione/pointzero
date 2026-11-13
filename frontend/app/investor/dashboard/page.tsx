'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { StartupCard, StatCard } from '@/components/shared/pz-cards';
import { TrendingUp, Heart, Handshake, BarChart3, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/shared/states';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/context/auth-context';
import { investors as investorsApi } from '@/lib/api';
import { mapStartup } from '@/lib/mappers';

export default function InvestorDashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi(() => investorsApi.dashboard(), []);

  const recommended = (data?.recommended_startups.length ? data.recommended_startups : data?.new_startups ?? []).map(mapStartup);
  const dealCount = Object.values(data?.deal_flow_counts ?? {}).reduce((a, b) => a + b, 0);

  return (
    <DashboardShell type="investor" title="Overview" subtitle={`Welcome back, ${user?.first_name ?? 'Investor'}`}>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : error || !data ? (
        <ErrorState
          title="Investor access unavailable"
          description={error ?? undefined}
          onRetry={refetch}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="New Startups" value={data.new_startups.length} icon={TrendingUp} />
            <StatCard label="Saved" value={data.saved_count} icon={Heart} />
            <StatCard label="Introductions" value={data.introduction_requests.length} icon={Handshake} />
            <StatCard label="Deal Flow" value={dealCount} icon={BarChart3} />
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Recommended Startups</h2>
              <Button asChild variant="ghost" size="sm"><Link href="/investor/startups">View All</Link></Button>
            </div>
            {recommended.length === 0 ? (
              <EmptyState title="No startups yet" description="Startups appear here once founders make them visible to investors." />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.slice(0, 3).map((s) => (
                  <StartupCard key={s.id} startup={s} href={`/investor/startups/${s.id}`} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Upcoming Events</h2>
              <Button asChild variant="ghost" size="sm"><Link href="/investor/events">View All</Link></Button>
            </div>
            {data.upcoming_events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events.</p>
            ) : (
              <div className="space-y-2">
                {data.upcoming_events.slice(0, 5).map((e) => (
                  <Link key={e.id} href={`/events/${e.slug}`} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div className="text-sm">
                      <p className="font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(e.start_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                        {e.location && ` · ${e.location}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
