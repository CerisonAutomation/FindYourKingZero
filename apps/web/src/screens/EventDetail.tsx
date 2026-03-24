// ═══════════════════════════════════════════════════════════════
// SCREEN: Event Detail — Full RSVP with attendee list
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { useNavStore, useAuthStore, useNotifStore } from '@/store';
import { api } from '@/services/api';
import { COLORS, EVENT_COLORS, EVENT_EMOJI } from '@/types';
import type { KingEvent, UserProfile } from '@/types';

export default function EventDetailScreen() {
  const back = useNavStore((s) => s.back);
  const go = useNavStore((s) => s.go);
  const me = useAuthStore((s) => s.user);
  const addNotif = useNotifStore((s) => s.addNotification);

  // Get event from nav state (passed as viewingProfile for simplicity)
  const event = useNavStore((s) => s.viewingProfile) as unknown as KingEvent | null;
  const [going, setGoing] = useState(false);
  const [attendees, setAttendees] = useState<UserProfile[]>([]);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', location: '', capacity: '' });
  const [saving, setSaving] = useState(false);

  const isHost = event?.hostId === me?.id;

  useEffect(() => {
    if (!event) return;
    setAttendeeCount(event.attendees?.length ?? 0);
    setGoing(event.attendees?.includes(me?.id ?? '') ?? false);
    setEditForm({
      title: event.title ?? '',
      description: event.description ?? '',
      location: event.location ?? '',
      capacity: String(event.capacity ?? 50),
    });
  }, [event, me]);

  const rsvp = useCallback(async (g: boolean) => {
    if (!event?.id || !me) return;
    try {
      await api.events.rsvp(event.id, g);
      setGoing(g);
      setAttendeeCount(c => g ? c + 1 : Math.max(0, c - 1));
      if (g) {
        addNotif({ id: crypto.randomUUID(), type: 'event', text: `You're attending: ${event.title}`, read: false, createdAt: Date.now() });
      }
    } catch {}
  }, [event, me, addNotif]);

  const saveEdit = useCallback(async () => {
    if (!event?.id || !editForm.title) return;
    setSaving(true);
    try {
      await api.events.update(event.id, {
        title: editForm.title,
        description: editForm.description,
        location: editForm.location,
        capacity: parseInt(editForm.capacity) || 50,
      });
      setEditing(false);
    } catch {} finally { setSaving(false); }
  }, [event, editForm]);

  if (!event) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: COLORS.w35 }}>No event selected</p>
      </div>
    );
  }

  const c = EVENT_COLORS[event.type] || COLORS.red;
  const emoji = EVENT_EMOJI[event.type] || '📅';
  const fill = event.capacity > 0 ? Math.round((attendeeCount / event.capacity) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,.07)', position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${c},transparent)` }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60, fontSize: 16 }}>←</button>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>{event.title}</div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, fontSize: 16 }}>📤</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Hero gradient */}
        <div style={{
          height: 160, background: `linear-gradient(135deg,${c}22,rgba(6,6,16,1))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          <span style={{ fontSize: 70 }}>{emoji}</span>
          <div style={{ position: 'absolute', top: 12, right: 12, padding: '3px 9px', background: `${c}18`, border: `1px solid ${c}40` }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: c, letterSpacing: '0.1em' }}>{event.type.toUpperCase()}</span>
          </div>
        </div>

        <div style={{ padding: '16px 15px 100px' }}>
          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {[
              { icon: '📅', label: 'Date', value: new Date(event.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }) },
              { icon: '🕐', label: 'Time', value: event.time },
              { icon: '📍', label: 'Location', value: event.location || 'TBA' },
              { icon: '👥', label: 'Attending', value: `${attendeeCount} / ${event.capacity}` },
            ].map((m) => (
              <div key={m.label} style={{ background: COLORS.bg2, border: '1px solid rgba(255,255,255,.07)', padding: '11px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <span style={{ fontSize: 12 }}>{m.icon}</span>
                  <span style={{ fontSize: 8, fontWeight: 700, color: COLORS.w35, letterSpacing: '0.14em' }}>{m.label}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Capacity bar */}
          <div style={{ background: COLORS.bg2, border: '1px solid rgba(255,255,255,.07)', padding: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: COLORS.w60 }}>{attendeeCount} attending</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: c }}>{fill}% full</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,.12)' }}>
              <div style={{ width: `${Math.min(100, fill)}%`, height: '100%', background: c, boxShadow: `0 0 8px ${c}60`, transition: 'width .5s' }} />
            </div>
          </div>

          {/* Description */}
          {event.description && !editing && (
            <div style={{ background: COLORS.bg1, border: '1px solid rgba(255,255,255,.07)', padding: '13px 14px', marginBottom: 14 }}>
              <p style={{ color: COLORS.w60, fontSize: 13, lineHeight: 1.6 }}>{event.description}</p>
            </div>
          )}

          {/* Edit button (host only) */}
          {isHost && !editing && (
            <button onClick={() => setEditing(true)}
              style={{
                width: '100%', padding: '12px', marginBottom: 14,
                background: COLORS.w08, border: `1px solid ${COLORS.w12}`,
                color: COLORS.w60, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>
              ✏️ Edit Event
            </button>
          )}

          {/* Edit form (host only) */}
          {editing && (
            <div style={{ background: COLORS.bg1, border: '1px solid rgba(255,255,255,.07)', padding: 14, marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="Title"
                style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }} />
              <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={3}
                style={{ width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', resize: 'none' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} placeholder="Location"
                  style={{ flex: 2, background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }} />
                <input value={editForm.capacity} onChange={e => setEditForm(f => ({ ...f, capacity: e.target.value }))} placeholder="Capacity" type="number"
                  style={{ flex: 1, background: COLORS.w04, border: `1px solid ${COLORS.w12}`, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditing(false)}
                  style={{ flex: 1, padding: '12px', background: COLORS.w08, border: `1px solid ${COLORS.w12}`, color: COLORS.w60, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={saveEdit} disabled={saving}
                  style={{ flex: 1, padding: '12px', background: `linear-gradient(135deg,${COLORS.green},#16A34A)`, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving…' : '✓ Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RSVP CTA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px 28px',
        background: 'linear-gradient(to top,rgba(6,6,16,1) 60%,transparent)',
      }}>
        {going ? (
          <button onClick={() => rsvp(false)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 24px', background: 'transparent', border: `1px solid rgba(255,255,255,.12)`,
              color: COLORS.w60, fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%',
            }}>
            ✕ Leave Event
          </button>
        ) : (
          <button onClick={() => rsvp(true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`,
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%',
            }}>
            ✓ Join Event
          </button>
        )}
      </div>
    </div>
  );
}
