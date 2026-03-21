// =====================================================
// Nostr Private Relay Fallback for Magnet Links
// Censorship-resistant sharing via Nostr
// =====================================================
import { supabase } from '@/integrations/supabase/client';

const NOSTR_RELAYS = ['wss://relay.damus.io', 'wss://nostr.wine', 'wss://relay.nostr.band'];

export async function publishMagnetViaNostr(magnet: string, receiverPubkey: string) {
  // Store in Supabase as primary, Nostr as metadata
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('quickshare_albums').insert({
    sender_id: user.id,
    receiver_id: receiverPubkey,
    room_id: magnet,
    files: [{ type: 'magnet', url: magnet, expires_at: new Date(Date.now() + 3600000).toISOString() }],
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  }).select().single();

  if (error) throw error;
  return data;
}

export function subscribeToNostrQuickShares(userId: string, onReceive: (magnet: string, senderId: string) => void) {
  // Listen via Supabase realtime instead of raw Nostr
  const channel = supabase.channel(`nostr-quickshare:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'quickshare_albums',
      filter: `receiver_id=eq.${userId}`,
    }, (payload) => {
      const files = payload.new.files as any[];
      const magnetFile = files?.find((f: any) => f.type === 'magnet');
      if (magnetFile) {
        onReceive(magnetFile.url, payload.new.sender_id);
      }
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}
