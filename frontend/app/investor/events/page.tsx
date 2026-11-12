import { DashboardShell } from '@/components/shared/dashboard-layout';
import { events } from '@/lib/mock-data';
import { EventCard } from '@/components/shared/pz-cards';

export default function InvestorEventsPage() {
  return (
    <DashboardShell type="investor" title="Events">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => <EventCard key={e.id} event={e} />)}
      </div>
    </DashboardShell>
  );
}