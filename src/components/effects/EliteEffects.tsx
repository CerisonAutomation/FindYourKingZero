/**
 * Elite Visual Effects - Confetti, Particles, and Match Animations
 * Extracted from motion-presets and enhanced for dating app
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// CONFETTI EFFECT - Premium Celebration Animation
// ═══════════════════════════════════════════════════════════════

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: { x: number; y: number; rotation: number };
  shape: 'square' | 'circle' | 'triangle' | 'star';
}

interface ConfettiProps {
  trigger?: boolean;
  count?: number;
  duration?: number;
  colors?: string[];
  spread?: number;
  origin?: { x: number; y: number };
  onComplete?: () => void;
}

const DEFAULT_COLORS = [
  '#FF006E', // Pink
  '#FB5607', // Orange
  '#FFBE0B', // Yellow
  '#8338EC', // Purple
  '#3A86FF', // Blue
  '#06FFB4', // Teal
];

export function EliteConfetti({
  trigger = false,
  count = 100,
  duration = 3000,
  colors = DEFAULT_COLORS,
  spread = 360,
  origin = { x: 0.5, y: 0.5 },
  onComplete,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  const generatePieces = useCallback(() => {
    const newPieces: ConfettiPiece[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
      const velocity = 5 + Math.random() * 10;
      
      newPieces.push({
        id: i,
        x: origin.x * 100,
        y: origin.y * 100,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        velocity: {
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity - 5,
          rotation: (Math.random() - 0.5) * 20,
        },
        shape: ['square', 'circle', 'triangle', 'star'][Math.floor(Math.random() * 4)] as ConfettiPiece['shape'],
      });
    }
    
    return newPieces;
  }, [count, colors, spread, origin]);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      setPieces(generatePieces());
      
      setTimeout(() => {
        setIsActive(false);
        setPieces([]);
        onComplete?.();
      }, duration);
    }
  }, [trigger, isActive, generatePieces, duration, onComplete]);

  const getShapePath = (shape: ConfettiPiece['shape']) => {
    switch (shape) {
      case 'circle':
        return 'circle(50% at 50% 50%)';
      case 'triangle':
        return 'polygon(50% 0%, 0% 100%, 100% 100%)';
      case 'star':
        return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
      default:
        return 'none';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute"
            style={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              clipPath: getShapePath(piece.shape),
              borderRadius: piece.shape === 'circle' ? '50%' : piece.shape === 'square' ? '2px' : '0',
            }}
            initial={{
              x: 0,
              y: 0,
              rotate: piece.rotation,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: piece.velocity.x * 50,
              y: piece.velocity.y * 50 + 300,
              rotate: piece.rotation + piece.velocity.rotation * 50,
              scale: [0, 1, 1, 0.5],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: duration / 1000,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HEART BURST EFFECT - For Like/Match Animations
// ═══════════════════════════════════════════════════════════════

interface HeartBurstProps {
  trigger: boolean;
  origin?: { x: number; y: number };
  count?: number;
}

export function HeartBurst({ trigger, origin = { x: 0.5, y: 0.5 }, count = 20 }: HeartBurstProps) {
  const [hearts, setHearts] = useState<Array<{ id: number; delay: number; scale: number; rotation: number }>>([]);

  useEffect(() => {
    if (trigger) {
      const newHearts = Array.from({ length: count }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.3,
        scale: 0.5 + Math.random() * 0.5,
        rotation: (Math.random() - 0.5) * 60,
      }));
      setHearts(newHearts);
      
      const timer = setTimeout(() => setHearts([]), 1500);
      return () => clearTimeout(timer);
    }
  }, [trigger, count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {hearts.map((heart, i) => {
          const angle = (i / count) * Math.PI * 2;
          const distance = 100 + Math.random() * 100;
          
          return (
            <motion.div
              key={heart.id}
              className="absolute text-red-500"
              style={{
                left: `${origin.x * 100}%`,
                top: `${origin.y * 100}%`,
                fontSize: `${24 * heart.scale}px`,
              }}
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0, 
                opacity: 1,
                rotate: heart.rotation,
              }}
              animate={{ 
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance - 50,
                scale: [0, heart.scale, heart.scale * 0.5],
                opacity: [0, 1, 0],
                rotate: heart.rotation + (Math.random() - 0.5) * 30,
              }}
              transition={{ 
                duration: 1,
                delay: heart.delay,
                ease: 'easeOut',
              }}
            >
              ❤️
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FLOATING HEARTS - Background Ambient Effect
// ═══════════════════════════════════════════════════════════════

interface FloatingHeartsProps {
  count?: number;
  className?: string;
}

export function FloatingHearts({ count = 15, className = '' }: FloatingHeartsProps) {
  const hearts = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 4,
    scale: 0.3 + Math.random() * 0.4,
  }));

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-pink-400/30"
          style={{
            left: `${heart.left}%`,
            bottom: -50,
            fontSize: `${24 * heart.scale}px`,
          }}
          animate={{
            y: [0, -window.innerHeight - 100],
            x: [0, (Math.random() - 0.5) * 100],
            rotate: [0, 360],
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          💕
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SPARKLE EFFECT - For Premium UI Elements
// ═══════════════════════════════════════════════════════════════

interface SparkleProps {
  children: React.ReactNode;
  className?: string;
}

export function SparkleEffect({ children, className = '' }: SparkleProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; scale: number }>>([]);

  const addSparkle = useCallback(() => {
    const newSparkle = {
      id: Date.now(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: 0.5 + Math.random() * 0.5,
    };
    setSparkles(prev => [...prev, newSparkle]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
    }, 1000);
  }, []);

  useEffect(() => {
    const interval = setInterval(addSparkle, 800);
    return () => clearInterval(interval);
  }, [addSparkle]);

  return (
    <div className={`relative ${className}`}>
      {children}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute pointer-events-none"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
            }}
            initial={{ scale: 0, opacity: 0, rotate: 0 }}
            animate={{ 
              scale: [0, sparkle.scale, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180, 360],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 0L12.5 7.5L20 10L12.5 12.5L10 20L7.5 12.5L0 10L7.5 7.5L10 0Z"
                fill="url(#sparkle-gradient)"
              />
              <defs>
                <linearGradient id="sparkle-gradient" x1="0" y1="0" x2="20" y2="20">
                  <stop stopColor="#FFD700" />
                  <stop offset="1" stopColor="#FFA500" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RIPPLE EFFECT - Touch Feedback
// ═══════════════════════════════════════════════════════════════

interface RippleProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function RippleEffect({ children, className = '', color = 'rgba(255,255,255,0.5)' }: RippleProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={handleClick}>
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: color,
            }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.5 }}
            animate={{ 
              width: 400, 
              height: 400, 
              x: -200, 
              y: -200, 
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
