import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Escaper Creatives | Hospitality Social Media Agency',
  description: 'The premier social media management agency for cafes, restaurants, hotels, and resorts. We make your brand unignorable.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
