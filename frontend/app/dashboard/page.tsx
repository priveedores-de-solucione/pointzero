'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { StatCard } from '@/components/shared/pz-cards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, GraduationCap, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useApi } from '@/hooks/use-api';
import { programs as programsApi, events as eventsApi, milestones as milestonesApi, Enrollment, AppEvent, Milestone, PaginatedResponse } from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.first_name ?? 'Builder';

  const { data: enrollments } = useApi<{ data: Enrollment[] }>(() =>
    programsApi.mine().then((d) => ({ data: d })),
  );

  const { data: eventsData } = useApi<PaginatedResponse<AppEvent>>(() =>
    eventsApi.list({ when: 'upcoming', limit: 3 }),
  );

  // All milestones across the user's startups; backend enums are UPPER_SNAKE.
  const { data: milestonesData } = useApi<{ data: Milestone[] }>(() =>
    milestonesApi.mine().then((d) => ({
      data: d.map((m) => ({ ...m, status: m.status.toLowerCase(), stage: m.stage.toLowerCase() })),
    })),
  );

  const enrollmentList = enrollments?.data ?? [];
  const upcomingEvents = eventsData?.items ?? [];
  const milestoneList = milestonesData?.data ?? [];
  const completed = milestoneList.filter((m) => m.status === 'completed').length;
  const total = milestoneList.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const activePrograms = enrollmentList.filter((e) => e.programs?.status === 'ACTIVE');

  return (
    <DashboardShell type="member" title="Overview" subtitle={`Welcome back, ${firstName}`}>
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Program Progress" value={`${progress}%`} icon={TrendingUp} />
          <StatCard label="Milestones" value={total > 0 ? `${completed}/${total}` : '—'} icon={Target} />
          <StatCard label="Active Programs" value={activePrograms.length} icon={GraduationCap} />
          <StatCard label="Upcoming Events" value={upcomingEvents.length} icon={Calendar} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Program Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activePrograms.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active programs</p>
              ) : activePrograms.map((e) => (
                <div key={e.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium">{e.programs?.name}</span>
                    <span className="text-muted-foreground">{e.cohorts?.name}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Upcoming Events</CardTitle>
                <Button asChild variant="ghost" size="sm"><Link href="/dashboard/events">View all</Link></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              ) : upcomingEvents.map((e) => {
                const date = new Date(e.start_time);
                return (
                  <div key={e.id} className="flex items-start gap-3">
                    <div className="rounded-md bg-primary/10 px-2.5 py-1.5 text-center">
                      <p className="text-xs font-bold text-primary">{date.getDate()}</p>
                      <p className="text-xs text-muted-foreground">{date.toLocaleString('default', { month: 'short' })}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · {e.location}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {milestoneList.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Recent Milestones</CardTitle>
                <Button asChild variant="ghost" size="sm"><Link href="/dashboard/milestones">View all</Link></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {milestoneList.slice(0, 4).map((m) => (
                  <div key={m.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{m.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{m.stage}</p>
                    </div>
                    <Badge variant={m.status === 'completed' ? 'default' : m.status === 'blocked' ? 'destructive' : 'secondary'} className="capitalize text-xs">
                      {m.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
