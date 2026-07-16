import type { Metadata } from 'next';
import './globals.css';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import { QueryProvider } from '@/shared/providers/QueryProvider';
import { Toaster } from 'sonner';
import { Header } from '@/shared/ui/Header';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Project Management SaaS',
  description: 'Manage your projects efficiently',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn('h-full antialiased', 'font-sans', geist.variable)}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-full">
        <QueryProvider>
          <Header />
          {children}
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
