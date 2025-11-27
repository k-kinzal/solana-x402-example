import { NextResponse } from 'next/server';
import { type SupportedPaymentKindsResponse } from 'x402/types';
import { RECIPIENT_WALLET } from '@/lib/solana/constants';

export async function GET() {
  // Return supported payment kinds for SVM
  // RECIPIENT_WALLET is an Address type (branded string), so we cast it directly
  const response: SupportedPaymentKindsResponse = {
    kinds: [
      {
        x402Version: 1,
        scheme: 'exact',
        network: 'solana-devnet',
        extra: {
          // feePayer is required by x402-next for SVM networks
          // This is the address that will pay transaction fees
          // For self-hosted facilitator, we use the recipient wallet
          feePayer: RECIPIENT_WALLET as string,
        },
      },
      {
        x402Version: 1,
        scheme: 'exact',
        network: 'solana',
        extra: {
          feePayer: RECIPIENT_WALLET as string,
        },
      },
    ],
  };

  return NextResponse.json(response);
}
