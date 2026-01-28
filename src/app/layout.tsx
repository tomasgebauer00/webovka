import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Footer from '../components/Footer';
import SocialProof from '../components/SocialProof'; // <--- NOVÉ
import LuckyWheel from '../components/LuckyWheel';   // <--- NOVÉ

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LovciDovolené - Cestuj levně',
  description: 'Nejlepší nabídky letenek a dovolených.',
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
        <SocialProof /> {/* <--- Notifikace v rohu */}
        <LuckyWheel />  {/* <--- Kolo štěstí */}
        <Footer />
      </body>
    </html>
  );
}