'use client';

import { usePathname } from 'next/navigation';
import FloatingCTA from './FloatingCTA';
import Footer from './Footer';
import Navbar from './Navbar';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.includes('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <div className="flex flex-col min-h-screen">
        <main className={`grow ${!isAdminRoute ? 'pt-16' : ''}`}>
          {children}
        </main>
      </div>
      {!isAdminRoute && <FloatingCTA seatsLeft={12} />}
      {!isAdminRoute && <Footer />}
    </>
  );
}
