'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, BarChart3, Search } from 'lucide-react';

import { AiFundManagerCta } from '@/components/markets/ai-fund-manager-cta';
import { CompanyHeader } from '@/components/markets/company-header';
import { CompanyLogo } from '@/components/markets/company-logo';
import { CompanyProfileCard } from '@/components/markets/company-profile-card';
import { FinancialsCard } from '@/components/markets/financials-card';
import { FinancialTrendChart } from '@/components/markets/financial-trend-chart';
import { KeyMetricsCard } from '@/components/markets/key-metrics-card';
import { RevenueAllocationDonut } from '@/components/markets/revenue-allocation-donut';
import { Delta } from '@/components/ui/delta';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanies, type CompanyEntry } from '@/lib/hooks/use-companies';
import { useWatchlist } from '@/lib/hooks/use-watchlist';
import { formatCurrency, getExtras, rangePosition } from '@/lib/markets/selectors';
import { cn } from '@/lib/utils';

type ListTab = 'watchlist' | 'all' | 'sectors';
type SortKey = 'cap-desc' | 'cap-asc' | 'change-desc' | 'change-asc' | 'name' | 'pe';

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: 'cap-desc', label: 'Market Cap (High → Low)' },
  { value: 'cap-asc', label: 'Market Cap (Low → High)' },
  { value: 'change-desc', label: 'Change % (High → Low)' },
  { value: 'change-asc', label: 'Change % (Low → High)' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'pe', label: 'P/E (Low → High)' },
];

const previewSections = [
  { label: 'Overview', href: '' },
  { label: 'Financials', href: '#financials' },
  { label: 'Ratios', href: '#ratios' },
  { label: 'Risks', href: '#risks' },
  { label: 'News', href: '#news' },
];

