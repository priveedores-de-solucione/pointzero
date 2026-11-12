import { DashboardShell } from '@/components/shared/dashboard-layout';
import { resources } from '@/lib/mock-data';
import { ResourceCard } from '@/components/shared/pz-cards';
import { Input } from '@/components/ui/input';

export default function DashboardResourcesPage() {
  return (
    <DashboardShell type="member" title="Resources" subtitle="Guides and playbooks for builders">
      <div className="space-y-6">
        <Input placeholder="Search resources…" className="max-w-xs" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => <ResourceCard key={r.id} resource={r} />)}
        </div>
      </div>
    </DashboardShell>
  );
}