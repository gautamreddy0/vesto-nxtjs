'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, CalendarDays, FileText, Info, MapPin } from 'lucide-react';

import { AiFundManagerCta } from '@/components/markets/ai-fund-manager-cta';
import { AnalystSummaryCard } from '@/components/markets/analyst-summary-card';
import { CompanyHeader } from '@/components/markets/company-header';
import { CompanyProfileCard } from '@/components/markets/company-profile-card';
import { FinancialsCard } from '@/components/markets/financials-card';
import { FinancialTrendChart } from '@/components/markets/financial-trend-chart';
import { KeyMetricsCard } from '@/components/markets/key-metrics-card';
import { RevenueAllocationDonut } from '@/components/markets/revenue-allocation-donut';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanies, type CompanyEntry } from '@/lib/hooks/use-companies';
import { METRIC_DEFINITIONS, type MetricKey } from '@/lib/markets/metric-definitions';
import { formatCurrency, formatMarketCap, formatRatioPercent, getExtras, yoy } from '@/lib/markets/selectors';
import { cn } from '@/lib/utils';

const detailSections = [
  { id: 'overview', label: 'Overview' },
  { id: 'financials', label: 'Financials' },
  { id: 'ratios', label: 'Ratios & Metrics' },
  { id: 'growth', label: 'Growth & Trends' },
  { id: 'risks', label: 'Risk Factors' },
  { id: 'analyst', label: 'Analyst' },
  { id: 'news', label: 'News' },
  { id: 'documents', label: 'Documents' },
  { id: 'peers', label: 'Peers' },
];

