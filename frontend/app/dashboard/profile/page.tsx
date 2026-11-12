'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { auth as authApi } from '@/lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    bio: user?.bio ?? '',
    country: user?.country ?? '',
    city: user?.city ?? '',
    website: user?.website ?? '',
    linkedin: user?.linkedin ?? '',
    twitter: user?.twitter ?? '',
    github: user?.github ?? '',
  });

  const handleChange = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await authApi.updateMe(form);
      await refreshUser();
      toast.success('Profile saved');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}` || 'U';

  return (
    <DashboardShell type="member" title="Profile" subtitle="Manage your public profile">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-5">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">Change Photo</Button>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>First Name</Label>
                <Input value={form.first_name} onChange={(e) => handleChange('first_name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input value={form.last_name} onChange={(e) => handleChange('last_name', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Textarea rows={3} value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => handleChange('country', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Links</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {([['website', 'Website', 'https://yoursite.com'], ['linkedin', 'LinkedIn', 'linkedin.com/in/you'], ['twitter', 'X / Twitter', '@handle'], ['github', 'GitHub', 'github.com/username']] as const).map(([key, label, placeholder]) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input placeholder={placeholder} value={form[key]} onChange={(e) => handleChange(key, e.target.value)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Button className="w-full sm:w-auto" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </DashboardShell>
  );
}
