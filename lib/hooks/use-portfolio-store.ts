'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { ApiStore, LocalStore, type PortfolioStore } from '@/lib/portfolio/store';
import type { PortfolioOrder, PortfolioSummary } from '@/types/portfolio';

interface PortfolioStoreState {
  store: PortfolioStore | null;
  summary: PortfolioSummary | null;
  loading: boolean;
  error: string | null;
}

const localStore = new LocalStore();

export function usePortfolioStore() {
  const { user, loading: userLoading, isAuthenticated } = useUser();
  const [state, setState] = useState<PortfolioStoreState>({
    store: null,
    summary: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (userLoading) return null;
    setState((current) => ({ ...current, loading: true, error: null }));

    if (isSupabaseConfigured() && isAuthenticated && user?.id) {
      const apiStore = new ApiStore();
      try {
        const summary = await apiStore.getSummary();
        setState({ store: apiStore, summary, loading: false, error: null });
        return summary;
      } catch {
        // Phase A API may not be installed yet. Use browser storage until it is available.
      }
    }

    try {
      const summary = await localStore.getSummary();
      setState({ store: localStore, summary, loading: false, error: null });
      return summary;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load portfolio.';
      setState({ store: localStore, summary: null, loading: false, error: message });
      return null;
    }
  }, [isAuthenticated, user?.id, userLoading]);

  useEffect(() => {
    if (!userLoading) void refresh();
  }, [refresh, userLoading]);

  const buy = useCallback(async (symbol: string, order: PortfolioOrder) => {
    const store = state.store ?? localStore;
    const summary = await store.buy(symbol, order);
    setState({ store, summary, loading: false, error: null });
    return summary;
  }, [state.store]);

  const sell = useCallback(async (symbol: string, shares: number) => {
    const store = state.store ?? localStore;
    const summary = await store.sell(symbol, shares);
    setState({ store, summary, loading: false, error: null });
    return summary;
  }, [state.store]);

  const reset = useCallback(async () => {
    const store = state.store instanceof ApiStore ? localStore : (state.store ?? localStore);
    const summary = await store.reset();
    setState({ store, summary, loading: false, error: null });
    return summary;
  }, [state.store]);

  const loadSamplePortfolio = useCallback(async () => {
    if (!(state.store instanceof LocalStore)) throw new Error('Sample data is only available in demo mode.');
    const summary = await state.store.loadSamplePortfolio();
    setState((current) => ({ ...current, summary, loading: false, error: null }));
    return summary;
  }, [state.store]);

  const isSample = state.store instanceof LocalStore ? state.store.isSample() : false;

  return useMemo(() => ({
    ...state,
    isAuthenticated,
    isLocalStore: state.store instanceof LocalStore,
    isSample,
    refresh,
    buy,
    sell,
    reset,
    loadSamplePortfolio,
  }), [state, isAuthenticated, isSample, refresh, buy, sell, reset, loadSamplePortfolio]);
}
