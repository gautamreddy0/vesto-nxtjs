'use client';

import Link from 'next/link';
import { Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { countPitchWords } from '@/lib/ai/limits';

export interface PitchCriterion {
  score?: number | null;
  comment?: string | null;
}

export interface PitchMemoData {
  status?: 'approved' | 'rejected' | 'pending' | string;
  score?: number | null;
  feedback?: string | null;
  criteria?: Partial<Record<'business_understanding' | 'financial_analysis' | 'risk_assessment' | 'investment_thesis', PitchCriterion>> | null;
  strengths?: unknown;
  gaps?: unknown;
  key_risks?: unknown;
  metric_checks?: unknown;
  next_steps?: unknown;
}

const criteriaRows = [
  { key: 'business_understanding', label: 'Business Understanding' },
  { key: 'financial_analysis', label: 'Financial Analysis' },
  { key: 'risk_assessment', label: 'Risk Assessment' },
  { key: 'investment_thesis', label: 'Investment Thesis' },
] as const;

export function InvestmentCommitteeMemo({
  review,
  symbol,
  pitchText,
  isAuthenticated,
  onRevise,
  onInvest,
}: {
  review: PitchMemoData;
  symbol: string;
  pitchText?: string;
  isAuthenticated: boolean;
  onRevise?: () => void;
  onInvest?: () => void;
}) {
  const approved = review.status === 'approved';
  const statusLabel = approved ? 'APPROVED' : review.status === 'rejected' ? 'REJECTED' : 'PENDING';
  const score = typeof review.score === 'number' && Number.isFinite(review.score) ? Math.max(0, Math.min(100, review.score)) : null;
  const hasCriteria = criteriaRows.some(({ key }) => {
    const criterion = review.criteria?.[key];
    return criterion && (typeof criterion.score === 'number' || typeof criterion.comment === 'string');
  });
  const wordCount = pitchText ? countPitchWords(pitchText) : 0;
  const details = [
    { key: 'strengths', title: 'Strengths', value: review.strengths },
    { key: 'gaps', title: 'Gaps', value: review.gaps },
    { key: 'key_risks', title: 'Key Risks', value: review.key_risks },
    { key: 'metric_checks', title: 'Metric Checks', value: review.metric_checks },
    { key: 'next_steps', title: 'Next Steps', value: review.next_steps },
  ].filter((item) => item.value !== undefined && item.value !== null && item.value !== '');

  return (
    <Card className="overflow-hidden border-border shadow-sm" aria-live="polite">
      <div className={`flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6 ${approved ? 'bg-success-bg' : 'bg-danger-bg'}`}>
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${approved ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            {approved ? <Check aria-hidden="true" className="h-6 w-6" strokeWidth={2.5} /> : <X aria-hidden="true" className="h-6 w-6" strokeWidth={2.5} />}
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">AI Fund Manager · Verdict</p>
            <p className={`mt-1 font-display text-lg font-extrabold tracking-wide ${approved ? 'text-success' : 'text-danger'}`}>{statusLabel}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-extrabold leading-none text-foreground num">{score ?? '—'} <span className="text-base font-semibold text-muted-foreground">/ 100</span></p>
          <p className="mt-1 text-xs text-muted-foreground">70 needed to approve</p>
        </div>
      </div>

      <CardContent className="space-y-5 p-5 sm:p-6">
        {pitchText !== undefined && <p className="-mt-1 text-xs text-muted-foreground">Your pitch: {wordCount} words · {pitchText.length.toLocaleString('en-US')} characters</p>}

        {hasCriteria && (
          <section aria-label="Evaluation criteria" className="space-y-4">
            {criteriaRows.map(({ key, label }) => {
              const criterion = review.criteria?.[key];
              if (!criterion) return null;
              const value = typeof criterion.score === 'number' && Number.isFinite(criterion.score)
                ? Math.max(0, Math.min(25, criterion.score))
                : null;
              const tone = value === null ? 'bg-muted-foreground' : value >= 20 ? 'bg-success' : value >= 13 ? 'bg-warning' : 'bg-danger';
              const textTone = value === null ? 'text-muted-foreground' : value >= 20 ? 'text-success' : value >= 13 ? 'text-warning' : 'text-danger';
              return (
                <div key={key}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <h3 className="font-semibold text-foreground">{label}</h3>
                    <span className={`shrink-0 font-bold num ${textTone}`}>{value === null ? '—' : `${value}/25`}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted-bg" role="progressbar" aria-label={`${label} score`} aria-valuemin={0} aria-valuemax={25} aria-valuenow={value ?? 0}>
                    {value !== null && <div className={`h-full rounded-full ${tone}`} style={{ width: `${(value / 25) * 100}%` }} />}
                  </div>
                  {criterion.comment && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{criterion.comment}</p>}
                </div>
              );
            })}
          </section>
        )}

        <section className="rounded-xl border border-border bg-muted-bg/50 p-4">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{approved ? 'Summary' : 'How to Improve'}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{review.feedback?.trim() || 'Evaluation feedback is not available.'}</p>
        </section>

        {details.map(({ key, title, value }) => <OptionalDetail key={key} title={title} value={value} />)}

        <div className="flex flex-wrap gap-2">
          {approved ? (
            isAuthenticated ? (
              onInvest ? (
                <Button type="button" onClick={onInvest} className="bg-primary text-primary-foreground hover:bg-primary-hover">Invest in Portfolio</Button>
              ) : (
                <Link href={`/portfolio?trade=buy&symbol=${encodeURIComponent(symbol)}`}><Button type="button" className="bg-primary text-primary-foreground hover:bg-primary-hover">Invest in Portfolio</Button></Link>
              )
            ) : (
              <Link href="/signup"><Button type="button" className="bg-primary text-primary-foreground hover:bg-primary-hover">Create an account to invest</Button></Link>
            )
          ) : onRevise ? (
            <Button type="button" variant="outline" onClick={onRevise}>Revise pitch</Button>
          ) : (
            <Link href={`/fund-manager?symbol=${encodeURIComponent(symbol)}`}><Button type="button" variant="outline">Revise pitch</Button></Link>
          )}
        </div>

        {!isAuthenticated && <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">Log in to save your pitch history and invest with your virtual portfolio.</p>}
      </CardContent>
    </Card>
  );
}

function OptionalDetail({ title, value }: { title: string; value: unknown }) {
  const rows = normalizeDetail(value);
  if (!rows.length) return null;
  return (
    <section className="rounded-xl border border-border p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-foreground">
        {rows.map((row, index) => <li key={`${title}-${index}`} className="flex gap-2"><span aria-hidden="true" className="text-primary-text">•</span><span>{row}</span></li>)}
      </ul>
    </section>
  );
}

function normalizeDetail(value: unknown): string[] {
  if (typeof value === 'string') return value.trim() ? value.split(/\n+/).map((part) => part.trim()).filter(Boolean) : [];
  if (typeof value === 'number' || typeof value === 'boolean') return [String(value)];
  if (Array.isArray(value)) return value.flatMap(normalizeDetail);
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => {
      const entries = normalizeDetail(item);
      return entries.map((entry) => `${humanize(key)}: ${entry}`);
    });
  }
  return [];
}

function humanize(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
