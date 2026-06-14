'use client';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { ClientProvider } from '@/contexts/client-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ClientProvider>
        {children}
        <Toaster position="top-right" richColors />
      </ClientProvider>
    </SessionProvider>
  );
}
