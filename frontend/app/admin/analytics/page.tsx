import { DashboardShell } from '@/components/shared/dashboard-layout';
import { StatCard } from '@/components/shared/pz-cards';
import { Users, Building2, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminAnalyticsPage() {
  return (
    <DashboardShell type="admin" title="Analytics" subtitle="Ecosystem performance overview">
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="User Growth (MTD)" value="+12" icon={Users} />
          <StatCard label="New Startups (MTD)" value="+3" icon={Building2} />
          <StatCard label="Applications (MTD)" value="+8" icon={TrendingUp} />
          <StatCard label="Events Attended" value={47} icon={Calendar} />
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Applications Over Time</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              Chart will connect to /api/v1/admin/analytics
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">User Growth</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              Chart will connect to /api/v1/admin/analytics
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}