import Link from 'next/link';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const benefits = [
  'Structured, industry-style learning path',
  'Company data from SEC filings and market data providers',
  'Risk-free practice with a virtual portfolio',
  'Transparent AI evaluation — see exactly why you scored what you did',
];

const criteria = [
  { label: 'Business Understanding', score: 22 },
  { label: 'Financial Analysis', score: 21 },
  { label: 'Risk Assessment', score: 19 },
  { label: 'Investment Thesis', score: 20 },
];

export function WhySection() {
  return (
    <section id="why" className="scroll-mt-24 py-10 sm:py-12 lg:py-16">
      <div className="grid overflow-hidden rounded-[28px] border border-border bg-card shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <p className="eyebrow">Why Vesto</p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Turn research and conviction into action.
          </h2>
          <ul className="mt-7 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-sm leading-relaxed text-foreground sm:text-base">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
                  <Check aria-hidden="true" className="h-3.5 w-3.5" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
          <Link href="#features" className="mt-8 w-fit">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
              Explore All Features
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="min-w-0 border-t border-border bg-muted-bg/60 p-4 sm:p-6 lg:border-l lg:border-t-0 lg:p-8">
          <MemoPreview />
        </div>
      </div>
    </section>
  );
}

function MemoPreview() {
  return (
    <article className="mx-auto max-w-[620px] rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-bg text-accent-text">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Illustrative example</p>
            <h3 className="mt-1 truncate text-sm font-semibold text-foreground sm:text-base">Investment Committee Memo · MSFT</h3>
          </div>
        </div>
        <Badge variant="success">APPROVED</Badge>
      </header>

      <div className="grid gap-5 py-5 sm:grid-cols-[112px_1fr] sm:items-center">
        <ScoreGauge />
        <div className="space-y-3" aria-label="Illustrative score criteria">
          {criteria.map(({ label, score }) => (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="shrink-0 font-semibold text-foreground num">{score}/25</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted-bg">
                <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${(score / 25) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-success">Strengths</h4>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>• Clear business model analysis</li>
            <li>• Thesis connects to financial evidence</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-warning">Gaps</h4>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>• Expand downside scenario detail</li>
            <li>• Add more explicit valuation assumptions</li>
          </ul>
        </div>
      </div>
    </article>
  );
}

function ScoreGauge() {
  const circumference = 2 * Math.PI * 42;
  const thresholdOffset = (circumference * 70) / 100;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" role="img" aria-label="Illustrative AI score 82 out of 100; threshold 70">
          <defs>
            <linearGradient id="memo-score-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--brand-green)" />
              <stop offset="55%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted-bg)" strokeWidth="7" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#memo-score-gradient)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${(circumference * 82) / 100} ${circumference}`}
            transform="rotate(-90 50 50)"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="var(--foreground)"
            strokeWidth="2"
            strokeDasharray="1 263.89"
            strokeDashoffset={-thresholdOffset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-foreground num">82</span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">Threshold: 70</p>
    </div>
  );
}
