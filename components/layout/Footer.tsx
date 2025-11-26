'use client';

import { Github, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row px-4 md:px-6">
        <p className="text-sm text-muted-foreground text-center md:text-left">
          Built with x402 Protocol on Solana
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://solana.com/ja/developers/guides/getstarted/intro-to-x402"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            x402 Docs
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
