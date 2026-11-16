'use client';

import { useEffect, useState } from 'react';

import { useUser } from '@/lib/hooks/use-user';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { PitchMemoData } from '@/components/fund-manager/investment-committee-memo';

export interface LatestPitch extends PitchMemoData {
  symbol: string;
  companyName: string;
  submittedAt: string | null;
  pitchText?: string;
  submissionId?: number | null;
}

const DEMO_LATEST_PITCH_KEY = 'vesto-last-pitch';

export function useLatestPitch() {
  const { user, loading: userLoading, isAuthenticated } = useUser();
  const [pitch, setPitch] = useState<LatestPitch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadLatestPitch = async () => {
      if (userLoading) return;
      setLoading(true);

      if (isAuthenticated && user?.id && isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('pitch_submissions')
            .select('id, symbol, company_name, status, ai_score, ai_feedback, pitch_text, submitted_at')
            .eq('user_id', user.id)
            .order('submitted_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) throw error;
          if (active) {
            if (!data) {
              setPitch(null);
            } else {
              const databasePitch = fromDatabaseRow(data);
              const localDetail = readDemoPitch();
              setPitch(localDetail?.submissionId === databasePitch.submissionId
                ? { ...databasePitch, ...localDetail }
                : databasePitch);
            }
          }
        } catch {
          if (active) setPitch(null);
        } finally {
          if (active) setLoading(false);
        }
        return;
      }

      if (active) {
        setPitch(readDemoPitch());
        setLoading(false);
      }
    };

    void loadLatestPitch();
    const onStorage = (event: StorageEvent) => {
      if (event.key === DEMO_LATEST_PITCH_KEY || event.key === null) setPitch(readDemoPitch());
    };
    window.addEventListener('storage', onStorage);

    return () => {
      active = false;
      window.removeEventListener('storage', onStorage);
    };
  }, [isAuthenticated, user?.id, userLoading]);

  return { pitch, loading };
}

function fromDatabaseRow(row: {
  id: number;
  symbol: string;
  company_name: string;
  status: LatestPitch['status'];
  ai_score: number | null;
  ai_feedback: string | null;
  pitch_text: string;
  submitted_at: string | null;
}): LatestPitch {
  return {
    submissionId: row.id,
    symbol: row.symbol,
    companyName: row.company_name,
    status: row.status,
    score: typeof row.ai_score === 'number' && Number.isFinite(row.ai_score) ? row.ai_score : null,
    feedback: row.ai_feedback ?? '',
    submittedAt: row.submitted_at,
    pitchText: row.pitch_text,
  };
}

function readDemoPitch(): LatestPitch | null {
  try {
    const raw = window.localStorage.getItem(DEMO_LATEST_PITCH_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const row = value as Partial<LatestPitch>;
    if (
      typeof row.symbol !== 'string' ||
      typeof row.companyName !== 'string' ||
      (row.status !== 'approved' && row.status !== 'rejected' && row.status !== 'pending')
    ) return null;

    return {
      ...row,
      symbol: row.symbol,
      companyName: row.companyName,
      status: row.status,
      score: typeof row.score === 'number' && Number.isFinite(row.score) ? row.score : null,
      feedback: typeof row.feedback === 'string' ? row.feedback : '',
      submittedAt: typeof row.submittedAt === 'string' ? row.submittedAt : null,
      pitchText: typeof row.pitchText === 'string' ? row.pitchText : undefined,
      submissionId: typeof row.submissionId === 'number' ? row.submissionId : null,
    };
  } catch {
    return null;
  }
}
