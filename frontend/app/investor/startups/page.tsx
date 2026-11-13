'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { StartupCard } from '@/components/shared/pz-cards';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { useApi } from '@/hooks/use-api';
import { investors as investorsApi } from '@/lib/api';
import { mapStartup } from '@/lib/mappers';

const filters = ['All', 'Idea', 'Pre-Seed', 'Seed', 'Series A'];

export default function InvestorStartupsPage() {
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('All');

  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, loading, error, refetch } = useApi(
    () => investorsApi.startups({ q: q || undefined, stage: stage === 'All' ? undefined : stage, limit: 50 }),
    [q, stage],
  );
  const items = (data?.items ?? []).map(mapStartup);

  return (
    <DashboardShell type="investor" title="Discover Startups" subtitle="Browse startups building at POINTZERO">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input placeholder="Search startups…" className="max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Badge
                key={f}
                variant={stage === f ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-muted"
                onClick={() => setStage(f)}
              >
                {f}
              </Badge>
            ))}
          </div>
        </div>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState title="No startups match" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => <StartupCard key={s.id} startup={s} href={`/investor/startups/${s.id}`} />)}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
