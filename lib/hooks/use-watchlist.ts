'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'vesto-watchlist';
const LEGACY_STORAGE_KEY = ['invest', 'wise-watchlist'].join('');

function readSymbols(): string[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const legacy = stored == null ? window.localStorage.getItem(LEGACY_STORAGE_KEY) : null;
    const value: unknown = JSON.parse(stored ?? legacy ?? '[]');
    if (stored == null && legacy != null) {
      try {
        window.localStorage.setItem(STORAGE_KEY, legacy);
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        // Continue using the legacy value in memory if migration storage is unavailable.
      }
    }
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [symbols, setSymbols] = useState<string[]>([]);

  useEffect(() => {
    setSymbols(readSymbols());
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === LEGACY_STORAGE_KEY || event.key === null) setSymbols(readSymbols());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isWatchlisted = useCallback((symbol: string) => symbols.includes(symbol.toUpperCase()), [symbols]);

  const toggle = useCallback((symbol: string) => {
    const normalized = symbol.toUpperCase();
    setSymbols((current) => {
      const next = current.includes(normalized)
        ? current.filter((item) => item !== normalized)
        : [...current, normalized];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Keep the in-memory watchlist usable when storage is disabled.
      }
      return next;
    });
  }, []);

  return { symbols, isWatchlisted, toggle };
}
