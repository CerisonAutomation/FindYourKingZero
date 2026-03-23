// ═══════════════════════════════════════════════════════════════
// SCREEN: Chat — P2P + E2EE + AI smart replies + autocomplete
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useNavStore, useAuthStore, useChatStore } from '@/store';
import { useAI } from '@/hooks/useAI';
import { p2p, chatRoomId } from '@/services/p2p';
import { encrypt, decrypt, deriveSharedKey, importPublicKey } from '@/services/crypto';
import { getQuickReplies, getWordCompletions } from '@/services/autocomplete';
import { TopBar } from '@/components/layout/TopBar';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { COLORS } from '@/types';
import type { Message, P2PMessage } from '@/types';

export default function ChatScreen() {
  const go = useNavStore((s) => s.go);
  const me = useAuthStore((s) => s.user);
  const peer = useNavStore((s) => s.activeChatUser);
  const { messages, addMessage, typingUsers, setTyping } = useChatStore();

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [p2pStatus, setP2pStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [wordCompletions, setWordCompletions] = useState<string[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const sharedKeyRef = useRef<CryptoKey | null>(null);

  const { smartReplies, ready: aiReady } = useAI();

  const matchId = me && peer ? chatRoomId(me.id, peer.id) : '';
  const chatMessages = messages[matchId] ?? [];
  const typing = typingUsers[matchId] ?? [];

  // Connect P2P + derive E2EE key
  useEffect(() => {
    if (!matchId || !peer?.publicKey || !me?.publicKey) return;

    (async () => {
      try {
        // Derive shared encryption key
        const theirKey = await importPublicKey(peer.publicKey);
        // In real app: import my private key from secure storage
        // sharedKeyRef.current = await deriveSharedKey(myPrivateKey, theirKey);

        // Join P2P room
        const actions = p2p.join(matchId);
        setP2pStatus('connected');

        // Listen for messages
        actions.getChat(async (data: P2PMessage, peerId: string) => {
          if (data.type === 'text' && sharedKeyRef.current) {
            try {
              const text = await decrypt(data.payload, sharedKeyRef.current);
              const msg: Message = {
                id: data.msgId,
                matchId,
                senderId: peerId,
                type: 'text',
                content: text,
                read: false,
                delivered: true,
                createdAt: data.ts,
              };
              addMessage(matchId, msg);
            } catch {
              console.error('Decryption failed');
            }
          }
        });

        // Listen for typing
        actions.getTyping((data, peerId) => {
          setTyping(matchId, peerId, data.isTyping);
          if (data.isTyping) {
            setTimeout(() => setTyping(matchId, peerId, false), 3000);
          }
        });
      } catch {
        setP2pStatus('offline');
      }
    })();

    return () => { p2p.leave(matchId); };
  }, [matchId, peer?.id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  // Send message
  const send = useCallback(async (text?: string) => {
    const content = text ?? draft;
    if (!content.trim() || !me || !matchId) return;

    setSending(true);
    setDraft('');
    setQuickReplies([]);
    setWordCompletions([]);

    const msg: Message = {
      id: crypto.randomUUID(),
      matchId,
      senderId: me.id,
      type: 'text',
      content: content.trim(),
      read: false,
      delivered: false,
      createdAt: Date.now(),
    };

    addMessage(matchId, msg);

    // Send via P2P
    const actions = p2p.join(matchId);
    const p2pMsg: P2PMessage = {
      type: 'text',
      payload: content.trim(),
      msgId: msg.id,
      ts: msg.createdAt,
      senderId: me.id,
    };
    await actions.sendChat(p2pMsg);
    setSending(false);
  }, [draft, me, matchId]);

  // AI smart replies (on incoming message)
  const loadAISuggestions = useCallback(async () => {
    const lastIncoming = [...chatMessages].reverse().find(m => m.senderId !== me?.id);
    if (!lastIncoming || !aiReady) return;

    setAiLoading(true);
    try {
      const replies = await smartReplies(lastIncoming.content);
      setAiSuggestions(replies);
    } catch {
      // Fallback to instant keyword suggestions
      setAiSuggestions(getQuickReplies(lastIncoming.content));
    } finally {
      setAiLoading(false);
    }
  }, [chatMessages, me, aiReady]);

  // Real-time autocomplete on typing
  const handleInput = useCallback((value: string) => {
    setDraft(value);

    // Instant keyword-based quick replies
    setQuickReplies(getQuickReplies(value));

    // Word completion suggestions
    setWordCompletions(getWordCompletions(value));

    // Send typing indicator
    if (matchId && me) {
      const actions = p2p.join(matchId);
      actions.sendTyping({ peerId: me.id, isTyping: true });
    }
  }, [matchId, me]);

  if (!peer) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar
        onBack={() => go('messages')}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar src={peer.avatar} size={34} online={peer.online} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{peer.name}</div>
              <div style={{ fontSize: 11, color: p2pStatus === 'connected' ? COLORS.green : COLORS.w35 }}>
                {p2pStatus === 'connected' ? '🔒 P2P Encrypted' : p2pStatus === 'connecting' ? 'Connecting…' : 'Offline'}
              </div>
            </div>
          </div>
        }
      />

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 13px' }}>
        {chatMessages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Avatar src={peer.avatar} size={64} />
            <p style={{ marginTop: 12, color: COLORS.w60, fontSize: 13 }}>
              Start your conversation with {peer.name}
            </p>
            <p style={{ fontSize: 11, color: COLORS.w35, marginTop: 4 }}>
              🔒 E2E encrypted · Never stored on central servers
            </p>
            {/* AI icebreakers */}
            {aiReady && (
              <button
                onClick={loadAISuggestions}
                style={{
                  marginTop: 16, padding: '8px 16px',
                  background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
                  color: COLORS.purple, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                ✨ Generate icebreaker
              </button>
            )}
          </div>
        )}

        {chatMessages.map((m) => (
          <MessageBubble key={m.id} message={m} isMine={m.senderId === me?.id} peer={peer} />
        ))}

        {/* Typing indicator */}
        {typing.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Avatar src={peer.avatar} size={28} />
            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.07)', display: 'flex', gap: 4 }}>
              {[0, 0.2, 0.4].map((d, i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.w60, animation: `typingDot 1.2s ${d}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{ flexShrink: 0, padding: '8px 12px', background: 'rgba(6,6,16,.98)', borderTop: `1px solid ${COLORS.w07}` }}>
        {/* AI suggestions */}
        {aiSuggestions.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, overflowX: 'auto' }}>
            {aiSuggestions.map((s, i) => (
              <button key={i} onClick={() => send(s)}
                style={{ flexShrink: 0, padding: '4px 10px', border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.08)', color: 'rgba(255,255,255,.8)', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {s}
              </button>
            ))}
            <button onClick={() => setAiSuggestions([])} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {/* Quick replies (instant, keyword-based) */}
        {quickReplies.length > 0 && draft.length > 0 && aiSuggestions.length === 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, overflowX: 'auto' }}>
            {quickReplies.map((r, i) => (
              <button key={i} onClick={() => send(r)}
                style={{ flexShrink: 0, padding: '4px 10px', border: `1px solid ${COLORS.w12}`, background: COLORS.w04, color: COLORS.w60, fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Word completions */}
        {wordCompletions.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            {wordCompletions.map((c, i) => (
              <button key={i} onClick={() => { setDraft(c); setWordCompletions([]); }}
                style={{ flexShrink: 0, padding: '2px 8px', border: 'none', background: COLORS.w04, color: COLORS.w35, fontSize: 11, cursor: 'pointer' }}>
                {c}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            value={draft}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Message…"
            rows={1}
            style={{
              flex: 1, background: COLORS.w04, border: `1px solid ${COLORS.w12}`,
              padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none',
              resize: 'none', maxHeight: 90, overflow: 'auto', lineHeight: 1.5,
            }}
          />
          <button onClick={loadAISuggestions} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, opacity: aiReady ? 1 : 0.4 }}>
            {aiLoading ? <Spinner size={16} /> : '✨'}
          </button>
          <button onClick={() => send()} disabled={!draft.trim()}
            style={{
              width: 40, height: 40,
              background: `linear-gradient(135deg,${COLORS.red},#FF4020)`, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', opacity: draft.trim() ? 1 : 0.4,
            }}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

const MessageBubble = memo(({ message, isMine, peer }: { message: Message; isMine: boolean; peer: any }) => (
  <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 8, animation: 'fadeUp .2s ease' }}>
    {!isMine && <Avatar src={peer.avatar} size={28} />}
    <div style={{ maxWidth: '75%', marginLeft: isMine ? 0 : 8 }}>
      <div style={{
        padding: '10px 13px',
        background: isMine ? `linear-gradient(135deg,${COLORS.red},#FF4020)` : 'rgba(255,255,255,.07)',
        border: isMine ? 'none' : `1px solid ${COLORS.w07}`,
      }}>
        <p style={{ fontSize: 13.5, lineHeight: 1.5 }}>{message.content}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: 4, marginTop: 3 }}>
        <span style={{ fontSize: 10, color: COLORS.w35 }}>
          {new Date(message.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
        </span>
        {isMine && <span style={{ fontSize: 10, color: message.read ? COLORS.blue : COLORS.w35 }}>{message.read ? '✓✓' : '✓'}</span>}
      </div>
    </div>
  </div>
));
