import { DashboardShell } from '@/components/shared/dashboard-layout';
import { StatCard } from '@/components/shared/pz-cards';
import { startups, programs, events } from '@/lib/mock-data';
import { Users, Building2, GraduationCap, Briefcase, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminOverviewPage() {
  return (
    <DashboardShell type="admin" title="Overview" subtitle="POINTZERO Ecosystem Dashboard">
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total Users" value={124} change="+12 this month" icon={Users} />
          <StatCard label="Startups" value={startups.length} icon={Building2} />
          <StatCard label="Active Programs" value={programs.filter((p) => p.status === 'active').length} icon={GraduationCap} />
          <StatCard label="Investors" value={18} icon={Briefcase} />
          <StatCard label="Applications" value={47} change="+8 pending" icon={FileText} />
          <StatCard label="Events" value={events.length} icon={Calendar} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Applications</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Tolu Adebayo — Founder', 'Kemi Osei — Builder', 'Emeka Nwosu — Student'].map((name, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{name}</span>
                    <span className="text-xs text-muted-foreground">Submitted</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Active Programs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {programs.filter((p) => p.status === 'active').map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span>{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.enrolled}/{p.capacity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}