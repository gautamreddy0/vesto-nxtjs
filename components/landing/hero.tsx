import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';

import { HeroPrimaryCta } from '@/components/landing/hero-cta';
import { Button } from '@/components/ui/button';

const trustPoints = [
  'Real company financials',
  '$10,000 virtual portfolio',
  'AI investment evaluation',
];

export function LandingHero() {
  return (
    <section className="relative isolate min-h-[480px] overflow-hidden bg-sidebar text-white">
      <Image
        src="/brand/hero-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: 'linear-gradient(90deg, color-mix(in srgb, var(--sidebar) 94%, transparent) 0%, color-mix(in srgb, var(--sidebar) 82%, transparent) 38%, color-mix(in srgb, var(--sidebar) 16%, transparent) 70%, transparent 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-32 z-[1] h-[420px] w-[760px] blur-[10px]"
        style={{
          background: 'radial-gradient(closest-side, color-mix(in srgb, var(--hero-cta) 38%, transparent), color-mix(in srgb, var(--accent) 22%, transparent) 45%, transparent 75%)',
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-[1240px] items-center gap-5 px-6 pb-[72px] pt-11 min-[1101px]:grid-cols-[1.12fr_0.95fr]">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-hero-cta/45 bg-white/[0.06] px-4 py-[7px] text-sm font-medium text-white shadow-[inset_0_0_0_1px_rgb(255_255_255_/_4%)]">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-hero-sparkle" />
            AI-Powered Investment Learning Platform
          </div>

          <h1 className="mt-[22px] font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.02em] text-white sm:text-[46px] min-[1101px]:text-[52px]">
            <span className="block min-[1100px]:whitespace-nowrap">Learn. Analyze. Simulate.</span>
            <span className="block text-hero-gradient">Invest Smarter.</span>
          </h1>
          <p className="mt-[18px] max-w-[560px] text-lg leading-[1.55] text-white/85">
            Build financial knowledge, analyze real companies, practice investing with a virtual portfolio, and get AI-powered feedback on your investment ideas.
          </p>

          <div className="mt-7 flex flex-wrap gap-4">
            <HeroPrimaryCta label="Explore the Platform" />
            <Link href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="h-[50px] gap-2.5 rounded-lg border-[1.5px] border-white/75 bg-transparent px-[26px] text-base font-semibold text-white hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
              >
                <Circle aria-hidden="true" className="h-[18px] w-[18px]" />
                See How It Works
              </Button>
            </Link>
          </div>

          <ul className="mt-6 flex flex-col gap-3 text-[14.5px] text-white/90 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-3">
            {trustPoints.map((point) => (
              <li key={point} className="inline-flex items-center gap-2">
                <CheckCircle2 aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-hero-cta" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-w-0 justify-center min-[1101px]:justify-end">
          <div className="w-full max-w-[680px] min-[1101px]:-mr-10">
            <div className="[filter:drop-shadow(0_0_40px_color-mix(in_srgb,var(--accent)_18%,transparent))]">
              <Image
                src="/brand/hero-laptop.webp"
                width={1308}
                height={922}
                priority
                alt="Vesto dashboard preview on a laptop"
                sizes="(min-width:1100px) 680px, 100vw"
                className="h-auto w-full max-w-[680px] drop-shadow-xl"
              />
            </div>
            <p className="mt-1 text-right text-xs text-white/55">Illustrative example</p>
          </div>
        </div>
      </div>
    </section>
  );
}
