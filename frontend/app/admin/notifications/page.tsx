import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminNotificationsPage() {
  return (
    <DashboardShell type="admin" title="Notifications" subtitle="Send notifications to users">
      <div className="max-w-xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Send Notification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select audience" /></SelectTrigger>
                <SelectContent>
                  {['All Users', 'Founders', 'Builders', 'Students', 'Mentors', 'Investors'].map((a) => (
                    <SelectItem key={a} value={a.toLowerCase().replace(' ', '_')}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="Notification title" />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea rows={3} placeholder="Notification message" />
            </div>
            <Button className="w-full">Send Notification</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}