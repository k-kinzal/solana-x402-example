import { PublicKey } from '@solana/web3.js';

export type NetworkType = 'mainnet-beta' | 'devnet' | 'testnet';

export const NETWORKS: Record<NetworkType, {
  endpoint: string;
  usdcMint: string;
  label: string;
  color: string;
}> = {
  'mainnet-beta': {
    endpoint: 'https://api.mainnet-beta.solana.com',
    usdcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    label: 'Mainnet',
    color: 'bg-red-500',
  },
  devnet: {
    endpoint: 'https://api.devnet.solana.com',
    usdcMint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    label: 'Devnet',
    color: 'bg-green-500',
  },
  testnet: {
    endpoint: 'https://api.testnet.solana.com',
    usdcMint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    label: 'Testnet',
    color: 'bg-yellow-500',
  },
} as const;

export const RECIPIENT_WALLET = new PublicKey('DE3nhgFvCa7MryXjcdtMyo8m9y7Vnzn4gHSmjNGzgtyp');
export const RECIPIENT_WALLET_STRING = 'DE3nhgFvCa7MryXjcdtMyo8m9y7Vnzn4gHSmjNGzgtyp';

// 0.01 USDC (USDC has 6 decimals)
export const PAYMENT_AMOUNT = 10000;
export const PAYMENT_AMOUNT_DISPLAY = '0.01';

export const DEFAULT_NETWORK: NetworkType = 'devnet';

export function getUsdcMint(network: NetworkType): PublicKey {
  return new PublicKey(NETWORKS[network].usdcMint);
}

export function getEndpoint(network: NetworkType): string {
  return NETWORKS[network].endpoint;
}
