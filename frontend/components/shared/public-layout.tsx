'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/programs', label: 'Programs' },
  { href: '/campus', label: 'Campus' },
  { href: '/startups', label: 'Startups' },
  { href: '/community', label: 'Community' },
  { href: '/events', label: 'Events' },
];

/** Icon-only mark — used in compact spaces (dashboard header, favicon fallback). */
export function PzMark({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/icon.png"
      alt="Point Zero"
      width={size}
      height={size}
      className="shrink-0"
      priority
    />
  );
}

/** Full horizontal lockup — icon + wordmark. */
export function PzLogo({ height = 28 }: { height?: number }) {
  // The logo PNG is wide (roughly 4:1 ratio), so derive width proportionally.
  return (
    <Image
      src="/logo.png"
      alt="Point Zero — Where Builders Begin"
      height={height}
      width={height * 4}
      className="shrink-0"
      priority
    />
  );
}

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 h-16 transition-[background-color,backdrop-filter] duration-200',
          scrolled
            ? 'border-b border-pz-border bg-pz-void/80 backdrop-blur-lg'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="pz-container flex h-full items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="POINTZERO home">
            <PzLogo height={28} />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-pz-text-dim transition-colors duration-150 hover:text-pz-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <Link href="/login" className="text-sm font-medium text-pz-text transition-colors duration-150 hover:text-pz-white">
              Sign In
            </Link>
            <Link
              href="/apply"
              className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-pz-signal px-4 font-display text-sm font-semibold text-pz-void transition-all duration-150 hover:scale-[1.02] hover:brightness-110"
            >
              Apply <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center text-pz-white lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-[60] lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            'absolute inset-0 bg-pz-void/70 transition-opacity duration-200',
            open ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            'absolute right-0 top-0 flex h-full w-[min(320px,85vw)] flex-col border-l border-pz-border bg-pz-surface transition-transform duration-200',
            open ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="flex h-16 items-center justify-between px-5">
            <PzLogo height={22} />
            <button
              className="flex h-10 w-10 items-center justify-center text-pz-white"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col px-5">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center border-b border-pz-border font-display text-lg font-medium text-pz-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3 p-5">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex h-12 items-center justify-center rounded-sm border border-pz-border font-display text-sm font-semibold text-pz-text"
            >
              Sign In
            </Link>
            <Link
              href="/apply"
              onClick={() => setOpen(false)}
              className="flex h-12 items-center justify-center gap-1.5 rounded-sm bg-pz-signal font-display text-sm font-semibold text-pz-void"
            >
              Apply <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

const footerCols = [
  {
    title: 'Platform',
    links: [
      { href: '/programs', label: 'Programs' },
      { href: '/startups', label: 'Startups' },
      { href: '/events', label: 'Events' },
      { href: '/resources', label: 'Resources' },
    ],
  },
  {
    title: 'Ecosystem',
    links: [
      { href: '/about', label: 'About' },
      { href: '/community', label: 'Community' },
      { href: '/partners', label: 'Partners' },
      { href: '/investors', label: 'Investors' },
    ],
  },
  {
    title: 'Get In',
    links: [
      { href: '/apply', label: 'Apply' },
      { href: '/contact', label: 'Contact' },
      { href: '/partner', label: 'Partner' },
      { href: '/investors', label: 'Invest' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
  {
    title: 'Social',
    links: [
      { href: 'https://twitter.com', label: 'Twitter' },
      { href: 'https://linkedin.com', label: 'LinkedIn' },
      { href: 'https://instagram.com', label: 'Instagram' },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-pz-border bg-pz-surface">
      <div className="pz-container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(5,1fr)]">
          <div>
            <Link href="/" className="inline-flex">
              <PzLogo height={24} />
            </Link>
            <p className="mt-5 max-w-[240px] text-sm text-pz-text">The Startup City for Builders.</p>
            <p className="mt-2 font-mono text-xs text-pz-text-dim">Ogbomoso, Nigeria</p>
          </div>
          {footerCols.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-pz-white">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-pz-text-dim transition-colors duration-150 hover:text-pz-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col justify-between gap-3 border-t border-pz-border pt-6 sm:flex-row">
          <p className="font-mono text-xs text-pz-text-dim">© {new Date().getFullYear()} POINTZERO</p>
          <p className="font-mono text-xs text-pz-text-dim">Build over talk. Execution over hype.</p>
        </div>
      </div>
    </footer>
  );
}
