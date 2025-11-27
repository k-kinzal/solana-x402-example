'use client';

import { useState, useCallback, useMemo } from 'react';
import { useWallet } from '@/components/providers/WalletProvider';
import { wrapFetchWithPayment, type Signer } from 'x402-fetch';
import { selectPaymentRequirements } from 'x402/client';
import type { PaymentRequirements } from 'x402/types';
import { GatyaMessage } from '@/lib/gatya/messages';
import { NETWORKS, PAYMENT_AMOUNT } from '@/lib/solana/constants';
import { toast } from 'sonner';

export type GatyaStatus = 'idle' | 'fetching_quote' | 'awaiting_signature' | 'processing' | 'success' | 'error';

interface GatyaState {
  status: GatyaStatus;
  result: GatyaMessage | null;
  error: string | null;
  transactionSignature: string | null;
}

interface UseGatyaOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactionSigner: any;
}

export function useGatya({ transactionSigner }: UseGatyaOptions) {
  const { connected, selectedAccount } = useWallet();

  const [state, setState] = useState<GatyaState>({
    status: 'idle',
    result: null,
    error: null,
    transactionSignature: null,
  });

  // Create x402-wrapped fetch when signer is available
  const fetchWithPayment = useMemo(() => {
    if (!connected || !selectedAccount || !transactionSigner) return null;

    // Custom selector that sets feePayer to the client's wallet address
    const customSelector = (
      paymentRequirements: PaymentRequirements[],
      network?: Parameters<typeof selectPaymentRequirements>[1],
      scheme?: Parameters<typeof selectPaymentRequirements>[2]
    ): PaymentRequirements => {
      const selected = selectPaymentRequirements(paymentRequirements, network, scheme);
      // Override feePayer with the client's wallet address
      return {
        ...selected,
        extra: {
          ...selected.extra,
          feePayer: selectedAccount.address,
        },
      };
    };

    // x402-fetch expects a Signer type which is EvmSigner | SvmSigner
    // @solana/react's TransactionModifyingSigner is compatible with @solana/kit's TransactionSigner
    return wrapFetchWithPayment(
      fetch,
      transactionSigner as unknown as Signer,
      PAYMENT_AMOUNT,
      customSelector,
      {
        svmConfig: { rpcUrl: NETWORKS.devnet.endpoint }
      }
    );
  }, [connected, selectedAccount, transactionSigner]);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      result: null,
      error: null,
      transactionSignature: null,
    });
  }, []);

  const executeGatya = useCallback(async () => {
    if (!connected || !selectedAccount || !fetchWithPayment) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // Step 1: Start fetching (x402-fetch handles the 402 flow automatically)
      setState(prev => ({ ...prev, status: 'fetching_quote', error: null }));

      // Step 2: Request will automatically:
      // - Get 402 response with payment requirements
      // - Create and sign the payment transaction
      // - Retry with X-PAYMENT header
      setState(prev => ({ ...prev, status: 'awaiting_signature' }));
      toast.info('Please sign the transaction in your wallet');

      const response = await fetchWithPayment('/api/gatya');

      setState(prev => ({ ...prev, status: 'processing' }));

      const result = await response.json();

      if (!response.ok || response.status === 402) {
        throw new Error(result.error || 'Payment failed');
      }

      // Step 3: Success!
      setState({
        status: 'success',
        result: result.result,
        error: null,
        transactionSignature: result.transaction,
      });

      toast.success('Gatya successful!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Check for user rejection
      if (errorMessage.includes('User rejected') || errorMessage.includes('rejected')) {
        toast.error('Transaction cancelled');
        setState({
          status: 'idle',
          result: null,
          error: null,
          transactionSignature: null,
        });
        return;
      }

      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));

      toast.error(errorMessage);
    }
  }, [connected, selectedAccount, fetchWithPayment]);

  return {
    ...state,
    executeGatya,
    reset,
    isLoading: ['fetching_quote', 'awaiting_signature', 'processing'].includes(state.status),
  };
}
