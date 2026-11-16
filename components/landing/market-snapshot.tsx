'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness } from 'lucide-react';

import { Delta } from '@/components/ui/delta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanies, type CompanyEntry } from '@/lib/hooks/use-companies';
import { formatCurrency } from '@/lib/utils/format';

type MarketTab = 'gainers' | 'losers' | 'largest';

const tabs: { value: MarketTab; label: string }[] = [
  { value: 'gainers', label: 'Top Gainers' },
  { value: 'losers', label: 'Top Losers' },
  { value: 'largest', label: 'Largest' },
];

export function MarketSnapshot() {
  const { data, loading, error } = useCompanies();
  const [activeTab, setActiveTab] = useState<MarketTab>('gainers');
  const rows = useMemo(() => sortCompanies(data ?? [], activeTab).slice(0, 5), [data, activeTab]);
  const asOf = useMemo(() => formatAsOf(data ?? []), [data]);

  return (
    <section className="grid gap-6 py-10 sm:py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:py-16">
      <MarketCard
        rows={rows}
        loading={loading}
        failed={Boolean(error)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        asOf={asOf}
      />
      <ExamplePortfolio />
    </section>
  );
}

function MarketCard({
  rows,
  loading,
  failed,
  activeTab,
  setActiveTab,
  asOf,
}: {
  rows: CompanyEntry[];
  loading: boolean;
  failed: boolean;
  activeTab: MarketTab;
  setActiveTab: (tab: MarketTab) => void;
  asOf: string;
}) {
  return (
    <Card className="min-w-0 shadow-sm">
      <CardHeader className="gap-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="font-display text-xl">Market Snapshot</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Movers across the Vesto universe</p>
          </div>
          <span className="text-[11px] text-muted-foreground">{asOf}</span>
        </div>
        <div role="tablist" aria-label="Market company sorting" className="grid grid-cols-3 rounded-lg bg-muted-bg p-1">
          {tabs.map(({ value, label }) => (
            <button
              key={value}
              id={`market-tab-${value}`}
              type="button"
              role="tab"
              aria-selected={activeTab === value}
              aria-controls="market-snapshot-rows"
              onClick={() => setActiveTab(value)}
              className={`rounded-md px-2 py-2 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:text-sm ${activeTab === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div id="market-snapshot-rows" role="tabpanel" aria-labelledby={`market-tab-${activeTab}`} className="divide-y divide-border">
          {loading ? (
            <div className="space-y-0" aria-label="Loading market data">
              {Array.from({ length: 5 }, (_, index) => <MarketSkeleton key={index} />)}
            </div>
          ) : failed ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">Market data unavailable</p>
          ) : rows.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">Market data unavailable</p>
          ) : (
            rows.map((entry) => <MarketRow key={entry.company.symbol} entry={entry} />)
          )}
        </div>
        <div className="border-t border-border px-4 py-3 sm:px-6">
          <Link href="/markets" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-text outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
            View all markets
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function MarketRow({ entry }: { entry: CompanyEntry }) {
  const price = entry.quote?.current_price;
  const low = entry.fundamentals?.week_52_low;
  const high = entry.fundamentals?.week_52_high;
  const canShowRange = Number.isFinite(price) && Number.isFinite(low) && Number.isFinite(high) && high > low;
  const rangePosition = canShowRange
    ? Math.max(0, Math.min(100, (((price as number) - (low as number)) / ((high as number) - (low as number))) * 100))
    : 0;

  return (
    <Link
      href={`/markets/${encodeURIComponent(entry.company.symbol)}`}
      className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3 outline-none transition-colors hover:bg-accent-bg focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:grid-cols-[minmax(0,1fr)_auto_92px] sm:px-6"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-foreground">{entry.company.symbol}</span>
        <span className="block truncate text-xs text-muted-foreground">{entry.company.name}</span>
      </span>
      <span className="text-right">
        <span className="block text-sm font-medium text-foreground num">{price != null ? formatCurrency(price) : '—'}</span>
        <Delta value={entry.quote?.percent_change} decimals={2} className="text-xs" />
      </span>
      <span className="col-span-2 flex items-center gap-2 sm:col-span-1" aria-label={canShowRange ? `52-week range from ${formatCurrency(low as number)} to ${formatCurrency(high as number)}` : '52-week range unavailable'}>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted-bg">
          {canShowRange && (
            <span className="relative block h-full rounded-full bg-accent/40">
              <span className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-accent" style={{ left: `${rangePosition}%` }} />
            </span>
          )}
        </span>
        <span className="hidden text-[10px] text-muted-foreground sm:inline">52W</span>
      </span>
    </Link>
  );
}

function MarketSkeleton() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_92px] items-center gap-3 px-4 py-4 sm:px-6" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-3 w-12 animate-pulse rounded bg-muted-bg" />
        <div className="h-2.5 w-28 max-w-full animate-pulse rounded bg-muted-bg" />
      </div>
      <div className="space-y-2">
        <div className="ml-auto h-3 w-16 animate-pulse rounded bg-muted-bg" />
        <div className="ml-auto h-2.5 w-12 animate-pulse rounded bg-muted-bg" />
      </div>
      <div className="h-1.5 animate-pulse rounded-full bg-muted-bg" />
    </div>
  );
}

function ExamplePortfolio() {
  return (
    <Card className="min-w-0 shadow-sm">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="font-display text-xl">Virtual Portfolio <span className="text-muted-foreground">(Example)</span></CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Start with $10,000 and practise real-world investing.</p>
          </div>
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-bg text-accent-text sm:flex">
            <BriefcaseBusiness aria-hidden="true" className="h-5 w-5" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="grid grid-cols-3 gap-2">
          <ExampleStat label="Portfolio Value" value="$10,420" />
          <ExampleStat label="Total Return" value="+4.2%" positive />
          <ExampleStat label="Today's P/L" value="+$320" positive />
        </div>
        <ExamplePortfolioChart />
      </CardContent>
    </Card>
  );
}

function ExampleStat({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-muted-bg/60 p-2.5 sm:p-3">
      <p className="min-h-8 text-[10px] leading-tight text-muted-foreground sm:text-xs">{label}</p>
      <p className={`truncate text-sm font-semibold num sm:text-base ${positive ? 'text-success' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}

function ExamplePortfolioChart() {
  const points = [100, 102, 101, 105, 103, 107, 108, 106, 111, 110, 114, 112, 115, 118, 116, 121, 119, 123, 122, 127, 125, 129, 128, 132, 130, 136, 134, 139, 137, 142];
  const width = 300;
  const height = 120;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const polyline = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((point - min) / (max - min)) * (height - 12) - 6;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Illustrative portfolio performance</p>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Illustrative example portfolio chart" className="h-28 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="portfolio-example-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.34" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={`0,${height} ${polyline} ${width},${height}`} fill="url(#portfolio-example-fill)" />
        <polyline points={polyline} fill="none" stroke="var(--chart-1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

function sortCompanies(companies: CompanyEntry[], tab: MarketTab) {
  return [...companies].sort((a, b) => {
    if (tab === 'largest') {
      return (b.company.market_cap ?? b.fundamentals?.market_cap ?? 0) - (a.company.market_cap ?? a.fundamentals?.market_cap ?? 0);
    }

    const missingChange = tab === 'gainers' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    const aChange = a.quote?.percent_change ?? missingChange;
    const bChange = b.quote?.percent_change ?? missingChange;
    return tab === 'gainers' ? bChange - aChange : aChange - bChange;
  });
}

function formatAsOf(companies: CompanyEntry[]) {
  const timestamps = companies.flatMap((entry) => [
    entry.company.updated_at,
    entry.fundamentals?.extracted_at,
    entry.quote?.created_at,
  ]).filter((value): value is string => Boolean(value));
  const times = timestamps.map((value) => new Date(value).getTime()).filter(Number.isFinite);

  if (times.length === 0) return 'Snapshot data';
  const newest = new Date(Math.max(...times));
  return `Data as of ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(newest)}`;
}
