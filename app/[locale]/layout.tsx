import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans } from "next/font/google";
import "../globals.css";
import { QueryProvider } from "@/components/providers/query";
import { AuthProvider } from "@/components/providers/auth";
import i18nConfig from "@/i18nConfig";
import { dir } from 'i18next';
import { ConfigSite } from "@/lib/conf";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ibm = IBM_Plex_Sans({
  variable: "--font-ibm",
  // subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: `${ConfigSite.siteName}`,
  description: "Largest Real Estate Marketplace in Algeria",
  keywords: `${ConfigSite.siteName}, Real Estate, Algeria, Men, Women, Marketplace`,
};

export function generateStaticParams() {
  return i18nConfig.locales.map(locale => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  return (
    <html lang={locale} dir={dir(locale)}>
      <body
        className={`${!isArabic ? geistSans.variable : ''} ${!isArabic ? geistMono.variable : ''} ${isArabic ? ibm.variable : ''} antialiased ${isArabic ? 'font-ibm' : ''}`}
      >
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
        <Toaster />

      </body>
    </html>
  );
}
