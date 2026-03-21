/**
 * SafetyShield — Pre-send content safety indicator
 *
 * Sits above the input area and shows a contextual warning when
 * the typed message is flagged. Offers a one-tap "Soften" rewrite.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import type { SafetyResult } from '@/lib/ai/ChatAI';

interface SafetyShieldProps {
  result: SafetyResult | null;
  onApplySoftened: (text: string) => void;
}

export function SafetyShield({ result, onApplySoftened }: SafetyShieldProps) {
  const visible = result !== null && result.category !== 'ok';

  const isBlock = result?.category === 'block';
  const color = isBlock ? 'text-red-400' : 'text-amber-400';
  const bg = isBlock ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20';
  const Icon = isBlock ? XCircle : AlertTriangle;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="safety-shield"
          initial={{ opacity: 0, height: 0, y: 4 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: 4 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`mx-3 mb-1.5 px-3 py-2 rounded-xl border flex items-center gap-2.5 ${bg}`}
        >
          <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
          <p className={`text-[11px] font-semibold flex-1 leading-tight ${color}`}>
            {result?.reason}
          </p>
          {!isBlock && result?.softened && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => onApplySoftened(result.softened!)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/25 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400">Soften</span>
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
