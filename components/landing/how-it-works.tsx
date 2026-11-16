import { Fragment } from 'react';
import { BookOpen, Building2, ChevronRight, Coins, Target } from 'lucide-react';

import { StatItem } from '@/components/landing/stat-item';
import { StepCard } from '@/components/landing/step-card';

const steps = [
  {
    number: 1,
    title: 'Learn',
    description: 'Build a strong foundation in valuation, financial statements and business analysis.',
    image: '/brand/steps/step-learn.webp',
    imageWidth: 629,
    imageHeight: 513,
    theme: 1 as const,
  },
  {
    number: 2,
    title: 'Analyze',
    description: 'Research companies, compare financials, and assess risks and opportunities.',
    image: '/brand/steps/step-analyze.webp',
    imageWidth: 699,
    imageHeight: 473,
    theme: 2 as const,
  },
  {
    number: 3,
    title: 'Pitch to the AI Fund Manager',
    description: 'Submit your investment thesis and get an AI evaluation with a clear score and insights.',
    image: '/brand/steps/step-ai.webp',
    imageWidth: 560,
    imageHeight: 519,
    theme: 3 as const,
    breakTitle: true,
  },
  {
    number: 4,
    title: 'Invest & Track',
    description: 'Use a $10,000 virtual portfolio to practice investing and track performance.',
    image: '/brand/steps/step-invest.webp',
    imageWidth: 638,
    imageHeight: 493,
    theme: 4 as const,
  },
];

const stats = [
  { icon: Building2, value: '20', label: <>Large-cap companies<br />with full financials</> },
  { icon: BookOpen, value: '5', label: <>Guided learning<br />modules</> },
  { icon: Coins, value: '$10,000', label: <>Virtual trading<br />capital</> },
  { icon: Target, value: '70/100', label: <>AI score required<br />to trade</> },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="hiw-section scroll-mt-[88px] px-6 py-16 sm:px-6 min-[1101px]:py-14 max-[639px]:px-4">
      <svg aria-hidden="true" viewBox="0 0 520 220" fill="none" className="hiw-decoration pointer-events-none absolute right-[-30px] top-[70px] hidden h-40 w-[380px] min-[641px]:block">
        <path d="M0 170 C90 120 150 200 250 150 S420 40 520 70" stroke="var(--hiw-wave-1)" strokeWidth="2" opacity=".7" />
        <path d="M0 195 C110 150 170 215 270 175 S430 80 520 105" stroke="var(--hiw-wave-2)" strokeWidth="1.5" opacity=".7" />
        <g fill="var(--hiw-candles)" opacity=".9">
          <rect x="330" y="120" width="5" height="26" /><rect x="350" y="110" width="5" height="30" /><rect x="370" y="98" width="5" height="34" />
          <rect x="390" y="104" width="5" height="22" /><rect x="410" y="82" width="5" height="36" /><rect x="430" y="70" width="5" height="34" />
          <rect x="450" y="58" width="5" height="40" /><rect x="470" y="44" width="5" height="42" /><rect x="490" y="30" width="5" height="46" />
        </g>
      </svg>

      <div className="relative mx-auto max-w-[1240px]">
        <header className="text-center">
          <span className="inline-block rounded-full bg-hiw-badge px-[22px] py-[9px] text-sm font-semibold tracking-[0.18em] text-hiw-navy shadow-[inset_0_0_0_1px_var(--hiw-badge-ring)]">
            HOW IT WORKS
          </span>
          <h2 className="mt-[18px] font-display text-[34px] font-extrabold leading-[1.1] tracking-[-0.02em] text-foreground min-[1101px]:text-[46px]">
            Earn the Right to Trade
          </h2>
          <p className="mt-3 text-base text-hiw-copy sm:text-[19px]">
            A structured journey from learning to AI-backed investing.
          </p>
        </header>

        <ol className="hiw-steps mt-[52px] grid grid-cols-1 gap-5 min-[641px]:grid-cols-2 min-[1101px]:mt-8 min-[1101px]:grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)_24px_minmax(0,1fr)_24px_minmax(0,1fr)] min-[1101px]:gap-0">
          {steps.map((step, index) => (
            <Fragment key={step.number}>
              <StepCard {...step} />
              {index < steps.length - 1 && (
                <li role="presentation" aria-hidden="true" className="hiw-chevron hidden place-items-center text-hiw-navy min-[1101px]:grid">
                  <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2.5} />
                </li>
              )}
            </Fragment>
          ))}
        </ol>

        <div className="hiw-stats-panel relative mt-14 overflow-hidden rounded-[20px] px-5 py-7 text-white min-[641px]:px-7 min-[641px]:py-[34px] min-[1101px]:mt-8 min-[1101px]:px-5 min-[1101px]:py-6">
          <div aria-hidden="true" className="hiw-stats-glow pointer-events-none absolute -bottom-[120px] -right-20 h-[260px] w-[420px]" />
          <dl className="hiw-stats-grid relative grid grid-cols-1">
            {stats.map((stat) => <StatItem key={stat.value} {...stat} compactDesktop />)}
          </dl>
        </div>
      </div>
    </section>
  );
}
