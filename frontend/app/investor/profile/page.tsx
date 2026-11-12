'use client';

import { DashboardShell } from '@/components/shared/dashboard-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const investorTypes = ['Angel', 'VC', 'Family Office', 'Corporate VC', 'Accelerator', 'Fund', 'Syndicate', 'Institution'];

export default function InvestorProfilePage() {
  return (
    <DashboardShell type="investor" title="Profile" subtitle="Manage your investor profile">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Investor Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Full Name</Label><Input placeholder="Your name" /></div>
              <div className="space-y-1.5"><Label>Organization</Label><Input placeholder="Firm or fund" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Website</Label><Input type="url" placeholder="https://" /></div>
              <div className="space-y-1.5"><Label>LinkedIn</Label><Input placeholder="linkedin.com/in/you" /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Investor Type</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {investorTypes.map((t) => <SelectItem key={t} value={t.toLowerCase().replace(' ', '_')}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Investment Thesis</Label><Textarea rows={4} placeholder="What do you look for in founders and startups?" /></div>
            <div className="space-y-1.5"><Label>Cheque Size</Label><Input placeholder="e.g. $25k – $250k" /></div>
            <Button>Save Profile</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}