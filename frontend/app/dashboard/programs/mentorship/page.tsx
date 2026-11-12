import { DashboardShell } from '@/components/shared/dashboard-layout';
import { mentors } from '@/lib/mock-data';
import { MentorCard } from '@/components/shared/pz-cards';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const expertise = ['Product', 'Engineering', 'Fundraising', 'Marketing', 'Design', 'Operations'];

export default function MentorshipPage() {
  return (
    <DashboardShell type="member" title="Mentorship" subtitle="Browse and connect with mentors">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input placeholder="Search mentors…" className="max-w-xs" />
          <div className="flex flex-wrap gap-2">
            {expertise.map((e) => (
              <Badge key={e} variant="outline" className="cursor-pointer hover:bg-muted">{e}</Badge>
            ))}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((m) => (
            <MentorCard key={m.id} mentor={m} />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}