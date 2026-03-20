import 'maplibre-gl/dist/maplibre-gl.css'; // Re-enabled for game-changer map features
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {
    BadgeCheck,
    ChevronLeft,
    Clock,
    Heart,
    MapPin,
    MessageCircle,
    Navigation2,
    RefreshCw,
    Users,
    X,
    Zap,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {MEET_NOW_STATUSES, useMeetNowUsers, useMyMeetNowStatus} from '@/hooks/useMeetNow';
import {useFavorites} from '@/hooks/useFavorites';
import {useCreateConversation} from '@/hooks/useConversations';
import {cn} from '@/lib/utils';
import Supercluster from 'supercluster';
import type {Map as MapLibreMap, Marker} from 'maplibre-gl';

let maplibre: typeof import('maplibre-gl') | null = null;
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

const STATUS_COLORS: Record<string, string> = {
    available: '#22c55e',
    looking: '#3b82f6',
    busy: '#ef4444',
};

function getTimeRemaining(expiresAt: string): string {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const mins = Math.floor(diff / 60000);
    return mins < 60 ? `${mins}m left` : `${Math.floor(mins / 60)}h left`;
}

function formatDistance(km?: number): string {
    if (km === undefined) return '';
    if (km < 0.1) return '< 100m';
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
}

// ─── Pin element builders ────────────────────────────────────────────────────

function createPinElement(avatarUrl: string, statusColor: string, isSelected: boolean, initial: string): HTMLElement {
    const size = isSelected ? 52 : 44;
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
    width:${size}px;height:${size}px;border-radius:50%;
    border:${isSelected ? '3px' : '2px'} solid ${isSelected ? '#ff4d4d' : 'rgba(255,255,255,0.15)'};
    overflow:hidden;cursor:pointer;
    transition:all 0.2s ease;
    box-shadow:${isSelected ? '0 0 0 4px rgba(255,77,77,0.3),0 8px 32px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.4)'};
    position:relative;background:#1a1a1a;
  `;
    if (avatarUrl) {
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        img.onerror = () => {
            img.style.display = 'none';
            addFallback(wrapper, initial);
        };
        wrapper.appendChild(img);
    } else {
        addFallback(wrapper, initial);
    }
    const dot = document.createElement('div');
    dot.style.cssText = `
    position:absolute;bottom:2px;right:2px;width:12px;height:12px;
    border-radius:50%;background:${statusColor};
    border:2px solid #0a0a0a;box-shadow:0 0 6px ${statusColor}88;
  `;
    wrapper.appendChild(dot);
    return wrapper;
}

function addFallback(wrapper: HTMLElement, initial: string) {
    const el = document.createElement('div');
    el.style.cssText = `
    width:100%;height:100%;display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,rgba(255,77,77,0.2),rgba(255,140,0,0.2));
    font-size:16px;font-weight:700;color:#ff6b6b;font-family:Outfit,sans-serif;
  `;
    el.textContent = initial;
    wrapper.appendChild(el);
}

function createClusterElement(count: number): HTMLElement {
    const el = document.createElement('div');
    const size = count > 50 ? 56 : count > 10 ? 48 : 40;
    el.style.cssText = `
    width:${size}px;height:${size}px;border-radius:50%;
    background:linear-gradient(135deg,hsl(0,88%,60%),hsl(25,95%,58%));
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;
    box-shadow:0 0 0 3px rgba(255,77,77,0.25),0 4px 20px rgba(255,77,77,0.35);
    border:2px solid rgba(255,255,255,0.15);
    transition:transform 0.15s ease;
  `;
    const label = document.createElement('span');
    label.style.cssText = 'font-size:12px;font-weight:900;color:#fff;font-family:Outfit,sans-serif;letter-spacing:-0.5px;';
    label.textContent = count > 99 ? '99+' : String(count);
    el.appendChild(label);
    el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
    });
    return el;
}

function createYouMarker(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:20px;height:20px;position:relative;';
    const inner = document.createElement('div');
    inner.style.cssText = `
    width:20px;height:20px;border-radius:50%;
    background:#ff4d4d;border:3px solid #0a0a0a;
    box-shadow:0 0 0 3px rgba(255,77,77,0.25),0 4px 16px rgba(255,77,77,0.4);
    position:relative;z-index:2;
  `;
    const pulse = document.createElement('div');
    pulse.style.cssText = `
    position:absolute;inset:-6px;border-radius:50%;
    background:rgba(255,77,77,0.2);
    animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
  `;
    if (!document.getElementById('you-marker-style')) {
        const style = document.createElement('style');
        style.id = 'you-marker-style';
        style.textContent = '@keyframes ping{75%,100%{transform:scale(1.8);opacity:0;}}';
        document.head.appendChild(style);
    }
    wrapper.appendChild(pulse);
    wrapper.appendChild(inner);
    return wrapper;
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function RightNowMap() {
    const navigate = useNavigate();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const markersRef = useRef<Map<string | number, Marker>>(new Map());
    const youMarkerRef = useRef<Marker | null>(null);

    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
    const [isLocating, setIsLocating] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(13);

    const {data: meetNowUsers = [], refetch} = useMeetNowUsers(userLocation);
    const {data: myStatus} = useMyMeetNowStatus();
    const {isFavorite, toggleFavorite} = useFavorites();
    const createConversation = useCreateConversation();

    const selectedUser = meetNowUsers.find((u) => u.id === selectedUserId) || null;

    // ─── Build clustered points ────────────────────────────────────────────────
    const clusterIndex = useMemo(() => {
        const sc = new Supercluster({radius: 60, maxZoom: 16, minZoom: 0});
        const points = meetNowUsers
            .filter((u) => u.latitude !== 0 || u.longitude !== 0 || userLocation)
            .map((u) => {
                let lat = u.latitude;
                let lng = u.longitude;
                if ((lat === 0 && lng === 0) && userLocation) {
                    const seed = u.id.charCodeAt(0) + u.id.charCodeAt(1);
                    lat = userLocation.lat + ((seed % 10) - 5) * 0.002;
                    lng = userLocation.lng + ((seed % 7) - 3) * 0.003;
                }
                return {
                    type: 'Feature' as const,
                    geometry: {type: 'Point' as const, coordinates: [lng, lat]},
                    properties: {userId: u.id, lat, lng},
                };
            });
        sc.load(points);
        return sc;
    }, [meetNowUsers, userLocation]);

    // ─── Geolocation ──────────────────────────────────────────────────────────
    const locate = useCallback(() => {
        setIsLocating(true);
        navigator.geolocation?.getCurrentPosition(
            (pos) => {
                const loc = {lat: pos.coords.latitude, lng: pos.coords.longitude};
                setUserLocation(loc);
                setIsLocating(false);
                mapRef.current?.flyTo({center: [loc.lng, loc.lat], zoom: 14, duration: 1200});
            },
            () => setIsLocating(false),
            {enableHighAccuracy: true, timeout: 10000}
        );
    }, []);

    // ─── Init MapLibre ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!mapContainerRef.current) return;
        let destroyed = false;

        (async () => {
            try {
                maplibre = await import('maplibre-gl');
                if (destroyed || !mapContainerRef.current) return;

                const map = new maplibre.Map({
                    container: mapContainerRef.current,
                    style: MAP_STYLE,
                    center: [-74.006, 40.7128],
                    zoom: 13,
                    attributionControl: false,
                    pitchWithRotate: false,
                    maxZoom: 18,
                    minZoom: 3,
                });

                mapRef.current = map;

                map.on('load', () => {
                    if (!destroyed) {
                        setMapLoaded(true);
                        locate();
                    }
                });
                map.on('error', () => setMapError(true));
                map.on('click', () => setSelectedUserId(null));
                map.on('zoom', () => setZoom(Math.round(map.getZoom())));
                map.addControl(new maplibre.AttributionControl({compact: true}), 'bottom-left');
            } catch {
                setMapError(true);
            }
        })();

        return () => {
            destroyed = true;
            markersRef.current.forEach((m) => m.remove());
            markersRef.current.clear();
            youMarkerRef.current?.remove();
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    // ─── "You" marker ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!mapRef.current || !mapLoaded || !userLocation || !maplibre) return;
        youMarkerRef.current?.remove();
        const el = createYouMarker();
        youMarkerRef.current = new maplibre.Marker({element: el, anchor: 'center'})
            .setLngLat([userLocation.lng, userLocation.lat])
            .addTo(mapRef.current);
    }, [userLocation, mapLoaded]);

    // ─── Cluster + individual markers ─────────────────────────────────────────
    useEffect(() => {
        if (!mapRef.current || !mapLoaded || !maplibre) return;

        const map = mapRef.current;
        const bounds = map.getBounds();
        const bbox: [number, number, number, number] = [
            bounds.getWest(), bounds.getSouth(),
            bounds.getEast(), bounds.getNorth(),
        ];
        const currentZoom = Math.round(map.getZoom());
        const clusters = clusterIndex.getClusters(bbox, currentZoom);

        // Keys present in this render
        const activeKeys = new Set<string | number>();

        clusters.forEach((cluster) => {
            const [lng, lat] = cluster.geometry.coordinates;
            const props = cluster.properties as any;
            const isCluster = props.cluster;
            const key: string | number = isCluster ? `c-${props.cluster_id}` : props.userId;

            activeKeys.add(key);

            if (isCluster) {
                // Cluster bubble
                const existing = markersRef.current.get(key);
                if (existing) {
                    existing.setLngLat([lng, lat]);
                } else {
                    const el = createClusterElement(props.point_count);
                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const expansionZoom = Math.min(clusterIndex.getClusterExpansionZoom(props.cluster_id), 20);
                        map.flyTo({center: [lng, lat], zoom: expansionZoom, duration: 600});
                    });
                    const marker = new maplibre!.Marker({element: el, anchor: 'center'})
                        .setLngLat([lng, lat])
                        .addTo(map);
                    markersRef.current.set(key, marker);
                }
            } else {
                // Individual pin
                const u = meetNowUsers.find((x) => x.id === props.userId);
                if (!u) return;
                const statusColor = STATUS_COLORS[u.status] || '#22c55e';
                const isSelected = u.id === selectedUserId;
                const initial = (u.profile?.display_name || 'U')[0].toUpperCase();

                // Always rebuild element to reflect selection state
                markersRef.current.get(key)?.remove();
                const el = createPinElement(u.profile?.avatar_url || '', statusColor, isSelected, initial);
                el.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    setSelectedUserId((prev) => (prev === u.id ? null : u.id));
                });
                const marker = new maplibre!.Marker({element: el, anchor: 'center'})
                    .setLngLat([lng, lat])
                    .addTo(map);
                markersRef.current.set(key, marker);
            }
        });

        // Remove stale markers
        markersRef.current.forEach((marker, id) => {
            if (!activeKeys.has(id)) {
                marker.remove();
                markersRef.current.delete(id);
            }
        });
    }, [meetNowUsers, mapLoaded, selectedUserId, userLocation, zoom, clusterIndex]);

    // Re-cluster on map move
    useEffect(() => {
        if (!mapRef.current || !mapLoaded) return;
        const handler = () => setZoom(z => z); // trigger re-render
        mapRef.current.on('moveend', handler);
        return () => {
            mapRef.current?.off('moveend', handler);
        };
    }, [mapLoaded]);

    const handleMessage = async (userId: string) => {
        try {
            const cid = await createConversation.mutateAsync(userId);
            navigate(`/app/chat/${cid}`);
        } catch {
            navigate('/app/messages');
        }
    };

    const FallbackMap = () => (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-secondary/20">
            <MapPin className="w-10 h-10 text-muted-foreground/40 mx-auto"/>
            <p className="text-sm text-muted-foreground">{meetNowUsers.length} users nearby</p>
            <div className="grid grid-cols-3 gap-2 max-w-xs w-full px-4">
                {meetNowUsers.slice(0, 6).map((u) => (
                    <button key={u.id} onClick={() => setSelectedUserId(u.id === selectedUserId ? null : u.id)}
                            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-card border border-border/40">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={u.profile?.avatar_url || ''}/>
                            <AvatarFallback>{(u.profile?.display_name || 'U')[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-muted-foreground truncate w-full text-center">
              {u.profile?.display_name?.split(' ')[0] || 'User'}
            </span>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col" style={{height: '100dvh'}}>
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/20 px-4 py-3 flex items-center gap-2 shrink-0"
                    style={{background: 'hsl(var(--background)/0.92)', backdropFilter: 'blur(40px) saturate(200%)'}}>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full"
                        onClick={() => navigate('/app/right-now')}>
                    <ChevronLeft className="w-5 h-5"/>
                </Button>
                <h1 className="text-lg font-bold flex items-center gap-2 flex-1">
                    <Zap className="w-5 h-5 text-primary"/>
                    Live Map
                </h1>
                <Badge variant="secondary" className="font-mono gap-1">
                    <Users className="w-3 h-3"/>
                    {meetNowUsers.length}
                </Badge>
                {myStatus && (
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse inline-block"/>
                        Live
                    </Badge>
                )}
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full" onClick={() => refetch()}>
                    <RefreshCw className="w-3.5 h-3.5"/>
                </Button>
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full" onClick={locate}
                        disabled={isLocating}>
                    <Navigation2 className={cn('w-3.5 h-3.5', isLocating && 'animate-spin')}/>
                </Button>
            </header>

            {/* Map */}
            <div className="flex-1 relative overflow-hidden">
                {!mapError && <div ref={mapContainerRef} className="absolute inset-0 z-0"/>}
                {mapError && <div className="absolute inset-0 z-0"><FallbackMap/></div>}

                {/* Loading */}
                {!mapLoaded && !mapError && (
                    <div className="absolute inset-0 z-10 bg-background/80 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"/>
                            <p className="text-xs text-muted-foreground">Loading map…</p>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {mapLoaded && meetNowUsers.length === 0 && (
                    <div
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center pointer-events-none">
                        <div className="p-4 rounded-2xl text-center space-y-2"
                             style={{background: 'hsl(var(--card)/0.9)', backdropFilter: 'blur(20px)'}}>
                            <Zap className="w-8 h-8 text-muted-foreground/40 mx-auto"/>
                            <p className="text-sm text-muted-foreground">No one nearby right now</p>
                        </div>
                    </div>
                )}

                {/* Cluster legend */}
                {mapLoaded && (
                    <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 p-2.5 rounded-xl"
                         style={{
                             background: 'hsl(var(--card)/0.85)',
                             backdropFilter: 'blur(20px)',
                             border: '1px solid hsl(var(--border)/0.3)'
                         }}>
                        {MEET_NOW_STATUSES.map((s) => (
                            <div key={s.id} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{background: STATUS_COLORS[s.id]}}/>
                                <span className="text-[10px] text-muted-foreground capitalize">{s.label}</span>
                            </div>
                        ))}
                        <div className="border-t border-border/20 mt-1 pt-1 flex items-center gap-1.5">
                            <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                                style={{background: 'var(--gradient-primary)'}}>N
                            </div>
                            <span className="text-[10px] text-muted-foreground">Cluster</span>
                        </div>
                    </div>
                )}

                {/* You label */}
                {userLocation && mapLoaded && (
                    <div
                        className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full text-[11px] font-semibold text-foreground flex items-center gap-1.5"
                        style={{
                            background: 'hsl(var(--card)/0.85)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid hsl(var(--border)/0.3)'
                        }}>
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"/>
                        You
                    </div>
                )}

                {/* Zoom level debug (only dev) */}
                {import.meta.env.DEV && mapLoaded && (
                    <div className="absolute bottom-16 left-3 z-20 px-2 py-0.5 rounded text-[9px] font-mono opacity-50"
                         style={{background: 'hsl(var(--card)/0.7)'}}>
                        z{zoom}
                    </div>
                )}
            </div>

            {/* Selected user sheet */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        key={selectedUser.id}
                        initial={{y: 120, opacity: 0}}
                        animate={{y: 0, opacity: 1}}
                        exit={{y: 120, opacity: 0}}
                        transition={{type: 'spring', stiffness: 380, damping: 32}}
                        className="shrink-0 bg-card border-t border-border/50 rounded-t-3xl shadow-2xl z-30 px-5 pt-3 pb-6"
                        style={{paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom) + 24px))'}}
                    >
                        <div className="flex justify-center mb-4">
                            <div className="w-10 h-1 rounded-full bg-border/60"/>
                        </div>
                        <button
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-secondary/60"
                            onClick={() => setSelectedUserId(null)}
                        >
                            <X className="w-4 h-4 text-muted-foreground"/>
                        </button>

                        <div className="flex items-center gap-4 mb-5">
                            <div className="relative">
                                <Avatar className="w-16 h-16 border-2 border-primary/30 shadow-lg">
                                    <AvatarImage src={selectedUser.profile?.avatar_url || ''}/>
                                    <AvatarFallback className="text-lg font-bold">
                                        {(selectedUser.profile?.display_name || 'U')[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background"
                                    style={{background: STATUS_COLORS[selectedUser.status] || '#22c55e'}}/>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-bold text-lg leading-tight truncate">
                    {selectedUser.profile?.display_name || 'User'}
                  </span>
                                    {selectedUser.profile?.age && (
                                        <span
                                            className="text-muted-foreground text-base">{selectedUser.profile.age}</span>
                                    )}
                                    {selectedUser.profile?.is_verified && (
                                        <BadgeCheck className="w-4 h-4 text-primary shrink-0"/>
                                    )}
                                </div>
                                <div
                                    className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    {selectedUser.distance !== undefined && (
                                        <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3"/>
                                            {formatDistance(selectedUser.distance)}
                    </span>
                                    )}
                                    <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3"/>
                                        {getTimeRemaining(selectedUser.expires_at)}
                  </span>
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                        {selectedUser.status}
                                    </Badge>
                                </div>
                                {selectedUser.message && (
                                    <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-1">
                                        "{selectedUser.message}"
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" size="lg"
                                    onClick={() => toggleFavorite(selectedUser.user_id)}
                                    className={cn(
                                        'flex-1 h-12 rounded-2xl',
                                        isFavorite(selectedUser.user_id) ? 'border-primary/60 text-primary bg-primary/10' : 'border-border/50'
                                    )}>
                                <Heart
                                    className={cn('w-4 h-4 mr-2', isFavorite(selectedUser.user_id) && 'fill-current')}/>
                                {isFavorite(selectedUser.user_id) ? 'Saved' : 'Save'}
                            </Button>
                            <Button size="lg" onClick={() => handleMessage(selectedUser.user_id)}
                                    disabled={createConversation.isPending}
                                    className="flex-1 h-12 rounded-2xl font-bold"
                                    style={{
                                        background: 'var(--gradient-primary)',
                                        boxShadow: '0 4px 20px hsl(var(--primary)/0.3)'
                                    }}>
                                <MessageCircle className="w-4 h-4 mr-2"/>
                                Message
                            </Button>
                            <Button variant="outline" size="lg"
                                    onClick={() => navigate(`/app/profile/${selectedUser.user_id}`)}
                                    className="h-12 px-4 rounded-2xl border-border/50">
                                View
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        .maplibregl-ctrl-bottom-left { bottom:8px!important;left:8px!important; }
        .maplibregl-ctrl-attrib { background:rgba(0,0,0,0.5)!important;color:rgba(255,255,255,0.4)!important;font-size:10px!important;border-radius:6px; }
        .maplibregl-ctrl-attrib a { color:rgba(255,255,255,0.4)!important; }
        .maplibregl-canvas { outline:none!important; }
      `}</style>
        </div>
    );
}
