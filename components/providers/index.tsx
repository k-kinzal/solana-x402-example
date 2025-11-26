'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { NetworkProvider } from './NetworkProvider';
import { WalletProvider } from './WalletProvider';
import { Toaster } from '@/components/ui/sonner';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <NetworkProvider>
        <WalletProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </WalletProvider>
      </NetworkProvider>
    </ThemeProvider>
  );
}
