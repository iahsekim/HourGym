import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'HourGym - Rent Gym Space by the Hour',
    template: '%s | HourGym',
  },
  description:
    'Find and book gym space by the hour. Perfect for personal trainers, coaches, and fitness professionals in Denver.',
  keywords: [
    'gym rental',
    'hourly gym',
    'personal trainer space',
    'fitness studio rental',
    'Denver gym',
    'combat sports',
    'training space',
  ],
  authors: [{ name: 'HourGym' }],
  creator: 'HourGym',
  publisher: 'HourGym',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://hourgym.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'HourGym',
    title: 'HourGym - Rent Gym Space by the Hour',
    description:
      'Find and book gym space by the hour. Perfect for personal trainers, coaches, and fitness professionals in Denver.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HourGym - Rent Gym Space by the Hour',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HourGym - Rent Gym Space by the Hour',
    description:
      'Find and book gym space by the hour. Perfect for personal trainers, coaches, and fitness professionals.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#4F46E5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
