'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Delta } from '@/components/ui/delta';
import type { CompanyEntry } from '@/lib/hooks/use-companies';
import { getExtras, rangePosition, yoy, type AnnualFinancial } from '@/lib/markets/selectors';
import { formatCurrency } from '@/lib/utils/format';

const trendTabs = [
  { key: 'revenue', label: 'Revenue', color: 'var(--chart-1)' },
  { key: 'netIncome', label: 'Net Income', color: 'var(--chart-2)' },
  { key: 'operatingCashFlow', label: 'Operating Cash Flow', color: 'var(--chart-3)' },
] as const;

type TrendKey = (typeof trendTabs)[number]['key'];

interface FinancialTrendChartProps {
  symbol: string;
  companyData?: CompanyEntry | null;
  compact?: boolean;
}

export function FinancialTrendChart({ symbol, companyData, compact = false }: FinancialTrendChartProps) {
  const [activeKey, setActiveKey] = useState<TrendKey>('revenue');
  const extras = getExtras(symbol);
  const activeTab = trendTabs.find((tab) => tab.key === activeKey) ?? trendTabs[0];
  const chartData = useMemo(() => (extras?.annual ?? [])
    .filter((annual) => annual[activeKey] !== null)
    .map((annual) => ({
      fiscalYear: annual.fiscalYear,
      amountBillions: (annual[activeKey] as number) / 1_000_000_000,
    })), [activeKey, extras]);
  const latest = extras?.annual.at(-1);
  const previous = extras?.annual.at(-2);
  const change = latest && previous ? yoy(latest[activeKey], previous[activeKey]) : null;
  const price = companyData?.quote?.current_price;
  const low = companyData?.fundamentals?.week_52_low;
  const high = companyData?.fundamentals?.week_52_high;
  const position = rangePosition(price, low, high);

  return (
    <Card className="min-w-0 shadow-sm">
      <CardHeader className={`space-y-3 ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="font-display text-lg">Financial Trend</CardTitle>
          {change !== null && <span className="text-xs text-muted-foreground">Latest fiscal-year change <Delta value={change} className="ml-1" /></span>}
        </div>
        <div role="tablist" aria-label="Annual financial trend metric" className="flex w-full gap-1 overflow-x-auto rounded-lg bg-muted-bg p-1">
          {trendTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeKey === tab.key}
              onClick={() => setActiveKey(tab.key)}
              className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3 ${activeKey === tab.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className={`${compact ? 'px-4 pb-4' : 'px-5 pb-5 sm:px-6 sm:pb-6'}`}>
        {chartData.length ? (
          <div role="img" aria-label={`${activeTab.label} by fiscal year for ${symbol}`}>
            <div className="h-[220px] w-full sm:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 16, right: 4, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="fiscalYear" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickFormatter={(value: number) => `$${value}B`} />
                  <Tooltip
                    cursor={{ fill: 'var(--muted-bg)', opacity: 0.6 }}
                    formatter={(value) => [formatCompactCurrency(Number(value) * 1_000_000_000), activeTab.label]}
                    labelFormatter={(label) => `FY${label}`}
                    contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 10, color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="amountBillions" fill={activeTab.color} radius={[5, 5, 0, 0]} maxBarSize={56} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-border px-4 text-center text-sm text-muted-foreground">
            Annual financials not available for this company
          </div>
        )}

        <WeekRange low={low} high={high} price={price} position={position} />
      </CardContent>
    </Card>
  );
}

function WeekRange({ low, high, price, position }: { low?: number | null; high?: number | null; price?: number | null; position: number }) {
  const valid = typeof low === 'number' && Number.isFinite(low) && typeof high === 'number' && Number.isFinite(high) && high > low;
  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">52-week range</span>
        <span className="text-muted-foreground">{valid && price != null ? `Current ${formatCurrency(price)}` : 'Range unavailable'}</span>
      </div>
      <div className="relative h-2 rounded-full bg-muted-bg">
        {valid && <span className="absolute inset-y-0 left-0 rounded-full bg-accent/35" />}
        {valid && price != null && (
          <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-accent" style={{ left: `${position * 100}%` }} />
        )}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground num">
        <span>{valid ? formatCurrency(low) : '—'}</span>
        <span>{valid ? formatCurrency(high) : '—'}</span>
      </div>
    </div>
  );
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export type { AnnualFinancial };
