'use client';

import { useWallet } from '@/components/providers/WalletProvider';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function WalletButton() {
  const { wallets, selectedAccount, connected, connect, disconnect, connecting } = useWallet();
  const [copied, setCopied] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);

  const address = selectedAccount?.address;

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const handleSelectWallet = async (wallet: typeof wallets[number]) => {
    try {
      await connect(wallet);
      setShowWalletDialog(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  if (!connected || !address) {
    return (
      <>
        <Button
          onClick={() => setShowWalletDialog(true)}
          variant="ghost"
          className="gap-2"
          disabled={connecting}
        >
          <Wallet className="w-4 h-4" />
          {connecting ? 'Connecting...' : 'Connect'}
        </Button>

        <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect Wallet</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2 mt-4">
              {wallets.map((wallet) => (
                <Button
                  key={wallet.name}
                  variant="outline"
                  className="justify-start gap-3 h-14"
                  onClick={() => handleSelectWallet(wallet)}
                  disabled={connecting}
                >
                  {wallet.icon && (
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      className="w-6 h-6"
                    />
                  )}
                  {wallet.name}
                </Button>
              ))}
              {wallets.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No wallets detected. Please install a Solana wallet like Phantom.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Wallet className="w-4 h-4" />
          {shortenAddress(address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopy}>
          {copied ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy Address'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={disconnect} className="text-red-500">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
