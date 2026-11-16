import type { LucideIcon } from 'lucide-react';

export interface StatItemProps {
  icon: LucideIcon;
  value: string;
  label: React.ReactNode;
  compactDesktop?: boolean;
}

export function StatItem({ icon: Icon, value, label, compactDesktop = false }: StatItemProps) {
  return (
    <div className={`hiw-stat flex items-center gap-[18px] px-[22px] ${compactDesktop ? 'min-[1101px]:gap-3 min-[1101px]:px-3' : ''}`}>
      <span className={`hiw-stat-icon grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full ${compactDesktop ? 'min-[1101px]:h-14 min-[1101px]:w-14' : ''}`}>
        <Icon aria-hidden="true" className={`h-8 w-8 ${compactDesktop ? 'min-[1101px]:h-6 min-[1101px]:w-6' : ''}`} strokeWidth={1.8} />
      </span>
      <div>
        <dt className={`font-display text-[40px] font-extrabold leading-none tracking-[-0.01em] text-white num max-[639px]:text-[34px] ${compactDesktop ? 'min-[1101px]:text-[34px]' : ''}`}>{value}</dt>
        <dd className={`mt-2 text-base leading-[1.35] text-white/85 ${compactDesktop ? 'min-[1101px]:mt-1 min-[1101px]:text-sm' : ''}`}>{label}</dd>
      </div>
    </div>
  );
}
