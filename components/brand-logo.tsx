import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoVariant = "full" | "mark";
type BrandLogoTone = "auto" | "light" | "dark";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  tone?: BrandLogoTone;
  className?: string;
}

export function BrandLogo({
  variant = "full",
  tone = "auto",
  className,
}: BrandLogoProps) {
  const logoSrc =
    variant === "full"
      ? tone === "dark"
        ? "/brand/vesto/vesto-logo-dark.png"
        : "/brand/vesto/vesto-logo.png"
      : "/brand/vesto/vesto-mark.png";

  const fallbackWidth = variant === "full" ? 1927 : 528;
  const fallbackHeight = variant === "full" ? 703 : 528;
  const imageClassName = cn("h-auto w-auto object-contain", className);

  if (tone === "auto" && variant === "full") {
    return (
      <div className="relative inline-flex items-center">
        <Image
          src="/brand/vesto/vesto-logo.png"
          alt="Vesto"
          width={1927}
          height={703}
          className={cn("block dark:hidden", imageClassName)}
          priority
          unoptimized
        />
        <Image
          src="/brand/vesto/vesto-logo-dark.png"
          alt="Vesto"
          width={1927}
          height={703}
          className={cn("hidden dark:block", imageClassName)}
          priority
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <Image
        src={logoSrc}
        alt="Vesto"
        width={fallbackWidth}
        height={fallbackHeight}
        className={cn("block", imageClassName)}
        priority
        unoptimized
      />
    </div>
  );
}
