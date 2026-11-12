export type UserRole = 'founder' | 'builder' | 'student' | 'mentor' | 'investor' | 'partner' | 'admin';

export type ProgramType = 'accelerator' | 'academy' | 'residency' | 'labs' | 'demo_day';
export type ProgramStatus = 'active' | 'upcoming' | 'closed';

export type StartupStage = 'idea' | 'pre_seed' | 'seed' | 'series_a' | 'series_b' | 'growth';
export type StartupVisibility = 'public' | 'private' | 'investor_only';

export type EventType = 'workshop' | 'hackathon' | 'demo_day' | 'meetup' | 'investor_session' | 'community';
export type EventStatus = 'upcoming' | 'past' | 'live';

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'interview'
  | 'accepted'
  | 'rejected'
  | 'waitlisted'
  | 'withdrawn';

export type ApplicationType = 'founder' | 'builder' | 'student' | 'mentor' | 'investor' | 'partner';

export type MilestoneStage = 'validate' | 'build' | 'launch' | 'scale';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export type InvestorType = 'angel' | 'vc' | 'family_office' | 'corporate_vc' | 'accelerator' | 'fund' | 'syndicate' | 'institution';
export type InvestorVerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export type DealFlowStage =
  | 'discovered'
  | 'saved'
  | 'interested'
  | 'introduction'
  | 'meeting'
  | 'due_diligence'
  | 'investing'
  | 'passed';

export type ResourceCategory =
  | 'startup'
  | 'engineering'
  | 'product'
  | 'design'
  | 'fundraising'
  | 'ai'
  | 'blockchain'
  | 'founder_stories';

export type PartnerCategory =
  | 'technology'
  | 'capital'
  | 'education'
  | 'infrastructure'
  | 'media'
  | 'corporate'
  | 'government'
  | 'community';

export type NotificationType =
  | 'application'
  | 'program'
  | 'mentorship'
  | 'event'
  | 'investor'
  | 'system'
  | 'message';

export type CampusSpace =
  | 'the_zero'
  | 'build_house'
  | 'founder_house'
  | 'academy'
  | 'labs'
  | 'launch_center'
  | 'media_house'
  | 'investor_house'
  | 'commons';

export interface Program {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  type: ProgramType;
  status: ProgramStatus;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  capacity: number;
  enrolled: number;
  cohort: string;
  curriculum: { week: number; title: string; description: string }[];
  requirements: string[];
  benefits: string[];
  whoFor: string[];
  faq: { question: string; answer: string }[];
  mentors: string[];
  image: string;
}

export interface Startup {
  id: string;
  slug: string;
  name: string;
  logo: string;
  description: string;
  longDescription: string;
  industry: string;
  stage: StartupStage;
  location: string;
  program: string;
  cohort: string;
  founders: Founder[];
  website: string;
  problem: string;
  solution: string;
  product: string;
  traction: string;
  funding: string;
  team: number;
  press: { title: string; source: string; url: string }[];
  socials: { twitter: string; linkedin: string; instagram: string };
  visibility: StartupVisibility;
  fundingStage: string;
  fundingAmount: string;
}

export interface Founder {
  id: string;
  name: string;
  avatar: string;
  role: string;
  bio: string;
  startupId?: string;
}

export interface AppEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  type: EventType;
  status: EventStatus;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered: number;
  image: string;
  speakers: { name: string; role: string; avatar: string }[];
  organizer: string;
}

export interface Resource {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  author: string;
  authorAvatar: string;
  category: ResourceCategory;
  publishedDate: string;
  readingTime: number;
}

export interface Mentor {
  id: string;
  name: string;
  avatar: string;
  expertise: string[];
  experience: string;
  company: string;
  availability: 'available' | 'limited' | 'unavailable';
  bio: string;
}

export interface Investor {
  id: string;
  name: string;
  organization: string;
  avatar: string;
  type: InvestorType;
  investmentStages: string[];
  industries: string[];
  chequeSize: string;
  geographies: string[];
  portfolio: string[];
  thesis: string;
  verificationStatus: InvestorVerificationStatus;
  website: string;
  linkedin: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  category: PartnerCategory;
  description: string;
  website: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  description: string;
  image: string;
  facilities: string[];
  whoUsesIt: string[];
  relatedPrograms: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  stage: MilestoneStage;
  status: MilestoneStatus;
  dueDate: string;
  completedDate?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  online: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  bio: string;
  skills: string[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
}

export interface IntroductionRequest {
  id: string;
  startupName: string;
  startupLogo: string;
  investorName: string;
  investorOrg: string;
  message: string;
  reason: string;
  status: 'pending' | 'review' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  details: string;
}
