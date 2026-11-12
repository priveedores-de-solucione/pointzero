'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { startups } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';

const startup = startups[0];

export default function StartupDashboardPage() {
  return (
    <DashboardShell type="member" title="Startup" subtitle="Manage your startup profile">
      <Tabs defaultValue="overview">
        <TabsList>
          {['overview', 'team', 'product', 'metrics', 'documents', 'visibility'].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6 max-w-2xl space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5"><Label>Startup Name</Label><Input defaultValue={startup.name} /></div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} defaultValue={startup.description} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Industry</Label><Input defaultValue={startup.industry} /></div>
                <div className="space-y-1.5"><Label>Website</Label><Input defaultValue={startup.website} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Stage</Label>
                  <div className="flex items-center h-10">
                    <Badge className="capitalize">{startup.stage.replace('_', ' ')}</Badge>
                  </div>
                </div>
                <div className="space-y-1.5"><Label>Location</Label><Input defaultValue={startup.location} /></div>
              </div>
              <Button>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6 max-w-2xl">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Team Members</CardTitle>
              <Button size="sm">Add Member</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {startup.founders.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.role}</p>
                  </div>
                  <Button size="sm" variant="ghost">Edit</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visibility" className="mt-6 max-w-xl">
          <Card>
            <CardHeader><CardTitle className="text-base">Visibility Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Public Profile</p>
                  <p className="text-xs text-muted-foreground">Show startup in public directory</p>
                </div>
                <Switch defaultChecked={startup.visibility === 'public'} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Investor Visibility</p>
                  <p className="text-xs text-muted-foreground">Allow verified investors to view full profile</p>
                </div>
                <Switch defaultChecked={startup.visibility === 'investor_only'} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product" className="mt-6 max-w-2xl space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Product Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5"><Label>Problem</Label><Textarea rows={3} defaultValue={startup.problem} /></div>
              <div className="space-y-1.5"><Label>Solution</Label><Textarea rows={3} defaultValue={startup.solution} /></div>
              <div className="space-y-1.5"><Label>Product</Label><Textarea rows={3} defaultValue={startup.product} /></div>
              <Button>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6 max-w-2xl">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Traction & Metrics</CardTitle>
              <Button size="sm">Add Metric</Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{startup.traction}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6 max-w-2xl">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Documents</CardTitle>
              <Button size="sm">Upload</Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}