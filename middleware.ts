import { paymentMiddleware } from '@/lib/x402/middleware';
import {
  RECIPIENT_WALLET,
  PAYMENT_AMOUNT_DISPLAY,
} from '@/lib/solana/constants';

// Get the base URL for facilitator
const getFacilitatorUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/api/facilitator` as `${string}://${string}`;
};

export const middleware = paymentMiddleware(
  RECIPIENT_WALLET as string,
  {
    '/api/gatya': {
      price: `$${PAYMENT_AMOUNT_DISPLAY}`,
      network: 'solana-devnet',
      config: {
        description: 'Gatya draw',
        mimeType: 'application/json',
      },
    },
  },
  {
    url: getFacilitatorUrl(),
  }
);

export const config = {
  matcher: ['/api/gatya'],
};
