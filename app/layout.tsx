import type { Metadata } from 'next';
import Providers from './providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Your Company',
  description: 'We design AI-powered products and automations that help teams move faster, scale smarter, and delight customers.',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#4f46e5',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}