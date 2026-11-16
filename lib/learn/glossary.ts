import { METRIC_DEFINITIONS } from '@/lib/markets/metric-definitions';

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  formula?: string;
  ruleOfThumb: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  { id: 'pe-ratio', term: 'P/E Ratio', definition: METRIC_DEFINITIONS.pe_ratio, formula: 'Share price ÷ earnings per share', ruleOfThumb: 'Compare with companies in the same industry and consider growth and earnings quality.' },
  { id: 'forward-pe', term: 'Forward P/E', definition: METRIC_DEFINITIONS.forward_pe, formula: 'Share price ÷ forecast earnings per share', ruleOfThumb: 'Forecasts can be wrong; compare estimates with the company’s guidance and history.' },
  { id: 'peg-ratio', term: 'PEG Ratio', definition: METRIC_DEFINITIONS.peg_ratio, formula: 'P/E ratio ÷ expected annual EPS growth rate (%)', ruleOfThumb: 'A lower PEG can signal a lower price relative to growth, but growth quality matters.' },
  { id: 'pb-ratio', term: 'P/B Ratio', definition: METRIC_DEFINITIONS.pb_ratio, formula: 'Market capitalization ÷ shareholders’ equity', ruleOfThumb: 'Most useful for asset-heavy businesses; intangible assets can make comparisons misleading.' },
  { id: 'ps-ratio', term: 'P/S Ratio', definition: METRIC_DEFINITIONS.ps_ratio, formula: 'Market capitalization ÷ annual revenue', ruleOfThumb: 'Pair it with margins and a path to profitability; revenue alone is not profit.' },
  { id: 'eps', term: 'EPS', definition: METRIC_DEFINITIONS.eps, formula: '(Net income − preferred dividends) ÷ weighted average shares', ruleOfThumb: 'Review diluted EPS and multi-year trends, not just one period.' },
  { id: 'ebitda', term: 'EBITDA', definition: METRIC_DEFINITIONS.ebitda, formula: 'Net income + interest + taxes + depreciation + amortization', ruleOfThumb: 'It is not cash flow and excludes real costs such as capital expenditures.' },
  { id: 'roe', term: 'ROE', definition: METRIC_DEFINITIONS.roe, formula: 'Net income ÷ average shareholders’ equity', ruleOfThumb: 'Compare within an industry and check whether debt or buybacks inflate the ratio.' },
  { id: 'roa', term: 'ROA', definition: METRIC_DEFINITIONS.roa, formula: 'Net income ÷ average total assets', ruleOfThumb: 'Asset-light and asset-heavy industries naturally have different ROA levels.' },
  { id: 'gross-margin', term: 'Gross Margin', definition: METRIC_DEFINITIONS.gross_margin, formula: '(Revenue − cost of revenue) ÷ revenue', ruleOfThumb: 'Stable or rising margins can indicate pricing power or cost control; compare peers.' },
  { id: 'operating-margin', term: 'Operating Margin', definition: METRIC_DEFINITIONS.operating_margin, formula: 'Operating income ÷ revenue', ruleOfThumb: 'Look for durable trends and compare companies with similar business models.' },
  { id: 'net-margin', term: 'Net Margin', definition: METRIC_DEFINITIONS.net_profit_margin, formula: 'Net income ÷ revenue', ruleOfThumb: 'Check whether one-time gains, taxes or financing costs affect the comparison.' },
  { id: 'de-ratio', term: 'Debt-to-Equity (D/E)', definition: METRIC_DEFINITIONS.debt_to_equity, formula: 'Total debt ÷ shareholders’ equity', ruleOfThumb: 'Acceptable levels vary substantially by sector; examine debt maturities and cash flow.' },
  { id: 'current-ratio', term: 'Current Ratio', definition: METRIC_DEFINITIONS.current_ratio, formula: 'Current assets ÷ current liabilities', ruleOfThumb: 'A ratio above 1 means current assets exceed current liabilities, but asset quality matters.' },
  { id: 'quick-ratio', term: 'Quick Ratio', definition: METRIC_DEFINITIONS.quick_ratio, formula: '(Cash + marketable securities + receivables) ÷ current liabilities', ruleOfThumb: 'Interpret alongside working-capital needs and the company’s operating cycle.' },
  { id: 'free-cash-flow', term: 'Free Cash Flow', definition: METRIC_DEFINITIONS.free_cash_flow, formula: 'Operating cash flow − capital expenditures', ruleOfThumb: 'Assess consistency over time; a single period can be affected by timing.' },
  { id: 'operating-cash-flow', term: 'Operating Cash Flow', definition: METRIC_DEFINITIONS.operating_cash_flow, formula: 'Cash flow from operating activities (cash flow statement)', ruleOfThumb: 'Compare with net income to assess cash conversion and earnings quality.' },
  { id: 'beta', term: 'Beta', definition: METRIC_DEFINITIONS.beta, ruleOfThumb: 'Beta is backward-looking and does not predict future returns or total risk.' },
  { id: 'market-cap', term: 'Market Capitalization', definition: METRIC_DEFINITIONS.market_cap, formula: 'Share price × shares outstanding', ruleOfThumb: 'It measures equity value, not enterprise value or the company’s intrinsic worth.' },
  { id: '52-week-range', term: '52-Week Range', definition: METRIC_DEFINITIONS.week_52_range, ruleOfThumb: 'The range gives price context, not a valuation signal or forecast.' },
  { id: '10-k', term: '10-K', definition: METRIC_DEFINITIONS.sec_10k, ruleOfThumb: 'Read the business, risk factors, MD&A and audited financial statements together.' },
  { id: 'risk-factors', term: 'Risk Factors', definition: METRIC_DEFINITIONS.risk_factors, ruleOfThumb: 'Look for company-specific changes, prioritization and links to financial exposure.' },
  { id: 'mda', term: 'MD&A', definition: METRIC_DEFINITIONS.mda, ruleOfThumb: 'Compare management’s explanations with the figures and prior-year disclosures.' },
  { id: 'moat', term: 'Economic Moat', definition: METRIC_DEFINITIONS.moat, ruleOfThumb: 'Seek evidence such as customer retention, pricing power and sustained returns—not claims alone.' },
  { id: 'revenue-growth', term: 'Revenue Growth', definition: METRIC_DEFINITIONS.revenue_growth, formula: '(Current revenue − prior revenue) ÷ prior revenue × 100%', ruleOfThumb: 'Separate organic growth from acquisitions, currency effects and price changes.' },
  { id: 'dividend-yield', term: 'Dividend Yield', definition: METRIC_DEFINITIONS.dividend_yield, formula: 'Annual dividend per share ÷ share price × 100%', ruleOfThumb: 'A high yield can reflect a falling share price; assess payout coverage and sustainability.' },
  { id: 'dcf', term: 'DCF (Discounted Cash Flow)', definition: METRIC_DEFINITIONS.dcf, ruleOfThumb: 'Results are highly sensitive to assumptions; test a range of scenarios and discount rates.' },
  { id: 'intrinsic-value', term: 'Intrinsic Value', definition: METRIC_DEFINITIONS.intrinsic_value, ruleOfThumb: 'It is an estimate, not an observable fact; different assumptions produce different values.' },
  { id: 'margin-of-safety', term: 'Margin of Safety', definition: METRIC_DEFINITIONS.margin_of_safety, formula: '(Estimated value − price) ÷ estimated value', ruleOfThumb: 'A larger discount may reduce valuation risk but cannot eliminate business risk.' },
  { id: 'diversification', term: 'Diversification', definition: METRIC_DEFINITIONS.diversification, ruleOfThumb: 'Diversification can reduce concentration risk but does not guarantee gains or prevent losses.' },
];
