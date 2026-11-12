'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, User, Building2, GraduationCap, Target,
  Users, Calendar, BookOpen, MessageSquare, Bell, Settings,
  Search, Menu, X, LogOut, TrendingUp, Heart, Handshake,
  PieChart, FileText, ShieldAlert, BarChart3, FolderKanban,
  UsersRound, Briefcase, Building, ScrollText,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth, dashboardPathForRole, dashboardTypeForRole, needsOnboarding, type DashboardType } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** draw a divider above this item (groups the sidebar) */
  sep?: boolean;
}

const memberNav: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'Profile', icon: User, sep: true },
  { href: '/dashboard/startup', label: 'Startup', icon: Building2 },
  { href: '/dashboard/programs', label: 'Programs', icon: GraduationCap },
  { href: '/dashboard/milestones', label: 'Milestones', icon: Target },
  { href: '/dashboard/mentorship', label: 'Mentorship', icon: Users },
  { href: '/dashboard/events', label: 'Events', icon: Calendar, sep: true },
  { href: '/dashboard/resources', label: 'Resources', icon: BookOpen },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, sep: true },
];

const investorNav: NavItem[] = [
  { href: '/investor/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/investor/startups', label: 'Discover Startups', icon: TrendingUp, sep: true },
  { href: '/investor/saved', label: 'Saved', icon: Heart },
  { href: '/investor/introductions', label: 'Introductions', icon: Handshake },
  { href: '/investor/deal-flow', label: 'Deal Flow', icon: PieChart },
  { href: '/investor/events', label: 'Events', icon: Calendar, sep: true },
  { href: '/investor/messages', label: 'Messages', icon: MessageSquare },
  { href: '/investor/profile', label: 'Profile', icon: User },
];

const adminNav: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/applications', label: 'Applications', icon: FileText, sep: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/startups', label: 'Startups', icon: Building2 },
  { href: '/admin/programs', label: 'Programs', icon: GraduationCap },
  { href: '/admin/cohorts', label: 'Cohorts', icon: UsersRound },
  { href: '/admin/mentors', label: 'Mentors', icon: Users },
  { href: '/admin/investors', label: 'Investors', icon: Briefcase },
  { href: '/admin/partners', label: 'Partners', icon: Building },
  { href: '/admin/events', label: 'Events', icon: Calendar, sep: true },
  { href: '/admin/resources', label: 'Resources', icon: BookOpen },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, sep: true },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
];

export function DashboardSidebar({ type }: { type: DashboardType }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = type === 'member' ? memberNav : type === 'investor' ? investorNav : adminNav;
  const basePath = type === 'member' ? '/dashboard' : type === 'investor' ? '/investor' : '/admin';
  const brand = type === 'admin' ? 'Admin' : type === 'investor' ? 'Investor' : 'Dashboard';

  const isActive = (href: string) => {
    if (href === basePath) return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center gap-2.5 border-b border-pz-border px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Point Zero" height={22} width={88} priority />
        </Link>
        <span className="ml-auto font-mono text-[11px] uppercase text-pz-text-dim">{brand}</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        <ul>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} className={cn(item.sep && 'mt-3 border-t border-pz-border pt-3')}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 border-l-2 px-5 py-2 text-sm transition-colors duration-150',
                    active
                      ? 'border-pz-signal font-medium text-pz-white'
                      : 'border-transparent text-pz-text-dim hover:text-pz-white',
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', active && 'text-pz-signal')} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-pz-border py-3">
        <Link
          href="/"
          className="flex items-center gap-3 border-l-2 border-transparent px-5 py-2 text-sm text-pz-text-dim transition-colors duration-150 hover:text-pz-white"
        >
          <LogOut className="h-4 w-4" />
          Back to Site
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-pz-border bg-pz-surface lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-pz-void/70" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-60 border-r border-pz-border bg-pz-surface">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Mobile menu button is rendered by the header */}
      <input type="hidden" data-mobile-open={mobileOpen} />
      <button
        className="fixed left-3 top-1.5 z-40 flex h-9 w-9 items-center justify-center rounded-sm border border-pz-border bg-pz-surface lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>
    </>
  );
}

export function DashboardHeader({
  title,
  subtitle,
  userName = 'Member',
  userRole = '',
  avatarUrl,
  onSignOut,
}: {
  title: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
  onSignOut?: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-pz-border bg-pz-void/80 px-4 pl-16 backdrop-blur-lg lg:px-6 lg:pl-6">
      <div className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="hidden font-mono text-xs text-pz-text-dim sm:inline">POINTZERO /</span>
        <h1 className="truncate font-display text-sm font-semibold tracking-[-0.01em] text-pz-white">{title}</h1>
        {subtitle && <p className="hidden truncate text-xs text-pz-text-dim md:block">{subtitle}</p>}
      </div>

      <Button variant="ghost" size="icon" className="hidden h-8 w-8 sm:flex">
        <Search className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative rounded-sm p-1.5 hover:bg-accent" aria-label="Notifications">
            <Bell className="h-4 w-4 text-pz-text-dim" />
            <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-pz-signal" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Application Accepted</span>
              <span className="text-xs text-muted-foreground">Your application to POINTZERO 90 was accepted.</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">New Session Scheduled</span>
              <span className="text-xs text-muted-foreground">Customer Interviews session on Jan 20.</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/notifications">View All</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-sm p-1 hover:bg-accent">
            <Avatar className="h-7 w-7">
              {avatarUrl && <AvatarImage src={avatarUrl} />}
              <AvatarFallback className="bg-muted text-xs">{userName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm text-pz-text sm:block">{userName}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{userName}</span>
              <span className="text-xs text-muted-foreground">{userRole}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => onSignOut?.()}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', STAFF: 'Staff', FOUNDER: 'Founder',
  BUILDER: 'Builder', STUDENT: 'Student', MENTOR: 'Mentor', INVESTOR: 'Investor', PARTNER: 'Partner',
};

export function DashboardShell({
  type,
  title,
  subtitle,
  children,
  userName,
  userRole,
}: {
  type: DashboardType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  userName?: string;
  userRole?: string;
}) {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  // Where (if anywhere) this visitor should be sent instead of seeing this page.
  const redirectTo: string | null = (() => {
    if (loading) return null;
    if (!user) return '/login';                                        // not signed in
    if (needsOnboarding(user)) return '/onboarding';                   // must pick a role first
    if (dashboardTypeForRole(user.role) !== type) return dashboardPathForRole(user.role); // wrong area
    return null;
  })();

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  // Render nothing sensitive until we know the visitor is allowed in.
  if (loading || !user || redirectTo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-xs space-y-3 px-6">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar type={type} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          userName={userName ?? fullName}
          userRole={userRole ?? ROLE_LABELS[user.role] ?? user.role}
          avatarUrl={user.avatar_url}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
