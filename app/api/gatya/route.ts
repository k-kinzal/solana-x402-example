import { NextRequest, NextResponse } from 'next/server';
import { NetworkType, NETWORKS } from '@/lib/solana/constants';
import { createPaymentRequirements } from '@/lib/solana/transaction';
import { verifyAndBroadcastTransaction } from '@/lib/solana/verify';
import { drawGatya } from '@/lib/gatya/messages';

// Parse network from header
function parseNetwork(networkHeader: string | null): NetworkType | null {
  if (!networkHeader) return null;

  // Handle both 'devnet' and 'solana-devnet' formats
  const network = networkHeader.replace('solana-', '');

  if (network === 'mainnet') {
    return 'mainnet-beta';
  }

  if (network === 'devnet' || network === 'testnet' || network === 'mainnet-beta') {
    return network as NetworkType;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    // Get network from header
    const networkHeader = request.headers.get('X-Network');
    const network = parseNetwork(networkHeader) || 'devnet';

    // Get payment header
    const paymentHeader = request.headers.get('X-Payment');

    // If no payment header, return 402 with payment requirements
    if (!paymentHeader) {
      const paymentRequirements = createPaymentRequirements(network);

      return NextResponse.json(
        { paymentRequirements: [paymentRequirements] },
        {
          status: 402,
          headers: {
            'X-Payment-Required': 'true',
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verify and broadcast the payment transaction
    const result = await verifyAndBroadcastTransaction(paymentHeader, network);

    if (!result.valid) {
      return NextResponse.json(
        {
          error: result.error || 'Payment verification failed',
          paymentRequirements: [createPaymentRequirements(network)],
        },
        {
          status: 402,
          headers: {
            'X-Payment-Required': 'true',
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Payment successful - draw gatya and return result
    const gatyaResult = drawGatya();

    return NextResponse.json(
      {
        success: true,
        result: gatyaResult,
        transactionSignature: result.signature,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Gatya API error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
