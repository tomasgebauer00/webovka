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
      {/* TADY JE TA ZMĚNA "NA SÍLU":
         1. style={{ ... }} přepíše jakýkoliv Tailwind.
         2. background je nastavený přímo zde.
         3. Žádný SocialProof, takže žádné alerty.
      */}
      <body 
        className={inter.className}
        style={{
          background: 'radial-gradient(circle at top center, #0f172a 0%, #020617 40%, #000000 100%)',
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