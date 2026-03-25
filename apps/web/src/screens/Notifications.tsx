// ═══════════════════════════════════════════════════════════════
// SCREEN: Notifications — Full notification list with actions
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Check, Flame, Heart, MessageCircle, Star } from 'lucide-react';
import { useNavStore, useNotifStore } from '@/store';
import { COLORS, type NotificationType } from '@/types';

const TYPE_CONFIG: Record<NotificationType, { color: string; icon: string }> = {
  tap: { color: COLORS.red, icon: '<Heart size={16} />' },
  woof: { color: COLORS.yellow, icon: '<Flame size={16} />' },
  superlike: { color: COLORS.purple, icon: '<Star size={16} />' },
  match: { color: COLORS.pink, icon: '💕' },
  message: { color: COLORS.blue, icon: '<MessageCircle size={16} />' },
  event: { color: COLORS.yellow, icon: 'E' },
  system: { color: COLORS.green, icon: '<Check size={12} />' },
};

export default function NotificationsScreen() {
  const back = useNavStore((s) => s.back);
  const { notifications, markRead, markAllRead, unreadCount } = useNotifStore();
  const [tab, setTab] = useState<'all' | 'interactions'>('all');

  const unread = unreadCount();
  const displayed = tab === 'interactions'
    ? notifications.filter(n => ['tap', 'woof', 'superlike', 'match'].includes(n.type))
    : notifications;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,.07)', position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#E5192E,rgba(37,99,235,.5),transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60, fontSize: 16 }}><ArrowLeft size={18} /></button>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Activity</div>
          {unread > 0 && (
            <button onClick={markAllRead}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.red, fontWeight: 700, fontSize: 11 }}>
              Mark All Read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          {(['all', 'interactions'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer',
                color: tab === t ? COLORS.red : COLORS.w35, fontSize: 11, fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                borderBottom: tab === t ? `2px solid ${COLORS.red}` : 'none',
              }}>
              {t}
              {t === 'all' && unread > 0 && (
                <span style={{
                  marginLeft: 6, minWidth: 16, height: 16, background: COLORS.red, borderRadius: '50%',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontWeight: 900, verticalAlign: 'middle',
                }}>{unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notification list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {displayed.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 24px' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}><Bell size={16} /></div>
            <p style={{ color: COLORS.w60, fontSize: 13 }}>No activity yet — go meet some kings!</p>
          </div>
        )}

        {displayed.map((n) => {
          const cf = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
          return (
            <button key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                background: n.read ? 'transparent' : 'rgba(229,25,46,.03)',
                border: 'none', borderBottom: '1px solid rgba(255,255,255,.07)',
                cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background .12s',
                position: 'relative',
              }}>
              {!n.read && <div style={{ position: 'absolute', left: 0, width: 3, height: 48, background: COLORS.red }} />}
              <div style={{
                width: 42, height: 42, background: `${cf.color}18`, border: `1px solid ${cf.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18,
              }}>
                {cf.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 2, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12.5, color: n.read ? COLORS.w35 : COLORS.w60, fontWeight: n.read ? 400 : 500 }}>{n.text}</span>
                </div>
                <span style={{ fontSize: 11, color: COLORS.w35 }}>
                  {new Date(n.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS.red, flexShrink: 0 }} />}
            </button>
          );
        })}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
