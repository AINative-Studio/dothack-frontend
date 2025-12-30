import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { StoreProvider } from '@/lib/store';
import { QueryProvider } from '@/lib/query-provider';
import { Toaster } from '@/components/ui/toaster';
import { ErrorToastSetup } from '@/components/error-toast-setup';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DotHack - Run hackathons end-to-end',
  description: 'Complete hackathon management platform for participants, teams, projects, submissions, judging, and leaderboards',
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
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
      <body className={inter.className}>
        <QueryProvider>
          <StoreProvider>
            {children}
            <Toaster />
            <ErrorToastSetup />
          </StoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
