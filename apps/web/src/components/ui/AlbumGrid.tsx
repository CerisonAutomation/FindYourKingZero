// ═══════════════════════════════════════════════════════════════
// COMPONENT: AlbumGrid — show/hide albums on profile or in chat
// Supports: toggle visibility, share in chat, photo viewer
// ═══════════════════════════════════════════════════════════════
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/types';

interface Album {
  id: string;
  name: string;
  cover_url: string | null;
  is_private: boolean;
  photo_count: number;
  created_at: string;
  can_view: boolean;
}

interface AlbumPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  sort_order: number;
}

interface AlbumGridProps {
  userId: string;
  isOwner: boolean;
  mode: 'profile' | 'chat';
  chatPartnerId?: string;
}

export function AlbumGrid({ userId, isOwner, mode, chatPartnerId }: AlbumGridProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null);

  const loadAlbums = useCallback(async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_albums', { target_user_id: userId });
      if (error) throw error;
      setAlbums(data ?? []);
      setLoaded(true);
    } catch (e) {
      console.warn('Failed to load albums:', e);
    } finally {
      setLoading(false);
    }
  }, [userId, loaded]);

  const loadPhotos = useCallback(async (albumId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_album_photos', { album_id: albumId });
      if (error) throw error;
      setPhotos(data ?? []);
      setSelectedAlbum(albums.find(a => a.id === albumId) ?? null);
    } catch (e) {
      console.warn('Failed to load photos:', e);
    } finally {
      setLoading(false);
    }
  }, [albums]);

  const toggleVisibility = useCallback(async (albumId: string) => {
    try {
      const { data, error } = await supabase.rpc('toggle_album_visibility', { album_id: albumId });
      if (error) throw error;
      setAlbums(prev => prev.map(a =>
        a.id === albumId ? { ...a, is_private: !(data as boolean) } : a
      ));
    } catch (e) {
      console.warn('Failed to toggle visibility:', e);
    }
  }, []);

  const shareInChat = useCallback(async (albumId: string) => {
    if (!chatPartnerId) return;
    setSharing(albumId);
    try {
      const { data, error } = await supabase.rpc('share_album_in_chat', {
        album_id: albumId,
        receiver_id: chatPartnerId,
        expires_minutes: 60,
      });
      if (error) throw error;
      // Notify parent that album was shared
      return data;
    } catch (e) {
      console.warn('Failed to share album:', e);
    } finally {
      setSharing(null);
    }
  }, [chatPartnerId]);

  // Photo viewer overlay
  if (viewerIndex !== null && photos[viewerIndex]) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.95)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <button
          onClick={() => setViewerIndex(null)}
          style={{
            position: 'absolute', top: 16, right: 16, width: 40, height: 40,
            borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: 'none',
            color: '#fff', fontSize: 20, cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <img
          src={photos[viewerIndex].photo_url}
          alt={photos[viewerIndex].caption ?? ''}
          style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }}
        />

        {photos[viewerIndex].caption && (
          <p style={{ color: '#fff', fontSize: 14, marginTop: 12, textAlign: 'center' }}>
            {photos[viewerIndex].caption}
          </p>
        )}

        <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
          <button
            onClick={() => setViewerIndex(Math.max(0, viewerIndex - 1))}
            disabled={viewerIndex === 0}
            style={{
              padding: '8px 20px', background: 'rgba(255,255,255,.1)', border: 'none',
              color: '#fff', borderRadius: 6, cursor: viewerIndex === 0 ? 'default' : 'pointer',
              opacity: viewerIndex === 0 ? 0.3 : 1,
            }}
          >
            ← Prev
          </button>
          <span style={{ color: COLORS.w40, fontSize: 13, lineHeight: '36px' }}>
            {viewerIndex + 1} / {photos.length}
          </span>
          <button
            onClick={() => setViewerIndex(Math.min(photos.length - 1, viewerIndex + 1))}
            disabled={viewerIndex === photos.length - 1}
            style={{
              padding: '8px 20px', background: 'rgba(255,255,255,.1)', border: 'none',
              color: '#fff', borderRadius: 6, cursor: viewerIndex === photos.length - 1 ? 'default' : 'pointer',
              opacity: viewerIndex === photos.length - 1 ? 0.3 : 1,
            }}
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  // Photo grid inside album
  if (selectedAlbum) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => { setSelectedAlbum(null); setPhotos([]); }}
            style={{
              padding: '6px 12px', background: COLORS.w08, border: `1px solid ${COLORS.w12}`,
              color: COLORS.w60, borderRadius: 6, cursor: 'pointer', fontSize: 12,
            }}
          >
            ← Back
          </button>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{selectedAlbum.name}</h3>
          {selectedAlbum.is_private && (
            <span style={{ fontSize: 10, color: COLORS.w40, background: COLORS.w08, padding: '2px 8px', borderRadius: 4 }}>
              🔒 Private
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: COLORS.w40 }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => setViewerIndex(i)}
                style={{
                  aspectRatio: '1', overflow: 'hidden', border: 'none', padding: 0,
                  cursor: 'pointer', borderRadius: 4, background: COLORS.w08,
                }}
              >
                <img
                  src={photo.photo_url}
                  alt={photo.caption ?? ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Album list
  return (
    <div>
      {!loaded && (
        <button
          onClick={loadAlbums}
          disabled={loading}
          style={{
            width: '100%', padding: '12px 16px', background: COLORS.w08,
            border: `1px solid ${COLORS.w12}`, color: COLORS.w40, borderRadius: 8,
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}
        >
          {loading ? 'Loading...' : '📷 Show Albums'}
        </button>
      )}

      {loaded && albums.length === 0 && (
        <p style={{ color: COLORS.w30, fontSize: 13, textAlign: 'center', padding: 20 }}>
          No albums yet
        </p>
      )}

      {loaded && albums.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {albums.map(album => (
            <div
              key={album.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                background: COLORS.w06, borderRadius: 8, border: `1px solid ${COLORS.w10}`,
              }}
            >
              {/* Cover */}
              <div
                onClick={() => loadPhotos(album.id)}
                style={{
                  width: 52, height: 52, borderRadius: 6, overflow: 'hidden',
                  background: COLORS.w10, flexShrink: 0, cursor: 'pointer',
                }}
              >
                {album.cover_url ? (
                  <img src={album.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    📷
                  </div>
                )}
              </div>

              {/* Info */}
              <div onClick={() => loadPhotos(album.id)} style={{ flex: 1, cursor: 'pointer' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{album.name}</div>
                <div style={{ fontSize: 11, color: COLORS.w40, marginTop: 2 }}>
                  {album.photo_count} photo{album.photo_count !== 1 ? 's' : ''}
                  {album.is_private && ' · 🔒 Private'}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                {/* Toggle visibility (owner only) */}
                {isOwner && (
                  <button
                    onClick={() => toggleVisibility(album.id)}
                    style={{
                      padding: '6px 10px', fontSize: 11, fontWeight: 600,
                      background: album.is_private ? 'rgba(229,25,46,.1)' : 'rgba(22,163,74,.1)',
                      border: `1px solid ${album.is_private ? COLORS.red : COLORS.green}`,
                      color: album.is_private ? COLORS.red : COLORS.green,
                      borderRadius: 5, cursor: 'pointer',
                    }}
                    title={album.is_private ? 'Make public' : 'Make private'}
                  >
                    {album.is_private ? '🔒' : '🌐'}
                  </button>
                )}

                {/* Share in chat (only in chat mode with partner) */}
                {mode === 'chat' && chatPartnerId && isOwner && (
                  <button
                    onClick={() => shareInChat(album.id)}
                    disabled={sharing === album.id}
                    style={{
                      padding: '6px 10px', fontSize: 11, fontWeight: 600,
                      background: 'rgba(59,130,246,.1)', border: `1px solid ${COLORS.blue}`,
                      color: COLORS.blue, borderRadius: 5, cursor: sharing === album.id ? 'wait' : 'pointer',
                    }}
                  >
                    {sharing === album.id ? '...' : '↗ Share'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
