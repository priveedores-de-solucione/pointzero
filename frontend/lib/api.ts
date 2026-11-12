/**
 * API client — talks to the FastAPI backend.
 * Set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:8000/api/v1 — the backend mounts all routes under /api/v1)
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

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw Object.assign(new Error(err?.detail?.message ?? err?.message ?? 'Request failed'), {
      status: res.status,
      code: err?.detail?.code,
    });
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  const json = await res.json();
  // Backend wraps in { data: ... } or { items: ..., total: ... }
  return json;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const auth = {
  me: () => request<{ data: User }>('/auth/me', {}, true).then((r) => r.data),
  updateMe: (body: Partial<User>) =>
    request<{ data: User }>('/auth/me', { method: 'PATCH', body: JSON.stringify(body) }, true).then((r) => r.data),
  completeProfile: (body: { role: string; first_name?: string; last_name?: string }) =>
    request<{ data: User }>('/auth/complete-profile', { method: 'POST', body: JSON.stringify(body) }, true).then((r) => r.data),
};

// ─── Programs ────────────────────────────────────────────────────────────────

export const programs = {
  list: (params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return request<PaginatedResponse<Program>>(`/programs?${qs}`);
  },
  get: (slug: string) => request<{ data: Program }>(`/programs/${slug}`).then((r) => r.data),
  mine: () => request<{ data: Enrollment[] }>('/programs/my', {}, true).then((r) => r.data),
  curriculum: (programId: string) =>
    request<{ data: CurriculumItem[] }>(`/programs/${programId}/curriculum`).then((r) => r.data),
  cohorts: (programId: string) =>
    request<{ data: Cohort[] }>(`/programs/${programId}/cohorts`).then((r) => r.data),
};

// ─── Startups ────────────────────────────────────────────────────────────────

export const startups = {
  list: (params?: { industry?: string; stage?: string; q?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.industry) qs.set('industry', params.industry);
    if (params?.stage) qs.set('stage', params.stage);
    if (params?.q) qs.set('q', params.q);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return request<PaginatedResponse<Startup>>(`/startups?${qs}`);
  },
  get: (slug: string) => request<{ data: Startup }>(`/startups/${slug}`).then((r) => r.data),
  mine: () => request<{ data: Startup[] }>('/startups/me', {}, true).then((r) => r.data),
  create: (body: Partial<Startup>) =>
    request<{ data: Startup }>('/startups', { method: 'POST', body: JSON.stringify(body) }, true).then((r) => r.data),
  update: (id: string, body: Partial<Startup>) =>
    request<{ data: Startup }>(`/startups/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, true).then((r) => r.data),
};

// ─── Events ──────────────────────────────────────────────────────────────────

export const events = {
  list: (params?: { event_type?: string; when?: 'upcoming' | 'past'; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.event_type) qs.set('event_type', params.event_type);
    if (params?.when) qs.set('when', params.when);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return request<PaginatedResponse<AppEvent>>(`/events?${qs}`);
  },
  get: (slug: string) => request<{ data: AppEvent }>(`/events/${slug}`).then((r) => r.data),
  register: (eventId: string) =>
    request<{ data: unknown }>(`/events/${eventId}/register`, { method: 'POST' }, true).then((r) => r.data),
};

// ─── Resources ───────────────────────────────────────────────────────────────

export const resources = {
  list: (params?: { category?: string; q?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.q) qs.set('q', params.q);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return request<PaginatedResponse<Resource>>(`/resources?${qs}`);
  },
  get: (slug: string) => request<{ data: Resource }>(`/resources/${slug}`).then((r) => r.data),
};

// ─── Milestones ──────────────────────────────────────────────────────────────

export const milestones = {
  list: (startupId: string) =>
    request<{ data: Milestone[] }>(`/startups/${startupId}/milestones`, {}, true).then((r) => r.data),
  update: (startupId: string, milestoneId: string, body: Partial<Milestone>) =>
    request<{ data: Milestone }>(
      `/startups/${startupId}/milestones/${milestoneId}`,
      { method: 'PATCH', body: JSON.stringify(body) },
      true,
    ).then((r) => r.data),
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const notifications = {
  list: (params?: { unread_only?: boolean; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.unread_only) qs.set('unread_only', 'true');
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return request<PaginatedResponse<Notification>>(`/notifications?${qs}`, {}, true);
  },
  unreadCount: () =>
    request<{ data: { count: number } }>('/notifications/unread-count', {}, true).then((r) => r.data.count),
  readOne: (id: string) =>
    request<{ data: Notification }>(`/notifications/${id}/read`, { method: 'POST' }, true).then((r) => r.data),
  readAll: () => request<{ data: unknown }>('/notifications/read-all', { method: 'POST' }, true),
};

// ─── Messages ────────────────────────────────────────────────────────────────

export const messages = {
  conversations: () =>
    request<{ data: Conversation[] }>('/messages/conversations', {}, true).then((r) => r.data),
  thread: (conversationId: string, params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return request<PaginatedResponse<Message>>(`/messages/conversations/${conversationId}?${qs}`, {}, true);
  },
  send: (conversationId: string, content: string) =>
    request<{ data: Message }>(
      `/messages/conversations/${conversationId}`,
      { method: 'POST', body: JSON.stringify({ content }) },
      true,
    ).then((r) => r.data),
};

// ─── Partners ────────────────────────────────────────────────────────────────

export const partners = {
  list: () => request<{ data: Partner[] }>('/partners').then((r) => r.data),
};

// ─── Applications ────────────────────────────────────────────────────────────

export const applications = {
  submit: (body: ApplicationPayload) =>
    request<{ data: Application }>('/applications', { method: 'POST', body: JSON.stringify(body) }, true).then(
      (r) => r.data,
    ),
  mine: () => request<{ data: Application[] }>('/applications/my', {}, true).then((r) => r.data),
};

// ─── Mentors ─────────────────────────────────────────────────────────────────

export const mentors = {
  list: (params?: { expertise?: string; availability?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.expertise) qs.set('expertise', params.expertise);
    if (params?.availability) qs.set('availability', params.availability);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return request<PaginatedResponse<Mentor>>(`/mentors?${qs}`);
  },
};

// ─── Shared types (mirrors backend schemas & frontend lib/types) ──────────────

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
  /** false until the user has finished /onboarding (POST /auth/complete-profile) */
  onboarding_completed?: boolean;
}

