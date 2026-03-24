// ═══════════════════════════════════════════════════════════════
// SCREEN: Discover — GRID + SWIPE + INFINITE SCROLL + FILTERS
// Competitor parity: Grindr grid, Romeo guided search, MachoBB filters
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback, useRef, memo } from 'react';
import { useNavStore, useAuthStore, useDiscoveryStore } from '@/store';
import { useProximity } from '@/hooks/useProximity';
import { useAI } from '@/hooks/useAI';
import { p2p, proximityRoomId } from '@/services/p2p';
import { api } from '@/services/api';
import { searchCities } from '@/services/autocomplete';
import { haptic } from '@/services/haptics';
import { usePaygate } from '@/services/paygate';
import { COLORS } from '@/types';
import type { UserProfile, Tribe, LookingFor } from '@/types';

type ViewMode = 'grid' | 'swipe' | 'list';
type SortBy = 'distance' | 'last_active' | 'age' | 'compatibility';

interface Filters {
  ageMin: number; ageMax: number;
  distanceKm: number;
  tribes: Tribe[];
  lookingFor: LookingFor[];
  online: boolean;
  verified: boolean;
  hasPhoto: boolean;
  sortBy: SortBy;
}

const DEFAULT_FILTERS: Filters = {
  ageMin: 18, ageMax: 65, distanceKm: 50,
  tribes: [], lookingFor: [], online: false,
  verified: false, hasPhoto: false, sortBy: 'distance',
};

