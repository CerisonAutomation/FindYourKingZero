// ═══════════════════════════════════════════════════════════════
// SCREEN: RightNow — live P2P proximity + MapLibre + H3
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useRef, useCallback } from 'react';
import { List, Map, MessageCircle } from 'lucide-react';
import { useNavStore, useAuthStore, useDiscoveryStore } from '@/store';
import { useProximity } from '@/hooks/useProximity';
import { p2p, proximityRoomId } from '@/services/p2p';
import { api } from '@/services/api';
import { TopBar } from '@/components/ui/index';
import { Avatar } from '@/components/ui/index';
import { Spinner } from '@/components/ui/index';
import { LiveDot } from '@/components/ui/index';
import { COLORS } from '@/types';
import type { UserProfile } from '@/types';

const INTENTS = [
  { id: 'gym', label: 'Gym', c: COLORS.blue },
  { id: 'dinner', label: 'Dinner', c: COLORS.yellow },
  { id: 'drinks', label: 'Drinks', c: COLORS.red },
  { id: 'coffee', label: 'Coffee', c: COLORS.purple },
  { id: 'nightlife', label: 'Night', c: COLORS.pink },
  { id: 'hangout', label: 'Hangout', c: COLORS.green },
  { id: 'hookup', label: 'Right Now', c: COLORS.red },
];

