import { address, type Address } from '@solana/kit';

export type NetworkType = 'mainnet-beta' | 'devnet' | 'testnet';

// x402 network names
export type X402Network = 'solana' | 'solana-devnet';

// Default RPC endpoints (can be overridden via environment variables)
const DEFAULT_ENDPOINTS: Record<NetworkType, string> = {
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  'devnet': 'https://api.devnet.solana.com',
  'testnet': 'https://api.testnet.solana.com',
};

// Get endpoint from environment variable or use default
function getNetworkEndpoint(network: NetworkType): string {
  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC_ prefixed env vars
    if (network === 'mainnet-beta' && process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET;
    }
    if (network === 'devnet' && process.env.NEXT_PUBLIC_SOLANA_RPC_DEVNET) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_DEVNET;
    }
    if (network === 'testnet' && process.env.NEXT_PUBLIC_SOLANA_RPC_TESTNET) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_TESTNET;
    }
  } else {
    // Server-side: can use non-prefixed env vars too
    if (network === 'mainnet-beta') {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET || process.env.SOLANA_RPC_MAINNET || DEFAULT_ENDPOINTS[network];
    }
    if (network === 'devnet') {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_DEVNET || process.env.SOLANA_RPC_DEVNET || DEFAULT_ENDPOINTS[network];
    }
    if (network === 'testnet') {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_TESTNET || process.env.SOLANA_RPC_TESTNET || DEFAULT_ENDPOINTS[network];
    }
  }
  return DEFAULT_ENDPOINTS[network];
}

export const NETWORKS: Record<NetworkType, {
  endpoint: string;
  usdcMint: string;
  label: string;
  color: string;
}> = {
  'mainnet-beta': {
    endpoint: getNetworkEndpoint('mainnet-beta'),
    usdcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    label: 'Mainnet',
    color: 'bg-red-500',
  },
  devnet: {
    endpoint: getNetworkEndpoint('devnet'),
    usdcMint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    label: 'Devnet',
    color: 'bg-green-500',
  },
  testnet: {
    endpoint: getNetworkEndpoint('testnet'),
    usdcMint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    label: 'Testnet',
    color: 'bg-yellow-500',
  },
};

export const RECIPIENT_WALLET: Address = address('DE3nhgFvCa7MryXjcdtMyo8m9y7Vnzn4gHSmjNGzgtyp');

// 0.01 USDC (USDC has 6 decimals)
export const PAYMENT_AMOUNT = BigInt(10000);
export const PAYMENT_AMOUNT_DISPLAY = '0.01';

export const DEFAULT_NETWORK: NetworkType = 'devnet';

export function getUsdcMint(network: NetworkType): Address {
  return address(NETWORKS[network].usdcMint);
}

export function getEndpoint(network: NetworkType): string {
  return getNetworkEndpoint(network);
}

export function toX402Network(network: NetworkType): X402Network {
  return network === 'mainnet-beta' ? 'solana' : 'solana-devnet';
}

export function fromX402Network(x402Network: X402Network): NetworkType {
  return x402Network === 'solana' ? 'mainnet-beta' : 'devnet';
}
