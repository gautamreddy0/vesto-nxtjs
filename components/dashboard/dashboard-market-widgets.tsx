'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';

import { CompanyLogo } from '@/components/markets/company-logo';
import { Delta } from '@/components/ui/delta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanies, type CompanyEntry } from '@/lib/hooks/use-companies';
import { useWatchlist } from '@/lib/hooks/use-watchlist';
import { formatCurrency, rangePosition } from '@/lib/markets/selectors';

export function DashboardMarketWidgets() {
  const { data, loading, error } = useCompanies();
  const companies = data ?? [];
  const [moverMode, setMoverMode] = useState<'gainers' | 'losers'>('gainers');
  const movers = useMemo(() => getTopMovers(companies, moverMode), [companies, moverMode]);
  const market = useMemo(() => summarizeMarket(companies), [companies]);
  const asOf = useMemo(() => getDataAsOf(companies), [companies]);

  return (
    <section aria-label="Market snapshot, watchlist, and top movers" className="grid min-w-0 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
      <MarketSnapshotCard market={market} asOf={asOf} loading={loading} error={Boolean(error)} />
      <WatchlistCard companies={companies} loading={loading} />
      <TopMoversCard movers={movers} mode={moverMode} onModeChange={setMoverMode} loading={loading} error={Boolean(error)} />
    </section>
  );
}

interface MarketSummary {
  averageChange: number | null;
  advancers: number;
  decliners: number;
  unchanged: number;
  sectors: Array<{ name: string; companies: number; averageChange: number | null }>;
  pricedCompanies: number;
  totalCompanies: number;
}

