/**
 * API client — talks to the FastAPI backend.
 * Set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:8000/api/v1 — the backend mounts all routes under /api/v1)
 *
 * Backend conventions (see backend/app/utils/helpers.py & core/exceptions.py):
 *   success:    { data: T, meta: {} }
 *   paginated:  { data: T[], meta: { page, limit, total, total_pages } }  → normalised to PaginatedResponse<T>
 *   error:      { error: { code, message, details } }
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pz_access_token');
}

export function setToken(token: string) {
  localStorage.setItem('pz_access_token', token);
}

export function clearToken() {
  localStorage.removeItem('pz_access_token');
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: { field: string; message: string }[];

  constructor(message: string, status: number, code?: string, details?: { field: string; message: string }[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

function qs(params?: Query): string {
  if (!params) return '';
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

/** Backend enums are UPPER_SNAKE; the UI uses lower_snake / labels. */
function enumParam(v?: string | null): string | undefined {
  return v ? v.trim().toUpperCase().replace(/[\s-]+/g, '_') : undefined;
}

async function request<T>(path: string, options: RequestInit = {}, auth = false): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Always send the token when we have one: public endpoints use it (optionally) to
  // personalise results, e.g. `registered` on events or private startups for members.
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  else if (auth) throw new ApiError('You need to be signed in', 401, 'UNAUTHENTICATED');

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0, 'NETWORK_ERROR');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const err = body?.error ?? body?.detail ?? {};
    throw new ApiError(
      err.message ?? (typeof body?.detail === 'string' ? body.detail : res.statusText) ?? 'Request failed',
      res.status,
      err.code,
      err.details,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

/** GET/POST/... that unwraps `{ data }`. */
function call<T>(path: string, options: RequestInit = {}, auth = false): Promise<T> {
  return request<{ data: T }>(path, options, auth).then((r) => r?.data as T);
}

/** GET a paginated list and normalise `{ data, meta }` → `{ items, total, page, limit, pages }`. */
function list<T>(path: string, auth = false): Promise<PaginatedResponse<T>> {
  return request<{ data: T[]; meta?: { page?: number; limit?: number; total?: number; total_pages?: number } }>(
    path,
    {},
    auth,
  ).then((r) => ({
    items: r.data ?? [],
    total: r.meta?.total ?? r.data?.length ?? 0,
    page: r.meta?.page ?? 1,
    limit: r.meta?.limit ?? r.data?.length ?? 0,
    pages: r.meta?.total_pages ?? 1,
  }));
}

const post = (body?: unknown): RequestInit => ({ method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
const patch = (body: unknown): RequestInit => ({ method: 'PATCH', body: JSON.stringify(body) });
const del: RequestInit = { method: 'DELETE' };

// ─── Auth ────────────────────────────────────────────────────────────────────

export const auth = {
  me: () => call<User>('/auth/me', {}, true),
  updateMe: (body: Partial<User>) => call<User>('/auth/me', patch(body), true),
  completeProfile: (body: { role: string; first_name?: string; last_name?: string }) =>
    call<User>('/auth/complete-profile', post(body), true),
};

export const users = {
  get: (id: string) => call<User>(`/users/${id}`, {}, true),
  setVisibility: (body: { profile_public: boolean }) => call<User>('/users/me/visibility', patch(body), true),
  deleteMe: () => request<void>('/users/me', del, true),
};

// ─── Programs ────────────────────────────────────────────────────────────────

export const programs = {
  list: (params?: { status?: string; page?: number; limit?: number }) =>
    list<Program>(`/programs${qs({ ...params, status: enumParam(params?.status) })}`),
  get: (slug: string) => call<Program>(`/programs/${slug}`),
  mine: () => call<Enrollment[]>('/programs/my', {}, true),
  curriculum: (programId: string) => call<CurriculumItem[]>(`/programs/${programId}/curriculum`),
  cohorts: (programId: string) => call<Cohort[]>(`/programs/${programId}/cohorts`),
};

// ─── Startups ────────────────────────────────────────────────────────────────

export const startups = {
  list: (params?: { industry?: string; stage?: string; location?: string; q?: string; page?: number; limit?: number }) =>
    list<Startup>(`/startups${qs(params)}`),
  get: (slug: string) => call<Startup>(`/startups/${slug}`),
  mine: () => call<Startup[]>('/startups/me', {}, true),
  create: (body: Partial<Startup>) => call<Startup>('/startups', post(body), true),
  update: (id: string, body: Partial<Startup>) => call<Startup>(`/startups/${id}`, patch(body), true),
  setVisibility: (id: string, body: { is_public?: boolean; investor_visible?: boolean }) =>
    call<Startup>(`/startups/${id}/visibility`, patch(body), true),
  members: (id: string) => call<StartupMember[]>(`/startups/${id}/members`, {}, true),
  addMember: (id: string, body: { email: string; role?: string; is_founder?: boolean }) =>
    call<StartupMember>(`/startups/${id}/members`, post(body), true),
  removeMember: (id: string, userId: string) => request<void>(`/startups/${id}/members/${userId}`, del, true),
  metrics: (id: string) => call<StartupMetric[]>(`/startups/${id}/metrics`, {}, true),
  addMetric: (id: string, body: { name: string; value: number; recorded_at?: string }) =>
    call<StartupMetric>(`/startups/${id}/metrics`, post(body), true),
};

// ─── Events ──────────────────────────────────────────────────────────────────

export const events = {
  list: (params?: { event_type?: string; when?: 'upcoming' | 'past'; page?: number; limit?: number }) =>
    list<AppEvent>(`/events${qs({ ...params, event_type: enumParam(params?.event_type) })}`),
  get: (slug: string) => call<AppEvent>(`/events/${slug}`),
  register: (eventId: string) => call<unknown>(`/events/${eventId}/register`, post(), true),
  cancel: (eventId: string) => request<void>(`/events/${eventId}/register`, del, true),
};

// ─── Resources ───────────────────────────────────────────────────────────────

export const resources = {
  list: (params?: { category?: string; q?: string; page?: number; limit?: number }) =>
    list<Resource>(`/resources${qs({ ...params, category: enumParam(params?.category) })}`),
  get: (slug: string) => call<Resource>(`/resources/${slug}`),
};

// ─── Milestones ──────────────────────────────────────────────────────────────

export const milestones = {
  list: (startupId: string) => call<Milestone[]>(`/startups/${startupId}/milestones`, {}, true),
  mine: (params?: { status?: string; stage?: string }) =>
    call<Milestone[]>(`/milestones/my${qs({ status: enumParam(params?.status), stage: enumParam(params?.stage) })}`, {}, true),
  progress: () => call<MilestoneProgress>('/milestones/progress', {}, true),
  create: (startupId: string, body: Partial<Milestone>) =>
    call<Milestone>(`/startups/${startupId}/milestones`, post(body), true),
  update: (milestoneId: string, body: Partial<Milestone>) => call<Milestone>(`/milestones/${milestoneId}`, patch(body), true),
  complete: (milestoneId: string) => call<Milestone>(`/milestones/${milestoneId}/complete`, post(), true),
  remove: (milestoneId: string) => request<void>(`/milestones/${milestoneId}`, del, true),
};

// ─── Cohorts ─────────────────────────────────────────────────────────────────

export const cohorts = {
  mine: () => call<{ cohorts: Cohort[]; progress: MilestoneProgress }>('/cohorts/my', {}, true),
  get: (id: string) => call<Cohort>(`/cohorts/${id}`, {}, true),
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const notifications = {
  list: (params?: { unread_only?: boolean; page?: number; limit?: number }) =>
    list<Notification>(`/notifications${qs({ ...params, unread_only: params?.unread_only || undefined })}`, true),
  unreadCount: () => call<{ count: number }>('/notifications/unread-count', {}, true).then((d) => d.count),
  readOne: (id: string) => call<Notification>(`/notifications/${id}/read`, post(), true),
  readAll: () => call<unknown>('/notifications/read-all', post(), true),
  preferences: () => call<NotificationPreferences>('/notification-preferences', {}, true),
  updatePreferences: (body: Partial<NotificationPreferences>) =>
    call<NotificationPreferences>('/notification-preferences', patch(body), true),
};

// ─── Messages ────────────────────────────────────────────────────────────────

export const messages = {
  conversations: () => call<Conversation[]>('/conversations', {}, true),
  create: (memberIds: string[]) => call<Conversation>('/conversations', post({ member_ids: memberIds }), true),
  thread: (conversationId: string, params?: { page?: number; limit?: number }) =>
    list<Message>(`/conversations/${conversationId}/messages${qs(params)}`, true),
  send: (conversationId: string, body: string) =>
    call<Message>(`/conversations/${conversationId}/messages`, post({ body }), true),
  markRead: (conversationId: string) => call<unknown>(`/conversations/${conversationId}/read`, post(), true),
};

// ─── Partners ────────────────────────────────────────────────────────────────

export const partners = {
  list: (params?: { partner_type?: string; page?: number; limit?: number }) =>
    list<Partner>(`/partners${qs({ ...params, partner_type: enumParam(params?.partner_type) })}`).then((r) => r.items),
  get: (slug: string) => call<Partner>(`/partners/${slug}`),
  apply: (body: PartnerApplyPayload) => call<{ message: string }>('/partners/apply', post(body)),
};

// ─── Applications ────────────────────────────────────────────────────────────

export const applications = {
  /** Creates the application (as a draft) and immediately submits it. */
  submit: async (body: ApplicationPayload) => {
    const draft = await call<Application>(
      '/applications',
      post({
        application_type: enumParam(body.application_type),
        program_id: body.program_id,
        answers: body.answers ?? {},
      }),
      true,
    );
    return call<Application>(`/applications/${draft.id}/submit`, post(), true);
  },
  mine: () => call<Application[]>('/applications/me', {}, true),
  get: (id: string) => call<Application>(`/applications/${id}`, {}, true),
  withdraw: (id: string) => call<Application>(`/applications/${id}/withdraw`, post(), true),
};

// ─── Mentors & mentorship ────────────────────────────────────────────────────

export const mentors = {
  list: (params?: { expertise?: string; page?: number; limit?: number }) => list<Mentor>(`/mentors${qs(params)}`, true),
  get: (id: string) => call<Mentor>(`/mentors/${id}`, {}, true),
};

export const mentorship = {
  request: (body: { mentor_id: string; startup_id?: string; message?: string }) =>
    call<MentorshipRequest>('/mentorship/requests', post(body), true),
  myRequests: () => call<MentorshipRequest[]>('/mentorship/requests/me', {}, true),
  updateRequest: (id: string, status: 'ACCEPTED' | 'DECLINED' | 'CANCELLED') =>
    call<MentorshipRequest>(`/mentorship/requests/${id}`, patch({ status }), true),
  sessions: (status?: string) => call<MentorshipSession[]>(`/mentorship/sessions${qs({ status })}`, {}, true),
  cancelSession: (id: string) => call<MentorshipSession>(`/mentorship/sessions/${id}/cancel`, post(), true),
  profile: () => call<Mentor>('/mentorship/profile', {}, true),
  updateProfile: (body: Partial<Mentor>) => call<Mentor>('/mentorship/profile', patch(body), true),
};

// ─── Investors ───────────────────────────────────────────────────────────────

export const investors = {
  apply: (body: Partial<Investor>) => call<Investor>('/investors/apply', post(body), true),
  me: () => call<Investor>('/investors/me', {}, true),
  updateMe: (body: Partial<Investor>) => call<Investor>('/investors/me', patch(body), true),
  dashboard: () => call<InvestorDashboard>('/investors/dashboard', {}, true),
  startups: (params?: { q?: string; industry?: string; stage?: string; location?: string; sort?: 'newest' | 'name'; page?: number; limit?: number }) =>
    list<Startup>(`/investors/startups${qs(params)}`, true),
  startup: (id: string) => call<Startup>(`/investors/startups/${id}`, {}, true),
  save: (id: string) => call<{ saved: boolean }>(`/investors/startups/${id}/save`, post(), true),
  unsave: (id: string) => request<void>(`/investors/startups/${id}/save`, del, true),
  saved: () => call<(Startup & { saved_at: string })[]>('/investors/saved-startups', {}, true),
  dealFlow: () => call<DealFlowItem[]>('/investors/deal-flow', {}, true),
  updateDeal: (id: string, body: { status?: string; notes?: string }) =>
    call<DealFlowItem>(`/investors/deal-flow/${id}`, patch({ ...body, status: enumParam(body.status) }), true),
  requestIntro: (body: { startup_id: string; message: string; reason?: string }) =>
    call<IntroductionRequest>('/investors/introductions', post(body), true),
  introductions: () => call<IntroductionRequest[]>('/investors/introductions', {}, true),
};

/** Founder side of investor introductions. */
export const introductions = {
  incoming: () => call<IntroductionRequest[]>('/introductions/incoming', {}, true),
  accept: (id: string) => call<IntroductionRequest>(`/introductions/${id}/accept`, post(), true),
  decline: (id: string) => call<IntroductionRequest>(`/introductions/${id}/decline`, post(), true),
  get: (id: string) => call<IntroductionRequest>(`/introductions/${id}`, {}, true),
};

// ─── Files ───────────────────────────────────────────────────────────────────

export type UploadBucket =
  | 'avatars' | 'startup-logos' | 'event-images' | 'resource-images'
  | 'startup-documents' | 'application-documents' | 'investor-documents';

export interface UploadedFile {
  id: string;
  bucket: UploadBucket;
  path: string;
  filename: string;
  content_type: string;
  status: string;
  /** Only present for public buckets. */
  url?: string;
}

export const files = {
  /** Signed-upload flow: ask the API for a slot, upload straight to Supabase Storage, then confirm. */
  upload: async (bucket: UploadBucket, file: File, startupId?: string): Promise<UploadedFile> => {
    const slot = await call<{ file_id: string; path: string; token: string }>(
      '/files/upload-url',
      post({ bucket, filename: file.name, content_type: file.type, startup_id: startupId }),
      true,
    );
    const { supabase } = await import('@/lib/supabase');
    const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(slot.path, slot.token, file);
    if (error) throw new ApiError(error.message, 0, 'UPLOAD_FAILED');
    return call<UploadedFile>('/files/complete', post({ file_id: slot.file_id }), true);
  },
  downloadUrl: (id: string) => call<{ url: string; expires_in: number | null }>(`/files/${id}/download-url`, {}, true),
  remove: (id: string) => request<void>(`/files/${id}`, del, true),
};

// ─── Search ──────────────────────────────────────────────────────────────────

export const search = (q: string, type?: 'startups' | 'programs' | 'events' | 'resources' | 'people') =>
  call<SearchResults>(`/search${qs({ q, type })}`);

// ─── Admin ───────────────────────────────────────────────────────────────────

type AdminListParams = { page?: number; limit?: number } & Query;

export const admin = {
  dashboard: () => call<AdminDashboard>('/admin/dashboard', {}, true),
  analytics: (months = 6) => call<AdminAnalytics>(`/admin/analytics${qs({ months })}`, {}, true),
  auditLogs: (params?: AdminListParams) => list<AuditLog>(`/admin/audit-logs${qs(params)}`, true),

  users: (params?: { q?: string; role?: string; status?: string; page?: number; limit?: number }) =>
    list<User>(`/admin/users${qs(params)}`, true),
  updateUser: (id: string, body: { role?: string; status?: string }) => call<User>(`/admin/users/${id}`, patch(body), true),

  applications: (params?: AdminListParams) => list<Application>(`/admin/applications${qs(params)}`, true),
  decideApplication: (id: string, decision: 'accept' | 'reject' | 'waitlist' | 'request-info', note?: string) =>
    call<Application>(`/admin/applications/${id}/${decision}`, post({ note }), true),

  programs: () => list<Program>('/programs?limit=100'),
  createProgram: (body: Partial<Program>) => call<Program>('/admin/programs', post(body), true),
  updateProgram: (id: string, body: Partial<Program>) => call<Program>(`/admin/programs/${id}`, patch(body), true),
  deleteProgram: (id: string) => request<void>(`/admin/programs/${id}`, del, true),

  cohorts: () => call<Cohort[]>('/admin/cohorts', {}, true),
  createCohort: (programId: string, body: Partial<Cohort>) =>
    call<Cohort>(`/admin/programs/${programId}/cohorts`, post(body), true),

  startups: (params?: AdminListParams) => list<Startup>(`/admin/startups${qs(params)}`, true),

  events: (params?: AdminListParams) => list<AppEvent>(`/admin/events${qs(params)}`, true),
  createEvent: (body: Partial<AppEvent>) => call<AppEvent>('/admin/events', post(body), true),
  updateEvent: (id: string, body: Partial<AppEvent>) => call<AppEvent>(`/admin/events/${id}`, patch(body), true),
  archiveEvent: (id: string) => request<void>(`/admin/events/${id}`, del, true),

  createResource: (body: Partial<Resource>) => call<Resource>('/admin/resources', post(body), true),
  updateResource: (id: string, body: Partial<Resource>) => call<Resource>(`/admin/resources/${id}`, patch(body), true),
  archiveResource: (id: string) => request<void>(`/admin/resources/${id}`, del, true),

  partners: (params?: AdminListParams) => list<Partner>(`/admin/partners${qs(params)}`, true),
  approvePartner: (id: string) => call<Partner>(`/admin/partners/${id}/approve`, post(), true),
  rejectPartner: (id: string) => call<Partner>(`/admin/partners/${id}/reject`, post(), true),

  mentors: (params?: AdminListParams) => list<Mentor>(`/admin/mentors${qs(params)}`, true),
  verifyMentor: (id: string) => call<Mentor>(`/admin/mentors/${id}/verify`, post(), true),

  investors: (params?: AdminListParams) => list<Investor>(`/admin/investors${qs(params)}`, true),
  setInvestorStatus: (id: string, action: 'verify' | 'reject' | 'suspend') =>
    call<Investor>(`/admin/investors/${id}/${action}`, post(), true),

  introductions: (params?: AdminListParams) => list<IntroductionRequest>(`/admin/introductions${qs(params)}`, true),
  reviewIntroduction: (id: string, action: 'approve' | 'reject') =>
    call<IntroductionRequest>(`/admin/introductions/${id}/${action}`, post(), true),

  broadcast: (body: { title: string; message: string; role?: string }) =>
    call<unknown>('/admin/notifications', post(body), true),
};

// ─── Shared types (mirror backend tables / schemas) ──────────────────────────

type ProfileRef = { id?: string; first_name?: string | null; last_name?: string | null; avatar_url?: string | null; email?: string };

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  country?: string;
  city?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  role: string;
  status: string;
  permissions: string[];
  created_at?: string;
  profile_public?: boolean;
  /** false until the user has finished /onboarding (POST /auth/complete-profile) */
  onboarding_completed?: boolean;
}

export interface Program {
  id: string;
  slug: string;
  name: string;
  description?: string;
  long_description?: string;
  type: string;
  status: string;
  application_open?: boolean;
  start_date?: string;
  end_date?: string;
  application_deadline?: string;
  capacity?: number;
  enrolled?: number;
  cohort?: string;
  image_url?: string;
}

export interface Startup {
  id: string;
  slug: string;
  name: string;
  logo_url?: string;
  description?: string;
  long_description?: string;
  industry?: string;
  stage?: string;
  location?: string;
  website?: string;
  founded_at?: string;
  is_public?: boolean;
  investor_visible?: boolean;
  program_id?: string;
  cohort_id?: string;
  created_at?: string;
  member_role?: string;
  is_founder?: boolean;
  founders?: { role: string; profiles: ProfileRef | null }[];
  metrics?: StartupMetric[];
}

export interface StartupMember {
  user_id: string;
  role: string;
  is_founder: boolean;
  profiles?: ProfileRef | null;
}

export interface StartupMetric {
  id?: string;
  name: string;
  value: number;
  recorded_at?: string;
}

export interface AppEvent {
  id: string;
  slug: string;
  title: string;
  description?: string;
  event_type: string;
  status: string;
  start_time: string;
  end_time?: string;
  location?: string;
  capacity?: number;
  cover_image?: string;
  registrations_count?: number;
  is_full?: boolean;
  registered?: boolean;
}

export interface Resource {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content?: string;
  type?: string;
  cover_image?: string;
  category: string;
  status?: string;
  published_at?: string;
  author_id?: string;
  reading_time?: number;
  profiles?: ProfileRef | null;
}

export interface Milestone {
  id: string;
  startup_id?: string;
  title: string;
  description?: string;
  notes?: string;
  stage: string;
  status: string;
  due_date?: string;
  completed_at?: string;
}

export interface MilestoneProgress {
  total?: number;
  completed?: number;
  percent?: number;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read_at?: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  event_reminders: boolean;
  message_notifications: boolean;
}

export interface Conversation {
  id: string;
  created_at?: string;
  updated_at?: string;
  members?: { user_id: string; profiles: ProfileRef | null }[];
  last_message?: { sender_id: string; body: string; created_at: string; read_at?: string | null } | null;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  attachment_url?: string | null;
  created_at: string;
  read_at?: string | null;
}

export interface Partner {
  id: string;
  slug?: string;
  organization: string;
  logo_url?: string;
  partner_type: string;
  description?: string;
  website?: string;
  status?: string;
  contact_email?: string;
  created_at?: string;
}

export interface PartnerApplyPayload {
  organization: string;
  partner_type: string;
  contact_email: string;
  description?: string;
  website?: string;
  logo_url?: string;
}

export interface Mentor {
  id: string;
  user_id?: string;
  expertise?: string[];
  experience?: string;
  availability?: string;
  is_verified?: boolean;
  created_at?: string;
  profiles?: ProfileRef | null;
}

export interface MentorshipRequest {
  id: string;
  mentor_id: string;
  founder_id?: string;
  startup_id?: string;
  message?: string;
  status: string;
  created_at: string;
  mentors?: Mentor;
}

export interface MentorshipSession {
  id: string;
  mentor_id: string;
  founder_id: string;
  scheduled_at: string;
  duration: number;
  status: string;
  notes?: string;
}

export interface ApplicationPayload {
  application_type: string;
  program_id?: string;
  answers?: Record<string, string>;
}

export interface Application {
  id: string;
  user_id?: string;
  program_id?: string;
  application_type: string;
  status: string;
  answers?: Record<string, string>;
  review_notes?: string;
  submitted_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface Enrollment {
  id: string;
  programs?: Program;
  cohorts?: Cohort;
  status?: string;
}

export interface Cohort {
  id: string;
  name: string;
  number: number;
  program_id: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface CurriculumItem {
  id: string;
  week: number;
  title: string;
  description?: string;
  position?: number;
}

export interface Investor {
  id: string;
  user_id?: string;
  organization: string;
  investor_type: string;
  website?: string;
  linkedin?: string;
  country?: string;
  investment_stage?: string[];
  investment_range_min?: number;
  investment_range_max?: number;
  industries?: string[];
  geographies?: string[];
  portfolio?: string;
  investment_thesis?: string;
  why_pointzero?: string;
  verification_status?: string;
  created_at?: string;
  profiles?: ProfileRef | null;
}

export interface IntroductionRequest {
  id: string;
  investor_id: string;
  startup_id: string;
  message: string;
  reason?: string;
  status: string;
  created_at: string;
  startups?: { name: string; slug: string; logo_url?: string } | null;
  investors?: { organization: string; investor_type: string } | null;
}

export interface DealFlowItem {
  id: string;
  startup_id: string;
  status: string;
  notes?: string;
  updated_at?: string;
  startups?: { id: string; name: string; slug: string; logo_url?: string; industry?: string; stage?: string } | null;
}

export interface InvestorDashboard {
  recommended_startups: Startup[];
  new_startups: Startup[];
  saved_count: number;
  introduction_requests: IntroductionRequest[];
  deal_flow_counts: Record<string, number>;
  upcoming_events: Pick<AppEvent, 'id' | 'title' | 'slug' | 'start_time' | 'location'>[];
}

export interface AdminDashboard {
  total_users: number;
  startups: number;
  active_founders: number;
  investors: number;
  pending_investors: number;
  applications: number;
  pending_applications: number;
  programs: number;
}

export interface AdminAnalytics {
  applications: { month: string; count: number }[];
  user_growth: { month: string; count: number }[];
  startup_growth: { month: string; count: number }[];
  investor_activity: { month: string; count: number }[];
  event_registrations: { month: string; count: number }[];
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface SearchResults {
  startups?: Startup[];
  programs?: Program[];
  events?: AppEvent[];
  resources?: Resource[];
  people?: ProfileRef[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
