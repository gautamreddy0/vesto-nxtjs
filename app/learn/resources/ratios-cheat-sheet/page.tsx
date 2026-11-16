'use client';

import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const groups = [
  {
    title: 'Valuation',
    rows: [
      ['P/E', 'Share price ÷ EPS', 'Price paid for each dollar of earnings.', 'Compare with peers and growth; no universal ideal.'],
      ['Forward P/E', 'Share price ÷ forecast EPS', 'Valuation using expected earnings.', 'Compare forecasts with guidance and history.'],
      ['PEG', 'P/E ÷ expected EPS growth (%)', 'Valuation relative to expected growth.', 'Below 1 can be a prompt for research, not a buy signal.'],
      ['P/B', 'Market capitalization ÷ equity', 'Market value relative to book equity.', 'Often more useful for asset-heavy businesses.'],
      ['P/S', 'Market capitalization ÷ revenue', 'Market value relative to annual sales.', 'Always assess margins and profitability.'],
      ['Dividend yield', 'Annual dividend per share ÷ share price', 'Cash dividend relative to share price.', 'Check payout coverage and sustainability.'],
    ],
  },
  {
    title: 'Profitability',
    rows: [
      ['Gross margin', '(Revenue − cost of revenue) ÷ revenue', 'Profit remaining after direct costs.', 'Compare within an industry and over time.'],
      ['Operating margin', 'Operating income ÷ revenue', 'Operating efficiency before interest and tax.', 'Stable or rising trends can indicate resilience.'],
      ['Net margin', 'Net income ÷ revenue', 'Share of revenue left as net income.', 'Consider unusual gains, taxes and financing.'],
      ['ROE', 'Net income ÷ average equity', 'Return generated on shareholder equity.', 'Check leverage and compare with industry peers.'],
      ['ROA', 'Net income ÷ average assets', 'Earnings generated from company assets.', 'Asset-light sectors may naturally be higher.'],
    ],
  },
  {
    title: 'Health',
    rows: [
      ['Debt-to-equity', 'Total debt ÷ shareholders’ equity', 'Leverage relative to owners’ capital.', 'Sector context and debt maturities matter.'],
      ['Current ratio', 'Current assets ÷ current liabilities', 'Short-term assets available for obligations.', 'Above 1 means current assets exceed liabilities.'],
      ['Quick ratio', '(Cash + securities + receivables) ÷ current liabilities', 'Near-term liquidity excluding inventory.', 'Interpret based on the operating cycle.'],
      ['Free cash flow', 'Operating cash flow − capital expenditures', 'Cash left after investment in the business.', 'Look for consistent, sustainable generation.'],
    ],
  },
  {
    title: 'Growth',
    rows: [
      ['Revenue growth', '(Current revenue − prior revenue) ÷ prior revenue', 'Change in sales between periods.', 'Separate organic growth from acquisitions and FX.'],
      ['EPS growth', '(Current EPS − prior EPS) ÷ prior EPS', 'Change in earnings per share.', 'Check share-count changes and earnings quality.'],
    ],
  },
];

export default function RatiosCheatSheetPage() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-6 pb-20 md:pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/learn" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Back to Learn</Link>
        <Button type="button" variant="outline" onClick={() => window.print()} className="gap-2"><Printer className="h-4 w-4" /> Print cheat sheet</Button>
      </div>
      <header>
        <p className="text-sm font-semibold text-accent-text">Learn · Resource</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground">Financial Ratios Cheat Sheet</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">A quick reference for common financial ratios. Typical interpretations vary by sector, accounting choices and business model; use these as prompts for analysis, not standalone rules.</p>
      </header>
      <div className="space-y-5">
        {groups.map((group) => (
          <Card key={group.title} className="overflow-hidden border-border shadow-sm print:break-inside-avoid print:border-slate-300 print:shadow-none">
            <div className="border-b border-border bg-muted-bg/60 px-4 py-3 print:bg-slate-100"><h2 className="font-display font-bold text-foreground">{group.title}</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Ratio</th><th className="px-4 py-3">Formula</th><th className="px-4 py-3">What it tells you</th><th className="px-4 py-3">Typical range / context</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {group.rows.map(([ratio, formula, meaning, context]) => (
                    <tr key={ratio} className="align-top"><th scope="row" className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">{ratio}</th><td className="px-4 py-3 text-muted-foreground">{formula}</td><td className="px-4 py-3 text-muted-foreground">{meaning}</td><td className="px-4 py-3 text-muted-foreground">{context}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground print:hidden">Educational reference only; ratios are not investment recommendations.</p>
    </div>
  );
}
