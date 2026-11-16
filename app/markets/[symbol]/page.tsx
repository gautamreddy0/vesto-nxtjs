import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CompanyDetailPage } from '@/components/markets/company-detail-page';
import { COMPANY_EXTRAS } from '@/lib/data/company-extras';
import { FALLBACK_COMPANIES } from '@/lib/mock-data/fallback-companies';

interface RouteProps {
  params: Promise<{ symbol: string }>;
}

function getKnownCompanyName(symbol: string) {
  return FALLBACK_COMPANIES.find((entry) => entry.company.symbol === symbol)?.company.name ?? symbol;
}

function isKnownSymbol(symbol: string) {
  return Boolean(COMPANY_EXTRAS[symbol] || FALLBACK_COMPANIES.some((entry) => entry.company.symbol === symbol));
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { symbol: routeSymbol } = await params;
  const symbol = routeSymbol.toUpperCase();
  if (!isKnownSymbol(symbol)) return { title: 'Company not found · Markets' };
  const name = getKnownCompanyName(symbol);
  return { title: `${name} (${symbol}) · Markets` };
}

export default async function CompanyDetailRoute({ params }: RouteProps) {
  const { symbol: routeSymbol } = await params;
  const symbol = routeSymbol.toUpperCase();
  if (!isKnownSymbol(symbol)) notFound();
  return <CompanyDetailPage symbol={symbol} />;
}
