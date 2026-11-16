'use client';

import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Copy, MoreHorizontal, Star } from 'lucide-react';
import { toast } from 'sonner';

import { CompanyLogo } from '@/components/markets/company-logo';
import { Button } from '@/components/ui/button';
import type { CompanyEntry } from '@/lib/hooks/use-companies';
import { useWatchlist } from '@/lib/hooks/use-watchlist';
import { capClass, formatChange, formatCurrency, formatMarketCap, formatPercent, getExtras } from '@/lib/markets/selectors';
import { cn } from '@/lib/utils';

interface CompanyHeaderProps {
  companyData: CompanyEntry;
  compact?: boolean;
}

export function CompanyHeader({ companyData, compact = false }: CompanyHeaderProps) {
  const { company, quote, fundamentals } = companyData;
  const extras = getExtras(company.symbol);
  const { isWatchlisted, toggle } = useWatchlist();
  const starred = isWatchlisted(company.symbol);
  const price = quote?.current_price;
  const percentChange = quote?.percent_change;
  const change = quote?.change;
  const cap = capClass(company.market_cap ?? fundamentals?.market_cap);
  const sector = company.sector ?? company.industry;
  const exchange = (company.exchange ?? extras?.exchange ?? '').split(/\s+/)[0];
  const dayLow = quote?.low;
  const dayHigh = quote?.high;
  const beta = fundamentals?.beta;
  const timestamp = formatSnapshotTime(quote?.market_timestamp);
  const stats = [
    { label: '52W Low', value: fundamentals?.week_52_low != null ? formatCurrency(fundamentals.week_52_low) : '—' },
    { label: '52W High', value: fundamentals?.week_52_high != null ? formatCurrency(fundamentals.week_52_high) : '—' },
    { label: 'Market Cap', value: formatMarketCap(company.market_cap ?? fundamentals?.market_cap) },
    { label: dayLow != null && dayHigh != null ? 'Day Range' : 'Beta', value: dayLow != null && dayHigh != null ? `${formatCurrency(dayLow)} – ${formatCurrency(dayHigh)}` : beta != null ? beta.toFixed(2) : '—' },
    { label: 'P/E Ratio', value: fundamentals?.pe_ratio != null ? `${fundamentals.pe_ratio.toFixed(2)}x` : '—' },
  ];

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied');
    } catch {
      toast.error('Unable to copy link');
    }
  };

  const DeltaIcon = percentChange != null && percentChange < 0 ? ArrowDownRight : ArrowUpRight;
  const deltaPositive = percentChange == null || percentChange >= 0;

  return (
    <section className={cn('relative overflow-hidden rounded-2xl bg-brand-hero text-white shadow-lg', compact ? 'p-4 sm:p-5' : 'p-5 sm:p-7 lg:p-8')}>
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <CompanyLogo symbol={company.symbol} logo={company.logo ?? extras?.logo} size={compact ? 'sm' : 'lg'} className="border-white/20" />
            <div className="min-w-0">
              <h1 className={cn('font-display font-bold tracking-tight text-white', compact ? 'text-xl' : 'text-2xl sm:text-3xl')}>
                {company.name} <span className="text-white/75">({company.symbol})</span>
              </h1>
              <p className="mt-1 truncate text-sm text-white/75">
                {[sector, cap, exchange].filter(Boolean).join(' · ') || 'Company overview'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-start gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={starred}
              aria-label={starred ? 'Remove from watchlist' : 'Add to watchlist'}
              onClick={() => toggle(company.symbol)}
              className="border-white/30 bg-white/5 text-white hover:bg-white/10"
            >
              <Star aria-hidden="true" className={cn('h-4 w-4', starred && 'fill-warning text-warning')} />
              <span className="hidden sm:inline">{starred ? 'Watchlisted' : 'Add to Watchlist'}</span>
            </Button>
            <Button type="button" variant="outline" size="icon" aria-label="Share company page" onClick={share} className="border-white/30 bg-white/5 text-white hover:bg-white/10">
              <Copy aria-hidden="true" className="h-4 w-4" />
            </Button>
            <details className="relative">
              <summary aria-label="More company actions" className="flex h-8 w-9 cursor-pointer list-none items-center justify-center rounded-md border border-white/30 bg-white/5 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
              </summary>
              <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-lg border border-border bg-card p-1 text-foreground shadow-xl">
                <Link href={`/fund-manager?symbol=${encodeURIComponent(company.symbol)}`} className="block rounded-md px-3 py-2 text-sm hover:bg-muted-bg">Pitch this stock</Link>
                {extras?.latest10K?.reportUrl && (
                  <a href={extras.latest10K.reportUrl} target="_blank" rel="noopener noreferrer" className="block rounded-md px-3 py-2 text-sm hover:bg-muted-bg">View latest 10-K on SEC</a>
                )}
              </div>
            </details>
          </div>
        </div>

        <div className={cn('mt-6 flex flex-col gap-5', compact ? 'lg:flex-row lg:items-end lg:justify-between' : 'sm:flex-row sm:items-end sm:justify-between')}>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className={cn('font-display font-bold tracking-tight text-white num', compact ? 'text-3xl' : 'text-4xl sm:text-5xl')}>
                {price != null ? formatCurrency(price) : '—'}
              </p>
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold num', deltaPositive ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger')}>
                <DeltaIcon aria-hidden="true" className="h-4 w-4" />
                {percentChange != null ? formatPercent(percentChange) : '—'}
                {change != null && <span>({formatChange(change)})</span>}
              </span>
            </div>
            <p className="mt-1 text-xs text-white/65">{timestamp === 'Snapshot data' ? timestamp : `As of ${timestamp}`}</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-y-4 border-t border-white/15 pt-5 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat, index) => (
            <div key={stat.label} className={cn('min-w-0 pr-3', index > 0 && 'lg:border-l lg:border-white/15 lg:pl-4')}>
              <dt className="text-[11px] uppercase tracking-wide text-white/60">{stat.label}</dt>
              <dd className="mt-1 truncate text-sm font-semibold text-white num">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function formatSnapshotTime(value: number | string | null | undefined) {
  if (value == null || value === '') return 'Snapshot data';
  const numeric = typeof value === 'string' ? Number(value) : value;
  const date = Number.isFinite(numeric)
    ? new Date(numeric < 100_000_000_000 ? numeric * 1000 : numeric)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Snapshot data';
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}
