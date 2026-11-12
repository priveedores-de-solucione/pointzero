import { DashboardShell } from '@/components/shared/dashboard-layout';
import { partners } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function AdminPartnersPage() {
  return (
    <DashboardShell type="admin" title="Partners" subtitle="Manage ecosystem partners">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Input placeholder="Search partners…" className="max-w-xs" />
          <Button size="sm">Add Partner</Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p) => (
            <Card key={p.id} className="transition-all hover:shadow-md">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <Badge variant="secondary" className="mt-1 text-xs capitalize">{p.category}</Badge>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}