function MarketSnapshotCard({ market, asOf, loading, error }: { market: MarketSummary; asOf: string; loading: boolean; error: boolean }) {
  const moversTotal = market.advancers + market.decliners;
  const advancerWidth = moversTotal > 0 ? (market.advancers / moversTotal) * 100 : 0;

  return (
    <Card className="flex h-full min-w-0 flex-col shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-2 p-4 pb-3 sm:p-5 sm:pb-3 lg:flex-col xl:flex-row">
        <div className="min-w-0">
          <CardTitle className="whitespace-nowrap font-display text-lg">Market Snapshot</CardTitle>
          <p className="mt-1 truncate text-xs text-muted-foreground">Vesto universe · {asOf}</p>
        </div>
        <Link href="/markets" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary-text outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">View Markets <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4 sm:px-5 sm:pb-5">
        {loading ? <WidgetSkeleton /> : error ? <WidgetUnavailable /> : (
          <>
            <div className="flex items-end justify-between gap-3 rounded-lg bg-muted-bg/60 p-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Average daily change</p>
                <p className="mt-1 font-display text-2xl font-bold text-foreground num">{market.averageChange === null ? '—' : `${market.averageChange > 0 ? '+' : ''}${market.averageChange.toFixed(2)}%`}</p>
              </div>
              <p className="text-right text-xs text-muted-foreground">{market.pricedCompanies} of {market.totalCompanies} priced</p>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-success">{market.advancers} up</span>
                <span className="text-muted-foreground">{market.unchanged > 0 ? `${market.unchanged} unchanged · ` : ''}{market.decliners} down</span>
              </div>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-muted-bg" role="img" aria-label={`${market.advancers} advancers, ${market.decliners} decliners, ${market.unchanged} unchanged`}>
                {moversTotal > 0 && <span className="h-full bg-success" style={{ width: `${advancerWidth}%` }} />}
                {moversTotal > 0 && <span className="h-full bg-danger" style={{ width: `${100 - advancerWidth}%` }} />}
              </div>
            </div>
            <div className="space-y-2 border-t border-border pt-3">
              {market.sectors.length ? market.sectors.map((sector) => (
                <div key={sector.name} className="flex items-center justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate font-medium text-foreground">{sector.name} <span className="font-normal text-muted-foreground">· {sector.companies}</span></span>
                  <Delta value={sector.averageChange} className="shrink-0 text-xs" />
                </div>
              )) : <p className="text-xs text-muted-foreground">Sector changes unavailable.</p>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function WatchlistCard({ companies, loading }: { companies: CompanyEntry[]; loading: boolean }) {
  const { symbols } = useWatchlist();
  const companyMap = useMemo(() => new Map(companies.map((entry) => [entry.company.symbol.toUpperCase(), entry] as const)), [companies]);
  const watchlisted = symbols.map((symbol) => companyMap.get(symbol.toUpperCase())).filter((entry): entry is CompanyEntry => Boolean(entry)).slice(0, 4);

  return (
    <Card className="flex h-full min-w-0 flex-col shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-2 p-4 pb-3 sm:p-5 sm:pb-3">
        <CardTitle className="font-display text-lg">My Watchlist</CardTitle>
        <Link href="/markets?tab=watchlist" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary-text outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">View All <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
        {loading ? <WidgetSkeleton /> : watchlisted.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-2 text-center">
            <p className="text-sm text-muted-foreground">Star companies in Markets to track them here</p>
            <Link href="/markets" className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted-bg">Browse Markets <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {watchlisted.map((entry) => <WatchlistRow key={entry.company.symbol} entry={entry} />)}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function WatchlistRow({ entry }: { entry: CompanyEntry }) {
  const symbol = entry.company.symbol;
  const price = entry.quote?.current_price;
  const low = entry.fundamentals?.week_52_low;
  const high = entry.fundamentals?.week_52_high;
  const hasRange = typeof price === 'number' && Number.isFinite(price)
    && typeof low === 'number' && Number.isFinite(low)
    && typeof high === 'number' && Number.isFinite(high) && high > low;
  const position = hasRange ? rangePosition(price, low, high) * 100 : 0;

  return (
    <li>
      <Link href={`/markets/${encodeURIComponent(symbol)}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2 py-3 outline-none hover:bg-muted-bg/40 focus-visible:ring-2 focus-visible:ring-ring">
        <CompanyLogo symbol={symbol} logo={entry.company.logo} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">{symbol}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{entry.company.name}</span>
        </span>
        <span className="whitespace-nowrap text-right num">
          <span className="block text-sm font-semibold text-foreground">{price == null ? '—' : formatCurrency(price)}</span>
          <Delta value={entry.quote?.percent_change} className="whitespace-nowrap text-[11px]" />
        </span>
        <span className="col-span-3 flex items-center gap-2 pl-[50px]" aria-label={hasRange ? `52-week range from ${formatCurrency(low)} to ${formatCurrency(high)}` : '52-week range unavailable'}>
          <span className="relative h-1.5 flex-1 rounded-full bg-muted-bg">
            {hasRange && <span className="absolute inset-y-0 left-0 rounded-full bg-accent/35" />}
            {hasRange && <span className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-accent" style={{ left: `${position}%` }} />}
          </span>
          <span className="text-[10px] text-muted-foreground">52W</span>
        </span>
      </Link>
    </li>
  );
}

function TopMoversCard({ movers, mode, onModeChange, loading, error }: { movers: CompanyEntry[]; mode: 'gainers' | 'losers'; onModeChange: (mode: 'gainers' | 'losers') => void; loading: boolean; error: boolean }) {
  return (
    <Card className="flex h-full min-w-0 flex-col shadow-sm md:col-span-2 lg:col-span-1">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 p-4 pb-3 sm:p-5 sm:pb-3">
        <CardTitle className="font-display text-lg">Top Movers</CardTitle>
        <div className="flex items-center gap-1 rounded-lg bg-muted-bg p-1" role="group" aria-label="Top movers direction">
          {(['gainers', 'losers'] as const).map((value) => (
            <button key={value} type="button" aria-pressed={mode === value} onClick={() => onModeChange(value)} className={`rounded-md px-2.5 py-1.5 text-xs font-semibold capitalize transition-colors ${mode === value ? 'bg-brand-green text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {value}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
        {loading ? <WidgetSkeleton /> : error ? <WidgetUnavailable /> : movers.length === 0 ? (
          <p className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">Change data is unavailable.</p>
        ) : (
          <ul className="divide-y divide-border">
            {movers.map((entry) => <MoverRow key={entry.company.symbol} entry={entry} mode={mode} />)}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function MoverRow({ entry, mode }: { entry: CompanyEntry; mode: 'gainers' | 'losers' }) {
  const symbol = entry.company.symbol;
  const price = entry.quote?.current_price;
  const change = entry.quote?.percent_change;
  const Direction = mode === 'gainers' ? TrendingUp : TrendingDown;
  return (
    <li>
      <Link href={`/markets/${encodeURIComponent(symbol)}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 py-3 outline-none hover:bg-muted-bg/40 focus-visible:ring-2 focus-visible:ring-ring">
        <CompanyLogo symbol={symbol} logo={entry.company.logo} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">{symbol}</span>
          <span className="block truncate text-[11px] text-muted-foreground">{entry.company.name}</span>
        </span>
        <span className="whitespace-nowrap text-right num">
          <span className="block text-sm font-semibold text-foreground">{price == null ? '—' : formatCurrency(price)}</span>
          <Delta value={change} className="whitespace-nowrap text-[11px]" />
        </span>
        <span className={`col-span-3 flex items-center gap-1 pl-[50px] text-[10px] font-medium ${mode === 'gainers' ? 'text-success' : 'text-danger'}`}>
          <Direction aria-hidden="true" className="h-3 w-3" />{change == null ? 'Change unavailable' : `${mode === 'gainers' ? 'Gainer' : 'Decliner'} · ${Math.abs(change).toFixed(2)}%`}
        </span>
      </Link>
    </li>
  );
}

function WidgetSkeleton() {
  return <div className="space-y-3" aria-label="Loading market data" aria-busy="true">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-lg bg-muted-bg" />)}</div>;
}

function WidgetUnavailable() {
  return <p className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">Market data unavailable.</p>;
}

function summarizeMarket(companies: CompanyEntry[]): MarketSummary {
  const changes = companies
    .map((entry) => entry.quote?.percent_change)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const advancers = changes.filter((value) => value > 0).length;
  const decliners = changes.filter((value) => value < 0).length;
  const unchanged = changes.filter((value) => value === 0).length;
  const bySector = new Map<string, { count: number; changes: number[] }>();

  for (const entry of companies) {
    const sector = entry.company.sector;
    if (typeof sector !== 'string' || !sector.trim()) continue;
    const current = bySector.get(sector) ?? { count: 0, changes: [] };
    current.count += 1;
    const change = entry.quote?.percent_change;
    if (typeof change === 'number' && Number.isFinite(change)) current.changes.push(change);
    bySector.set(sector, current);
  }

  const sectors = [...bySector.entries()]
    .map(([name, value]) => ({
      name,
      companies: value.count,
      averageChange: value.changes.length ? value.changes.reduce((sum, item) => sum + item, 0) / value.changes.length : null,
    }))
    .sort((left, right) => right.companies - left.companies || left.name.localeCompare(right.name))
    .slice(0, 3);

  return {
    averageChange: changes.length ? changes.reduce((sum, value) => sum + value, 0) / changes.length : null,
    advancers,
    decliners,
    unchanged,
    sectors,
    pricedCompanies: changes.length,
    totalCompanies: companies.length,
  };
}

function getTopMovers(companies: CompanyEntry[], mode: 'gainers' | 'losers') {
  return companies
    .filter((entry) => typeof entry.quote?.percent_change === 'number' && Number.isFinite(entry.quote.percent_change))
    .sort((left, right) => mode === 'gainers'
      ? (right.quote?.percent_change ?? 0) - (left.quote?.percent_change ?? 0)
      : (left.quote?.percent_change ?? 0) - (right.quote?.percent_change ?? 0))
    .slice(0, 3);
}

function getDataAsOf(companies: CompanyEntry[]) {
  const dates = companies.flatMap((entry) => [entry.company.updated_at, entry.fundamentals?.extracted_at, entry.quote?.created_at])
    .filter((value): value is string => typeof value === 'string')
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));
  if (!dates.length) return 'Snapshot data';
  const latest = new Date(Math.max(...dates.map((date) => date.getTime())));
  return `as of ${latest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}
