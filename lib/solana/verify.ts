import {
  Connection,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { RECIPIENT_WALLET, PAYMENT_AMOUNT, getUsdcMint, NetworkType, NETWORKS } from './constants';

export interface VerificationResult {
  valid: boolean;
  error?: string;
  signature?: string;
}

export async function verifyAndBroadcastTransaction(
  base64Tx: string,
  network: NetworkType
): Promise<VerificationResult> {
  const connection = new Connection(NETWORKS[network].endpoint, 'confirmed');
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
  } catch (e) {
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

  // 3. Get expected recipient ATA
  const recipientAta = await getAssociatedTokenAddress(usdcMint, RECIPIENT_WALLET);

  // 4. Verify transaction contains valid SPL transfer
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

  // 5. Simulate transaction
  try {
    let simulation;
    if (transaction instanceof VersionedTransaction) {
      simulation = await connection.simulateTransaction(transaction);
    } else {
      simulation = await connection.simulateTransaction(transaction, undefined, false);
    }

    if (simulation.value.err) {
      const errStr = JSON.stringify(simulation.value.err);
      let errorMessage = `Simulation failed: ${errStr}`;

      // Provide helpful error messages for common issues
      if (errStr.includes('InvalidAccountData')) {
        errorMessage = 'Transaction failed: You may not have USDC in your wallet. Get devnet USDC from https://faucet.circle.com/';
      } else if (errStr.includes('InsufficientFunds')) {
        errorMessage = 'Insufficient USDC balance. Please ensure you have at least 0.01 USDC.';
      }

      return {
        valid: false,
        error: errorMessage,
      };
    }
  } catch (e) {
    return { valid: false, error: `Simulation error: ${e}` };
  }

  // 6. Broadcast transaction
  try {
    const signature = await connection.sendRawTransaction(serializedTx, {
      skipPreflight: true,
      maxRetries: 3,
    });

    // Wait for confirmation (optional, can be removed for faster response)
    // await connection.confirmTransaction(signature, 'confirmed');

    return { valid: true, signature };
  } catch (e: unknown) {
    const error = e as { message?: string };
    // Check if it's an "already processed" error - this means the transaction was already successful
    if (error.message?.includes('already been processed') ||
        error.message?.includes('AlreadyProcessed')) {
      return { valid: false, error: 'Transaction already processed' };
    }
    return { valid: false, error: `Broadcast failed: ${error.message || 'Unknown error'}` };
  }
}
