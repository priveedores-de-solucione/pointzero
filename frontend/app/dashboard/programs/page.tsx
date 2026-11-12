'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import * as apiClient from '@/lib/api';

export default function DashboardProgramsPage() {
  const { data, loading } = useApi<{ data: apiClient.Enrollment[] }>(() =>
    apiClient.programs.mine().then((d) => ({ data: d })),
  );

  const enrollments = data?.data ?? [];

  return (
    <DashboardShell type="member" title="Programs" subtitle="Your active and completed programs">
      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">You are not enrolled in any programs yet.</p>
          <Button asChild className="mt-4"><Link href="/programs">Browse Programs</Link></Button>
        </div>
      ) : (
        <div className="space-y-6">
          {enrollments.map((e) => {
            const p = e.programs;
            if (!p) return null;
            const status = p.status?.toLowerCase() ?? 'unknown';
            return (
              <Card key={e.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">{e.cohorts?.name ?? p.cohort}</p>
                    </div>
                    <Badge variant={status === 'active' ? 'default' : status === 'upcoming' ? 'secondary' : 'outline'} className="capitalize shrink-0">
                      {status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                  {p.start_date && p.end_date && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />{p.start_date} → {p.end_date}
                      </span>
                    </div>
                  )}
                  {status === 'active' && (
                    <div>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">—</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/programs/${p.slug}`}>View Program</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
