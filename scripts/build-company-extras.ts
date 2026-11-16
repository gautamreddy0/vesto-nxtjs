import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

interface CompanyExtras {
  symbol: string;
  logo: string | null;
  website: string | null;
  ipo: string | null;
  country: string | null;
  exchange: string | null;
  snapshotDate: string;
  recommendations: {
    period: string;
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
  } | null;
  latest10K: { filedDate: string; reportUrl: string; filingUrl: string } | null;
  annual: Array<{
    fiscalYear: number;
    revenue: number | null;
    netIncome: number | null;
    operatingIncome: number | null;
    operatingCashFlow: number | null;
    totalAssets: number | null;
    equity: number | null;
    cash: number | null;
    longTermDebt: number | null;
  }>;
  news: Array<{ headline: string; source: string; url: string; datetime: number }>;
}

const revenueConcepts = [
  'us-gaap_RevenueFromContractWithCustomerExcludingAssessedTax',
  'us-gaap_Revenues',
  'us-gaap_SalesRevenueNet',
  'us-gaap_RevenueFromContractWithCustomerIncludingAssessedTax',
] as const;

const netIncomeConcepts = ['us-gaap_NetIncomeLoss', 'us-gaap_ProfitLoss'] as const;
const equityConcepts = [
  'us-gaap_StockholdersEquity',
  'us-gaap_StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest',
] as const;

function parsePythonLiteral(text: string): unknown {
  let index = 0;

  const skipWhitespace = () => {
    while (/\s/.test(text[index] ?? '')) index += 1;
  };

  const parseString = (): string => {
    const quote = text[index];
    index += 1;
    let value = '';

    while (index < text.length) {
      const character = text[index];
      index += 1;
      if (character === quote) return value;
      if (character !== '\\') {
        value += character;
        continue;
      }

      const escaped = text[index];
      index += 1;
      const simpleEscapes: Record<string, string> = {
        n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v',
        '\\': '\\', "'": "'", '"': '"',
      };
      if (escaped in simpleEscapes) {
        value += simpleEscapes[escaped];
      } else if (escaped === 'u' || escaped === 'U') {
        const digits = escaped === 'u' ? 4 : 8;
        const code = Number.parseInt(text.slice(index, index + digits), 16);
        if (Number.isFinite(code)) value += String.fromCodePoint(code);
        index += digits;
      } else if (escaped === 'x') {
        const code = Number.parseInt(text.slice(index, index + 2), 16);
        if (Number.isFinite(code)) value += String.fromCharCode(code);
        index += 2;
      } else {
        value += escaped;
      }
    }

    throw new Error('Unterminated Python-style string literal');
  };

  const parseValue = (): unknown => {
    skipWhitespace();
    const character = text[index];

    if (character === "'" || character === '"') return parseString();

    if (character === '{') {
      index += 1;
      const result: Record<string, unknown> = {};
      skipWhitespace();
      while (text[index] !== '}') {
        skipWhitespace();
        const key = parseValue();
        if (typeof key !== 'string') throw new Error('Python-style dictionary keys must be strings');
        skipWhitespace();
        if (text[index] !== ':') throw new Error('Expected colon in Python-style dictionary');
        index += 1;
        result[key] = parseValue();
        skipWhitespace();
        if (text[index] === ',') {
          index += 1;
          skipWhitespace();
        } else if (text[index] !== '}') {
          throw new Error('Expected comma in Python-style dictionary');
        }
      }
      index += 1;
      return result;
    }

    if (character === '[' || character === '(') {
      const closing = character === '[' ? ']' : ')';
      index += 1;
      const result: unknown[] = [];
      skipWhitespace();
      while (text[index] !== closing) {
        result.push(parseValue());
        skipWhitespace();
        if (text[index] === ',') {
          index += 1;
          skipWhitespace();
        } else if (text[index] !== closing) {
          throw new Error('Expected comma in Python-style sequence');
        }
      }
      index += 1;
      return result;
    }

    const start = index;
    while (index < text.length && !/[\s,}:\])]/.test(text[index])) index += 1;
    const token = text.slice(start, index);
    if (token === 'None' || token === 'null') return null;
    if (token === 'True' || token === 'true') return true;
    if (token === 'False' || token === 'false') return false;
    if (/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(token)) return Number(token);
    throw new Error(`Unsupported Python-style literal token: ${token}`);
  };

  const result = parseValue();
  skipWhitespace();
  if (index !== text.length) throw new Error('Unexpected text after Python-style literal');
  return result;
}

function parsePossiblySerialized(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return parsePythonLiteral(trimmed);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  const parsed = parsePossiblySerialized(value);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? parsed as Record<string, unknown>
    : {};
}

