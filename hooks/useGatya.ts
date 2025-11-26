'use client';

import { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useNetwork } from './useNetwork';
import { createPaymentTransaction } from '@/lib/solana/transaction';
import { GatyaMessage } from '@/lib/gatya/messages';
import { toast } from 'sonner';

export type GatyaStatus = 'idle' | 'fetching_quote' | 'awaiting_signature' | 'processing' | 'success' | 'error';

interface GatyaState {
  status: GatyaStatus;
  result: GatyaMessage | null;
  error: string | null;
  transactionSignature: string | null;
}

export function useGatya() {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const { network } = useNetwork();

  const [state, setState] = useState<GatyaState>({
    status: 'idle',
    result: null,
    error: null,
    transactionSignature: null,
  });

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      result: null,
      error: null,
      transactionSignature: null,
    });
  }, []);

  const executeGatya = useCallback(async () => {
    if (!publicKey || !signTransaction || !connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // Step 1: Fetch payment requirements (402 response)
      setState(prev => ({ ...prev, status: 'fetching_quote', error: null }));

      const quoteResponse = await fetch('/api/gatya', {
        headers: {
          'X-Network': network,
        },
      });

      if (quoteResponse.status !== 402) {
        throw new Error('Unexpected response from server');
      }

      // Step 2: Create payment transaction
      setState(prev => ({ ...prev, status: 'awaiting_signature' }));
      toast.info('Please sign the transaction in your wallet');

      const transaction = await createPaymentTransaction(
        connection,
        publicKey,
        network
      );

      // Step 3: Sign transaction with wallet
      const signedTransaction = await signTransaction(transaction);

      // Step 4: Send payment with X-Payment header
      setState(prev => ({ ...prev, status: 'processing' }));

      const serializedTx = signedTransaction.serialize();
      const base64Tx = Buffer.from(serializedTx).toString('base64');

      const paymentResponse = await fetch('/api/gatya', {
        headers: {
          'X-Network': network,
          'X-Payment': base64Tx,
        },
      });

      const result = await paymentResponse.json();

      if (!paymentResponse.ok || paymentResponse.status === 402) {
        throw new Error(result.error || 'Payment failed');
      }

      // Step 5: Success!
      setState({
        status: 'success',
        result: result.result,
        error: null,
        transactionSignature: result.transactionSignature,
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
  }, [publicKey, signTransaction, connected, connection, network]);

  return {
    ...state,
    executeGatya,
    reset,
    isLoading: ['fetching_quote', 'awaiting_signature', 'processing'].includes(state.status),
  };
}
