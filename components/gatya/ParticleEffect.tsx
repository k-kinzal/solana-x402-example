'use client';

import { motion } from 'framer-motion';
import { Rarity } from '@/lib/gatya/messages';
import { useMemo } from 'react';

interface ParticleEffectProps {
  rarity: Rarity;
}

const PARTICLE_COLORS: Record<Rarity, string[]> = {
  common: ['#9CA3AF', '#D1D5DB', '#A78BFA'],
  rare: ['#3B82F6', '#60A5FA', '#93C5FD', '#06B6D4'],
  superRare: ['#F59E0B', '#FBBF24', '#FDE047', '#FEF3C7', '#FB923C'],
};

const PARTICLE_COUNT: Record<Rarity, number> = {
  common: 12,
  rare: 24,
  superRare: 40,
};

export function ParticleEffect({ rarity }: ParticleEffectProps) {
  const colors = PARTICLE_COLORS[rarity];
  const count = PARTICLE_COUNT[rarity];

  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const distance = 80 + Math.random() * 150;
      const size = rarity === 'superRare' ? 6 + Math.random() * 10 : 4 + Math.random() * 8;
      const duration = 0.8 + Math.random() * 0.6;
      const delay = Math.random() * 0.3;

      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size,
        duration,
        delay,
        color: colors[i % colors.length],
      };
    });
  }, [count, colors, rarity]);

  // Confetti for rare and super rare
  const confetti = useMemo(() => {
    if (rarity === 'common') return [];
    const confettiCount = rarity === 'superRare' ? 30 : 15;
    return Array.from({ length: confettiCount }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 300,
      y: -200 - Math.random() * 100,
      rotation: Math.random() * 360,
      color: colors[i % colors.length],
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 0.5,
    }));
  }, [rarity, colors]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Burst particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            marginLeft: -particle.size / 2,
            marginTop: -particle.size / 2,
            boxShadow: rarity !== 'common' ? `0 0 ${particle.size}px ${particle.color}` : undefined,
          }}
          initial={{
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: particle.x,
            y: particle.y,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Confetti falling */}
      {confetti.map((c) => (
        <motion.div
          key={`confetti-${c.id}`}
          className="absolute left-1/2 top-1/2"
          style={{
            width: 8,
            height: 12,
            backgroundColor: c.color,
            borderRadius: 2,
          }}
          initial={{
            x: c.x,
            y: -50,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: 250,
            rotate: c.rotation,
            opacity: 0,
          }}
          transition={{
            duration: c.duration,
            delay: c.delay + 0.3,
            ease: 'easeIn',
          }}
        />
      ))}

      {/* Ring burst effect */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div
          className="w-40 h-40 rounded-full border-4"
          style={{
            borderColor: rarity === 'superRare' ? '#FBBF24' : rarity === 'rare' ? '#3B82F6' : '#9CA3AF',
          }}
        />
      </motion.div>

      {/* Second ring for rare+ */}
      {rarity !== 'common' && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        >
          <div
            className="w-40 h-40 rounded-full border-2"
            style={{
              borderColor: rarity === 'superRare' ? '#FDE047' : '#60A5FA',
            }}
          />
        </motion.div>
      )}

      {/* Sparkle effects for super rare */}
      {rarity === 'superRare' && (
        <>
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${15 + Math.random() * 70}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
                rotate: [0, 180],
              }}
              transition={{
                duration: 1.2,
                delay: 0.5 + i * 0.15,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                className="text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              >
                <path
                  d="M12 2L13.09 8.26L19 7L14.74 11.26L21 12L14.74 12.74L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12.74L3 12L9.26 11.26L5 7L10.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </motion.div>
          ))}
        </>
      )}

      {/* Star burst for rare */}
      {rarity === 'rare' && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                delay: 0.5 + i * 0.2,
                repeat: Infinity,
                repeatDelay: 2.5,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="text-blue-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]"
              >
                <path
                  d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}
