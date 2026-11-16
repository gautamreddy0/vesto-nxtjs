'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCompanies } from '@/lib/hooks/use-companies';
import { useUser } from '@/lib/hooks/use-user';

const INITIAL_CASH = 10000;

type PortfolioRow = {
  symbol?: string;
  shares?: number | string;
  buy_price?: number | string;
  current_price?: number | string;
  [key: string]: any;
};

export function usePortfolio() {
  const { user, loading: userLoading } = useUser();
  const { companyMap } = useCompanies();
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setPortfolio([]);
      setLoading(false);
      setError(null);
      return [];
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/portfolio?userId=${user.id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.details || result?.error || 'Unable to load portfolio');
      }

      const rows: PortfolioRow[] = Array.isArray(result?.data) ? result.data : [];
      const enriched = rows.map((holding: PortfolioRow) => {
        const snapshot = companyMap[holding.symbol ?? ''];
        const currentPrice = snapshot?.quote?.current_price ?? Number(holding.current_price ?? holding.buy_price ?? 0);
        const shares = Number(holding.shares) || 0;
        const costBasis = shares * Number(holding.buy_price || 0);
        const currentValue = shares * currentPrice;
        const gainLoss = currentValue - costBasis;
        const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

        return {
          ...holding,
          current_price: currentPrice,
          current_value: currentValue,
          gain_loss: gainLoss,
          gain_loss_percent: gainLossPercent,
        };
      });

      setPortfolio(enriched);
      setError(null);
      return enriched;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load portfolio');
      setPortfolio([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [companyMap, user?.id]);

  useEffect(() => {
    if (userLoading) {
      return;
    }

    refresh();
  }, [refresh, userLoading]);

  const totals = useMemo(() => {
    const invested = portfolio.reduce((sum, holding) => sum + (Number(holding.shares) || 0) * Number(holding.buy_price || 0), 0);
    const totalHoldingsValue = portfolio.reduce((sum, holding) => sum + Number(holding.current_value || 0), 0);
    const totalGainLoss = totalHoldingsValue - invested;
    const totalGainLossPercent = invested > 0 ? (totalGainLoss / invested) * 100 : 0;
    const availableCash = INITIAL_CASH - invested;
    const holdings = portfolio.map((holding) => {
      const shares = Number(holding.shares) || 0;
      const costBasis = shares * Number(holding.buy_price || 0);
      const marketValue = Number(holding.current_value || 0);
      const pnl = marketValue - costBasis;

      return {
        symbol: holding.symbol,
        quantity: shares,
        marketValue,
        pnl,
        pnlPercent: costBasis > 0 ? (pnl / costBasis) * 100 : 0,
      };
    });

    return {
      invested,
      totalHoldingsValue,
      totalGainLoss,
      totalGainLossPercent,
      availableCash,
      totalAssets: INITIAL_CASH + totalGainLoss,
      holdings,
    };
  }, [portfolio]);

  const { holdings, ...totalsWithoutHoldings } = totals;

  return {
    portfolio,
    loading: userLoading || loading,
    error,
    refresh,
    initialCash: INITIAL_CASH,
    holdings,
    totalInvested: totals.invested,
    totalValue: totals.totalHoldingsValue,
    totalPnL: totals.totalGainLoss,
    totalPnLPercent: totals.totalGainLossPercent,
    ...totalsWithoutHoldings,
  };
}
