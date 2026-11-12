import { DashboardShell } from '@/components/shared/dashboard-layout';
import { startups } from '@/lib/mock-data';
import { StartupCard } from '@/components/shared/pz-cards';
import { EmptyState } from '@/components/shared/states';
import { Heart } from 'lucide-react';

export default function InvestorSavedPage() {
  const saved = startups.slice(0, 2);
  return (
    <DashboardShell type="investor" title="Saved Startups">
      {saved.length === 0 ? (
        <EmptyState icon={Heart} title="No saved startups" description="Save startups you want to track." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((s) => <StartupCard key={s.id} startup={s} />)}
        </div>
      )}
    </DashboardShell>
  );
}