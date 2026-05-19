import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Escaper Creatives | Hospitality Social Media Agency',
  description: 'The premier social media management agency for cafes, restaurants, hotels, and resorts. We make your brand unignorable.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
