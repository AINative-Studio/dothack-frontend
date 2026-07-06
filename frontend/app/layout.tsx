import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/lib/query-provider';
import { AuthProvider } from '@/lib/auth/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { ErrorToastSetup } from '@/components/error-toast-setup';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DotHack - Run hackathons end-to-end',
  description: 'Complete hackathon management platform for participants, teams, projects, submissions, judging, and leaderboards',
  metadataBase: new URL('https://hack.ainative.studio'),
  openGraph: {
    title: 'DotHack - Run hackathons end-to-end',
    description: 'Complete hackathon management platform for teams, projects, submissions, judging, and leaderboards',
    siteName: 'DotHack',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'DotHack - Run hackathons end-to-end' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DotHack - Run hackathons end-to-end',
    description: 'Complete hackathon management platform for teams, projects, submissions, judging, and leaderboards',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'DotHack - Run hackathons end-to-end' }],
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
          <AuthProvider>
            {children}
            <Toaster />
            <ErrorToastSetup />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
