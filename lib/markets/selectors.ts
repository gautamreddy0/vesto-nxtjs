import { COMPANY_EXTRAS, type CompanyExtras } from '@/lib/data/company-extras';

export type AnnualFinancial = CompanyExtras['annual'][number];

export interface RevenueAllocationSlice {
  name: 'Net income' | 'Taxes & other' | 'Operating costs' | 'Costs';
  value: number;
}

export interface AnalystConsensus {
  label: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  analystCount: number;
  buyPercent: number;
  holdPercent: number;
  sellPercent: number;
}

export function getExtras(symbol: string): CompanyExtras | null {
  return COMPANY_EXTRAS[symbol.toUpperCase()] ?? null;
}

export function latestAnnual(symbol: string): AnnualFinancial | null {
  const annual = getExtras(symbol)?.annual;
  return annual?.length ? annual[annual.length - 1] : null;
}

export function yoy(current: number | null | undefined, previous: number | null | undefined): number | null {
  if (typeof current !== 'number' || !Number.isFinite(current)
    || typeof previous !== 'number' || !Number.isFinite(previous) || previous === 0) {
    return null;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function revenueAllocation(annual: AnnualFinancial | null | undefined): RevenueAllocationSlice[] {
  if (!annual || annual.revenue === null || annual.netIncome === null) return [];
  const slices: RevenueAllocationSlice[] = [{ name: 'Net income', value: annual.netIncome }];

  if (annual.operatingIncome === null) {
    slices.push({ name: 'Costs', value: annual.revenue - annual.netIncome });
    return slices;
  }

  slices.push(
    { name: 'Taxes & other', value: annual.operatingIncome - annual.netIncome },
    { name: 'Operating costs', value: annual.revenue - annual.operatingIncome },
  );
  return slices;
}

export function consensus(rec: CompanyExtras['recommendations'] | null | undefined): AnalystConsensus | null {
  if (!rec) return null;
  const strongBuy = rec.strongBuy;
  const buy = rec.buy;
  const hold = rec.hold;
  const sell = rec.sell;
  const strongSell = rec.strongSell;
  const analystCount = strongBuy + buy + hold + sell + strongSell;
  if (!analystCount) return null;

  const weightedAverage = (strongBuy * 5 + buy * 4 + hold * 3 + sell * 2 + strongSell) / analystCount;
  const label = weightedAverage >= 4.5
    ? 'Strong Buy'
    : weightedAverage >= 3.5
      ? 'Buy'
      : weightedAverage >= 2.5
        ? 'Hold'
        : weightedAverage >= 1.5
          ? 'Sell'
          : 'Strong Sell';

  return {
    label,
    analystCount,
    buyPercent: ((strongBuy + buy) / analystCount) * 100,
    holdPercent: (hold / analystCount) * 100,
    sellPercent: ((sell + strongSell) / analystCount) * 100,
  };
}

/** Finnhub profile market caps below one billion are expressed in millions of USD. */
function marketCapInDollars(marketCap: number): number {
  return marketCap > 0 && marketCap < 1_000_000_000 ? marketCap * 1_000_000 : marketCap;
}

export function capClass(marketCap: number | null | undefined): 'Mega Cap' | 'Large Cap' | 'Mid Cap' | null {
  if (typeof marketCap !== 'number' || !Number.isFinite(marketCap)) return null;
  const value = marketCapInDollars(marketCap);
  if (value >= 200_000_000_000) return 'Mega Cap';
  if (value >= 10_000_000_000) return 'Large Cap';
  return 'Mid Cap';
}

export function rangePosition(price: number | null | undefined, low: number | null | undefined, high: number | null | undefined): number {
  if (typeof price !== 'number' || typeof low !== 'number' || typeof high !== 'number'
    || !Number.isFinite(price) || !Number.isFinite(low) || !Number.isFinite(high) || high <= low) {
    return 0;
  }
  return Math.max(0, Math.min(1, (price - low) / (high - low)));
}

export function formatMarketCap(marketCap: number | null | undefined): string {
  if (typeof marketCap !== 'number' || !Number.isFinite(marketCap)) return '—';
  const value = marketCapInDollars(marketCap);
  if (Math.abs(value) >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return formatCurrency(value);
}

export function formatCurrency(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function formatPercent(value: number | null | undefined, decimals = 2): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatChange(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const formatted = formatCurrency(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function formatRatioPercent(value: number | null | undefined, decimals = 1): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return `${value.toFixed(decimals)}%`;
}
