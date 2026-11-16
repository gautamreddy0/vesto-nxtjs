'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Layers,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PortfolioCharts, PortfolioTimeRangeControl, type PortfolioTimeRange } from '@/components/portfolio/portfolio-charts';
import { PortfolioDetails } from '@/components/portfolio/portfolio-details';
import { useCompanies } from '@/lib/hooks/use-companies';
import { usePortfolioStore } from '@/lib/hooks/use-portfolio-store';
import { INITIAL_PORTFOLIO_CASH } from '@/lib/portfolio/store';
import { formatCurrency } from '@/lib/utils/format';

function PortfolioSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading portfolio" aria-busy="true">
      <div className="h-16 animate-pulse rounded-xl bg-muted-bg" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-muted-bg" />)}
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-muted-bg" />
    </div>
  );
}

export default function PortfolioPage() {
  const { summary, loading, error, isAuthenticated, isLocalStore, isSample, reset, loadSamplePortfolio, buy, sell } = usePortfolioStore();
  const { data: companyData } = useCompanies();
  const [timeRange, setTimeRange] = useState<PortfolioTimeRange>('1M');
  const [resetting, setResetting] = useState(false);

  const handleResetDemo = async () => {
    if (!window.confirm('Reset your demo portfolio, transactions, snapshots, and approved demo pitches? This cannot be undone.')) return;
    setResetting(true);
    try {
      await reset();
      toast.success('Demo portfolio reset');
    } catch (resetError) {
      toast.error(resetError instanceof Error ? resetError.message : 'Unable to reset demo portfolio.');
    } finally {
      setResetting(false);
    }
  };

  const handleLoadSample = async () => {
    try {
      await loadSamplePortfolio();
      toast.success('Sample portfolio loaded');
    } catch (sampleError) {
      toast.error(sampleError instanceof Error ? sampleError.message : 'Unable to load sample portfolio.');
    }
  };

  if (loading || !summary) return <PortfolioSkeleton />;

  const totalPL = summary.totalValue - INITIAL_PORTFOLIO_CASH;
  const totalPLPercent = INITIAL_PORTFOLIO_CASH > 0 ? (totalPL / INITIAL_PORTFOLIO_CASH) * 100 : 0;
  const positive = totalPL >= 0;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 pb-20 md:pb-6">
      {isLocalStore && (
        <div className="flex flex-col gap-3 rounded-xl border border-info/20 bg-info-bg px-4 py-3 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold">{isAuthenticated ? 'Database not set up yet' : 'Demo mode'}</span>
            {' — '}{isAuthenticated ? 'using browser storage.' : 'your portfolio is saved in this browser only. Sign in to save it to your account.'}
            {!isAuthenticated && <Link href="/login" className="ml-1 font-semibold text-primary-text underline underline-offset-2">Sign in</Link>}
          </p>
          <Button type="button" variant="outline" size="sm" disabled={resetting} onClick={handleResetDemo} className="shrink-0 gap-1.5 border-info/30 bg-card">
            <RotateCcw className="h-3.5 w-3.5" />{resetting ? 'Resetting…' : 'Reset demo'}
          </Button>
        </div>
      )}

      {error && <div role="alert" className="rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger">{error}</div>}

      <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-bg text-success">
            <BriefcaseBusiness aria-hidden="true" className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">My Portfolio</h1>
              {isSample && <span className="rounded-full border border-warning/20 bg-warning-bg px-2.5 py-1 text-[11px] font-semibold text-warning">Sample data</span>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Your holdings, available cash, and performance totals.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.priceSource === 'live' ? 'Live prices' : `Snapshot prices${summary.priceAsOf ? ` · as of ${summary.priceAsOf}` : ''}`}
            </p>
          </div>
        </div>
        <PortfolioTimeRangeControl snapshots={summary.snapshots} value={timeRange} onChange={setTimeRange} />
      </header>

      <section aria-label="Portfolio summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile title="Available Cash" value={formatCurrency(summary.cash)} Icon={Wallet} tint="bg-info-bg" iconTone="text-primary" />
        <SummaryTile title="Invested" value={formatCurrency(summary.invested)} Icon={Layers} tint="bg-accent-bg" iconTone="text-accent-text" />
        <SummaryTile title="Portfolio Value" value={formatCurrency(summary.totalValue)} Icon={BarChart3} tint="bg-success-bg" iconTone="text-success" />
        <SummaryTile
          title="Total P/L"
          value={`${positive ? '+' : '−'}${formatCurrency(Math.abs(totalPL))}`}
          detail={`${positive ? '+' : '−'}${Math.abs(totalPLPercent).toFixed(2)}%`}
          Icon={positive ? TrendingUp : TrendingDown}
          tint={positive ? 'bg-success-bg' : 'bg-danger-bg'}
          iconTone={positive ? 'text-success' : 'text-danger'}
          valueTone={positive ? 'text-success' : 'text-danger'}
          directionIcon={positive ? ArrowUpRight : ArrowDownRight}
        />
      </section>

      {summary.holdings.length === 0 ? (
        <Card className="border-border shadow-sm">
          <CardContent className="flex flex-col items-center px-5 py-10 text-center sm:px-8 sm:py-12">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-bg text-success">
              <BriefcaseBusiness aria-hidden="true" className="h-7 w-7" />
            </span>
            <h2 className="mt-5 font-display text-xl font-bold text-foreground">Your investment journey starts here.</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">Pitch a stock to the AI Fund Manager — once it&apos;s approved, you can invest your $10,000 virtual capital.</p>
            <div className="mt-6 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
              <Link href="/markets"><Button type="button" variant="outline" className="w-full gap-2 sm:w-auto">Explore Markets<ArrowRight className="h-4 w-4" /></Button></Link>
              <Link href="/fund-manager"><Button type="button" className="w-full gap-2 sm:w-auto">Make Your First Investment<ArrowRight className="h-4 w-4" /></Button></Link>
              {isLocalStore && loadSamplePortfolio && <Button type="button" variant="secondary" onClick={handleLoadSample} className="w-full sm:w-auto">Load sample portfolio</Button>}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <PortfolioCharts
            snapshots={summary.snapshots}
            allocation={summary.allocation}
            totalValue={summary.totalValue}
            timeRange={timeRange}
            isSample={isSample}
          />
          <PortfolioDetails summary={summary} companies={companyData ?? []} onBuy={buy} onSell={sell} />
        </div>
      )}
    </div>
  );
}

function SummaryTile({
  title,
  value,
  detail,
  Icon,
  tint,
  iconTone,
  valueTone = 'text-foreground',
  directionIcon: DirectionIcon,
}: {
  title: string;
  value: string;
  detail?: string;
  Icon: typeof Wallet;
  tint: string;
  iconTone: string;
  valueTone?: string;
  directionIcon?: typeof ArrowUpRight;
}) {
  return (
    <Card className={`min-w-0 border-transparent shadow-sm ${tint}`}>
      <CardContent className="flex min-h-[92px] items-center gap-3 p-4 sm:p-5">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-card/80 ${iconTone}`}>
          {DirectionIcon ? <DirectionIcon aria-hidden="true" className="h-5 w-5" /> : <Icon aria-hidden="true" className="h-5 w-5" />}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground sm:text-sm">{title}</p>
          <p className={`mt-1 font-display text-lg font-bold leading-tight num sm:text-xl ${valueTone}`}>{value}{detail && <span className="ml-1 text-sm sm:text-base">({detail})</span>}</p>
        </div>
      </CardContent>
    </Card>
  );
}
