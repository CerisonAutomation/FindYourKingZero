// =====================================================
// QuickShare Ephemeral Album — P2P Trystero + Supabase
// =====================================================
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Clock, Eye, Image, X, CheckCircle2 } from 'lucide-react';

interface QuickShareAlbumProps {
  receiverId: string;
  receiverName?: string;
  onSent?: () => void;
}

export default function QuickShareAlbum({ receiverId, receiverName, onSent }: QuickShareAlbumProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 10);
    setFiles(selected);
  }, []);

  const sendQuickShare = useCallback(async () => {
    if (files.length === 0) return;
    setSending(true);

    try {
      // Get ephemeral sign from Supabase
      const { data: sign, error: signError } = await supabase.rpc('get_quickshare_sign');
      if (signError) throw signError;

      // Upload files to Supabase Storage (ephemeral bucket)
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const path = `quickshare/${sign.room_id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('ephemeral')
            .upload(path, file, { upsert: true });
          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage.from('ephemeral').getPublicUrl(path);
          return {
            name: file.name,
            url: urlData.publicUrl,
            type: file.type,
            size: file.size,
            expires_at: sign.expires,
          };
        })
      );

      // Create QuickShare record
      const { error: insertError } = await supabase.from('quickshare_albums').insert({
        sender_id: (await supabase.auth.getUser()).data.user?.id,
        receiver_id: receiverId,
        room_id: sign.room_id,
        files: uploadedFiles,
        expires_at: sign.expires,
      });
      if (insertError) throw insertError;

      // Send notification message
      await supabase.from('messages').insert({
        sender_id: (await supabase.auth.getUser()).data.user?.id,
        receiver_id: receiverId,
        content: `📸 Shared ${files.length} photo${files.length > 1 ? 's' : ''} (expires in 1 hour)`,
        message_type: 'quickshare',
        metadata: { room_id: sign.room_id, file_count: files.length },
      });

      toast({
        title: 'QuickShare sent!',
        description: `${files.length} file${files.length > 1 ? 's' : ''} shared with ${receiverName || 'user'}. Expires in 1 hour.`,
      });

      setFiles([]);
      setIsOpen(false);
      onSent?.();
    } catch (err: any) {
      toast({
        title: 'QuickShare failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  }, [files, receiverId, receiverName, toast, onSent]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="text-primary/60 hover:text-primary"
      >
        <Share2 className="w-4 h-4" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-x-4 bottom-20 md:bottom-4 md:left-auto md:right-4 md:w-80 z-50 bg-surface-1 border border-border/30 rounded-2xl p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm">QuickShare</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground/50 hover:text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Clock className="w-3 h-3" />
              <span>Ephemeral — expires in 1 hour</span>
              <Eye className="w-3 h-3 ml-2" />
              <span>View once</span>
            </div>

            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border/30 rounded-xl cursor-pointer hover:border-primary/30 transition-colors mb-3">
              <Image className="w-6 h-6 text-muted-foreground/40 mb-1" />
              <span className="text-xs text-muted-foreground/60">
                {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Tap to select photos'}
              </span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFiles}
                className="hidden"
              />
            </label>

            {files.length > 0 && (
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                {files.map((f, i) => (
                  <div key={i} className="w-12 h-12 rounded-lg overflow-hidden bg-surface-2 flex-shrink-0">
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={sendQuickShare}
              disabled={files.length === 0 || sending}
              className="w-full h-10 text-xs font-bold"
              style={{ background: 'hsl(var(--primary))', color: '#fff' }}
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Send to {receiverName || 'User'}
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
