import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Project Management SaaS",
    default: "Project Management SaaS",
  },
  description: "Advanced workspace and task management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex flex-col min-h-full">{children}</body>
    </html>
  );
}
