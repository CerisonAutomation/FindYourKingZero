// =====================================================
// Leaflet Realtime Map — PostGIS + Supabase Realtime
// =====================================================
import {useCallback, useEffect, useRef, useState} from 'react';
import {Circle, MapContainer, Marker, Popup, TileLayer, useMap} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {supabase} from '@/integrations/supabase/client';
import {useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {Crown, Navigation, Shield} from 'lucide-react';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface NearbyProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  age: number | null;
  lat: number;
  lng: number;
  distance_km: number;
  verification_status: string;
  is_premium: boolean;
}

interface LeafletRealtimeMapProps {
  userLat: number;
  userLng: number;
  radiusKm?: number;
  onProfileClick?: (profile: NearbyProfile) => void;
}

const createProfileIcon = (profile: NearbyProfile) => {
  const borderColor = profile.is_premium ? '#f59e0b' : profile.verification_status === 'verified' ? '#10b981' : '#6b7280';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 44px; height: 44px; border-radius: 50%;
        border: 2.5px solid ${borderColor};
        overflow: hidden; cursor: pointer;
        box-shadow: 0 2px 12px rgba(0,0,0,0.4);
        background: #1a1a2e;
      ">
        <img src="${profile.avatar_url || '/placeholder-avatar.png'}" 
             style="width:100%;height:100%;object-fit:cover;" 
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%231a1a2e%22 width=%2240%22 height=%2240%22/><text x=%2220%22 y=%2226%22 text-anchor=%22middle%22 fill=%22%23fff%22 font-size=%2216%22>${(profile.display_name || '?')[0]}</text></svg>'" />
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function LeafletRealtimeMap({ userLat, userLng, radiusKm = 50, onProfileClick }: LeafletRealtimeMapProps) {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<NearbyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchNearby = useCallback(async () => {
    const { data, error } = await supabase.rpc('find_nearby_profiles', {
      p_lat: userLat,
      p_lng: userLng,
      p_radius_km: radiusKm,
    });
    if (!error && data) {
      setProfiles(data as NearbyProfile[]);
    }
    setLoading(false);
  }, [userLat, userLng, radiusKm]);

  useEffect(() => {
    fetchNearby();

    // Realtime subscription for presence changes
    const channel = supabase.channel('leaflet-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `is_active=eq.true`,
      }, (payload) => {
        const profile = payload.new as any;
        if (profile?.location) {
          setProfiles(prev => {
            const idx = prev.findIndex(p => p.id === profile.id);
            const updated: NearbyProfile = {
              id: profile.id,
              display_name: profile.display_name,
              avatar_url: profile.avatar_url,
              age: profile.age,
              lat: profile.location?.coordinates?.[1] ?? 0,
              lng: profile.location?.coordinates?.[0] ?? 0,
              distance_km: 0,
              verification_status: profile.verification_status,
              is_premium: profile.is_premium,
            };
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = updated;
              return next;
            }
            return [...prev, updated];
          });
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNearby]);

  const center: [number, number] = [userLat, userLng];

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full rounded-xl"
        style={{ minHeight: '400px', background: '#0a0a1a' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapController center={center} />
        
        {/* User radius circle */}
        <Circle
          center={center}
          radius={radiusKm * 1000}
          pathOptions={{ color: 'hsl(var(--primary))', fillColor: 'hsl(var(--primary))', fillOpacity: 0.05, weight: 1 }}
        />

        {/* User marker */}
        <Marker
          position={center}
          icon={L.divIcon({
            className: 'user-marker',
            html: `<div style="width:16px;height:16px;border-radius:50%;background:#6366f1;border:3px solid #fff;box-shadow:0 0 12px rgba(99,102,241,0.6);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        />

        {/* Profile markers */}
        {profiles.map((profile) => (
          <Marker
            key={profile.id}
            position={[profile.lat, profile.lng]}
            icon={createProfileIcon(profile)}
            eventHandlers={{
              click: () => onProfileClick ? onProfileClick(profile) : navigate(`/app/profile/${profile.id}`),
            }}
          >
            <Popup className="dark-popup">
              <div className="p-2 min-w-[160px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">{profile.display_name}</span>
                  {profile.is_premium && <Crown className="w-3 h-3 text-amber-400" />}
                  {profile.verification_status === 'verified' && <Shield className="w-3 h-3 text-emerald-400" />}
                </div>
                <p className="text-xs text-gray-400">
                  {profile.age ? `${profile.age} · ` : ''}{profile.distance_km}km away
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary animate-spin rounded-full" />
        </div>
      )}

      {/* Profile count badge */}
      {!loading && profiles.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 bg-surface-1/90 backdrop-blur-lg px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
        >
          <Navigation className="w-3 h-3 text-primary" />
          {profiles.length} nearby
        </motion.div>
      )}
    </div>
  );
}
