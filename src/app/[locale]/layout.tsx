import { AuthProvider } from "@/components/AuthProvider";
import ConditionalLayout from "@/components/ConditionalLayout";
import { ThemeProvider } from "@/components/ThemeContext";
import { routing } from '@/i18n/routing';
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from 'next/navigation';
import { Toaster } from "sonner";
import "../../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { siteConfig } from "@/config/site";

// ... existing imports

export const metadata: Metadata = {
  title: `${siteConfig.name} | Web Development Bootcamp in Punjab`,
  description: siteConfig.description,
  keywords: ["web development", "bootcamp", "Punjab", "MERN", "React", "placement", "coding bootcamp", "Ludhiana"],
  openGraph: {
    title: `${siteConfig.name} | Web Development Bootcamp`,
    description: siteConfig.description,
    type: "website",
  },
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <ThemeProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
              <Toaster position="top-center" richColors />
              <SpeedInsights />
            </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
