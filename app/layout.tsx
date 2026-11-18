import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { AppShell } from "@/components/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToaster } from "@/components/theme-toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vesto-xi.vercel.app"),
  title: {
    default: "Vesto — Learn. Analyze. Simulate. Invest Smarter.",
    template: "%s · Vesto",
  },
  description: "Vesto is an AI-powered investment learning platform: master the fundamentals, analyze real companies, pitch to an AI Fund Manager and invest a $10,000 virtual portfolio.",
  applicationName: "Vesto",
  openGraph: {
    title: "Vesto — Learn. Analyze. Simulate. Invest Smarter.",
    description: "Vesto is an AI-powered investment learning platform: master the fundamentals, analyze real companies, pitch to an AI Fund Manager and invest a $10,000 virtual portfolio.",
    images: [{ url: "/brand/vesto/og-image.png", width: 1200, height: 630, alt: "Vesto" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/brand/vesto/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#011231",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakarta.variable}`}>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <ThemeToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
