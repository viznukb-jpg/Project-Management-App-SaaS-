import type { Metadata } from 'next';
import './globals.css';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    template: '%s | Project Management SaaS',
    default: 'Project Management SaaS',
  },
  description: 'Advanced workspace and task management platform.',
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
      <body className="flex flex-col min-h-full">{children}</body>
    </html>
  );
}
