'use client';

import { PublicPage } from '@/components/shared/public-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, MapPin, Users, TrendingUp, ExternalLink, Twitter, Linkedin, Instagram, Lock } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { startups as startupsApi } from '@/lib/api';
import { mapStartup } from '@/lib/mappers';
import { LoadingState } from '@/components/shared/states';

export default function StartupProfilePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { data, loading } = useApi(() => startupsApi.get(slug), [slug]);
  const startup = data ? mapStartup(data) : null;

  if (loading) {
    return (
      <PublicPage>
        <LoadingState className="py-32" />
      </PublicPage>
    );
  }

  if (!startup) {
    return (
      <PublicPage>
        <div className="py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Startup not found</h1>
          <Button asChild className="mt-4"><a href="/startups">Back to Startups</a></Button>
        </div>
      </PublicPage>
    );
  }

  const isRestricted = startup.visibility === 'investor_only';

  return (
    <PublicPage>
      {/* Hero */}
      <section className="border-b border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20 rounded-2xl">
              <AvatarImage src={startup.logo} alt={startup.name} className="rounded-2xl" />
              <AvatarFallback className="rounded-2xl bg-primary/10 text-2xl">{startup.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{startup.name}</h1>
                <Badge variant="secondary" className="capitalize">{startup.stage.replace('_', ' ')}</Badge>
                {isRestricted && (
                  <Badge variant="outline" className="gap-1"><Lock className="h-3 w-3" />Investor Only</Badge>
                )}
              </div>
              <p className="mt-2 max-w-2xl text-muted-foreground">{startup.description}</p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {startup.location && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{startup.location}</span>}
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{startup.team} team members</span>
                {startup.fundingStage && <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4" />{startup.fundingStage}</span>}
                {startup.program && <Badge variant="outline">{startup.program}</Badge>}
              </div>
            </div>
            {startup.website && <Button asChild variant="outline" className="gap-2">
              <a href={startup.website} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4" /> Website <ExternalLink className="h-3 w-3" />
              </a>
            </Button>}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <div>
                <h2 className="font-display text-xl font-bold">About</h2>
                <p className="mt-3 whitespace-pre-line text-muted-foreground">{startup.longDescription || startup.description}</p>
              </div>

              {[['Problem', startup.problem], ['Solution', startup.solution], ['Product', startup.product], ['Traction', startup.traction]].some(([, v]) => v) && (
                <div className="grid gap-6 sm:grid-cols-2">
                  {[['Problem', startup.problem], ['Solution', startup.solution], ['Product', startup.product], ['Traction', startup.traction]]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <Card key={label} className="border-border/60">
                        <CardHeader className="pb-2"><h3 className="text-sm font-semibold">{label}</h3></CardHeader>
                        <CardContent><p className="text-sm text-muted-foreground">{value}</p></CardContent>
                      </Card>
                    ))}
                </div>
              )}

              {startup.press.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-bold">Press</h2>
                  <div className="mt-3 space-y-2">
                    {startup.press.map((p) => (
                      <a key={p.title} href={p.url} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50">
                        <div>
                          <p className="text-sm font-medium">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.source}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {startup.founders.length > 0 && <Card>
                <CardHeader><h3 className="font-display font-bold">Founders</h3></CardHeader>
                <CardContent className="space-y-4">
                  {startup.founders.map((f) => (
                    <div key={f.id} className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={f.avatar} alt={f.name} />
                        <AvatarFallback>{f.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.role}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>}

              <Card>
                <CardHeader><h3 className="font-display font-bold">Details</h3></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    ['Industry', startup.industry],
                    ['Stage', startup.stage.replace('_', ' ')],
                    ['Program', startup.program],
                    ['Cohort', startup.cohort],
                    ['Team Size', String(startup.team)],
                    ['Funding', startup.fundingAmount],
                  ]
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium capitalize">{v}</span></div>
                    ))}
                </CardContent>
              </Card>

              {Object.values(startup.socials).some(Boolean) && (
              <Card>
                <CardHeader><h3 className="font-display font-bold">Connect</h3></CardHeader>
                <CardContent className="flex gap-3">
                  {startup.socials.twitter && <Button size="icon" variant="outline" asChild><a href={startup.socials.twitter} target="_blank" rel="noopener noreferrer"><Twitter className="h-4 w-4" /></a></Button>}
                  {startup.socials.linkedin && <Button size="icon" variant="outline" asChild><a href={startup.socials.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4" /></a></Button>}
                  {startup.socials.instagram && <Button size="icon" variant="outline" asChild><a href={startup.socials.instagram} target="_blank" rel="noopener noreferrer"><Instagram className="h-4 w-4" /></a></Button>}
                </CardContent>
              </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
