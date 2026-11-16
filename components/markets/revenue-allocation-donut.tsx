'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompanyEntry } from '@/lib/hooks/use-companies';
import { formatCurrency, getExtras, latestAnnual, revenueAllocation } from '@/lib/markets/selectors';

const sliceColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'];

export function RevenueAllocationDonut({ symbol, compact = false }: { symbol: string; companyData?: CompanyEntry | null; compact?: boolean }) {
  const extras = getExtras(symbol);
  const annual = latestAnnual(symbol);
  const slices = revenueAllocation(annual);
  const canChart = slices.length > 1 && slices.every((slice) => slice.value >= 0) && slices.some((slice) => slice.value > 0);
  const totalRevenue = annual?.revenue ?? null;

  return (
    <Card className="min-w-0 shadow-sm">
      <CardHeader className={compact ? 'p-4 pb-3' : 'p-5 pb-3 sm:p-6 sm:pb-3'}>
        <CardTitle className="font-display text-lg">Where each $1 of revenue goes</CardTitle>
        <p className="text-xs text-muted-foreground">{annual ? `FY${annual.fiscalYear} · ${symbol}` : 'Annual financials unavailable'}</p>
      </CardHeader>
      <CardContent className={compact ? 'px-4 pb-4' : 'px-5 pb-5 sm:px-6 sm:pb-6'}>
        {canChart && totalRevenue !== null ? (
          <>
            <div className="relative mx-auto h-[190px] w-full max-w-[240px]" role="img" aria-label={`Revenue allocation for ${symbol}, fiscal year ${annual?.fiscalYear}`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={slices} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={2} stroke="var(--card)" strokeWidth={2} isAnimationActive={false}>
                    {slices.map((slice, index) => <Cell key={slice.name} fill={sliceColors[index % sliceColors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 10, color: 'var(--foreground)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="max-w-[120px] truncate text-sm font-bold text-foreground num">{formatCompactRevenue(totalRevenue)}</span>
                <span className="mt-0.5 text-[10px] text-muted-foreground">Total Revenue</span>
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {slices.map((slice, index) => {
                const percent = totalRevenue ? (slice.value / totalRevenue) * 100 : null;
                return (
                  <li key={slice.name} className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: sliceColors[index % sliceColors.length] }} />
                      <span className="truncate">{slice.name}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-foreground num">{percent === null ? '—' : `${percent.toFixed(1)}%`}</span>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {extras?.annual.length ? 'Revenue allocation unavailable from the reported values.' : 'Annual financials not available for this company.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function formatCompactRevenue(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value);
}
