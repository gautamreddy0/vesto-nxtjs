'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  CircleDollarSign,
  Ellipsis,
  Layers3,
  ListFilter,
  ShieldAlert,
  TableProperties,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TradeDialog } from '@/components/portfolio/trade-dialog';
import type { CompanyEntry } from '@/lib/hooks/use-companies';
import type { PortfolioHolding, PortfolioOrder, PortfolioSummary, PortfolioTab } from '@/types/portfolio';
import { formatCurrency, formatDate } from '@/lib/utils/format';

interface PortfolioDetailsProps {
  summary: PortfolioSummary;
  companies: CompanyEntry[];
  onBuy: (symbol: string, order: PortfolioOrder) => Promise<PortfolioSummary>;
  onSell: (symbol: string, shares: number) => Promise<PortfolioSummary>;
}

type SortKey = 'symbol' | 'shares' | 'avgCost' | 'price' | 'marketValue' | 'pl' | 'plPct' | 'weight';
type SortDirection = 'asc' | 'desc';

export function PortfolioDetails({ summary, companies, onBuy, onSell }: PortfolioDetailsProps) {
  const [activeTab, setActiveTab] = useState<PortfolioTab>('holdings');
  const [sortKey, setSortKey] = useState<SortKey>('marketValue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [tradeSymbol, setTradeSymbol] = useState<string | undefined>();

  const companyMap = useMemo(() => new Map(companies.map((entry) => [entry.company.symbol.toUpperCase(), entry] as const)), [companies]);
  const sortedHoldings = useMemo(() => [...summary.holdings].sort((a, b) => {
    const left = getSortValue(a, sortKey);
    const right = getSortValue(b, sortKey);
    const comparison = typeof left === 'string' && typeof right === 'string' ? left.localeCompare(right) : Number(left) - Number(right);
    return sortDirection === 'asc' ? comparison : -comparison;
  }), [summary.holdings, sortKey, sortDirection]);

  const openTrade = (mode: 'buy' | 'sell', symbol?: string) => {
    setTradeMode(mode);
    setTradeSymbol(symbol);
    setTradeOpen(true);
  };
  const changeSort = (nextKey: SortKey) => {
    if (sortKey === nextKey) setSortDirection((current) => current === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(nextKey);
      setSortDirection('desc');
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PortfolioTab)} className="min-w-0">
      <Card className="min-w-0 shadow-sm">
        <CardHeader className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="font-display text-lg">Portfolio details</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Holdings, transactions and portfolio risk</p>
            </div>
            <Button type="button" onClick={() => openTrade('buy')} className="gap-1.5">
              <CircleDollarSign aria-hidden="true" className="h-4 w-4" />+ Add Position
            </Button>
          </div>
          <TabsList aria-label="Portfolio detail sections" className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg bg-muted-bg p-1">
            <TabsTrigger value="holdings" className="gap-1.5 px-3 py-2 text-xs sm:text-sm"><TableProperties aria-hidden="true" className="h-4 w-4" />Holdings ({summary.holdings.length})</TabsTrigger>
            <TabsTrigger value="performance" className="gap-1.5 px-3 py-2 text-xs sm:text-sm"><ChartNoAxesColumnIncreasing aria-hidden="true" className="h-4 w-4" />Performance</TabsTrigger>
            <TabsTrigger value="transactions" className="gap-1.5 px-3 py-2 text-xs sm:text-sm"><ArrowDownUp aria-hidden="true" className="h-4 w-4" />Transactions</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 px-3 py-2 text-xs sm:text-sm"><ShieldAlert aria-hidden="true" className="h-4 w-4" />Risk & Analytics</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="px-3 pb-4 sm:px-5 sm:pb-5">
          <TabsContent value="holdings" className="mt-0">
            <div className="mb-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{summary.holdings.length} {summary.holdings.length === 1 ? 'position' : 'positions'} · sorted by {sortKey === 'symbol' ? 'company' : sortKey}</span>
              <span className="inline-flex items-center gap-1"><ListFilter aria-hidden="true" className="h-3.5 w-3.5" />Sortable</span>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table className="min-w-[1120px]">
                <TableHeader className="bg-muted-bg/70">
                  <TableRow>
                    <SortableHead label="Company" sortKey="symbol" activeKey={sortKey} direction={sortDirection} onSort={changeSort} align="left" />
                    <SortableHead label="Shares" sortKey="shares" activeKey={sortKey} direction={sortDirection} onSort={changeSort} />
                    <SortableHead label="Avg. Cost" sortKey="avgCost" activeKey={sortKey} direction={sortDirection} onSort={changeSort} />
                    <SortableHead label="Current Price" sortKey="price" activeKey={sortKey} direction={sortDirection} onSort={changeSort} />
                    <SortableHead label="Market Value" sortKey="marketValue" activeKey={sortKey} direction={sortDirection} onSort={changeSort} />
                    <SortableHead label="P/L $" sortKey="pl" activeKey={sortKey} direction={sortDirection} onSort={changeSort} />
                    <SortableHead label="P/L %" sortKey="plPct" activeKey={sortKey} direction={sortDirection} onSort={changeSort} />
                    <SortableHead label="Weight" sortKey="weight" activeKey={sortKey} direction={sortDirection} onSort={changeSort} />
                    <TableHead scope="col" className="w-12 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedHoldings.map((holding) => {
                    const companyName = companyMap.get(holding.symbol.toUpperCase())?.company.name ?? holding.name;
                    const approved = summary.approvedSymbols.includes(holding.symbol.toUpperCase());
                    return (
                      <TableRow key={holding.symbol}>
                        <TableCell className="min-w-[220px] px-3 py-3">
                          <Link href={`/markets/${holding.symbol}`} className="group flex items-center gap-2.5 rounded outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-bg text-xs font-bold text-accent-text">{holding.symbol.slice(0, 2)}</span>
                            <span className="min-w-0"><span className="block font-semibold text-foreground group-hover:text-primary-text">{holding.symbol}</span><span className="block max-w-[170px] truncate text-xs text-muted-foreground">{companyName}</span></span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-right num">{formatQuantity(holding.shares)}</TableCell>
                        <TableCell className="text-right num">{formatCurrency(holding.avgCost)}</TableCell>
                        <TableCell className="text-right num">{formatCurrency(holding.price)}</TableCell>
                        <TableCell className="text-right font-semibold text-foreground num">{formatCurrency(holding.marketValue)}</TableCell>
                        <TableCell className={`text-right font-semibold num ${holding.pl >= 0 ? 'text-success' : 'text-danger'}`}>{formatSignedCurrency(holding.pl)}</TableCell>
                        <TableCell className={`text-right font-semibold num ${holding.plPct >= 0 ? 'text-success' : 'text-danger'}`}>{formatSignedPercent(holding.plPct)}</TableCell>
                        <TableCell className="text-right num">{holding.weight.toFixed(2)}%</TableCell>
                        <TableCell className="px-3 text-right">
                          <details className="group relative inline-block text-left">
                            <summary aria-label={`Actions for ${holding.symbol}`} className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted-bg focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                              <Ellipsis aria-hidden="true" className="h-4 w-4" />
                            </summary>
                            <div className="absolute right-0 z-20 mt-1 min-w-40 rounded-lg border border-border bg-card p-1 shadow-lg">
                              {approved ? <button type="button" onClick={() => openTrade('buy', holding.symbol)} className="block w-full rounded px-2.5 py-2 text-left text-xs hover:bg-muted-bg">Buy more</button> : <Link href={`/fund-manager?symbol=${encodeURIComponent(holding.symbol)}`} className="block rounded px-2.5 py-2 text-xs text-primary-text hover:bg-muted-bg">Pitch to unlock</Link>}
                              <button type="button" onClick={() => openTrade('sell', holding.symbol)} className="block w-full rounded px-2.5 py-2 text-left text-xs hover:bg-muted-bg">Sell</button>
                              <Link href={`/markets/${holding.symbol}`} className="block rounded px-2.5 py-2 text-xs hover:bg-muted-bg">View company</Link>
                            </div>
                          </details>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-0">
            <HoldingPerformance holdings={summary.holdings} />
          </TabsContent>

          <TabsContent value="transactions" className="mt-0">
            <TransactionsTable summary={summary} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <RiskAnalytics summary={summary} companyMap={companyMap} />
          </TabsContent>
        </CardContent>
      </Card>

      <TradeDialog
        open={tradeOpen}
        onOpenChange={setTradeOpen}
        initialMode={tradeMode}
        initialSymbol={tradeSymbol}
        summary={summary}
        companies={companies}
        onBuy={onBuy}
        onSell={onSell}
      />
    </Tabs>
  );
}

function SortableHead({ label, sortKey, activeKey, direction, onSort, align = 'right' }: { label: string; sortKey: SortKey; activeKey: SortKey; direction: SortDirection; onSort: (key: SortKey) => void; align?: 'left' | 'right' }) {
  const active = sortKey === activeKey;
  const Icon = active ? (direction === 'asc' ? ArrowUp : ArrowDown) : ChevronDown;
  return (
    <TableHead scope="col" className={`whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button type="button" onClick={() => onSort(sortKey)} aria-label={`Sort by ${label}${active ? `, currently ${direction === 'asc' ? 'ascending' : 'descending'}` : ''}`} className={`inline-flex items-center gap-1 rounded outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        {label}<Icon aria-hidden="true" className={`h-3.5 w-3.5 ${active ? 'opacity-100' : 'opacity-30'}`} />
      </button>
    </TableHead>
  );
}

function HoldingPerformance({ holdings }: { holdings: PortfolioHolding[] }) {
  const sorted = [...holdings].sort((a, b) => b.plPct - a.plPct);
  const maxMagnitude = Math.max(1, ...sorted.map((holding) => Math.abs(holding.plPct)));
  return (
    <div className="space-y-4" aria-label="Holdings performance by profit or loss percentage">
      {sorted.map((holding) => {
        const width = Math.max(1.5, (Math.abs(holding.plPct) / maxMagnitude) * 50);
        const positive = holding.plPct >= 0;
        return (
          <div key={holding.symbol} className="grid grid-cols-[76px_minmax(0,1fr)_90px] items-center gap-3 sm:grid-cols-[110px_minmax(0,1fr)_110px]">
            <Link href={`/markets/${holding.symbol}`} className="truncate text-sm font-semibold text-primary-text hover:underline">{holding.symbol}</Link>
            <div className="relative h-3 rounded-full bg-muted-bg" aria-label={`${holding.symbol} ${formatSignedPercent(holding.plPct)}`}>
              <span className="absolute inset-y-0 left-1/2 w-px bg-border" />
              <span className={`absolute inset-y-0 rounded-full ${positive ? 'bg-success' : 'bg-danger'}`} style={positive ? { left: '50%', width: `${width}%` } : { right: '50%', width: `${width}%` }} />
            </div>
            <span className={`text-right text-sm font-semibold num ${positive ? 'text-success' : 'text-danger'}`}>{formatSignedPercent(holding.plPct)}</span>
          </div>
        );
      })}
    </div>
  );
}

function TransactionsTable({ summary }: { summary: PortfolioSummary }) {
  if (summary.transactions.length === 0) return <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">No transactions yet.</p>;
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table className="min-w-[760px]">
        <TableHeader className="bg-muted-bg/70"><TableRow>
          <TableHead scope="col">Date</TableHead><TableHead scope="col">Side</TableHead><TableHead scope="col">Company</TableHead><TableHead scope="col" className="text-right">Shares</TableHead><TableHead scope="col" className="text-right">Price</TableHead><TableHead scope="col" className="text-right">Amount</TableHead><TableHead scope="col" className="text-right">Realized P/L</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {summary.transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(transaction.createdAt)}</TableCell>
              <TableCell><span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase ${transaction.side === 'buy' ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>{transaction.side}</span></TableCell>
              <TableCell><Link href={`/markets/${transaction.symbol}`} className="font-semibold text-primary-text hover:underline">{transaction.symbol}<span className="ml-1.5 text-xs font-normal text-muted-foreground">{transaction.companyName}</span></Link></TableCell>
              <TableCell className="text-right num">{formatQuantity(transaction.shares)}</TableCell>
              <TableCell className="text-right num">{formatCurrency(transaction.price)}</TableCell>
              <TableCell className="text-right num">{formatCurrency(transaction.amount)}</TableCell>
              <TableCell className={`text-right num ${transaction.side === 'sell' ? (transaction.realizedPL ?? 0) >= 0 ? 'text-success' : 'text-danger' : 'text-muted-foreground'}`}>{transaction.side === 'sell' && transaction.realizedPL !== null ? formatSignedCurrency(transaction.realizedPL) : '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RiskAnalytics({ summary, companyMap }: { summary: PortfolioSummary; companyMap: Map<string, CompanyEntry> }) {
  const largest = Math.max(0, ...summary.holdings.map((holding) => holding.weight));
  const sectors = new Set(summary.holdings.map((holding) => holding.sector).filter(Boolean));
  const weightedBeta = weightedMetric(summary.holdings, companyMap, 'beta');
  const weightedPE = weightedMetric(summary.holdings, companyMap, 'pe_ratio');
  const cashPercent = summary.totalValue > 0 ? (summary.cash / summary.totalValue) * 100 : 0;
  const note = largest > 40
    ? 'One position is over 40% of your portfolio. Consider whether this concentration matches your risk tolerance.'
    : sectors.size < 3
      ? 'Consider diversifying across more sectors.'
      : 'Your holdings span multiple sectors. Review position sizes and business risks regularly.';
  const metrics = [
    { label: 'Largest position', value: `${largest.toFixed(2)}%`, note: largest > 40 ? 'Concentration risk' : 'Within 40% guideline', alert: largest > 40 },
    { label: 'Number of holdings', value: String(summary.holdings.length), note: 'Open positions' },
    { label: 'Number of sectors', value: String(sectors.size), note: 'Distinct sectors' },
    { label: 'Weighted beta', value: weightedBeta === null ? '—' : `${weightedBeta.toFixed(2)}x`, note: 'Market sensitivity estimate' },
    { label: 'Weighted P/E', value: weightedPE === null ? '—' : `${weightedPE.toFixed(2)}x`, note: 'For holdings with reported P/E' },
    { label: 'Cash', value: `${cashPercent.toFixed(2)}%`, note: formatCurrency(summary.cash) },
    { label: 'Realized P/L', value: formatSignedCurrency(summary.realizedPL), note: 'From completed sells', alert: summary.realizedPL < 0 },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className={`rounded-lg border p-4 ${metric.alert ? 'border-warning/30 bg-warning-bg/60' : 'border-border bg-card'}`}>
            <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
            <p className={`mt-1 font-display text-xl font-bold num ${metric.label === 'Realized P/L' ? summary.realizedPL >= 0 ? 'text-success' : 'text-danger' : 'text-foreground'}`}>{metric.value}</p>
            <p className={`mt-1 text-xs ${metric.alert ? 'font-semibold text-warning' : 'text-muted-foreground'}`}>{metric.note}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-accent/20 bg-accent-bg/50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Layers3 aria-hidden="true" className="h-4 w-4 text-accent-text" />Diversification</div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{note}</p>
      </div>
    </div>
  );
}

function weightedMetric(holdings: PortfolioHolding[], companyMap: Map<string, CompanyEntry>, key: 'beta' | 'pe_ratio') {
  let weightedTotal = 0;
  let weightTotal = 0;
  let hasBeta = false;
  for (const holding of holdings) {
    const rawValue = companyMap.get(holding.symbol.toUpperCase())?.fundamentals?.[key];
    const value = Number(rawValue);
    if (rawValue == null || !Number.isFinite(value) || holding.marketValue <= 0) continue;
    if (key === 'beta') {
      weightedTotal += value * (holding.weight / 100);
      hasBeta = true;
    } else {
      weightedTotal += value * holding.marketValue;
      weightTotal += holding.marketValue;
    }
  }
  if (key === 'beta') return hasBeta ? weightedTotal : null;
  return weightTotal > 0 ? weightedTotal / weightTotal : null;
}

function getSortValue(holding: PortfolioHolding, key: SortKey): string | number {
  return key === 'symbol' ? holding.symbol : holding[key];
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

function formatSignedCurrency(value: number) {
  return `${value >= 0 ? '+' : '−'}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPercent(value: number) {
  return `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(2)}%`;
}
