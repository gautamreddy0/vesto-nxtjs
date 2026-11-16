import { ArrowRight } from 'lucide-react';

import { HeroPrimaryCta } from '@/components/landing/hero-cta';

export function CtaBand() {
  return (
    <section className="relative isolate overflow-hidden rounded-[28px] bg-brand-hero px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14 lg:py-14">
      <BarChartDecoration />
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to build your investing skills?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/80 sm:text-lg">
            Learn, analyze, pitch and simulate — all in one platform.
          </p>
        </div>
        <div className="shrink-0">
          <HeroPrimaryCta label="Get Started Free" />
        </div>
      </div>
    </section>
  );
}

function BarChartDecoration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 360 200"
      preserveAspectRatio="xMidYMid meet"
      className="pointer-events-none absolute -left-8 bottom-0 h-40 w-72 opacity-10 sm:left-4 sm:h-48 sm:w-80"
    >
      <g fill="var(--accent)">
        <rect x="20" y="126" width="28" height="58" rx="4" />
        <rect x="68" y="99" width="28" height="85" rx="4" />
        <rect x="116" y="112" width="28" height="72" rx="4" />
        <rect x="164" y="66" width="28" height="118" rx="4" />
        <rect x="212" y="78" width="28" height="106" rx="4" />
        <rect x="260" y="34" width="28" height="150" rx="4" />
        <rect x="308" y="18" width="28" height="166" rx="4" />
      </g>
      <path d="M14 110 82 82l48 16 70-52 48 11 76-42" fill="none" stroke="var(--brand-green)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
