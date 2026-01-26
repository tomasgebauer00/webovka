import type { Metadata } from "next";
import "./globals.css"; // TOTO JE TEN NEJDŮLEŽITĚJŠÍ ŘÁDEK

export const metadata: Metadata = {
  title: "Lovci Dovolené",
  description: "Nejlevnější letenky a ubytování",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}