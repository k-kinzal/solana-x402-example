'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GatyaMessage, RARITY_CONFIG } from '@/lib/gatya/messages';
import { cn } from '@/lib/utils';
import { ExternalLink, RotateCcw } from 'lucide-react';
import { useNetwork } from '@/hooks/useNetwork';
import { ParticleEffect } from './ParticleEffect';
import { vibrateForRarity } from '@/lib/vibration';

interface GatyaResultProps {
  result: GatyaMessage | null;
  transactionSignature: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export function GatyaResult({
  result,
  transactionSignature,
  isOpen,
  onClose,
  onRetry,
}: GatyaResultProps) {
  const { network } = useNetwork();

  // Haptic feedback when result is shown
  useEffect(() => {
    if (isOpen && result) {
      vibrateForRarity(result.rarity);
    }
  }, [isOpen, result]);

  if (!result) return null;

  const config = RARITY_CONFIG[result.rarity];

  const getExplorerUrl = () => {
    if (!transactionSignature) return null;
    const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
    return `https://explorer.solana.com/tx/${transactionSignature}${cluster}`;
  };

  const rarityGradient = {
    common: 'from-gray-600 via-gray-500 to-gray-600',
    rare: 'from-blue-600 via-cyan-500 to-blue-600',
    superRare: 'from-amber-500 via-yellow-400 to-orange-500',
  };

  const rarityBorder = {
    common: 'border-gray-500/30',
    rare: 'border-blue-500/50',
    superRare: 'border-amber-400/60',
  };

  const rarityTextGlow = {
    common: '',
    rare: 'drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]',
    superRare: 'drop-shadow-[0_0_15px_rgba(251,191,36,1)]',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg p-0 overflow-visible bg-transparent border-none shadow-none"
        showCloseButton={false}
        onOverlayClick={onClose}
        onPointerDownOutside={() => onClose()}
        onInteractOutside={() => onClose()}
      >
        {/* Animated overlay area */}
        <div
          className="fixed inset-0 z-[-1] overflow-hidden"
          onClick={onClose}
          aria-hidden="true"
        >
          {/* Animated gradient background */}
          <motion.div
            className={cn(
              'absolute inset-0',
              result.rarity === 'superRare' && 'bg-gradient-to-br from-amber-900/20 via-black/50 to-orange-900/20',
              result.rarity === 'rare' && 'bg-gradient-to-br from-blue-900/20 via-black/50 to-cyan-900/20',
              result.rarity === 'common' && 'bg-gradient-to-br from-purple-900/10 via-black/50 to-violet-900/10'
            )}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Floating particles in background */}
          {Array.from({ length: result.rarity === 'superRare' ? 30 : result.rarity === 'rare' ? 20 : 10 }).map((_, i) => (
            <motion.div
              key={`bg-particle-${i}`}
              className={cn(
                'absolute rounded-full',
                result.rarity === 'superRare' && 'bg-amber-500/30',
                result.rarity === 'rare' && 'bg-blue-500/30',
                result.rarity === 'common' && 'bg-purple-500/20'
              )}
              style={{
                width: Math.random() * 6 + 2,
                height: Math.random() * 6 + 2,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Corner glow effects */}
          <motion.div
            className={cn(
              'absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl',
              result.rarity === 'superRare' && 'bg-amber-500/20',
              result.rarity === 'rare' && 'bg-blue-500/15',
              result.rarity === 'common' && 'bg-purple-500/10'
            )}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className={cn(
              'absolute -bottom-20 -right-20 w-60 h-60 rounded-full blur-3xl',
              result.rarity === 'superRare' && 'bg-orange-500/20',
              result.rarity === 'rare' && 'bg-cyan-500/15',
              result.rarity === 'common' && 'bg-violet-500/10'
            )}
            animate={{
              scale: [1.3, 1, 1.3],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Radial lines for super rare */}
          {result.rarity === 'superRare' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{
                duration: 60,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={`ray-${i}`}
                  className="absolute w-[1px] h-[150%] bg-gradient-to-t from-transparent via-amber-500/10 to-transparent"
                  style={{
                    transform: `rotate(${i * 30}deg)`,
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
        <DialogTitle className="sr-only">Gatya Result</DialogTitle>
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Background flash effect */}
              <motion.div
                className={cn(
                  'absolute -inset-20 rounded-full blur-3xl pointer-events-none',
                  result.rarity === 'superRare' && 'bg-amber-500',
                  result.rarity === 'rare' && 'bg-blue-500',
                  result.rarity === 'common' && 'bg-purple-500'
                )}
                initial={{ opacity: 0.8, scale: 0 }}
                animate={{ opacity: 0, scale: 3 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />

              {/* Persistent glow */}
              <motion.div
                className={cn(
                  'absolute -inset-10 rounded-3xl blur-2xl pointer-events-none',
                  result.rarity === 'superRare' && 'bg-amber-500/30',
                  result.rarity === 'rare' && 'bg-blue-500/20',
                  result.rarity === 'common' && 'bg-gray-500/10'
                )}
                animate={
                  result.rarity !== 'common'
                    ? {
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Particles */}
              <ParticleEffect rarity={result.rarity} />

              {/* Main card */}
              <motion.div
                className={cn(
                  'relative rounded-3xl border-2 overflow-hidden',
                  'bg-gradient-to-b from-black/90 via-black/80 to-black/90',
                  'backdrop-blur-xl shadow-2xl',
                  rarityBorder[result.rarity]
                )}
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: 0.1,
                }}
              >
                {/* Top gradient bar */}
                <motion.div
                  className={cn(
                    'h-1.5 bg-gradient-to-r',
                    rarityGradient[result.rarity]
                  )}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                />

                <div className="p-8">
                  {/* GET! Header */}
                  <motion.div
                    className="text-center mb-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <motion.span
                      className={cn(
                        'text-5xl md:text-6xl font-black tracking-wider font-[family-name:var(--font-orbitron)]',
                        'bg-gradient-to-r bg-clip-text text-transparent',
                        rarityGradient[result.rarity],
                        rarityTextGlow[result.rarity]
                      )}
                      animate={
                        result.rarity === 'superRare'
                          ? {
                              textShadow: [
                                '0 0 20px rgba(251,191,36,0.5)',
                                '0 0 40px rgba(251,191,36,0.8)',
                                '0 0 20px rgba(251,191,36,0.5)',
                              ],
                            }
                          : {}
                      }
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      GET!
                    </motion.span>
                  </motion.div>

                  {/* Rarity label */}
                  <motion.div
                    className="text-center mb-6"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <span
                      className={cn(
                        'inline-block px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase',
                        'border',
                        result.rarity === 'superRare' && 'bg-amber-500/20 border-amber-500/50 text-amber-400',
                        result.rarity === 'rare' && 'bg-blue-500/20 border-blue-500/50 text-blue-400',
                        result.rarity === 'common' && 'bg-gray-500/20 border-gray-500/50 text-gray-400'
                      )}
                    >
                      {config.label}
                    </span>
                  </motion.div>

                  {/* Emoji with dramatic entrance */}
                  <motion.div
                    className="text-center mb-6"
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.5,
                      duration: 0.6,
                      type: 'spring',
                      stiffness: 200,
                    }}
                  >
                    <motion.div
                      className="relative inline-block"
                      animate={
                        result.rarity === 'superRare'
                          ? {
                              scale: [1, 1.15, 1],
                              rotate: [0, 5, -5, 0],
                            }
                          : result.rarity === 'rare'
                          ? {
                              scale: [1, 1.08, 1],
                            }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      {/* Emoji glow */}
                      {result.rarity !== 'common' && (
                        <motion.div
                          className={cn(
                            'absolute inset-0 text-8xl md:text-9xl blur-lg opacity-50',
                            result.rarity === 'superRare' && 'text-amber-400',
                            result.rarity === 'rare' && 'text-blue-400'
                          )}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {result.emoji}
                        </motion.div>
                      )}
                      <span className="relative text-8xl md:text-9xl">{result.emoji}</span>
                    </motion.div>
                  </motion.div>

                  {/* Message */}
                  <motion.p
                    className={cn(
                      'text-center text-xl md:text-2xl font-bold mb-8 leading-relaxed',
                      result.rarity === 'superRare' && 'text-amber-300',
                      result.rarity === 'rare' && 'text-blue-300',
                      result.rarity === 'common' && 'text-gray-200'
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                  >
                    {result.message}
                  </motion.p>

                  {/* Actions */}
                  <motion.div
                    className="flex flex-col gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                  >
                    <Button
                      onClick={onRetry}
                      size="lg"
                      className={cn(
                        'w-full h-14 text-lg font-bold',
                        'bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600',
                        'hover:from-purple-500 hover:via-violet-500 hover:to-purple-500',
                        'shadow-lg shadow-purple-500/25',
                        'transition-all duration-300 hover:scale-[1.02]'
                      )}
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Draw Again
                    </Button>

                    {transactionSignature && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-12 border-white/10 hover:bg-white/5"
                        asChild
                      >
                        <a
                          href={getExplorerUrl() || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Transaction
                        </a>
                      </Button>
                    )}
                  </motion.div>

                  {/* Message ID - subtle */}
                  <motion.p
                    className="text-center text-xs text-white/30 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                  >
                    No.{result.id.toString().padStart(3, '0')}
                  </motion.p>
                </div>

                {/* Bottom gradient bar */}
                <motion.div
                  className={cn(
                    'h-1 bg-gradient-to-r',
                    rarityGradient[result.rarity]
                  )}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                />
              </motion.div>

              {/* Tap to close hint */}
              <motion.p
                className="text-center text-white/40 text-sm mt-4 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                Tap outside to close
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
