'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  TrendingUp,
  User,
  UserPlus,
} from 'lucide-react';

import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCompanies } from '@/lib/hooks/use-companies';
import { usePortfolio } from '@/lib/hooks/use-portfolio';
import { useUser } from '@/lib/hooks/use-user';
import { createClient } from '@/lib/supabase/client';
import { MODULES } from '@/types';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/markets', label: 'Markets', icon: BarChart3 },
  { href: '/fund-manager', label: 'AI Fund Manager', icon: BrainCircuit },
  { href: '/portfolio', label: 'Portfolio', icon: BriefcaseBusiness },
];

function formatDataAsOf(companies: any[]) {
  const timestamps = companies
    .flatMap((entry) => {
      const timestampsToCheck = [
        entry?.company?.updated_at,
        entry?.fundamentals?.extracted_at,
        entry?.quote?.created_at,
      ];

      return timestampsToCheck.filter(Boolean) as string[];
    })
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (timestamps.length === 0) {
    return 'Snapshot data';
  }

  const newest = new Date(Math.max(...timestamps.map((date) => date.getTime())));
  return `Data as of ${new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(newest)}`;
}

function getInitials(label: string) {
  const parts = label.trim().split(/[\s._-]+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0]?.slice(0, 2) || 'A').toUpperCase();
}