export function MarketsPage({ initialSymbol = '' }: { initialSymbol?: string }) {
  const router = useRouter();
  const { data, loading, error } = useCompanies();
  const { symbols: watchlistedSymbols, isWatchlisted } = useWatchlist();
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol.toUpperCase());
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<ListTab>('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [sort, setSort] = useState<SortKey>('cap-desc');
  const [showPreview, setShowPreview] = useState(false);
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1350px)');
    const update = () => setShowPreview(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const allCompanies = data ?? [];
  const sectors = useMemo(
    () => Array.from(new Set(allCompanies.map((entry) => entry.company.sector).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b)),
    [allCompanies],
  );
  const visibleCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = allCompanies.filter((entry) => {
      const searchable = `${entry.company.symbol} ${entry.company.name}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesSector = sectorFilter === 'all' || entry.company.sector === sectorFilter;
      const matchesWatchlist = tab !== 'watchlist' || watchlistedSymbols.includes(entry.company.symbol.toUpperCase());
      return matchesSearch && matchesSector && matchesWatchlist;
    });
    return filtered.sort((a, b) => compareCompanies(a, b, sort));
  }, [allCompanies, search, sectorFilter, sort, tab, watchlistedSymbols]);

  const selectSymbol = useCallback((symbol: string) => setSelectedSymbol(symbol.toUpperCase()), []);

  useEffect(() => {
    if (!visibleCompanies.length) return;
    if (!selectedSymbol || !visibleCompanies.some((entry) => entry.company.symbol === selectedSymbol)) {
      setSelectedSymbol(visibleCompanies[0].company.symbol);
    }
  }, [selectedSymbol, visibleCompanies]);

  useEffect(() => {
    if (!selectedSymbol) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('symbol') !== selectedSymbol) {
      url.searchParams.set('symbol', selectedSymbol);
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, [selectedSymbol]);

  const selectedCompany = useMemo(
    () => allCompanies.find((entry) => entry.company.symbol === selectedSymbol) ?? visibleCompanies[0] ?? null,
    [allCompanies, selectedSymbol, visibleCompanies],
  );

  const moveSelection = useCallback((direction: -1 | 1) => {
    const index = visibleCompanies.findIndex((entry) => entry.company.symbol === selectedSymbol);
    if (!visibleCompanies.length) return;
    const nextIndex = (index + direction + visibleCompanies.length) % visibleCompanies.length;
    const nextSymbol = visibleCompanies[nextIndex].company.symbol;
    setSelectedSymbol(nextSymbol);
    rowRefs.current[nextIndex]?.focus();
  }, [selectedSymbol, visibleCompanies]);

  const handleRowsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveSelection(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter' && selectedCompany) {
      event.preventDefault();
      router.push(`/markets/${encodeURIComponent(selectedCompany.company.symbol)}`);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-bg text-accent-text">
            <BarChart3 aria-hidden="true" className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Markets</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">Explore companies, analyze fundamentals and find investment opportunities.</p>
          </div>
        </div>
        <div className="flex w-full items-center gap-2 xl:max-w-[480px]">
          <label className="relative min-w-0 flex-1">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search company (e.g. AAPL, Microsoft…)" className="pl-9" aria-label="Search companies" />
          </label>
          <button type="button" onClick={() => setTab('watchlist')} aria-label="Show watchlist" title="Show watchlist" className="inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground outline-none hover:bg-muted-bg focus-visible:ring-2 focus-visible:ring-ring">
            <Bookmark aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid items-start gap-6 min-[1350px]:grid-cols-[420px_minmax(0,1fr)]">
        <CompanyList
          companies={visibleCompanies}
          loading={loading}
          error={error}
          sectors={sectors}
          selectedSymbol={selectedSymbol}
          onSelect={selectSymbol}
          rowRefs={rowRefs}
          tab={tab}
          setTab={setTab}
          sectorFilter={sectorFilter}
          setSectorFilter={setSectorFilter}
          sort={sort}
          setSort={setSort}
          isWatchlisted={isWatchlisted}
          onKeyDown={handleRowsKeyDown}
        />

        {selectedCompany && showPreview && (
          <section className="hidden min-w-0 space-y-5 min-[1350px]:block" aria-label={`${selectedCompany.company.symbol} company preview`}>
            <CompanyHeader companyData={selectedCompany} compact />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <nav aria-label="Company preview sections" className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
                {previewSections.map((item) => (
                  <Link key={item.label} href={item.href ? `/markets/${selectedCompany.company.symbol}${item.href}` : `/markets/${selectedCompany.company.symbol}`} className={cn('whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium', item.label === 'Overview' ? 'bg-accent-bg text-accent-text' : 'text-muted-foreground hover:bg-muted-bg hover:text-foreground')}>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Link href={`/markets/${selectedCompany.company.symbol}`} className="text-sm font-semibold text-primary-text outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">Open full analysis →</Link>
            </div>
            <div className="grid min-w-0 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <FinancialTrendChart symbol={selectedCompany.company.symbol} companyData={selectedCompany} compact />
              <KeyMetricsCard companyData={selectedCompany} compact />
            </div>
            <div className="grid min-w-0 gap-5 xl:grid-cols-3">
              <CompanyProfileCard companyData={selectedCompany} compact />
              <FinancialsCard symbol={selectedCompany.company.symbol} companyData={selectedCompany} compact />
              <RevenueAllocationDonut symbol={selectedCompany.company.symbol} companyData={selectedCompany} compact />
            </div>
            <AiFundManagerCta companyData={selectedCompany} compact />
          </section>
        )}
      </div>
    </div>
  );
}

function CompanyList({
  companies,
  loading,
  error,
  sectors,
  selectedSymbol,
  onSelect,
  rowRefs,
  tab,
  setTab,
  sectorFilter,
  setSectorFilter,
  sort,
  setSort,
  isWatchlisted,
  onKeyDown,
}: {
  companies: CompanyEntry[];
  loading: boolean;
  error: string | null;
  sectors: string[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  rowRefs: { current: Array<HTMLButtonElement | null> };
  tab: ListTab;
  setTab: (tab: ListTab) => void;
  sectorFilter: string;
  setSectorFilter: (sector: string) => void;
  sort: SortKey;
  setSort: (sort: SortKey) => void;
  isWatchlisted: (symbol: string) => boolean;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}) {
  const tabs: Array<{ value: ListTab; label: string }> = [
    { value: 'watchlist', label: 'Watchlist' },
    { value: 'all', label: 'All Companies' },
    { value: 'sectors', label: 'Sectors' },
  ];
  const grouped = useMemo(() => {
    if (tab !== 'sectors') return null;
    return companies.reduce<Record<string, CompanyEntry[]>>((result, entry) => {
      const name = entry.company.sector || 'Sector unavailable';
      (result[name] ??= []).push(entry);
      return result;
    }, {});
  }, [companies, tab]);

  const renderRow = (entry: CompanyEntry, index: number) => {
    const symbol = entry.company.symbol;
    const selected = symbol === selectedSymbol;
    const className = cn('relative grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3 text-left outline-none focus-visible:z-[1] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:grid-cols-[minmax(0,1fr)_82px_88px_62px]', selected ? 'bg-accent-bg before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary' : 'hover:bg-muted-bg');
    return (
      <div key={symbol}>
        <button ref={(element) => { rowRefs.current[index] = element; }} type="button" tabIndex={selected ? 0 : -1} aria-pressed={selected} onClick={() => onSelect(symbol)} className={cn(className, 'hidden min-[1350px]:grid')}>
          <CompanyRowContent entry={entry} isWatchlisted={isWatchlisted(symbol)} />
        </button>
        <Link href={`/markets/${encodeURIComponent(symbol)}`} onClick={() => onSelect(symbol)} className={cn(className, 'min-[1350px]:hidden')}>
          <CompanyRowContent entry={entry} isWatchlisted={isWatchlisted(symbol)} />
        </Link>
      </div>
    );
  };

  let rowIndex = 0;
  const renderRows = (entries: CompanyEntry[]) => entries.map((entry) => renderRow(entry, rowIndex++));

  return (
    <Card className="min-w-0 overflow-hidden shadow-sm">
      <CardHeader className="space-y-4 p-4 sm:p-5">
        <div role="tablist" aria-label="Company list view" className="grid grid-cols-3 rounded-lg bg-muted-bg p-1">
          {tabs.map((item) => <button key={item.value} type="button" role="tab" aria-selected={tab === item.value} onClick={() => setTab(item.value)} className={`rounded-md px-1.5 py-2 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-2 ${tab === item.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{item.label}</button>)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger aria-label="Filter by sector" className="bg-card"><SelectValue placeholder="All Sectors" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {sectors.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
            <SelectTrigger aria-label="Sort companies" className="bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>{sortOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="hidden grid-cols-[minmax(0,1fr)_82px_88px_62px] gap-3 px-4 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid min-[1350px]:grid">
          <span>Ticker / Company</span><span className="text-right">Price</span><span className="text-right">Change</span><span className="text-center">52W</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="divide-y divide-border" aria-label="Loading companies">{Array.from({ length: 8 }, (_, index) => <CompanySkeleton key={index} />)}</div>
        ) : error ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">Market data unavailable.</p>
        ) : tab === 'watchlist' && companies.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">Star companies to build your watchlist.</p>
        ) : companies.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">No companies match these filters.</p>
        ) : (
          <div className="max-h-[960px] min-h-[420px] overflow-y-auto" onKeyDown={onKeyDown}>
            {grouped ? Object.entries(grouped).map(([name, entries]) => <div key={name}><h3 className="sticky top-0 z-[1] border-y border-border bg-muted-bg px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{name}</h3>{renderRows(entries)}</div>) : renderRows(companies)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompanyRowContent({ entry, isWatchlisted }: { entry: CompanyEntry; isWatchlisted: boolean }) {
  const { company, quote, fundamentals } = entry;
  const low = fundamentals?.week_52_low;
  const high = fundamentals?.week_52_high;
  const price = quote?.current_price;
  const validRange = typeof low === 'number' && typeof high === 'number' && high > low;
  const position = rangePosition(price, low, high);
  return (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <CompanyLogo symbol={company.symbol} logo={company.logo ?? getExtras(company.symbol)?.logo} size="sm" />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">{company.symbol}{isWatchlisted && <Bookmark aria-label="In watchlist" className="h-3 w-3 fill-accent text-accent" />}</span>
          <span className="block truncate text-xs text-muted-foreground">{company.name}</span>
        </span>
      </span>
      <span className="text-right text-sm font-medium text-foreground num">{price != null ? formatCurrency(price) : '—'}</span>
      <span className="text-right"><Delta value={quote?.percent_change} className="text-xs" /></span>
      <span className="col-span-2 flex items-center gap-2 sm:col-span-1" aria-label={validRange ? `52-week range ${formatCurrency(low)} to ${formatCurrency(high)}` : '52-week range unavailable'}>
        <span className="relative h-1.5 flex-1 rounded-full bg-muted-bg">
          {validRange && <span className="absolute inset-0 rounded-full bg-primary/20" />}
          {validRange && price != null && <span className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary" style={{ left: `${position * 100}%` }} />}
        </span>
        <span className="hidden text-[10px] text-muted-foreground sm:inline">52W</span>
      </span>
    </>
  );
}

function CompanySkeleton() {
  return <div className="flex items-center gap-3 border-b border-border px-4 py-4" aria-hidden="true"><div className="h-10 w-10 animate-pulse rounded-xl bg-muted-bg" /><div className="flex-1 space-y-2"><div className="h-3 w-16 animate-pulse rounded bg-muted-bg" /><div className="h-2.5 w-32 animate-pulse rounded bg-muted-bg" /></div><div className="h-3 w-16 animate-pulse rounded bg-muted-bg" /></div>;
}

function compareCompanies(a: CompanyEntry, b: CompanyEntry, sort: SortKey) {
  const capValue = (entry: CompanyEntry) => {
    const value = entry.company.market_cap ?? entry.fundamentals?.market_cap;
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    return value > 0 && value < 1_000_000_000 ? value * 1_000_000 : value;
  };
  const capA = capValue(a);
  const capB = capValue(b);
  switch (sort) {
    case 'cap-asc': return capA === null ? 1 : capB === null ? -1 : capA - capB;
    case 'change-desc': return (b.quote?.percent_change ?? Number.NEGATIVE_INFINITY) - (a.quote?.percent_change ?? Number.NEGATIVE_INFINITY);
    case 'change-asc': return (a.quote?.percent_change ?? Number.POSITIVE_INFINITY) - (b.quote?.percent_change ?? Number.POSITIVE_INFINITY);
    case 'name': return a.company.name.localeCompare(b.company.name);
    case 'pe': return (a.fundamentals?.pe_ratio ?? Number.POSITIVE_INFINITY) - (b.fundamentals?.pe_ratio ?? Number.POSITIVE_INFINITY);
    case 'cap-desc':
    default: return capA === null ? 1 : capB === null ? -1 : capB - capA;
  }
}
