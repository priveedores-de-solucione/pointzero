'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { MentorCard } from '@/components/shared/pz-cards';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/use-api';
import { mentors as mentorsApi, mentorship as mentorshipApi, type Mentor, type PaginatedResponse } from '@/lib/api';
import { mapMentor } from '@/lib/mappers';
import { toast } from 'sonner';

const EXPERTISE_FILTERS = ['Product', 'Engineering', 'Fundraising', 'Marketing', 'Design', 'Operations'];

export default function MentorshipPage() {
  const [search, setSearch] = useState('');
  const [activeExpertise, setActiveExpertise] = useState<string | null>(null);

  const { data, loading } = useApi<PaginatedResponse<Mentor>>(
    () => mentorsApi.list({ expertise: activeExpertise ?? undefined, limit: 50 }),
    [activeExpertise],
  );

  const mentorList = data?.items ?? [];

  const q = search.trim().toLowerCase();
  const normalised = mentorList
    .map(mapMentor)
    .filter((m) => !q || m.name.toLowerCase().includes(q) || m.expertise.some((e) => e.toLowerCase().includes(q)));

  const [requestingId, setRequestingId] = useState<string | null>(null);
  const requestSession = async (mentorId: string) => {
    setRequestingId(mentorId);
    try {
      await mentorshipApi.request({ mentor_id: mentorId });
      toast.success('Request sent. The mentor will be notified.');
    } catch (err) {
      toast.error((err as Error).message || 'Could not send request');
    } finally {
      setRequestingId(null);
    }
  };

  const toggleExpertise = (e: string) =>
    setActiveExpertise((prev) => (prev === e ? null : e));

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
              <MentorCard key={m.id} mentor={m} onRequest={() => requestSession(m.id)} requesting={requestingId === m.id} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}