'use client';

import { useState, useCallback, ReactNode } from 'react';
import { NetworkContext } from '@/hooks/useNetwork';
import { NetworkType, DEFAULT_NETWORK } from '@/lib/solana/constants';

interface NetworkProviderProps {
  children: ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [network, setNetworkState] = useState<NetworkType>(DEFAULT_NETWORK);

  const setNetwork = useCallback((newNetwork: NetworkType) => {
    setNetworkState(newNetwork);
  }, []);

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}
