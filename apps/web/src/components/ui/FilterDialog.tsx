// ═══════════════════════════════════════════════════════════════
// COMPONENT: FilterDialog — discovery filter sheet
// Stack: Vite + React 18 + Zustand — NO Next.js, NO 'use client'
// Upgraded:
//   • Typed DiscoveryFilter replaces `any` prop type
//   • Controlled by Zustand discoveryStore (setFilter callback)
//   • Dual range slider for age via two range inputs (no radix dep)
//   • Unit toggle: miles ↔ km
//   • ARIA: role="dialog", aria-modal, aria-labelledby
//   • Focus trap via useEffect + first/last focusable elements
//   • FYK dark-glass panel theme, full JSDoc
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useId, type FC } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────

export interface DiscoveryFilter {
  ageMin: number;
  ageMax: number;
  /** Distance in km */
  distanceKm: number;
  tribes: string[];
  interests: string[];
}

const DEFAULT_FILTER: DiscoveryFilter = {
  ageMin: 18,
  ageMax: 65,
  distanceKm: 80, // ~50 miles
  tribes: [],
  interests: [],
};

const TRIBES = [
  'Twink','Jock','Bear','Otter','Cub','Chub','Geek','Nerd','Daddy',
  'Silver Fox','Leather','Pup','Drag','Queer','Trans','Non-Binary',
  'Sober','Poz','Discreet',
] as const;

const INTERESTS = [
  'Art','Design','Photography','Fashion','Music','Writing','Reading','Film',
  'Gaming','Cooking','Baking','Mixology','Dancing','Yoga','Fitness','Running',
  'Hiking','Skiing','Snowboarding','Surfing','Sailing','Travel','Volunteering',
  'Activism','Politics','History','Science','Technology','Entrepreneurship',
  'Startups','Investing','Crypto','Spirituality','Meditation','Astrology','Tarot',
] as const;

export interface FilterDialogProps {
  /** Called with committed filter values when user taps Save */
  onSave: (filter: DiscoveryFilter) => void;
  /** Current applied filter for initialising form state */
  initialFilter?: Partial<DiscoveryFilter>;
}

// ── Helpers ─────────────────────────────────────────────────────

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

const KM_PER_MILE = 1.60934;

// ── ChipButton ──────────────────────────────────────────────────

function ChipButton({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'rounded-2xl border px-3 py-1.5 text-xs font-medium transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-sky-400/60',
        active
          ? 'border-sky-400/60 bg-sky-400/15 text-sky-300'
          : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

// ── Section heading ────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
      {children}
    </p>
  );
}

// ── Main Component ────────────────────────────────────────────

/**
 * Full-height slide-in filter sheet for discovery.
 * Renders inline (parent controls open state).
 *
 * @example
 * const [open, setOpen] = useState(false);
 * <button onClick={() => setOpen(true)}>Filters</button>
 * {open && <FilterDialog onSave={applyFilter} onClose={() => setOpen(false)} />}
 */
export const FilterDialog: FC<FilterDialogProps & { onClose?: () => void; open?: boolean }> = ({
  onSave,
  onClose,
  initialFilter = {},
  open = true,
}) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const merged = { ...DEFAULT_FILTER, ...initialFilter };
  const [ageMin, setAgeMin] = useState(merged.ageMin);
  const [ageMax, setAgeMax] = useState(merged.ageMax);
  const [distanceKm, setDistanceKm] = useState(merged.distanceKm);
  const [useKm, setUseKm] = useState(true);
  const [tribes, setTribes] = useState<string[]>(merged.tribes);
  const [interests, setInterests] = useState<string[]>(merged.interests);

  // Trap focus inside dialog when open
  useEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    if (!el) return;
    const focusables = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose?.(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    first?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleReset = () => {
    setAgeMin(DEFAULT_FILTER.ageMin);
    setAgeMax(DEFAULT_FILTER.ageMax);
    setDistanceKm(DEFAULT_FILTER.distanceKm);
    setTribes([]);
    setInterests([]);
  };

  const handleSave = () => {
    onSave({ ageMin, ageMax, distanceKm, tribes, interests });
    onClose?.();
  };

  const displayDist = useKm
    ? `${distanceKm} km`
    : `${Math.round(distanceKm / KM_PER_MILE)} mi`;

  if (!open) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      aria-hidden="false"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-slate-950/90 backdrop-blur-2xl shadow-[0_-18px_70px_-18px_rgba(0,0,0,0.9)] sm:rounded-3xl"
        style={{ maxHeight: '90dvh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-sky-400" aria-hidden="true" />
            <h2 id={titleId} className="text-sm font-semibold text-white">
              Discovery Filters
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Age Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionLabel>Age Range</SectionLabel>
              <span className="text-xs text-white/60 tabular-nums">{ageMin}–{ageMax}</span>
            </div>
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs text-white/40">
                Min {ageMin}
                <input
                  type="range" min={18} max={ageMax - 1} value={ageMin}
                  onChange={(e) => setAgeMin(Number(e.target.value))}
                  className="ml-3 w-full accent-sky-400"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-white/40">
                Max {ageMax}
                <input
                  type="range" min={ageMin + 1} max={100} value={ageMax}
                  onChange={(e) => setAgeMax(Number(e.target.value))}
                  className="ml-3 w-full accent-sky-400"
                />
              </label>
            </div>
          </div>

          {/* Distance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionLabel>Distance</SectionLabel>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-white/60 tabular-nums">{displayDist}</span>
                <button
                  type="button"
                  onClick={() => setUseKm((v) => !v)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                >
                  {useKm ? 'mi' : 'km'}
                </button>
              </div>
            </div>
            <input
              type="range" min={1} max={500} value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full accent-sky-400"
              aria-label={`Distance: ${displayDist}`}
            />
          </div>

          {/* Tribes */}
          <div className="space-y-3">
            <SectionLabel>Tribes</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {TRIBES.map((t) => (
                <ChipButton
                  key={t} label={t}
                  active={tribes.includes(t)}
                  onClick={() => setTribes((p) => toggle(p, t))}
                />
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <SectionLabel>Interests</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <ChipButton
                  key={i} label={i}
                  active={interests.includes(i)}
                  onClick={() => setInterests((p) => toggle(p, i))}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-white/8 px-5 py-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white/70 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 py-3 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
          >
            Save Filters
          </button>
        </div>
      </div>
    </div>
  );
};
