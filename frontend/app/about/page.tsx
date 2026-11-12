import { PublicPage } from '@/components/shared/public-page';
import { PzPageHero } from '@/components/shared/pz-hero';
import { StrikeList, FlywheelDiagram } from '@/components/shared/pz-sections';

const pillars = [
  {
    title: 'Mission',
    body: 'To build the infrastructure that allows anyone, anywhere in Africa, to turn an idea into a company. We remove the barriers of geography, network and access — and replace them with mentorship, community and capital.',
  },
  {
    title: 'Vision',
    body: 'A world where geography does not determine access to opportunity. Where a founder in Ogbomoso has the same chance of building a world-changing company as a founder in San Francisco.',
  },
  {
    title: 'Why Ogbomoso',
    body: 'Ogbomoso is part of the identity of POINTZERO, not just an address. We chose to build outside the major cities because the next generation of African companies will be built by people close to the problems, not close to the capital.',
  },
];

const philosophy = [
  { title: 'Build > Talk', body: ['Ideas are everywhere.', 'Execution is rare.'] },
  { title: 'Talent doesn’t need permission', body: ['We refuse to believe postcode', 'determines potential.'] },
  { title: 'Competition outside.', body: ['Collaboration inside.', 'The ecosystem grows together.'] },
  { title: 'Failure is data.', body: ['Things will break. Good.', 'That’s what building looks like.'] },
  { title: 'Small places build big things.', body: ['We are not ashamed of', 'starting small.'] },
  { title: 'Leave better than you arrived.', body: ['Every generation makes the', 'next one stronger.'] },
];

const loop = [
  { before: 'Arrived with an idea', after: 'Left with a company' },
  { before: 'Arrived as a student', after: 'Left as a founder' },
  { before: 'Arrived as a builder', after: 'Left with a product in market' },
  { before: 'Arrived as a founder', after: 'Came back as a mentor' },
];

const timeline = [
  { year: '2024', title: 'The Idea', description: 'POINTZERO is conceived as a response to the lack of startup infrastructure outside major African cities.' },
  { year: '2025', title: 'Development', description: 'The campus is built in Ogbomoso. The first programs are designed and mentors are recruited.' },
  { year: '2025', title: 'First Campus', description: 'POINTZERO Campus opens with 9 spaces: The Zero, Build House, Founder House, Academy, Labs, and more.' },
  { year: '2025', title: 'First Programs', description: 'POINTZERO 90 Cohort 1 launches. 12 founders. 90 days. One goal: ship.' },
  { year: '2026', title: 'The Ecosystem', description: 'With 3 cohorts, 25+ startups, 50+ investors, and a thriving community, POINTZERO becomes a full ecosystem.' },
];

export default function AboutPage() {
  return (
    <PublicPage>
      {/* 1. Hero */}
      <PzPageHero
        eyebrow="About · 00"
        title="We exist to make geography irrelevant to opportunity."
        description="POINTZERO is not a coworking space. It is not an accelerator. It is a startup city — a complete ecosystem where talent becomes companies."
      />

      {/* 2. Mission / Vision / Why Ogbomoso */}
      <section className="bg-pz-void">
        <div className="pz-container pz-section">
          <div className="grid divide-y divide-pz-border md:grid-cols-3 md:divide-x md:divide-y-0">
            {pillars.map((p, i) => (
              <div key={p.title} className={i === 0 ? 'pb-10 md:pb-0 md:pr-10' : i === 2 ? 'pt-10 md:pl-10 md:pt-0' : 'py-10 md:px-10 md:py-0'}>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-pz-white">{p.title}</h2>
                <p className="mt-4 leading-relaxed text-pz-text">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Philosophy — text, not cards */}
      <section className="bg-pz-surface">
        <div className="pz-container pz-section">
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-pz-white md:text-4xl">What we believe.</h2>
          <div className="mt-14 grid gap-x-16 gap-y-12 md:grid-cols-2">
            {philosophy.map((p) => (
              <div key={p.title}>
                <h3 className="font-display text-lg font-semibold text-pz-white">{p.title}</h3>
                <p className="mt-2 max-w-[44ch] text-base leading-relaxed text-pz-text-dim">
                  {p.body.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. What we are not */}
      <section className="bg-pz-void">
        <div className="pz-container pz-section">
          <div className="grid gap-10 lg:grid-cols-12">
            <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-pz-white md:text-4xl lg:col-span-5">
              What we are not.
            </h2>
            <div className="lg:col-span-7">
              <StrikeList />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Flywheel */}
      <section className="bg-pz-surface">
        <div className="pz-container pz-section">
          <div className="max-w-[560px]">
            <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-pz-white md:text-4xl">
              How the ecosystem grows.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-pz-text">
              Each stage feeds the next. The line closes on itself — that is the point.
            </p>
          </div>
          <div className="mt-10">
            <FlywheelDiagram />
          </div>
        </div>
      </section>

      {/* 6. Graduate loop */}
      <section className="bg-pz-void">
        <div className="pz-container pz-section">
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-pz-white md:text-4xl">The graduate loop.</h2>
          <ul className="mt-12 divide-y divide-pz-border border-y border-pz-border">
            {loop.map((l) => (
              <li key={l.before} className="grid gap-2 py-6 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-8">
                <span className="text-lg text-pz-text-dim">{l.before}</span>
                <span className="hidden font-mono text-pz-signal md:block" aria-hidden>→</span>
                <span className="font-display text-xl font-semibold tracking-[-0.02em] text-pz-white">{l.after}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Timeline (kept from the previous About page) */}
      <section className="bg-pz-surface">
        <div className="pz-container pz-section">
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-pz-white md:text-4xl">From idea to ecosystem.</h2>
          <ol className="mt-12 divide-y divide-pz-border border-y border-pz-border">
            {timeline.map((t, i) => (
              <li key={i} className="grid gap-2 py-6 md:grid-cols-12 md:gap-8">
                <span className="font-mono text-sm text-pz-signal md:col-span-2">{t.year}</span>
                <h3 className="font-display text-lg font-semibold text-pz-white md:col-span-3">{t.title}</h3>
                <p className="text-pz-text-dim md:col-span-7">{t.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7. Ten-year vision */}
      <section className="bg-pz-void">
        <div className="pz-container pz-section">
          <p className="font-mono text-xs text-pz-text-dim">The 10-year vision</p>
          <p className="mt-6 max-w-[1000px] font-display text-3xl font-bold leading-[1.08] tracking-[-0.03em] text-pz-white md:text-5xl lg:text-6xl">
            A founder in Ogbomoso has the same chance of building a world-changing company as a founder
            anywhere on earth.
          </p>
        </div>
      </section>
    </PublicPage>
  );
}
