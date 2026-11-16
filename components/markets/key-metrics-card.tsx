import { Info } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompanyEntry } from '@/lib/hooks/use-companies';
import { METRIC_DEFINITIONS, type MetricKey } from '@/lib/markets/metric-definitions';
import { formatRatioPercent } from '@/lib/markets/selectors';

interface KeyMetricsCardProps {
  companyData?: CompanyEntry | null;
  compact?: boolean;
}

export function KeyMetricsCard({ companyData, compact = false }: KeyMetricsCardProps) {
  const fundamentals = companyData?.fundamentals;
  const items: Array<{ label: string; key: MetricKey; value: number | null | undefined; suffix?: string }> = [
    { label: 'P/E', key: 'pe_ratio', value: fundamentals?.pe_ratio },
    { label: 'Forward P/E', key: 'forward_pe', value: fundamentals?.forward_pe },
    { label: 'ROE', key: 'roe', value: fundamentals?.roe, suffix: '%' },
    { label: 'D/E Ratio', key: 'debt_to_equity', value: fundamentals?.debt_to_equity },
    { label: 'EPS Growth (YoY)', key: 'eps_growth_yoy', value: fundamentals?.eps_growth_yoy, suffix: '%' },
    { label: 'Beta', key: 'beta', value: fundamentals?.beta },
  ];

  return (
    <Card className="min-w-0 shadow-sm">
      <CardHeader className={compact ? 'p-4 pb-3' : 'p-5 pb-3 sm:p-6 sm:pb-3'}>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          Key Metrics
          <Info aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? 'px-4 pb-4' : 'px-5 pb-5 sm:px-6 sm:pb-6'}>
        <dl className="grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-lg border border-border sm:grid-cols-3">
          {items.map(({ label, key, value, suffix }) => (
            <div key={key} className="min-w-0 p-3 sm:p-4">
              <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                {label}
                <button type="button" title={METRIC_DEFINITIONS[key]} aria-label={`${label}: ${METRIC_DEFINITIONS[key]}`} className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Info aria-hidden="true" className="h-3 w-3" />
                </button>
              </dt>
              <dd className="mt-2 text-sm font-semibold text-foreground num sm:text-base">
                {value == null || !Number.isFinite(value)
                  ? '—'
                  : suffix === '%'
                    ? formatRatioPercent(value, 1)
                    : `${value.toFixed(2)}${key === 'beta' || key === 'debt_to_equity' || key === 'pe_ratio' || key === 'forward_pe' ? 'x' : ''}`}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
