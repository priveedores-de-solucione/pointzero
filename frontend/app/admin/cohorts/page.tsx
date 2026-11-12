import { DashboardShell } from '@/components/shared/dashboard-layout';
import { programs } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminCohortsPage() {
  return (
    <DashboardShell type="admin" title="Cohorts" subtitle="Manage program cohorts">
      <div className="space-y-4">
        <div className="flex justify-end"><Button size="sm">Create Cohort</Button></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{p.cohort}</CardTitle>
                  <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="capitalize">{p.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{p.name}</p>
                <p>{p.enrolled}/{p.capacity} enrolled</p>
                <p>{p.startDate} → {p.endDate}</p>
                <Button variant="outline" size="sm" className="w-full mt-2">Manage</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}