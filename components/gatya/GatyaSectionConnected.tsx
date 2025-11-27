'use client';

import { useWalletAccountTransactionSigner } from '@solana/react';
import type { UiWalletAccount } from '@wallet-standard/ui';
import { useGatya } from '@/hooks/useGatya';
import { GatyaButton } from './GatyaButton';
import { GatyaResult } from './GatyaResult';

interface GatyaSectionConnectedProps {
  account: UiWalletAccount;
}

export function GatyaSectionConnected({ account }: GatyaSectionConnectedProps) {
  // Get the transaction signer for this account
  const transactionSigner = useWalletAccountTransactionSigner(account, 'solana:devnet');

  const { status, result, transactionSignature, executeGatya, reset, isLoading } = useGatya({
    transactionSigner,
  });

  const handleRetry = () => {
    reset();
    executeGatya();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4">
      {/* Gatya Button */}
      <GatyaButton
        onClick={executeGatya}
        status={status}
        disabled={isLoading}
      />

      {/* Result dialog */}
      <GatyaResult
        result={result}
        transactionSignature={transactionSignature}
        isOpen={status === 'success' && result !== null}
        onClose={reset}
        onRetry={handleRetry}
      />
    </div>
  );
}
