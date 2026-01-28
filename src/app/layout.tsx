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
  icons: {
    icon: '/icon.png', // <--- Tohle zajistí, že se načte tvoje nové logo z public složky
  },
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