export default function RightNowScreen() {
  const go = useNavStore((s) => s.go);
  const me = useAuthStore((s) => s.user);
  const { nearbyUsers, addUser } = useDiscoveryStore();

  const { position, h3Hex, nearbyHexes, hexToCoords, setMode } = useProximity({
    defaultMode: 'active',
    resolution: 8,
    maxRadiusKm: 10,
  });

  const [isLive, setIsLive] = useState(false);
  const [intent, setIntent] = useState('hangout');
  const [duration, setDuration] = useState(2);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Activate GPS when this screen is active
  useEffect(() => {
    setMode('active');
    return () => setMode('dormant');
  }, []);

  // Load nearby users
  useEffect(() => {
    if (!nearbyHexes.length) return;
    (async () => {
      try {
        const users = await api.users.getNearby(nearbyHexes, 30);
        users.forEach(u => addUser(u));
      } catch {}
    })();
  }, [nearbyHexes]);

  // Go live
  const goLive = useCallback(async () => {
    if (!me || !h3Hex || !position) return;

    // Server presence
    await api.presence.update({ h3Hex, lat: position.lat, lng: position.lng, online: true, intent });

    // P2P proximity room
    const roomId = proximityRoomId(h3Hex);
    const actions = p2p.join(roomId);
    actions.sendPresence({ name: me.name, avatar: me.avatar, online: true });
    actions.getPresence((data, peerId) => {
      if (peerId === me.id) return;
      addUser({ id: peerId, name: data.name, avatar: data.avatar, online: data.online } as UserProfile);
    });

    setIsLive(true);
  }, [me, h3Hex, position, intent]);

  // MapLibre init (lazy)
  useEffect(() => {
    if (viewMode !== 'map' || !mapRef.current || mapInstanceRef.current) return;

    (async () => {
      const maplibregl = await import('maplibre-gl');
      const map = new maplibregl.Map({
        container: mapRef.current!,
        style: 'https://demotiles.maplibre.org/style.json',
        center: position ? [position.lng, position.lat] : [-3.7, 40.4],
        zoom: 14,
      });

      map.on('load', () => {
        // Heat data from nearby hexes
        const features = nearbyHexes.slice(0, 200).map(hex => {
          const coords = hexToCoords(hex);
          return { type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: coords }, properties: {} };
        });

        map.addSource('kings', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features },
        });

        map.addLayer({
          id: 'kings-heat',
          type: 'heatmap',
          source: 'kings',
          paint: {
            'heatmap-radius': 30,
            'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(229,25,46,0)', 1, 'rgba(229,25,46,0.8)'],
            'heatmap-opacity': 0.7,
          },
        });
      });

      mapInstanceRef.current = map;
    })();

    return () => { mapInstanceRef.current?.remove(); mapInstanceRef.current = null; };
  }, [viewMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
            {isLive && <LiveDot size={8} />}
            <span style={{ fontSize: 16, fontWeight: 700 }}>RIGHT NOW</span>
            {nearbyUsers.length > 0 && (
              <span style={{ padding: '1px 8px', background: 'rgba(22,163,74,.1)', border: '1px solid rgba(22,163,74,.3)', fontSize: 10, fontWeight: 800, color: COLORS.green }}>
                {nearbyUsers.length} NEARBY
              </span>
            )}
          </div>
        }
        right={
          <button onClick={() => setViewMode(v => v === 'list' ? 'map' : 'list')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
            {viewMode === 'map' ? <List size={18} /> : <Map size={18} />}
          </button>
        }
      />

      {viewMode === 'map' ? (
        <div style={{ flex: 1, position: 'relative' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          {!position && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.bg }}>
              <p style={{ color: COLORS.w35 }}>GPS location required for map view</p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Live status */}
          {isLive ? (
            <div style={{ margin: '10px 14px', padding: '13px 15px', background: 'rgba(22,163,74,.07)', border: '1px solid rgba(22,163,74,.25)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <LiveDot size={9} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.green }}>You're Live · {INTENTS.find(i => i.id === intent)?.label}</div>
                <div style={{ fontSize: 11, color: COLORS.w35 }}>Expires in {duration}h · P2P broadcast active</div>
              </div>
              <button onClick={() => setIsLive(false)}
                style={{ padding: '5px 11px', border: '1px solid rgba(22,163,74,.3)', background: 'none', color: 'rgba(22,163,74,.8)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                STOP
              </button>
            </div>
          ) : (
            <div style={{ margin: '10px 14px', padding: 15, background: 'rgba(229,25,46,.05)', border: '1px solid rgba(229,25,46,.2)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w60, letterSpacing: '0.14em', marginBottom: 10 }}>WHAT ARE YOU UP TO?</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {INTENTS.map(it => (
                  <button key={it.id} onClick={() => setIntent(it.id)}
                    style={{
                      padding: '5px 11px', border: `1px solid ${intent === it.id ? it.c : COLORS.w12}`,
                      background: intent === it.id ? `${it.c}18` : 'transparent',
                      color: intent === it.id ? it.c : COLORS.w35, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}>
                    {it.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '0.14em', flex: 1 }}>DURATION</span>
                {[1, 2, 4, 8].map(h => (
                  <button key={h} onClick={() => setDuration(h)}
                    style={{
                      width: 32, height: 28, border: `1px solid ${duration === h ? COLORS.red : COLORS.w12}`,
                      background: duration === h ? 'rgba(229,25,46,.15)' : 'transparent',
                      color: duration === h ? COLORS.red : COLORS.w35, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}>
                    {h}h
                  </button>
                ))}
              </div>
              {!position && <p style={{ fontSize: 11, color: COLORS.yellow, marginBottom: 10 }}>⚠ Enable GPS to broadcast location</p>}
              <button onClick={goLive}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '15px 24px', background: `linear-gradient(135deg,${COLORS.red},#FF4020)`,
                  border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%',
                }}>
                GO LIVE NOW
              </button>
            </div>
          )}

          {/* Nearby list */}
          {nearbyUsers.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: `1px solid ${COLORS.w07}` }}>
              <Avatar src={u.avatar} size={50} online={u.online} ring />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{u.name}</span>
                  <span style={{ fontSize: 12, color: COLORS.w35 }}>{u.age}</span>
                </div>
              </div>
              <button onClick={() => go('chat', { chatUser: u })}
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(229,25,46,.1)', border: '1px solid rgba(229,25,46,.3)', cursor: 'pointer' }}>
                <MessageCircle size={18} />
              </button>
            </div>
          ))}
          <div style={{ height: 16 }} />
        </div>
      )}
    </div>
  );
}
