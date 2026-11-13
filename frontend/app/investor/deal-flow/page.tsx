'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ErrorState, LoadingState } from '@/components/shared/states';
import Link from 'next/link';
import { toast } from 'sonner';
import { DealFlowStage } from '@/lib/types';
import { useApi } from '@/hooks/use-api';
import { investors as investorsApi, DealFlowItem } from '@/lib/api';

const stages: DealFlowStage[] = ['discovered', 'saved', 'interested', 'introduction', 'meeting', 'due_diligence', 'investing', 'passed'];
const label = (s: string) => s.replace('_', ' ');

export default function DealFlowPage() {
  const { data, loading, error, refetch } = useApi(() => investorsApi.dealFlow(), []);
  const deals = data ?? [];
  const byStage = (stage: DealFlowStage) => deals.filter((d) => d.status.toLowerCase() === stage);

  const move = async (deal: DealFlowItem, stage: string) => {
    try {
      await investorsApi.updateDeal(deal.id, { status: stage });
      refetch();
    } catch (err) {
      toast.error((err as Error).message || 'Could not update deal');
    }
  };

  return (
    <DashboardShell type="investor" title="Deal Flow" subtitle="Track your investment pipeline">
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : (
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-4 pb-4">
            {stages.map((stage) => (
              <div key={stage} className="w-60 shrink-0">
                <div className="mb-3 flex items-center gap-2">
                  <p className="text-sm font-semibold capitalize">{label(stage)}</p>
                  <Badge variant="outline" className="text-xs">{byStage(stage).length}</Badge>
                </div>
                <div className="space-y-3">
                  {byStage(stage).map((d) => (
                    <div key={d.id} className="space-y-2 rounded-lg border border-border bg-card p-3">
                      <Link href={`/investor/startups/${d.startup_id}`} className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 rounded-md">
                          <AvatarImage src={d.startups?.logo_url} />
                          <AvatarFallback className="rounded-md text-xs">{d.startups?.name?.[0] ?? '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-semibold">{d.startups?.name ?? 'Startup'}</p>
                          <p className="text-xs text-muted-foreground">{d.startups?.industry}</p>
                        </div>
                      </Link>
                      <Select value={stage} onValueChange={(v) => move(d, v)}>
                        <SelectTrigger className="h-7 text-xs capitalize"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {stages.map((s) => <SelectItem key={s} value={s} className="capitalize">{label(s)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  {byStage(stage).length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Empty</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
