/**
 * 🗺️ UNIFIED MAP PROVIDER COMPONENT
 * Consolidates MapComponent, LiveLocationMap, PartyMap into single component
 * Supports multiple map modes and providers for maximum flexibility
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Navigation,
  Users,
  MapPin,
  Maximize2,
  Minimize2,
  Layers,
  Filter,
  RefreshCw,
  Activity,
  Crown,
  BadgeCheck,
  Heart,
  MessageCircle,
  Plus,
  Search
} from 'lucide-react';

// Unified Map Types
export type MapMarker  = {
  id: string;
  userId?: string;
  latitude: number;
  longitude: number;
  type: 'user' | 'event' | 'party' | 'venue' | 'custom';
  title: string;
  description: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
  lastUpdated?: string;
  metadata?: Record<string, any>;
}

export type MapBounds  = {
  north: number;
  south: number;
  east: number;
  west: number;
}

export type MapControls  = {
  showZoom?: boolean;
  showLayers?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showUserLocation?: boolean;
  allowMarkerInteraction?: boolean;
  allowClustering?: boolean;
}

export type MapMode = 'basic' | 'live' | 'events' | 'right-now' | 'party' | 'explore';
export type MapProvider = 'leaflet' | 'maplibre' | 'openstreetmap' | 'custom';

interface UnifiedMapProviderProps {
  mode: MapMode;
  provider?: MapProvider;
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  bounds?: MapBounds;
  controls?: MapControls;
  height?: string;
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onUserSelect?: (userId: string) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  onMapClick?: (lat: number, lng: number) => void;
  realtime?: boolean;
  showUserLocation?: boolean;
  enableClustering?: boolean;
  maxZoom?: number;
  minZoom?: number;
}

export function UnifiedMapProvider({
  mode = 'basic',
  provider = 'leaflet',
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 13,
  markers = [],
  bounds,
  controls = {
    showZoom: true,
    showLayers: true,
    showSearch: true,
    showFilters: true,
    showUserLocation: true,
    allowMarkerInteraction: true,
    allowClustering: false
  },
  height = '400px',
  className,
  onMarkerClick,
  onUserSelect,
  onBoundsChange,
  onMapClick,
  realtime = false,
  showUserLocation = true,
  enableClustering = false,
  maxZoom = 18,
  minZoom = 3
}: UnifiedMapProviderProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get user location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(location);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView(location, zoom);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [zoom]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || isLoaded) return;

    const initMap = async () => {
      try {
        // Dynamic import based on provider
        let mapLibrary;
        switch (provider) {
          case 'maplibre':
            mapLibrary = await import('maplibre-gl');
            break;
          case 'leaflet':
          default:
            mapLibrary = await import('leaflet');
            break;
        }

        // Initialize map based on provider
        if (provider === 'leaflet') {
          const L = mapLibrary.default;

          // Create map instance
          const map = L.map(mapRef.current).setView(center, zoom);

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom,
            minZoom
          }).addTo(map);

          // Store map instance
          mapInstanceRef.current = map;
          markersRef.current = L.layerGroup().addTo(map);

          // Event handlers
          map.on('click', (e: any) => {
            onMapClick?.(e.latlng.lat, e.latlng.lng);
          });

          map.on('moveend', () => {
            const bounds = map.getBounds();
            onBoundsChange?.({
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest()
            });
          });

          map.on('zoomend', () => {
            setCurrentZoom(map.getZoom());
          });

        } else if (provider === 'maplibre') {
          const maplibregl = mapLibrary.default;

          const map = new maplibregl.Map({
            container: mapRef.current,
            style: 'https://demotiles.maplibre.org/style.json',
            center,
            zoom,
            maxZoom,
            minZoom
          });

          mapInstanceRef.current = map;

          map.on('click', (e: any) => {
            onMapClick?.(e.lngLat.lat, e.lngLat.lng);
          });

          map.on('moveend', () => {
            const bounds = map.getBounds();
            onBoundsChange?.({
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest()
            });
          });

          map.on('zoomend', () => {
            setCurrentZoom(map.getZoom());
          });
        }

        setIsLoaded(true);

        // Get user location if requested
        if (showUserLocation) {
          getUserLocation();
        }

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();
  }, [provider, center, zoom, maxZoom, minZoom, onMapClick, onBoundsChange, showUserLocation, getUserLocation]);

  // Update markers
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !markersRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add new markers based on mode
    markers.forEach((marker) => {
      const markerElement = createMarkerElement(marker);

      if (provider === 'leaflet') {
        const L = (window as any).L;
        const leafletMarker = L.marker([marker.latitude, marker.longitude], {
          icon: L.divIcon({
            html: markerElement,
            className: 'custom-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          })
        });

        leafletMarker.on('click', () => {
          setSelectedMarker(marker);
          onMarkerClick?.(marker);
          if (marker.userId) {
            onUserSelect?.(marker.userId);
          }
        });

        markersRef.current.addLayer(leafletMarker);
      }
    });

  }, [isLoaded, markers, mode, onMarkerClick, onUserSelect]);

  // Create marker element based on type and mode
  const createMarkerElement = (marker: MapMarker): string => {
    const getIcon = () => {
      switch (marker.type) {
        case 'user':
          return mode === 'party' ? Crown : Users;
        case 'event':
          return Calendar;
        case 'party':
          return Crown;
        case 'venue':
          return MapPin;
        default:
          return MapPin;
      }
    };

    const Icon = getIcon();
    const isActive = marker.isActive || false;
    const color = marker.color || (isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))');

    return `
      <div class="custom-marker-container" style="
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div class="marker-pulse" style="
          position: absolute;
          width: 100%;
          height: 100%;
          background: ${color};
          border-radius: 50%;
          opacity: ${isActive ? '0.3' : '0'};
          animation: ${isActive ? 'pulse 2s infinite' : 'none'};
        "></div>
        <div class="marker-icon" style="
          width: 32px;
          height: 32px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid ${color};
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
            ${getIconPath(Icon)}
          </svg>
        </div>
        ${marker.metadata?.isOnline ? `
          <div class="online-indicator" style="
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            border: 2px solid white;
          "></div>
        ` : ''}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.1; }
          100% { transform: scale(1); opacity: 0.3; }
        }
      </style>
    `;
  };

  // Get icon path for SVG
  const getIconPath = (iconName: string): string => {
    const iconPaths: Record<string, string> = {
      Users: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
      Crown: 'M2 8l4-2 4 2 4-2 4 2v8H2V8Z',
      Calendar: 'M8 2v4M16 2v4M3 10h18M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z',
      MapPin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z'
    };
    return iconPaths[iconName] || iconPaths.MapPin;
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Refresh map
  const refreshMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
    if (showUserLocation) {
      getUserLocation();
    }
  };

  // Filter markers based on search
  const filteredMarkers = markers.filter(marker =>
    marker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    marker.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("relative", className)} style={{ height }}>
      {/* Map Container */}
      <div
        ref={mapRef}
        className={cn(
          "w-full h-full rounded-lg overflow-hidden",
          isFullscreen && "fixed inset-0 z-50 rounded-none"
        )}
      />

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      {isLoaded && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* Search */}
          {controls.showSearch && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="bg-white/90 backdrop-blur-sm"
            >
              <Search className="w-4 h-4" />
            </Button>
          )}

          {/* Filters */}
          {controls.showFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/90 backdrop-blur-sm"
            >
              <Filter className="w-4 h-4" />
            </Button>
          )}

          {/* Layers */}
          {controls.showLayers && (
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 backdrop-blur-sm"
            >
              <Layers className="w-4 h-4" />
            </Button>
          )}

          {/* User Location */}
          {controls.showUserLocation && (
            <Button
              variant="secondary"
              size="sm"
              onClick={getUserLocation}
              className="bg-white/90 backdrop-blur-sm"
            >
              <Navigation className="w-4 h-4" />
            </Button>
          )}

          {/* Zoom Controls */}
          {controls.showZoom && (
            <div className="flex flex-col gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleZoomIn}
                className="bg-white/90 backdrop-blur-sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleZoomOut}
                className="bg-white/90 backdrop-blur-sm"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Fullscreen */}
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-white/90 backdrop-blur-sm"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>

          {/* Refresh */}
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshMap}
            className="bg-white/90 backdrop-blur-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Search Dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search for places, users, or events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredMarkers.slice(0, 10).map((marker) => (
                <div
                  key={marker.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setView([marker.latitude, marker.longitude], 15);
                    }
                    setShowSearch(false);
                  }}
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{marker.title}</div>
                    <div className="text-sm text-muted-foreground">{marker.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Selected Marker Detail */}
      {selectedMarker && (
        <Dialog open={!!selectedMarker} onOpenChange={() => setSelectedMarker(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedMarker.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedMarker.description}</p>

              {selectedMarker.userId && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedMarker.metadata?.avatar} />
                    <AvatarFallback>
                      {selectedMarker.title.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{selectedMarker.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedMarker.metadata?.distance && `${selectedMarker.metadata.distance} away`}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {selectedMarker.metadata?.isOnline && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                    {selectedMarker.metadata?.isVerified && (
                      <BadgeCheck className="w-4 h-4 text-blue-500" />
                    )}
                    {selectedMarker.metadata?.isPremium && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (selectedMarker.userId) {
                      onUserSelect?.(selectedMarker.userId);
                    }
                    setSelectedMarker(null);
                  }}
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedMarker(null)}
                  className="flex-1"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favorite
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Map Stats */}
      {mode === 'live' && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
          <div className="text-sm font-medium">Live Map</div>
          <div className="text-xs text-muted-foreground">
            {filteredMarkers.length} users nearby
          </div>
          {realtime && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Activity className="w-3 h-3" />
              Live updates
            </div>
          )}
        </div>
      )}

      {/* Mode-specific UI */}
      {mode === 'party' && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
          <div className="text-sm font-medium flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-500" />
            Party Map
          </div>
          <div className="text-xs text-muted-foreground">
            {filteredMarkers.filter(m => m.type === 'party').length} parties
          </div>
        </div>
      )}

      {mode === 'events' && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
          <div className="text-sm font-medium">Events Map</div>
          <div className="text-xs text-muted-foreground">
            {filteredMarkers.filter(m => m.type === 'event').length} events
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Minus icon component
const Minus = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default UnifiedMapProvider;
