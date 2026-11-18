'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function ThemeToggle() {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();
  const Icon = themes.find((item) => item.value === theme)?.icon ?? Monitor;

  if (!mounted) return <span aria-hidden="true" className="block h-9 w-9 shrink-0" />;

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger aria-label="Change theme" className="h-9 w-9 shrink-0 justify-center border-border bg-card p-0 text-foreground hover:bg-muted-bg focus-visible:ring-2 [&>svg:last-child]:hidden">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </SelectTrigger>
      <SelectContent align="end">
        {themes.map(({ value, label, icon: OptionIcon }) => (
          <SelectItem key={value} value={value}>
            <span className="flex items-center gap-2"><OptionIcon aria-hidden="true" className="h-4 w-4" />{label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ThemeOptions() {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();

  if (!mounted) return null;

  return (
    <fieldset className="border-t border-border px-3 py-2 md:hidden">
      <legend className="px-1 text-xs font-semibold text-muted-foreground">Theme</legend>
      <div className="flex flex-col gap-1">
        {themes.map(({ value, label }) => (
          <label key={value} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-accent-bg">
            <input type="radio" name="account-theme" value={value} checked={theme === value} onChange={() => setTheme(value)} className="accent-accent focus-visible:outline-2 focus-visible:outline-ring" />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
