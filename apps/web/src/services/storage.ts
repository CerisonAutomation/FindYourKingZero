// ═══════════════════════════════════════════════════════════════
// SERVICE: Supabase Storage — photo uploads, avatar, chat media
// ═══════════════════════════════════════════════════════════════
import { supabase } from '@/lib/supabase';

export type StorageBucket = 'avatars' | 'photos' | 'chat-media' | 'album-covers' | 'event-covers';

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

function validateFile(file: File, bucket: StorageBucket): string | null {
  if (!ALLOWED_TYPES[bucket].includes(file.type)) {
    return `Invalid file type. Allowed: ${ALLOWED_TYPES[bucket].map(t => t.split('/')[1]).join(', ')}`;
  }
  if (file.size > BUCKET_LIMITS[bucket]) {
    return `File too large. Max: ${BUCKET_LIMITS[bucket] / 1024 / 1024}MB`;
  }
  return null;
}

function getExtension(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() || 'jpg';
}

/** Upload a file to Supabase Storage. Returns the public URL or path. */
export async function uploadFile(
  file: File,
  bucket: StorageBucket,
  userId: string,
  opts?: { prefix?: string; upsert?: boolean }
): Promise<{ path: string; url: string }> {
  const error = validateFile(file, bucket);
  if (error) throw new Error(error);

  const ext = getExtension(file);
  const timestamp = Date.now();
  const prefix = opts?.prefix ? `${opts.prefix}/` : '';
  const path = `${userId}/${prefix}${timestamp}.${ext}`;

  if (!supabase) {
    // Supabase not configured - return mock URL for demo
    console.warn('[storage] Supabase not configured, returning mock URL');
    return { 
      path, 
      url: `https://via.placeholder.com/150?text=${encodeURIComponent(file.name || 'file')}` 
    };
  }

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: opts?.upsert ?? false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  let url = '';
  if (supabase) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    url = data.publicUrl;
  } else {
    // Supabase not configured - return mock URL
    url = `https://via.placeholder.com/150?text=${encodeURIComponent(path.split('/').pop() || 'file')}`;
  }
  return { path, url };
}

/** Upload multiple files in parallel. Returns array of results. */
export async function uploadFiles(
  files: File[],
  bucket: StorageBucket,
  userId: string,
  opts?: { prefix?: string }
): Promise<{ path: string; url: string }[]> {
  return Promise.all(files.map(f => uploadFile(f, bucket, userId, opts)));
}

/** Upload avatar — replaces previous avatar for user. */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  // Delete old avatars for this user
  if (supabase) {
    const { data: existing } = await supabase.storage.from('avatars').list(userId);
    if (existing?.length) {
      await supabase.storage.from('avatars').remove(existing.map(f => `${userId}/${f.name}`));
    }
  }

  const { url } = await uploadFile(file, 'avatars', userId, { upsert: true });

  // Update profile
  if (supabase) {
    await supabase.from('profiles').update({ photo_url: url }).eq('id', userId);
  }

  return url;
}

/** Upload photo to gallery. */
export async function uploadPhoto(
  file: File,
  userId: string,
  caption?: string
): Promise<{ path: string; url: string; photoId: string }> {
  const { path, url } = await uploadFile(file, 'photos', userId, { prefix: 'gallery' });

  // Insert into photos table
  if (supabase) {
    const { data, error } = await supabase
      .from('photos')
      .insert({ user_id: userId, url, caption })
      .select('id')
      .single();

    if (error) throw error;
    return { path, url, photoId: data.id };
  } else {
    // Supabase not configured - return mock photo ID
    return { path, url, photoId: `mock-${Date.now()}` };
  }
}

/** Upload chat media. */
export async function uploadChatMedia(
  file: File,
  userId: string,
  conversationId: string
): Promise<string> {
  const { url } = await uploadFile(file, 'chat-media', userId, { prefix: conversationId });
  return url;
}

/** Delete a file from storage. */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  }
  // If supabase not configured, silently succeed for demo
}

/** Get signed URL for private files (photos, chat-media). */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn = 3600
): Promise<string> {
  if (!supabase) {
    // Supabase not configured - return the public URL as-is for demo
    return path; // For demo, just return the path as URL
  }
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

/** List files in a user's folder within a bucket. */
export async function listUserFiles(
  bucket: StorageBucket,
  userId: string,
  prefix?: string
): Promise<{ name: string; url: string; size: number; createdAt: string }[]> {
  const folder = prefix ? `${userId}/${prefix}` : userId;
  
  if (!supabase) {
    // Supabase not configured - return empty array for demo
    console.warn('[storage] Supabase not configured, returning empty file list');
    return [];
  }
  
  const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 100 });
  if (error) throw error;

  return data.map(file => {
    const fullPath = `${folder}/${file.name}`;
    let url = '';
    if (supabase) {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fullPath);
      url = urlData.publicUrl;
    } else {
      // Supabase not configured - mock URL
      url = `https://via.placeholder.com/150?text=${encodeURIComponent(file.name)}`;
    }
    return {
      name: file.name,
      url,
      size: file.metadata?.size ?? 0,
      createdAt: file.created_at ?? '',
    };
  });
}
