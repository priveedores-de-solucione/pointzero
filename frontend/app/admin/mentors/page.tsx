import { DashboardShell } from '@/components/shared/dashboard-layout';
import { mentors } from '@/lib/mock-data';
import { MentorCard } from '@/components/shared/pz-cards';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminMentorsPage() {
  return (
    <DashboardShell type="admin" title="Mentors" subtitle="Manage ecosystem mentors">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Input placeholder="Search mentors…" className="max-w-xs" />
          <Button size="sm">Add Mentor</Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((m) => <MentorCard key={m.id} mentor={m} />)}
        </div>
      </div>
    </DashboardShell>
  );
}