import "./globals.css";

import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { siteConfig } from "@/site.config";
import { isProxyAccess } from "@/lib/proxy-detection";

import { cn } from "@/lib/utils";

const font = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: siteConfig.site_name,
  description: siteConfig.site_description,
  metadataBase: new URL(siteConfig.site_domain),
  alternates: {
    canonical: `${siteConfig.site_domain}/`, // Uses SITE_DOMAIN
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 서버에서 프록시 접근 감지
  const isProxy = await isProxyAccess();

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen font-sans antialiased", font.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutWrapper isProxyAccess={isProxy}>
            {children}
          </LayoutWrapper>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
