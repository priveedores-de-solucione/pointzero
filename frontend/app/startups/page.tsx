'use client';

import { useState, useCallback } from 'react';
import { PublicPage } from '@/components/shared/public-page';
import { StartupCard } from '@/components/shared/pz-cards';
import { PzPageHero } from '@/components/shared/pz-hero';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { EmptyState } from '@/components/shared/states';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/use-api';
import { startups as startupsApi, PaginatedResponse, Startup } from '@/lib/api';
import { mapStartup } from '@/lib/mappers';

const industries = ['All', 'Logistics', 'EdTech', 'HealthTech', 'FinTech', 'AgriTech'];
const stages = ['All', 'Idea', 'Pre-seed', 'Seed', 'Series A'];


export default function StartupsPage() {
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All');
  const [stage, setStage] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    clearTimeout((window as { _pz_st?: ReturnType<typeof setTimeout> })._pz_st);
    (window as { _pz_st?: ReturnType<typeof setTimeout> })._pz_st = setTimeout(() => setDebouncedSearch(val), 300);
  }, []);

  const { data, loading } = useApi<PaginatedResponse<Startup>>(() =>
    startupsApi.list({
      industry: industry !== 'All' ? industry : undefined,
      stage: stage !== 'All' ? stage.toLowerCase().replace(' ', '_').replace('-', '_') : undefined,
      q: debouncedSearch || undefined,
      limit: 50,
    }),
    [industry, stage, debouncedSearch],
  );

  const items = (data?.items ?? []).map(mapStartup);

  const chip = (active: boolean) =>
    cn(
      'rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors duration-150',
      active
        ? 'border-pz-signal/40 bg-pz-signal-dim text-pz-signal'
        : 'border-pz-border text-pz-text-dim hover:border-pz-muted hover:text-pz-white',
    );

  return (
    <PublicPage>
      <PzPageHero
        eyebrow={loading ? 'Startups' : `${items.length} startup${items.length === 1 ? '' : 's'} · live`}
        title="Built at POINTZERO."
        description="The startups that came with an idea and left with a company."
      />

      <section className="bg-pz-void">
        <div className="pz-container pb-24 pt-10">
          <div className="mb-10 space-y-5">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pz-text-dim" />
              <Input
                placeholder="Search startups..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-11 border-pz-border bg-pz-surface pl-10 placeholder:text-pz-text-dim"
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 w-16 font-mono text-[11px] text-pz-text-dim">Industry</span>
                {industries.map((i) => (
                  <button key={i} onClick={() => setIndustry(i)} className={chip(industry === i)}>
                    {i}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 w-16 font-mono text-[11px] text-pz-text-dim">Stage</span>
                {stages.map((st) => (
                  <button key={st} onClick={() => setStage(st)} className={chip(stage === st)}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-lg bg-pz-surface" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState title="No startups found" description="Try adjusting your search or filters." />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((s) => (
                <StartupCard key={s.id} startup={s} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicPage>
  );
}
