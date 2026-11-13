'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingState } from '@/components/shared/states';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import { useApi } from '@/hooks/use-api';
import { notifications as notificationsApi, users as usersApi, NotificationPreferences } from '@/lib/api';

const PREFS: { key: keyof NotificationPreferences; label: string; hint: string }[] = [
  { key: 'email_notifications', label: 'Email notifications', hint: 'Application, program and investor updates by email' },
  { key: 'event_reminders', label: 'Event reminders', hint: 'Reminders before events you registered for' },
  { key: 'message_notifications', label: 'Message notifications', hint: 'When someone sends you a message' },
];

const errMsg = (err: unknown, fallback: string) => (err as Error).message || fallback;

function AccountTab() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await usersApi.deleteMe();
      await signOut();
      toast.success('Your account has been deleted');
      router.push('/');
    } catch (err) {
      toast.error(errMsg(err, 'Could not delete account'));
      setDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader><CardTitle className="text-base">Account</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={user?.email ?? ''} readOnly disabled /></div>
          <p className="text-xs text-muted-foreground">Edit your name, bio and links on the Profile page.</p>
        </CardContent>
      </Card>
      <Card className="border-destructive/50">
        <CardHeader><CardTitle className="text-base text-destructive">Danger Zone</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {confirming ? (
            <>
              <p className="text-sm">This permanently deletes your account and personal data. This cannot be undone.</p>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={deleteAccount} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Yes, delete my account'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={deleting}>Cancel</Button>
              </div>
            </>
          ) : (
            <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>Delete Account</Button>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function PasswordTab() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await updatePassword(password);
      toast.success('Password updated');
      setPassword('');
      setConfirm('');
    } catch (err) {
      toast.error(errMsg(err, 'Could not update password'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label>New Password</Label><Input type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Confirm New Password</Label><Input type="password" placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
          <Button type="submit" disabled={saving}>{saving ? 'Updating…' : 'Update Password'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function NotificationsTab() {
  const { data, loading } = useApi(() => notificationsApi.preferences(), []);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  useEffect(() => setPrefs(data), [data]);

  const toggle = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!prefs) return;
    const prev = prefs;
    setPrefs({ ...prefs, [key]: value });
    try {
      await notificationsApi.updatePreferences({ [key]: value });
    } catch (err) {
      setPrefs(prev);
      toast.error(errMsg(err, 'Could not update preference'));
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {loading || !prefs ? (
          <LoadingState className="py-6" />
        ) : (
          PREFS.map(({ key, label, hint }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{hint}</p>
              </div>
              <Switch checked={!!prefs[key]} onCheckedChange={(v) => toggle(key, v)} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function PrivacyTab() {
  const { user, refreshUser } = useAuth();
  const [isPublic, setIsPublic] = useState(user?.profile_public ?? true);
  useEffect(() => setIsPublic(user?.profile_public ?? true), [user]);

  const toggle = async (value: boolean) => {
    setIsPublic(value);
    try {
      await usersApi.setVisibility({ profile_public: value });
      refreshUser().catch(() => undefined);
    } catch (err) {
      setIsPublic(!value);
      toast.error(errMsg(err, 'Could not update privacy'));
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Privacy</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Public Profile</p>
            <p className="text-xs text-muted-foreground">Other members can find and view your profile</p>
          </div>
          <Switch checked={isPublic} onCheckedChange={toggle} />
        </div>
        <p className="text-xs text-muted-foreground">Startup visibility to investors is managed from your Startup page.</p>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <DashboardShell type="member" title="Settings">
      <div className="max-w-2xl">
        <Tabs defaultValue="account">
          <TabsList>
            {['account', 'password', 'notifications', 'privacy'].map((t) => (
              <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="account" className="mt-6 space-y-5"><AccountTab /></TabsContent>
          <TabsContent value="password" className="mt-6"><PasswordTab /></TabsContent>
          <TabsContent value="notifications" className="mt-6"><NotificationsTab /></TabsContent>
          <TabsContent value="privacy" className="mt-6"><PrivacyTab /></TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
