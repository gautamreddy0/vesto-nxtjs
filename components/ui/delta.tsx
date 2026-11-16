import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";

interface DeltaProps {
  value: number | null | undefined;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function Delta({ value, suffix = "%", decimals = 2, className }: DeltaProps) {
  const numericValue = value ?? 0;
  const isPositive = numericValue >= 0;
  const arrow = isPositive ? "▲" : "▼";
  const sign = isPositive ? "+" : "-";

  if (value === null || value === undefined) {
    return <span className={cn("text-muted-foreground", className)}>—</span>;
  }

  const absoluteValue = Math.abs(numericValue);
  let formattedNumber = formatNumber(absoluteValue);

  if (suffix === "%") {
    formattedNumber = formatPercent(absoluteValue, decimals).replace(/%$/, "");
  } else if (suffix === "$") {
    formattedNumber = formatCurrency(absoluteValue).replace(/\$/, "");
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium num",
        isPositive ? "text-success" : "text-danger",
        className,
      )}
    >
      <span aria-hidden="true">{arrow}</span>
      <span>{`${sign}${formattedNumber}${suffix}`}</span>
    </span>
  );
}

interface StatProps {
  label: React.ReactNode;
  value: number | string | null | undefined;
  hint?: React.ReactNode;
  delta?: number | null | undefined;
  suffix?: string;
  decimals?: number;
  className?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
}

export function Stat({
  label,
  value,
  hint,
  delta,
  suffix = "",
  decimals = 2,
  className,
  icon: Icon,
  iconClassName,
  valueClassName,
}: StatProps) {
  const formattedValue =
    value === null || value === undefined
      ? "N/A"
      : typeof value === "number"
        ? suffix === "%"
          ? formatPercent(value, decimals)
          : suffix === "$"
            ? formatCurrency(value)
            : formatNumber(value)
        : value;

  const content = (
    <>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
        <span className={cn("text-2xl font-semibold tracking-tight text-foreground num", valueClassName)}>{formattedValue}</span>
        {delta !== undefined && delta !== null && (
          <Delta value={delta} suffix={suffix || "%"} decimals={decimals} />
        )}
      </div>
      {hint ? <div className="mt-2 text-xs text-muted-foreground">{hint}</div> : null}
    </>
  );

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-sm", className)}>
      {Icon ? (
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", iconClassName)}>
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">{content}</div>
        </div>
      ) : content}
    </div>
  );
}
