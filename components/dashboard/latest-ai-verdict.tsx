'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

import { InvestmentCommitteeMemo } from '@/components/fund-manager/investment-committee-memo';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLatestPitch } from '@/lib/hooks/use-latest-pitch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LatestAiVerdict() {
  const { pitch, loading } = useLatestPitch();
  const [memoOpen, setMemoOpen] = useState(false);
  const reviewFailed = pitch?.status === 'rejected' && pitch.score === 0
    && pitch.feedback === 'Unable to review pitch automatically. Please try again with more detail.';

  return (
    <Card className="relative min-w-0 overflow-hidden shadow-sm">
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-64 rounded-full bg-accent/20 blur-3xl" />
      <CardHeader className="relative flex-row items-center justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-bg text-accent-text">
            <Sparkles aria-hidden="true" className="h-5 w-5" />
          </span>
          <CardTitle className="font-display text-lg">Latest AI Verdict</CardTitle>
        </div>
        <span className="rounded-full border border-primary/20 bg-info-bg px-2.5 py-1 text-[11px] font-semibold text-primary-text">Beta</span>
      </CardHeader>
      <CardContent className="relative px-4 pb-5 sm:px-5 sm:pb-5">
        {loading ? (
          <div className="space-y-4" aria-label="Loading latest pitch" aria-busy="true">
            <div className="h-7 w-24 animate-pulse rounded-full bg-muted-bg" />
            <div className="h-20 animate-pulse rounded-lg bg-muted-bg" />
            <div className="h-10 animate-pulse rounded-lg bg-muted-bg" />
          </div>
        ) : pitch && reviewFailed ? (
          <div className="flex min-h-[190px] flex-col items-start justify-center">
            <p className="font-display text-base font-semibold text-foreground">AI review unavailable</p>
            <p className="mt-2 text-sm text-muted-foreground">The previous review failed; your pitch was not evaluated.</p>
            <Link href={`/fund-manager?symbol=${encodeURIComponent(pitch.symbol)}`} className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring">
              Retry review <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        ) : pitch ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${pitch.status === 'approved' ? 'bg-success-bg text-success' : pitch.status === 'rejected' ? 'bg-danger-bg text-danger' : 'bg-muted-bg text-muted-foreground'}`}>
                {pitch.status}
              </span>
              <ScoreGauge score={pitch.score ?? null} symbol={pitch.symbol} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-xl font-bold text-foreground">{pitch.symbol}</p>
              <p className="truncate text-sm text-muted-foreground">{pitch.companyName}</p>
            </div>
            <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-foreground">
              {pitch.feedback || 'Feedback details are not available for this pitch.'}
            </p>
            <button
              type="button"
              onClick={() => setMemoOpen(true)}
              className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-primary-text outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              View full memo <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex min-h-[190px] flex-col items-start justify-center">
            <p className="font-display text-base font-semibold text-foreground">Pitch your first idea to the AI Fund Manager</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Your latest evaluation and feedback will appear here.</p>
            <Link
              href="/fund-manager"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring"
            >
              Start a pitch <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        )}
      </CardContent>
      {pitch && !reviewFailed && (
        <Dialog open={memoOpen} onOpenChange={setMemoOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display">Investment Committee Memo · {pitch.symbol}</DialogTitle>
              <DialogDescription>AI Fund Manager evaluation for {pitch.companyName}.</DialogDescription>
            </DialogHeader>
            <InvestmentCommitteeMemo
              review={pitch}
              symbol={pitch.symbol}
              pitchText={pitch.pitchText}
              isAuthenticated={Boolean(pitch.submissionId)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

function ScoreGauge({ score, symbol }: { score: number | null; symbol: string }) {
  const radius = 39;
  const circumference = 2 * Math.PI * radius;
  const safeScore = score === null ? 0 : Math.max(0, Math.min(100, score));
  const scoreMarkerAngle = (-90 + (safeScore / 100) * 360) * (Math.PI / 180);
  const thresholdAngle = (-90 + 0.7 * 360) * (Math.PI / 180);
  const markerX = 50 + radius * Math.cos(scoreMarkerAngle);
  const markerY = 50 + radius * Math.sin(scoreMarkerAngle);
  const thresholdX = 50 + radius * Math.cos(thresholdAngle);
  const thresholdY = 50 + radius * Math.sin(thresholdAngle);

  return (
    <div className="flex items-center gap-2" role="img" aria-label={score === null ? `AI score unavailable for ${symbol}` : `AI score ${score} out of 100 for ${symbol}; investing threshold marker at 70`}>
      <svg viewBox="0 0 100 100" className="h-[74px] w-[74px] -rotate-0" aria-hidden="true">
        <defs>
          <linearGradient id="latest-pitch-score-gradient" x1="0" x2="1" y1="1" y2="0">
            <stop offset="0%" stopColor="var(--chart-2)" />
            <stop offset="100%" stopColor="var(--brand-green)" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--muted-bg)" strokeWidth="7" />
        {score !== null && <circle cx="50" cy="50" r={radius} fill="none" stroke="url(#latest-pitch-score-gradient)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - safeScore / 100)} transform="rotate(-90 50 50)" />}
        <circle cx={thresholdX} cy={thresholdY} r="3" fill="var(--foreground)" stroke="var(--card)" strokeWidth="1.5" />
        {score !== null && <circle cx={markerX} cy={markerY} r="4" fill="var(--brand-green)" stroke="var(--card)" strokeWidth="2" />}
        <text x="50" y="48" textAnchor="middle" className="fill-foreground" fontSize="22" fontWeight="700">{score ?? '—'}</text>
        <text x="50" y="64" textAnchor="middle" className="fill-muted-foreground" fontSize="10">/100</text>
      </svg>
      <span className="sr-only">Dark marker shows the 70-point investing threshold.</span>
    </div>
  );
}
