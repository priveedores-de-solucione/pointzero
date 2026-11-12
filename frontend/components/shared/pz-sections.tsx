import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Pattern A header: left title, optional right-aligned link. No badge above the heading. */
export function SectionHeader({
  title,
  description,
  href,
  hrefLabel,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  hrefLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col justify-between gap-5 sm:flex-row sm:items-end', className)}>
      <div>
        <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-pz-white md:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 max-w-[560px] text-lg leading-relaxed text-pz-text">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1.5 font-display text-sm font-semibold text-pz-text transition-colors duration-150 hover:text-pz-signal"
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** "What we are not" — a typographic strike-list. No cards, no borders. */
export const notList = [
  'Not a coworking space full of people answering emails.',
  'Not a coding academy obsessed with certificates.',
  'Not an event centre disguised as a technology company.',
];

export function StrikeList({ items = notList }: { items?: string[] }) {
  return (
    <ul className="max-w-[68ch]">
      {items.map((t) => (
        <li key={t} className="flex gap-4 text-lg leading-[2] text-pz-text-dim">
          <span className="font-mono text-pz-signal" aria-hidden>
            –
          </span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/** Journey rail — Explore → Graduate. Horizontal on desktop, vertical with a left line on mobile. */
export const journey = [
  { label: 'Explore', desc: 'Visit, join events, find your people and your problem.' },
  { label: 'Build', desc: 'Commit to a product. Ship in 90 days with mentors beside you.' },
  { label: 'Launch', desc: 'Put it in front of real users, then real investors.' },
  { label: 'Scale', desc: 'Traction, capital and a team that can carry it.' },
  { label: 'Graduate', desc: 'Leave a company. Come back to mentor the next builder.' },
];

export function JourneyRail() {
  return (
    <>
      {/* desktop */}
      <ol className="relative hidden grid-cols-5 gap-6 md:grid">
        <div className="absolute left-0 right-0 top-[3px] h-px bg-pz-border" aria-hidden />
        {journey.map((s) => (
          <li key={s.label} className="relative">
            <span className="relative z-10 block h-2 w-2 rounded-full bg-pz-signal" aria-hidden />
            <p className="mt-5 font-display text-sm font-semibold text-pz-white">{s.label}</p>
            <p className="mt-2 max-w-[160px] text-[13px] leading-relaxed text-pz-text-dim">{s.desc}</p>
          </li>
        ))}
      </ol>
      {/* mobile */}
      <ol className="relative space-y-8 md:hidden">
        <div className="absolute bottom-1 left-[3px] top-1 w-px bg-pz-border" aria-hidden />
        {journey.map((s) => (
          <li key={s.label} className="relative pl-8">
            <span className="absolute left-0 top-1.5 block h-2 w-2 rounded-full bg-pz-signal" aria-hidden />
            <p className="font-display text-sm font-semibold text-pz-white">{s.label}</p>
            <p className="mt-1 max-w-[260px] text-[13px] leading-relaxed text-pz-text-dim">{s.desc}</p>
          </li>
        ))}
      </ol>
    </>
  );
}

/** Closed-ring flywheel (SVG). Nodes are signal dots, labels sit outside the ring. */
const flywheelNodes = [
  'Talent',
  'Community',
  'Workspace',
  'Products',
  'Startups',
  'Capital',
  'Founders',
  'More builders',
];

export function FlywheelDiagram() {
  const cx = 300;
  const cy = 230;
  const r = 140;
  const pts = flywheelNodes.map((label, i) => {
    const a = (-90 + (360 / flywheelNodes.length) * i) * (Math.PI / 180);
    const lx = cx + (r + 28) * Math.cos(a);
    const ly = cy + (r + 28) * Math.sin(a);
    const cos = Math.cos(a);
    return {
      label,
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
      lx,
      ly,
      anchor: Math.abs(cos) < 0.2 ? 'middle' : cos > 0 ? 'start' : 'end',
      dy: Math.sin(a) < -0.9 ? -4 : Math.sin(a) > 0.9 ? 14 : 4,
    };
  });
  return (
    <svg
      viewBox="0 0 600 460"
      role="img"
      aria-label="The POINTZERO flywheel: talent, community, workspace, products, startups, capital, founders, more builders, looping back to talent."
      className="mx-auto w-full max-w-[640px]"
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2C333C" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r + 60} fill="none" stroke="#1E2329" strokeWidth="1" strokeDasharray="2 6" />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#EDF2F7" fontSize="15" fontWeight="600" fontFamily="var(--font-display), system-ui">
        The loop
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="#6B7785" fontSize="11" fontFamily="var(--font-mono), monospace">
        0 → 1 → 0
      </text>
      {pts.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="4" fill="#A8FF00" />
          <text
            x={p.lx}
            y={p.ly + p.dy}
            textAnchor={p.anchor as 'start' | 'middle' | 'end'}
            fill="#B8C4D0"
            fontSize="13"
            fontFamily="var(--font-sans), system-ui"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
