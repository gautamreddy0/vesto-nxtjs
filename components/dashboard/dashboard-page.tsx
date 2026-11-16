'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Layers, Percent, Wallet } from 'lucide-react';

import { LatestAiVerdict } from '@/components/dashboard/latest-ai-verdict';
import { DashboardMarketWidgets } from '@/components/dashboard/dashboard-market-widgets';
import { DashboardLearning } from '@/components/dashboard/dashboard-learning';
import { PortfolioCharts, type PortfolioTimeRange } from '@/components/portfolio/portfolio-charts';
import { Stat } from '@/components/ui/delta';
import { Card, CardContent } from '@/components/ui/card';
import { usePortfolioStore } from '@/lib/hooks/use-portfolio-store';
import { useUser } from '@/lib/hooks/use-user';
import { INITIAL_PORTFOLIO_CASH } from '@/lib/portfolio/store';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils/format';

const dashboardTimeRanges: PortfolioTimeRange[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

export function DashboardPageContent() {
  const { user, loading: userLoading, isAuthenticated } = useUser();
  const { summary, loading: portfolioLoading, error, isSample } = usePortfolioStore();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<PortfolioTimeRange>('1M');

  useEffect(() => {
    let active = true;
    if (!user?.id) {
      setProfileName(null);
      return () => { active = false; };
    }

    const metadataName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : '';
    const emailName = typeof user.email === 'string' ? user.email.split('@')[0] : '';
    setProfileName(metadataName || emailName || null);

    void (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('users').select('full_name').eq('id', user.id).maybeSingle();
        if (active && typeof data?.full_name === 'string' && data.full_name.trim()) {
          setProfileName(data.full_name.trim());
        }
      } catch {
        // Use the auth metadata or email fallback if the profile is unavailable.
      }
    })();

    return () => { active = false; };
  }, [user]);

  if (userLoading || portfolioLoading || !summary) return <DashboardSkeleton />;

  const firstName = profileName?.trim().split(/\s+/)[0];
  const greeting = isAuthenticated && firstName
    ? `Welcome back, ${capitalize(firstName)} 👋`
    : 'Welcome to Vesto 👋';
  const totalReturn = summary.totalValue - INITIAL_PORTFOLIO_CASH;
  const totalReturnPercent = INITIAL_PORTFOLIO_CASH > 0 ? (totalReturn / INITIAL_PORTFOLIO_CASH) * 100 : 0;
  const yesterday = getYesterdayKey();
  const yesterdaySnapshot = summary.snapshots.find((snapshot) => snapshot.date === yesterday);
  const todayPL = yesterdaySnapshot ? summary.totalValue - yesterdaySnapshot.totalValue : null;
  const todayPLPercent = yesterdaySnapshot && yesterdaySnapshot.totalValue !== 0
    ? (todayPL! / yesterdaySnapshot.totalValue) * 100
    : null;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-tight text-foreground">{greeting}</h1>
            {isSample && <span className="rounded-full border border-warning/20 bg-warning-bg px-2.5 py-1 text-[11px] font-semibold text-warning">Sample data</span>}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Learn • Analyze • Simulate • Invest Smarter</p>
        </div>
      </header>

      {error && <p role="alert" className="rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger">{error}</p>}

      <section aria-label="Portfolio overview" className="grid gap-3 min-[768px]:grid-cols-2 min-[1280px]:grid-cols-4">
        <Stat
          label="Portfolio Value"
          value={formatCurrency(summary.totalValue)}
          delta={totalReturnPercent}
          suffix="%"
          icon={Wallet}
          iconClassName="bg-success-bg text-success"
          valueClassName="font-display font-bold"
          className="border-transparent bg-success-bg/45"
        />
        <Stat
          label="Today’s P/L"
          value={todayPL === null ? '—' : formatSignedCurrency(todayPL)}
          delta={todayPLPercent}
          suffix="%"
          hint={todayPL === null ? 'Available from tomorrow' : 'Compared with yesterday’s recorded value'}
          icon={BarChart3}
          iconClassName={todayPL === null ? 'bg-muted-bg text-muted-foreground' : todayPL >= 0 ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}
          valueClassName={`font-display font-bold ${todayPL === null ? 'text-muted-foreground' : todayPL >= 0 ? 'text-success' : 'text-danger'}`}
        />
        <Stat
          label="Total Return"
          value={`${totalReturnPercent >= 0 ? '+' : '−'}${Math.abs(totalReturnPercent).toFixed(2)}%`}
          hint={<span className={`inline-flex rounded-full px-2 py-1 font-semibold num ${totalReturn >= 0 ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>{formatSignedCurrency(totalReturn)}</span>}
          icon={Percent}
          iconClassName={totalReturn >= 0 ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}
          valueClassName={`font-display font-bold ${totalReturn >= 0 ? 'text-success' : 'text-danger'}`}
        />
        <Stat
          label="Positions"
          value={String(summary.holdings.length)}
          hint="Open holdings"
          icon={Layers}
          iconClassName="bg-accent-bg text-accent-text"
          valueClassName="font-display font-bold"
        />
      </section>

      <section aria-label="Portfolio performance and latest AI verdict" className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        {summary.holdings.length === 0 ? (
          <Card className="min-w-0 shadow-sm">
            <CardContent className="flex min-h-[220px] flex-col items-center justify-center px-5 py-8 text-center">
              <span className="font-display text-lg font-bold text-foreground">Your investment journey starts here.</span>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">Pitch an idea to the AI Fund Manager, then track your recorded portfolio performance here.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link href="/markets" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted-bg">Explore Markets<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
                <Link href="/fund-manager" className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">Make Your First Investment<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <PortfolioCharts
            snapshots={summary.snapshots}
            allocation={summary.allocation}
            totalValue={summary.totalValue}
            timeRange={timeRange}
            isSample={isSample}
            showAllocation={false}
            rangeOptions={dashboardTimeRanges}
            onTimeRangeChange={setTimeRange}
            rangeColor="green"
          />
        )}
        <LatestAiVerdict />
      </section>

      <DashboardMarketWidgets />
      <DashboardLearning />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-6" aria-label="Loading dashboard" aria-busy="true">
      <div className="space-y-3">
        <div className="h-9 w-72 max-w-full animate-pulse rounded-lg bg-muted-bg" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted-bg" />
      </div>
      <div className="grid gap-3 min-[768px]:grid-cols-2 min-[1280px]:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <Card key={index} className="h-28 animate-pulse border-transparent bg-muted-bg shadow-none" />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <Card className="h-[360px] animate-pulse border-transparent bg-muted-bg shadow-none" />
        <Card className="h-[360px] animate-pulse border-transparent bg-muted-bg shadow-none" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 min-[1280px]:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => <Card key={index} className="h-[330px] animate-pulse border-transparent bg-muted-bg shadow-none" />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => <Card key={index} className="h-[250px] animate-pulse border-transparent bg-muted-bg shadow-none" />)}
      </div>
    </div>
  );
}

function getYesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase() + value.slice(1);
}

function formatSignedCurrency(value: number) {
  return `${value >= 0 ? '+' : '−'}${formatCurrency(Math.abs(value))}`;
}
