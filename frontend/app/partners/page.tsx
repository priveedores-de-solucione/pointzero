'use client';

import { PublicPage } from '@/components/shared/public-page';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { partners as partnersApi, Partner } from '@/lib/api';

const categories = [
  'Technology', 'Capital', 'Education', 'Infrastructure',
  'Media', 'Corporate', 'Government', 'Community',
];

export default function PartnersPage() {
  const { data, loading } = useApi<{ data: Partner[] }>(() =>
    partnersApi.list().then((items) => ({ data: items })),
  );

  const items = data?.data ?? [];

  return (
    <PublicPage>
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Our Partners</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Organizations that back the POINTZERO mission.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <Badge key={c} variant="outline" className="cursor-pointer hover:bg-muted">{c}</Badge>
            ))}
          </div>

          {loading ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <Card key={p.id} className="transition-all hover:shadow-lg hover:border-primary/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.logo_url && (
                        <img src={p.logo_url} alt={p.name} className="h-10 w-10 rounded-lg object-contain" />
                      )}
                      <div>
                        <h3 className="font-display font-semibold">{p.name}</h3>
                        <Badge variant="secondary" className="mt-1 text-xs capitalize">{p.category}</Badge>
                      </div>
                    </div>
                    {p.description && (
                      <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>
                    )}
                    {p.website && (
                      <a href={p.website} target="_blank" rel="noopener noreferrer"
                        className="mt-3 text-xs text-primary hover:underline block">{p.website}</a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-16 rounded-2xl bg-primary/5 px-8 py-12 text-center">
            <h2 className="font-display text-2xl font-bold">Become a Partner</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Support the next generation of African startups. Partner with POINTZERO to access talent, deals, and community.
            </p>
            <Button asChild className="mt-6">
              <Link href="/partner">Partner with Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
