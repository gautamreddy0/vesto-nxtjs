import Image from 'next/image';

import { cn } from '@/lib/utils';

interface CompanyLogoProps {
  symbol: string;
  logo: string | null | undefined;
  size?: 'sm' | 'lg';
  className?: string;
}

export function CompanyLogo({ symbol, logo, size = 'sm', className }: CompanyLogoProps) {
  const dimensions = size === 'lg' ? 64 : 40;
  const tileSize = size === 'lg' ? 'h-16 w-16 rounded-2xl text-xl' : 'h-10 w-10 rounded-xl text-sm';

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-border font-display font-bold text-primary-text',
        logo ? 'bg-logo-surface' : 'bg-accent-bg',
        tileSize,
        className,
      )}
    >
      {logo ? (
        <Image
          src={logo}
          alt={`${symbol} logo`}
          width={dimensions}
          height={dimensions}
          sizes={`${dimensions}px`}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <span aria-label={`${symbol} monogram`}>{symbol.slice(0, 1).toUpperCase()}</span>
      )}
    </span>
  );
}
