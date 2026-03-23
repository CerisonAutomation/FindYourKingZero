// ═══════════════════════════════════════════════════════════════
// UI: AI Chat Panel — Per uxpatterns.dev AI Chat Interface spec
// States: idle → validating → sending → streaming → complete → interrupted → failed
// Follow-up: copy, regenerate, edit
// Accessibility: ARIA live regions, keyboard nav, touch targets ≥44px
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect, type FC } from 'react';
import { useAI } from '@/hooks/useAI';
import { COLORS } from '@/types';

type AIState = 'idle' | 'validating' | 'sending' | 'streaming' | 'complete' | 'interrupted' | 'failed';
type AIErrorType = 'rate_limit' | 'model_error' | 'context_limit' | 'policy_block' | 'network' | 'unknown';

interface AIChatPanelProps {
  contextMessage?: string;  // The incoming message to generate replies for
  onReplySelect: (text: string) => void;  // When user picks a reply
  onClose: () => void;
}

const ERROR_MESSAGES: Record<AIErrorType, { title: string; action: string }> = {
  rate_limit: { title: 'Too many requests', action: 'Wait a moment and try again' },
  model_error: { title: 'AI model error', action: 'Try a shorter message' },
  context_limit: { title: 'Message too long', action: 'Shorten your message and retry' },
  policy_block: { title: 'Content blocked', action: 'Rephrase your message' },
  network: { title: 'Connection issue', action: 'Check your connection and retry' },
  unknown: { title: 'Something went wrong', action: 'Try again' },
};

