'use client';

import { useEffect, useMemo, useState } from 'react';

export interface CompanyEntry {
  company: {
    symbol: string;
    name: string;
    updated_at?: string;
    [key: string]: any;
  };
  quote?: {
    current_price?: number;
    percent_change?: number;
    created_at?: string;
    [key: string]: any;
  } | null;
  fundamentals?: {
    extracted_at?: string;
    [key: string]: any;
  } | null;
  mock10k?: {
    business_description?: string;
    [key: string]: any;
  } | null;
  financials?: any[];
}

const companyCache: {
  data: CompanyEntry[] | null;
  promise: Promise<CompanyEntry[]> | null;
} = {
  data: null,
  promise: null,
};

export function useCompanies() {
  // Keep the first render deterministic on both server and browser; cached data
  // is applied in the effect below to avoid a hydration mismatch.
  const [data, setData] = useState<CompanyEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (companyCache.data) {
      setData(companyCache.data);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    if (!companyCache.promise) {
      companyCache.promise = fetch('/api/companies/all-data')
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Failed to load companies');
          }

          const payload = await response.json();
          const nextData = Array.isArray(payload?.data) ? payload.data : [];
          companyCache.data = nextData;
          return nextData;
        })
        .catch((err) => {
          companyCache.data = [];
          throw err;
        });
    }

    companyCache.promise
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load companies');
        setData([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const companyMap = useMemo(() => {
    return (data || []).reduce<Record<string, CompanyEntry>>((map, item) => {
      if (item?.company?.symbol) {
        map[item.company.symbol] = item;
      }
      return map;
    }, {});
  }, [data]);

  const companies = useMemo(() => {
    return (data || []).map((entry) => entry.company).filter(Boolean);
  }, [data]);

  return { companies, companyMap, data, loading, error };
}
