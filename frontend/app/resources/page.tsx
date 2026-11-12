'use client';

import { useState, useCallback } from 'react';
import { ResourceCard } from '@/components/shared/pz-cards';
import { PublicPage } from '@/components/shared/public-page';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ResourceCategory } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/states';
import { useApi } from '@/hooks/use-api';
import { resources as resourcesApi, PaginatedResponse, Resource } from '@/lib/api';
import { cn } from '@/lib/utils';

const categories: { label: string; value: ResourceCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Startup', value: 'startup' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Product', value: 'product' },
  { label: 'Design', value: 'design' },
  { label: 'Fundraising', value: 'fundraising' },
  { label: 'AI', value: 'ai' },
  { label: 'Blockchain', value: 'blockchain' },
  { label: 'Founder Stories', value: 'founder_stories' },
];

function mapResource(r: Resource) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? '',
    content: r.content ?? '',
    cover: r.cover_url ?? 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: r.author ?? 'POINTZERO',
    authorAvatar: '',
    category: r.category as ResourceCategory,
    publishedDate: r.published_at ?? '',
    readingTime: r.reading_time ?? 5,
  };
}

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    clearTimeout((window as { _pz_rt?: ReturnType<typeof setTimeout> })._pz_rt);
    (window as { _pz_rt?: ReturnType<typeof setTimeout> })._pz_rt = setTimeout(() => setDebouncedSearch(val), 300);
  }, []);

  const { data, loading } = useApi<PaginatedResponse<Resource>>(() =>
    resourcesApi.list({
      category: activeCategory !== 'all' ? activeCategory : undefined,
      q: debouncedSearch || undefined,
      limit: 50,
    }),
    [activeCategory, debouncedSearch],
  );

  const items = (data?.items ?? []).map(mapResource);

  return (
    <PublicPage>
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Resources</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Guides, essays, and playbooks for founders and builders.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <Badge
                  key={c.value}
                  variant={activeCategory === c.value ? 'default' : 'outline'}
                  className={cn('cursor-pointer capitalize', activeCategory === c.value ? '' : 'hover:bg-muted')}
                  onClick={() => setActiveCategory(c.value)}
                >
                  {c.label}
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Search resources…"
              className="w-full max-w-xs"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="mt-10">
              <EmptyState title="No resources found" description="Try a different category or search term." />
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicPage>
  );
}
