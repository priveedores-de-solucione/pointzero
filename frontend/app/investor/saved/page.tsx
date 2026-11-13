'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { StartupCard } from '@/components/shared/pz-cards';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { Heart } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { investors as investorsApi } from '@/lib/api';
import { mapStartup } from '@/lib/mappers';

export default function InvestorSavedPage() {
  const { data, loading, error, refetch } = useApi(() => investorsApi.saved(), []);
  const saved = (data ?? []).map(mapStartup);

  return (
    <DashboardShell type="investor" title="Saved Startups">
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : saved.length === 0 ? (
        <EmptyState icon={Heart} title="No saved startups" description="Save startups you want to track." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((s) => <StartupCard key={s.id} startup={s} href={`/investor/startups/${s.id}`} />)}
        </div>
      )}
    </DashboardShell>
  );
}