function DashboardAccountMenu({ label, initials, onSignOut }: { label: string; initials: string; onSignOut: () => void }) {
  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 text-sm text-foreground shadow-sm outline-none hover:bg-muted-bg focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{initials}</span>
        <span className="max-w-[120px] truncate">{label}</span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
      </summary>
      <div className="absolute right-0 top-full z-30 mt-2 w-40 rounded-lg border border-border bg-card p-1 shadow-xl">
        <Link href="/account" className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted-bg">Account</Link>
        <button type="button" onClick={onSignOut} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-muted-bg">
          <LogOut aria-hidden="true" className="h-4 w-4" />Sign out
        </button>
      </div>
    </details>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname === '/dashboard';
  const { companies, loading: companiesLoading } = useCompanies();
  const { user, isAuthenticated } = useUser();
  const { availableCash, portfolio } = usePortfolio();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filteredCompanies = React.useMemo(() => {
    const nextQuery = query.trim().toLowerCase();
    if (!nextQuery) return companies.slice(0, 20);
    return companies.filter((company) => {
      const label = `${company.symbol} ${company.name}`.toLowerCase();
      return label.includes(nextQuery);
    });
  }, [companies, query]);

  const handleSignOut = async () => {
    try {
      const { error } = await createClient().auth.signOut();
      if (error) return;
      router.push('/login');
      router.refresh();
    } catch {
      // Keep the current page open if sign out cannot be completed.
    }
  };

  const accountLabel = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account';
  const accountInitials = getInitials(accountLabel);

  if (pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          'hidden border-r border-border bg-sidebar text-sidebar-foreground backdrop-blur md:flex md:flex-col md:transition-all md:duration-200',
          collapsed ? 'w-[88px]' : 'w-[240px]',
        )}
      >
        <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            {collapsed ? (
              <div className="flex h-8 w-8 items-center justify-center">
                <BrandLogo variant="mark" className="h-10 w-10" />
              </div>
            ) : (
                <BrandLogo variant="full" tone="dark" className="h-10 w-auto" />
            )}
          </Link>
          <button
            type="button"
            aria-label="Toggle sidebar"
            onClick={() => setCollapsed((current) => !current)}
            className="rounded-md p-1.5 text-sidebar-foreground/80 hover:bg-sidebar-active-bg hover:text-white"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex flex-1 flex-col px-3 py-4">
          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-active-bg text-white before:absolute before:left-0 before:top-2 before:h-6 before:w-1 before:rounded-r-full before:bg-sidebar-active'
                      : 'text-sidebar-foreground/80 hover:bg-white/5 hover:text-white',
                    collapsed && 'justify-center px-2',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-sidebar-border pt-3">
            <Link
              href="/account"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-white/5 hover:text-white',
                collapsed && 'justify-center px-2',
                pathname === '/account' && 'bg-sidebar-active-bg text-white',
              )}
            >
              <User className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Account</span>}
            </Link>
            {!collapsed && (isDashboard ? (
              <div className="relative mt-3 overflow-hidden rounded-xl border border-sidebar-border bg-white/5 p-3">
                <Image src="/brand/steps/step-learn.webp" alt="" width={112} height={88} className="mb-1 ml-auto h-16 w-20 object-contain" />
                <p className="font-display text-sm font-bold text-white">Grow Your Investment Skills</p>
                <p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/75">Learn, practice and invest with confidence.</p>
                <Link href="/learn" className="mt-3 block">
                  <Button size="sm" className="w-full gap-1 bg-brand-gradient px-2 text-[11px] font-semibold text-white hover:opacity-90">
                    Start Learning <TrendingUp className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            ) : !isDashboard && isAuthenticated && portfolio.length > 0 ? (
              <div className="mt-3 rounded-xl border border-sidebar-border bg-white/5 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-sidebar-muted">Cash available</p>
                <p className="mt-1 font-display text-lg font-bold text-white num">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(availableCash)}
                </p>
              </div>
            ) : (
              <div className="relative mt-3 overflow-hidden rounded-xl border border-sidebar-border bg-white/5 p-3">
                <svg aria-hidden="true" viewBox="0 0 120 40" className="mb-2 h-9 w-full text-sidebar-active">
                  <path d="M2 32 22 27 38 29 55 18 70 21 86 10 101 13 118 3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-xs font-semibold leading-relaxed text-white">Practice with <span className="text-sidebar-active">$10,000</span> Virtual Capital</p>
                <Link href="/fund-manager" className="mt-3 block">
                  <Button size="sm" className="w-full gap-1 bg-brand-gradient px-2 text-[11px] font-semibold text-white hover:opacity-90">
                    Start Simulation <TrendingUp className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
          <div className="flex h-[56px] items-center justify-between gap-3 px-4 md:px-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 md:hidden">
                <div className="flex h-8 w-8 items-center justify-center">
                  <BrandLogo variant="mark" className="h-8 w-8" />
                </div>
                <div className="text-sm font-semibold text-foreground">
                  <span className="font-display font-extrabold">Ves<span className="text-brand-green">to</span></span>
                </div>
              </div>
              <div className="hidden text-sm font-medium text-muted-foreground md:block">
                {navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label || 'Overview'}
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-muted-foreground shadow-sm hover:bg-muted-bg"
              >
                <Search className="h-4 w-4" />
                <span>{isDashboard ? 'Search companies or learning topics…' : 'Search companies'}</span>
                <span className="rounded border border-border bg-muted-bg px-1 text-[10px] font-medium text-foreground">⌘K</span>
              </button>

              {!isDashboard && !companiesLoading && <span className="text-xs text-muted-foreground">{formatDataAsOf(companies)}</span>}

              {!isDashboard && isAuthenticated && (
                <div className="rounded-full border border-border bg-muted-bg px-3 py-1 text-xs font-medium text-foreground">
                  Cash {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(availableCash)}
                </div>
              )}

              {isDashboard && isAuthenticated ? (
                <DashboardAccountMenu label={accountLabel} initials={accountInitials} onSignOut={() => void handleSignOut()} />
              ) : isAuthenticated ? (
                <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 text-sm text-foreground shadow-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="max-w-[140px] truncate">{user?.email || 'Account'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="gap-2 border-border bg-background text-foreground hover:bg-muted-bg">
                      <LogIn className="h-3.5 w-3.5" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
                      <UserPlus className="h-3.5 w-3.5" />
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="rounded-md border border-border p-2 text-foreground hover:bg-muted-bg"
              >
                <Search className="h-4 w-4" />
              </button>
              {isDashboard && isAuthenticated && <DashboardAccountMenu label={accountLabel} initials={accountInitials} onSignOut={() => void handleSignOut()} />}
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur md:hidden">
          <div className="grid grid-cols-5 gap-1 p-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] font-medium',
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <Command.Dialog open={searchOpen} onOpenChange={setSearchOpen} label="Search companies and learning topics">
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto mt-20 w-[min(92vw,640px)] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search companies or learning topics…"
                className="w-full border-0 bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            <Command.List className="max-h-[420px] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-5 text-sm text-muted-foreground">No matching companies or learning modules.</Command.Empty>
              <Command.Group heading="Companies">
              {filteredCompanies.map((company) => (
                <Command.Item
                  key={company.symbol}
                  value={`${company.symbol} ${company.name}`}
                  onSelect={() => {
                    setQuery('');
                    setSearchOpen(false);
                    router.push(`/markets/${company.symbol}`);
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-foreground aria-selected:bg-muted-bg"
                >
                  <span className="font-medium">{company.symbol}</span>
                  <span className="ml-2 truncate text-muted-foreground">{company.name}</span>
                </Command.Item>
              ))}
              </Command.Group>
              <Command.Group heading="Learning">
                {MODULES.map((module) => (
                  <Command.Item
                    key={module.id}
                    value={`${module.title} learning module`}
                    onSelect={() => {
                      setQuery('');
                      setSearchOpen(false);
                      router.push(`/learn/${module.id}`);
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-foreground aria-selected:bg-muted-bg"
                  >
                    <span className="truncate">{module.title}</span>
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">Module</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </div>
        </div>
      </Command.Dialog>
    </div>
  );
}
