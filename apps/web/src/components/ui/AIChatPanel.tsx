// AIChatPanel — AI-powered smart reply + toxicity panel
import { useState, type FC } from 'react';
import { useAI } from '@/hooks/useAI';
import { COLORS } from '@/types';

interface AIChatPanelProps {
  lastMessage?: string;
  onSelectReply: (reply: string) => void;
  myTribes?: string[];
  theirTribes?: string[];
}

export const AIChatPanel: FC<AIChatPanelProps> = ({
  lastMessage,
  onSelectReply,
  myTribes = [],
  theirTribes = [],
}) => {
  const ai = useAI();
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const getReplies = async () => {
    // lastMessage could be undefined — use empty string fallback, fixes TS2869 unreachable ??
    const text = lastMessage ?? '';
    if (!text && myTribes.length === 0) return;
    setLoading(true);
    try {
      const res = text
        ? await ai.smartReplies(text)
        : await ai.icebreakers(myTribes, theirTribes);
      setReplies(res);
    } catch {
      setReplies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '8px 12px', background: COLORS.bg2, borderTop: `1px solid ${COLORS.w07}` }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: replies.length > 0 ? 8 : 0 }}>
        <button
          onClick={getReplies}
          disabled={loading}
          style={{ padding: '6px 14px', background: `linear-gradient(135deg,${COLORS.purple},${COLORS.blue})`, border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? '...' : '✨ Smart Reply'}
        </button>
        {replies.length > 0 && (
          <button onClick={() => setReplies([])} style={{ background: 'none', border: 'none', color: COLORS.w35, fontSize: 11, cursor: 'pointer' }}>Clear</button>
        )}
      </div>
      {replies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {replies.map((r, i) => (
            <button
              key={i}
              onClick={() => { onSelectReply(r); setReplies([]); }}
              style={{ textAlign: 'left', padding: '7px 12px', background: COLORS.w04, border: `1px solid ${COLORS.w07}`, color: COLORS.w60, fontSize: 12, cursor: 'pointer' }}
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
