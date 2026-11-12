'use client';

import { useState } from 'react';
import { PublicPage } from '@/components/shared/public-page';
import { ProgramCard } from '@/components/shared/pz-cards';
import { PzPageHero } from '@/components/shared/pz-hero';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks/use-api';
import { programs as programsApi, PaginatedResponse, Program } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const filters = ['All', 'Accelerator', 'Academy', 'Labs', 'Residency'] as const;

function mapProgram(p: Program) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    longDescription: p.long_description ?? '',
    type: p.type.toLowerCase() as 'accelerator' | 'academy' | 'residency' | 'labs' | 'demo_day',
    status: p.status.toLowerCase() as 'active' | 'upcoming' | 'closed',
    startDate: p.start_date ?? '',
    endDate: p.end_date ?? '',
    applicationDeadline: p.application_deadline ?? '',
    capacity: p.capacity ?? 0,
    enrolled: p.enrolled ?? 0,
    cohort: p.cohort ?? '',
    curriculum: [],
    requirements: [],
    benefits: [],
    whoFor: [],
    faq: [],
    mentors: [],
    image: p.image_url ?? 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200',
  };
}

export default function ProgramsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');

  const { data, loading } = useApi<PaginatedResponse<Program>>(() => programsApi.list({}), []);

  const all = (data?.items ?? []).map(mapProgram);
  const items = filter === 'All' ? all : all.filter((p) => String(p.type).toLowerCase() === filter.toLowerCase());

  return (
    <PublicPage>
      <PzPageHero
        eyebrow="Programs"
        title={
          <>
            {loading ? 'Programs' : `${all.length} program${all.length === 1 ? '' : 's'}`}. One goal: ship.
          </>
        }
        description="From 90-day startup building to frontier tech research. There is a program for every stage of building."
      />

      <section className="bg-pz-void">
        <div className="pz-container pb-24 pt-10">
          <div role="tablist" aria-label="Filter programs" className="mb-12 flex gap-8 overflow-x-auto border-b border-pz-border">
            {filters.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  '-mb-px whitespace-nowrap border-b-2 pb-3 font-display text-sm font-semibold transition-colors duration-150',
                  filter === f
                    ? 'border-pz-signal text-pz-white'
                    : 'border-transparent text-pz-text-dim hover:text-pz-white',
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[380px] rounded-lg bg-pz-surface" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-16 text-pz-text-dim">No {filter.toLowerCase()} programs right now.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicPage>
  );
}