export const AIChatPanel: FC<AIChatPanelProps> = ({ contextMessage, onReplySelect, onClose }) => {
  const [state, setState] = useState<AIState>('idle');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [errorType, setErrorType] = useState<AIErrorType>('unknown');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { smartReplies, icebreakers, ready } = useAI();
  const panelRef = useRef<HTMLDivElement>(null);

  // Generate suggestions
  const generate = useCallback(async (prompt?: string) => {
    if (!ready) {
      setState('failed');
      setErrorType('model_error');
      return;
    }

    setState('validating');
    setSuggestions([]);

    try {
      setState('sending');
      const replies = prompt
        ? await smartReplies(prompt)
        : contextMessage
          ? await smartReplies(contextMessage)
          : [];

      setState('streaming');
      // Simulate progressive reveal
      for (let i = 0; i < replies.length; i++) {
        await new Promise(r => setTimeout(r, 200));
        setSuggestions(prev => [...prev, replies[i]!]);
      }
      setState('complete');
    } catch (err: any) {
      const msg = err.message?.toLowerCase() ?? '';
      if (msg.includes('rate') || msg.includes('429')) setErrorType('rate_limit');
      else if (msg.includes('network') || msg.includes('fetch')) setErrorType('network');
      else if (msg.includes('context') || msg.includes('limit')) setErrorType('context_limit');
      else setErrorType('unknown');
      setState('failed');
    }
  }, [ready, contextMessage, smartReplies]);

  // Auto-generate on mount
  useEffect(() => {
    if (contextMessage && ready) generate();
  }, []);

  // Regenerate
  const regenerate = useCallback(() => {
    setSuggestions([]);
    generate(customPrompt || undefined);
  }, [generate, customPrompt]);

  // Copy suggestion
  const copySuggestion = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'r' && e.metaKey) { e.preventDefault(); regenerate(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, regenerate]);

  const isLoading = ['validating', 'sending', 'streaming'].includes(state);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="AI Smart Replies"
      aria-live="polite"
      style={{
        background: 'rgba(10,10,26,.98)',
        backdropFilter: 'blur(24px)',
        borderTop: `1px solid ${COLORS.w07}`,
        padding: '12px 14px',
        animation: 'fadeUp .2s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #E5192E, #7C3AED, #2563EB, #E5192E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: isLoading ? 'spin 2s linear infinite' : 'none',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: COLORS.bg1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10,
            }}>✨</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.w60, letterSpacing: '.1em' }}>
            AI SMART REPLIES
          </span>
          {/* State indicator */}
          {state === 'streaming' && (
            <span style={{ fontSize: 9, color: COLORS.purple, animation: 'glow 1.5s infinite' }}>
              Generating…
            </span>
          )}
          {state === 'complete' && (
            <span style={{ fontSize: 9, color: COLORS.green }}>✓ Ready</span>
          )}
        </div>
        <button onClick={onClose}
          aria-label="Close AI panel"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: COLORS.w35, fontSize: 16, padding: 8,
            minWidth: 44, minHeight: 44,  // Touch target
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          ✕
        </button>
      </div>

      {/* Error state */}
      {state === 'failed' && (
        <div style={{
          padding: '10px 14px', background: 'rgba(239,68,68,.08)',
          border: '1px solid rgba(239,68,68,.25)', marginBottom: 10,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>
            {ERROR_MESSAGES[errorType].title}
          </div>
          <div style={{ fontSize: 11, color: COLORS.w35, marginBottom: 8 }}>
            {ERROR_MESSAGES[errorType].action}
          </div>
          <button onClick={regenerate}
            style={{
              padding: '8px 16px', background: 'rgba(239,68,68,.15)',
              border: '1px solid rgba(239,68,68,.3)', color: '#ef4444',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
              minHeight: 44,  // Touch target
            }}>
            ↻ Retry
          </button>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}
          role="listbox" aria-label="AI suggestions">
          {suggestions.map((s, i) => (
            <div key={i} role="option" aria-selected={false}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
                background: COLORS.w04, border: `1px solid ${COLORS.w07}`,
                minHeight: 44,  // Touch target
              }}>
              <button onClick={() => onReplySelect(s)}
                style={{
                  flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,.8)', fontSize: 13, textAlign: 'left',
                  padding: 0, lineHeight: 1.5,
                }}>
                {s}
              </button>
              <button onClick={() => copySuggestion(s)}
                aria-label="Copy suggestion"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: COLORS.w35, fontSize: 12, padding: 8,
                  minWidth: 44, minHeight: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                📋
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && suggestions.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 44, background: COLORS.w04, border: `1px solid ${COLORS.w07}`,
              animation: `glow 1.5s ease-in-out infinite`, animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={regenerate} disabled={isLoading}
          aria-label="Regenerate suggestions"
          style={{
            flex: 1, padding: '10px', minHeight: 44,
            background: COLORS.w04, border: `1px solid ${COLORS.w07}`,
            color: isLoading ? COLORS.w12 : COLORS.w60, fontSize: 11, fontWeight: 700,
            cursor: isLoading ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
          ↻ Regenerate
        </button>
        <button onClick={() => setShowAdvanced(!showAdvanced)}
          aria-label="Custom prompt"
          style={{
            padding: '10px 16px', minHeight: 44,
            background: showAdvanced ? 'rgba(124,58,237,.1)' : COLORS.w04,
            border: `1px solid ${showAdvanced ? COLORS.purple : COLORS.w07}`,
            color: showAdvanced ? COLORS.purple : COLORS.w35, fontSize: 11, fontWeight: 700,
            cursor: 'pointer',
          }}>
          ⚙
        </button>
      </div>

      {/* Custom prompt input */}
      {showAdvanced && (
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          <input
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') generate(customPrompt); }}
            placeholder="Custom prompt for AI…"
            style={{
              flex: 1, background: COLORS.w04, border: `1px solid ${COLORS.w12}`,
              padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none',
              minHeight: 44,
            }}
          />
          <button onClick={() => generate(customPrompt)}
            style={{
              padding: '10px 16px', minHeight: 44,
              background: `linear-gradient(135deg,${COLORS.purple},${COLORS.blue})`,
              border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
            Send
          </button>
        </div>
      )}
    </div>
  );
};
