import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const heroStats = [
  { value: '25+', label: 'Startups' },
  { value: '50+', label: 'Mentors' },
  { value: '4', label: 'Cohorts' },
  { value: '$2M+', label: 'Capital' },
];

/** Stat display — structured data, not a card. */
export function StatRow({
  stats = heroStats,
  className,
}: {
  stats?: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <dl className={cn('flex flex-wrap items-stretch gap-y-6', className)}>
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            'flex flex-col pr-8 sm:pr-12',
            i > 0 && 'border-l border-pz-border pl-8 sm:pl-12',
            // two per row on mobile: drop divider at row start
            i === 2 && 'max-sm:border-l-0 max-sm:pl-0',
          )}
        >
          <dd className="order-1 font-display text-[28px] font-bold leading-none tracking-[-0.03em] text-pz-white sm:text-4xl">
            {s.value}
          </dd>
          <dt className="order-2 mt-2 font-sans text-xs text-pz-text-dim">{s.label}</dt>
        </div>
      ))}
    </dl>
  );
}

/** Primary / secondary CTAs used across the site (spec 4.2). */
export function PzButton({
  href,
  children,
  variant = 'primary',
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'inverse';
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-12 items-center justify-center gap-2 rounded-sm px-7 font-display text-sm font-semibold transition-all duration-150',
        variant === 'primary' &&
          'bg-pz-signal text-pz-void hover:scale-[1.02] hover:brightness-110',
        variant === 'ghost' &&
          'border border-pz-border text-pz-text hover:border-pz-signal/40 hover:text-pz-white',
        variant === 'inverse' &&
          'bg-pz-void text-pz-white hover:scale-[1.02] hover:brightness-125',
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Homepage hero — the coordinate system. */
export function PzHero() {
  return (
    <section className="relative -mt-16 overflow-hidden bg-pz-void pt-16">
      <div className="absolute inset-0 bg-pz-grid" aria-hidden />
      {/* fade the grid out toward the bottom edge so it anchors, not wallpapers */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-pz-void"
        aria-hidden
      />

      <div className="relative mx-auto max-w-wide px-5 md:px-10">
        <div className="mx-auto max-w-content">
          {/* single blip — one pulse on load, then still */}
          <span
            className="absolute right-5 top-24 h-2 w-2 rounded-full bg-pz-signal animate-pz-blip md:right-10 lg:top-32"
            aria-hidden
          />

          <div className="pb-20 pt-20 md:pb-28 md:pt-28 lg:pb-32 lg:pt-36">
            <p className="pz-rise pz-rise-1 font-mono text-xs text-pz-signal">
              Ogbomoso, Nigeria · Est. 2025
            </p>

            <h1 className="pz-rise pz-rise-2 mt-8 font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-pz-white md:text-5xl lg:text-6xl xl:text-7xl">
              The place where
              <br />
              builders begin.
            </h1>
            <p className="pz-rise pz-rise-2 mt-5 font-display text-2xl font-medium leading-tight tracking-[-0.03em] text-pz-text-dim md:text-3xl">
              Come with an idea.
              <br />
              Leave with a company.
            </p>

            <div className="pz-rise pz-rise-3">
              <p className="mt-8 max-w-[560px] text-lg leading-relaxed text-pz-text">
                POINTZERO is a physical technology garage and builder ecosystem for ambitious
                people building the future — from Ogbomoso, for the world.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <PzButton href="/apply">
                  Apply to Build <ArrowUpRight className="h-4 w-4" />
                </PzButton>
                <PzButton href="/programs" variant="ghost">
                  Explore Programs
                </PzButton>
              </div>
            </div>

            <div className="pz-rise pz-rise-4 mt-16 border-t border-pz-border pt-8 font-mono">
              <StatRow />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Inner-page hero: left-aligned, same grid language. */
export function PzPageHero({
  eyebrow,
  title,
  description,
  pattern = 'grid',
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  pattern?: 'grid' | 'dots';
  children?: React.ReactNode;
}) {
  return (
    <section className="relative -mt-16 overflow-hidden border-b border-pz-border bg-pz-void pt-16">
      <div
        className={cn('absolute inset-0', pattern === 'grid' ? 'bg-pz-grid' : 'bg-pz-dots opacity-60')}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-pz-void"
        aria-hidden
      />
      <div className="pz-container relative py-20 md:py-28">
        {eyebrow && <p className="font-mono text-xs text-pz-signal">{eyebrow}</p>}
        <h1 className="mt-5 max-w-[980px] font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-pz-white md:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-[560px] text-lg leading-relaxed text-pz-text">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}
