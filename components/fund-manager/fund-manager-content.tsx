'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BrainCircuit, CheckCircle2 } from 'lucide-react';

import { InvestmentCommitteeMemo, type PitchMemoData } from '@/components/fund-manager/investment-committee-memo';
import { CompanyHeader } from '@/components/markets/company-header';
import { CompanyLogo } from '@/components/markets/company-logo';
import { TradeDialog } from '@/components/portfolio/trade-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useCompanies } from '@/lib/hooks/use-companies';
import { usePortfolio } from '@/lib/hooks/use-portfolio';
import { usePortfolioStore } from '@/lib/hooks/use-portfolio-store';
import { useUser } from '@/lib/hooks/use-user';
import { limitPitchText, PITCH_MAX_CHARS } from '@/lib/ai/limits';
import { getExtras } from '@/lib/markets/selectors';
import { formatCurrency } from '@/lib/utils/format';

const evaluationCriteria = [
  'Business understanding',
  'Financial analysis',
  'Risk assessment',
  'Investment thesis',
];

function saveDemoApproval(symbol: string) {
  try {
    const key = 'vesto-demo-approved';
    const existing: unknown = JSON.parse(window.localStorage.getItem(key) ?? '[]');
    const approved = Array.isArray(existing)
      ? existing.filter((value): value is string => typeof value === 'string')
      : [];
    const normalized = symbol.toUpperCase();
    if (!approved.some((value) => value.toUpperCase() === normalized)) {
      window.localStorage.setItem(key, JSON.stringify([...approved, normalized]));
    }
  } catch {
    // Keep pitch review usable if local browser storage is unavailable.
  }
}

function saveLatestPitch(symbol: string, companyName: string, review: PitchMemoData, pitchText: string, submissionId?: number) {
  if (!review || (review.status !== 'approved' && review.status !== 'rejected' && review.status !== 'pending')) return;
  try {
    window.localStorage.setItem('vesto-last-pitch', JSON.stringify({
      symbol,
      companyName,
      status: review.status,
      score: typeof review.score === 'number' && Number.isFinite(review.score) ? review.score : null,
      feedback: typeof review.feedback === 'string' ? review.feedback : '',
      criteria: review.criteria ?? null,
      strengths: review.strengths,
      gaps: review.gaps,
      key_risks: review.key_risks,
      metric_checks: review.metric_checks,
      next_steps: review.next_steps,
      pitchText,
      submissionId: typeof submissionId === 'number' ? submissionId : null,
      submittedAt: new Date().toISOString(),
    }));
  } catch {
    // Keep the pitch review available in the current page if storage is blocked.
  }
}

