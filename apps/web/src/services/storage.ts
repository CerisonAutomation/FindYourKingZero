// ═══════════════════════════════════════════════════════════════
// SERVICE: Storage — photo uploads, avatars, chat media
//
// Dual-mode:
//   - Supabase configured → real uploads via Supabase Storage
//   - Supabase not configured → demo mock URLs (placeholder images)
//
// All public functions handle both modes internally.
// Callers never need to check supabase availability.
// ═══════════════════════════════════════════════════════════════
import { supabase } from '@/lib/supabase';

export type StorageBucket = 'avatars' | 'photos' | 'chat-media' | 'album-covers' | 'event-covers';

// ── Validation ────────────────────────────────────────────────
const BUCKET_LIMITS: Record<StorageBucket, number> = {
  'avatars': 5 * 1024 * 1024,
  'photos': 10 * 1024 * 1024,
  'chat-media': 25 * 1024 * 1024,
  'album-covers': 5 * 1024 * 1024,
  'event-covers': 5 * 1024 * 1024,
};

const ALLOWED_TYPES: Record<StorageBucket, string[]> = {
  'avatars': ['image/jpeg', 'image/png', 'image/webp'],
  'photos': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  'chat-media': ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'audio/mpeg', 'application/pdf'],
  'album-covers': ['image/jpeg', 'image/png', 'image/webp'],
  'event-covers': ['image/jpeg', 'image/png', 'image/webp'],
};

function validateFile(file: File, bucket: StorageBucket): void {
  if (!ALLOWED_TYPES[bucket].includes(file.type)) {
    const allowed = ALLOWED_TYPES[bucket].map(t => t.split('/')[1]).join(', ');
    throw new Error(`Invalid file type ${file.type}. Allowed: ${allowed}`);
  }
  if (file.size > BUCKET_LIMITS[bucket]) {
    const maxMB = BUCKET_LIMITS[bucket] / 1024 / 1024;
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: ${maxMB}MB`);
  }
}

function getExt(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() || 'jpg';
}

function mockUrl(name: string): string {
  return `https://via.placeholder.com/300x300/060610/E5192E?text=${encodeURIComponent(name)}`;
}

function buildPath(userId: string, prefix: string | undefined, file: File): string {
  const ext = getExt(file);
  const ts = Date.now();
  return `${userId}/${prefix ? `${prefix}/` : ''}${ts}.${ext}`;
}

// ── Core Upload ───────────────────────────────────────────────

/** Upload a file. Returns path + public URL. Works with or without Supabase. */
export async function uploadFile(
  file: File,
  bucket: StorageBucket,
  userId: string,
  opts?: { prefix?: string; upsert?: boolean }
): Promise<{ path: string; url: string }> {
  validateFile(file, bucket);
  const path = buildPath(userId, opts?.prefix, file);

  if (!supabase) {
    return { path, url: mockUrl(file.name) };
  }

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: opts?.upsert ?? false,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

/** Upload multiple files in parallel. */
export async function uploadFiles(
  files: File[],
  bucket: StorageBucket,
  userId: string,
  opts?: { prefix?: string }
): Promise<{ path: string; url: string }[]> {
  return Promise.all(files.map(f => uploadFile(f, bucket, userId, opts)));
}

// ── Avatar ────────────────────────────────────────────────────

/** Upload avatar — replaces previous, updates profile row. */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  if (supabase) {
    const { data: existing } = await supabase.storage.from('avatars').list(userId);
    if (existing?.length) {
      await supabase.storage.from('avatars').remove(existing.map(f => `${userId}/${f.name}`));
    }
  }

  const { url } = await uploadFile(file, 'avatars', userId, { upsert: true });

  if (supabase) {
    await supabase.from('profiles').update({ photo_url: url }).eq('id', userId);
  }

  return url;
}

// ── Gallery Photos ────────────────────────────────────────────

/** Upload a gallery photo with caption. Returns the photo record ID. */
export async function uploadPhoto(
  file: File,
  userId: string,
  caption?: string
): Promise<{ path: string; url: string; photoId: string }> {
  const { path, url } = await uploadFile(file, 'photos', userId, { prefix: 'gallery' });

  if (!supabase) {
    return { path, url, photoId: `demo-${Date.now()}` };
  }

  const { data, error } = await supabase
    .from('photos')
    .insert({ user_id: userId, url, caption })
    .select('id')
    .single();

  if (error) throw error;
  return { path, url, photoId: data.id };
}

// ── Chat Media ────────────────────────────────────────────────

/** Upload chat attachment. Returns the URL. */
export async function uploadChatMedia(
  file: File,
  userId: string,
  conversationId: string
): Promise<string> {
  const { url } = await uploadFile(file, 'chat-media', userId, { prefix: conversationId });
  return url;
}

// ── Deletion & URLs ───────────────────────────────────────────

/** Delete a file from storage. No-op if Supabase not configured. */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

/** Signed URL for private files. Falls back to path if no Supabase. */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn = 3600
): Promise<string> {
  if (!supabase) return path;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

/** List files in a user's folder. Returns empty array if no Supabase. */
export async function listUserFiles(
  bucket: StorageBucket,
  userId: string,
  prefix?: string
): Promise<{ name: string; url: string; size: number; createdAt: string }[]> {
  if (!supabase) return [];

  const folder = prefix ? `${userId}/${prefix}` : userId;
  const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 100 });
  if (error) throw error;

  return data.map(file => {
    const fullPath = `${folder}/${file.name}`;
    const { data: urlData } = supabase!.storage.from(bucket).getPublicUrl(fullPath);
    return {
      name: file.name,
      url: urlData.publicUrl,
      size: file.metadata?.size ?? 0,
      createdAt: file.created_at ?? '',
    };
  });
}
