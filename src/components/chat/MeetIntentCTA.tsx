/**
 * MeetIntentCTA — Floating "Schedule a Date" button
 *
 * Appears (with spring animation) when the AI detects a "meet now" intent
 * in an incoming message. Tap to open a lightweight date/time planner.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, MapPin, Clock, X, Check } from 'lucide-react';

interface MeetIntentCTAProps {
  otherUserName: string;
  visible: boolean;
  onDismiss: () => void;
  onScheduled?: (details: ScheduledDate) => void;
}

export interface ScheduledDate {
  date: string;
  time: string;
  location: string;
  note: string;
}

const TIME_OPTIONS = [
  'Tonight, 8 PM',
  'Tonight, 9 PM',
  'Tomorrow, 7 PM',
  'Tomorrow, 8 PM',
  'This weekend',
  'Next week',
];

const LOCATION_OPTIONS = [
  'Coffee shop nearby ☕',
  'Bar / drinks 🍹',
  'Dinner 🍽️',
  'Park walk 🌿',
  'Your place / mine 🏠',
  'We\'ll figure it out',
];

export function MeetIntentCTA({
  otherUserName,
  visible,
  onDismiss,
  onScheduled,
}: MeetIntentCTAProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);

  const handleConfirm = () => {
    if (!selectedTime || !selectedLocation) return;
    setDone(true);
    onScheduled?.({
      date: new Date().toLocaleDateString(),
      time: selectedTime,
      location: selectedLocation,
      note,
    });
    setTimeout(() => {
      setDone(false);
      setExpanded(false);
      onDismiss();
    }, 1800);
  };

  const handleDismiss = () => {
    setExpanded(false);
    setSelectedTime('');
    setSelectedLocation('');
    setNote('');
    onDismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="meet-cta"
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          className="flex-shrink-0 mx-3 mb-1.5"
        >
          <div
            className="relative rounded-2xl border border-primary/25 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)/0.08) 0%, hsl(var(--card)) 100%)',
            }}
          >
            {/* Pulsing accent line */}
            <div className="absolute top-0 inset-x-0 h-0.5 rounded-full"
              style={{ background: 'var(--gradient-primary)' }} />

            {!expanded && !done && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2.5 px-3.5 py-2.5"
              >
                {/* Pulsing icon */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Calendar className="w-4 h-4 text-white" />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-foreground leading-tight">
                    {otherUserName} wants to meet! 🔥
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    AI detected meet intent — schedule a date?
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setExpanded(true)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white shrink-0"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    Plan it
                  </motion.button>
                  <button
                    onClick={handleDismiss}
                    className="w-6 h-6 rounded-full flex items-center justify-center bg-secondary/60 shrink-0"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Expanded planner */}
            <AnimatePresence>
              {expanded && !done && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3.5 py-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-bold flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-primary" />
                      Plan a date with {otherUserName}
                    </p>
                    <button onClick={handleDismiss}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Time selection */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> When
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {TIME_OPTIONS.map(t => (
                        <button
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={[
                            'px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all',
                            selectedTime === t
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-border/30 bg-secondary/50 text-foreground',
                          ].join(' ')}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location selection */}
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Where
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {LOCATION_OPTIONS.map(l => (
                        <button
                          key={l}
                          onClick={() => setSelectedLocation(l)}
                          className={[
                            'px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all',
                            selectedLocation === l
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-border/30 bg-secondary/50 text-foreground',
                          ].join(' ')}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional note */}
                  <input
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add a note (optional)…"
                    className="w-full bg-secondary/40 border border-border/25 rounded-xl px-3 py-2 text-[12px] placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40"
                  />

                  <button
                    onClick={handleConfirm}
                    disabled={!selectedTime || !selectedLocation}
                    className="w-full py-2 rounded-xl text-[12px] font-bold text-white disabled:opacity-40 transition-opacity"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    Confirm Date 🗓️
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Done state */}
            <AnimatePresence>
              {done && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 py-3 px-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                  >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </motion.div>
                  <p className="text-[12px] font-bold text-green-500">Date planned! 🎉</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