export function FundManagerContent({ initialSymbol = '' }: { initialSymbol?: string }) {
  const { companies, companyMap, data: companyEntries } = useCompanies();
  const { availableCash } = usePortfolio();
  const portfolioStore = usePortfolioStore();
  const { user, isAuthenticated } = useUser();
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol.toUpperCase() || companies[0]?.symbol || '');
  const [pitch, setPitch] = useState([
    'Business\nDescribe the company’s business model and competitive position.',
    'Financials\nSummarize key financial evidence and valuation assumptions.',
    'Risks\nIdentify material risks and explain how they could affect your view.',
    'Thesis\nState your investment rationale and what could change your mind.',
  ].join('\n\n'));
  const [feedback, setFeedback] = useState<any>(null);
  const [evaluatedPitch, setEvaluatedPitch] = useState<string | null>(null);
  const [pitchWarning, setPitchWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);

  const selectedCompany = useMemo(
    () => companyMap[selectedSymbol] ?? (companies[0] ? companyMap[companies[0].symbol] : undefined),
    [companyMap, companies, selectedSymbol],
  );

  useEffect(() => {
    if (!selectedSymbol && companies[0]) setSelectedSymbol(companies[0].symbol);
  }, [companies, selectedSymbol]);

  useEffect(() => {
    if (!selectedSymbol) return;
    try {
      const storedDraft = window.localStorage.getItem(`pitch-draft:${selectedSymbol}`);
      const nextPitch = limitPitchText(storedDraft ?? [
        'Business\nDescribe the company’s business model and competitive position.',
        'Financials\nSummarize key financial evidence and valuation assumptions.',
        'Risks\nIdentify material risks and explain how they could affect your view.',
        'Thesis\nState your investment rationale and what could change your mind.',
      ].join('\n\n'));
      setPitch(nextPitch);
      setPitchWarning(Boolean(storedDraft && storedDraft.length > PITCH_MAX_CHARS));
      setFeedback(null);
      setEvaluatedPitch(null);
    } catch {
      setPitch('');
      setPitchWarning(false);
    }
  }, [selectedSymbol]);

  const handleSubmit = async () => {
    if (!selectedCompany || !pitch.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/simulator/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          symbol: selectedCompany.company.symbol,
          companyName: selectedCompany.company.name,
          pitchText: pitch,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result?.details || result?.error || 'Unable to review pitch');
      const review = result?.data?.review ?? null;
      setFeedback(review);
      setEvaluatedPitch(pitch);
      if (review) {
        saveLatestPitch(selectedCompany.company.symbol, selectedCompany.company.name, review, pitch, result?.data?.submission?.id);
      }
      if (review?.status === 'approved' && selectedCompany?.company.symbol) {
        saveDemoApproval(selectedCompany.company.symbol);
      }
    } catch (error: any) {
      setFeedback({ status: 'rejected', message: error.message || 'Unable to review this pitch.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <header className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-bg text-accent-text">
          <BrainCircuit aria-hidden="true" className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">AI Fund Manager</h1>
          <p className="mt-1 text-muted-foreground">Build an evidence-based thesis and request a structured investment review.</p>
        </div>
      </header>

      {selectedCompany && <CompanyHeader companyData={selectedCompany} compact />}

      <div className="grid items-start gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="min-w-0 overflow-hidden shadow-sm">
          <CardHeader className="border-b border-border p-5">
            <CardTitle className="font-display text-lg">Choose a company</CardTitle>
            <p className="text-sm text-muted-foreground">Select the company your thesis is about.</p>
          </CardHeader>
          <CardContent className="max-h-[720px] space-y-2 overflow-y-auto p-3">
            {companies.map((company) => {
              const isSelected = selectedSymbol === company.symbol;
              return (
                <button
                  key={company.symbol}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedSymbol(company.symbol)}
                  className={`relative flex w-full items-center gap-3 rounded-xl border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? 'border-primary bg-accent-bg before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-r-full before:bg-primary' : 'border-border bg-card hover:bg-muted-bg'}`}
                >
                  <CompanyLogo symbol={company.symbol} logo={company.logo ?? getExtras(company.symbol)?.logo} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-foreground">{company.symbol}</span>
                    <span className="block truncate text-xs text-muted-foreground">{company.name}</span>
                  </span>
                  <span className={`text-xs font-semibold num ${company.quote?.percent_change == null ? 'text-muted-foreground' : company.quote.percent_change >= 0 ? 'text-success' : 'text-danger'}`}>
                    {company.quote?.percent_change == null ? '—' : `${company.quote.percent_change > 0 ? '+' : ''}${company.quote.percent_change.toFixed(2)}%`}
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden shadow-sm">
          <CardHeader className="border-b border-border p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-bg text-accent-text">
                  <BrainCircuit aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle className="font-display text-xl">Build your investment case</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedCompany ? `${selectedCompany.company.name} (${selectedCompany.company.symbol})` : 'Select a company to begin'}
                  </p>
                </div>
              </div>
              <Badge variant={isAuthenticated ? 'brand' : 'neutral'}>{isAuthenticated ? 'Investor workspace' : 'Demo mode'}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="rounded-xl border border-border bg-muted-bg/70 p-4 text-sm text-muted-foreground">
              {isAuthenticated ? `Available cash: ${formatCurrency(availableCash)}` : 'Pitch review is available in demo mode. Your draft stays in this browser.'}
            </div>

            <div>
              <label htmlFor="fund-manager-pitch" className="mb-2 block text-sm font-semibold text-foreground">Investment thesis</label>
              <Textarea
                id="fund-manager-pitch"
                value={pitch}
                onChange={(event) => {
                  const rawPitch = event.target.value;
                  const nextPitch = limitPitchText(rawPitch);
                  setPitch(nextPitch);
                  setPitchWarning(rawPitch.length > PITCH_MAX_CHARS);
                  try {
                    window.localStorage.setItem(`pitch-draft:${selectedSymbol}`, nextPitch);
                  } catch {
                    // Keep the draft in component state when browser storage is unavailable.
                  }
                }}
                rows={11}
                placeholder="Explain the business, support your view with company financials, identify key risks, and state your investment thesis."
                className="min-h-[240px] resize-y rounded-xl bg-background leading-relaxed"
              />
              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>Use company-specific facts and explain your assumptions.</span>
                <span className={`shrink-0 num ${pitch.length >= PITCH_MAX_CHARS ? 'font-semibold text-danger' : pitch.length > 5_500 ? 'font-semibold text-warning' : ''}`}>{pitch.length.toLocaleString('en-US')} / {PITCH_MAX_CHARS.toLocaleString('en-US')}</span>
              </div>
              {pitchWarning && <p role="status" className="mt-1 text-xs font-medium text-warning">Your pitch was shortened to {PITCH_MAX_CHARS.toLocaleString('en-US')} characters.</p>}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted-bg">
                <div className={`h-full rounded-full transition-[width] ${pitch.length >= PITCH_MAX_CHARS ? 'bg-danger' : pitch.length > 5_500 ? 'bg-warning' : 'bg-accent'}`} style={{ width: `${Math.min(100, (pitch.length / PITCH_MAX_CHARS) * 100)}%` }} />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {evaluationCriteria.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-accent-text" />
                  {item}
                </div>
              ))}
            </div>

            <Button onClick={handleSubmit} disabled={loading || pitch.trim().length < 50 || !selectedCompany} className="w-full gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary-hover sm:w-auto sm:px-7">
              {loading ? 'Reviewing pitch…' : 'Submit for AI Evaluation'}
              {!loading && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
            </Button>

            {feedback && selectedCompany && (
              <div id="pitch-evaluation">
                <InvestmentCommitteeMemo
                  review={feedback}
                  symbol={selectedCompany.company.symbol}
                  pitchText={evaluatedPitch ?? undefined}
                  isAuthenticated={isAuthenticated}
                  onInvest={() => setTradeOpen(true)}
                  onRevise={() => {
                    document.getElementById('fund-manager-pitch')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    document.getElementById('fund-manager-pitch')?.focus();
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {portfolioStore.summary && (
        <TradeDialog
          open={tradeOpen}
          onOpenChange={setTradeOpen}
          initialMode="buy"
          initialSymbol={selectedSymbol}
          summary={portfolioStore.summary}
          companies={companyEntries ?? []}
          onBuy={portfolioStore.buy}
          onSell={portfolioStore.sell}
        />
      )}
    </div>
  );
}
