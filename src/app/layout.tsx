import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TripHack - Cestuj chytře',
  description: 'Najdi nejlevnější letenky a dovolené s pomocí AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      {/* DŮLEŽITÉ: 
         1. Odstranil jsem 'bg-slate-950' z className.
         2. Není tu žádný <SocialProof />, takže alerty zmizí.
         3. Pozadí se načte z globals.css (ten vesmír).
      */}
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}