export function CompanyDetailPage({ symbol }: { symbol: string }) {
  const normalizedSymbol = symbol.toUpperCase();
  const { data, companyMap, loading, error } = useCompanies();
  const [activeSection, setActiveSection] = useState('overview');
  const companyData = companyMap[normalizedSymbol];
  const extras = getExtras(normalizedSymbol);
  const news = extras?.news ?? [];
  const sectionList = detailSections.filter((section) => section.id !== 'news' || news.length > 0);

  useEffect(() => {
    const nodes = sectionList.map(({ id }) => document.getElementById(id)).filter((node): node is HTMLElement => node !== null);
    if (!nodes.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, { rootMargin: '-96px 0px -65% 0px', threshold: [0, 0.1, 0.25, 0.5] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [companyData, news.length]);

  if (loading) return <CompanyDetailSkeleton />;
  if (error || !companyData) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Company data unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">We couldn’t load the company data for {normalizedSymbol}.</p>
        <Link href="/markets"><Button className="mt-5">Back to Markets</Button></Link>
      </div>
    );
  }

  const sectorPeers = (data ?? []).filter((entry) => entry.company.sector && entry.company.sector === companyData.company.sector && entry.company.symbol !== normalizedSymbol);

  return (
    <div className="space-y-5">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/markets" className="outline-none hover:text-primary-text hover:underline focus-visible:ring-2 focus-visible:ring-ring">Markets</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Company Details</span>
      </nav>

      <CompanyHeader companyData={companyData} />

      <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <DetailNavigation sections={sectionList} activeSection={activeSection} />
        <div className="min-w-0 space-y-6">
          <section id="overview" className="scroll-mt-24 space-y-4">
            <div className="grid min-w-0 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <FinancialTrendChart symbol={normalizedSymbol} companyData={companyData} />
              <KeyMetricsCard companyData={companyData} />
            </div>
            <div className="grid min-w-0 gap-4 xl:grid-cols-2">
              <CompanyProfileCard companyData={companyData} />
              <FinancialsCard symbol={normalizedSymbol} companyData={companyData} />
            </div>
            <div className="grid min-w-0 gap-4 xl:grid-cols-2">
              <RevenueAllocationDonut symbol={normalizedSymbol} companyData={companyData} />
              <section id="analyst" className="scroll-mt-24">
                <AnalystSummaryCard symbol={normalizedSymbol} />
              </section>
            </div>
          </section>

          <FinancialTable symbol={normalizedSymbol} />
          <RatiosSection fundamentals={companyData.fundamentals ?? null} />
          <GrowthSection companyData={companyData} allCompanies={data ?? []} />
          <RiskSection riskFactors={companyData.mock10k?.risk_factors} />
          {news.length > 0 && <NewsSection symbol={normalizedSymbol} snapshotDate={extras?.snapshotDate ?? ''} news={news} />}
          <DocumentsSection extras={extras} />
          <PeersSection companyData={companyData} peers={sectorPeers} />
          <AiFundManagerCta companyData={companyData} />
        </div>
      </div>
    </div>
  );
}

function DetailNavigation({ sections, activeSection }: { sections: typeof detailSections; activeSection: string }) {
  const mobileChips = (
    <nav aria-label="Company sections" className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
      {sections.map(({ id, label }) => <SectionLink key={id} id={id} label={label} active={activeSection === id} mobile />)}
    </nav>
  );
  return (
    <>
      {mobileChips}
      <nav aria-label="Company sections" className="sticky top-20 hidden rounded-xl border border-border bg-card p-2 shadow-sm lg:block">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</p>
        <div className="space-y-1">
          {sections.map(({ id, label }) => <SectionLink key={id} id={id} label={label} active={activeSection === id} />)}
        </div>
      </nav>
    </>
  );
}

function SectionLink({ id, label, active, mobile = false }: { id: string; label: string; active: boolean; mobile?: boolean }) {
  return (
    <a href={`#${id}`} aria-current={active ? 'location' : undefined} className={cn('block whitespace-nowrap rounded-lg px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring', active ? 'bg-accent-bg font-semibold text-accent-text' : 'text-muted-foreground hover:bg-muted-bg hover:text-foreground', mobile && 'border border-border bg-card')}>
      {label}
    </a>
  );
}

function FinancialTable({ symbol }: { symbol: string }) {
  const annual = getExtras(symbol)?.annual ?? [];
  const rows: Array<{ label: string; key: keyof NonNullable<ReturnType<typeof getExtras>>['annual'][number]; money: boolean }> = [
    { label: 'Revenue', key: 'revenue', money: true },
    { label: 'Operating Income', key: 'operatingIncome', money: true },
    { label: 'Net Income', key: 'netIncome', money: true },
    { label: 'Operating Cash Flow', key: 'operatingCashFlow', money: true },
    { label: 'Total Assets', key: 'totalAssets', money: true },
    { label: 'Equity', key: 'equity', money: true },
    { label: 'Cash', key: 'cash', money: true },
    { label: 'Long-term Debt', key: 'longTermDebt', money: true },
  ];
  const latest = annual.at(-1);
  const previous = annual.at(-2);

  return (
    <section id="financials" className="scroll-mt-24">
      <Card className="overflow-hidden shadow-sm">
        <CardHeader><CardTitle className="font-display text-xl">Annual Financials</CardTitle><p className="text-sm text-muted-foreground">Reported fiscal-year values from available 10-K records.</p></CardHeader>
        <CardContent>
          {annual.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="py-3 pr-4">Metric</th>{annual.map((year) => <th key={year.fiscalYear} className="px-3 py-3 text-right">FY{year.fiscalYear}</th>)}<th className="py-3 pl-3 text-right">Latest YoY</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {rows.map(({ label, key, money }) => {
                    const latestValue = latest?.[key] ?? null;
                    const previousValue = previous?.[key] ?? null;
                    const change = yoy(latestValue, previousValue);
                    return (
                      <tr key={key}>
                        <th scope="row" className="whitespace-nowrap py-3 pr-4 text-left font-medium text-foreground">{label}</th>
                        {annual.map((report) => <td key={report.fiscalYear} className="px-3 py-3 text-right text-foreground num">{formatAnnualValue(report[key], money)}</td>)}
                        <td className="whitespace-nowrap py-3 pl-3 text-right"><ChangeText value={change} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Annual financials not available for this company.</p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">Source: SEC 10-K filings.</p>
        </CardContent>
      </Card>
    </section>
  );
}

function RatiosSection({ fundamentals }: { fundamentals: CompanyEntry['fundamentals'] | null }) {
  const groups: Array<{ title: string; metrics: Array<{ key: MetricKey; label: string; value: number | null | undefined; suffix?: string }> }> = [
    { title: 'Valuation', metrics: [
      { key: 'pe_ratio', label: 'P/E', value: fundamentals?.pe_ratio, suffix: 'x' },
      { key: 'forward_pe', label: 'Forward P/E', value: fundamentals?.forward_pe, suffix: 'x' },
      { key: 'pb_ratio', label: 'P/B', value: fundamentals?.pb_ratio, suffix: 'x' },
      { key: 'ps_ratio', label: 'P/S', value: fundamentals?.ps_ratio, suffix: 'x' },
      { key: 'peg_ratio', label: 'PEG', value: fundamentals?.peg_ratio, suffix: 'x' },
    ] },
    { title: 'Profitability', metrics: [
      { key: 'roe', label: 'ROE', value: fundamentals?.roe, suffix: '%' },
      { key: 'roa', label: 'ROA', value: fundamentals?.roa, suffix: '%' },
      { key: 'gross_margin', label: 'Gross Margin', value: fundamentals?.gross_margin, suffix: '%' },
      { key: 'operating_margin', label: 'Operating Margin', value: fundamentals?.operating_margin, suffix: '%' },
      { key: 'net_profit_margin', label: 'Net Margin', value: fundamentals?.net_profit_margin, suffix: '%' },
    ] },
    { title: 'Financial Health', metrics: [
      { key: 'debt_to_equity', label: 'Debt / Equity', value: fundamentals?.debt_to_equity, suffix: 'x' },
      { key: 'long_term_debt_to_equity', label: 'Long-term D/E', value: fundamentals?.long_term_debt_to_equity, suffix: 'x' },
      { key: 'current_ratio', label: 'Current Ratio', value: fundamentals?.current_ratio, suffix: 'x' },
      { key: 'quick_ratio', label: 'Quick Ratio', value: fundamentals?.quick_ratio, suffix: 'x' },
    ] },
    { title: 'Growth', metrics: [
      { key: 'eps_growth_yoy', label: 'EPS Growth (YoY)', value: fundamentals?.eps_growth_yoy, suffix: '%' },
      { key: 'revenue_growth_yoy', label: 'Revenue Growth (YoY)', value: fundamentals?.revenue_growth_yoy, suffix: '%' },
      { key: 'eps_growth_5y', label: 'EPS Growth (5Y)', value: fundamentals?.eps_growth_5y, suffix: '%' },
      { key: 'revenue_growth_5y', label: 'Revenue Growth (5Y)', value: fundamentals?.revenue_growth_5y, suffix: '%' },
      { key: 'beta', label: 'Beta', value: fundamentals?.beta, suffix: 'x' },
    ] },
  ];
  const rules: Record<string, string> = {
    Valuation: 'Compare multiples with peers and growth; a lower multiple alone does not establish value.',
    Profitability: 'Review returns and margins over time and relative to comparable businesses.',
    'Financial Health': 'Consider debt and liquidity together with cash flows and industry context.',
    Growth: 'Reported past growth is historical and does not guarantee future results.',
  };

  return (
    <section id="ratios" className="scroll-mt-24 space-y-4">
      <SectionHeading title="Ratios & Metrics" subtitle="Reported fundamentals with plain-language definitions." />
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <Card key={group.title} className="shadow-sm">
            <CardHeader className="p-5 pb-3"><CardTitle className="font-display text-lg">{group.title}</CardTitle><p className="text-xs leading-relaxed text-muted-foreground">{rules[group.title]}</p></CardHeader>
            <CardContent className="divide-y divide-border px-5 pb-4">
              {group.metrics.map(({ key, label, value, suffix }) => (
                <div key={key} className="flex items-center justify-between gap-3 py-3">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    {label}
                    <span title={METRIC_DEFINITIONS[key]} aria-label={`${label}: ${METRIC_DEFINITIONS[key]}`}>
                      <Info aria-hidden="true" className="h-3.5 w-3.5" />
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-foreground num">{value == null || !Number.isFinite(value) ? '—' : `${value.toFixed(2)}${suffix}`}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function GrowthSection({ companyData, allCompanies }: { companyData: CompanyEntry; allCompanies: CompanyEntry[] }) {
  const company = companyData.company;
  const fundamentals = companyData.fundamentals;
  const sectorPeers = allCompanies.filter((entry) => entry.company.symbol !== company.symbol && entry.company.sector === company.sector);
  const growthData = [
    { metric: 'Revenue YoY', key: 'revenue_growth_yoy' as const },
    { metric: 'Revenue 5Y', key: 'revenue_growth_5y' as const },
    { metric: 'EPS YoY', key: 'eps_growth_yoy' as const },
    { metric: 'EPS 5Y', key: 'eps_growth_5y' as const },
  ].map(({ metric, key }) => {
    const peerValues = sectorPeers.map((entry) => entry.fundamentals?.[key]).filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
    const sectorAverage = peerValues.length ? peerValues.reduce((sum, value) => sum + value, 0) / peerValues.length : null;
    return { metric, company: fundamentals?.[key] ?? null, sectorAverage };
  }).filter((entry) => entry.company !== null || entry.sectorAverage !== null);

  return (
    <section id="growth" className="scroll-mt-24">
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="font-display text-xl">Growth & Trends</CardTitle><p className="text-sm text-muted-foreground">Company growth compared with available companies in {company.sector || 'the same sector'}.</p></CardHeader>
        <CardContent>
          {growthData.length ? (
            <div className="h-[280px] w-full" role="img" aria-label={`Revenue and earnings growth compared with ${company.sector || 'sector'} average`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="metric" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <YAxis tickFormatter={(value: number) => `${value}%`} tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, '']} contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 10, color: 'var(--foreground)' }} />
                  <Bar dataKey="company" name={company.symbol} fill="var(--chart-1)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="sectorAverage" name={`${company.sector || 'Sector'} average`} fill="var(--chart-2)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="py-8 text-center text-sm text-muted-foreground">Growth metrics are not available for comparison.</p>}
          {sectorPeers.length === 0 && <p className="mt-2 text-xs text-muted-foreground">No other companies in this sector are available for comparison.</p>}
        </CardContent>
      </Card>
    </section>
  );
}

function RiskSection({ riskFactors }: { riskFactors?: string | null }) {
  const paragraphs = riskFactors?.split(/(?<=[.!?])\s+/).map((text) => text.trim()).filter(Boolean) ?? [];
  return (
    <section id="risks" className="scroll-mt-24">
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="font-display text-xl">Risk Factors</CardTitle><p className="text-sm text-muted-foreground">Company risk information available in the provided filing narrative.</p></CardHeader>
        <CardContent>
          {paragraphs.length ? (
            <ul className="max-w-[70ch] list-disc space-y-3 pl-5 text-sm leading-relaxed text-foreground marker:text-warning">
              {paragraphs.map((paragraph, index) => <li key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</li>)}
            </ul>
          ) : <p className="text-sm text-muted-foreground">Risk factors are not available for this company.</p>}
        </CardContent>
      </Card>
    </section>
  );
}

function NewsSection({ symbol, snapshotDate, news }: { symbol: string; snapshotDate: string; news: NonNullable<ReturnType<typeof getExtras>>['news'] }) {
  return (
    <section id="news" className="scroll-mt-24">
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="font-display text-xl">News</CardTitle><p className="text-sm text-muted-foreground">Headlines associated with {symbol} in the available snapshot.</p></CardHeader>
        <CardContent className="space-y-1">
          {news.slice(0, 5).map((item) => (
            <a key={`${item.datetime}-${item.url}`} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-4 rounded-lg p-3 outline-none hover:bg-muted-bg focus-visible:ring-2 focus-visible:ring-ring">
              <span className="min-w-0"><span className="block text-sm font-medium text-foreground">{item.headline}</span><span className="mt-1 block text-xs text-muted-foreground">{item.source} · {formatNewsDate(item.datetime)}</span></span>
              <span aria-hidden="true" className="text-primary-text">↗</span>
            </a>
          ))}
          <p className="pt-3 text-xs text-muted-foreground">Headlines as of {snapshotDate ? formatDate(snapshotDate) : 'Snapshot data'}.</p>
        </CardContent>
      </Card>
    </section>
  );
}

function DocumentsSection({ extras }: { extras: ReturnType<typeof getExtras> }) {
  const filing = extras?.latest10K;
  return (
    <section id="documents" className="scroll-mt-24">
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="font-display text-xl">Documents</CardTitle></CardHeader>
        <CardContent>
          {filing ? (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted-bg p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3"><FileText aria-hidden="true" className="mt-0.5 h-5 w-5 text-primary-text" /><div><p className="font-medium text-foreground">Latest 10-K</p><p className="mt-1 text-xs text-muted-foreground">Filed {formatDate(filing.filedDate)}</p></div></div>
              <div className="flex flex-wrap gap-2"><a href={filing.reportUrl} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-background">View on SEC.gov</a><a href={filing.filingUrl} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-background">Filing index</a></div>
            </div>
          ) : <p className="text-sm text-muted-foreground">10-K document links are not available for this company.</p>}
        </CardContent>
      </Card>
    </section>
  );
}

function PeersSection({ companyData, peers }: { companyData: CompanyEntry; peers: CompanyEntry[] }) {
  const columns = [
    { label: 'P/E', key: 'pe_ratio' as const, lowerIsBetter: true },
    { label: 'Operating Margin', key: 'operating_margin' as const, lowerIsBetter: false },
    { label: 'ROE', key: 'roe' as const, lowerIsBetter: false },
    { label: 'Revenue Growth', key: 'revenue_growth_yoy' as const, lowerIsBetter: false },
  ];
  const allRows = [companyData, ...peers];
  const best = Object.fromEntries(columns.map(({ key, lowerIsBetter }) => {
    const values = allRows.map((entry) => entry.fundamentals?.[key]).filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
    return [key, values.length ? (lowerIsBetter ? Math.min(...values) : Math.max(...values)) : null];
  })) as Record<(typeof columns)[number]['key'], number | null>;
  const marketCapInDollars = (entry: CompanyEntry) => {
    const value = entry.company.market_cap ?? entry.fundamentals?.market_cap;
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    return value > 0 && value < 1_000_000_000 ? value * 1_000_000 : value;
  };
  const peerAndCompanyCaps = allRows.map(marketCapInDollars).filter((value): value is number => value !== null);
  const bestMarketCap = peerAndCompanyCaps.length ? Math.max(...peerAndCompanyCaps) : null;

  return (
    <section id="peers" className="scroll-mt-24">
      <Card className="overflow-hidden shadow-sm">
        <CardHeader><CardTitle className="font-display text-xl">Peers</CardTitle><p className="text-sm text-muted-foreground">Available companies in {companyData.company.sector || 'the same sector'}.</p></CardHeader>
        <CardContent>
          {peers.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="py-3 pr-3">Company</th>{columns.map((column) => <th key={column.key} className="px-3 py-3 text-right">{column.label}</th>)}<th className="py-3 pl-3 text-right">Market Cap</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {peers.map((entry) => (
                    <tr key={entry.company.symbol} className="hover:bg-muted-bg">
                      <th scope="row" className="py-3 pr-3 text-left"><Link href={`/markets/${encodeURIComponent(entry.company.symbol)}`} className="font-semibold text-primary-text hover:underline">{entry.company.symbol} · {entry.company.name}</Link></th>
                      {columns.map((column) => {
                        const value = entry.fundamentals?.[column.key] ?? null;
                        const isBest = value !== null && value === best[column.key];
                        return <td key={column.key} className={cn('px-3 py-3 text-right num', isBest ? 'font-bold text-foreground' : 'text-muted-foreground')}>{value === null ? '—' : column.key.includes('margin') || column.key.includes('growth') || column.key === 'roe' ? formatRatioPercent(value, 1) : `${value.toFixed(2)}x`}</td>;
                      })}
                      <td className={cn('py-3 pl-3 text-right num', marketCapInDollars(entry) !== null && marketCapInDollars(entry) === bestMarketCap ? 'font-bold text-foreground' : 'text-muted-foreground')}>{formatMarketCap(entry.company.market_cap ?? entry.fundamentals?.market_cap)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-muted-foreground">No other companies in this sector are available for comparison.</p>}
        </CardContent>
      </Card>
    </section>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div><h2 className="font-display text-xl font-bold text-foreground">{title}</h2>{subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}</div>;
}

function ChangeText({ value }: { value: number | null }) {
  if (value === null || !Number.isFinite(value)) return <span className="text-xs text-muted-foreground">—</span>;
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return <span className={cn('inline-flex items-center gap-1 text-xs font-medium num', positive ? 'text-success' : 'text-danger')}><Icon aria-hidden="true" className="h-3.5 w-3.5" />{positive ? '+' : ''}{value.toFixed(1)}%</span>;
}

function formatAnnualValue(value: number | null, _money: boolean) {
  if (value === null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function formatNewsDate(value: number) {
  const date = new Date(value * 1000);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function CompanyDetailSkeleton() {
  return <div className="space-y-5" aria-label="Loading company detail"><div className="h-48 animate-pulse rounded-2xl bg-muted-bg" /><div className="grid gap-4 md:grid-cols-2"><div className="h-72 animate-pulse rounded-xl bg-muted-bg" /><div className="h-72 animate-pulse rounded-xl bg-muted-bg" /></div></div>;
}
