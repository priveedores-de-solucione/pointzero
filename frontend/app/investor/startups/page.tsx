import { DashboardShell } from '@/components/shared/dashboard-layout';
import { startups } from '@/lib/mock-data';
import { StartupCard } from '@/components/shared/pz-cards';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const filters = ['All', 'Idea', 'Pre-Seed', 'Seed', 'Series A'];

export default function InvestorStartupsPage() {
  const visible = startups.filter((s) => s.visibility !== 'private');
  return (
    <DashboardShell type="investor" title="Discover Startups" subtitle="Browse startups building at POINTZERO">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input placeholder="Search startups…" className="max-w-xs" />
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Badge key={f} variant="outline" className="cursor-pointer hover:bg-muted">{f}</Badge>
            ))}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((s) => <StartupCard key={s.id} startup={s} />)}
        </div>
      </div>
    </DashboardShell>
  );
}