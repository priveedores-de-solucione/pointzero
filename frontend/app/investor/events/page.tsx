'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { EventCard } from '@/components/shared/pz-cards';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { useApi } from '@/hooks/use-api';
import { events as eventsApi } from '@/lib/api';
import { mapEvent } from '@/lib/mappers';

export default function InvestorEventsPage() {
  const { data, loading, error, refetch } = useApi(() => eventsApi.list({ when: 'upcoming', limit: 50 }), []);
  const items = (data?.items ?? []).map(mapEvent);

  return (
    <DashboardShell type="investor" title="Events">
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState title="No upcoming events" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </DashboardShell>
  );
}
