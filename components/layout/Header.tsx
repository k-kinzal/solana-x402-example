'use client';

import { NetworkSelector } from '@/components/wallet/NetworkSelector';
import { WalletButton } from '@/components/wallet/WalletButton';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-4 mt-4 md:mx-6">
        <div className="flex h-14 items-center justify-end gap-2 px-4 rounded-2xl bg-white/5 dark:bg-white/[0.02] backdrop-blur-md border border-white/5 shadow-lg">
          <WalletButton />
          <NetworkSelector />
        </div>
      </div>
    </header>
  );
}
