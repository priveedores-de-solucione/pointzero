'use client';

import { PublicPage } from '@/components/shared/public-page';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock } from 'lucide-react';
import { LoadingState, NotFoundState } from '@/components/shared/states';
import { useApi } from '@/hooks/use-api';
import { resources as resourcesApi } from '@/lib/api';
import { mapResource } from '@/lib/mappers';

export default function ResourceDetailPage({ params }: { params: { slug: string } }) {
  const { data, loading } = useApi(() => resourcesApi.get(params.slug), [params.slug]);
  const resource = data ? mapResource(data) : null;
  if (loading) return <PublicPage><LoadingState className="py-32" /></PublicPage>;
  if (!resource) return <PublicPage><NotFoundState message="This resource does not exist." /></PublicPage>;

  return (
    <PublicPage>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Badge variant="secondary" className="capitalize">{resource.category.replace('_', ' ')}</Badge>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">{resource.title}</h1>
        <p className="mt-4 text-xl text-muted-foreground">{resource.excerpt}</p>

        <div className="mt-6 flex items-center gap-4 border-y border-border py-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={resource.authorAvatar} />
            <AvatarFallback>{resource.author[0]}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">{resource.author}</p>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{resource.publishedDate ? new Date(resource.publishedDate).toLocaleDateString('en-US', { dateStyle: 'medium' }) : ''}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{resource.readingTime} min read</span>
            </div>
          </div>
        </div>

        {resource.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resource.cover} alt={resource.title} className="mt-8 w-full rounded-xl object-cover aspect-[16/9]" />
        )}

        <div className="mt-8 prose prose-neutral dark:prose-invert max-w-none">
          {resource.content.split(/\n{2,}/).map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)}
        </div>
      </article>
    </PublicPage>
  );
}