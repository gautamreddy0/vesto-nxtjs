import type {
  PortfolioAllocation,
  PortfolioHolding,
  PortfolioOrder,
  PortfolioSnapshot,
  PortfolioSummary,
  PortfolioTransaction,
} from '@/types/portfolio';

export const INITIAL_PORTFOLIO_CASH = 10_000;
export const DEMO_PORTFOLIO_KEY = 'vesto-demo-portfolio';
export const DEMO_APPROVED_KEY = 'vesto-demo-approved';

interface StoredHolding {
  symbol: string;
  shares: number;
  avgCost: number;
}

interface StoredPortfolio {
  cash: number;
  holdings: StoredHolding[];
  transactions: PortfolioTransaction[];
  snapshots: PortfolioSnapshot[];
  isSample: boolean;
}

interface CompanySnapshot {
  company: { symbol: string; name: string; logo?: string | null; sector?: string | null; [key: string]: unknown };
  quote?: { current_price?: number | null; [key: string]: unknown } | null;
  fundamentals?: { beta?: number | null; pe_ratio?: number | null; [key: string]: unknown } | null;
}

export interface PortfolioStore {
  readonly mode: 'api' | 'local';
  getSummary(): Promise<PortfolioSummary>;
  buy(symbol: string, amountOrShares: PortfolioOrder): Promise<PortfolioSummary>;
  sell(symbol: string, shares: number): Promise<PortfolioSummary>;
  reset(): Promise<PortfolioSummary>;
  loadSamplePortfolio?(): Promise<PortfolioSummary>;
  isSample?(): boolean;
}

let memoryPortfolio: StoredPortfolio | null = null;
let companySnapshotPromise: Promise<CompanySnapshot[]> | null = null;

function emptyPortfolio(): StoredPortfolio {
  return { cash: INITIAL_PORTFOLIO_CASH, holdings: [], transactions: [], snapshots: [], isSample: false };
}

function browserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const storage = browserStorage();
    const raw = storage?.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function readApprovedSymbols(): string[] {
  const parsed = readJson<unknown>(DEMO_APPROVED_KEY, []);
  return Array.isArray(parsed)
    ? [...new Set(parsed.filter((value): value is string => typeof value === 'string').map((value) => value.toUpperCase()))]
    : [];
}

function writeApprovedSymbols(symbols: string[]): void {
  try {
    browserStorage()?.setItem(DEMO_APPROVED_KEY, JSON.stringify([...new Set(symbols.map((symbol) => symbol.toUpperCase()))]));
  } catch {
    // Approval remains unavailable across reloads when browser storage is blocked.
  }
}

function getStoredPortfolio(): StoredPortfolio {
  if (memoryPortfolio) return memoryPortfolio;
  const parsed = readJson<Partial<StoredPortfolio> | null>(DEMO_PORTFOLIO_KEY, null);
  if (!parsed || typeof parsed !== 'object') {
    memoryPortfolio = emptyPortfolio();
    return memoryPortfolio;
  }

  memoryPortfolio = {
    cash: Number.isFinite(parsed.cash) ? Number(parsed.cash) : INITIAL_PORTFOLIO_CASH,
    holdings: Array.isArray(parsed.holdings) ? parsed.holdings.filter(isStoredHolding) : [],
    transactions: Array.isArray(parsed.transactions) ? parsed.transactions.filter(isTransaction) : [],
    snapshots: Array.isArray(parsed.snapshots) ? parsed.snapshots.filter(isSnapshot) : [],
    isSample: parsed.isSample === true,
  };
  return memoryPortfolio;
}

function isStoredHolding(value: unknown): value is StoredHolding {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<StoredHolding>;
  return typeof row.symbol === 'string' && Number.isFinite(row.shares) && Number.isFinite(row.avgCost);
}

function isTransaction(value: unknown): value is PortfolioTransaction {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<PortfolioTransaction>;
  return typeof row.symbol === 'string' && (row.side === 'buy' || row.side === 'sell') && Number.isFinite(row.shares) && Number.isFinite(row.price);
}

