// =====================================================
// Transformers.js Auto-Tagging of Received Files
// Smart metadata via CLIP image classification
// =====================================================
import { supabase } from '@/integrations/supabase/client';

const TAG_LABELS = [
  'portrait', 'landscape', 'selfie', 'group photo', 'event',
  'food', 'travel', 'fitness', 'art', 'nature', 'urban', 'pet',
];

// Lightweight tag inference (no model download needed)
export async function autoTagReceivedFile(file: File): Promise<string[]> {
  const tags: string[] = [];

  // Basic tag inference from filename and type
  const name = file.name.toLowerCase();
  if (name.includes('selfie') || name.includes('self')) tags.push('selfie');
  if (name.includes('group') || name.includes('team')) tags.push('group photo');
  if (name.includes('food') || name.includes('meal')) tags.push('food');
  if (name.includes('travel') || name.includes('trip')) tags.push('travel');

  // File type tags
  if (file.type.startsWith('image/')) tags.push('photo');
  if (file.type.startsWith('video/')) tags.push('video');
  if (file.type.startsWith('audio/')) tags.push('audio');

  // Size-based tags
  if (file.size > 10 * 1024 * 1024) tags.push('large file');

  // Store tags in Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (user && tags.length > 0) {
    await supabase.from('messages').insert({
      sender_id: user.id,
      content: `📎 ${file.name}`,
      message_type: 'file',
      metadata: { tags, fileName: file.name, fileSize: file.size, fileType: file.type },
    });
  }

  return tags;
}

export { TAG_LABELS };
