import { NextRequest, NextResponse } from 'next/server';
import { exact } from 'x402/schemes';
import {
  PaymentPayloadSchema,
  PaymentRequirementsSchema,
  type SettleResponse,
} from 'x402/types';
import { createSolanaRpc, getTransactionDecoder, type RpcDevnet, type SolanaRpcApiDevnet } from '@solana/kit';
import { NETWORKS, fromX402Network } from '@/lib/solana/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentPayload, paymentRequirements } = body;

    // Validate request body
    const parsedPayload = PaymentPayloadSchema.parse(paymentPayload);
    const parsedRequirements = PaymentRequirementsSchema.parse(paymentRequirements);

    // Get the SVM payload
    const svmPayload = parsedPayload.payload as { transaction: string };
    if (!svmPayload.transaction) {
      const response: SettleResponse = {
        success: false,
        errorReason: 'invalid_payload',
        transaction: '',
        network: parsedRequirements.network,
      };
      return NextResponse.json(response);
    }

    // Decode the transaction
    const transactionBytes = Buffer.from(svmPayload.transaction, 'base64');
    const transactionDecoder = getTransactionDecoder();
    const decodedTransaction = transactionDecoder.decode(new Uint8Array(transactionBytes));

    // Get network-specific RPC
    const networkType = fromX402Network(parsedRequirements.network as 'solana' | 'solana-devnet');
    const rpc = createSolanaRpc(NETWORKS[networkType].endpoint) as RpcDevnet<SolanaRpcApiDevnet>;

    // Send the signed transaction
    let signature: string;
    try {
      signature = await exact.svm.sendSignedTransaction(decodedTransaction, rpc);
    } catch (e: unknown) {
      const error = e as { message?: string };
      const errorMessage = error.message || 'Transaction failed';

      // Map error to appropriate reason
      let errorReason: SettleResponse['errorReason'] = 'unexpected_settle_error';
      if (errorMessage.includes('already been processed') || errorMessage.includes('AlreadyProcessed')) {
        errorReason = 'invalid_transaction_state';
      } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('0x1')) {
        errorReason = 'insufficient_funds';
      } else if (errorMessage.includes('Blockhash not found') || errorMessage.includes('BlockhashNotFound')) {
        errorReason = 'settle_exact_svm_block_height_exceeded';
      }

      const response: SettleResponse = {
        success: false,
        errorReason,
        transaction: '',
        network: parsedRequirements.network,
      };
      return NextResponse.json(response);
    }

    // Success
    const response: SettleResponse = {
      success: true,
      transaction: signature,
      network: parsedRequirements.network,
      payer: '', // Could extract from transaction if needed
    };
    return NextResponse.json(response);

  } catch {
    const response: SettleResponse = {
      success: false,
      errorReason: 'unexpected_settle_error',
      transaction: '',
      network: 'solana-devnet',
    };
    return NextResponse.json(response);
  }
}
