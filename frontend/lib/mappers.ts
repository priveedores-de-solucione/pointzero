/**
 * Mappers from backend records (lib/api) to the UI view-models (lib/types) the cards and pages render.
 * Backend enums are UPPER_SNAKE; the UI uses lower_snake.
 */
import type * as Api from '@/lib/api';
import type * as UI from '@/lib/types';

const PROGRAM_IMAGE = 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200';
const EVENT_IMAGE = 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200';
const RESOURCE_IMAGE = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800';

export const lower = <T extends string>(v?: string | null, fallback = '') => (v ?? fallback).toLowerCase() as T;

export function fullName(p?: { first_name?: string | null; last_name?: string | null } | null, fallback = '') {
  const n = `${p?.first_name ?? ''} ${p?.last_name ?? ''}`.trim();
  return n || fallback;
}

/** "POINTZERO_90" / "DEMO_DAY" → UI program type */
function programType(t: string): UI.ProgramType {
  const v = t.toLowerCase();
  return (v === 'pointzero_90' ? 'accelerator' : v) as UI.ProgramType;
}

export function mapProgram(p: Api.Program): UI.Program {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? '',
    longDescription: p.long_description ?? p.description ?? '',
    type: programType(p.type),
    status: lower<UI.ProgramStatus>(p.status, 'upcoming'),
    startDate: p.start_date ?? '',
    endDate: p.end_date ?? '',
    applicationDeadline: p.application_deadline ?? '',
    capacity: p.capacity ?? 0,
    enrolled: p.enrolled ?? 0,
    cohort: p.cohort ?? '',
    curriculum: [],
    requirements: [],
    benefits: [],
    whoFor: [],
    faq: [],
    mentors: [],
    image: p.image_url ?? PROGRAM_IMAGE,
  };
}

export function mapStartup(s: Api.Startup): UI.Startup {
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    logo: s.logo_url ?? '',
    description: s.description ?? '',
    longDescription: s.long_description ?? '',
    industry: s.industry ?? '',
    stage: lower<UI.StartupStage>(s.stage, 'idea').replace(/[\s-]+/g, '_') as UI.StartupStage,
    location: s.location ?? '',
    program: '',
    cohort: '',
    founders: (s.founders ?? []).map((f) => ({
      id: f.profiles?.id ?? '',
      name: fullName(f.profiles, 'Founder'),
      avatar: f.profiles?.avatar_url ?? '',
      role: f.role,
      bio: '',
    })),
    website: s.website ?? '',
    problem: '',
    solution: '',
    product: '',
    traction: '',
    funding: '',
    team: s.founders?.length || 1,
    press: [],
    socials: { twitter: '', linkedin: '', instagram: '' },
    visibility: s.is_public ? 'public' : s.investor_visible ? 'investor_only' : 'private',
    fundingStage: s.stage ?? '',
    fundingAmount: '',
  };
}

export function mapEvent(e: Api.AppEvent): UI.AppEvent {
  const start = new Date(e.start_time);
  const end = e.end_time ? new Date(e.end_time) : start;
  const now = new Date();
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    description: e.description ?? '',
    longDescription: e.description ?? '',
    type: lower<UI.EventType>(e.event_type, 'community'),
    status: start > now ? 'upcoming' : end < now ? 'past' : 'live',
    date: e.start_time,
    time: start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    location: e.location ?? 'POINTZERO Campus',
    capacity: e.capacity ?? 0,
    registered: e.registrations_count ?? 0,
    image: e.cover_image ?? EVENT_IMAGE,
    speakers: [],
    organizer: 'POINTZERO',
  };
}

export function mapResource(r: Api.Resource): UI.Resource {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.description ?? '',
    content: r.content ?? '',
    cover: r.cover_image ?? RESOURCE_IMAGE,
    author: fullName(r.profiles, 'POINTZERO'),
    authorAvatar: r.profiles?.avatar_url ?? '',
    category: lower<UI.ResourceCategory>(r.category, 'startup'),
    publishedDate: r.published_at ?? '',
    readingTime: r.reading_time ?? Math.max(1, Math.round((r.content ?? '').split(/\s+/).length / 200)),
  };
}

export function mapMentor(m: Api.Mentor): UI.Mentor {
  const availability = lower(m.availability, 'available');
  return {
    id: m.id,
    name: fullName(m.profiles, 'Mentor'),
    avatar: m.profiles?.avatar_url ?? '',
    expertise: m.expertise ?? [],
    experience: m.experience ?? '',
    company: '',
    availability: (['available', 'limited', 'unavailable'].includes(availability) ? availability : 'available') as UI.Mentor['availability'],
    bio: m.experience ?? '',
  };
}

export function mapPartner(p: Api.Partner): UI.Partner {
  return {
    id: p.id,
    name: p.organization,
    logo: p.logo_url ?? '',
    category: lower<UI.PartnerCategory>(p.partner_type, 'community'),
    description: p.description ?? '',
    website: p.website ?? '',
  };
}

function money(n?: number) {
  if (n == null) return '';
  return n >= 1_000_000 ? `$${+(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${Math.round(n / 1_000)}K` : `$${n}`;
}

export function mapInvestor(i: Api.Investor): UI.Investor {
  const range = [money(i.investment_range_min), money(i.investment_range_max)].filter(Boolean).join(' – ');
  return {
    id: i.id,
    name: fullName(i.profiles, i.organization),
    organization: i.organization,
    avatar: i.profiles?.avatar_url ?? '',
    type: lower<UI.InvestorType>(i.investor_type, 'angel'),
    investmentStages: i.investment_stage ?? [],
    industries: i.industries ?? [],
    chequeSize: range,
    geographies: i.geographies ?? [],
    portfolio: i.portfolio ? i.portfolio.split(/,\s*/) : [],
    thesis: i.investment_thesis ?? '',
    verificationStatus: lower<UI.InvestorVerificationStatus>(i.verification_status, 'pending'),
    website: i.website ?? '',
    linkedin: i.linkedin ?? '',
  };
}

export function mapIntroduction(r: Api.IntroductionRequest): UI.IntroductionRequest {
  const s = r.status.toLowerCase();
  const status: UI.IntroductionRequest['status'] =
    s.includes('reject') || s.includes('declin') ? 'rejected'
      : s.includes('accept') || s.includes('approv') || s.includes('meeting') || s.includes('closed') ? 'accepted'
        : s.includes('review') ? 'review'
          : 'pending';
  return {
    id: r.id,
    startupName: r.startups?.name ?? 'Startup',
    startupLogo: r.startups?.logo_url ?? '',
    investorName: r.investors?.organization ?? '',
    investorOrg: r.investors?.organization ?? '',
    message: r.message,
    reason: r.reason ?? '',
    status,
    createdAt: r.created_at,
  };
}

export function mapMilestone(m: Api.Milestone): UI.Milestone {
  return {
    id: m.id,
    title: m.title,
    description: m.description ?? '',
    stage: lower<UI.MilestoneStage>(m.stage, 'validate'),
    status: lower<UI.MilestoneStatus>(m.status, 'pending'),
    dueDate: m.due_date ?? '',
    completedDate: m.completed_at ?? undefined,
  };
}

/** "pending_review" / "UNDER_REVIEW" → "Pending review" */
export function humanize(v?: string | null) {
  const s = (v ?? '').replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
