'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDownUp, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CompanyEntry } from '@/lib/hooks/use-companies';
import type { PortfolioOrder, PortfolioSummary } from '@/types/portfolio';
import { formatCurrency } from '@/lib/utils/format';

interface TradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode: 'buy' | 'sell';
  initialSymbol?: string;
  summary: PortfolioSummary;
  companies: CompanyEntry[];
  onBuy: (symbol: string, order: PortfolioOrder) => Promise<PortfolioSummary>;
  onSell: (symbol: string, shares: number) => Promise<PortfolioSummary>;
}

export function TradeDialog({ open, onOpenChange, initialMode, initialSymbol, summary, companies, onBuy, onSell }: TradeDialogProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>(initialMode);
  const [symbol, setSymbol] = useState(initialSymbol ?? '');
  const [inputKind, setInputKind] = useState<'amount' | 'shares'>('amount');
  const [amount, setAmount] = useState('1000');
  const [shareInput, setShareInput] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyMap = useMemo(() => new Map(companies.map((entry) => [entry.company.symbol.toUpperCase(), entry] as const)), [companies]);
  const holdingsMap = useMemo(() => new Map(summary.holdings.map((holding) => [holding.symbol.toUpperCase(), holding] as const)), [summary.holdings]);
  const orderedCompanies = useMemo(() => [...companies].sort((a, b) => a.company.symbol.localeCompare(b.company.symbol)), [companies]);
  const selectedHolding = holdingsMap.get(symbol.toUpperCase());
  const company = companyMap.get(symbol.toUpperCase());
  const price = selectedHolding?.price ?? finiteNumber(company?.quote?.current_price) ?? null;
  const approved = summary.approvedSymbols.includes(symbol.toUpperCase());
  const requestedAmount = finiteNumber(amount) ?? 0;
  const requestedShares = Math.floor(finiteNumber(shareInput) ?? 0);
  const buyShares = price && inputKind === 'amount' ? Math.floor(requestedAmount / price) : requestedShares;
  const buyCost = price ? buyShares * price : 0;
  const sellShares = Math.floor(finiteNumber(shareInput) ?? 0);
  const sellProceeds = price ? sellShares * price : 0;
  const realizedPL = selectedHolding && price ? (price - selectedHolding.avgCost) * sellShares : 0;
  const buyError = !symbol
    ? 'Choose a company to buy.'
    : !approved
      ? 'Pitch approval required before buying this company.'
      : price === null
        ? 'A current snapshot price is not available for this company.'
        : buyShares < 1
          ? 'Buy at least one whole share.'
          : buyCost > summary.cash + 1e-8
            ? `Not enough cash. Available: ${formatCurrency(summary.cash)}.`
            : null;
  const sellError = !symbol
    ? 'Choose a holding to sell.'
    : !selectedHolding
      ? 'This symbol is not in your portfolio.'
      : price === null
        ? 'A current snapshot price is not available for this holding.'
        : sellShares < 1
          ? 'Sell at least one whole share.'
          : sellShares > selectedHolding.shares
            ? `You only hold ${selectedHolding.shares} shares.`
            : null;
  const validationError = mode === 'buy' ? buyError : sellError;

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setSymbol(initialSymbol ?? (initialMode === 'sell' ? summary.holdings[0]?.symbol : summary.approvedSymbols[0] ?? orderedCompanies[0]?.company.symbol) ?? '');
    setInputKind('amount');
    setAmount('1000');
    setShareInput('1');
    setError(null);
  }, [open, initialMode, initialSymbol, summary.holdings, summary.approvedSymbols, orderedCompanies]);

  const changeMode = (nextMode: 'buy' | 'sell') => {
    setMode(nextMode);
    setError(null);
    if (nextMode === 'sell' && !holdingsMap.has(symbol.toUpperCase())) setSymbol(summary.holdings[0]?.symbol ?? '');
    if (nextMode === 'buy' && !summary.approvedSymbols.includes(symbol.toUpperCase())) setSymbol(summary.approvedSymbols[0] ?? orderedCompanies[0]?.company.symbol ?? '');
  };

  const handleConfirm = async () => {
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === 'buy') {
        const order: PortfolioOrder = inputKind === 'amount' ? { amount: requestedAmount } : { shares: requestedShares };
        await onBuy(symbol, order);
        toast.success(`Bought ${buyShares} ${symbol} at ${formatCurrency(price)}`);
      } else {
        await onSell(symbol, sellShares);
        toast.success(`Sold ${sellShares} ${symbol} at ${formatCurrency(price)}`);
      }
      onOpenChange(false);
    } catch (tradeError) {
      setError(tradeError instanceof Error ? tradeError.message : 'Unable to complete this trade.');
    } finally {
      setLoading(false);
    }
  };

  const buyableCompanies = orderedCompanies.filter((entry) => summary.approvedSymbols.includes(entry.company.symbol.toUpperCase()));
  const lockedCompanies = orderedCompanies.filter((entry) => !summary.approvedSymbols.includes(entry.company.symbol.toUpperCase()));
  const availableSymbols = mode === 'sell' ? summary.holdings.map((holding) => holding.symbol) : [...new Set([...buyableCompanies.map((entry) => entry.company.symbol), ...summary.holdings.map((holding) => holding.symbol)])];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="font-display">Trade a position</DialogTitle>
          <DialogDescription>Use your virtual cash to buy approved companies or sell shares you own.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 rounded-lg bg-muted-bg p-1" role="tablist" aria-label="Trade type">
          {(['buy', 'sell'] as const).map((tab) => (
            <button key={tab} type="button" role="tab" aria-selected={mode === tab} onClick={() => changeMode(tab)} className={`rounded-md px-3 py-2 text-sm font-semibold capitalize ${mode === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {tab === 'buy' ? 'Buy' : 'Sell'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <label className="block space-y-1.5 text-sm font-medium text-foreground">
            Company
            <select value={symbol} onChange={(event) => { setSymbol(event.target.value); setError(null); }} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Choose a company">
              <option value="" disabled>Select a company</option>
              {mode === 'buy' && lockedCompanies.map((entry) => <option key={entry.company.symbol} value={entry.company.symbol} disabled>{entry.company.symbol} — {entry.company.name} · Pitch first</option>)}
              {availableSymbols.map((item) => {
                const entry = companyMap.get(item.toUpperCase());
                return <option key={item} value={item}>{item} — {entry?.company.name ?? item}</option>;
              })}
            </select>
          </label>

          {mode === 'buy' && lockedCompanies.length > 0 && (
            <div className="rounded-lg border border-border bg-muted-bg/50 p-3">
              <p className="text-xs font-semibold text-foreground">Locked · pitch first</p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
                {lockedCompanies.slice(0, 6).map((entry) => (
                  <Link key={entry.company.symbol} href={`/fund-manager?symbol=${encodeURIComponent(entry.company.symbol)}`} className="text-xs font-medium text-primary-text underline underline-offset-2">
                    {entry.company.symbol}
                  </Link>
                ))}
                {lockedCompanies.length > 6 && <span className="text-xs text-muted-foreground">+{lockedCompanies.length - 6} more</span>}
              </div>
            </div>
          )}

          {mode === 'buy' ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">Order by</span>
                <div className="inline-flex rounded-lg border border-border bg-card p-1" role="group" aria-label="Buy input type">
                  <button type="button" aria-pressed={inputKind === 'amount'} onClick={() => setInputKind('amount')} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${inputKind === 'amount' ? 'bg-muted-bg text-foreground' : 'text-muted-foreground'}`}>Amount ($)</button>
                  <button type="button" aria-pressed={inputKind === 'shares'} onClick={() => setInputKind('shares')} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${inputKind === 'shares' ? 'bg-muted-bg text-foreground' : 'text-muted-foreground'}`}>Shares</button>
                </div>
              </div>
              <label className="block space-y-1.5 text-sm font-medium text-foreground">
                {inputKind === 'amount' ? 'Amount in dollars' : 'Whole shares'}
                <input type="number" min={inputKind === 'amount' ? 0 : 1} step={inputKind === 'amount' ? '0.01' : '1'} value={inputKind === 'amount' ? amount : shareInput} onChange={(event) => inputKind === 'amount' ? setAmount(event.target.value) : setShareInput(event.target.value)} className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm num outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </label>
              <div className="space-y-2 rounded-lg border border-border bg-muted-bg/50 p-3 text-sm">
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Current price</span><span className="font-semibold text-foreground num">{price === null ? '—' : formatCurrency(price)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Preview</span><span className="text-right font-semibold text-foreground num">≈ {buyShares} {buyShares === 1 ? 'share' : 'shares'} · {formatCurrency(buyCost)}</span></div>
                <div className="flex justify-between gap-4 border-t border-border pt-2"><span className="text-muted-foreground">Cash after</span><span className={`font-semibold num ${buyCost > summary.cash ? 'text-danger' : 'text-foreground'}`}>{formatCurrency(summary.cash - buyCost)}</span></div>
              </div>
            </>
          ) : (
            <>
              <label className="block space-y-1.5 text-sm font-medium text-foreground">
                Shares to sell
                <span className="flex gap-2">
                  <input type="number" min="1" max={selectedHolding?.shares ?? 0} step="1" value={shareInput} onChange={(event) => setShareInput(event.target.value)} className="h-10 min-w-0 flex-1 rounded-md border border-border bg-card px-3 text-sm num outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  <Button type="button" variant="outline" onClick={() => setShareInput(String(selectedHolding?.shares ?? 0))} disabled={!selectedHolding}>Max</Button>
                </span>
              </label>
              <div className="space-y-2 rounded-lg border border-border bg-muted-bg/50 p-3 text-sm">
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Current price</span><span className="font-semibold text-foreground num">{price === null ? '—' : formatCurrency(price)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Estimated proceeds</span><span className="font-semibold text-foreground num">{formatCurrency(sellProceeds)}</span></div>
                <div className="flex justify-between gap-4 border-t border-border pt-2"><span className="text-muted-foreground">Realized P/L preview</span><span className={`font-semibold num ${realizedPL >= 0 ? 'text-success' : 'text-danger'}`}>{realizedPL >= 0 ? '+' : '−'}{formatCurrency(Math.abs(realizedPL))}</span></div>
              </div>
            </>
          )}
          {error && <p role="alert" className="rounded-md border border-danger/20 bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>}
          {!error && validationError && <p className="text-xs text-muted-foreground">{validationError}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button type="button" onClick={() => void handleConfirm()} disabled={loading || Boolean(validationError)} className="gap-2">
            {loading ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <ArrowDownUp aria-hidden="true" className="h-4 w-4" />}
            {loading ? 'Processing…' : `Confirm ${mode}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function finiteNumber(value: unknown): number | null {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}