export default function DiscoverScreen() {
  const go = useNavStore((s) => s.go);
  const me = useAuthStore((s) => s.user);
  const {
    nearbyUsers, setNearby, addUser, filter, setFilter, search, setSearch, loading, setLoading,
  } = useDiscoveryStore();

  const { position, h3Hex, nearbyHexes, setMode } = useProximity({ defaultMode: 'passive', resolution: 8 });
  const { getEmbedding, ready: aiReady } = useAI();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [citySearch, setCitySearch] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Swipe state
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);

  // Favorites
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Broadcast presence
  useEffect(() => {
    if (!me || !h3Hex || !position) return;
    api.presence.update({ h3Hex, lat: position.lat, lng: position.lng, online: true });
    const roomId = proximityRoomId(h3Hex);
    const actions = p2p.join(roomId);
    actions.sendPresence({ name: me.name, avatar: me.avatar, online: true });
    const interval = setInterval(() => {
      api.presence.update({ h3Hex, lat: position.lat, lng: position.lng, online: true });
    }, 30_000);
    return () => { clearInterval(interval); p2p.leave(roomId); };
  }, [me, h3Hex, position]);

  // Load users
  useEffect(() => {
    if (!nearbyHexes.length) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        const users = await api.users.getNearby(nearbyHexes, 50);
        setNearby(users);
      } catch {} finally { setLoading(false); }
    })();
  }, [nearbyHexes]);

  // Infinite scroll
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const moreUsers = await api.users.getNearby(nearbyHexes, 20);
      if (moreUsers.length < 20) setHasMore(false);
      moreUsers.forEach(u => addUser(u));
      setPage(p => p + 1);
    } catch {} finally { setLoading(false); }
  }, [hasMore, loading, nearbyHexes]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) loadMore();
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [loadMore]);

  // Apply filters
  const filtered = nearbyUsers
    .filter(u => {
      if (filters.online && !u.online) return false;
      if (filters.verified && !u.verified) return false;
      if (filters.hasPhoto && !u.avatar) return false;
      if (u.age && (u.age < filters.ageMin || u.age > filters.ageMax)) return false;
      if (filters.tribes.length && !filters.tribes.some(t => u.tribes?.includes(t))) return false;
      if (filters.lookingFor.length && !filters.lookingFor.some(l => u.lookingFor?.includes(l))) return false;
      if (filter === 'online') return u.online;
      if (filter === 'verified') return u.verified;
      return true;
    })
    .filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'distance': return (a.distance ?? 99) - (b.distance ?? 99);
        case 'last_active': return (b.lastSeen ?? 0) - (a.lastSeen ?? 0);
        case 'age': return (a.age ?? 0) - (b.age ?? 0);
        default: return 0;
      }
    });

  const onlineKings = nearbyUsers.filter(u => u.online);

  // Swipe handlers
  const handleSwipe = useCallback((userId: string, action: 'like' | 'pass' | 'superlike') => {
    haptic.light();
    if (action === 'like' || action === 'superlike') {
      api.matches.swipe(userId, action);
    }
    setSwipeDir(action === 'pass' ? 'left' : 'right');
    setTimeout(() => {
      setSwipeDir(null);
      setSwipeIndex(i => i + 1);
    }, 300);
  }, []);

  // Favorite toggle
  const toggleFavorite = useCallback((userId: string) => {
    haptic.tap();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,.07)', position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${COLORS.red},${COLORS.blue},transparent)` }} />

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: '.8px' }}>FIND YOUR KING</span>
            {position && (
              <span style={{ fontSize: 8, fontWeight: 700, color: COLORS.green, padding: '1px 6px', background: 'rgba(22,163,74,.1)', border: '1px solid rgba(22,163,74,.3)', letterSpacing: '.1em' }}>GPS LIVE</span>
            )}
          </div>
          <button onClick={() => go('notifications')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, position: 'relative' }}>
            🔔
          </button>
          <button onClick={() => go('settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>⚙️</button>
        </div>

        {/* Search */}
        <div style={{ padding: '0 14px 8px', position: 'relative' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search kings…"
            style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.12)', padding: '9px 14px 9px 34px', color: '#fff', fontSize: 13, outline: 'none' }} />
          {citySearch.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 14, right: 14, background: COLORS.bg2, border: `1px solid ${COLORS.w12}`, zIndex: 50 }}>
              {citySearch.map(c => (
                <button key={c} onClick={() => { setSearch(c); setCitySearch([]); }}
                  style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: COLORS.w60, fontSize: 13, textAlign: 'left', cursor: 'pointer' }}>
                  📍 {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View mode + filters row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px 10px' }}>
          {/* View toggles */}
          <div style={{ display: 'flex', border: `1px solid ${COLORS.w07}`, flexShrink: 0 }}>
            {([
              { mode: 'grid' as ViewMode, icon: '⊞', label: 'Grid' },
              { mode: 'swipe' as ViewMode, icon: '⇔', label: 'Swipe' },
              { mode: 'list' as ViewMode, icon: '☰', label: 'List' },
            ]).map(v => (
              <button key={v.mode} onClick={() => { setViewMode(v.mode); haptic.tap(); }}
                style={{
                  padding: '6px 12px', background: viewMode === v.mode ? 'rgba(229,25,46,.15)' : 'transparent',
                  border: 'none', borderRight: `1px solid ${COLORS.w07}`, cursor: 'pointer',
                  color: viewMode === v.mode ? COLORS.red : COLORS.w35, fontSize: 12, fontWeight: 700,
                }}>
                {v.icon}
              </button>
            ))}
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1 }}>
            {['all', 'online', 'nearby', 'verified', 'favorites'].map(f => (
              <button key={f} onClick={() => { setFilter(f); haptic.tap(); }}
                style={{
                  padding: '5px 12px', border: `1px solid ${filter === f ? COLORS.red : COLORS.w12}`,
                  background: filter === f ? 'rgba(229,25,46,.1)' : 'transparent',
                  color: filter === f ? COLORS.red : COLORS.w35, fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '.05em', cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                {f}
              </button>
            ))}
          </div>

          {/* Filter button */}
          <button onClick={() => { setShowFilters(!showFilters); haptic.tap(); }}
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: showFilters ? 'rgba(229,25,46,.15)' : COLORS.w04,
              border: `1px solid ${showFilters ? COLORS.red : COLORS.w07}`,
              cursor: 'pointer', fontSize: 14, color: showFilters ? COLORS.red : COLORS.w35, flexShrink: 0,
            }}>
            ⚙
          </button>
        </div>

        {/* Expandable filter panel */}
        {showFilters && <FilterPanel filters={filters} setFilters={setFilters} onClose={() => setShowFilters(false)} />}
      </div>

      {/* Content */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 10px' }}>
        {/* Online strip */}
        {onlineKings.length > 0 && filter === 'all' && viewMode !== 'swipe' && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ padding: '6px 4px 8px', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, color: COLORS.w35, letterSpacing: '.1em' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.green, boxShadow: `0 0 6px ${COLORS.green}` }} />
              ONLINE NOW · {onlineKings.length}
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
              {onlineKings.slice(0, 12).map(u => (
                <button key={u.id} onClick={() => { go('view-profile', { profile: u }); haptic.tap(); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 54, height: 54, border: `2px solid ${COLORS.red}`, overflow: 'hidden', boxShadow: '0 0 14px rgba(229,25,46,.35)' }}>
                    <img src={u.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: COLORS.w60 }}>{u.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,.15)', borderTop: `2px solid ${COLORS.red}`, borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
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

        {/* SWIPE MODE */}
        {viewMode === 'swipe' && filtered.length > 0 && swipeIndex < filtered.length && (
          <SwipeCard
            user={filtered[swipeIndex]!}
            onSwipe={handleSwipe}
            onFavorite={toggleFavorite}
            isFav={favorites.has(filtered[swipeIndex]!.id)}
            direction={swipeDir}
          />
        )}

        {/* GRID MODE */}
        {viewMode === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {filtered.map(u => (
              <GridCard key={u.id} user={u} onClick={() => go('view-profile', { profile: u })}
                onFavorite={toggleFavorite} isFav={favorites.has(u.id)} />
            ))}
          </div>
        )}

        {/* LIST MODE */}
        {viewMode === 'list' && (
          <div>
            {filtered.map(u => (
              <ListCard key={u.id} user={u} onClick={() => go('view-profile', { profile: u })}
                onMessage={() => go('chat', { chatUser: u })} onFavorite={toggleFavorite} isFav={favorites.has(u.id)} />
            ))}
          </div>
        )}

        {loading && page > 1 && (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,.1)', borderTop: `2px solid ${COLORS.red}`, borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto' }} />
          </div>
        )}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