function isSnapshot(value: unknown): value is PortfolioSnapshot {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<PortfolioSnapshot>;
  return typeof row.date === 'string' && Number.isFinite(row.totalValue) && Number.isFinite(row.invested) && Number.isFinite(row.cash);
}

function saveStoredPortfolio(state: StoredPortfolio): void {
  memoryPortfolio = state;
  try {
    browserStorage()?.setItem(DEMO_PORTFOLIO_KEY, JSON.stringify(state));
  } catch {
    // Continue in memory for the current browser session if storage is unavailable.
  }
}

function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function finitePrice(value: unknown): number | null {
  const price = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(price) && price > 0 ? price : null;
}

async function getCompanySnapshot(): Promise<CompanySnapshot[]> {
  if (!companySnapshotPromise) {
    companySnapshotPromise = fetch('/api/companies/all-data')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load current snapshot prices.');
        const payload = await response.json() as { data?: unknown };
        return Array.isArray(payload.data) ? payload.data as CompanySnapshot[] : [];
      })
      .catch((error: unknown) => {
        companySnapshotPromise = null;
        throw error;
      });
  }
  return companySnapshotPromise;
}

function createTransaction(input: Omit<PortfolioTransaction, 'id' | 'createdAt'>, createdAt = new Date().toISOString()): PortfolioTransaction {
  return { ...input, id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`, createdAt };
}

function updateDailySnapshot(state: StoredPortfolio, summary: Omit<PortfolioSummary, 'snapshots'>): PortfolioSnapshot[] {
  const snapshot: PortfolioSnapshot = {
    date: todayKey(),
    totalValue: summary.totalValue,
    invested: summary.invested,
    cash: summary.cash,
  };
  const existingIndex = state.snapshots.findIndex((item) => item.date === snapshot.date);
  if (existingIndex >= 0) {
    state.snapshots[existingIndex] = snapshot;
  } else {
    state.snapshots.push(snapshot);
  }
  state.snapshots.sort((left, right) => left.date.localeCompare(right.date));
  return state.snapshots;
}

export class LocalStore implements PortfolioStore {
  readonly mode = 'local' as const;

  async getSummary(): Promise<PortfolioSummary> {
    const [state, companies] = [getStoredPortfolio(), await getCompanySnapshot()];
    const companyMap = new Map<string, CompanySnapshot>(companies.map((entry) => [entry.company.symbol.toUpperCase(), entry] as const));
    const holdingDetails = state.holdings.map((holding) => {
      const companyData = companyMap.get(holding.symbol.toUpperCase());
      const currentPrice = finitePrice(companyData?.quote?.current_price) ?? holding.avgCost;
      const marketValue = holding.shares * currentPrice;
      const costBasis = holding.shares * holding.avgCost;
      return {
        symbol: holding.symbol,
        name: companyData?.company.name ?? holding.symbol,
        sector: companyData?.company.sector ?? 'Other',
        logo: companyData?.company.logo ?? null,
        shares: holding.shares,
        avgCost: holding.avgCost,
        price: currentPrice,
        marketValue,
        pl: marketValue - costBasis,
        plPct: costBasis > 0 ? ((marketValue - costBasis) / costBasis) * 100 : 0,
      };
    });

    const invested = holdingDetails.reduce((sum, holding) => sum + holding.shares * holding.avgCost, 0);
    const marketValue = holdingDetails.reduce((sum, holding) => sum + holding.marketValue, 0);
    const cash = state.cash;
    const totalValue = cash + marketValue;
    const unrealizedPL = marketValue - invested;
    const weightBase = totalValue > 0 ? totalValue : 1;
    const holdings: PortfolioHolding[] = holdingDetails.map((holding) => ({ ...holding, weight: (holding.marketValue / weightBase) * 100 }));
    const sectorValues = new Map<string, number>();
    for (const holding of holdings) sectorValues.set(holding.sector || 'Other', (sectorValues.get(holding.sector || 'Other') ?? 0) + holding.marketValue);
    const allocationValues = [...sectorValues.entries(), ['Cash', cash] as [string, number]];
    const allocation: PortfolioAllocation[] = allocationValues.map(([key, value]) => ({ key, value, pct: totalValue > 0 ? (value / totalValue) * 100 : 0 }));
    const realizedPL = state.transactions.reduce((sum, transaction) => sum + (transaction.side === 'sell' ? transaction.realizedPL ?? 0 : 0), 0);
    const summaryWithoutSnapshots: Omit<PortfolioSummary, 'snapshots'> = {
      cash,
      invested,
      marketValue,
      totalValue,
      unrealizedPL,
      unrealizedPLPct: invested > 0 ? (unrealizedPL / invested) * 100 : 0,
      realizedPL,
      holdings,
      allocation,
      transactions: [...state.transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20),
      approvedSymbols: readApprovedSymbols(),
      priceSource: 'snapshot',
      priceAsOf: null,
    };
    const snapshots = updateDailySnapshot(state, summaryWithoutSnapshots);
    saveStoredPortfolio(state);
    return { ...summaryWithoutSnapshots, snapshots };
  }

  async buy(symbol: string, amountOrShares: PortfolioOrder): Promise<PortfolioSummary> {
    const normalized = symbol.trim().toUpperCase();
    if (!normalized) throw new Error('Choose a company to buy.');
    if (!readApprovedSymbols().includes(normalized)) throw new Error('Pitch approval required before buying this company.');
    const companyData = (await getCompanySnapshot()).find((entry) => entry.company.symbol.toUpperCase() === normalized);
    const price = finitePrice(companyData?.quote?.current_price);
    if (price === null) throw new Error(`No snapshot price is available for ${normalized}.`);

    const shares = 'shares' in amountOrShares ? Math.floor(amountOrShares.shares) : Math.floor(amountOrShares.amount / price);
    if (!Number.isFinite(shares) || shares < 1) throw new Error('Buy at least one whole share.');
    const amount = shares * price;
    const state = getStoredPortfolio();
    if (amount > state.cash + 1e-8) throw new Error(`Insufficient cash. Available: $${state.cash.toFixed(2)}.`);

    const existing = state.holdings.find((holding) => holding.symbol === normalized);
    if (existing) {
      const newShares = existing.shares + shares;
      existing.avgCost = ((existing.shares * existing.avgCost) + amount) / newShares;
      existing.shares = newShares;
    } else {
      state.holdings.push({ symbol: normalized, shares, avgCost: price });
    }
    state.cash = Math.max(0, state.cash - amount);
    state.transactions.push(createTransaction({
      symbol: normalized,
      companyName: companyData?.company.name ?? normalized,
      side: 'buy',
      shares,
      price,
      amount,
      realizedPL: null,
    }));
    state.isSample = false;
    saveStoredPortfolio(state);
    return this.getSummary();
  }

  async sell(symbol: string, sharesToSell: number): Promise<PortfolioSummary> {
    const normalized = symbol.trim().toUpperCase();
    const shares = Math.floor(sharesToSell);
    if (!Number.isFinite(shares) || shares < 1) throw new Error('Sell at least one whole share.');
    const state = getStoredPortfolio();
    const holding = state.holdings.find((item) => item.symbol === normalized);
    if (!holding || shares > holding.shares) throw new Error('You do not own enough shares to sell that amount.');
    const companyData = (await getCompanySnapshot()).find((entry) => entry.company.symbol.toUpperCase() === normalized);
    const price = finitePrice(companyData?.quote?.current_price) ?? holding.avgCost;
    const amount = shares * price;
    const realizedPL = (price - holding.avgCost) * shares;

    holding.shares -= shares;
    if (holding.shares === 0) state.holdings = state.holdings.filter((item) => item.symbol !== normalized);
    state.cash += amount;
    state.transactions.push(createTransaction({
      symbol: normalized,
      companyName: companyData?.company.name ?? normalized,
      side: 'sell',
      shares,
      price,
      amount,
      realizedPL,
    }));
    state.isSample = false;
    saveStoredPortfolio(state);
    return this.getSummary();
  }

  async reset(): Promise<PortfolioSummary> {
    saveStoredPortfolio(emptyPortfolio());
    writeApprovedSymbols([]);
    return this.getSummary();
  }

  async loadSamplePortfolio(): Promise<PortfolioSummary> {
    const companies = await getCompanySnapshot();
    const companyMap = new Map<string, CompanySnapshot>(companies.map((entry) => [entry.company.symbol.toUpperCase(), entry] as const));
    const sampleSpecs = [
      { symbol: 'AAPL', shares: 10, basisFactor: 0.96, day: 26 },
      { symbol: 'MSFT', shares: 5, basisFactor: 0.95, day: 18 },
      { symbol: 'AMZN', shares: 8, basisFactor: 0.93, day: 10 },
      { symbol: 'JPM', shares: 6, basisFactor: 0.92, day: 3 },
    ];
    const holdings: StoredHolding[] = [];
    const transactions: PortfolioTransaction[] = [];

    for (const spec of sampleSpecs) {
      const data = companyMap.get(spec.symbol);
      const price = finitePrice(data?.quote?.current_price);
      if (price === null) throw new Error(`Cannot load sample portfolio: no current snapshot price for ${spec.symbol}.`);
      const avgCost = price * spec.basisFactor;
      holdings.push({ symbol: spec.symbol, shares: spec.shares, avgCost });
      const date = new Date();
      date.setDate(date.getDate() - spec.day);
      transactions.push(createTransaction({
        symbol: spec.symbol,
        companyName: data?.company.name ?? spec.symbol,
        side: 'buy',
        shares: spec.shares,
        price: avgCost,
        amount: spec.shares * avgCost,
        realizedPL: null,
      }, date.toISOString()));
    }

    const invested = holdings.reduce((sum, holding) => sum + holding.shares * holding.avgCost, 0);
    const marketValue = holdings.reduce((sum, holding) => sum + holding.shares * (finitePrice(companyMap.get(holding.symbol)?.quote?.current_price) ?? holding.avgCost), 0);
    const cash = INITIAL_PORTFOLIO_CASH - invested;
    const totalValue = cash + marketValue;
    const snapshots: PortfolioSnapshot[] = Array.from({ length: 30 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - index));
      const ratio = index / 29;
      const smoothRatio = ratio * ratio * (3 - 2 * ratio);
      return {
        date: todayKey(date),
        totalValue: INITIAL_PORTFOLIO_CASH + ((totalValue - INITIAL_PORTFOLIO_CASH) * smoothRatio),
        invested: invested * smoothRatio,
        cash: INITIAL_PORTFOLIO_CASH - (invested * smoothRatio),
      };
    });

    saveStoredPortfolio({ cash, holdings, transactions, snapshots, isSample: true });
    writeApprovedSymbols(['AAPL', 'MSFT', 'AMZN', 'JPM']);
    return this.getSummary();
  }

  isSample(): boolean {
    return getStoredPortfolio().isSample;
  }
}

export class ApiStore implements PortfolioStore {
  readonly mode = 'api' as const;

  async getSummary(): Promise<PortfolioSummary> {
    const response = await fetch('/api/portfolio/summary');
    if (!response.ok) throw new Error('Unable to load account portfolio.');
    return response.json() as Promise<PortfolioSummary>;
  }

  async buy(symbol: string, amountOrShares: PortfolioOrder): Promise<PortfolioSummary> {
    const response = await fetch('/api/portfolio/invest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, ...amountOrShares }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result?.details || result?.error || 'Unable to buy shares.');
    return result?.summary ?? this.getSummary();
  }

  async sell(symbol: string, shares: number): Promise<PortfolioSummary> {
    const response = await fetch('/api/portfolio/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, shares }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result?.details || result?.error || 'Unable to sell shares.');
    return result?.summary ?? this.getSummary();
  }

  async reset(): Promise<PortfolioSummary> {
    throw new Error('Reset is only available for the local demo portfolio.');
  }
}
