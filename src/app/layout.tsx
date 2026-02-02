import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TripHack - Cestuj chytře',
  description: 'Nejlevnější letenky a AI průvodce.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body 
        className={inter.className}
        style={{
          // TADY JE TO POZADÍ "NATVRDO" - Modrá záře nahoře, černá dole
          background: 'radial-gradient(circle at top center, #1e3a8a 0%, #020617 40%, #000000 100%)',
          backgroundAttachment: 'fixed', // Aby se pozadí nehýbalo
          color: 'white',
          minHeight: '100vh',
          margin: 0
        }}
      >
        {children}
      </body>
    </html>
  );
}