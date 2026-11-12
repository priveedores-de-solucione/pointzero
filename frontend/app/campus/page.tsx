import { PublicPage } from '@/components/shared/public-page';
import { PzPageHero, PzButton } from '@/components/shared/pz-hero';
import { SpaceCard } from '@/components/shared/pz-cards';
import { campusLocations } from '@/lib/mock-data';
import { ArrowUpRight } from 'lucide-react';

export default function CampusPage() {
  return (
    <PublicPage>
      <PzPageHero
        pattern="dots"
        eyebrow="Ogbomoso · 8.1333° N, 4.2400° E"
        title="A physical city for builders."
        description="Every space is designed for a specific stage of building, from the first idea to the scaled company."
      />

      <section className="bg-pz-void">
        <div className="pz-container pz-section">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campusLocations.map((loc) => (
              <SpaceCard key={loc.id} space={loc} meta={loc.facilities.slice(0, 3).join(' · ')} />
            ))}
          </div>
        </div>
      </section>

      {/* The Residency */}
      <section id="residency" className="relative scroll-mt-16 overflow-hidden bg-pz-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1800"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-pz-void/85" aria-hidden />
        <div className="pz-container pz-section relative">
          <h2 className="font-display text-4xl font-bold tracking-[-0.03em] text-pz-white md:text-5xl">The Residency</h2>
          <div className="mt-8 max-w-[560px] space-y-6 text-lg leading-relaxed text-pz-text">
            <p>
              For builders who come from outside. Selected group. Real problem. Fixed period. A place to live. A
              place to work. One expectation: build something.
            </p>
            <p className="text-pz-text-dim">
              No attendance metrics. No certificates. At the end, we want products. Companies. Breakthroughs.
            </p>
          </div>
          <PzButton href="/programs/builder-residency" className="mt-10">
            Apply for the Residency <ArrowUpRight className="h-4 w-4" />
          </PzButton>
        </div>
      </section>
    </PublicPage>
  );
}
