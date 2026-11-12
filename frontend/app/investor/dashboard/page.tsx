import { DashboardShell } from '@/components/shared/dashboard-layout';
import { startups, events } from '@/lib/mock-data';
import { StartupCard, StatCard, EventCard } from '@/components/shared/pz-cards';
import { TrendingUp, Heart, Handshake, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function InvestorDashboardPage() {
  return (
    <DashboardShell type="investor" title="Overview" subtitle="Welcome back, Investor">
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Startups" value={startups.length} icon={TrendingUp} />
          <StatCard label="Saved" value={3} icon={Heart} />
          <StatCard label="Introductions" value={2} icon={Handshake} />
          <StatCard label="Deal Flow" value={5} icon={BarChart3} />
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recommended Startups</h2>
            <Button asChild variant="ghost" size="sm"><Link href="/investor/startups">View All</Link></Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {startups.filter((s) => s.visibility === 'public').slice(0, 3).map((s) => (
              <StartupCard key={s.id} startup={s} />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Upcoming Events</h2>
            <Button asChild variant="ghost" size="sm"><Link href="/investor/events">View All</Link></Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.filter((e) => e.status === 'upcoming').slice(0, 3).map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}