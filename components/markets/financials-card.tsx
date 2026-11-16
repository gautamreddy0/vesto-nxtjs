import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompanyEntry } from '@/lib/hooks/use-companies';
import { getExtras, yoy } from '@/lib/markets/selectors';

interface FinancialsCardProps {
  symbol: string;
  companyData?: CompanyEntry | null;
  compact?: boolean;
}

export function FinancialsCard({ symbol, companyData, compact = false }: FinancialsCardProps) {
  const annualReports = getExtras(symbol)?.annual ?? [];
  const latest = annualReports.at(-1);
  const previous = annualReports.at(-2);
  const operatingMargin = latest?.revenue && latest.operatingIncome !== null && latest.operatingIncome !== undefined
    ? (latest.operatingIncome / latest.revenue) * 100
    : null;
  const previousOperatingMargin = previous?.revenue && previous.operatingIncome !== null && previous.operatingIncome !== undefined
    ? (previous.operatingIncome / previous.revenue) * 100
    : null;

  const rows = [
    {
      label: 'Revenue',
      value: latest?.revenue ?? null,
      change: yoy(latest?.revenue, previous?.revenue),
      isMargin: false,
    },
    {
      label: 'Net Income',
      value: latest?.netIncome ?? null,
      change: yoy(latest?.netIncome, previous?.netIncome),
      isMargin: false,
    },
    {
      label: 'Operating Margin',
      value: operatingMargin,
      change: operatingMargin !== null && previousOperatingMargin !== null
        ? operatingMargin - previousOperatingMargin
        : null,
      isMargin: true,
    },
  ];

  return (
    <Card className="min-w-0 shadow-sm">
      <CardHeader className={compact ? 'p-4 pb-3' : 'p-5 pb-3 sm:p-6 sm:pb-3'}>
        <CardTitle className="font-display text-lg">Financials {latest ? `(FY${latest.fiscalYear})` : ''}</CardTitle>
      </CardHeader>
      <CardContent className={compact ? 'px-4 pb-4' : 'px-5 pb-5 sm:px-6 sm:pb-6'}>
        {latest ? (
          <div className="divide-y divide-border">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="text-right">
                  <span className="block text-sm font-semibold text-foreground num">
                    {row.value === null ? '—' : row.isMargin ? `${row.value.toFixed(1)}%` : formatFinancialAmount(row.value)}
                  </span>
                  <YoYChange value={row.change} suffix={row.isMargin ? ' pp' : '%'} />
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-2 text-sm text-muted-foreground">Annual financials not available for this company.</p>
        )}
        <Link href="#financials" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-text outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
          View detailed financials <span aria-hidden="true">→</span>
        </Link>
      </CardContent>
    </Card>
  );
}

function YoYChange({ value, suffix }: { value: number | null; suffix: string }) {
  if (value === null || !Number.isFinite(value)) {
    return <span className="mt-1 block text-xs text-muted-foreground">YoY —</span>;
  }
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`mt-1 inline-flex items-center justify-end gap-0.5 text-xs font-medium num ${positive ? 'text-success' : 'text-danger'}`}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {positive ? '+' : ''}{value.toFixed(1)}{suffix} YoY
    </span>
  );
}

function formatFinancialAmount(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: Math.abs(value) >= 1_000_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}
