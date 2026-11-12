'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <DashboardShell type="admin" title="Settings" subtitle="Platform configuration">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Platform</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>Platform Name</Label><Input defaultValue="POINTZERO" /></div>
            <div className="space-y-1.5"><Label>Contact Email</Label><Input type="email" defaultValue="hello@pointzero.build" /></div>
            <Button>Save</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Features</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              ['Applications Open', true],
              ['Investor Platform', true],
              ['Public Startup Directory', true],
              ['Maintenance Mode', false],
            ].map(([label, def]) => (
              <div key={label as string} className="flex items-center justify-between">
                <p className="text-sm">{label as string}</p>
                <Switch defaultChecked={def as boolean} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}