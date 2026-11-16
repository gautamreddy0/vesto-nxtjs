import Link from 'next/link';
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
} from 'lucide-react';

const features = [
  {
    href: '/learn',
    title: 'Learn',
    description: 'Build financial literacy and master key investing concepts.',
    icon: BookOpen,
    tint: 'bg-success-bg text-success',
    surface: 'bg-gradient-to-b from-success-bg to-card',
    arrow: 'bg-success-bg text-success',
  },
  {
    href: '/markets',
    title: 'Market Analysis',
    description: 'Explore stock listings, company profiles and financial metrics.',
    icon: BarChart3,
    tint: 'bg-primary/10 text-primary-text',
    surface: 'bg-gradient-to-b from-muted-bg to-card',
    arrow: 'bg-primary/10 text-primary-text',
  },
  {
    href: '/portfolio',
    title: 'Portfolio Simulator',
    description: <>Practice investing with a virtual portfolio and <strong className="font-semibold text-foreground">$10,000</strong> initial capital.</>,
    icon: BriefcaseBusiness,
    tint: 'bg-muted-bg text-sidebar',
    surface: 'bg-gradient-to-b from-muted-bg to-card',
    arrow: 'bg-muted-bg text-sidebar',
  },
  {
    href: '/fund-manager',
    title: 'AI Fund Manager',
    description: 'Submit an investment thesis and get an AI evaluation with clear, actionable feedback.',
    icon: BrainCircuit,
    tint: 'bg-accent-bg text-accent-text',
    surface: 'bg-gradient-to-b from-accent-bg to-card',
    arrow: 'bg-accent-bg text-accent-text',
  },
];

export function FeatureCards() {
  return (
    <section id="features" aria-label="Platform features" className="relative z-20 -mt-9 scroll-mt-24 pb-10">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {features.map(({ href, title, description, icon: Icon, tint, surface, arrow }) => (
          <Link
            key={href}
            href={href}
            className={`group relative flex min-h-[148px] gap-3.5 rounded-xl border border-border p-[18px] pb-5 shadow-sm outline-none transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:min-h-[148px] ${surface}`}
          >
            <span className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[10px] ${tint}`}>
              <Icon aria-hidden="true" className="h-6 w-6" />
            </span>
            <span className="min-w-0 pr-5">
              <span className="font-display text-lg font-bold text-foreground">{title}</span>
              <span className="mt-1 block text-[13.5px] leading-[1.45] text-foreground/80">{description}</span>
            </span>
            <span
              aria-hidden="true"
              className={`absolute bottom-3.5 right-3.5 flex h-[26px] w-[26px] items-center justify-center rounded-full transition-colors group-hover:opacity-80 motion-reduce:transition-none ${arrow}`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
