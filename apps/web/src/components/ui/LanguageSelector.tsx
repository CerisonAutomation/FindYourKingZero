// ═══════════════════════════════════════════════════════════════
// Language Selector — FindYourKing
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import type { Locale } from '@/lib/i18n';

const LANG_STORAGE_KEY = 'king-locale';

interface LanguageOption {
  code: Locale;
  label: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
  { code: 'ja', label: '日本語',      flag: '🇯🇵' },
  { code: 'ko', label: '한국어',      flag: '🇰🇷' },
  { code: 'zh', label: '中文',        flag: '🇨🇳' },
];

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Locale>('en');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LANG_STORAGE_KEY) as Locale | null;
    if (stored && LANGUAGES.some((l) => l.code === stored)) {
      setSelected(stored);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = useCallback((code: Locale) => {
    setSelected(code);
    localStorage.setItem(LANG_STORAGE_KEY, code);
    setOpen(false);
  }, []);

  const current = LANGUAGES.find((l) => l.code === selected) ?? LANGUAGES[0];

  // ── Styles ──────────────────────────────────────────────────
  const wrapper: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
  };

  const trigger: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    borderRadius: 10,
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.07)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background .15s',
    userSelect: 'none',
  };

  const dropdown: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    right: 0,
    minWidth: 200,
    background: '#0E0E22',
    border: '1px solid rgba(255,255,255,.10)',
    borderRadius: 12,
    padding: 6,
    boxShadow: '0 12px 40px rgba(0,0,0,.6)',
    zIndex: 1000,
    animation: 'fadeIn 0.15s ease-out',
  };

  const optionStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    color: isActive ? '#fff' : 'rgba(255,255,255,.70)',
    background: isActive ? 'rgba(255,255,255,.06)' : 'transparent',
    fontSize: 14,
    fontWeight: isActive ? 600 : 400,
    transition: 'background .1s',
    border: 'none',
    width: '100%',
    textAlign: 'left',
  });

  return (
    <>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div ref={containerRef} style={wrapper}>
        <button style={trigger} onClick={() => setOpen((v) => !v)}>
          <Globe size={16} color="rgba(255,255,255,.50)" />
          <span>{current.flag}</span>
          <span>{current.label}</span>
          <ChevronDown
            size={14}
            color="rgba(255,255,255,.40)"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
          />
        </button>

        {open && (
          <div style={dropdown}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                style={optionStyle(lang.code === selected)}
                onClick={() => handleSelect(lang.code)}
                onMouseEnter={(e) => {
                  if (lang.code !== selected) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (lang.code !== selected) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: 18 }}>{lang.flag}</span>
                <span style={{ flex: 1 }}>{lang.label}</span>
                {lang.code === selected && <Check size={16} color="#16A34A" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
