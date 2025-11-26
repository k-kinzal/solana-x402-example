# Solana GATYA - x402 Protocol Implementation

A sample implementation of the [x402 protocol](https://www.x402.org/) on Solana blockchain, demonstrating HTTP 402 Payment Required flow with USDC payments.

**Live Demo**: [https://solana-x402-example.vercel.app/](https://solana-x402-example.vercel.app/)

## What is x402?

x402 is an open protocol that enables native payments on the web using the HTTP 402 status code. It allows servers to request payment before providing access to resources.

### How x402 Works

```
┌─────────┐                    ┌─────────┐
│  Client │                    │  Server │
└────┬────┘                    └────┬────┘
     │                              │
     │  1. GET /api/gatya           │
     │ ─────────────────────────────>
     │                              │
     │  2. 402 Payment Required     │
     │     + PaymentRequirements    │
     │ <─────────────────────────────
     │                              │
     │  3. GET /api/gatya           │
     │     + X-Payment: <signed_tx> │
     │ ─────────────────────────────>
     │                              │
     │  4. 200 OK + Content         │
     │ <─────────────────────────────
     │                              │
```

1. Client requests a resource
2. Server responds with 402 and payment requirements (amount, recipient, asset)
3. Client signs a transaction and sends it in `X-Payment` header
4. Server verifies, broadcasts the transaction, and returns the content

## Features

- **x402 Protocol**: Full implementation of HTTP 402 payment flow
- **Multi-Network Support**: Devnet, Testnet, and Mainnet
- **Multi-Wallet Support**: Phantom, Solflare, Backpack, and more
- **USDC Payments**: 0.01 USDC per gatya draw
- **Gacha System**: 100 messages with rarity system (Common/Rare/Super Rare)
- **Rich Animations**: Beautiful UI with Framer Motion

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Blockchain**: Solana Web3.js, SPL Token
- **Wallet**: Solana Wallet Adapter

## Getting Started

### Prerequisites

- Node.js 18+
- A Solana wallet (Phantom, Solflare, etc.)
- Devnet USDC (get from [Circle Faucet](https://faucet.circle.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/solana-x402-example.git
cd solana-x402-example

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Getting Devnet USDC

1. Visit [Circle Faucet](https://faucet.circle.com/)
2. Select "Solana" and "USDC"
3. Enter your wallet address
4. Receive test USDC on devnet

## Project Structure

```
├── app/
│   ├── api/
│   │   └── gatya/
│   │       └── route.ts      # x402 API endpoint
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── gatya/
│   │   ├── GatyaButton.tsx   # Main gatya button
│   │   ├── GatyaResult.tsx   # Result dialog
│   │   └── ParticleEffect.tsx
│   ├── wallet/
│   │   ├── WalletButton.tsx
│   │   └── NetworkSelector.tsx
│   └── ui/                   # shadcn/ui components
├── hooks/
│   ├── useGatya.ts           # Gatya logic hook
│   └── useNetwork.ts         # Network switching
└── lib/
    ├── gatya/
    │   └── messages.ts       # 100 gatya messages
    └── solana/
        ├── constants.ts      # Network config, USDC mints
        ├── transaction.ts    # Payment requirements
        └── verify.ts         # Transaction verification
```

## x402 Implementation Details

### Payment Requirements (402 Response)

```typescript
{
  x402Version: 1,
  scheme: 'exact',
  network: 'solana-devnet',
  maxAmountRequired: '10000',  // 0.01 USDC (6 decimals)
  resource: '/api/gatya',
  description: 'Gatya draw - 0.01 USDC',
  payTo: 'DE3nhgFvCa7MryXjcdtMyo8m9y7Vnzn4gHSmjNGzgtyp',
  asset: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'  // USDC mint
}
```

### Solana-Specific Implementation Points

#### 1. Transaction Verification

The server verifies the payment transaction before broadcasting:

```typescript
// 1. Decode the base64-encoded transaction
const transaction = VersionedTransaction.deserialize(buffer);

// 2. Verify signature exists
const signatures = transaction.signatures;

// 3. Check for valid SPL token transfer
// - Correct recipient ATA
// - Correct amount (>= required)
// - Correct token mint (USDC)

// 4. Simulate transaction
await connection.simulateTransaction(transaction);

// 5. Broadcast transaction
await connection.sendRawTransaction(serializedTx);
```

#### 2. Associated Token Account (ATA) Handling

If the recipient's USDC token account doesn't exist, the transaction includes an instruction to create it:

```typescript
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
```

#### 3. Network-Specific USDC Mints

```typescript
const USDC_MINTS = {
  'mainnet-beta': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'devnet': '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  'testnet': '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
};
```

#### 4. Replay Attack Prevention

Solana blockchain naturally prevents replay attacks - the same signed transaction cannot be processed twice. The server also checks for "already processed" errors.

## Configuration

### Environment Variables (Optional)

For production, you may want to use dedicated RPC endpoints:

```env
NEXT_PUBLIC_SOLANA_RPC_MAINNET=https://your-rpc-endpoint.com
NEXT_PUBLIC_SOLANA_RPC_DEVNET=https://your-devnet-endpoint.com
```

### Customization

- **Recipient Wallet**: Edit `RECIPIENT_WALLET` in `lib/solana/constants.ts`
- **Payment Amount**: Edit `PAYMENT_AMOUNT` in `lib/solana/constants.ts`
- **Gacha Messages**: Edit `lib/gatya/messages.ts`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com/new)
3. Deploy (no configuration needed)

### Other Platforms

```bash
npm run build
npm run start
```

## Security Considerations

- Always verify transaction contents server-side before broadcasting
- Use dedicated RPC endpoints for production (rate limits on public endpoints)
- Consider adding rate limiting to prevent abuse
- The recipient wallet's private key is never exposed

## License

MIT

## Resources

- [x402 Protocol](https://www.x402.org/)
- [Solana Documentation](https://docs.solana.com/)
- [SPL Token Documentation](https://spl.solana.com/token)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
