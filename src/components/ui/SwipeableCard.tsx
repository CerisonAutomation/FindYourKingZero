// =====================================================
// SWIPEABLE PROFILE CARD — Gestured profile card
// Swipe right = like, left = pass
// =====================================================
import {useCallback, useState} from 'react';
import {motion, type PanInfo, useMotionValue, useTransform} from 'framer-motion';
import {Heart, X} from 'lucide-react';
import {haptics} from '@/lib/haptics';
import {cn} from '@/lib/utils';

export interface SwipeableCardProps {
  children: React.ReactNode;
  /** Swipe right callback (like) */
  onLike?: () => void;
  /** Swipe left callback (pass) */
  onPass?: () => void;
  /** Threshold in px to trigger action */
  threshold?: number;
  className?: string;
}

export function SwipeableCard({
  children,
  onLike,
  onPass,
  threshold = 120,
  className,
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, threshold], [0, 1]);
  const passOpacity = useTransform(x, [-threshold, 0], [1, 0]);
  const [isGone, setIsGone] = useState(false);

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const { offset, velocity } = info;

      if (offset.x > threshold || velocity.x > 500) {
        // Swipe right — like
        setIsGone(true);
        haptics.success();
        onLike?.();
      } else if (offset.x < -threshold || velocity.x < -500) {
        // Swipe left — pass
        setIsGone(true);
        haptics.tap();
        onPass?.();
      }
    },
    [threshold, onLike, onPass],
  );

  if (isGone) return null;

  return (
    <motion.div
      className={cn('relative touch-pan-y', className)}
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Like indicator */}
      <motion.div
        className="absolute top-6 left-6 z-20 pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border-2 border-green-500 backdrop-blur-sm">
          <Heart className="w-6 h-6 text-green-400 fill-green-400" />
          <span className="text-lg font-bold text-green-400">LIKE</span>
        </div>
      </motion.div>

      {/* Pass indicator */}
      <motion.div
        className="absolute top-6 right-6 z-20 pointer-events-none"
        style={{ opacity: passOpacity }}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border-2 border-red-500 backdrop-blur-sm">
          <X className="w-6 h-6 text-red-400" />
          <span className="text-lg font-bold text-red-400">PASS</span>
        </div>
      </motion.div>

      {children}
    </motion.div>
  );
}

export default SwipeableCard;
