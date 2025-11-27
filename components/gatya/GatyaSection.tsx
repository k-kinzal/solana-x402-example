'use client';

import { useWallet } from '@/components/providers/WalletProvider';
import { GatyaButton } from './GatyaButton';
import { GatyaResult } from './GatyaResult';
import { GatyaSectionConnected } from './GatyaSectionConnected';

export function GatyaSection() {
  const { selectedAccount, connected } = useWallet();

  // When wallet is connected, use the connected component that can use hooks properly
  if (connected && selectedAccount) {
    return <GatyaSectionConnected account={selectedAccount} />;
  }

  // When not connected, show the button that prompts connection
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4">
      <GatyaButton
        onClick={() => {}}
        status="idle"
        disabled={false}
      />
    </div>
  );
}
