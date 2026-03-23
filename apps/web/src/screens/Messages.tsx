// ═══════════════════════════════════════════════════════════════
// SCREEN: Messages — conversation list with P2P presence
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavStore, useAuthStore, useChatStore } from '@/store';
import { api } from '@/services/api';
import { TopBar } from '@/components/ui/index';
import { Avatar } from '@/components/ui/index';
import { COLORS } from '@/types';

export default function MessagesScreen() {
  const go = useNavStore((s) => s.go);
  const me = useAuthStore((s) => s.user);
  const { matches, setMatches } = useChatStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.matches.list();
        setMatches(data);
      } catch {}
    })();
  }, []);

  const filtered = search
    ? matches.filter(m => {
        const peer = m.userIdA === me?.id ? m.userIdB : m.userIdA;
        return peer.toLowerCase().includes(search.toLowerCase());
      })
    : matches;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Messages</h2>
          </div>
        }
      >
        <div style={{ padding: '0 14px 10px', width: '100%' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            style={{
              width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`,
              padding: '9px 14px', color: '#fff', fontSize: 13, outline: 'none',
            }}
          />
        </div>
      </TopBar>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 24px' }}>
            <p style={{ color: COLORS.w60, fontSize: 13 }}>No conversations yet. Start chatting with kings nearby!</p>
          </div>
        )}

        {filtered.map((m) => {
          const peerId = m.userIdA === me?.id ? m.userIdB : m.userIdA;
          return (
            <button key={m.id} onClick={() => go('chat', { chatUser: { id: peerId } as any })}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                background: m.unreadCount > 0 ? 'rgba(229,25,46,.03)' : 'transparent',
                border: 'none', borderBottom: `1px solid ${COLORS.w07}`, cursor: 'pointer', width: '100%', textAlign: 'left',
              }}>
              <div style={{ width: 50, height: 50, background: COLORS.bg2, border: `1px solid ${COLORS.w12}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                👑
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: m.unreadCount > 0 ? 800 : 600 }}>{peerId.slice(0, 12)}</span>
                  <span style={{ fontSize: 11, color: m.unreadCount > 0 ? COLORS.red : COLORS.w35 }}>
                    {new Date(m.lastMessageAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: COLORS.w35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {m.lastMessage || 'Start chatting!'}
                </span>
              </div>
              {m.unreadCount > 0 && (
                <span style={{
                  minWidth: 20, height: 20, borderRadius: '50%', background: COLORS.red,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 900,
                }}>
                  {m.unreadCount}
                </span>
              )}
            </button>
          );
        })}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
