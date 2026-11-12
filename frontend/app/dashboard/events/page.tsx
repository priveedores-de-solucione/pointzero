import { DashboardShell } from '@/components/shared/dashboard-layout';
import { events } from '@/lib/mock-data';
import { EventCard } from '@/components/shared/pz-cards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardEventsPage() {
  const upcoming = events.filter((e) => e.status === 'upcoming');
  const past = events.filter((e) => e.status === 'past');

  return (
    <DashboardShell type="member" title="Events" subtitle="Discover and register for events">
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </TabsContent>
        <TabsContent value="past" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}