// ── Filter Panel ──────────────────────────────────────────────
function FilterPanel({ filters, setFilters, onClose }: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  onClose: () => void;
}) {
  const TRIBES: Tribe[] = ['Bear', 'Muscle', 'Jock', 'Daddy', 'Otter', 'Twink', 'Leather', 'Masc', 'Geek', 'Alt'];
  const LOOKING: LookingFor[] = ['Chat', 'Events', 'Dates', 'Friends', 'Right Now', 'Relationship', 'Hookup'];
  const SORT: SortBy[] = ['distance', 'last_active', 'age', 'compatibility'];

  return (
    <div style={{ padding: '0 14px 14px', borderBottom: `1px solid ${COLORS.w07}`, maxHeight: 300, overflowY: 'auto' }}>
      {/* Age range */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 6 }}>AGE: {filters.ageMin} — {filters.ageMax}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="range" min={18} max={80} value={filters.ageMin}
            onChange={e => setFilters({ ...filters, ageMin: parseInt(e.target.value) })}
            style={{ flex: 1, accentColor: COLORS.red }} />
          <input type="range" min={18} max={80} value={filters.ageMax}
            onChange={e => setFilters({ ...filters, ageMax: parseInt(e.target.value) })}
            style={{ flex: 1, accentColor: COLORS.red }} />
        </div>
      </div>

      {/* Distance */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 6 }}>DISTANCE: {filters.distanceKm}km</div>
        <input type="range" min={1} max={200} value={filters.distanceKm}
          onChange={e => setFilters({ ...filters, distanceKm: parseInt(e.target.value) })}
          style={{ width: '100%', accentColor: COLORS.red }} />
      </div>

      {/* Tribes */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 6 }}>TRIBES</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {TRIBES.map(t => (
            <button key={t} onClick={() => {
              const tribes = filters.tribes.includes(t) ? filters.tribes.filter(x => x !== t) : [...filters.tribes, t];
              setFilters({ ...filters, tribes });
            }}
              style={{
                padding: '3px 9px', border: `1px solid ${filters.tribes.includes(t) ? COLORS.red : COLORS.w12}`,
                background: filters.tribes.includes(t) ? 'rgba(229,25,46,.1)' : 'transparent',
                color: filters.tribes.includes(t) ? COLORS.red : COLORS.w35, fontSize: 10, fontWeight: 700, cursor: 'pointer',
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 6 }}>SORT BY</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {SORT.map(s => (
            <button key={s} onClick={() => setFilters({ ...filters, sortBy: s })}
              style={{
                padding: '4px 10px', border: `1px solid ${filters.sortBy === s ? COLORS.blue : COLORS.w12}`,
                background: filters.sortBy === s ? 'rgba(37,99,235,.1)' : 'transparent',
                color: filters.sortBy === s ? COLORS.blue : COLORS.w35, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                textTransform: 'capitalize',
              }}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { key: 'online', label: 'Online only' },
          { key: 'verified', label: 'Verified' },
          { key: 'hasPhoto', label: 'Has photo' },
        ].map(t => (
          <button key={t.key} onClick={() => setFilters({ ...filters, [t.key]: !(filters as any)[t.key] })}
            style={{
              padding: '5px 10px', border: `1px solid ${(filters as any)[t.key] ? COLORS.green : COLORS.w12}`,
              background: (filters as any)[t.key] ? 'rgba(22,163,74,.1)' : 'transparent',
              color: (filters as any)[t.key] ? COLORS.green : COLORS.w35, fontSize: 10, fontWeight: 700, cursor: 'pointer',
            }}>
            {(filters as any)[t.key] ? '✓ ' : ''}{t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Grid Card ─────────────────────────────────────────────────
const GridCard = memo(({ user, onClick, onFavorite, isFav }: {
  user: UserProfile; onClick: () => void;
  onFavorite: (id: string) => void; isFav: boolean;
}) => (
  <div onClick={onClick}
    style={{ background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, cursor: 'pointer', overflow: 'hidden', animation: 'fadeUp .3s ease' }}>
    <div style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden' }}>
      <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(6,6,16,.95) 0%,transparent 55%)' }} />
      {user.online && (
        <div style={{ position: 'absolute', top: 7, right: 7, display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', background: 'rgba(6,6,16,.85)', border: '1px solid rgba(22,163,74,.4)' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: COLORS.green }} />
          <span style={{ fontSize: 8, fontWeight: 800, color: COLORS.green }}>LIVE</span>
        </div>
      )}
      <button onClick={e => { e.stopPropagation(); onFavorite(user.id); }}
        style={{ position: 'absolute', top: 7, left: 7, background: 'rgba(6,6,16,.7)', border: 'none', cursor: 'pointer', padding: '4px 6px', fontSize: 14 }}>
        {isFav ? '❤️' : '🤍'}
      </button>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>{user.name}</span>
          <span style={{ fontSize: 12, color: COLORS.w60 }}>{user.age}</span>
        </div>
        <div style={{ fontSize: 10, color: COLORS.w35 }}>📍 {user.distance != null ? `${user.distance.toFixed(1)}km` : ''} · {user.city}</div>
      </div>
    </div>
  </div>
));

// ── List Card ─────────────────────────────────────────────────
const ListCard = memo(({ user, onClick, onMessage, onFavorite, isFav }: {
  user: UserProfile; onClick: () => void; onMessage: () => void;
  onFavorite: (id: string) => void; isFav: boolean;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: `1px solid ${COLORS.w07}` }}>
    <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
      <div style={{ width: 56, height: 56, border: `1px solid ${COLORS.w12}`, overflow: 'hidden' }}>
        <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      </div>
    </button>
    <div style={{ flex: 1, cursor: 'pointer' }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 800 }}>{user.name}</span>
        <span style={{ fontSize: 12, color: COLORS.w35 }}>{user.age}</span>
        {user.online && <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.green }} />}
      </div>
      <div style={{ fontSize: 11, color: COLORS.w35 }}>{user.bio?.slice(0, 60)}…</div>
      <div style={{ fontSize: 10, color: COLORS.w35, marginTop: 2 }}>📍 {user.distance?.toFixed(1)}km · {user.city}</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button onClick={() => onFavorite(user.id)}
        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.w04, border: `1px solid ${COLORS.w07}`, cursor: 'pointer', fontSize: 14 }}>
        {isFav ? '❤️' : '🤍'}
      </button>
      <button onClick={onMessage}
        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(229,25,46,.1)', border: '1px solid rgba(229,25,46,.3)', cursor: 'pointer', fontSize: 14 }}>
        💬
      </button>
    </div>
  </div>
));

// ── Swipe Card ────────────────────────────────────────────────
const SwipeCard = memo(({ user, onSwipe, onFavorite, isFav, direction }: {
  user: UserProfile;
  onSwipe: (userId: string, action: 'like' | 'pass' | 'superlike') => void;
  onFavorite: (id: string) => void;
  isFav: boolean;
  direction: 'left' | 'right' | null;
}) => (
  <div style={{
    maxWidth: 380, margin: '20px auto', animation: 'fadeUp .3s ease',
    transform: direction ? `translateX(${direction === 'left' ? -400 : 400}px) rotate(${direction === 'left' ? -15 : 15}deg)` : 'none',
    transition: 'transform 0.3s ease', opacity: direction ? 0 : 1,
  }}>
    <div style={{ background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, overflow: 'hidden' }}>
      <div style={{ aspectRatio: '3/4', position: 'relative' }}>
        <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(6,6,16,.95) 0%,transparent 50%)' }} />
        <button onClick={() => onFavorite(user.id)}
          style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(6,6,16,.7)', border: 'none', cursor: 'pointer', padding: '6px 8px', fontSize: 18 }}>
          {isFav ? '❤️' : '🤍'}
        </button>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 18px' }}>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{user.name}, {user.age}</div>
          <div style={{ fontSize: 13, color: COLORS.w60, marginBottom: 4 }}>📍 {user.city} · {user.distance?.toFixed(1)}km</div>
          {user.bio && <div style={{ fontSize: 12, color: COLORS.w35 }}>{user.bio.slice(0, 100)}</div>}
        </div>
      </div>
    </div>
    {/* Action buttons */}
    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20 }}>
      <button onClick={() => onSwipe(user.id, 'pass')}
        style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,.05)', border: '2px solid rgba(255,255,255,.2)', cursor: 'pointer', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        ✕
      </button>
      <button onClick={() => onSwipe(user.id, 'superlike')}
        style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(124,58,237,.15)', border: `2px solid ${COLORS.purple}`, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        ⭐
      </button>
      <button onClick={() => onSwipe(user.id, 'like')}
        style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(229,25,46,.15)', border: `2px solid ${COLORS.red}`, cursor: 'pointer', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        ❤️
      </button>
    </div>
  </div>
));
