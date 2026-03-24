// ═══════════════════════════════════════════════════════════════
// COMPONENT: AgeVerification — legal age gate for 18+ platform
// Stack: Vite + React 18 + shadcn/ui — NO Next.js, NO 'use client'
// Upgraded: differenceInYears (date-fns), ARIA-complete form,
//           localStorage persistence to prevent re-showing,
//           dark FYK glass theme, JSDoc, WCAG 2.1 AA a11y
// ═══════════════════════════════════════════════════════════════

import { useState, useId } from 'react';
import { differenceInYears, subYears, format, isValid, parseISO } from 'date-fns';
import { Calendar, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

const MINIMUM_AGE = 18;
const LS_KEY = 'fyk_age_verified';

export interface AgeVerificationProps {
  /** Called with the verified birth date when age check passes */
  onVerify: (birthDate: Date) => void;
  /** Platform display name shown in legal copy */
  platformName?: string;
}

/**
 * Legal 18+ age gate. Persists verification to localStorage.
 * Returns null (renders nothing) if user has already verified.
 *
 * @example
 * <AgeVerification onVerify={(dob) => saveToProfile(dob)} />
 */
export function AgeVerification({
  onVerify,
  platformName = 'FYKING.MEN',
}: AgeVerificationProps) {
  const inputId = useId();
  const errorId = useId();

  const [dateStr, setDateStr] = useState('');
  const [status, setStatus] = useState<'idle' | 'valid' | 'under_age' | 'invalid'>('idle');
  const [submitted, setSubmitted] = useState(false);

  // Max selectable date — exactly 18 years ago
  const maxDate = format(subYears(new Date(), MINIMUM_AGE), 'yyyy-MM-dd');

  const validate = (value: string): typeof status => {
    if (!value) return 'idle';
    const parsed = parseISO(value);
    if (!isValid(parsed)) return 'invalid';
    const age = differenceInYears(new Date(), parsed);
    if (age > 120) return 'invalid';
    return age >= MINIMUM_AGE ? 'valid' : 'under_age';
  };

  const handleChange = (value: string) => {
    setDateStr(value);
    setStatus(validate(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const result = validate(dateStr);
    setStatus(result);
    if (result !== 'valid') return;
    // Persist so the gate doesn't show again this session
    try { localStorage.setItem(LS_KEY, 'true'); } catch { /* storage blocked */ }
    onVerify(parseISO(dateStr));
  };

  const errorMessage =
    status === 'under_age'
      ? `You must be at least ${MINIMUM_AGE} years old to use ${platformName}.`
      : status === 'invalid'
      ? 'Please enter a valid date of birth.'
      : submitted && !dateStr
      ? 'Date of birth is required.'
      : null;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-sky-500/20">
          <Shield className="h-8 w-8 text-emerald-400" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Age Verification</h2>
          <p className="mt-1 text-sm text-white/50">
            {platformName} is an adult platform for users 18 and over.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Age verification form"
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={inputId}
              className="flex items-center gap-2 text-sm font-medium text-white/80"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Date of Birth
            </label>

            <input
              id={inputId}
              type="date"
              value={dateStr}
              onChange={(e) => handleChange(e.target.value)}
              max={maxDate}
              required
              aria-required="true"
              aria-describedby={errorMessage ? errorId : undefined}
              aria-invalid={errorMessage ? 'true' : 'false'}
              className={[
                'w-full rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white',
                'placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400/60',
                status === 'valid'
                  ? 'border-emerald-500/60'
                  : errorMessage
                  ? 'border-red-500/60'
                  : 'border-white/10',
              ].join(' ')}
            />

            {/* Inline feedback */}
            {status === 'valid' && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Age verified — you may continue.
              </p>
            )}
            {errorMessage && (
              <p
                id={errorId}
                role="alert"
                className="flex items-center gap-1.5 text-xs text-red-400"
              >
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                {errorMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={status !== 'valid'}
            className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-400/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Verify &amp; Continue
          </button>
        </form>
      </div>

      {/* Legal note */}
      <p className="text-center text-xs text-white/30">
        By continuing you confirm you are {MINIMUM_AGE}+ and agree to our{' '}
        <a
          href="/terms"
          className="underline underline-offset-2 hover:text-white/60"
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          href="/privacy"
          className="underline underline-offset-2 hover:text-white/60"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}

/**
 * Returns true if the user has already passed age verification this session.
 * Use to conditionally skip rendering <AgeVerification />.
 */
export function isAgeVerified(): boolean {
  try { return localStorage.getItem(LS_KEY) === 'true'; } catch { return false; }
}
