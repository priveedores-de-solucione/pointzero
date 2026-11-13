'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { IntroductionRequestCard } from '@/components/shared/pz-cards';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { Handshake } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { investors as investorsApi } from '@/lib/api';
import { mapIntroduction } from '@/lib/mappers';

export default function InvestorIntroductionsPage() {
  const { data, loading, error, refetch } = useApi(() => investorsApi.introductions(), []);
  const requests = (data ?? []).map(mapIntroduction);

  return (
    <DashboardShell type="investor" title="Introductions" subtitle="Introduction requests you have sent">
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : requests.length === 0 ? (
        <EmptyState icon={Handshake} title="No introduction requests" description="Request introductions from startup profiles." />
      ) : (
        <div className="max-w-2xl space-y-4">
          {requests.map((r) => <IntroductionRequestCard key={r.id} request={r} />)}
        </div>
      )}
    </DashboardShell>
  );
}
