/**
 * Custom x402 middleware for Next.js
 *
 * This is a simplified implementation that supports SVM (Solana).
 * It uses internal facilitator API endpoints for verify/settle.
 *
 * Once x402-next fixes SVM support, this can be replaced with:
 *   import { paymentMiddleware, withX402 } from 'x402-next';
 */

import { NextRequest, NextResponse } from 'next/server';
import { decodePayment } from 'x402/schemes';
import {
  settleResponseHeader,
  type PaymentRequirements,
  type SettleResponse,
  type VerifyResponse,
} from 'x402/types';
import { NETWORKS, fromX402Network } from '@/lib/solana/constants';
import type { Network, RouteConfig } from 'x402-next';

// Re-export types for compatibility
export type { Network, RouteConfig } from 'x402-next';

type Resource = `${string}://${string}`;

interface FacilitatorConfig {
  url: Resource;
}

interface PaywallConfig {
  appName?: string;
  appLogo?: string;
}

/**
 * Create 402 response body
 */
function create402ResponseBody(paymentRequirements: PaymentRequirements[], error?: string) {
  return {
    x402Version: 1,
    error,
    accepts: paymentRequirements,
  };
}

/**
 * Build payment requirements from route config
 */
function buildPaymentRequirements(
  payTo: string,
  price: string,
  network: Network,
  resource: string,
  description?: string,
  mimeType?: string
): PaymentRequirements {
  // Parse price (e.g., "$0.01" -> "10000" for USDC with 6 decimals)
  const priceMatch = price.match(/\$?([\d.]+)/);
  const priceValue = priceMatch ? parseFloat(priceMatch[1]) : 0;
  const maxAmountRequired = Math.floor(priceValue * 1_000_000).toString();

  // Get network type for asset lookup
  const networkType = fromX402Network(network as 'solana' | 'solana-devnet');

  return {
    scheme: 'exact',
    network: network,
    maxAmountRequired,
    resource,
    description: description || '',
    mimeType: mimeType || 'application/json',
    payTo,
    maxTimeoutSeconds: 60,
    asset: NETWORKS[networkType].usdcMint,
    // extra.feePayer is required for SVM networks - x402-fetch uses this to set the transaction fee payer
    extra: {
      feePayer: payTo,
    },
  };
}

/**
 * Call facilitator verify endpoint
 */
async function callFacilitatorVerify(
  facilitatorUrl: string,
  paymentPayload: unknown,
  paymentRequirements: PaymentRequirements
): Promise<VerifyResponse> {
  const response = await fetch(`${facilitatorUrl}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentPayload,
      paymentRequirements,
    }),
  });

  if (!response.ok) {
    return { isValid: false, invalidReason: 'unexpected_verify_error' };
  }

  return response.json();
}

/**
 * Call facilitator settle endpoint
 */
async function callFacilitatorSettle(
  facilitatorUrl: string,
  paymentPayload: unknown,
  paymentRequirements: PaymentRequirements
): Promise<SettleResponse> {
  const response = await fetch(`${facilitatorUrl}/settle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentPayload,
      paymentRequirements,
    }),
  });

  if (!response.ok) {
    return {
      success: false,
      errorReason: 'unexpected_settle_error',
      transaction: '',
      network: paymentRequirements.network,
    };
  }

  return response.json();
}

/**
 * Wraps a Next.js App Router API route handler with x402 payment protection.
 *
 * This is a drop-in replacement for x402-next's withX402 that supports SVM.
 *
 * @example
 * ```typescript
 * import { withX402 } from '@/lib/x402/middleware';
 *
 * const handler = async (request: NextRequest) => {
 *   return NextResponse.json({ data: 'protected content' });
 * };
 *
 * export const GET = withX402(handler, 'WALLET_ADDRESS', {
 *   price: '$0.01',
 *   network: 'solana-devnet',
 * }, {
 *   url: 'http://localhost:3000/api/facilitator',
 * });
 * ```
 */
