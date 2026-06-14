import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Inventario TIC - Cedanet Solutions',
    description: 'Sistema de gestión de inventario tecnológico y auditoría por Cedanet Solutions',
    metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
    },
    openGraph: {
      title: 'Inventario TIC - Cedanet Solutions',
      description: 'Sistema de gestión de inventario tecnológico y auditoría por Cedanet Solutions',
      images: ['/og-image.png'],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className={`${inter.className} bg-slate-50 min-h-screen`} suppressHydrationWarning>
        <ChunkLoadErrorHandler />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
