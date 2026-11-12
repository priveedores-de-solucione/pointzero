import { DashboardShell } from '@/components/shared/dashboard-layout';
import { introductionRequests } from '@/lib/mock-data';
import { IntroductionRequestCard } from '@/components/shared/pz-cards';
import { EmptyState } from '@/components/shared/states';
import { Handshake } from 'lucide-react';

export default function InvestorIntroductionsPage() {
  return (
    <DashboardShell type="investor" title="Introductions" subtitle="Introduction requests you have sent">
      {introductionRequests.length === 0 ? (
        <EmptyState icon={Handshake} title="No introduction requests" description="Request introductions from startup profiles." />
      ) : (
        <div className="max-w-2xl space-y-4">
          {introductionRequests.map((r) => <IntroductionRequestCard key={r.id} request={r} />)}
        </div>
      )}
    </DashboardShell>
  );
}