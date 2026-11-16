'use client';

import { Info } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { INITIAL_PORTFOLIO_CASH } from '@/lib/portfolio/store';
import type { PortfolioAllocation, PortfolioSnapshot } from '@/types/portfolio';
import { formatCurrency } from '@/lib/utils/format';

const allocationColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
];
const cashColor = 'var(--muted-foreground)';

export type PortfolioTimeRange = '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y' | 'ALL';

const defaultTimeRanges: PortfolioTimeRange[] = ['1D', '1W', '1M', '3M', 'YTD', 'ALL'];

interface PortfolioChartsProps {
  snapshots: PortfolioSnapshot[];
  allocation: PortfolioAllocation[];
  totalValue: number;
  timeRange: PortfolioTimeRange;
  isSample: boolean;
  showAllocation?: boolean;
  rangeOptions?: PortfolioTimeRange[];
  onTimeRangeChange?: (range: PortfolioTimeRange) => void;
  rangeColor?: 'primary' | 'green';
}

export function PortfolioCharts({
  snapshots,
  allocation,
  totalValue,
  timeRange,
  isSample,
  showAllocation = true,
  rangeOptions,
  onTimeRangeChange,
  rangeColor = 'primary',
}: PortfolioChartsProps) {
  const chartSnapshots = filterSnapshots(snapshots, timeRange);
  const totalReturn = totalValue - INITIAL_PORTFOLIO_CASH;
  const totalReturnPercent = INITIAL_PORTFOLIO_CASH ? (totalReturn / INITIAL_PORTFOLIO_CASH) * 100 : 0;
  const hasChart = chartSnapshots.length >= 2;

  return (
    <section aria-label={showAllocation ? 'Portfolio performance and asset allocation' : 'Portfolio performance'} className={`grid min-w-0 gap-4 ${showAllocation ? 'xl:grid-cols-[minmax(0,1.85fr)_minmax(280px,1fr)]' : 'grid-cols-1'}`}>
      <Card className="min-w-0 shadow-sm">
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="font-display text-lg">Portfolio Performance</CardTitle>
              <span
                title="Total value (cash + holdings), recorded daily."
                aria-label="Total value (cash + holdings), recorded daily."
                className="inline-flex h-6 w-6 cursor-help items-center justify-center rounded-full text-muted-foreground hover:bg-muted-bg hover:text-foreground"
              >
                <Info aria-hidden="true" className="h-4 w-4" />
              </span>
              {isSample && <span className="rounded-full border border-warning/20 bg-warning-bg px-2 py-0.5 text-[10px] font-semibold text-warning">Sample data</span>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Recorded portfolio value over time</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {onTimeRangeChange && (
              <PortfolioTimeRangeControl
                snapshots={snapshots}
                value={timeRange}
                onChange={onTimeRangeChange}
                ranges={rangeOptions ?? defaultTimeRanges}
                color={rangeColor}
              />
            )}
            <div className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold num ${totalReturn >= 0 ? 'border-success/20 bg-success-bg text-success' : 'border-danger/20 bg-danger-bg text-danger'}`}>
              {formatCurrency(totalValue)} ({totalReturn >= 0 ? '+' : '−'}{Math.abs(totalReturnPercent).toFixed(2)}%)
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-4 sm:px-5 sm:pb-5">
          {hasChart ? (
            <div className="h-[250px] w-full sm:h-[290px]" role="img" aria-label={`Portfolio value chart with ${chartSnapshots.length} recorded daily snapshots, from ${formatDate(chartSnapshots[0].date)} to ${formatDate(chartSnapshots[chartSnapshots.length - 1].date)}. Current portfolio value ${formatCurrency(totalValue)}.`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartSnapshots} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="portfolio-performance-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    tickFormatter={(value: string) => formatShortDate(value)}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tickLine={false}
                    axisLine={false}
                    width={66}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    tickFormatter={(value: number) => formatCompactCurrency(value)}
                  />
                  <Tooltip
                    labelFormatter={(label) => formatDate(String(label))}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const point = payload[0].payload as PortfolioSnapshot;
                      return (
                        <div className="rounded-lg border border-border bg-card px-3 py-2.5 text-xs shadow-lg">
                          <p className="mb-2 font-semibold text-foreground">{formatDate(String(label))}</p>
                          <TooltipRow label="Total value" value={point.totalValue} strong />
                          <TooltipRow label="Invested" value={point.invested} />
                          <TooltipRow label="Cash" value={point.cash} />
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine y={INITIAL_PORTFOLIO_CASH} stroke="var(--muted-foreground)" strokeDasharray="5 5" strokeOpacity={0.8} />
                  <Area type="monotone" dataKey="totalValue" name="Total value" stroke="var(--chart-2)" strokeWidth={2.5} fill="url(#portfolio-performance-fill)" activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex min-h-[250px] flex-col items-center justify-center rounded-lg border border-dashed border-border px-5 text-center sm:min-h-[290px]">
              <span className="font-display text-2xl font-bold text-foreground num">{snapshots.length} / 2</span>
              <p className="mt-2 max-w-sm text-sm font-medium text-foreground">
                {snapshots.length < 2
                  ? 'Your performance chart will appear after your second day of investing'
                  : 'Not enough recorded snapshots in this range yet.'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{snapshots.length < 2 ? 'One daily snapshot is recorded per day you view or update your portfolio.' : 'Choose a wider time range to see more recorded history.'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showAllocation && <AssetAllocationCard allocation={allocation} totalValue={totalValue} />}
    </section>
  );
}

export function PortfolioTimeRangeControl({
  snapshots,
  value,
  onChange,
  ranges = defaultTimeRanges,
  color = 'primary',
}: {
  snapshots: PortfolioSnapshot[];
  value: PortfolioTimeRange;
  onChange: (range: PortfolioTimeRange) => void;
  ranges?: PortfolioTimeRange[];
  color?: 'primary' | 'green';
}) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-lg border border-border bg-card p-1" role="group" aria-label="Performance chart time range">
      {ranges.map((range) => {
        const available = rangeIsAvailable(range, snapshots.map((snapshot) => snapshot.date));
        const activeClass = color === 'green' ? 'bg-brand-green text-white' : 'bg-primary text-primary-foreground';
        return (
          <button
            key={range}
            type="button"
            aria-pressed={value === range}
            disabled={!available}
            title={available ? undefined : 'Not enough history yet'}
            onClick={() => onChange(range)}
            className={`min-w-9 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-10 sm:px-2.5 ${value === range ? `${activeClass} shadow-sm` : 'text-muted-foreground hover:bg-muted-bg hover:text-foreground'}`}
          >
            {range}
          </button>
        );
      })}
    </div>
  );
}

function AssetAllocationCard({ allocation, totalValue }: { allocation: PortfolioAllocation[]; totalValue: number }) {
  const slices = allocation.filter((item) => item.value > 0);
  const percentages = allocatePercentLabels(slices);

  return (
    <Card className="min-w-0 shadow-sm">
      <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
        <CardTitle className="font-display text-lg">Asset Allocation</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">By sector and available cash</p>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
        {slices.length > 0 ? (
          <>
            <div className="relative mx-auto h-[190px] w-full max-w-[230px]" role="img" aria-label={`Asset allocation totaling ${formatCurrency(totalValue)}: ${slices.map((slice, index) => `${slice.key} ${percentages[index]}`).join(', ')}.`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={slices} dataKey="value" nameKey="key" innerRadius="63%" outerRadius="88%" paddingAngle={2} stroke="var(--card)" strokeWidth={2} isAnimationActive={false}>
                    {slices.map((slice, index) => <Cell key={slice.key} fill={slice.key === 'Cash' ? cashColor : allocationColors[index % allocationColors.length]} />)}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
                    contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 10, color: 'var(--foreground)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="max-w-[140px] truncate font-display text-lg font-bold text-foreground num">{formatCompactCurrency(totalValue)}</span>
                <span className="mt-0.5 text-[10px] text-muted-foreground">Total Value</span>
              </div>
            </div>
            <ul className="mt-2 space-y-2">
              {slices.map((slice, index) => (
                <li key={slice.key} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: slice.key === 'Cash' ? cashColor : allocationColors[index % allocationColors.length] }} />
                    <span className="truncate">{slice.key}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-foreground num">{percentages[index]}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">Allocation will appear when portfolio values are available.</p>
        )}
      </CardContent>
    </Card>
  );
}

function TooltipRow({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`flex min-w-[150px] items-center justify-between gap-5 py-0.5 ${strong ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
      <span>{label}</span><span className="num">{formatCurrency(value)}</span>
    </div>
  );
}

function filterSnapshots(snapshots: PortfolioSnapshot[], range: PortfolioTimeRange) {
  const ordered = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  if (range === 'ALL' || ordered.length === 0) return ordered;
  const now = new Date();
  const threshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === 'YTD') threshold.setMonth(0, 1);
  else if (range === '1D') threshold.setDate(threshold.getDate() - 1);
  else threshold.setDate(threshold.getDate() - (range === '1W' ? 6 : range === '1M' ? 29 : range === '3M' ? 89 : 364));
  const thresholdKey = `${threshold.getFullYear()}-${String(threshold.getMonth() + 1).padStart(2, '0')}-${String(threshold.getDate()).padStart(2, '0')}`;
  return ordered.filter((snapshot) => snapshot.date >= thresholdKey);
}

function rangeIsAvailable(range: PortfolioTimeRange, dates: string[]) {
  if (dates.length === 0) return false;
  if (range === 'ALL' || range === '1D') return true;
  const oldest = new Date(`${[...dates].sort()[0]}T00:00:00`);
  const now = new Date();
  if (range === 'YTD') return oldest <= new Date(now.getFullYear(), 0, 1);
  const days = range === '1W' ? 6 : range === '1M' ? 29 : range === '3M' ? 89 : 364;
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  return oldest <= threshold;
}

function allocatePercentLabels(slices: PortfolioAllocation[]) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (total <= 0) return slices.map(() => '0.0%');
  const tenths = slices.map((slice) => (slice.value / total) * 1000);
  const floors = tenths.map(Math.floor);
  let remainder = 1000 - floors.reduce((sum, value) => sum + value, 0);
  const remainders = tenths.map((value, index) => ({ index, fraction: value - floors[index] }))
    .sort((a, b) => b.fraction - a.fraction);
  for (let index = 0; index < remainder; index += 1) floors[remainders[index % remainders.length].index] += 1;
  return floors.map((value) => `${(value / 10).toFixed(1)}%`);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value);
}