export interface Program {
  id: string;
  slug: string;
  name: string;
  description: string;
  long_description?: string;
  type: string;
  status: string;
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
  industry?: string;
  stage?: string;
  location?: string;
  website?: string;
  is_public?: boolean;
  founders?: { role: string; profiles: { id: string; first_name: string; last_name: string; avatar_url?: string } }[];
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
  registrations_count?: number;
  is_full?: boolean;
  registered?: boolean;
  image_url?: string;
}

export interface Resource {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  cover_url?: string;
  author?: string;
  category: string;
  published_at?: string;
  reading_time?: number;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  stage: string;
  status: string;
  due_date?: string;
  completed_at?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read_at?: string | null;
  created_at: string;
  action_url?: string;
}

export interface Conversation {
  id: string;
  name?: string;
  avatar?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  other_user?: { id: string; first_name: string; last_name: string; avatar_url?: string };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string | null;
}

export interface Partner {
  id: string;
  name: string;
  logo_url?: string;
  category: string;
  description?: string;
  website?: string;
}

export interface Mentor {
  id: string;
  name?: string;
  expertise?: string[];
  availability?: string;
  bio?: string;
  profiles?: { id: string; first_name: string; last_name: string; avatar_url?: string };
}

export interface ApplicationPayload {
  application_type: string;
  program_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  answers?: Record<string, string>;
}

export interface Application {
  id: string;
  application_type: string;
  status: string;
  created_at: string;
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
}

export interface CurriculumItem {
  id: string;
  week: number;
  title: string;
  description?: string;
  position?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
