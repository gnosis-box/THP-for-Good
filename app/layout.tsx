import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Poppins } from 'next/font/google';
import './globals.css';

import { AppShell } from '@/components/layout/AppShell';
import { UmamiScript } from '@/components/analytics/UmamiScript';
import { ToastProvider } from '@/components/ui/toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { WalletProvider } from '@/components/wallet/WalletProvider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'THP for Good',
  description: 'Book a session with a THP expert, pay in CRC',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <UmamiScript />
        <WalletProvider>
          <TooltipProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </TooltipProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
