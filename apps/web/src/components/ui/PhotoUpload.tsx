// ═══════════════════════════════════════════════════════════════
// COMPONENT: PhotoUpload — drag-and-drop / tap-to-upload photos
// ═══════════════════════════════════════════════════════════════
import { useRef, useState, useCallback } from 'react';
import { uploadFile, type StorageBucket } from '@/services/storage';
import { COLORS } from '@/types';

interface PhotoUploadProps {
  userId: string;
  bucket?: StorageBucket;
  maxFiles?: number;
  onUpload: (urls: string[]) => void;
  className?: string;
}

export function PhotoUpload({
  userId,
  bucket = 'photos',
  maxFiles = 6,
  onUpload,
  className = '',
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');
    const fileArray = Array.from(files).slice(0, maxFiles - previews.length);

    // Generate previews
    const newPreviews = fileArray.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);

    setUploading(true);
    setProgress(0);
    try {
      const urls: string[] = [];
      for (let i = 0; i < fileArray.length; i++) {
        const { url } = await uploadFile(fileArray[i], bucket, userId, { prefix: 'gallery' });
        urls.push(url);
        setProgress(Math.round(((i + 1) / fileArray.length) * 100));
      }
      onUpload(urls);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [userId, bucket, maxFiles, previews.length, onUpload]);

  const removePreview = (index: number) => {
    setPreviews(prev => {
      const next = [...prev];
      URL.revokeObjectURL(next[index]);
      next.splice(index, 1);
      return next;
    });
  };

  return (
    <div className={className}>
      {/* Preview Grid */}
      {previews.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
          {previews.map((src, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => removePreview(i)}
                style={{
                  position: 'absolute', top: 4, right: 4, width: 24, height: 24,
                  borderRadius: '50%', background: 'rgba(0,0,0,.7)', border: 'none',
                  color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div style={{ height: 3, background: COLORS.w12, borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`, background: COLORS.red,
            borderRadius: 2, transition: 'width 0.3s',
          }} />
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>{error}</p>
      )}

      {/* Upload button */}
      {previews.length < maxFiles && (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            width: '100%', padding: '14px 20px', border: `1px dashed ${COLORS.w20}`,
            background: 'transparent', color: uploading ? COLORS.w20 : COLORS.w40,
            borderRadius: 8, cursor: uploading ? 'wait' : 'pointer', fontSize: 13,
            fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {uploading ? `Uploading... ${progress}%` : `Add Photos (${previews.length}/${maxFiles})`}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}
