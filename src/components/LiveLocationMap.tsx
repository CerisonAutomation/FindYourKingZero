/**
 * LiveLocationMap — Real-time location sharing with MapLibre
 * Integrates with Supabase Realtime for live updates
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Users, 
  Eye, 
  EyeOff, 
  Settings, 
  RefreshCw,
  Locate,
  Share2,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/unified/useLocation';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { formatDistanceMiles } from '@/lib/formatters';

// MapLibre GL (dynamic import for better performance)
let maplibregl: any = null;

interface LocationShare {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  shared_with: string[];
  expires_at: string | null;
  created_at: string;
  profile?: {
    display_name: string;
    avatar_url: string | null;
    is_online: boolean;
  };
  distance?: number;
}

interface LiveLocationMapProps {
  className?: string;
  height?: string;
  showControls?: boolean;
  onUserSelect?: (userId: string) => void;
}

export function LiveLocationMap({ 
  className, 
  height = '400px',
  showControls = true,
  onUserSelect 
}: LiveLocationMapProps) {
  const { user } = useAuth();
  const { location, getCurrentPosition } = useLocation();
  const latitude = location?.latitude;
  const longitude = location?.longitude;
  const accuracy = location?.accuracy;
  
  // State
  const [isSharing, setIsSharing] = useState(false);
  const [showOthers, setShowOthers] = useState(true);
  const [locationShares, setLocationShares] = useState<LocationShare[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareDuration, setShareDuration] = useState(60); // minutes

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const userMarkerRef = useRef<any>(null);

  // Load MapLibre GL
  const loadMapLibre = useCallback(async () => {
    if (maplibregl) return maplibregl;
    
    try {
      // Dynamic import for better performance
      const maplibre = await import('maplibre-gl');
      maplibregl = maplibre.default;
      
      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
      document.head.appendChild(link);
      
      return maplibregl;
    } catch (error) {
      console.error('Failed to load MapLibre:', error);
      return null;
    }
  }, []);

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (!mapContainerRef.current || mapRef.current) return;

    const maplibre = await loadMapLibre();
    if (!maplibre) return;

    try {
      const map = new maplibre.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm-tiles',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: [longitude || -74.006, latitude || 40.7128], // Default to NYC
        zoom: 13,
        attributionControl: false
      });

      map.addControl(new maplibre.NavigationControl(), 'top-right');
      map.addControl(new maplibre.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }), 'top-left');

      map.on('load', () => {
        setMapLoaded(true);
      });

      mapRef.current = map;
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  }, [latitude, longitude, loadMapLibre]);

  // Update user location on map
  const updateUserMarker = useCallback(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([longitude, latitude]);
    } else {
      const marker = new maplibregl.Marker({
        color: '#3b82f6',
        scale: 1.2
      })
        .setLngLat([longitude, latitude])
        .setPopup(new maplibregl.Popup().setHTML('<div class="p-2"><strong>You</strong></div>'))
        .addTo(mapRef.current);

      userMarkerRef.current = marker;
    }

    // Center map on user location
    mapRef.current.flyTo({
      center: [longitude, latitude],
      zoom: 15,
      essential: true
    });
  }, [latitude, longitude]);

  // Add markers for other users
  const addOtherUserMarkers = useCallback(() => {
    if (!mapRef.current || !maplibregl) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add markers for each location share
    locationShares.forEach(share => {
      if (share.user_id === user?.id) return; // Skip own location

      const marker = new maplibregl.Marker({
        color: share.profile?.is_online ? '#10b981' : '#6b7280',
        scale: 0.8
      })
        .setLngLat([share.longitude, share.latitude])
        .setPopup(
          new maplibregl.Popup().setHTML(`
            <div class="p-2">
              <div class="flex items-center gap-2 mb-2">
                <img src="${share.profile?.avatar_url || ''}" class="w-6 h-6 rounded-full" />
                <strong>${share.profile?.display_name || 'Anonymous'}</strong>
              </div>
              <div class="text-xs text-gray-500">
                ${share.distance ? formatDistanceMiles(share.distance) : 'Distance unknown'}
              </div>
              <div class="text-xs text-gray-400 mt-1">
                ${share.profile?.is_online ? '🟢 Online' : '⚫ Offline'}
              </div>
            </div>
          `)
        )
        .addTo(mapRef.current);

      marker.getElement().addEventListener('click', () => {
        setSelectedUser(share.user_id);
        onUserSelect?.(share.user_id);
      });

      markersRef.current.set(share.user_id, marker);
    });
  }, [locationShares, user?.id, onUserSelect]);

  // Share location with Supabase
  const shareLocation = useCallback(async () => {
    if (!user || !latitude || !longitude) return;

    setIsLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + shareDuration);

      const { error } = await supabase
        .from('location_shares')
        .upsert({
          user_id: user.id,
          latitude,
          longitude,
          accuracy: accuracy || 0,
          shared_with: [], // Public sharing for now
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setIsSharing(true);
    } catch (error) {
      console.error('Failed to share location:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, latitude, longitude, accuracy, shareDuration]);

  // Stop sharing location
  const stopSharing = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('location_shares')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setIsSharing(false);
      
      // Remove user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    } catch (error) {
      console.error('Failed to stop sharing:', error);
    }
  }, [user]);

  // Load location shares from Supabase
  const loadLocationShares = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('location_shares')
        .select(`
          *,
          profile:profiles(display_name, avatar_url, is_online)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate distances
      const sharesWithDistance = (data || []).map(share => {
        let distance: number | undefined;
        
        if (latitude && longitude) {
          const R = 3959; // Earth's radius in miles
          const dLat = (share.latitude - latitude) * Math.PI / 180;
          const dLon = (share.longitude - longitude) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(latitude * Math.PI / 180) * Math.cos(share.latitude * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          distance = R * c;
        }

        return {
          ...share,
          distance
        };
      });

      setLocationShares(sharesWithDistance);
    } catch (error) {
      console.error('Failed to load location shares:', error);
    }
  }, [latitude, longitude]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('location-shares-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'location_shares'
        },
        () => {
          loadLocationShares();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadLocationShares]);

  // Initialize map on mount
  useEffect(() => {
    initializeMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initializeMap]);

  // Update markers when location shares change
  useEffect(() => {
    if (mapLoaded && showOthers) {
      addOtherUserMarkers();
    }
  }, [mapLoaded, showOthers, addOtherUserMarkers]);

  // Update user marker when location changes
  useEffect(() => {
    if (mapLoaded && latitude && longitude) {
      updateUserMarker();
    }
  }, [mapLoaded, latitude, longitude, updateUserMarker]);

  // Get current position on mount
  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  // Check if user is already sharing
  useEffect(() => {
    if (user) {
      const userShare = locationShares.find(share => share.user_id === user.id);
      setIsSharing(!!userShare);
    }
  }, [user, locationShares]);

  return (
    <div className={cn('relative', className)}>
      {/* Map container */}
      <div 
        ref={mapContainerRef}
        className="w-full rounded-lg overflow-hidden border border-border/20"
        style={{ height }}
      />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading map...</span>
          </div>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 space-y-2">
          {/* Share location toggle */}
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border/20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" />
                <Label htmlFor="share-location" className="text-sm font-medium">
                  Share Location
                </Label>
              </div>
              <Switch
                id="share-location"
                checked={isSharing}
                onCheckedChange={isSharing ? stopSharing : shareLocation}
                disabled={isLoading}
              />
            </div>
            
            {isSharing && (
              <div className="mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Sharing for {shareDuration} minutes</span>
                </div>
              </div>
            )}
          </div>

          {/* Show others toggle */}
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border/20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <Label htmlFor="show-others" className="text-sm font-medium">
                  Show Others
                </Label>
              </div>
              <Switch
                id="show-others"
                checked={showOthers}
                onCheckedChange={setShowOthers}
              />
            </div>
          </div>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              getCurrentPosition();
              loadLocationShares();
            }}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      {/* User list */}
      {showOthers && locationShares.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-border/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Nearby Users</h4>
              <Badge variant="secondary" className="text-xs">
                {locationShares.length} sharing
              </Badge>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {locationShares
                .filter(share => share.user_id !== user?.id)
                .slice(0, 5)
                .map(share => (
                  <motion.div
                    key={share.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                      selectedUser === share.user_id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted/50'
                    )}
                    onClick={() => {
                      setSelectedUser(share.user_id);
                      onUserSelect?.(share.user_id);
                      
                      // Fly to user location
                      if (mapRef.current) {
                        mapRef.current.flyTo({
                          center: [share.longitude, share.latitude],
                          zoom: 16,
                          essential: true
                        });
                      }
                    }}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={share.profile?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {share.profile?.display_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium truncate">
                          {share.profile?.display_name || 'Anonymous'}
                        </span>
                        {share.profile?.is_online && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {share.distance ? formatDistanceMiles(share.distance) : 'Distance unknown'}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUserSelect?.(share.user_id);
                      }}
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {showOthers && locationShares.length === 0 && mapLoaded && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4 border border-border/20 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No one is sharing their location nearby
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Be the first to share!
            </p>
          </div>
        </div>
      )}

      {/* Privacy notice */}
      <div className="absolute bottom-4 right-4">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 border border-border/20">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Privacy-first location sharing</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveLocationMap;
