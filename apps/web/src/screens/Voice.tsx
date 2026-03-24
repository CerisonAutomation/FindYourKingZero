// ═══════════════════════════════════════════════════════════════
// SCREEN: Voice Commands — voice-activated navigation and actions
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useRef } from 'react';
import { Mic, MicOff, ArrowLeft, Command, Clock, Navigation, Search, MessageSquare, Heart, Calendar, Volume2 } from 'lucide-react';
import { useNavStore } from '@/store';
import { COLORS } from '@/types';

interface VoiceCommand {
  id: string;
  phrase: string;
  action: string;
  icon: string;
  category: string;
}

interface CommandHistoryItem {
  id: string;
  phrase: string;
  result: string;
  success: boolean;
  timestamp: number;
}

const COMMANDS: VoiceCommand[] = [
  { id: 'c1', phrase: '"Go to discover"', action: 'Opens discovery feed', icon: '🔍', category: 'Navigation' },
  { id: 'c2', phrase: '"Open messages"', action: 'Opens your messages', icon: '💬', category: 'Navigation' },
  { id: 'c3', phrase: '"Show events"', action: 'Opens events page', icon: '📅', category: 'Navigation' },
  { id: 'c4', phrase: '"Search for [name]"', action: 'Searches users by name', icon: '🔎', category: 'Search' },
  { id: 'c5', phrase: '"Show nearby"', action: 'Filters to nearby users', icon: '📍', category: 'Search' },
  { id: 'c6', phrase: '"Send message"', action: 'Opens message compose', icon: '✉️', category: 'Messaging' },
  { id: 'c7', phrase: '"Like profile"', action: 'Taps/likes current profile', icon: '❤️', category: 'Interaction' },
  { id: 'c8', phrase: '"Open settings"', action: 'Opens settings', icon: '⚙️', category: 'Navigation' },
  { id: 'c9', phrase: '"Show profile"', action: 'Opens your profile', icon: '👤', category: 'Navigation' },
  { id: 'c10', phrase: '"Enable travel mode"', action: 'Activates travel mode', icon: '✈️', category: 'Feature' },
];

const DEMO_HISTORY: CommandHistoryItem[] = [
  { id: 'h1', phrase: 'Go to discover', result: 'Navigated to Discover', success: true, timestamp: Date.now() - 300000 },
  { id: 'h2', phrase: 'Search for Marcus', result: 'Found 3 results', success: true, timestamp: Date.now() - 600000 },
  { id: 'h3', phrase: 'Show events', result: 'Navigated to Events', success: true, timestamp: Date.now() - 1800000 },
  { id: 'h4', phrase: 'Blorp the thing', result: 'Command not recognized', success: false, timestamp: Date.now() - 3600000 },
];

