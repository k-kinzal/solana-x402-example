import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { PAYMENT_AMOUNT, getUsdcMint, RECIPIENT_WALLET, NetworkType } from './constants';

export interface PaymentRequirements {
  x402Version: number;
  scheme: 'exact';
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  payTo: string;
  asset: string;
}

export function createPaymentRequirements(network: NetworkType): PaymentRequirements {
  const networkName = network === 'mainnet-beta' ? 'solana-mainnet' : `solana-${network}`;
  const usdcMint = getUsdcMint(network);

  return {
    x402Version: 1,
    scheme: 'exact',
    network: networkName,
    maxAmountRequired: PAYMENT_AMOUNT.toString(),
    resource: '/api/gatya',
    description: 'Gatya draw - 0.01 USDC',
    payTo: RECIPIENT_WALLET.toBase58(),
    asset: usdcMint.toBase58(),
  };
}

export async function createPaymentTransaction(
  connection: Connection,
  payer: PublicKey,
  network: NetworkType
): Promise<Transaction> {
  const usdcMint = getUsdcMint(network);

  // Get payer's USDC token account
  const payerAta = await getAssociatedTokenAddress(usdcMint, payer);

  // Get recipient's USDC token account
  const recipientAta = await getAssociatedTokenAddress(usdcMint, RECIPIENT_WALLET);

  const transaction = new Transaction();

  // Check if recipient ATA exists, if not create it
  let recipientAtaExists = false;
  try {
    const accountInfo = await connection.getAccountInfo(recipientAta);
    recipientAtaExists = accountInfo !== null;
  } catch {
    // If we can't check, assume it doesn't exist and add creation instruction
    recipientAtaExists = false;
  }

  if (!recipientAtaExists) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        recipientAta,
        RECIPIENT_WALLET,
        usdcMint
      )
    );
  }

  // Add transfer instruction
  const transferInstruction = createTransferInstruction(
    payerAta,
    recipientAta,
    payer,
    PAYMENT_AMOUNT
  );

  transaction.add(transferInstruction);

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer;

  return transaction;
}
