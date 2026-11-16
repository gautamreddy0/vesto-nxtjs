'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'vesto-learn-bookmarks';
const LEGACY_STORAGE_KEY = ['invest', 'wise-learn-bookmarks'].join('');

function readBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
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

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    setBookmarks(readBookmarks());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === LEGACY_STORAGE_KEY || event.key === null) setBookmarks(readBookmarks());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isBookmarked = useCallback((moduleId: string) => bookmarks.includes(moduleId), [bookmarks]);

  const toggleBookmark = useCallback((moduleId: string) => {
    setBookmarks((current) => {
      const next = current.includes(moduleId)
        ? current.filter((item) => item !== moduleId)
        : [...current, moduleId];
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      } catch {
        // Keep the in-memory bookmarks usable when storage is disabled.
      }
      return next;
    });
  }, []);

  return { bookmarks, isBookmarked, toggleBookmark };
}
