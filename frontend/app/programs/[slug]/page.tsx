'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicPage } from '@/components/shared/public-page';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/context/auth-context';
import { programs as programsApi, applications as applicationsApi, ApiError } from '@/lib/api';
import { mapProgram } from '@/lib/mappers';
import type { Mentor } from '@/lib/types';
import { LoadingState } from '@/components/shared/states';

const APPLICANT_TYPES = ['FOUNDER', 'BUILDER', 'STUDENT', 'MENTOR', 'INVESTOR', 'PARTNER'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-pz-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-pz-text">
          <Check className="mt-1 h-4 w-4 shrink-0 text-pz-signal" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const { user } = useAuth();
  const [appState, setAppState] = useState<'idle' | 'submitting' | 'applied'>('idle');

  const { data, loading } = useApi(async () => {
    const p = await programsApi.get(slug);
    const curriculum = await programsApi.curriculum(p.id).catch(() => []);
    return { raw: p, program: { ...mapProgram(p), curriculum: curriculum.map((c) => ({ week: c.week, title: c.title, description: c.description ?? '' })) } };
  }, [slug]);
  const program = data?.program;

  const apply = async () => {
    if (!user) {
      toast.error('Sign in to apply to this program.');
      router.push('/login');
      return;
    }
    setAppState('submitting');
    try {
      await applicationsApi.submit({
        application_type: APPLICANT_TYPES.includes(user.role) ? user.role : 'FOUNDER',
        program_id: data!.raw.id,
        answers: { first_name: user.first_name ?? '', last_name: user.last_name ?? '', email: user.email },
      });
      setAppState('applied');
      toast.success('Application submitted');
    } catch (err) {
      setAppState('idle');
      toast.error((err as ApiError).message || 'Could not submit application');
    }
  };

  if (loading) {
    return (
      <PublicPage>
        <LoadingState className="py-32" />
      </PublicPage>
    );
  }

  if (!program) {
    return (
      <PublicPage>
        <div className="pz-container py-32">
          <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-pz-white">Program not found</h1>
          <Button asChild className="mt-6">
            <a href="/programs">Back to Programs</a>
          </Button>
        </div>
      </PublicPage>
    );
  }

  const programMentors: Mentor[] = [];
  const capacityPct = program.capacity ? Math.round((program.enrolled / program.capacity) * 100) : 0;
  const closed = program.status === 'closed' || data?.raw.application_open === false;
  const ctaLabel = appState === 'applied' ? 'Application submitted' : appState === 'submitting' ? 'Submitting…' : closed ? 'Applications closed' : 'Apply now';
  const ctaDisabled = appState !== 'idle' || closed;
  const statusLabel = program.status === 'active' ? 'OPEN' : program.status.toUpperCase();

  return (
    <PublicPage>
      {/* Full-bleed image header, 480px */}
      <section className="relative -mt-16 h-[480px] overflow-hidden bg-pz-void">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={program.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-pz-void via-pz-void/60 to-pz-void/30" />
        <div className="pz-container relative flex h-full flex-col justify-end pb-12">
          <p className="font-mono text-xs uppercase text-pz-signal">{program.type.replace('_', ' ')}</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-pz-white md:text-6xl">
            {program.name}
          </h1>
          <p className="mt-4 max-w-[560px] text-lg leading-relaxed text-pz-text">{program.description}</p>
        </div>
      </section>

      <section className="bg-pz-void">
        <div className="pz-container py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
            {/* Sticky sidebar */}
            <aside className="lg:order-first">
              <div className="space-y-6 rounded-lg border border-pz-border bg-pz-surface p-6 lg:sticky lg:top-24">
                <span
                  className={`inline-block rounded-sm border px-1.5 py-0.5 font-mono text-[11px] ${
                    program.status === 'active'
                      ? 'border-pz-signal/30 bg-pz-signal-dim text-pz-signal'
                      : 'border-pz-border text-pz-text-dim'
                  }`}
                >
                  {statusLabel}
                </span>

                <dl className="space-y-3 text-sm">
                  {[
                    ['Cohort', program.cohort],
                    ['Starts', program.startDate],
                    ['Ends', program.endDate],
                    ['Deadline', program.applicationDeadline],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-pz-text-dim">{k}</dt>
                      <dd className="font-mono text-pz-white">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-pz-text-dim">Capacity</span>
                    <span className="font-mono text-pz-white">
                      {program.enrolled}/{program.capacity}
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-pz-muted">
                    <div className="h-full bg-pz-signal" style={{ width: `${capacityPct}%` }} />
                  </div>
                </div>

                <Button className="w-full" size="lg" disabled={ctaDisabled} onClick={apply}>
                  {ctaLabel}
                  {!ctaDisabled && <ArrowUpRight className="ml-2 h-4 w-4" />}
                </Button>
                {closed && <p className="text-center text-xs text-pz-text-dim">Applications are closed for this cohort.</p>}
              </div>
            </aside>

            {/* Content */}
            <div className="max-w-[760px] space-y-16">
              <Section title="What this is">
                <p className="text-lg leading-relaxed text-pz-text">{program.longDescription}</p>
              </Section>

              {program.whoFor.length > 0 && (
                <Section title="Who it's for">
                  <CheckList items={program.whoFor} />
                </Section>
              )}

              {program.curriculum.length > 0 && (
                <Section title="Curriculum">
                  <Accordion type="single" collapsible className="border-t border-pz-border">
                    {program.curriculum.map((c) => (
                      <AccordionItem key={c.week} value={`w${c.week}`} className="border-pz-border">
                        <AccordionTrigger className="text-left hover:no-underline">
                          <span className="flex items-baseline gap-4">
                            <span className="font-mono text-xs text-pz-signal">W{c.week}</span>
                            <span className="font-display text-base font-semibold text-pz-white">{c.title}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pl-10 text-pz-text-dim">{c.description}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Section>
              )}

              {program.requirements.length > 0 && (
                <Section title="Requirements">
                  <CheckList items={program.requirements} />
                </Section>
              )}

              {program.benefits.length > 0 && (
                <Section title="Benefits">
                  <CheckList items={program.benefits} />
                </Section>
              )}

              {program.faq.length > 0 && (
                <Section title="FAQ">
                  <Accordion type="single" collapsible className="border-t border-pz-border">
                    {program.faq.map((f, i) => (
                      <AccordionItem key={i} value={`faq-${i}`} className="border-pz-border">
                        <AccordionTrigger className="text-left font-display text-base font-semibold text-pz-white hover:no-underline">
                          {f.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-pz-text-dim">{f.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Section>
              )}

              {programMentors.length > 0 && (
                <Section title="Mentors">
                  <div className="grid gap-6 sm:grid-cols-2">
                    {programMentors.map((m) => (
                      <div key={m.id} className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={m.avatar} alt={m.name} />
                          <AvatarFallback className="bg-muted">{m.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-display font-semibold text-pz-white">{m.name}</p>
                          <p className="text-sm text-pz-text-dim">{m.company}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
