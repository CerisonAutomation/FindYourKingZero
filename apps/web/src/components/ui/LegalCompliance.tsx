// ═══════════════════════════════════════════════════════════════
// COMPONENT: LegalCompliance — 4-checkbox consent gate
// Stack: Vite + React 18 — NO Next.js, NO 'use client', NO shadcn ScrollArea
// Upgraded:
//   • Replaced Radix ScrollArea with native overflow-y-auto
//   • Replaced shadcn Checkbox with accessible native checkbox
//   • useId() for all htmlFor/id pairs
//   • localStorage persistence so gate never shows twice
//   • Progress indicator (X / 4 accepted)
//   • aria-required on checkboxes, fieldset + legend for group semantics
//   • Decline redirects to landing via Zustand nav
//   • JSDoc, WCAG 2.1 AA
// ═══════════════════════════════════════════════════════════════

import { useState, useId, type FC } from 'react';
import { Shield, FileText, Scale, AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavStore } from '@/store';

const LS_KEY = 'fyk_legal_accepted';

/** Returns true if user has already accepted all legal terms */
export function isLegalAccepted(): boolean {
  try { return localStorage.getItem(LS_KEY) === 'true'; } catch { return false; }
}

export interface LegalComplianceProps {
  /** Called when all 4 boxes are checked and user taps Accept */
  onAccept: () => void;
}

interface Section {
  key: 'age' | 'terms' | 'privacy' | 'conduct';
  title: string;
  label: string;
  Icon: FC<{ className?: string }>;
  iconClass: string;
  body: string;
}

const SECTIONS: Section[] = [
  {
    key: 'age',
    title: 'Age Verification',
    label: 'I confirm that I am 18 years of age or older',
    Icon: AlertTriangle,
    iconClass: 'text-orange-400',
    body:
      'FYKING.MEN is intended for adults 18+ only. By continuing, you certify you meet this requirement and understand that falsifying your age may result in immediate account termination.',
  },
  {
    key: 'terms',
    title: 'Terms of Service',
    label: 'I have read and agree to the Terms of Service',
    Icon: FileText,
    iconClass: 'text-sky-400',
    body:
      'By using FYKING.MEN you agree to be bound by our Terms of Service. You are responsible for your account security and all activity under it. Prohibited activities include unlawful use, harassment, spam, and fake profiles.',
  },
  {
    key: 'privacy',
    title: 'Privacy Policy',
    label: 'I have read and agree to the Privacy Policy',
    Icon: Shield,
    iconClass: 'text-emerald-400',
    body:
      'We collect information you provide to power our services. We do not sell personal data to third parties. You have the right to access, update, or delete your data at any time. Full policy available at fyking.men/privacy.',
  },
  {
    key: 'conduct',
    title: 'Code of Conduct',
    label: 'I agree to follow the Code of Conduct',
    Icon: Scale,
    iconClass: 'text-violet-400',
    body:
      'Treat all users with respect. Obtain clear consent and communicate openly. Prioritise safety and report concerning behaviour. All activities must comply with local laws. Violations may be reported to authorities.',
  },
];

/**
 * Legal consent gate — 4 checkboxes must all be accepted.
 * Persists acceptance to localStorage so it never re-shows.
 *
 * @example
 * {!isLegalAccepted() && <LegalCompliance onAccept={() => go('onboarding')} />}
 */
export const LegalCompliance: FC<LegalComplianceProps> = ({ onAccept }) => {
  const go = useNavStore((s) => s.go);
  const ageId    = useId();
  const termsId  = useId();
  const privId   = useId();
  const conductId = useId();

  const idMap: Record<string, string> = {
    age: ageId, terms: termsId, privacy: privId, conduct: conductId,
  };

  const [checked, setChecked] = useState<Record<string, boolean>>({
    age: false, terms: false, privacy: false, conduct: false,
  });
  const [expanded, setExpanded] = useState<string | null>(null);

  const acceptedCount = Object.values(checked).filter(Boolean).length;
  const allAccepted = acceptedCount === SECTIONS.length;

  const toggle = (key: string) =>
    setChecked((p) => ({ ...p, [key]: !p[key] }));

  const handleAccept = () => {
    if (!allAccepted) return;
    try { localStorage.setItem(LS_KEY, 'true'); } catch { /* storage blocked */ }
    onAccept();
  };

  const handleDecline = () => {
    go('landing');
  };

  return (
    <div className="flex w-full max-w-lg flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/20 to-violet-500/20">
          <Shield className="h-8 w-8 text-sky-400" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Legal Compliance</h2>
          <p className="mt-1 text-sm text-white/50">
            Please review and accept all terms to continue.
          </p>
        </div>
        {/* Progress */}
        <div className="flex items-center gap-1.5">
          {SECTIONS.map((s) => (
            <span
              key={s.key}
              aria-hidden="true"
              className={`h-1.5 w-8 rounded-full transition-colors duration-200 ${
                checked[s.key] ? 'bg-emerald-400' : 'bg-white/15'
              }`}
            />
          ))}
          <span className="ml-2 text-xs text-white/40">{acceptedCount} / {SECTIONS.length}</span>
        </div>
      </div>

      {/* Sections */}
      <fieldset className="space-y-3 border-0 p-0">
        <legend className="sr-only">Legal consent sections</legend>

        {SECTIONS.map((sec) => {
          const isOpen = expanded === sec.key;
          const checkId = idMap[sec.key];
          return (
            <div
              key={sec.key}
              className={[
                'rounded-3xl border p-4 transition-colors duration-150',
                checked[sec.key] ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/4',
              ].join(' ')}
            >
              {/* Accordion trigger */}
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : sec.key)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-sky-400/60 rounded-xl"
              >
                <sec.Icon className={`h-4 w-4 shrink-0 ${sec.iconClass}`} aria-hidden="true" />
                <span className="flex-1 text-sm font-medium text-white">{sec.title}</span>
                <ChevronRight
                  className={`h-4 w-4 text-white/30 transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {/* Collapsible body */}
              {isOpen && (
                <div className="mt-3 max-h-32 overflow-y-auto rounded-2xl border border-white/8 bg-black/20 p-3 text-xs text-white/50 leading-relaxed scrollbar-thin">
                  {sec.body}
                </div>
              )}

              {/* Checkbox */}
              <div className="mt-3 flex items-start gap-3">
                <input
                  type="checkbox"
                  id={checkId}
                  checked={checked[sec.key]}
                  onChange={() => toggle(sec.key)}
                  aria-required="true"
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-emerald-400"
                />
                <label htmlFor={checkId} className="cursor-pointer text-xs text-white/70 leading-relaxed">
                  {sec.label}
                </label>
              </div>
            </div>
          );
        })}
      </fieldset>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDecline}
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
        >
          Decline
        </button>
        <button
          type="button"
          disabled={!allAccepted}
          onClick={handleAccept}
          className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-400/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Accept &amp; Continue
        </button>
      </div>
    </div>
  );
};
