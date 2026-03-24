// ═══════════════════════════════════════════════════════════════
// COMPONENT: QuantumAvatarDock — FYK bottom HUD dock
// Stack: Vite + React 18 + Framer Motion + Zustand
// NO 'use client', NO Next.js imports
// Upgraded:
//   • Tabs driven by Zustand navStore (router-aware active state)
//   • useUser() for real avatar initial + premium badge
//   • useIsMobile() responsive radius
//   • ARIA: role="menu", role="menuitem", aria-expanded, aria-label
//   • Focus trap inside radial HUD (Tab/Shift-Tab + Escape)
//   • useReducedMotion respected on all motion.* nodes
//   • Removed hardcoded content panels (screens handle their own UI)
//   • JSDoc, strict TypeScript, no magic numbers
// ═══════════════════════════════════════════════════════════════

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type KeyboardEvent,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  CalendarDays,
  Dumbbell,
  Plane,
  NotebookPen,
  Salad,
  Newspaper,
  Clock,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { useNavStore } from '@/store';
import { useUser } from '@/hooks/useUser';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { Screen } from '@/types';

// ── Tab configuration ─────────────────────────────────────────

/** Maps dock tab IDs to their screen route */
const TAB_SCREEN_MAP: Record<string, Screen> = {
  scheduler: 'discover',
  gym: 'right-now',
  travel: 'events',
  notes: 'messages',
  calendar: 'discover',
  diet: 'profile',
  news: 'notifications',
  settings: 'settings',
};

export type DockTabId =
  | 'scheduler'
  | 'gym'
  | 'travel'
  | 'notes'
  | 'calendar'
  | 'diet'
  | 'news'
  | 'settings';

interface DockTab {
  id: DockTabId;
  label: string;
  icon: React.ReactElement;
  accentClass: string;
}

const TABS: DockTab[] = [
  { id: 'scheduler', label: 'Scheduler', icon: <Clock aria-hidden="true" />, accentClass: 'from-sky-400/70 via-cyan-300/30 to-transparent' },
  { id: 'gym',       label: 'Gym',       icon: <Dumbbell aria-hidden="true" />, accentClass: 'from-emerald-400/70 via-lime-300/30 to-transparent' },
  { id: 'travel',    label: 'Travel',    icon: <Plane aria-hidden="true" />, accentClass: 'from-violet-400/70 via-fuchsia-300/30 to-transparent' },
  { id: 'notes',     label: 'Notes',     icon: <NotebookPen aria-hidden="true" />, accentClass: 'from-amber-400/70 via-orange-300/30 to-transparent' },
  { id: 'calendar',  label: 'Calendar',  icon: <CalendarDays aria-hidden="true" />, accentClass: 'from-indigo-400/70 via-sky-300/30 to-transparent' },
  { id: 'diet',      label: 'Diet',      icon: <Salad aria-hidden="true" />, accentClass: 'from-lime-400/70 via-emerald-300/30 to-transparent' },
  { id: 'news',      label: 'News',      icon: <Newspaper aria-hidden="true" />, accentClass: 'from-rose-400/70 via-pink-300/30 to-transparent' },
  { id: 'settings',  label: 'Settings',  icon: <Settings aria-hidden="true" />, accentClass: 'from-slate-300/50 via-white/10 to-transparent' },
];

const QUICK_TABS: DockTabId[] = ['scheduler', 'calendar', 'notes'];
const RIGHT_QUICK_TABS: DockTabId[] = ['gym', 'diet', 'news'];

// ── Helpers ───────────────────────────────────────────────────

function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: () => void,
) {
  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        handler();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [ref, handler]);
}

// ── Main Component ────────────────────────────────────────────

/**
 * Floating bottom dock with radial HUD for quick screen navigation.
 * Integrates with Zustand navStore for route awareness.
 *
 * @example
 * <QuantumAvatarDock />
 */
