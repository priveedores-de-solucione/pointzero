'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { EventCard } from '@/components/shared/pz-cards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/shared/states';
import { useApi } from '@/hooks/use-api';
import { events as eventsApi } from '@/lib/api';
import { mapEvent } from '@/lib/mappers';

function EventGrid({ when }: { when: 'upcoming' | 'past' }) {
  const { data, loading, error, refetch } = useApi(() => eventsApi.list({ when, limit: 50 }), [when]);
  const items = (data?.items ?? []).map(mapEvent);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
      </div>
    );
  }
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (items.length === 0) return <EmptyState title={when === 'upcoming' ? 'No upcoming events' : 'No past events'} />;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((e) => <EventCard key={e.id} event={e} />)}
    </div>
  );
}

export default function DashboardEventsPage() {
  return (
    <DashboardShell type="member" title="Events" subtitle="Discover and register for events">
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6">
          <EventGrid when="upcoming" />
        </TabsContent>
        <TabsContent value="past" className="mt-6">
          <EventGrid when="past" />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
