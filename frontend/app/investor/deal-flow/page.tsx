import { DashboardShell } from '@/components/shared/dashboard-layout';
import { startups } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DealFlowStage } from '@/lib/types';

const stages: DealFlowStage[] = ['discovered', 'saved', 'interested', 'introduction', 'meeting', 'due_diligence', 'investing'];

const mockDealFlow: Record<DealFlowStage, typeof startups> = {
  discovered: [startups[0]],
  saved: [startups[1]],
  interested: [],
  introduction: [],
  meeting: [],
  due_diligence: [],
  investing: [],
  passed: [],
};

export default function DealFlowPage() {
  return (
    <DashboardShell type="investor" title="Deal Flow" subtitle="Track your investment pipeline">
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {stages.map((stage) => (
            <div key={stage} className="w-56 shrink-0">
              <div className="mb-3 flex items-center gap-2">
                <p className="text-sm font-semibold capitalize">{stage.replace('_', ' ')}</p>
                <Badge variant="outline" className="text-xs">{mockDealFlow[stage].length}</Badge>
              </div>
              <div className="space-y-3">
                {mockDealFlow[stage].map((s) => (
                  <div key={s.id} className="rounded-lg border border-border bg-card p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 rounded-md">
                        <AvatarImage src={s.logo} />
                        <AvatarFallback className="rounded-md text-xs">{s.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.industry}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {mockDealFlow[stage].length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Empty</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}