import {
  Connection,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { RECIPIENT_WALLET, PAYMENT_AMOUNT, getUsdcMint, getEndpoint, NetworkType } from './constants';

export interface VerificationResult {
  valid: boolean;
  error?: string;
  signature?: string;
}

export async function verifyAndBroadcastTransaction(
  base64Tx: string,
  network: NetworkType
): Promise<VerificationResult> {
  const connection = new Connection(getEndpoint(network), 'confirmed');
  const usdcMint = getUsdcMint(network);

  // 1. Decode transaction
  let transaction: Transaction | VersionedTransaction;
  let serializedTx: Buffer;

  try {
    serializedTx = Buffer.from(base64Tx, 'base64');

    // Try to deserialize as VersionedTransaction first, then as legacy Transaction
    try {
      transaction = VersionedTransaction.deserialize(serializedTx);
    } catch {
      transaction = Transaction.from(serializedTx);
    }
  } catch {
    return { valid: false, error: 'Invalid transaction format' };
  }

  // 2. Check signature exists
  const signatures = transaction instanceof VersionedTransaction
    ? transaction.signatures
    : transaction.signatures.map(s => s.signature);

  if (!signatures || signatures.length === 0 || !signatures[0]) {
    return { valid: false, error: 'Transaction not signed' };
  }

  const firstSig = signatures[0];
  if (firstSig instanceof Uint8Array && firstSig.every(b => b === 0)) {
    return { valid: false, error: 'Transaction not signed' };
  }

  // 3. Get expected recipient ATA (computed locally, no RPC call)
  const recipientAta = await getAssociatedTokenAddress(usdcMint, RECIPIENT_WALLET);

  // 4. Verify transaction contains valid SPL transfer (local verification, no RPC call)
  let foundValidTransfer = false;

  if (transaction instanceof VersionedTransaction) {
    // Handle VersionedTransaction
    const message = transaction.message;
    const accountKeys = message.staticAccountKeys;
    const instructions = message.compiledInstructions;

    for (const ix of instructions) {
      const programId = accountKeys[ix.programIdIndex];

      if (programId.equals(TOKEN_PROGRAM_ID)) {
        // Check if it's a transfer instruction (instruction type = 3)
        if (ix.data[0] === 3) {
          // Extract amount (bytes 1-8, little-endian u64)
          const amountBytes = ix.data.slice(1, 9);
          const amount = Buffer.from(amountBytes).readBigUInt64LE();

          // Get destination account
          const destIndex = ix.accountKeyIndexes[1];
          const destAccount = accountKeys[destIndex];

          if (destAccount.equals(recipientAta) && amount >= BigInt(PAYMENT_AMOUNT)) {
            foundValidTransfer = true;
            break;
          }
        }
      }
    }
  } else {
    // Handle legacy Transaction
    for (const ix of transaction.instructions) {
      if (ix.programId.equals(TOKEN_PROGRAM_ID)) {
        // Check if it's a transfer instruction
        if (ix.data[0] === 3) {
          const amountBytes = ix.data.slice(1, 9);
          const amount = Buffer.from(amountBytes).readBigUInt64LE();

          // Get destination from keys (index 1 for transfer)
          const destAccount = ix.keys[1].pubkey;

          if (destAccount.equals(recipientAta) && amount >= BigInt(PAYMENT_AMOUNT)) {
            foundValidTransfer = true;
            break;
          }
        }
      }
    }
  }

  if (!foundValidTransfer) {
    return { valid: false, error: 'Invalid transfer: wrong destination or insufficient amount' };
  }

  // 5. Broadcast transaction directly (1 RPC call)
  // Skip simulation to reduce RPC calls - errors will be caught from sendRawTransaction
  try {
    const signature = await connection.sendRawTransaction(serializedTx, {
      skipPreflight: false, // Let the RPC node do preflight check
      maxRetries: 3,
    });

    return { valid: true, signature };
  } catch (e: unknown) {
    const error = e as { message?: string; logs?: string[] };
    const errorMessage = error.message || 'Unknown error';

    // Check if it's an "already processed" error
    if (errorMessage.includes('already been processed') ||
        errorMessage.includes('AlreadyProcessed')) {
      return { valid: false, error: 'Transaction already processed' };
    }

    // Parse common errors for better UX
    if (errorMessage.includes('InvalidAccountData') ||
        errorMessage.includes('insufficient funds') ||
        errorMessage.includes('0x1')) {
      return {
        valid: false,
        error: 'Transaction failed: You may not have USDC in your wallet. Get devnet USDC from https://faucet.circle.com/'
      };
    }

    if (errorMessage.includes('InsufficientFunds') || errorMessage.includes('0x1771')) {
      return { valid: false, error: 'Insufficient USDC balance. Please ensure you have at least 0.01 USDC.' };
    }

    if (errorMessage.includes('Blockhash not found') || errorMessage.includes('BlockhashNotFound')) {
      return { valid: false, error: 'Transaction expired. Please try again.' };
    }

    return { valid: false, error: `Transaction failed: ${errorMessage}` };
  }
}
