'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/components/providers/WalletProvider';
import { cn } from '@/lib/utils';
import { Sparkles, Wallet } from 'lucide-react';
import { GatyaStatus } from '@/hooks/useGatya';
import { PAYMENT_AMOUNT_DISPLAY } from '@/lib/solana/constants';
import { vibrateTap } from '@/lib/vibration';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GatyaButtonProps {
  onClick: () => void;
  status: GatyaStatus;
  disabled?: boolean;
}

export function GatyaButton({ onClick, status, disabled }: GatyaButtonProps) {
  const { wallets, selectedAccount, connected, connect, connecting } = useWallet();
  const [showWalletDialog, setShowWalletDialog] = useState(false);

  const address = selectedAccount?.address;
  const isLoading = ['fetching_quote', 'awaiting_signature', 'processing'].includes(status);

  const handleSelectWallet = async (wallet: typeof wallets[number]) => {
    try {
      await connect(wallet);
      setShowWalletDialog(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleClick = () => {
    vibrateTap();

    if (!connected || !address) {
      setShowWalletDialog(true);
      return;
    }
    onClick();
  };

  return (
    <div className="relative">
      {/* Outer glow */}
      <motion.div
        className={cn(
          'absolute inset-0 rounded-full blur-2xl',
          isLoading
            ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500'
            : 'bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600'
        )}
        animate={
          isLoading
            ? {
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
                rotate: [0, 180, 360],
              }
            : {
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.6, 0.4],
              }
        }
        transition={{
          duration: isLoading ? 2 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Pulse rings - only when not loading */}
      {!isLoading && !disabled && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-500/50"
            animate={{
              scale: [1, 1.3],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-500/30"
            animate={{
              scale: [1, 1.5],
              opacity: [0.4, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.5,
            }}
          />
        </>
      )}

      {/* Spinning ring when loading */}
      {isLoading && (
        <>
          <motion.div
            className="absolute inset-[-8px] rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(147,51,234,0.8), transparent)',
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.div
            className="absolute inset-[-4px] rounded-full"
            style={{
              background: 'conic-gradient(from 180deg, transparent, rgba(6,182,212,0.6), transparent)',
            }}
            animate={{ rotate: -360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </>
      )}

      {/* Main button */}
      <motion.button
        onClick={handleClick}
        disabled={disabled || isLoading || connecting}
        className={cn(
          'relative w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80',
          'rounded-full',
          'bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700',
          'text-white font-bold',
          'shadow-[0_0_60px_rgba(147,51,234,0.5)]',
          'transition-all duration-300',
          'focus:outline-none focus:ring-4 focus:ring-purple-500/50',
          'cursor-pointer',
          'disabled:cursor-not-allowed',
          'overflow-hidden'
        )}
        whileHover={!disabled && !isLoading ? { scale: 1.05 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.95 } : {}}
        animate={
          isLoading
            ? {
                boxShadow: [
                  '0 0 60px rgba(147,51,234,0.5)',
                  '0 0 100px rgba(6,182,212,0.6)',
                  '0 0 60px rgba(147,51,234,0.5)',
                ],
              }
            : {}
        }
        transition={{
          boxShadow: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      >
        {/* Inner gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 rounded-full" />

        {/* Shimmer effect - faster when loading */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: isLoading ? 1 : 2,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: isLoading ? 0.5 : 3,
          }}
        />

        {/* Loading overlay effect */}
        {isLoading && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-3">
          {isLoading ? (
            <motion.div
              className="flex flex-col items-center justify-center gap-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Animated dots */}
              <div className="flex items-center gap-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
              {/* Pulsing GATYA text */}
              <motion.span
                className="text-2xl md:text-3xl font-[family-name:var(--font-orbitron)] tracking-wider"
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                GATYA
              </motion.span>
            </motion.div>
          ) : !connected || !address ? (
            <>
              <Wallet className="w-12 h-12 md:w-16 md:h-16" />
              <span className="text-2xl md:text-3xl font-[family-name:var(--font-orbitron)] tracking-wider">GATYA</span>
              <span className="text-sm md:text-base opacity-70">Connect Wallet</span>
            </>
          ) : (
            <>
              <Sparkles className="w-12 h-12 md:w-16 md:h-16" />
              <span className="text-2xl md:text-3xl font-[family-name:var(--font-orbitron)] tracking-wider">
                {status === 'error' ? 'Try Again' : 'GATYA'}
              </span>
              <span className="text-sm md:text-base opacity-70">{PAYMENT_AMOUNT_DISPLAY} USDC</span>
            </>
          )}
        </div>
      </motion.button>

      {/* Wallet selection dialog */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            {wallets.map((wallet) => (
              <Button
                key={wallet.name}
                variant="outline"
                className="justify-start gap-3 h-14"
                onClick={() => handleSelectWallet(wallet)}
                disabled={connecting}
              >
                {wallet.icon && (
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className="w-6 h-6"
                  />
                )}
                {wallet.name}
              </Button>
            ))}
            {wallets.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No wallets detected. Please install a Solana wallet like Phantom.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