export function withX402<T = unknown>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>,
  payTo: string,
  routeConfig: RouteConfig,
  facilitator: FacilitatorConfig,
  paywall?: PaywallConfig
): (request: NextRequest) => Promise<NextResponse<T | unknown>> {
  const { price, network, config = {} } = routeConfig;
  const { description, mimeType } = config;

  return async function wrappedHandler(request: NextRequest): Promise<NextResponse<T | unknown>> {
    const resource = request.nextUrl.toString();

    // Build payment requirements
    const paymentRequirements = buildPaymentRequirements(
      payTo,
      typeof price === 'string' ? price : typeof price === 'number' ? `$${price}` : price.amount,
      network,
      resource,
      description,
      mimeType
    );

    // Check for payment header
    const paymentHeader = request.headers.get('X-PAYMENT');

    if (!paymentHeader) {
      return NextResponse.json(
        create402ResponseBody([paymentRequirements]),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Decode payment payload
    let paymentPayload;
    try {
      paymentPayload = decodePayment(paymentHeader);
    } catch {
      return NextResponse.json(
        create402ResponseBody([paymentRequirements], 'Invalid payment header format'),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify payment via facilitator
    const verifyResult = await callFacilitatorVerify(
      facilitator.url,
      paymentPayload,
      paymentRequirements
    );

    if (!verifyResult.isValid) {
      return NextResponse.json(
        create402ResponseBody([paymentRequirements], verifyResult.invalidReason),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Settle payment via facilitator
    const settleResult = await callFacilitatorSettle(
      facilitator.url,
      paymentPayload,
      paymentRequirements
    );

    if (!settleResult.success) {
      return NextResponse.json(
        create402ResponseBody([paymentRequirements], settleResult.errorReason),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Payment successful - call the actual handler
    const response = await handler(request);

    // Add payment response header
    const paymentResponseHeader = settleResponseHeader(settleResult);

    // Clone response and add header
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-PAYMENT-RESPONSE', paymentResponseHeader);

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

/**
 * Creates a payment middleware for Next.js middleware.ts
 *
 * This is a drop-in replacement for x402-next's paymentMiddleware that supports SVM.
 * Note: For most use cases, withX402 is recommended as it provides better control.
 */
export function paymentMiddleware(
  payTo: string,
  routes: Record<string, RouteConfig | string>,
  facilitator: FacilitatorConfig,
  paywall?: PaywallConfig
) {
  return async function middleware(request: NextRequest): Promise<NextResponse> {
    const pathname = request.nextUrl.pathname;

    // Find matching route
    let matchedConfig: RouteConfig | null = null;
    for (const [pattern, config] of Object.entries(routes)) {
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
      if (regex.test(pathname)) {
        if (typeof config === 'string') {
          // Simple price string - need to determine network
          matchedConfig = { price: config, network: 'solana-devnet' };
        } else {
          matchedConfig = config;
        }
        break;
      }
    }

    if (!matchedConfig) {
      return NextResponse.next();
    }

    const { price, network, config = {} } = matchedConfig;
    const { description, mimeType } = config;
    const resource = request.nextUrl.toString();

    // Build payment requirements
    const paymentRequirements = buildPaymentRequirements(
      payTo,
      typeof price === 'string' ? price : typeof price === 'number' ? `$${price}` : price.amount,
      network,
      resource,
      description,
      mimeType
    );

    // Check for payment header
    const paymentHeader = request.headers.get('X-PAYMENT');

    if (!paymentHeader) {
      return NextResponse.json(
        create402ResponseBody([paymentRequirements]),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Decode payment payload
    let paymentPayload;
    try {
      paymentPayload = decodePayment(paymentHeader);
    } catch {
      return NextResponse.json(
        create402ResponseBody([paymentRequirements], 'Invalid payment header format'),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify payment via facilitator
    const verifyResult = await callFacilitatorVerify(
      facilitator.url,
      paymentPayload,
      paymentRequirements
    );

    if (!verifyResult.isValid) {
      return NextResponse.json(
        create402ResponseBody([paymentRequirements], verifyResult.invalidReason),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Settle payment via facilitator
    const settleResult = await callFacilitatorSettle(
      facilitator.url,
      paymentPayload,
      paymentRequirements
    );

    if (!settleResult.success) {
      return NextResponse.json(
        create402ResponseBody([paymentRequirements], settleResult.errorReason),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Payment successful - continue to the route
    const response = NextResponse.next();

    // Add payment response header
    response.headers.set('X-PAYMENT-RESPONSE', settleResponseHeader(settleResult));

    return response;
  };
}
