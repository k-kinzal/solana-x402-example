'use client';

import { ReactNode, createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useWallets } from '@wallet-standard/react';
import type { UiWallet, UiWalletAccount } from '@wallet-standard/ui';
import {
  getWalletFeature,
  uiWalletAccountsAreSame,
} from '@wallet-standard/ui';
import {
  StandardConnect,
  StandardDisconnect,
  type StandardConnectFeature,
  type StandardDisconnectFeature,
} from '@wallet-standard/features';

interface WalletContextValue {
  wallets: readonly UiWallet[];
  selectedWallet: UiWallet | null;
  selectedAccount: UiWalletAccount | null;
  connected: boolean;
  connecting: boolean;
  connect: (wallet: UiWallet) => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const allWallets = useWallets();
  const autoConnectAttempted = useRef(false);

  // Deduplicate wallets by name (some wallets register multiple times)
  const wallets = useMemo(() => {
    const seen = new Set<string>();
    return allWallets.filter((wallet) => {
      if (seen.has(wallet.name)) {
        return false;
      }
      seen.add(wallet.name);
      return true;
    });
  }, [allWallets]);

  const [selectedWallet, setSelectedWallet] = useState<UiWallet | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<UiWalletAccount | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Auto-connect: try silent connect on all available wallets
  // Use a delay to ensure wallet extensions have time to register
  useEffect(() => {
    if (selectedWallet) return;

    // Wait a bit for wallet extensions to register, then try auto-connect
    const timeoutId = setTimeout(() => {
      if (autoConnectAttempted.current || wallets.length === 0 || selectedWallet) return;
      autoConnectAttempted.current = true;

      const tryAutoConnect = async () => {
        for (const wallet of wallets) {
          if (!wallet.features.includes(StandardConnect)) continue;

          try {
            const connectFeature = getWalletFeature(wallet, StandardConnect) as StandardConnectFeature[typeof StandardConnect];
            // Silent connect: only returns accounts if already authorized
            const { accounts } = await connectFeature.connect({ silent: true });

            if (accounts && accounts.length > 0) {
              setSelectedWallet(wallet);
              const uiAccount = wallet.accounts.find((a) =>
                accounts.some((connected) => connected.address === a.address)
              );
              setSelectedAccount(uiAccount ?? wallet.accounts[0] ?? null);
              break; // Stop after first successful connection
            }
          } catch {
            // Silent connect failed, try next wallet
          }
        }
      };

      tryAutoConnect();
    }, 500); // Wait 500ms for wallet extensions to register

    return () => clearTimeout(timeoutId);
  }, [wallets, selectedWallet]);

  // Watch for account changes in the selected wallet
  useEffect(() => {
    if (!selectedWallet || !selectedAccount) return;

    // Check if the selected account is still valid
    const isAccountStillValid = selectedWallet.accounts.some(
      (account) => uiWalletAccountsAreSame(account, selectedAccount)
    );

    if (!isAccountStillValid) {
      // Account was disconnected externally
      if (selectedWallet.accounts.length > 0) {
        setSelectedAccount(selectedWallet.accounts[0]);
      } else {
        setSelectedAccount(null);
      }
    }
  }, [selectedWallet, selectedWallet?.accounts, selectedAccount]);

  const connect = useCallback(async (wallet: UiWallet) => {
    setConnecting(true);
    try {
      // Check if wallet supports connect feature
      if (!wallet.features.includes(StandardConnect)) {
        throw new Error('Wallet does not support connect feature');
      }

      // Get the connect feature from the wallet
      const connectFeature = getWalletFeature(wallet, StandardConnect) as StandardConnectFeature[typeof StandardConnect];

      // Connect to the wallet (not silent - will prompt user)
      const { accounts } = await connectFeature.connect();

      setSelectedWallet(wallet);
      if (accounts && accounts.length > 0) {
        // Find the UiWalletAccount that corresponds to the connected account
        const uiAccount = wallet.accounts.find((a) =>
          accounts.some((connected) => connected.address === a.address)
        );
        setSelectedAccount(uiAccount ?? wallet.accounts[0] ?? null);
      } else if (wallet.accounts.length > 0) {
        setSelectedAccount(wallet.accounts[0]);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setSelectedWallet(null);
      setSelectedAccount(null);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!selectedWallet) return;

    try {
      if (selectedWallet.features.includes(StandardDisconnect)) {
        const disconnectFeature = getWalletFeature(selectedWallet, StandardDisconnect) as StandardDisconnectFeature[typeof StandardDisconnect];
        await disconnectFeature.disconnect();
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setSelectedWallet(null);
      setSelectedAccount(null);
    }
  }, [selectedWallet]);

  const connected = useMemo(() => {
    return selectedWallet !== null && selectedAccount !== null;
  }, [selectedWallet, selectedAccount]);

  const value = useMemo<WalletContextValue>(() => ({
    wallets,
    selectedWallet,
    selectedAccount,
    connected,
    connecting,
    connect,
    disconnect,
  }), [wallets, selectedWallet, selectedAccount, connected, connecting, connect, disconnect]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