function asArray(value: unknown): unknown[] {
  const parsed = parsePossiblySerialized(value);
  return Array.isArray(parsed) ? parsed : [];
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function optionalNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function conceptValue(statement: Record<string, unknown>, concepts: readonly string[]): number | null {
  for (const concept of concepts) {
    const metric = asRecord(statement[concept]);
    const value = optionalNumber(metric.value);
    if (value !== null) return value;
  }
  return null;
}

function buildAnnualReport(value: unknown): CompanyExtras['annual'][number] | null {
  const report = asRecord(value);
  const year = optionalNumber(report.year);
  if (year === null || String(report.form ?? '').toUpperCase() !== '10-K') return null;

  const balanceSheet = asRecord(report.balanceSheet);
  const incomeStatement = asRecord(report.incomeStatement);
  const cashFlow = asRecord(report.cashFlow);

  return {
    fiscalYear: year,
    revenue: conceptValue(incomeStatement, revenueConcepts),
    netIncome: conceptValue(incomeStatement, netIncomeConcepts),
    operatingIncome: conceptValue(incomeStatement, ['us-gaap_OperatingIncomeLoss']),
    operatingCashFlow: conceptValue(cashFlow, ['us-gaap_NetCashProvidedByUsedInOperatingActivities']),
    totalAssets: conceptValue(balanceSheet, ['us-gaap_Assets']),
    equity: conceptValue(balanceSheet, equityConcepts),
    cash: conceptValue(balanceSheet, ['us-gaap_CashAndCashEquivalentsAtCarryingValue']),
    longTermDebt: conceptValue(balanceSheet, ['us-gaap_LongTermDebtNoncurrent']),
  };
}

function buildCompanyExtras(symbol: string, value: unknown, snapshotDate: string): CompanyExtras {
  const company = asRecord(value);
  const profile = asRecord(company.profile);
  const rec = asRecord(company.recommendations);
  const recommendationCounts = ['strongBuy', 'buy', 'hold', 'sell', 'strongSell'] as const;
  const recommendations = recommendationCounts.every((key) => optionalNumber(rec[key]) !== null)
    ? {
        period: optionalString(rec.period) ?? '',
        strongBuy: optionalNumber(rec.strongBuy) as number,
        buy: optionalNumber(rec.buy) as number,
        hold: optionalNumber(rec.hold) as number,
        sell: optionalNumber(rec.sell) as number,
        strongSell: optionalNumber(rec.strongSell) as number,
      }
    : null;

  const filings = asRecord(company.filings);
  const filingList = asArray(filings.filings)
    .map(asRecord)
    .filter((filing) => String(filing.form ?? '').toUpperCase() === '10-K')
    .sort((a, b) => String(b.filedDate ?? '').localeCompare(String(a.filedDate ?? '')));
  const latestFiling = filingList[0];
  const latest10K = latestFiling
    ? {
        filedDate: optionalString(latestFiling.filedDate) ?? '',
        reportUrl: optionalString(latestFiling.reportUrl) ?? '',
        filingUrl: optionalString(latestFiling.filingUrl) ?? '',
      }
    : null;

  const financials = asRecord(company.financials);
  const annual = asArray(financials.reports)
    .map(buildAnnualReport)
    .filter((report): report is CompanyExtras['annual'][number] => report !== null)
    .sort((a, b) => a.fiscalYear - b.fiscalYear);

  const news = asArray(asRecord(company.news).articles)
    .map(asRecord)
    .map((article) => ({
      headline: optionalString(article.headline),
      source: optionalString(article.source),
      url: optionalString(article.url),
      datetime: optionalNumber(article.datetime),
    }))
    .filter((article): article is { headline: string; source: string; url: string; datetime: number } =>
      article.headline !== null && article.source !== null && article.url !== null && article.datetime !== null,
    )
    .sort((a, b) => b.datetime - a.datetime)
    .slice(0, 5);

  return {
    symbol,
    logo: optionalString(profile.logo),
    website: optionalString(profile.website),
    ipo: optionalString(profile.ipo),
    country: optionalString(profile.country),
    exchange: optionalString(profile.exchange),
    snapshotDate,
    recommendations,
    latest10K: latest10K?.reportUrl && latest10K.filingUrl ? latest10K : null,
    annual,
    news,
  };
}

async function main() {
  const sourcePath = path.resolve(process.cwd(), '..', 'vesto_finnhub_20_companies.json');
  const outputPath = path.resolve(process.cwd(), 'lib', 'data', 'company-extras.ts');
  const source = JSON.parse(await readFile(sourcePath, 'utf8')) as Record<string, unknown>;
  const snapshotDate = typeof source.extracted_at === 'string' ? source.extracted_at : '';
  const companies = asRecord(source.companies);
  const extras: Record<string, CompanyExtras> = {};

  for (const [symbol, company] of Object.entries(companies)) {
    extras[symbol] = buildCompanyExtras(symbol, company, snapshotDate);
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  const generated = `/* Generated by scripts/build-company-extras.ts. Do not edit by hand. */\nexport interface CompanyExtras {\n  symbol: string;\n  logo: string | null;\n  website: string | null;\n  ipo: string | null;\n  country: string | null;\n  exchange: string | null;\n  snapshotDate: string;\n  recommendations: { period: string; strongBuy: number; buy: number; hold: number; sell: number; strongSell: number } | null;\n  latest10K: { filedDate: string; reportUrl: string; filingUrl: string } | null;\n  annual: Array<{ fiscalYear: number; revenue: number | null; netIncome: number | null; operatingIncome: number | null; operatingCashFlow: number | null; totalAssets: number | null; equity: number | null; cash: number | null; longTermDebt: number | null }>;\n  news: Array<{ headline: string; source: string; url: string; datetime: number }>;\n}\n\nexport const COMPANY_EXTRAS: Record<string, CompanyExtras> = ${JSON.stringify(extras, null, 2)};\n`;
  await writeFile(outputPath, generated, 'utf8');
  console.log(`Generated extras for ${Object.keys(extras).length} companies at ${path.relative(process.cwd(), outputPath)}.`);
}

main().catch((error: unknown) => {
  console.error('Unable to build company extras:', error);
  process.exitCode = 1;
});
