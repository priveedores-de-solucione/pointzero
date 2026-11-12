'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

          <TabsContent value="account" className="mt-6 space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-base">Account</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5"><Label>Email</Label><Input type="email" defaultValue="jeremiah@example.com" /></div>
                <div className="space-y-1.5"><Label>Username</Label><Input defaultValue="jerydam" /></div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
            <Card className="border-destructive/50">
              <CardHeader><CardTitle className="text-base text-destructive">Danger Zone</CardTitle></CardHeader>
              <CardContent>
                <Button variant="destructive" size="sm">Delete Account</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5"><Label>Current Password</Label><Input type="password" placeholder="••••••••" /></div>
                <div className="space-y-1.5"><Label>New Password</Label><Input type="password" placeholder="Min. 8 characters" /></div>
                <div className="space-y-1.5"><Label>Confirm New Password</Label><Input type="password" placeholder="Repeat password" /></div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  ['Application updates', true],
                  ['Program announcements', true],
                  ['Mentorship session reminders', true],
                  ['Event reminders', true],
                  ['Investor activity', false],
                  ['System notices', true],
                ].map(([label, def]) => (
                  <div key={label as string} className="flex items-center justify-between">
                    <p className="text-sm">{label as string}</p>
                    <Switch defaultChecked={def as boolean} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Privacy</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Public Profile</p>
                    <p className="text-xs text-muted-foreground">Anyone can discover you</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Investor Visibility</p>
                    <p className="text-xs text-muted-foreground">Verified investors can view your profile</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}