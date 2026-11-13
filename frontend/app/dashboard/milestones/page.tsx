'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { StatusBadge } from '@/components/shared/pz-cards';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Milestone } from '@/lib/api';
import * as apiClient from '@/lib/api';

type MilestoneStage = 'validate' | 'build' | 'launch' | 'scale';
const stages: MilestoneStage[] = ['validate', 'build', 'launch', 'scale'];

export default function MilestonesPage() {
  // All milestones across the user's startups; backend enums are UPPER_SNAKE.
  const { data, loading } = useApi<{ data: Milestone[] }>(() =>
    apiClient.milestones.mine().then((d) => ({
      data: d.map((m) => ({ ...m, status: m.status.toLowerCase(), stage: m.stage.toLowerCase() })),
    })),
  );

  const milestoneList = data?.data ?? [];

  return (
    <DashboardShell type="member" title="Milestones" subtitle="Track your startup progress">
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {stages.map((s) => (
              <TabsTrigger key={s} value={s} className="capitalize">{s}</TabsTrigger>
            ))}
          </TabsList>

          {(['all', ...stages] as const).map((stage) => (
            <TabsContent key={stage} value={stage} className="mt-6">
              <div className="space-y-3">
                {milestoneList
                  .filter((m) => stage === 'all' || m.stage === stage)
                  .map((m) => (
                    <Card key={m.id}>
                      <CardContent className="flex items-center justify-between gap-4 py-4">
                        <div className="flex-1">
                          <p className="font-medium">{m.title}</p>
                          {m.description && <p className="mt-0.5 text-sm text-muted-foreground">{m.description}</p>}
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            {m.due_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Due {m.due_date}</span>}
                            {m.completed_at && <span>Completed {m.completed_at}</span>}
                            <span className="capitalize rounded bg-muted px-1.5 py-0.5">{m.stage}</span>
                          </div>
                        </div>
                        <StatusBadge status={m.status as 'pending' | 'in_progress' | 'completed' | 'blocked'} />
                      </CardContent>
                    </Card>
                  ))}
                {milestoneList.filter((m) => stage === 'all' || m.stage === stage).length === 0 && (
                  <p className="text-sm text-muted-foreground">No milestones in this stage</p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </DashboardShell>
  );
}
