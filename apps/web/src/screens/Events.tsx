// ═══════════════════════════════════════════════════════════════
// SCREEN: Events — Full CRUD with RSVP + create form
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { useNavStore, useAuthStore } from '@/store';
import { api } from '@/services/api';
import { COLORS, EVENT_COLORS, EVENT_EMOJI, type KingEvent, type EventType } from '@/types';

const CATS = ['all', 'party', 'gym', 'drinks', 'music', 'outdoor', 'gaming', 'food'];
const TABS = ['discover', 'attending', 'hosting'] as const;

export default function EventsScreen() {
  const go = useNavStore((s) => s.go);
  const me = useAuthStore((s) => s.user);
  const [events, setEvents] = useState<KingEvent[]>([]);
  const [tab, setTab] = useState<typeof TABS[number]>('discover');
  const [cat, setCat] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'Party' as EventType, date: '', time: '', location: '', capacity: '50', description: '' });

  useEffect(() => {
    (async () => {
      try {
        const data = await api.events.list();
        setEvents(data);
      } catch {}
    })();
  }, []);

  const createEvent = useCallback(async () => {
    if (!form.title || !form.date) return;
    setCreating(true);
    try {
      const ev = await api.events.create({
        title: form.title, type: form.type, description: form.description,
        date: new Date(form.date).getTime(), time: form.time,
        location: form.location, lat: 0, lng: 0,
        capacity: parseInt(form.capacity) || 50, tags: [form.type],
      });
      setEvents((prev) => [ev, ...prev]);
      setForm({ title: '', type: 'Party', date: '', time: '', location: '', capacity: '50', description: '' });
      setShowCreate(false);
    } catch {} finally { setCreating(false); }
  }, [form]);

  const displayed = events
    .filter((e) => cat === 'all' || e.type.toLowerCase() === cat)
    .filter((e) => tab === 'attending' ? e.attendees?.includes(me?.id ?? '') : tab === 'hosting' ? e.hostId === me?.id : true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, flex: 1 }}>Events</h2>
          <button onClick={() => setShowCreate(!showCreate)}
            style={{
              width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg,${COLORS.red},#FF4020)`, border: 'none', cursor: 'pointer',
              fontSize: 16, color: '#fff',
            }}>
            {showCreate ? '' : '+'}
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title…"
              style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as EventType }))}
                style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }}>
                {(['Party', 'Gym', 'Drinks', 'Music', 'Outdoor', 'Gaming', 'Cinema', 'Food'] as EventType[]).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Location"
                style={{ flex: 2, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }} />
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }} />
            </div>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description…" rows={2}
              style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', resize: 'none', lineHeight: 1.5 }} />
            <button onClick={createEvent} disabled={creating}
              style={{
                padding: '13px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`,
                border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: creating ? 0.6 : 1,
              }}>
              {creating ? 'Creating…' : 'Create Event'}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', margin: '0 14px', border: '1px solid rgba(255,255,255,.07)', marginBottom: 8, marginTop: showCreate ? 10 : 0 }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '9px 0', background: tab === t ? 'rgba(229,25,46,.12)' : 'transparent',
                border: 'none', cursor: 'pointer', color: tab === t ? COLORS.red : COLORS.w35,
                fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                borderBottom: tab === t ? `2px solid ${COLORS.red}` : 'none',
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 6, padding: '0 14px 10px', overflowX: 'auto' }}>
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              style={{
                padding: '5px 12px', border: `1px solid ${cat === c ? COLORS.red : 'rgba(255,255,255,.12)'}`,
                background: cat === c ? 'rgba(229,25,46,.1)' : 'transparent',
                color: cat === c ? COLORS.red : COLORS.w35, fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Event list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {displayed.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 24px' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>+</div>
            <p style={{ color: COLORS.w60, fontSize: 13 }}>
              {tab === 'attending' ? 'RSVP to events to see them here' : tab === 'hosting' ? 'Create your first event above' : 'No events yet — be the first!'}
            </p>
          </div>
        )}

        {displayed.map((event) => {
          const c = EVENT_COLORS[event.type] || COLORS.red;
          const emoji = EVENT_EMOJI[event.type] || 'E';
          const fill = event.capacity > 0 ? Math.round(((event.attendees?.length ?? 0) / event.capacity) * 100) : 0;
          const going = event.attendees?.includes(me?.id ?? '');

          return (
            <button key={event.id} onClick={() => { useNavStore.getState().go('event-detail', { profile: event as any }); }}
              style={{
                display: 'flex', margin: '0 12px 10px', background: 'transparent', border: 'none',
                cursor: 'pointer', width: 'calc(100% - 24px)', textAlign: 'left',
              }}>
              <div style={{
                width: '100%', background: COLORS.bg1, border: '1px solid rgba(255,255,255,.07)',
                overflow: 'hidden',
              }}>
                <div style={{ display: 'flex' }}>
                  <div style={{ width: 4, flexShrink: 0, background: c, boxShadow: `0 0 10px ${c}50` }} />
                  <div style={{ flex: 1, padding: '13px 13px 13px 11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 8.5, fontWeight: 700, color: c, padding: '2px 6px', border: `1px solid ${c}40`, background: `${c}12`, letterSpacing: '0.14em' }}>{event.type}</span>
                          {going && <span style={{ fontSize: 8.5, fontWeight: 700, color: COLORS.green, padding: '2px 6px', border: '1px solid rgba(22,163,74,.3)', background: 'rgba(22,163,74,.08)', letterSpacing: '0.14em' }}>GOING</span>}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800 }}>{emoji} {event.title}</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '5px 9px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', marginLeft: 8, flexShrink: 0 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '0.14em' }}>
                          {new Date(event.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1 }}>{event.time}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: COLORS.w35 }}><MapPin size={14} style={{marginRight:4,verticalAlign:-1}} /> {event.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: COLORS.w35 }}>{event.attendees?.length ?? 0} / {event.capacity} attending</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: fill > 90 ? '#ef4444' : COLORS.w35 }}>{fill}%</span>
                        <div style={{ width: 60, height: 2, background: 'rgba(255,255,255,.12)' }}>
                          <div style={{ width: `${fill}%`, height: '100%', background: fill > 90 ? '#ef4444' : c }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
