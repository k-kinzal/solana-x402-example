'use client';

import { createContext, useContext } from 'react';
import { NetworkType, DEFAULT_NETWORK } from '@/lib/solana/constants';

interface NetworkContextType {
  network: NetworkType;
  setNetwork: (network: NetworkType) => void;
}

export const NetworkContext = createContext<NetworkContextType>({
  network: DEFAULT_NETWORK,
  setNetwork: () => {},
});

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
