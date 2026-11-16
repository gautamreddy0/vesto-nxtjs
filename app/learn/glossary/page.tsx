'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GLOSSARY_TERMS } from '@/lib/learn/glossary';

function letterForTerm(term: string) {
  if (term.startsWith('10-K')) return 'T';
  if (term.startsWith('52-Week')) return 'F';
  return term.charAt(0).toUpperCase();
}

function sortLabel(term: string) {
  if (term.startsWith('10-K')) return `Ten ${term.slice(3)}`;
  if (term.startsWith('52-Week')) return `Fifty-Two ${term.slice(7)}`;
  return term;
}

export default function GlossaryPage() {
  const [query, setQuery] = useState('');
  const filteredTerms = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return GLOSSARY_TERMS
      .filter((item) => !normalized || `${item.term} ${item.definition} ${item.formula ?? ''} ${item.ruleOfThumb}`.toLowerCase().includes(normalized))
        .sort((left, right) => sortLabel(left.term).localeCompare(sortLabel(right.term)));
  }, [query]);
      const letters = [...new Set(filteredTerms.map((item) => letterForTerm(item.term)))].sort();

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 pb-20 md:pb-6">
      <Link href="/learn" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Back to Learn</Link>
      <header>
        <p className="text-sm font-semibold text-accent-text">Learn · Reference</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground">Glossary of Investing Terms</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Plain-language definitions, formulas and context for common investing and financial-analysis terms.</p>
      </header>

      <label className="flex h-11 max-w-xl items-center gap-2 rounded-lg border border-border bg-card px-3 shadow-sm focus-within:ring-2 focus-within:ring-ring">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search terms and definitions" aria-label="Search glossary" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </label>

      <nav aria-label="Jump to glossary letter" className="flex flex-wrap gap-1.5">
        {letters.map((letter) => (
          <a key={letter} href={`#letter-${letter}`} className="flex h-8 min-w-8 items-center justify-center rounded-md border border-border bg-card px-2 text-xs font-semibold text-primary hover:bg-muted-bg">{letter}</a>
        ))}
      </nav>

      <div className="grid gap-3 md:grid-cols-2">
        {filteredTerms.length ? filteredTerms.map((item, index) => {
          const letter = letterForTerm(item.term);
          const firstOfLetter = index === 0 || letterForTerm(filteredTerms[index - 1].term) !== letter;
          return (
            <Card key={item.id} id={item.id} className="scroll-mt-24 border-border shadow-sm">
              {firstOfLetter && <span id={`letter-${letter}`} className="sr-only">{letter}</span>}
              <CardHeader className="pb-2"><CardTitle className="font-display text-lg font-bold">{item.term}</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed">
                <p className="text-muted-foreground">{item.definition}</p>
                {item.formula && <p className="rounded-lg bg-muted-bg/70 px-3 py-2"><span className="font-semibold text-foreground">Formula: </span><span className="text-muted-foreground">{item.formula}</span></p>}
                <p><span className="font-semibold text-success">Rule of thumb: </span><span className="text-muted-foreground">{item.ruleOfThumb}</span></p>
              </CardContent>
            </Card>
          );
        }) : (
          <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground md:col-span-2">No glossary terms match “{query}”.</div>
        )}
      </div>
      <div><Link href="/learn"><Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Learn</Button></Link></div>
    </div>
  );
}
