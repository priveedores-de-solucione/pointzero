import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, ArrowUpRight, MapPin, Calendar, Clock } from 'lucide-react';
import { Startup, Program, AppEvent, Resource, Mentor, Investor, CommunityMember, IntroductionRequest, CampusLocation } from '@/lib/types';
import { cn } from '@/lib/utils';

/** Shared hover treatment: border steps to signal @30%, no shadow at rest. */
const cardHover =
  'transition-[border-color,box-shadow] duration-150 hover:border-pz-signal/30 hover:shadow-[0_0_0_1px_rgba(0,229,160,0.08)]';

function shortDate(value: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function stageLabel(stage: string) {
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace('Pre Seed', 'Pre-seed');
}

const programStatus: Record<string, { label: string; className: string }> = {
  active: { label: 'OPEN', className: 'border-pz-signal/30 bg-pz-signal-dim text-pz-signal' },
  upcoming: { label: 'UPCOMING', className: 'border-pz-border text-pz-text' },
  closed: { label: 'CLOSED', className: 'border-pz-border text-pz-text-dim' },
};

/** B. Startup card */
export function StartupCard({ startup, href }: { startup: Startup; href?: string }) {
  const tagline = startup.description;
  const meta = [stageLabel(startup.stage), startup.industry, startup.cohort].filter(Boolean).join(' · ');
  const tags = [startup.program, startup.location].filter(Boolean).slice(0, 2);
  return (
    <Card className={cn('group flex flex-col', cardHover)}>
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage src={startup.logo} alt={startup.name} />
            <AvatarFallback className="rounded-md bg-muted font-display text-sm font-semibold text-pz-white">
              {startup.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold tracking-[-0.02em] text-pz-white">
              {startup.name}
            </h3>
          </div>
        </div>

        <p className="mt-4 font-mono text-[11px] text-pz-text-dim">{meta}</p>

        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-pz-text">
          &ldquo;{tagline}&rdquo;
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-sm border border-pz-border px-2 py-0.5 text-xs text-pz-text-dim">
                {t}
              </span>
            ))}
          </div>
          <Link
            href={href ?? (startup.website && startup.website !== '#' ? startup.website : `/startups/${startup.slug}`)}
            className="inline-flex shrink-0 items-center gap-1 font-display text-sm font-semibold text-pz-text transition-colors duration-150 group-hover:text-pz-signal"
          >
            Visit <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/** A. Program card */
export function ProgramCard({ program }: { program: Program }) {
  const status = programStatus[program.status] ?? programStatus.closed;
  const spots = Math.max(program.capacity - program.enrolled, 0);
  return (
    <Link href={`/programs/${program.slug}`} className="group block">
      <Card className={cn('overflow-hidden', cardHover)}>
        <div className="aspect-video overflow-hidden bg-pz-void">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={program.image}
            alt={program.name}
            className="h-full w-full object-cover opacity-90 transition-opacity duration-150 group-hover:opacity-100"
          />
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase text-pz-text-dim">{program.type.replace('_', ' ')}</span>
            <span className={cn('rounded-sm border px-1.5 py-0.5 font-mono text-[11px]', status.className)}>
              {status.label}
            </span>
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold tracking-[-0.02em] text-pz-white">{program.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-pz-text-dim">{program.description}</p>

          <div className="mt-5 flex justify-between font-mono text-xs text-pz-text-dim">
            <span>{program.applicationDeadline ? `${shortDate(program.applicationDeadline)} deadline` : program.cohort}</span>
            {program.capacity > 0 && <span>{spots} spots</span>}
          </div>
          <div className="mt-4 flex items-center gap-1.5 border-t border-pz-border pt-4 font-display text-sm font-semibold text-pz-text transition-colors duration-150 group-hover:text-pz-signal">
            Learn more <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/** C. Space / campus card — image fills the card, label on gradient. */
export function SpaceCard({
  space,
  meta,
  className,
}: {
  space: Pick<CampusLocation, 'name' | 'description' | 'image'>;
  meta?: string;
  className?: string;
}) {
  return (
    <Link
      href="/campus"
      className={cn(
        'group relative block aspect-[4/3] overflow-hidden rounded-lg border border-pz-border transition-[border-color] duration-150 hover:border-pz-signal/30',
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={space.image} alt={space.name} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-pz-void via-pz-void/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-[13px] font-medium uppercase text-pz-white">{space.name}</h3>
          <ArrowRight className="h-4 w-4 text-pz-text transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-pz-signal" />
        </div>
        <p className="mt-1.5 line-clamp-1 text-sm text-pz-text">{space.description}</p>
        {meta && <p className="mt-2 line-clamp-1 font-mono text-[11px] text-pz-text-dim">{meta}</p>}
      </div>
    </Link>
  );
}

export function EventCard({ event }: { event: AppEvent }) {
  return (
    <Card className={cn('group overflow-hidden', cardHover)}>
      <div className="aspect-video overflow-hidden bg-pz-void">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.image} alt={event.title} className="h-full w-full object-cover opacity-90 transition-opacity duration-150 group-hover:opacity-100" />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">{event.type.replace('_', ' ')}</Badge>
          {event.status === 'past' && <Badge variant="outline">Past</Badge>}
        </div>
        <h3 className="mt-2 font-display font-bold tracking-tight">{event.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.date}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{event.location}</span>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link href={`/events/${event.slug}`}>
              Details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Card className={cn('group overflow-hidden', cardHover)}>
      <div className="aspect-video overflow-hidden bg-pz-void">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={resource.cover} alt={resource.title} className="h-full w-full object-cover opacity-90 transition-opacity duration-150 group-hover:opacity-100" />
      </div>
      <CardHeader className="pb-3">
        <Badge variant="secondary" className="w-fit capitalize">{resource.category.replace('_', ' ')}</Badge>
        <h3 className="mt-2 font-display font-bold leading-snug tracking-tight">{resource.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{resource.excerpt}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={resource.authorAvatar} />
              <AvatarFallback>{resource.author[0]}</AvatarFallback>
            </Avatar>
            <div className="text-xs">
              <p className="font-medium">{resource.author}</p>
              <p className="text-muted-foreground">{resource.readingTime} min read</p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link href={`/resources/${resource.slug}`}>
              Read <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function MentorCard({ mentor, onRequest, requesting }: { mentor: Mentor; onRequest?: () => void; requesting?: boolean }) {
  const availBadge = mentor.availability === 'available' ? 'default' : mentor.availability === 'limited' ? 'secondary' : 'outline';
  return (
    <Card className={cardHover}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={mentor.avatar} alt={mentor.name} />
            <AvatarFallback>{mentor.name?.[0] ?? '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-display font-semibold tracking-tight">{mentor.name}</h3>
            <p className="text-sm text-muted-foreground">{mentor.company}</p>
            <Badge variant={availBadge} className="mt-1 capitalize text-xs">{mentor.availability}</Badge>
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{mentor.bio}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {mentor.expertise.map((e) => (
            <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={onRequest} disabled={!onRequest || requesting}>
          {requesting ? 'Requesting…' : 'Request Session'}
        </Button>
      </CardContent>
    </Card>
  );
}

export function InvestorCard({ investor }: { investor: Investor }) {
  return (
    <Card className={cardHover}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={investor.avatar} alt={investor.name} />
            <AvatarFallback>{investor.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-display font-semibold tracking-tight">{investor.name}</h3>
            <p className="text-sm text-muted-foreground">{investor.organization}</p>
            <Badge variant="secondary" className="mt-1 capitalize text-xs">{investor.type.replace('_', ' ')}</Badge>
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{investor.thesis}</p>
        <div className="mt-3 space-y-1.5 text-xs">
          <p className="text-muted-foreground"><span className="font-medium text-foreground">Cheque:</span> {investor.chequeSize}</p>
          <p className="text-muted-foreground"><span className="font-medium text-foreground">Stages:</span> {investor.investmentStages.join(', ')}</p>
          <p className="text-muted-foreground"><span className="font-medium text-foreground">Sectors:</span> {investor.industries.join(', ')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function CommunityMemberCard({ member }: { member: CommunityMember }) {
  return (
    <Card className={cn('text-center', cardHover)}>
      <CardContent className="pt-6">
        <Avatar className="mx-auto h-16 w-16">
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback>{member.name[0]}</AvatarFallback>
        </Avatar>
        <h3 className="mt-3 font-display font-semibold tracking-tight">{member.name}</h3>
        <Badge variant="secondary" className="mt-1 text-xs">{member.role}</Badge>
        <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {member.skills.map((s) => (
            <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function IntroductionRequestCard({ request }: { request: IntroductionRequest }) {
  const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    review: 'secondary',
    accepted: 'default',
    rejected: 'destructive',
  };
  return (
    <Card className={cardHover}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage src={request.startupLogo} />
              <AvatarFallback className="rounded-lg bg-muted">{request.startupName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{request.startupName}</p>
              <p className="text-xs text-muted-foreground">{request.investorName} · {request.investorOrg}</p>
            </div>
          </div>
          <Badge variant={statusVariant[request.status]} className="capitalize">{request.status}</Badge>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{request.message}</p>
        <p className="mt-2 text-xs text-muted-foreground">Submitted {new Date(request.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
      </CardContent>
    </Card>
  );
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-pz-white">{value}</p>
          {change && <p className="mt-1 font-mono text-xs text-pz-signal">{change}</p>}
        </div>
        <div className="rounded-md border border-pz-border p-3">
          <Icon className="h-5 w-5 text-pz-text-dim" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    in_progress: 'secondary',
    completed: 'default',
    blocked: 'destructive',
    draft: 'outline',
    submitted: 'secondary',
    under_review: 'secondary',
    interview: 'secondary',
    accepted: 'default',
    rejected: 'destructive',
    waitlisted: 'outline',
    withdrawn: 'outline',
    verified: 'default',
    suspended: 'destructive',
  };
  return (
    <Badge variant={variant[status] || 'outline'} className="capitalize">
      {status.replace('_', ' ')}
    </Badge>
  );
}
