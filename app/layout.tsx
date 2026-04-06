import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "@/components/AppProviders";
import CookieConsentBanner from "@/components/cookie-consent-banner";
import UmamiAnalytics from "@/components/umami-analytics";

export const metadata: Metadata = {
  title: "Holiday Optimizer",
  description: "Optimize your PTO with smarter holiday planning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
        <CookieConsentBanner />
        <UmamiAnalytics />
      </body>
    </html>
  );
}
