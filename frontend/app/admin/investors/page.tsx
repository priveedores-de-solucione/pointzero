import { DashboardShell } from '@/components/shared/dashboard-layout';
import { investors } from '@/lib/mock-data';
import { InvestorCard, StatusBadge } from '@/components/shared/pz-cards';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminInvestorsPage() {
  return (
    <DashboardShell type="admin" title="Investors" subtitle="Review and manage investors">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Input placeholder="Search investors…" className="max-w-xs" />
          <Button size="sm">Add Investor</Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {investors.map((i) => (
            <div key={i.id} className="relative">
              <InvestorCard investor={i} />
              <div className="absolute right-4 top-4">
                <StatusBadge status={i.verificationStatus} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}