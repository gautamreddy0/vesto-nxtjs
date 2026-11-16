import { CalendarDays, ExternalLink, Landmark, MapPin } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompanyEntry } from '@/lib/hooks/use-companies';
import { getExtras } from '@/lib/markets/selectors';

interface CompanyProfileCardProps {
  companyData?: CompanyEntry | null;
  compact?: boolean;
}

export function CompanyProfileCard({ companyData, compact = false }: CompanyProfileCardProps) {
  const company = companyData?.company;
  const extras = company ? getExtras(company.symbol) : null;
  const website = company?.website ?? extras?.website ?? null;
  const websiteDomain = website ? getDomain(website) : null;
  const ipo = company?.ipo ?? extras?.ipo ?? null;
  const listedYear = ipo ? new Date(ipo).getFullYear() : null;
  const country = company?.country ?? extras?.country ?? null;
  const exchange = company?.exchange ?? extras?.exchange ?? null;
  const business = companyData?.mock10k?.business_description;

  const chips = [
    country ? { label: country, icon: MapPin } : null,
    listedYear && Number.isFinite(listedYear) ? { label: `Listed ${listedYear}`, icon: CalendarDays } : null,
    exchange ? { label: exchange.split(/\s+/).slice(0, 3).join(' '), icon: Landmark } : null,
    website && websiteDomain ? { label: websiteDomain, icon: ExternalLink, href: website } : null,
  ].filter((chip): chip is NonNullable<typeof chip> => chip !== null);

  return (
    <Card className="min-w-0 shadow-sm">
      <CardHeader className={compact ? 'p-4 pb-3' : 'p-5 pb-3 sm:p-6 sm:pb-3'}>
        <CardTitle className="font-display text-lg">Company Profile</CardTitle>
      </CardHeader>
      <CardContent className={compact ? 'space-y-4 px-4 pb-4' : 'space-y-4 px-5 pb-5 sm:px-6 sm:pb-6'}>
        {business ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{business}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Company description unavailable.</p>
        )}
        {chips.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {chips.map(({ label, icon: Icon, href }) => (
              <li key={label}>
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted-bg px-2.5 py-1.5 text-xs text-foreground outline-none hover:bg-accent-bg focus-visible:ring-2 focus-visible:ring-ring">
                    <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{label}</span>
                  </a>
                ) : (
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted-bg px-2.5 py-1.5 text-xs text-foreground">
                    <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{label}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
