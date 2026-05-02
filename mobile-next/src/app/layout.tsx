import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sports Mockery',
  description: 'Chicago sports intelligence — Bears, Bulls, Blackhawks, Cubs, White Sox.',
  applicationName: 'Sports Mockery',
  appleWebApp: { capable: true, title: 'Sports Mockery', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  themeColor: '#111111',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={montserrat.variable}>
      <body className="bg-brand-dark text-white antialiased min-h-dvh safe-x">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
