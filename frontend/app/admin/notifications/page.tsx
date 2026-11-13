'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { admin as adminApi } from '@/lib/api';

const AUDIENCES = [
  { label: 'All Users', value: 'ALL' },
  { label: 'Founders', value: 'FOUNDER' },
  { label: 'Builders', value: 'BUILDER' },
  { label: 'Students', value: 'STUDENT' },
  { label: 'Mentors', value: 'MENTOR' },
  { label: 'Investors', value: 'INVESTOR' },
  { label: 'Partners', value: 'PARTNER' },
];

export default function AdminNotificationsPage() {
  const [audience, setAudience] = useState('ALL');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = (await adminApi.broadcast({ title, message, role: audience === 'ALL' ? undefined : audience })) as { sent?: number };
      toast.success(`Sent to ${res?.sent ?? 0} user${res?.sent === 1 ? '' : 's'}`);
      setTitle('');
      setMessage('');
    } catch (err) {
      toast.error((err as Error).message || 'Could not send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardShell type="admin" title="Notifications" subtitle="Send notifications to users">
      <form onSubmit={send} className="max-w-xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Send Notification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="Notification title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea rows={3} placeholder="Notification message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} required />
            </div>
            <Button type="submit" className="w-full" disabled={sending}>{sending ? 'Sending…' : 'Send Notification'}</Button>
          </CardContent>
        </Card>
      </form>
    </DashboardShell>
  );
}
