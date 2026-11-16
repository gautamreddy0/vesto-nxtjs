'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { UserProgress } from '@/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export function useLearningProgress() {
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  const fetchProgress = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);

    if (!isSupabaseConfigured()) {
      setProgressMap({});
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(Boolean(user));

      if (!user) {
        setProgressMap({});
        return;
      }

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        setProgressMap({});
        return;
      }

      const map: Record<string, UserProgress> = {};
      (data || []).forEach((progress: UserProgress) => {
        if (progress?.module_id) map[progress.module_id] = progress;
      });
      setProgressMap(map);
    } catch {
      setProgressMap({});
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProgress(true);
  }, [fetchProgress]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void fetchProgress(false);
    };
    const handleFocus = () => void fetchProgress(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchProgress]);

  useEffect(() => {
    if (pathname !== '/learn') return;
    const timer = setTimeout(() => void fetchProgress(false), 800);
    return () => clearTimeout(timer);
  }, [pathname, fetchProgress]);

  return { progressMap, loading, isAuthenticated, refetchProgress: fetchProgress };
}
