import Link from 'next/link';
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
} from 'lucide-react';

import { BrandLogo } from '@/components/brand-logo';

const platformLinks = [
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/markets', label: 'Market Analysis', icon: BarChart3 },
  { href: '/fund-manager', label: 'AI Fund Manager', icon: BrainCircuit },
  { href: '/portfolio', label: 'Portfolio Simulator', icon: BriefcaseBusiness },
];

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate mt-16 overflow-hidden bg-sidebar text-sidebar-foreground sm:mt-20">
      <RisingChartDecoration />
      <div className="relative mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_0.8fr] md:gap-8">
          <div className="max-w-sm">
            <Link href="/" aria-label="Vesto home" className="inline-flex rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar">
              <BrandLogo variant="full" tone="dark" className="h-11 w-auto" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/80">
              An AI-powered investment learning platform to learn, research, simulate and make smarter investment decisions.
            </p>
          </div>

          <FooterColumn title="Platform">
            {platformLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="inline-flex items-center gap-2 text-sm text-sidebar-foreground/80 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring">
                <Icon aria-hidden="true" className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </FooterColumn>

          <FooterColumn title="Get started">
            <Link href="/signup" className="text-sm text-sidebar-foreground/80 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring">Sign up</Link>
            <Link href="/login" className="text-sm text-sidebar-foreground/80 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring">Log in</Link>
            <Link href="#how-it-works" className="text-sm text-sidebar-foreground/80 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring">How it works</Link>
          </FooterColumn>

          <FooterColumn title="Project">
            <a
              href="https://github.com/gtreddy20/Vesto"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-sidebar-foreground/80 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring"
            >
              GitHub <span className="sr-only">(opens in a new tab)</span>
            </a>
          </FooterColumn>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-sidebar-border pt-5 text-xs text-sidebar-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Vesto</p>
          <p>For educational purposes only. Virtual money — not investment advice.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">{title}</h2>
      <div className="mt-4 flex flex-col items-start gap-3">{children}</div>
    </div>
  );
}

function RisingChartDecoration() {
  return (
    <svg aria-hidden="true" viewBox="0 0 360 180" className="pointer-events-none absolute -bottom-2 right-0 h-40 w-72 opacity-[0.08] sm:h-48 sm:w-96">
      <g fill="var(--sidebar-foreground)">
        {Array.from({ length: 42 }, (_, index) => {
          const x = 20 + (index % 7) * 44;
          const y = 24 + Math.floor(index / 7) * 24;
          return <circle key={index} cx={x} cy={y} r="1.5" />;
        })}
      </g>
      <path d="M0 160 55 145 100 150 148 110 192 120 242 72 286 82 360 28" fill="none" stroke="var(--accent)" strokeWidth="3" strokeDasharray="3 7" />
    </svg>
  );
}
