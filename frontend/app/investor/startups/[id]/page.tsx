import { DashboardShell } from '@/components/shared/dashboard-layout';
import { startups } from '@/lib/mock-data';
import { NotFoundState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, MapPin } from 'lucide-react';

export default function InvestorStartupDetailPage({ params }: { params: { id: string } }) {
  const startup = startups.find((s) => s.id === params.id);
  if (!startup) return <DashboardShell type="investor" title="Not Found"><NotFoundState /></DashboardShell>;

  return (
    <DashboardShell type="investor" title={startup.name}>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-start gap-5">
          <Avatar className="h-16 w-16 rounded-xl">
            <AvatarImage src={startup.logo} />
            <AvatarFallback className="rounded-xl text-xl">{startup.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">{startup.name}</h1>
            <p className="text-muted-foreground">{startup.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>{startup.industry}</Badge>
              <Badge variant="secondary" className="capitalize">{startup.stage.replace('_', ' ')}</Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{startup.location}</span>
              {startup.website && (
                <a href={startup.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Globe className="h-3 w-3" />Website
                </a>
              )}
            </div>
          </div>
          <Button>Request Introduction</Button>
        </div>

        {[
          { title: 'Problem', body: startup.problem },
          { title: 'Solution', body: startup.solution },
          { title: 'Product', body: startup.product },
          { title: 'Traction', body: startup.traction },
        ].filter((s) => s.body).map((s) => (
          <Card key={s.title}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{s.title}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{s.body}</p></CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Team</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {startup.founders.map((f) => (
              <div key={f.id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={f.avatar} />
                  <AvatarFallback>{f.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.role}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}