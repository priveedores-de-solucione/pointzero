'use client';

import { useState } from 'react';
import { PublicPage } from '@/components/shared/public-page';
import { EventCard } from '@/components/shared/pz-cards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/states';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks/use-api';
import { events as eventsApi, PaginatedResponse, AppEvent } from '@/lib/api';

const tabs = ['Upcoming', 'Past'] as const;
const filters = ['All', 'Workshop', 'Hackathon', 'Demo Day', 'Meetup', 'Investor Session', 'Community'];

function mapEvent(e: AppEvent) {
  const start = new Date(e.start_time);
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    description: e.description ?? '',
    longDescription: '',
    type: e.event_type.toLowerCase() as 'workshop' | 'hackathon' | 'demo_day' | 'meetup' | 'investor_session' | 'community',
    status: (new Date(e.start_time) > new Date() ? 'upcoming' : 'past') as 'upcoming' | 'past' | 'live',
    date: start.toISOString().split('T')[0],
    time: start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    location: e.location ?? 'POINTZERO Campus',
    capacity: e.capacity ?? 0,
    registered: e.registrations_count ?? 0,
    image: e.image_url ?? 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200',
    speakers: [],
    organizer: 'POINTZERO',
  };
}

export default function EventsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Upcoming');
  const [filter, setFilter] = useState('All');

  const eventType = filter !== 'All' ? filter.toLowerCase().replace(' ', '_') : undefined;

  const { data, loading } = useApi<PaginatedResponse<AppEvent>>(() =>
    eventsApi.list({
      when: tab.toLowerCase() as 'upcoming' | 'past',
      event_type: eventType,
      limit: 50,
    }),
    [tab, filter],
  );

  const items = (data?.items ?? []).map(mapEvent);

  return (
    <PublicPage>
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-4">Events</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Show up. Build together.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Founder dinners, build nights, hackathons, demo days, and investor sessions.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex gap-2">
            {tabs.map((t) => (
              <Button key={t} variant={tab === t ? 'default' : 'outline'} size="sm" onClick={() => setTab(t)}>
                {t}
              </Button>
            ))}
          </div>
          <div className="mb-8 flex flex-wrap gap-2">
            {filters.map((f) => (
              <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                {f}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyState title="No events found" description="Check back soon for new events." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicPage>
  );
}
