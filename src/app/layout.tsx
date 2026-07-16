import type { Metadata } from 'next';
import './globals.css';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/shared/ui/Sonner';
import { Header } from '@/shared/ui/Header';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Project Management SaaS',
  description: 'Advanced Project Management SaaS built with Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn('h-full antialiased', 'font-sans', geist.variable)}
    >
      <body className="flex flex-col min-h-full">
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
