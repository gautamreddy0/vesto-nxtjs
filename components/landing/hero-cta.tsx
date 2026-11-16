'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';

export function HeroPrimaryCta({ label = 'Get Started Free' }: { label?: string }) {
  const { isAuthenticated } = useUser();
  const href = isAuthenticated || !isSupabaseConfigured() ? '/dashboard' : '/signup';

  return (
    <Link href={href}>
      <Button
        size="lg"
        className="group h-[50px] gap-2.5 rounded-lg bg-hero-cta px-[26px] text-base font-bold text-sidebar shadow-[0_8px_24px_color-mix(in_srgb,var(--hero-cta)_35%,transparent)] transition-transform hover:-translate-y-px hover:shadow-[0_12px_28px_color-mix(in_srgb,var(--hero-cta)_45%,transparent)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        {label}
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Button>
    </Link>
  );
}
