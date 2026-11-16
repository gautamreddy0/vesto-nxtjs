import { Info } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { consensus, getExtras } from '@/lib/markets/selectors';

export function AnalystSummaryCard({ symbol, compact = false }: { symbol: string; compact?: boolean }) {
  const recommendations = getExtras(symbol)?.recommendations;
  const summary = consensus(recommendations);
  if (!recommendations || !summary) return null;

  const consensusVariant = summary.label.includes('Buy') ? 'success' : summary.label === 'Hold' ? 'neutral' : 'danger';
  const period = formatPeriod(recommendations.period);

  return (
    <Card className="min-w-0 shadow-sm">
      <CardHeader className={compact ? 'p-4 pb-3' : 'p-5 pb-3 sm:p-6 sm:pb-3'}>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          Analyst Summary
          <span title={`Wall Street analyst recommendations as of ${period}`} aria-label={`Wall Street analyst recommendations as of ${period}`}>
            <Info aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? 'space-y-4 px-4 pb-4' : 'space-y-4 px-5 pb-5 sm:px-6 sm:pb-6'}>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border bg-muted-bg p-2.5">
            <span className="block text-[10px] text-muted-foreground">Consensus</span>
            <Badge variant={consensusVariant} className="mt-1 px-2">{summary.label}</Badge>
          </div>
          <div className="rounded-lg border border-border bg-muted-bg p-2.5">
            <span className="block text-[10px] text-muted-foreground">Coverage</span>
            <span className="mt-1 block text-sm font-semibold text-foreground num">{summary.analystCount} analysts</span>
          </div>
          <div className="rounded-lg border border-border bg-muted-bg p-2.5">
            <span className="block text-[10px] text-muted-foreground">Period</span>
            <span className="mt-1 block truncate text-sm font-semibold text-foreground">{period}</span>
          </div>
        </div>

        <div aria-label={`Recommendations: ${summary.buyPercent.toFixed(0)} percent Buy, ${summary.holdPercent.toFixed(0)} percent Hold, ${summary.sellPercent.toFixed(0)} percent Sell`}>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-muted-bg">
            {summary.buyPercent > 0 && <span className="bg-success" style={{ width: `${summary.buyPercent}%` }} />}
            {summary.holdPercent > 0 && <span className="bg-muted-foreground/50" style={{ width: `${summary.holdPercent}%` }} />}
            {summary.sellPercent > 0 && <span className="bg-danger" style={{ width: `${summary.sellPercent}%` }} />}
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px]">
            <span className="text-success">Buy {summary.buyPercent.toFixed(0)}%</span>
            <span className="text-muted-foreground">Hold {summary.holdPercent.toFixed(0)}%</span>
            <span className="text-danger">Sell {summary.sellPercent.toFixed(0)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatPeriod(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' }).format(date);
}
