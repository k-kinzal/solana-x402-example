'use client';

import { useState, useCallback, useEffect, ReactNode } from 'react';
import { NetworkContext } from '@/hooks/useNetwork';
import { NetworkType, DEFAULT_NETWORK } from '@/lib/solana/constants';

const STORAGE_KEY = 'solana-gatya-network';

interface NetworkProviderProps {
  children: ReactNode;
}

function isValidNetwork(value: string): value is NetworkType {
  return ['mainnet-beta', 'devnet', 'testnet'].includes(value);
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [network, setNetworkState] = useState<NetworkType>(DEFAULT_NETWORK);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isValidNetwork(stored)) {
        setNetworkState(stored);
      }
    } catch {
      // localStorage not available
    }
    setIsInitialized(true);
  }, []);

  const setNetwork = useCallback((newNetwork: NetworkType) => {
    setNetworkState(newNetwork);
    try {
      localStorage.setItem(STORAGE_KEY, newNetwork);
    } catch {
      // localStorage not available
    }
  }, []);

  // Prevent hydration mismatch by not rendering until initialized
  if (!isInitialized) {
    return (
      <NetworkContext.Provider value={{ network: DEFAULT_NETWORK, setNetwork }}>
        {children}
      </NetworkContext.Provider>
    );
  }

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}
