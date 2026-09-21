import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Yatırımım - Kişisel Finans & Portföy Disiplini Dashboard',
  description:
    'Aylık tasarruf takibi, 5 ana varlık sınıfı hedef tahsisi, interaktif checklist ve düşüş tamponu yönetim platformu.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
