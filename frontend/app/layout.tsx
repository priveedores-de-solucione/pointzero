import './globals.css';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/auth-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  themeColor: '#0B0F14',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  title: 'POINTZERO — The Startup City for Builders',
  description:
    'Come with an idea. Leave with a company. POINTZERO is the digital infrastructure of a startup ecosystem where founders build, builders find opportunities, and investors discover the next generation of African companies.',
  keywords: [
    'POINTZERO',
    'startup',
    'accelerator',
    'incubator',
    'Ogbomoso',
    'Africa',
    'builders',
    'founders',
    'investors',
  ],
  openGraph: {
    title: 'POINTZERO — The Startup City for Builders',
    description: 'Come with an idea. Leave with a company.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'POINTZERO — The Startup City for Builders',
    description: 'Come with an idea. Leave with a company.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans`}>
        <AuthProvider>
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
