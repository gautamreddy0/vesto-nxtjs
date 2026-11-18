'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, BookOpen, BrainCircuit, BriefcaseBusiness, ChevronDown, Menu, X } from 'lucide-react';

import { BrandLogo } from '@/components/brand-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/hooks/use-user';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const featureLinks = [
  { href: '/learn', label: 'Learn', description: 'Build practical investing knowledge.', icon: BookOpen },
  { href: '/markets', label: 'Market Analysis', description: 'Research companies and financials.', icon: BarChart3 },
  { href: '/portfolio', label: 'Portfolio Simulator', description: 'Practice with virtual capital.', icon: BriefcaseBusiness },
  { href: '/fund-manager', label: 'AI Fund Manager', description: 'Get structured feedback on a thesis.', icon: BrainCircuit },
];

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '/markets', label: 'Markets' },
  { href: '#why', label: 'About' },
];

function getPrimaryDestination(isAuthenticated: boolean) {
  return isAuthenticated || !isSupabaseConfigured() ? '/dashboard' : '/signup';
}

export function LandingNavbar() {
  const { isAuthenticated } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 0);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileOpen]);

  const primaryHref = getPrimaryDestination(isAuthenticated);
  const primaryLabel = isAuthenticated ? 'Open Dashboard' : 'Get Started Free';

  return (
    <header className={cn('sticky top-0 z-40 h-[72px] border-b border-border bg-card transition-shadow', isScrolled && 'shadow-md')}>
      <nav aria-label="Main navigation" className="mx-auto flex h-full max-w-[1240px] items-center justify-between gap-5 px-4 sm:px-6">
        <Link href="/" aria-label="Vesto home" className="hidden shrink-0 items-center outline-none focus-visible:ring-2 focus-visible:ring-ring min-[1101px]:flex">
          <BrandLogo variant="full" className="h-12 w-auto" />
        </Link>

        <div className="hidden h-full items-center gap-8 min-[1101px]:flex">
          <Link href="/" aria-current="page" className="flex h-full items-center border-b-2 border-primary px-0.5 text-[15px] font-semibold text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring">Home</Link>
          <details className="group relative flex h-full items-center">
            <summary className="flex h-full cursor-pointer list-none items-center gap-1 border-b-2 border-transparent px-0.5 text-[15px] font-medium text-foreground outline-none hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              Features <ChevronDown aria-hidden="true" className="h-3 w-3 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <div className="absolute left-1/2 top-full z-50 mt-1 w-[min(90vw,540px)] -translate-x-1/2 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg">
              <div className="grid gap-1 sm:grid-cols-2">
                {featureLinks.map(({ href, label, description, icon: Icon }) => (
                  <Link key={href} href={href} className="group/item flex gap-3 rounded-lg p-3 outline-none transition-colors hover:bg-accent-bg focus:bg-accent-bg focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-bg text-accent-text"><Icon aria-hidden="true" className="h-5 w-5" /></span>
                    <span><span className="block text-sm font-semibold text-foreground group-hover/item:text-primary">{label}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{description}</span></span>
                  </Link>
                ))}
              </div>
            </div>
          </details>
          {navLinks.slice(1).map((item) => (
            <Link key={item.href} href={item.href} className="flex h-full items-center border-b-2 border-transparent px-0.5 text-[15px] font-medium text-foreground outline-none hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">{item.label}</Link>
          ))}
        </div>

        <div className="hidden shrink-0 items-center gap-2 min-[1101px]:flex">
          <ThemeToggle />
          <Link href={primaryHref}>
            <Button className="gap-2 rounded-lg bg-brand-hero px-[22px] py-3 text-[15px] font-semibold text-white shadow-md hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none">
              {primaryLabel}<ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="flex w-full items-center justify-between gap-2 min-[1101px]:hidden">
          <Link href="/" aria-label="Vesto home" className="flex items-center outline-none focus-visible:ring-2 focus-visible:ring-ring"><BrandLogo variant="full" className="h-10 w-auto min-[1101px]:h-12" /></Link>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Link href={primaryHref} className="min-[1101px]:hidden">
              <Button className="gap-1 rounded-lg bg-brand-hero px-2.5 text-xs font-semibold text-white focus-visible:ring-2 focus-visible:ring-ring sm:gap-2 sm:px-4 sm:text-sm">
                {primaryLabel}<ArrowRight aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </Link>
            <button type="button" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen((open) => !open)} className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground outline-none hover:bg-muted-bg focus-visible:ring-2 focus-visible:ring-ring">
              {mobileOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div id="mobile-navigation" className="absolute inset-x-0 top-full max-h-[calc(100vh-72px)] overflow-y-auto border-b border-border bg-card p-4 shadow-lg min-[1101px]:hidden">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-1">
            {navLinks.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground outline-none hover:bg-muted-bg focus-visible:ring-2 focus-visible:ring-ring">{item.label}</Link>)}
            <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Features</p>
            {featureLinks.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground outline-none hover:bg-muted-bg focus-visible:ring-2 focus-visible:ring-ring"><Icon aria-hidden="true" className="h-4 w-4 text-accent-text" />{label}</Link>)}
            <Link href={primaryHref} onClick={() => setMobileOpen(false)} className="mt-2"><Button className="w-full gap-2 rounded-lg bg-brand-hero font-semibold text-white">{primaryLabel}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      )}
    </header>
  );
}
