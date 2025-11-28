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

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Blockchain**: @solana/kit, @solana-program/token
- **Wallet**: @solana/react, @wallet-standard/react
- **Payments**: x402, x402-fetch, x402-next

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
│   │   ├── gatya/
│   │   │   └── route.ts          # Protected gatya API endpoint
│   │   └── facilitator/          # x402 facilitator endpoints
│   │       ├── verify/route.ts   # Payment verification
│   │       ├── settle/route.ts   # Transaction settlement
│   │       └── supported/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── gatya/
│   │   ├── GatyaButton.tsx       # Main gatya button
│   │   ├── GatyaSection.tsx      # Gatya section container
│   │   ├── GatyaSectionConnected.tsx
│   │   ├── GatyaResult.tsx       # Result dialog
│   │   └── ParticleEffect.tsx
│   ├── wallet/
│   │   ├── WalletButton.tsx
│   │   └── NetworkSelector.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ThemeToggle.tsx
│   ├── providers/
│   │   ├── index.tsx
│   │   ├── NetworkProvider.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── WalletProvider.tsx
│   └── ui/                       # shadcn/ui components
├── hooks/
│   ├── useGatya.ts               # Gatya logic with x402-fetch
│   └── useNetwork.ts             # Network switching
├── lib/
│   ├── gatya/
│   │   └── messages.ts           # 100 gatya messages
│   ├── solana/
│   │   └── constants.ts          # Network config, USDC mints
│   └── x402/
│       └── middleware.ts         # Custom x402 middleware for SVM
└── middleware.ts                 # Next.js middleware for payment protection
```

## x402 Implementation Details

This project uses the [x402 protocol](https://www.x402.org/) with custom middleware for Solana (SVM) support.

### Architecture

```
Client (x402-fetch)           Server (middleware.ts)           Facilitator API
       │                              │                              │
       │  1. GET /api/gatya           │                              │
       │ ────────────────────────────>│                              │
       │                              │                              │
       │  2. 402 + PaymentRequirements│                              │
       │ <────────────────────────────│                              │
       │                              │                              │
       │  (sign transaction)          │                              │
       │                              │                              │
       │  3. GET + X-PAYMENT header   │                              │
       │ ────────────────────────────>│  4. POST /verify             │
       │                              │ ────────────────────────────>│
       │                              │  5. { isValid: true }        │
       │                              │ <────────────────────────────│
       │                              │  6. POST /settle             │
       │                              │ ────────────────────────────>│
       │                              │  7. { success, transaction } │
       │                              │ <────────────────────────────│
       │  8. 200 + Content            │                              │
       │ <────────────────────────────│                              │
```

### Payment Requirements (402 Response)

```typescript
{
  x402Version: 1,
  scheme: 'exact',
  network: 'solana-devnet',
  maxAmountRequired: '10000',  // 0.01 USDC (6 decimals)
  resource: '/api/gatya',
  description: 'Gatya draw',
  payTo: 'DE3nhgFvCa7MryXjcdtMyo8m9y7Vnzn4gHSmjNGzgtyp',
  asset: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'  // USDC mint
}
```

### Key Components

#### 1. Client-Side: x402-fetch

The client uses `x402-fetch` to automatically handle the 402 payment flow:

```typescript
import { wrapFetchWithPayment } from 'x402-fetch';

const fetchWithPayment = wrapFetchWithPayment(
  fetch,
  transactionSigner,
  PAYMENT_AMOUNT,
  customSelector,
  { svmConfig: { rpcUrl: NETWORKS.devnet.endpoint } }
);

// Automatically handles 402 → sign → retry flow
const response = await fetchWithPayment('/api/gatya');
```

#### 2. Server-Side: Custom Middleware

Next.js middleware protects routes with payment requirements:

```typescript
// middleware.ts
export const middleware = paymentMiddleware(
  RECIPIENT_WALLET,
  {
    '/api/gatya': {
      price: '$0.01',
      network: 'solana-devnet',
      config: { description: 'Gatya draw' },
    },
  },
  { url: getFacilitatorUrl() }
);
```

#### 3. Facilitator API: Verify & Settle

**Verify** (`/api/facilitator/verify`):
- Decodes the base64-encoded transaction
- Verifies at least one valid signature exists
- Checks for TransferChecked instruction to Token Program
- Validates USDC mint address and recipient ATA
- Confirms transfer amount meets requirements

**Settle** (`/api/facilitator/settle`):
- Broadcasts the signed transaction to Solana
- Returns the transaction signature on success

#### 4. Network-Specific USDC Mints

```typescript
const USDC_MINTS = {
  'mainnet-beta': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'devnet': '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  'testnet': '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
};
```

#### 5. Replay Attack Prevention

Solana blockchain naturally prevents replay attacks - the same signed transaction cannot be processed twice. The facilitator also handles "already processed" errors gracefully.

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
- **Gacha Messages**: Edit `lib/gatya/messages.ts` (80 Common, 15 Rare, 5 Super Rare)
- **Protected Routes**: Configure routes in `middleware.ts`

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
- [x402 npm packages](https://www.npmjs.com/package/x402)
- [Solana Documentation](https://docs.solana.com/)
- [@solana/kit](https://www.npmjs.com/package/@solana/kit)
- [Wallet Standard](https://github.com/wallet-standard/wallet-standard)
