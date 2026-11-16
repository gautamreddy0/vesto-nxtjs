import { FundManagerContent } from '@/components/fund-manager/fund-manager-content';

export default async function FundManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string }>;
}) {
  const { symbol = '' } = await searchParams;

  return <FundManagerContent initialSymbol={symbol} />;
}
