'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicPage } from '@/components/shared/public-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, MapPin, Users, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/context/auth-context';
import { events as eventsApi, ApiError } from '@/lib/api';
import { mapEvent } from '@/lib/mappers';
import { LoadingState } from '@/components/shared/states';

export default function EventDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [registered, setRegistered] = useState(false);
  const [busy, setBusy] = useState(false);

  // Re-fetch once auth settles so `registered` reflects the signed-in user.
  const { data: raw, loading, refetch } = useApi(() => eventsApi.get(slug), [slug, authLoading, user?.id]);
  const event = raw ? mapEvent(raw) : null;

  useEffect(() => {
    setRegistered(!!raw?.registered);
  }, [raw]);

  const toggleRegistration = async () => {
    if (!raw) return;
    if (!user) {
      toast.error('Sign in to register for this event.');
      router.push('/login');
      return;
    }
    setBusy(true);
    try {
      if (registered) {
        await eventsApi.cancel(raw.id);
        toast.success('Registration cancelled');
      } else {
        await eventsApi.register(raw.id);
        toast.success("You're registered!");
      }
      refetch();
    } catch (err) {
      toast.error((err as ApiError).message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  if (loading && !raw) {
    return (
      <PublicPage>
        <LoadingState className="py-32" />
      </PublicPage>
    );
  }

  if (!event) {
    return (
      <PublicPage>
        <div className="py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Event not found</h1>
          <Button asChild className="mt-4"><a href="/events">Back to Events</a></Button>
        </div>
      </PublicPage>
    );
  }

  const isFull = !!raw?.is_full;
  const isPast = event.status === 'past';
  const ctaLabel = busy ? 'Please wait…' : registered ? 'Cancel registration' : isPast ? 'Event Ended' : isFull ? 'Event Full' : 'Register';
  const ctaDisabled = busy || isPast || (isFull && !registered);

  return (
    <PublicPage>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-4 capitalize">{event.type.replace('_', ' ')}</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{event.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{event.description}</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{event.time}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{event.location}</span>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl font-bold tracking-tight">About this event</h2>
              <p className="mt-4 text-muted-foreground">{event.longDescription}</p>

              {event.speakers.length > 0 && (
                <div className="mt-12">
                  <h2 className="font-display text-2xl font-bold tracking-tight">Speakers</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {event.speakers.map((s) => (
                      <Card key={s.name} className="border-border/60">
                        <CardContent className="flex items-center gap-3 p-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={s.avatar} alt={s.name} />
                            <AvatarFallback>{s.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.role}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <Card className="sticky top-20">
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">{event.time}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="font-medium">{event.location}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Organizer</span><span className="font-medium">{event.organizer}</span></div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">Registration</span>
                      <span className="font-medium">{event.registered}{event.capacity ? `/${event.capacity}` : ''}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${event.capacity ? Math.min(100, (event.registered / event.capacity) * 100) : 0}%` }} />
                    </div>
                  </div>
                  <Button className="w-full" variant={registered ? 'outline' : 'default'} disabled={ctaDisabled} onClick={toggleRegistration}>
                    {registered && <Check className="mr-1 h-4 w-4" />}
                    {ctaLabel}
                  </Button>
                  {isFull && !registered && (
                    <p className="text-center text-xs text-muted-foreground">This event is at capacity.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
