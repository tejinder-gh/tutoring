import FloatingCTA from "@/components/FloatingCTA";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeContext";
import { routing } from '@/i18n/routing';
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from 'next/navigation';
import "../../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Future Ready Tutoring | Web Development Bootcamp in Punjab",
  description: "Outcome-driven web development bootcamp in Punjab. Learn MERN stack, React, and get placed. 65-75% placement rate. Apply now!",
  keywords: ["web development", "bootcamp", "Punjab", "MERN", "React", "placement", "coding bootcamp", "Ludhiana"],
  openGraph: {
    title: "Future Ready Tutoring | Web Development Bootcamp",
    description: "Transform from student to hired professional. Outcome-driven web development bootcamp in Punjab.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;

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
          <ThemeProvider>
            <Navbar />
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow pt-16">
                {children}
              </main>
              <Footer />
            </div>
            <FloatingCTA seatsLeft={12} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
