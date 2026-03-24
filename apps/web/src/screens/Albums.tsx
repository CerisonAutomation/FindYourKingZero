// ═══════════════════════════════════════════════════════════════
// SCREEN: Photo Albums — manage private & public photo albums
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { Images, Plus, Lock, Globe, ArrowLeft, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { useNavStore } from '@/store';
import { COLORS } from '@/types';

interface Album {
  id: string;
  name: string;
  coverUrl: string;
  photos: string[];
  isPrivate: boolean;
  photoCount: number;
}

const DEMO_ALBUMS: Album[] = [
  { id: 'a1', name: 'My Best Selfies', coverUrl: 'https://picsum.photos/300/300?u=alb1', photos: Array.from({ length: 8 }, (_, i) => `https://picsum.photos/400/400?u=a1p${i}`), isPrivate: false, photoCount: 8 },
  { id: 'a2', name: 'Gym Progress', coverUrl: 'https://picsum.photos/300/300?u=alb2', photos: Array.from({ length: 12 }, (_, i) => `https://picsum.photos/400/400?u=a2p${i}`), isPrivate: false, photoCount: 12 },
  { id: 'a3', name: 'Private Album', coverUrl: 'https://picsum.photos/300/300?u=alb3', photos: Array.from({ length: 5 }, (_, i) => `https://picsum.photos/400/400?u=a3p${i}`), isPrivate: true, photoCount: 5 },
  { id: 'a4', name: 'Travel Shots', coverUrl: 'https://picsum.photos/300/300?u=alb4', photos: Array.from({ length: 15 }, (_, i) => `https://picsum.photos/400/400?u=a4p${i}`), isPrivate: false, photoCount: 15 },
  { id: 'a5', name: 'Weekend Vibes', coverUrl: 'https://picsum.photos/300/300?u=alb5', photos: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/400/400?u=a5p${i}`), isPrivate: true, photoCount: 6 },
];

export default function AlbumsScreen() {
  const back = useNavStore((s) => s.back);
  const [albums, setAlbums] = useState<Album[]>(DEMO_ALBUMS);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrivate, setNewPrivate] = useState(false);

  const togglePrivacy = useCallback((id: string) => {
    setAlbums(prev => prev.map(a => a.id === id ? { ...a, isPrivate: !a.isPrivate } : a));
  }, []);

  const handleCreate = useCallback(() => {
    if (!newName.trim()) return;
    const newAlbum: Album = {
      id: `a${Date.now()}`,
      name: newName.trim(),
      coverUrl: `https://picsum.photos/300/300?u=new${Date.now()}`,
      photos: [],
      isPrivate: newPrivate,
      photoCount: 0,
    };
    setAlbums(prev => [newAlbum, ...prev]);
    setNewName('');
    setNewPrivate(false);
    setShowCreate(false);
  }, [newName, newPrivate]);

  const deleteAlbum = useCallback((id: string) => {
    setAlbums(prev => prev.filter(a => a.id !== id));
    setSelectedAlbum(null);
  }, []);

  // Album detail view
  if (selectedAlbum) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{
          flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#EC4899,transparent)' }} />
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
            <button onClick={() => setSelectedAlbum(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60 }}>
              <ArrowLeft size={18} />
            </button>
            <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>{selectedAlbum.name}</div>
            <button onClick={() => deleteAlbum(selectedAlbum.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#ef4444',
            }}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: COLORS.w35 }}>{selectedAlbum.photoCount} photos</div>
            <div onClick={() => togglePrivacy(selectedAlbum.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', cursor: 'pointer',
              background: selectedAlbum.isPrivate ? `${COLORS.red}12` : `${COLORS.green}12`,
              border: `1px solid ${selectedAlbum.isPrivate ? COLORS.red : COLORS.green}30`,
            }}>
              {selectedAlbum.isPrivate ? <Lock size={10} color={COLORS.red} /> : <Globe size={10} color={COLORS.green} />}
              <span style={{ fontSize: 10, fontWeight: 700, color: selectedAlbum.isPrivate ? COLORS.red : COLORS.green }}>
                {selectedAlbum.isPrivate ? 'Private' : 'Public'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
            {selectedAlbum.photos.map((p, i) => (
              <div key={i} style={{ aspectRatio: '1', overflow: 'hidden', border: `1px solid ${COLORS.w07}` }}>
                <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>

          {selectedAlbum.photos.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: COLORS.w35, fontSize: 13 }}>
              <Images size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
              <div>No photos yet</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Tap + to add photos</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#EC4899,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60 }}>
            <ArrowLeft size={18} />
          </button>
          <Images size={18} color={COLORS.pink} style={{ marginRight: 8 }} />
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Photo Albums</div>
          <button onClick={() => setShowCreate(!showCreate)} style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${COLORS.pink}15`, border: `1px solid ${COLORS.pink}40`, cursor: 'pointer',
          }}>
            {showCreate ? <X size={14} color={COLORS.pink} /> : <Plus size={14} color={COLORS.pink} />}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Create album form */}
        {showCreate && (
          <div style={{ margin: '12px 14px', padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Create New Album</div>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Album name..."
              style={{
                width: '100%', padding: '10px 14px', background: COLORS.w04,
                border: `1px solid ${COLORS.w07}`, color: '#fff', fontSize: 13,
                outline: 'none', marginBottom: 10, boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {newPrivate ? <Lock size={14} color={COLORS.red} /> : <Globe size={14} color={COLORS.green} />}
                <span style={{ fontSize: 12, color: COLORS.w60 }}>{newPrivate ? 'Private' : 'Public'}</span>
              </div>
              <div onClick={() => setNewPrivate(!newPrivate)} style={{
                width: 40, height: 22, borderRadius: 11, padding: 2,
                background: newPrivate ? COLORS.red : 'rgba(255,255,255,.15)', cursor: 'pointer',
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  transform: newPrivate ? 'translateX(18px)' : 'translateX(0)', transition: 'transform .2s',
                }} />
              </div>
            </div>
            <button onClick={handleCreate} style={{
              width: '100%', padding: '10px', background: `${COLORS.pink}15`,
              border: `1px solid ${COLORS.pink}40`, color: COLORS.pink,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
              Create Album
            </button>
          </div>
        )}

        {/* Album grid */}
        <div style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: COLORS.w35, marginBottom: 12 }}>
            {albums.length} album{albums.length !== 1 ? 's' : ''} · {albums.reduce((s, a) => s + a.photoCount, 0)} total photos
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {albums.map(a => (
              <button key={a.id} onClick={() => setSelectedAlbum(a)} style={{
                background: 'none', border: `1px solid ${COLORS.w07}`, cursor: 'pointer', textAlign: 'left', padding: 0,
              }}>
                <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden' }}>
                  <img src={a.coverUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', top: 8, right: 8, padding: '2px 8px',
                    background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)',
                  }}>
                    {a.isPrivate ? <Lock size={10} color="#fff" /> : <Globe size={10} color="#fff" />}
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,.85))',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{a.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.60)' }}>{a.photoCount} photos</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