export default function VoiceScreen() {
  const back = useNavStore((s) => s.back);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState<CommandHistoryItem[]>(DEMO_HISTORY);
  const [animPhase, setAnimPhase] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (listening) {
      intervalRef.current = setInterval(() => {
        setAnimPhase(p => (p + 1) % 4);
      }, 300);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setAnimPhase(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [listening]);

  const toggleListening = useCallback(() => {
    if (listening) {
      setListening(false);
      if (transcript.trim()) {
        const success = Math.random() > 0.2;
        setHistory(prev => [{
          id: `h${Date.now()}`, phrase: transcript.trim(),
          result: success ? 'Command executed' : 'Command not recognized',
          success, timestamp: Date.now(),
        }, ...prev]);
        setTranscript('');
      }
    } else {
      setListening(true);
      setTranscript('');
      // Simulate voice recognition
      setTimeout(() => {
        const phrases = ['Go to discover', 'Show messages', 'Open events', 'Search for Alex', 'Like profile'];
        setTranscript(phrases[Math.floor(Math.random() * phrases.length)]);
      }, 2000 + Math.random() * 1500);
    }
  }, [listening, transcript]);

  const ringSize = 140 + (listening ? animPhase * 8 : 0);
  const ringOpacity = listening ? 0.15 + animPhase * 0.05 : 0.08;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#7C3AED,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60 }}>
            <ArrowLeft size={18} />
          </button>
          <Mic size={18} color={COLORS.purple} style={{ marginRight: 8 }} />
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Voice Commands</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Listening indicator */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '32px 14px', position: 'relative',
        }}>
          {/* Pulse rings */}
          {listening && [0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute', width: ringSize + i * 40, height: ringSize + i * 40,
              borderRadius: '50%', border: `2px solid ${COLORS.purple}`,
              opacity: ringOpacity - i * 0.03,
              animation: `pulse ${1.5 + i * 0.3}s ease-out infinite`,
              animationDelay: `${i * 0.2}s`,
              top: '50%', left: '50%',
              transform: `translate(-50%, -50%)`,
            }} />
          ))}

          <button onClick={toggleListening} style={{
            width: 80, height: 80, borderRadius: '50%', cursor: 'pointer',
            background: listening ? COLORS.red : `${COLORS.purple}20`,
            border: `3px solid ${listening ? COLORS.red : COLORS.purple}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .2s', zIndex: 1,
          }}>
            {listening ? <MicOff size={28} color="#fff" /> : <Mic size={28} color={COLORS.purple} />}
          </button>

          <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: listening ? COLORS.red : COLORS.w60, zIndex: 1 }}>
            {listening ? 'Listening...' : 'Tap to speak'}
          </div>

          {transcript && (
            <div style={{
              marginTop: 12, padding: '8px 20px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
              fontSize: 14, fontWeight: 600, color: '#fff', zIndex: 1,
            }}>
              "{transcript}"
            </div>
          )}
        </div>

        {/* Available commands */}
        <div style={{ margin: '8px 0 0' }}>
          <div style={{ padding: '3px 14px 6px', fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', textTransform: 'uppercase' }}>
            <Command size={11} style={{ marginRight: 6, verticalAlign: -1 }} />
            Available Commands
          </div>
          <div style={{ border: `1px solid ${COLORS.w07}`, margin: '0 12px' }}>
            {COMMANDS.map((cmd, i) => (
              <div key={cmd.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                borderBottom: i < COMMANDS.length - 1 ? `1px solid ${COLORS.w07}` : 'none',
              }}>
                <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{cmd.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.purple }}>{cmd.phrase}</div>
                  <div style={{ fontSize: 10, color: COLORS.w35 }}>{cmd.action}</div>
                </div>
                <span style={{
                  padding: '2px 8px', fontSize: 8, fontWeight: 700, color: COLORS.w35,
                  background: COLORS.w04, border: `1px solid ${COLORS.w07}`,
                }}>
                  {cmd.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Command History */}
        <div style={{ margin: '16px 0 0' }}>
          <div style={{ padding: '3px 14px 6px', fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', textTransform: 'uppercase' }}>
            <Clock size={11} style={{ marginRight: 6, verticalAlign: -1 }} />
            Recent History
          </div>
          <div style={{ border: `1px solid ${COLORS.w07}`, margin: '0 12px' }}>
            {history.map((h, i) => (
              <div key={h.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                borderBottom: i < history.length - 1 ? `1px solid ${COLORS.w07}` : 'none',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: h.success ? COLORS.green : COLORS.red,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>"{h.phrase}"</div>
                  <div style={{ fontSize: 10, color: COLORS.w35 }}>{h.result}</div>
                </div>
                <span style={{ fontSize: 9, color: COLORS.w35 }}>
                  {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '16px 14px 24px', fontSize: 10, color: COLORS.w35 }}>
          Powered by on-device Whisper + SpeechT5 · No data leaves your device
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: translate(-50%,-50%) scale(0.8); opacity: 0.3; }
          100% { transform: translate(-50%,-50%) scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
