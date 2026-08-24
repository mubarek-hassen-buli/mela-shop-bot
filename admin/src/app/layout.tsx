import type { Metadata } from 'next';
import { Providers } from '../components/providers/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mela Shop - Admin Dashboard',
  description: 'Manage store catalog, categories, products, and metrics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="bg-[#0A0B0E] text-slate-100 antialiased min-h-screen"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
