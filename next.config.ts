import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use empty turbopack config to silence the warning
  turbopack: {},
  // Transpile wallet adapter packages
  transpilePackages: [
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets',
  ],
};

export default nextConfig;
