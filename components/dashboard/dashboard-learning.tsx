'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Gamepad2, PlayCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLearningProgress } from '@/lib/hooks/use-learning-progress';
import { useUser } from '@/lib/hooks/use-user';
import { usePortfolioStore } from '@/lib/hooks/use-portfolio-store';
import { modulesCompleted, nextModule, overallPercent } from '@/lib/learn/progress';
import { MODULES } from '@/types';

export function DashboardLearning() {
  const { progressMap, loading: progressLoading, isAuthenticated } = useLearningProgress();
  const { isAuthenticated: authUser } = useUser();
  const { summary } = usePortfolioStore();
  const authenticated = isAuthenticated && authUser;
  const progressRows = Object.values(progressMap);
  const module = nextModule(authenticated ? progressRows : []) ?? MODULES[0];
  const percentage = authenticated ? overallPercent(progressRows) : 0;
  const completed = authenticated ? modulesCompleted(progressRows).completed : 0;
  const modulePercent = authenticated
    ? Math.max(0, Math.min(100, progressMap[module.id]?.completion_percentage ?? 0))
    : 0;
  const hasPositions = (summary?.holdings.length ?? 0) > 0;

  return (
    <section aria-label="Learning progress and simulator" className="grid min-w-0 gap-4 xl:grid-cols-2">
      <Card className="min-w-0 shadow-sm">
        <CardHeader className="p-4 pb-3 sm:p-5 sm:pb-3">
          <CardTitle className="font-display text-lg">Learning Progress</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Your progress through Vesto’s five guided modules</p>
        </CardHeader>
        <CardContent className="grid gap-4 px-4 pb-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:px-5 sm:pb-5">
          {progressLoading ? (
            <div className="h-[120px] w-[120px] animate-pulse rounded-full bg-muted-bg" aria-label="Loading learning progress" />
          ) : (
            <ProgressRing value={percentage} />
          )}
          <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_112px] sm:items-center">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Current module</p>
              <h3 className="mt-1 line-clamp-2 font-display text-base font-bold text-foreground">{module.title}</h3>
              <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">Module progress</span>
                <span className="font-semibold text-foreground num">{modulePercent}%</span>
              </div>
              <Progress value={modulePercent} aria-label={`${module.title} progress`} className="mt-1.5 h-2" />
              <p className="mt-2 text-xs text-muted-foreground">{completed} of {MODULES.length} modules completed</p>
              <Link href={`/learn/${module.id}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-text outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                Continue Learning <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <Link href={`/learn/${module.id}`} className="group relative hidden h-[112px] overflow-hidden rounded-xl bg-brand-hero outline-none focus-visible:ring-2 focus-visible:ring-ring sm:block" aria-label={`Continue learning ${module.title}`}>
              <Image src={`/brand/learn/${module.id}.webp`} alt="" width={160} height={112} className="h-full w-full object-contain p-1 transition-transform group-hover:scale-105" />
              <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-card text-primary shadow-md"><PlayCircle aria-hidden="true" className="h-5 w-5" /></span>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="relative min-w-0 overflow-hidden shadow-sm">
        <CardContent className="flex min-h-[230px] items-center justify-between gap-2 p-4 sm:p-5">
          <div className="relative z-10 max-w-[68%]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-bg text-accent-text"><Gamepad2 aria-hidden="true" className="h-5 w-5" /></span>
            <h2 className="mt-3 font-display text-lg font-bold text-foreground">Investment Simulator</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Practice with virtual money, test strategies, and build your confidence.</p>
            <Link href={hasPositions ? '/portfolio' : '/fund-manager'} className="mt-4 inline-flex items-center gap-2 rounded-md border border-success/40 bg-card px-3.5 py-2 text-sm font-semibold text-success outline-none hover:bg-success-bg focus-visible:ring-2 focus-visible:ring-ring">
              {hasPositions ? 'View Portfolio' : 'Start Simulation'} <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <Image src="/brand/steps/step-invest.webp" alt="" width={240} height={210} className="absolute bottom-3 right-2 h-36 w-[34%] object-contain sm:relative sm:bottom-auto sm:right-auto sm:h-44 sm:w-[34%]" />
        </CardContent>
      </Card>
    </section>
  );
}

function ProgressRing({ value }: { value: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div className="relative mx-auto h-[120px] w-[120px] sm:mx-0" role="img" aria-label={`${value}% course progress`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="dashboard-learning-progress" x1="0" x2="1" y1="1" y2="0">
            <stop offset="0%" stopColor="var(--chart-2)" />
            <stop offset="100%" stopColor="var(--brand-green)" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--muted-bg)" strokeWidth="9" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke="url(#dashboard-learning-progress)" strokeWidth="9" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-extrabold leading-none text-foreground num">{value}%</span>
        <span className="mt-1 text-[11px] font-medium text-muted-foreground">Course Progress</span>
      </div>
    </div>
  );
}
