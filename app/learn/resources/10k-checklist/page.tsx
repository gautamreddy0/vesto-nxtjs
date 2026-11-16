'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const checklistGroups = [
  {
    title: 'Business · Item 1',
    items: [
      'Can I explain how the company makes money and who its customers are?',
      'What are the company’s main products, services and revenue streams?',
      'Which markets and competitors matter most to the business?',
      'What evidence supports management’s claims about competitive advantages?',
    ],
  },
  {
    title: 'Risk Factors · Item 1A',
    items: [
      'Which risks are most specific and material to this company?',
      'Have important risks changed or become more prominent since the prior filing?',
      'Could any disclosed risk materially affect revenue, costs, assets or cash flow?',
      'Are customer, supplier, regulatory or cybersecurity exposures concentrated?',
    ],
  },
  {
    title: 'MD&A · Item 7',
    items: [
      'What drove changes in revenue, margins and operating expenses?',
      'Do management’s explanations align with the financial statements?',
      'How does the company describe liquidity, capital resources and debt needs?',
      'Are there known trends, commitments or uncertainties to monitor?',
    ],
  },
  {
    title: 'Financial Statements · Item 8',
    items: [
      'Are revenue and earnings supported by operating cash flow?',
      'How have margins, working capital and balance-sheet leverage changed?',
      'What accounting estimates, commitments or contingencies deserve attention?',
      'Do the auditor’s opinion and internal-control disclosures raise concerns?',
    ],
  },
];

const checklistItems = checklistGroups.flatMap((group) => group.items.map((text) => `${group.title}:${text}`));
const storageKey = 'vesto-10k-checklist';
const legacyStorageKey = ['invest', 'wise-10k-checklist'].join('');

function readChecked(): Record<string, boolean> {
  try {
    const stored = window.localStorage.getItem(storageKey);
    const legacy = stored == null ? window.localStorage.getItem(legacyStorageKey) : null;
    const parsed: unknown = JSON.parse(stored ?? legacy ?? '{}');
    if (stored == null && legacy != null) {
      try {
        window.localStorage.setItem(storageKey, legacy);
        window.localStorage.removeItem(legacyStorageKey);
      } catch {
        // Use the old checklist value in memory if migration storage is unavailable.
      }
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean'));
  } catch {
    return {};
  }
}

export default function TenKChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setChecked(readChecked());
    setReady(true);
  }, []);

  const completedCount = checklistItems.filter((item) => checked[item]).length;

  const toggleItem = (key: string) => {
    setChecked((current) => {
      const next = { ...current, [key]: !current[key] };
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Keep current checklist state in memory when storage is disabled.
      }
      return next;
    });
  };

  const resetChecklist = () => {
    setChecked({});
    try {
      window.localStorage.removeItem(storageKey);
      window.localStorage.removeItem(legacyStorageKey);
    } catch {
      // Reset remains effective for the current page session.
    }
  };

  return (
    <div className="mx-auto max-w-[900px] space-y-6 pb-20 md:pb-6">
      <Link href="/learn" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Back to Learn</Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent-text">Learn · Resource</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground">10-K Analysis Checklist</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Use these questions to guide a focused review of an annual report.</p>
        </div>
        <Button type="button" variant="outline" onClick={resetChecklist} className="gap-2"><RotateCcw className="h-4 w-4" /> Reset</Button>
      </header>
      <div className="h-2 overflow-hidden rounded-full bg-muted-bg" role="progressbar" aria-label="Checklist completion" aria-valuemin={0} aria-valuemax={checklistItems.length} aria-valuenow={completedCount}>
        <div className="h-full rounded-full bg-success transition-[width]" style={{ width: `${(completedCount / checklistItems.length) * 100}%` }} />
      </div>
      <p className="-mt-4 text-right text-xs text-muted-foreground">{ready ? completedCount : 0} of {checklistItems.length} complete</p>
      <div className="space-y-4">
        {checklistGroups.map((group, groupIndex) => (
          <Card key={group.title} className="border-border shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="font-display text-lg">{group.title}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {group.items.map((text, itemIndex) => {
                const key = `${group.title}:${text}`;
                return (
                  <label key={key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted-bg/50">
                    <input type="checkbox" checked={Boolean(checked[key])} onChange={() => toggleItem(key)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--success)]" />
                    <span className={`text-sm leading-relaxed ${checked[key] ? 'text-muted-foreground line-through decoration-success/60' : 'text-foreground'}`}>
                      <span className="mr-2 text-xs font-semibold text-muted-foreground">{groupIndex * 4 + itemIndex + 1}.</span>{text}
                    </span>
                  </label>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
