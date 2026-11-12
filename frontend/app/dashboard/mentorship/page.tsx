'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { MentorCard } from '@/components/shared/pz-cards';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/use-api';
import { mentors as mentorsApi, type Mentor, type PaginatedResponse } from '@/lib/api';

const EXPERTISE_FILTERS = ['Product', 'Engineering', 'Fundraising', 'Marketing', 'Design', 'Operations'];

export default function MentorshipPage() {
  const [search, setSearch] = useState('');
  const [activeExpertise, setActiveExpertise] = useState<string | null>(null);

  const { data, loading } = useApi<PaginatedResponse<Mentor>>(
    () => mentorsApi.list({ expertise: activeExpertise ?? undefined, limit: 50 }),
    [activeExpertise],
  );

  const mentorList = data?.items ?? [];

  const filtered = search.trim()
    ? mentorList.filter((m) => {
        const name = m.profiles
          ? `${m.profiles.first_name} ${m.profiles.last_name}`.toLowerCase()
          : (m.name ?? '').toLowerCase();
        return name.includes(search.toLowerCase()) ||
          m.expertise?.some((e) => e.toLowerCase().includes(search.toLowerCase()));
      })
    : mentorList;

  const toggleExpertise = (e: string) =>
    setActiveExpertise((prev) => (prev === e ? null : e));

  // Normalise shape so MentorCard gets `name` and `avatar`
  const normalised = filtered.map((m) => ({
    ...m,
    name: m.profiles
      ? `${m.profiles.first_name} ${m.profiles.last_name}`
      : (m.name ?? 'Mentor'),
    avatar: m.profiles?.avatar_url ?? undefined,
  }));

  return (
    <DashboardShell type="member" title="Mentorship" subtitle="Browse and connect with mentors">
      <div className="space-y-6">
        {/* Search + filter row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search mentors…"
            className="max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {EXPERTISE_FILTERS.map((e) => (
              <Badge
                key={e}
                variant={activeExpertise === e ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-muted"
                onClick={() => toggleExpertise(e)}
              >
                {e}
              </Badge>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : normalised.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {search || activeExpertise ? 'No mentors match your filters.' : 'No mentors available yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {normalised.map((m) => (
              <MentorCard key={m.id} mentor={m as any} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}