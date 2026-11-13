'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { ResourceCard } from '@/components/shared/pz-cards';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/shared/states';
import { useApi } from '@/hooks/use-api';
import { resources as resourcesApi } from '@/lib/api';
import { mapResource } from '@/lib/mappers';

export default function DashboardResourcesPage() {
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, loading, error, refetch } = useApi(() => resourcesApi.list({ q: q || undefined, limit: 50 }), [q]);
  const items = (data?.items ?? []).map(mapResource);

  return (
    <DashboardShell type="member" title="Resources" subtitle="Guides and playbooks for builders">
      <div className="space-y-6">
        <Input placeholder="Search resources…" className="max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        ) : error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState title="No resources found" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((r) => <ResourceCard key={r.id} resource={r} />)}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
