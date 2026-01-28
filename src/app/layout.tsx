import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Footer from '../components/Footer';
import SocialProof from '../components/SocialProof';
import LuckyWheel from '../components/LuckyWheel';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TripHack - Cestuj chytře',
  description: 'Nejlepší nabídky letenek a dovolených.',
  // ZDE JSEM SMAZAL "icons: ...". Next.js si ikonu najde automaticky.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className={inter.className}>
        {children}
        <SocialProof />
        <LuckyWheel />
        <Footer />
      </body>
    </html>
  );
}