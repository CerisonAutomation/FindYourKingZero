// =====================================================
// SWIPEABLE CHAT HEADER — Swipe down to close chat
// Uses framer-motion drag for smooth experience
// =====================================================
import {useCallback, useState} from 'react';
import {motion, type PanInfo} from 'framer-motion';
import {ChevronDown} from 'lucide-react';
import {haptics} from '@/lib/haptics';

interface SwipeableChatHeaderProps {
  /** Title shown in the header */
  title: string;
  /** Called when user swipes down past threshold */
  onClose?: () => void;
  /** Drag threshold in px to trigger close */
  threshold?: number;
  /** Additional content (avatar, status, etc.) */
  children?: React.ReactNode;
}

export function SwipeableChatHeader({
  title,
  onClose,
  threshold = 80,
  children,
}: SwipeableChatHeaderProps) {
  const [dragProgress, setDragProgress] = useState(0);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    const progress = Math.min(Math.max(0, info.offset.y) / threshold, 1);
    setDragProgress(progress);
  }, [threshold]);

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      if (info.offset.y > threshold || info.velocity.y > 300) {
        haptics.tap();
        onClose?.();
      }
      setDragProgress(0);
    },
    [threshold, onClose],
  );

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.5}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className="relative touch-pan-x"
    >
      {/* Drag indicator */}
      <div className="flex justify-center py-1.5">
        <motion.div
          className="w-10 h-1 rounded-full bg-muted-foreground/30"
          animate={{ scaleX: 1 + dragProgress * 0.5 }}
        />
      </div>

      {/* Header content */}
      <div className="flex items-center gap-3 px-4 py-2">
        {onClose && (
          <button
            onClick={() => {
              haptics.tap();
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Close chat"
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </button>
        )}

        <h2 className="flex-1 text-base font-semibold truncate">{title}</h2>

        {children}
      </div>
    </motion.div>
  );
}

export default SwipeableChatHeader;
