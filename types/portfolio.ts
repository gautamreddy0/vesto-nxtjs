export type PortfolioSide = 'buy' | 'sell';

export interface PortfolioHolding {
  symbol: string;
  name: string;
  sector: string;
  logo: string | null;
  shares: number;
  avgCost: number;
  price: number;
  marketValue: number;
  pl: number;
  plPct: number;
  weight: number;
}

export interface PortfolioAllocation {
  key: string;
  value: number;
  pct: number;
}

export interface PortfolioTransaction {
  id: string;
  symbol: string;
  companyName: string;
  side: PortfolioSide;
  shares: number;
  price: number;
  amount: number;
  realizedPL: number | null;
  createdAt: string;
}

export interface PortfolioSnapshot {
  date: string;
  totalValue: number;
  invested: number;
  cash: number;
}

export interface PortfolioSummary {
  cash: number;
  invested: number;
  marketValue: number;
  totalValue: number;
  unrealizedPL: number;
  unrealizedPLPct: number;
  realizedPL: number;
  holdings: PortfolioHolding[];
  allocation: PortfolioAllocation[];
  transactions: PortfolioTransaction[];
  snapshots: PortfolioSnapshot[];
  approvedSymbols: string[];
  priceSource: 'live' | 'snapshot';
  priceAsOf: string | null;
}

export type PortfolioOrder =
  | { amount: number }
  | { shares: number };

export type PortfolioTab = 'holdings' | 'performance' | 'transactions' | 'analytics';
