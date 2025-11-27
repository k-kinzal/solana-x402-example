import { NextRequest, NextResponse } from 'next/server';
import {
  PaymentPayloadSchema,
  PaymentRequirementsSchema,
  type VerifyResponse,
} from 'x402/types';
import {
  getTransactionDecoder,
  getCompiledTransactionMessageDecoder,
  type Address,
} from '@solana/kit';
import {
  TOKEN_PROGRAM_ADDRESS,
  getTransferCheckedInstructionDataDecoder,
  findAssociatedTokenPda,
} from '@solana-program/token';
import { NETWORKS, fromX402Network, type X402Network } from '@/lib/solana/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentPayload, paymentRequirements } = body;

    // Validate request body
    const parsedPayload = PaymentPayloadSchema.parse(paymentPayload);
    const parsedRequirements = PaymentRequirementsSchema.parse(paymentRequirements);

    // Verify network and scheme match
    if (parsedPayload.network !== parsedRequirements.network) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: 'invalid_network',
      };
      return NextResponse.json(response);
    }

    if (parsedPayload.scheme !== parsedRequirements.scheme) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: 'invalid_scheme',
      };
      return NextResponse.json(response);
    }

    // Get the SVM payload
    const svmPayload = parsedPayload.payload as { transaction: string };
    if (!svmPayload.transaction) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: 'invalid_payload',
      };
      return NextResponse.json(response);
    }

    // Decode and verify the transaction structure
    try {
      const transactionBytes = Buffer.from(svmPayload.transaction, 'base64');
      const transactionDecoder = getTransactionDecoder();
      const decodedTransaction = transactionDecoder.decode(new Uint8Array(transactionBytes));

      // Verify transaction has at least one valid signature
      // The fee payer signature may be null (will be signed during settle)
      // But the user's signature should be present
      const signatures = decodedTransaction.signatures;
      const signatureEntries = Object.entries(signatures);

      if (!signatures || signatureEntries.length === 0) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: 'invalid_payload',
        };
        return NextResponse.json(response);
      }

      // Check that at least one signature is valid (not null and not all zeros)
      const hasValidSignature = signatureEntries.some(([, sig]) => {
        if (!sig) return false;
        const sigBytes = sig as Uint8Array;
        const allZeros = Array.from(sigBytes).every((b: number) => b === 0);
        return !allZeros;
      });

      if (!hasValidSignature) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: 'invalid_payload',
        };
        return NextResponse.json(response);
      }

      // Decode the compiled transaction message to get instructions
      const messageDecoder = getCompiledTransactionMessageDecoder();
      const compiledMessage = messageDecoder.decode(decodedTransaction.messageBytes);
      const { staticAccounts, instructions } = compiledMessage;

      // Find TransferChecked instruction (TOKEN_PROGRAM with discriminator 12)
      const transferCheckedIx = instructions.find((ix) => {
        const programAddress = staticAccounts[ix.programAddressIndex];
        if (programAddress !== TOKEN_PROGRAM_ADDRESS) return false;
        // TransferChecked discriminator is 12
        return ix.data && ix.data[0] === 12;
      });

      if (!transferCheckedIx) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: 'invalid_payload',
        };
        return NextResponse.json(response);
      }

      // TransferChecked instruction accounts order:
      // 0: source (sender's ATA)
      // 1: mint
      // 2: destination (recipient's ATA)
      // 3: authority (signer)
      const accountIndices = transferCheckedIx.accountIndices;
      if (!accountIndices || accountIndices.length < 4) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: 'invalid_payload',
        };
        return NextResponse.json(response);
      }

      const actualMint = staticAccounts[accountIndices[1]];
      const actualDestination = staticAccounts[accountIndices[2]];

      // Verify mint matches expected USDC mint for the network
      const networkType = fromX402Network(parsedRequirements.network as X402Network);
      const expectedMint = NETWORKS[networkType].usdcMint;

      if (actualMint !== expectedMint) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: 'invalid_payload',
        };
        return NextResponse.json(response);
      }

      // Verify destination is the payTo's ATA
      const payTo = parsedRequirements.payTo as Address;
      const [expectedDestinationAta] = await findAssociatedTokenPda({
        owner: payTo,
        mint: actualMint as Address,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
      });

      if (actualDestination !== expectedDestinationAta) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: 'invalid_payload',
        };
        return NextResponse.json(response);
      }

      // Decode TransferChecked instruction data and verify amount
      const dataDecoder = getTransferCheckedInstructionDataDecoder();
      const instructionData = dataDecoder.decode(transferCheckedIx.data!);
      const requiredAmount = BigInt(parsedRequirements.maxAmountRequired);

      if (instructionData.amount < requiredAmount) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: 'invalid_payload',
        };
        return NextResponse.json(response);
      }

    } catch (txError) {
      console.error('Transaction decode error:', txError);
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: 'invalid_payload',
      };
      return NextResponse.json(response);
    }

    // Payment is valid
    const response: VerifyResponse = {
      isValid: true,
    };
    return NextResponse.json(response);

  } catch (error) {
    console.error('Verify error:', error);
    const response: VerifyResponse = {
      isValid: false,
      invalidReason: 'unexpected_verify_error',
    };
    return NextResponse.json(response);
  }
}
