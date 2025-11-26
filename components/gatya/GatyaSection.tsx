'use client';

import { useGatya } from '@/hooks/useGatya';
import { GatyaButton } from './GatyaButton';
import { GatyaResult } from './GatyaResult';

export function GatyaSection() {
  const { status, result, transactionSignature, executeGatya, reset, isLoading } = useGatya();

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