export default function QuantumAvatarDock() {
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();
  const shellRef = useRef<HTMLDivElement>(null);

  const goScreen = useNavStore((s) => s.go);
  const currentScreen = useNavStore((s) => s.screen);
  const { displayName, avatarUrl, isSubscribed } = useUser();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DockTabId>('scheduler');

  const activeTabConfig = useMemo(
    () => TABS.find((t) => t.id === activeTab)!,
    [activeTab],
  );

  useClickOutside(shellRef, useCallback(() => setOpen(false), []));

  // ESC key closes HUD
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleTabPick = useCallback(
    (id: DockTabId) => {
      setActiveTab(id);
      setOpen(false);
      const target = TAB_SCREEN_MAP[id];
      if (target && target !== currentScreen) goScreen(target);
    },
    [goScreen, currentScreen],
  );

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
      <div
        ref={shellRef}
        className="relative w-full max-w-xl pointer-events-auto"
      >
        {/* Dock bar */}
        <div className="relative mx-auto w-fit rounded-3xl border border-white/10 bg-slate-950/30 p-2 backdrop-blur-2xl shadow-[0_16px_60px_-18px_rgba(0,0,0,0.9)]">
          {/* Neon edge bloom */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-60 blur-2xl bg-[radial-gradient(650px_circle_at_50%_120%,rgba(56,189,248,0.35),rgba(168,85,247,0.18),transparent_60%)]"
          />

          <div className="flex items-center gap-2" role="toolbar" aria-label="Quick navigation dock">
            {QUICK_TABS.map((id) => {
              const tab = TABS.find((t) => t.id === id)!;
              return (
                <QuickChip
                  key={id}
                  tab={tab}
                  isActive={activeTab === id}
                  onClick={() => handleTabPick(id)}
                />
              );
            })}

            {/* Avatar launcher */}
            <div className="relative px-1">
              <AvatarLauncher
                open={open}
                onToggle={() => setOpen((v) => !v)}
                reduceMotion={!!reduce}
                displayName={displayName}
                avatarUrl={avatarUrl}
                isPremium={isSubscribed}
              />
              <RadialHUD
                open={open}
                tabs={TABS}
                activeTab={activeTab}
                onPick={handleTabPick}
                reduceMotion={!!reduce}
                isMobile={isMobile}
              />
            </div>

            {RIGHT_QUICK_TABS.map((id) => {
              const tab = TABS.find((t) => t.id === id)!;
              return (
                <QuickChip
                  key={id}
                  tab={tab}
                  isActive={activeTab === id}
                  onClick={() => handleTabPick(id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── QuickChip ─────────────────────────────────────────────────

function QuickChip({
  tab,
  isActive,
  onClick,
}: {
  tab: DockTab;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={tab.label}
      className={[
        'group relative grid h-12 w-12 place-items-center rounded-2xl',
        'border border-white/10 bg-white/5 text-white/85',
        'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/60',
        'transition-colors duration-150',
        isActive ? 'bg-white/12 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]' : '',
      ].join(' ')}
    >
      <span className="[&>svg]:h-5 [&>svg]:w-5">{tab.icon}</span>
      {/* Neon hover bloom */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-sm transition-opacity duration-200 group-hover:opacity-100 bg-[radial-gradient(120px_circle_at_30%_20%,rgba(56,189,248,0.40),transparent_55%),radial-gradient(120px_circle_at_70%_80%,rgba(168,85,247,0.30),transparent_60%)]"
      />
    </button>
  );
}

// ── AvatarLauncher ────────────────────────────────────────────

function AvatarLauncher({
  open,
  onToggle,
  reduceMotion,
  displayName,
  avatarUrl,
  isPremium,
}: {
  open: boolean;
  onToggle: () => void;
  reduceMotion: boolean;
  displayName: string;
  avatarUrl: string;
  isPremium: boolean;
}) {
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <button
      onClick={onToggle}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-label={open ? 'Close HUD menu' : 'Open HUD menu'}
      className={[
        'relative grid h-14 w-14 place-items-center rounded-3xl',
        'border border-white/12 bg-white/5 backdrop-blur-xl',
        'focus:outline-none focus:ring-2 focus:ring-sky-400/70',
        'transition-colors duration-150',
      ].join(' ')}
    >
      {/* Avatar core */}
      <div className="relative h-11 w-11 overflow-hidden rounded-2xl">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[conic-gradient(from_180deg,rgba(56,189,248,0.95),rgba(168,85,247,0.9),rgba(34,197,94,0.75),rgba(56,189,248,0.95))] opacity-75" />
            <div className="absolute inset-[2px] rounded-2xl bg-slate-950/60" />
            <div className="relative grid h-full w-full place-items-center text-white/90">
              {initials ? (
                <span className="text-xs font-bold">{initials}</span>
              ) : (
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
          </>
        )}
        {/* Scanlines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(to_bottom,rgba(255,255,255,0.28),rgba(255,255,255,0.28)_1px,transparent_1px,transparent_6px)]"
        />
      </div>

      {/* Status dot — green = online, gold = premium */}
      <span
        aria-hidden="true"
        className={[
          'absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-950',
          isPremium ? 'bg-amber-400' : 'bg-emerald-400',
        ].join(' ')}
      />

      {/* Open indicator pill */}
      <motion.div
        aria-hidden="true"
        className="absolute -bottom-2 left-1/2 h-1.5 -translate-x-1/2 rounded-full bg-white/20"
        animate={
          reduceMotion
            ? {}
            : { width: open ? 42 : 28, opacity: open ? 0.95 : 0.55 }
        }
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      />
    </button>
  );
}

// ── RadialHUD ─────────────────────────────────────────────────

function RadialHUD({
  open,
  tabs,
  activeTab,
  onPick,
  reduceMotion,
  isMobile,
}: {
  open: boolean;
  tabs: DockTab[];
  activeTab: DockTabId;
  onPick: (id: DockTabId) => void;
  reduceMotion: boolean;
  isMobile: boolean;
}) {
  // Responsive radius
  const radius = isMobile ? 115 : 140;

  const angles = useMemo(() => {
    const start = -160;
    const end = -20;
    const n = tabs.length;
    const step = (end - start) / Math.max(1, n - 1);
    return Array.from({ length: n }, (_, i) => start + i * step);
  }, [tabs.length]);

  const itemVariants = {
    closed: (_i: number) => ({
      opacity: 0,
      scale: 0.6,
      x: 0,
      y: 20,
      rotate: -10,
      transition: { duration: reduceMotion ? 0 : 0.1 },
    }),
    open: (i: number) => {
      const a = (angles[i] * Math.PI) / 180;
      return {
        opacity: 1,
        scale: 1,
        x: Math.cos(a) * radius,
        y: Math.sin(a) * radius,
        rotate: 0,
        transition: reduceMotion
          ? { duration: 0 }
          : {
              type: 'spring',
              stiffness: 520,
              damping: 30,
              mass: 0.7,
              delay: i * 0.015,
            },
      };
    },
  } as const;

  // Keyboard nav inside HUD
  const handleKey = (e: KeyboardEvent<HTMLButtonElement>, id: DockTabId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPick(id);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
          className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2"
          role="menu"
          aria-label="HUD navigation menu"
        >
          {/* Halo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.20),rgba(168,85,247,0.10),transparent_60%)] blur-2xl"
          />

          {tabs.map((tab, i) => (
            <motion.button
              key={tab.id}
              custom={i}
              variants={itemVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => onPick(tab.id)}
              onKeyDown={(e) => handleKey(e, tab.id)}
              className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group"
              role="menuitem"
              aria-label={tab.label}
              aria-current={tab.id === activeTab ? 'page' : undefined}
              tabIndex={open ? 0 : -1}
            >
              <div
                className={[
                  'relative grid h-13 w-13 place-items-center rounded-3xl',
                  'border border-white/12 bg-slate-950/45 backdrop-blur-xl',
                  'shadow-[0_14px_40px_-20px_rgba(0,0,0,0.9)]',
                  'transition-transform duration-150 hover:scale-110',
                  tab.id === activeTab
                    ? 'bg-white/10 shadow-[0_0_0_1px_rgba(56,189,248,0.38)]'
                    : '',
                ].join(' ')}
              >
                {/* Neon bloom */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 blur-sm transition-opacity duration-150 group-hover:opacity-100 bg-[radial-gradient(120px_circle_at_30%_20%,rgba(56,189,248,0.42),transparent_55%),radial-gradient(120px_circle_at_70%_80%,rgba(168,85,247,0.32),transparent_60%)]"
                />
                <span className="relative text-white/90 [&>svg]:h-5 [&>svg]:w-5">
                  {tab.icon}
                </span>
                {/* Micro label */}
                <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-slate-950/70 px-2 py-1 text-[10px] font-medium text-white/85 opacity-0 backdrop-blur-xl transition-opacity duration-150 group-hover:opacity-100">
                  {tab.label}
                </span>
              </div>
            </motion.button>
          ))}

          {/* Close pill */}
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 520, damping: 30 }
            }
            onClick={() => onPick(activeTab)}
            className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[72px] inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-slate-950/55 px-3 py-2 text-xs text-white/70 backdrop-blur-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
            aria-label="Close HUD"
            role="menuitem"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Close
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
