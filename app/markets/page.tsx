import { MarketsPage } from '@/components/markets/markets-page';

export default async function MarketsRoute({ searchParams }: { searchParams: Promise<{ symbol?: string }> }) {
  const { symbol = '' } = await searchParams;
  return <MarketsPage initialSymbol={symbol} />;
}
