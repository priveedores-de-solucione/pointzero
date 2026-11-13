'use client';

import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { PublicPage } from '@/components/shared/public-page';
import { PzHero, PzButton } from '@/components/shared/pz-hero';
import { SectionHeader, StrikeList, JourneyRail } from '@/components/shared/pz-sections';
import { StartupCard, ProgramCard, SpaceCard } from '@/components/shared/pz-cards';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { campusLocations } from '@/lib/mock-data'; // static campus content — no backend endpoint
import { useApi } from '@/hooks/use-api';
import { programs as programsApi, startups as startupsApi } from '@/lib/api';
import { mapProgram, mapStartup } from '@/lib/mappers';

const roles = ['Founders', 'Builders', 'Designers', 'Students', 'Mentors', 'Investors', 'Operators'];

const investorStats = [
  { value: '25+', label: 'Active startups' },
  { value: '50+', label: 'Verified investors' },
  { value: '$2M+', label: 'Capital raised' },
  { value: '4/yr', label: 'Demo days' },
];

export default function HomePage() {
  const { data: programData } = useApi(() => programsApi.list({ limit: 3 }), []);
  const { data: startupData } = useApi(() => startupsApi.list({ limit: 8 }), []);
  const programs = (programData?.items ?? []).map(mapProgram);
  const startups = (startupData?.items ?? []).map(mapStartup);
  const publicStartups = startups.slice(0, 3);

  return (
    <PublicPage>
      {/* 1. Hero */}
      <PzHero />

      {/* 2. Manifesto pull-quote */}
      <section className="bg-pz-surface">
        <div className="pz-container pz-section">
          <blockquote className="mx-auto max-w-[800px] text-center font-display text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-pz-white md:text-5xl">
            &ldquo;Zero is not nothing.
            <br />
            Zero is a starting coordinate.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* 3. The journey */}
      <section className="bg-pz-void">
        <div className="pz-container pz-section">
          <SectionHeader title="From first visit to graduate." className="mb-14" />
          <JourneyRail />
        </div>
      </section>

      {/* 4. Programs preview */}
      <section className="bg-pz-surface">
        <div className="pz-container pz-section">
          <SectionHeader title="Find your path." href="/programs" hrefLabel="All Programs" />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.slice(0, 3).map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. What we are not */}
      <section className="bg-pz-void">
        <div className="pz-container pz-section">
          <div className="grid gap-10 lg:grid-cols-12">
            <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-pz-white md:text-4xl lg:col-span-5">
              We are not selling desks.
            </h2>
            <div className="lg:col-span-7">
              <StrikeList />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Campus preview */}
      <section className="bg-pz-surface">
        <div className="pz-container pz-section">
          <SectionHeader
            title="A physical city for builders."
            description="Spaces designed for every stage of building — from the first idea to the scaled company."
            href="/campus"
            hrefLabel="Explore Campus"
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campusLocations.slice(0, 3).map((loc) => (
              <SpaceCard key={loc.id} space={loc} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Startups */}
      <section className="bg-pz-void">
        <div className="pz-container pz-section">
          <SectionHeader title="Built at POINTZERO." href="/startups" hrefLabel="All Startups" />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publicStartups.map((s) => (
              <StartupCard key={s.id} startup={s} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. Community */}
      <section className="bg-pz-surface">
        <div className="pz-container pz-section">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-pz-white md:text-4xl">
                You are not building alone.
              </h2>
              <p className="mt-4 max-w-[560px] text-lg leading-relaxed text-pz-text">
                Founders, builders, designers, students, mentors and investors — one ecosystem, one room.
              </p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {roles.map((r) => (
                  <li key={r} className="rounded-sm border border-pz-border px-3 py-1.5 font-mono text-xs text-pz-text">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center lg:justify-end">
              <div className="flex -space-x-3">
                {startups.slice(0, 5).map((s) => (
                  <Avatar key={s.id} className="h-14 w-14 border-2 border-pz-surface">
                    <AvatarImage src={s.logo} alt={s.name} />
                    <AvatarFallback className="bg-muted">{s.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-pz-surface bg-muted font-mono text-xs text-pz-white">
                  +200
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. The Residency — the only full-bleed signal section */}
      <section className="bg-pz-signal text-pz-void">
        <div className="pz-container pz-section">
          <p className="font-mono text-xs font-medium uppercase">The Residency</p>
          <h2 className="mt-5 max-w-[760px] font-display text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-pz-void md:text-5xl">
            For builders who need more than a desk.
          </h2>
          <p className="mt-6 max-w-[560px] text-lg leading-relaxed text-pz-void/80">
            A place to live. A place to work. One expectation: build something.
          </p>
          <PzButton href="/campus#residency" variant="inverse" className="mt-10">
            Learn about the Residency <ArrowRight className="h-4 w-4" />
          </PzButton>
        </div>
      </section>

      {/* 10. For investors */}
      <section className="bg-pz-surface">
        <div className="pz-container pz-section">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <p className="font-mono text-xs text-pz-text-dim">For investors</p>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-pz-white md:text-4xl">
                Discover what the next generation of African companies is building.
              </h2>
              <p className="mt-5 max-w-[560px] text-lg leading-relaxed text-pz-text">
                Curated deal flow, founder introductions and ecosystem intelligence. Access verified startups
                before they hit the market.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PzButton href="/investors">
                  Apply as an Investor <ArrowUpRight className="h-4 w-4" />
                </PzButton>
                <PzButton href="/investor/dashboard" variant="ghost">
                  Investor Portal
                </PzButton>
              </div>
            </div>
            <dl className="grid grid-cols-2 border-l border-t border-pz-border">
              {investorStats.map((s) => (
                <div key={s.label} className="border-b border-r border-pz-border p-6 sm:p-8">
                  <dd className="font-display text-4xl font-bold tracking-[-0.03em] text-pz-white">{s.value}</dd>
                  <dt className="mt-2 text-xs text-pz-text-dim">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 11. Final CTA */}
      <section className="relative overflow-hidden bg-pz-void">
        <div className="absolute inset-0 bg-pz-grid" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-pz-void via-transparent to-pz-void" aria-hidden />
        <div className="pz-container pz-section relative">
          <h2 className="max-w-[900px] font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-pz-white md:text-6xl lg:text-7xl">
            Come with an idea.
            <br />
            <span className="text-pz-text-dim">Leave with a company.</span>
          </h2>
          <p className="mt-6 max-w-[560px] font-mono text-sm text-pz-text-dim">
            POINTZERO 90 · Cohort 3 · Applications close December 15, 2026
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <PzButton href="/apply">
              Apply Now <ArrowUpRight className="h-4 w-4" />
            </PzButton>
            <PzButton href="/contact" variant="ghost">
              Talk to Us
            </PzButton>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
