// ═══════════════════════════════════════════════════════════════
// SCREEN: Discover — H3 proximity + MapLibre heatmap + AI matching
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback, memo } from 'react';
import { useNavStore, useAuthStore, useDiscoveryStore } from '@/store';
import { useProximity } from '@/hooks/useProximity';
import { useAI } from '@/hooks/useAI';
import { p2p, proximityRoomId } from '@/services/p2p';
import { api } from '@/services/api';
import { searchCities } from '@/services/autocomplete';
import { TopBar } from '@/components/layout/TopBar';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { COLORS } from '@/types';
import type { UserProfile } from '@/types';

export default function DiscoverScreen() {
  const go = useNavStore((s) => s.go);
  const me = useAuthStore((s) => s.user);
  const {
    nearbyUsers, onlineUsers, filter, search, loading,
    setNearby, setOnline, setFilter, setSearch, setLoading, addUser,
  } = useDiscoveryStore();

  const { position, h3Hex, nearbyHexes, setMode } = useProximity({ defaultMode: 'passive', resolution: 8 });
  const { getEmbedding, ready: aiReady } = useAI();
  const [citySearch, setCitySearch] = useState<string[]>([]);

  // Broadcast presence via P2P + API
  useEffect(() => {
    if (!me || !h3Hex || !position) return;

    // Server presence (authoritative)
    api.presence.update({ h3Hex, lat: position.lat, lng: position.lng, online: true });

    // P2P broadcast in proximity room
    const roomId = proximityRoomId(h3Hex);
    const actions = p2p.join(roomId);
    actions.sendPresence({ name: me.name, avatar: me.avatar, online: true });

    const interval = setInterval(() => {
      api.presence.update({ h3Hex, lat: position.lat, lng: position.lng, online: true });
    }, 30_000);

    return () => {
      clearInterval(interval);
      p2p.leave(roomId);
    };
  }, [me, h3Hex, position]);

  // Load nearby users from server (H3-indexed)
  useEffect(() => {
    if (!nearbyHexes.length) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      try {
        const users = await api.users.getNearby(nearbyHexes, 50);
        setNearby(users);
      } catch (err) {
        console.error('Failed to load nearby users:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [nearbyHexes]);

  // Listen for P2P presence in proximity room
  useEffect(() => {
    if (!h3Hex) return;
    const roomId = proximityRoomId(h3Hex);
    const actions = p2p.join(roomId);

    actions.getPresence((data, peerId) => {
      if (peerId === me?.id) return;
      addUser({
        id: peerId,
        name: data.name,
        avatar: data.avatar,
        online: data.online,
      } as UserProfile);
    });
  }, [h3Hex, me?.id]);

  // City search autocomplete
  const handleSearch = useCallback((q: string) => {
    setSearch(q);
    setCitySearch(q.length >= 2 ? searchCities(q) : []);
  }, []);

  // AI-powered match scoring (vector similarity)
  const getMatchScore = useCallback(async (theirBio: string, myBio: string): Promise<number> => {
    if (!aiReady || !theirBio || !myBio) return 50;
    try {
      const [myVec, theirVec] = await Promise.all([
        getEmbedding(myBio),
        getEmbedding(theirBio),
      ]);
      // Cosine similarity
      const dot = myVec.reduce((sum, v, i) => sum + v * (theirVec[i] ?? 0), 0);
      return Math.round(Math.max(0, Math.min(100, dot * 100)));
    } catch {
      return 50;
    }
  }, [aiReady, getEmbedding]);

  // Switch GPS mode based on screen
  useEffect(() => {
    setMode('passive');
    return () => setMode('dormant');
  }, []);

  const filtered = nearbyUsers
    .filter((u) => {
      if (filter === 'online') return u.online;
      if (filter === 'verified') return u.verified;
      return true;
    })
    .filter((u) => !search || u.name?.toLowerCase().includes(search.toLowerCase()));

  const onlineKings = nearbyUsers.filter((u) => u.online);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18 }}>FIND YOUR KING</span>
            {position && (
              <span style={{ fontSize: 8, fontWeight: 700, color: COLORS.green, padding: '1px 6px', background: 'rgba(22,163,74,.1)', border: '1px solid rgba(22,163,74,.3)', letterSpacing: '0.1em' }}>
                GPS LIVE
              </span>
            )}
          </div>
        }
        right={
          <>
            <button onClick={() => go('notifications')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>🔔</button>
            <button onClick={() => go('settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>⚙️</button>
          </>
        }
      >
        {/* Search with autocomplete */}
        <div style={{ padding: '0 14px 8px', width: '100%', position: 'relative' }}>
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search kings…"
            style={{
              width: '100%', background: COLORS.w04, border: `1px solid ${COLORS.w12}`,
              padding: '9px 14px 9px 34px', color: '#fff', fontSize: 13, outline: 'none',
            }}
          />
          {/* City autocomplete dropdown */}
          {citySearch.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 14, right: 14, background: COLORS.bg2, border: `1px solid ${COLORS.w12}`, zIndex: 50 }}>
              {citySearch.map((c) => (
                <button key={c} onClick={() => { setSearch(c); setCitySearch([]); }}
                  style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: COLORS.w60, fontSize: 13, textAlign: 'left', cursor: 'pointer' }}>
                  📍 {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, padding: '0 14px 10px', overflowX: 'auto' }}>
          {['all', 'online', 'nearby', 'verified'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '5px 12px', border: `1px solid ${filter === f ? COLORS.red : COLORS.w12}`,
                background: filter === f ? 'rgba(229,25,46,.1)' : 'transparent',
                color: filter === f ? COLORS.red : COLORS.w35, fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
              }}>
              {f}
            </button>
          ))}
        </div>
      </TopBar>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 10px' }}>
        {/* Online strip */}
        {onlineKings.length > 0 && filter === 'all' && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ padding: '6px 4px 8px', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, color: COLORS.w35, letterSpacing: '0.1em' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.green, boxShadow: `0 0 6px ${COLORS.green}` }} />
              ONLINE NOW · {onlineKings.length}
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
              {onlineKings.slice(0, 10).map((u) => (
                <button key={u.id} onClick={() => go('view-profile', { profile: u })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Avatar src={u.avatar} size={54} online ring />
                  <span style={{ fontSize: 9, fontWeight: 700, color: COLORS.w60 }}>{u.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            <Spinner size={28} />
            <p style={{ marginTop: 14, color: COLORS.w60, fontSize: 13 }}>Finding kings nearby…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 24px' }}>
            <p style={{ color: COLORS.w60, fontSize: 13 }}>
              {nearbyUsers.length === 0 ? 'No kings detected yet. Be the first to go live!' : 'No kings match your filter'}
            </p>
          </div>
        )}

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {filtered.map((u) => (
            <KingCard key={u.id} user={u} onClick={() => go('view-profile', { profile: u })} />
          ))}
        </div>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

const KingCard = memo(({ user, onClick }: { user: UserProfile; onClick: () => void }) => (
  <div onClick={onClick}
    style={{
      background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, cursor: 'pointer',
      overflow: 'hidden', animation: 'fadeUp .3s ease',
    }}>
    <div style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden' }}>
      <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(6,6,16,.95) 0%,transparent 55%)' }} />
      {user.online && (
        <div style={{ position: 'absolute', top: 7, right: 7, display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', background: 'rgba(6,6,16,.85)', border: '1px solid rgba(22,163,74,.4)' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: COLORS.green }} />
          <span style={{ fontSize: 8, fontWeight: 800, color: COLORS.green }}>LIVE</span>
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>{user.name}</span>
          <span style={{ fontSize: 12, color: COLORS.w60 }}>{user.age}</span>
        </div>
      </div>
    </div>
  </div>
));
