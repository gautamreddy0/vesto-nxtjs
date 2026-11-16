'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BrainCircuit, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { CompanyEntry } from '@/lib/hooks/use-companies';
import { limitPitchText, PITCH_MAX_CHARS } from '@/lib/ai/limits';
import { formatRatioPercent } from '@/lib/markets/selectors';

const checklist = [
  'Fundamental analysis',
  'Valuation & risk review',
  'AI investment score (0–100)',
  'Actionable feedback',
];

interface AiFundManagerCtaProps {
  companyData: CompanyEntry;
  compact?: boolean;
}

export function AiFundManagerCta({ companyData, compact = false }: AiFundManagerCtaProps) {
  const { company, fundamentals } = companyData;
  const symbol = company.symbol.toUpperCase();
  const [draft, setDraft] = useState('');
  const [draftWarning, setDraftWarning] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [samplePitch, setSamplePitch] = useState('');

  const draftKey = `pitch-draft:${symbol}`;
  const template = useMemo(() => buildSamplePitch(company.name, symbol, fundamentals), [company.name, fundamentals, symbol]);

  useEffect(() => {
    try {
      const storedDraft = window.localStorage.getItem(draftKey) ?? '';
      setDraft(limitPitchText(storedDraft));
      setDraftWarning(storedDraft.length > PITCH_MAX_CHARS);
    } catch {
      setDraft('');
      setDraftWarning(false);
    }
  }, [draftKey]);

  const updateDraft = (value: string) => {
    const next = limitPitchText(value);
    setDraft(next);
    setDraftWarning(value.length > PITCH_MAX_CHARS);
    try {
      window.localStorage.setItem(draftKey, next);
    } catch {
      // Draft remains available for the current page session when storage is disabled.
    }
  };

  const useTemplate = () => {
    setDialogOpen(false);
    updateDraft(samplePitch || template);
  };

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <CardHeader className={compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-bg text-accent-text">
              <BrainCircuit aria-hidden="true" className="h-6 w-6" />
            </span>
            <div>
              <CardTitle className="font-display text-xl">AI Fund Manager</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Build a thesis for {company.name} ({symbol}) and request an AI review.</p>
            </div>
          </div>
          <Link href="/#how-it-works" className="text-sm font-medium text-primary-text outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">How it works</Link>
        </div>
      </CardHeader>
      <CardContent className={compact ? 'grid gap-6 p-4 pt-0 sm:p-5 sm:pt-0 lg:grid-cols-[1.2fr_0.8fr]' : 'grid gap-6 p-5 pt-0 sm:p-6 sm:pt-0 lg:grid-cols-[1.2fr_0.8fr]'}>
        <div>
          <label htmlFor={`pitch-${symbol}`} className="mb-2 block text-sm font-medium text-foreground">Pitch: {company.name} ({symbol})</label>
          <Textarea
            id={`pitch-${symbol}`}
            value={draft}
            onChange={(event) => updateDraft(event.target.value)}
            rows={5}
            placeholder="Describe the business, financial evidence, key risks and your investment thesis..."
            className="resize-y"
          />
          <p className={`mt-1 text-right text-xs num ${draft.length >= PITCH_MAX_CHARS ? 'font-semibold text-danger' : draft.length > 5_500 ? 'font-semibold text-warning' : 'text-muted-foreground'}`}>{draft.length.toLocaleString('en-US')} / {PITCH_MAX_CHARS.toLocaleString('en-US')} characters</p>
          {draftWarning && <p role="status" className="mt-1 text-xs font-medium text-warning">Your pitch was shortened to {PITCH_MAX_CHARS.toLocaleString('en-US')} characters.</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/fund-manager?symbol=${encodeURIComponent(symbol)}`}>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
                Get AI Evaluation <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Link>
            <Button type="button" variant="outline" onClick={() => { setSamplePitch(template); setDialogOpen(true); }}>
              View Sample Pitch
            </Button>
          </div>
        </div>

        <ul className="grid content-center gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {checklist.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-accent-text" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sample investment pitch</DialogTitle>
            <DialogDescription>Illustrative wording with this company’s available reported metrics. Missing values are shown as em dashes.</DialogDescription>
          </DialogHeader>
          <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted-bg p-4 text-sm leading-relaxed text-foreground">{samplePitch || template}</pre>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={useTemplate}>Use this template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function buildSamplePitch(companyName: string, symbol: string, fundamentals: CompanyEntry['fundamentals']) {
  const display = (value: number | null | undefined, decimals = 2) => value == null || !Number.isFinite(value) ? '—' : value.toFixed(decimals);
  return [
    `Business\nDescribe ${companyName} (${symbol})’s business model and competitive position using company information.`,
    `Financials\nP/E: ${display(fundamentals?.pe_ratio)}x; ROE: ${formatRatioPercent(fundamentals?.roe, 1)}; gross margin: ${formatRatioPercent(fundamentals?.gross_margin, 1)}; operating margin: ${formatRatioPercent(fundamentals?.operating_margin, 1)}; revenue growth (YoY): ${formatRatioPercent(fundamentals?.revenue_growth_yoy, 1)}; debt/equity: ${display(fundamentals?.debt_to_equity)}x.`,
    'Risks\nIdentify the company’s material risks and explain how they could affect the thesis.',
    'Thesis\nExplain the investment rationale and the evidence that would change your view.',
  ].join('\n\n');
}
