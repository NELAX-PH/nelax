import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nelax Systems | Simple POS for Small Shops',
  description:
    'The most trusted and affordable digital system provider for micro-retail businesses in the Philippines.',
  keywords: [
    'POS',
    'Point of Sale',
    'Inventory Management',
    'Small Business',
    'Philippines',
    'Sari-Sari Store',
    'Micro-Retail',
  ],
  authors: [{ name: 'Nelax Systems' }],
  creator: 'Nelax Systems',
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: 'https://nelax.com',
    title: 'Nelax Systems | Simple POS for Small Shops',
    description:
      'The most trusted and affordable digital system provider for micro-retail businesses in the Philippines.',
    siteName: 'Nelax Systems',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nelax Systems | Simple POS for Small Shops',
    description:
      'The most trusted and affordable digital system provider for micro-retail businesses in the Philippines.',
    creator: '@nelaxsystems',
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster
          position="top-center"
          expand={false}
          richColors
          visibleToasts={3}
          toastOptions={{
            style: {
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
          }}
        />
      </body>
    </html>
  );
}
