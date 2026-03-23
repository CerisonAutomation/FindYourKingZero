// ═══════════════════════════════════════════════════════════════
// UI: Command Palette — Keyboard shortcut navigation
// From FINDYOURKING00 — Cmd+K to navigate anywhere
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { useNavStore } from '@/store';
import { COLORS } from '@/types';

interface CommandItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  group: string;
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const go = useNavStore((s) => s.go);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const commands: CommandItem[] = [
    { id: 'discover', label: 'Discover Kings', icon: '🧭', action: () => go('discover'), group: 'Navigate', keywords: ['home', 'explore'] },
    { id: 'messages', label: 'Messages', icon: '💬', action: () => go('messages'), group: 'Navigate', keywords: ['chat', 'inbox'] },
    { id: 'right-now', label: 'Right Now', icon: '📡', action: () => go('right-now'), group: 'Navigate', keywords: ['live', 'radar', 'nearby'] },
    { id: 'events', label: 'Events', icon: '📅', action: () => go('events'), group: 'Navigate', keywords: ['parties', 'meetups'] },
    { id: 'profile', label: 'My Profile', icon: '👤', action: () => go('profile'), group: 'Navigate', keywords: ['me', 'account'] },
    { id: 'edit', label: 'Edit Profile', icon: '✏️', action: () => go('edit-profile'), group: 'Profile', keywords: ['settings', 'bio'] },
    { id: 'settings', label: 'Settings', icon: '⚙️', action: () => go('settings'), group: 'Settings', keywords: ['config', 'preferences'] },
    { id: 'sub', label: 'Subscription', icon: '👑', action: () => go('subscription'), group: 'Settings', keywords: ['premium', 'pro', 'upgrade'] },
    { id: 'notifs', label: 'Notifications', icon: '🔔', action: () => go('notifications'), group: 'Settings', keywords: ['activity', 'alerts'] },
  ];

  const filtered = query
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.keywords?.some(k => k.includes(query.toLowerCase()))
      )
    : commands;

  const groups = [...new Set(filtered.map(c => c.group))];

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '20vh',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420, background: COLORS.bg2,
          border: `1px solid ${COLORS.w12}`, boxShadow: '0 20px 60px rgba(0,0,0,.5)',
          overflow: 'hidden',
        }}
      >
        {/* Search */}
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.w07}` }}>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands… (⌘K)"
            style={{
              width: '100%', background: 'transparent', border: 'none',
              color: '#fff', fontSize: 15, outline: 'none',
            }}
          />
        </div>

        {/* Results */}
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {groups.map(group => (
            <div key={group}>
              <div style={{ padding: '8px 16px 4px', fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '0.14em' }}>
                {group.toUpperCase()}
              </div>
              {filtered.filter(c => c.group === group).map(cmd => (
                <button
                  key={cmd.id}
                  onClick={() => { cmd.action(); setOpen(false); setQuery(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 16px', background: 'none',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = COLORS.w04)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ fontSize: 16 }}>{cmd.icon}</span>
                  <span style={{ fontSize: 14, color: COLORS.w60, fontWeight: 500 }}>{cmd.label}</span>
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: COLORS.w35, fontSize: 13 }}>
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
