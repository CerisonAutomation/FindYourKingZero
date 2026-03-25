// ═══════════════════════════════════════════════════════════════
// SCREEN: AI Coaching — Full AI assistant with voice, suggestions, tips
// Replaces basic Voice screen with comprehensive AI coaching panel
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, Brain, Clock, Lightbulb, List, MessageSquare, Mic, MicOff, Send, Sparkles, Target, TrendingUp, Zap } from 'lucide-react';
import { useNavStore, useAuthStore } from '@/store';
import { COLORS } from '@/types';

// ─── Types ───
interface CoachingTip {
  id: string;
  category: 'profile' | 'conversation' | 'photo' | 'safety';
  title: string;
  text: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

interface QuickReply {
  id: string;
  text: string;
  tone: 'friendly' | 'flirty' | 'witty' | 'sincere';
}

interface VoiceCommand {
  id: string;
  phrase: string;
  action: string;
  category: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

// ─── Data ───
const COACHING_TIPS: CoachingTip[] = [
  { id: 't1', category: 'profile', title: 'Add a bio', text: 'Profiles with bios get 4x more engagement. Be authentic and specific.', icon: '✍️', priority: 'high' },
  { id: 't2', category: 'photo', title: 'First photo matters', text: 'Clear face shots get 10x more taps. Natural light is your best friend.', icon: 'X', priority: 'high' },
  { id: 't3', category: 'conversation', title: 'Ask open questions', text: 'Instead of "hey", try asking about something specific in their profile.', icon: '', priority: 'medium' },
  { id: 't4', category: 'profile', title: 'Update your tribes', text: 'You selected 2 tribes. Profiles with 3+ tribes get 2x more matches.', icon: '🏷️', priority: 'medium' },
  { id: 't5', category: 'safety', title: 'Verify your profile', text: 'Verified profiles get 3x more trust and engagement from other kings.', icon: '✅', priority: 'high' },
  { id: 't6', category: 'conversation', title: 'Response time', text: 'Responding within 1 hour shows genuine interest and keeps momentum.', icon: '⏰', priority: 'low' },
  { id: 't7', category: 'photo', title: 'Add variety', text: 'Mix of face, full body, and activity photos tells a complete story.', icon: '🎨', priority: 'medium' },
  { id: 't8', category: 'profile', title: 'Show your interests', text: 'Mention specific hobbies — "gym rat" beats "I like working out".', icon: '', priority: 'low' },
];

const QUICK_REPLIES: QuickReply[] = [
  { id: 'q1', text: "Hey! I noticed we have a lot in common 😊", tone: 'friendly' },
  { id: 'q2', text: "Your profile caught my eye — what's your story?", tone: 'flirty' },
  { id: 'q3', text: "Finally someone with taste! What's the last concert you went to?", tone: 'witty' },
  { id: 'q4', text: "I'd love to get to know you better. What are you up to this weekend?", tone: 'sincere' },
  { id: 'q5', text: "That photo at [place] looks amazing — was it recent?", tone: 'friendly' },
  { id: 'q6', text: "I have a feeling we'd have great conversations. Coffee sometime?", tone: 'sincere' },
];

const VOICE_COMMANDS: VoiceCommand[] = [
  { id: 'v1', phrase: '"Go to discover"', action: 'Opens discovery feed', category: 'Navigation' },
  { id: 'v2', phrase: '"Open messages"', action: 'Opens your messages', category: 'Navigation' },
  { id: 'v3', phrase: '"Show events"', action: 'Opens events page', category: 'Navigation' },
  { id: 'v4', phrase: '"Search for [name]"', action: 'Searches users by name', category: 'Search' },
  { id: 'v5', phrase: '"Like profile"', action: 'Taps/likes current profile', category: 'Action' },
  { id: 'v6', phrase: '"Profile tips"', action: 'Shows AI coaching tips', category: 'AI' },
  { id: 'v7', phrase: '"Suggest reply"', action: 'Generates a conversation starter', category: 'AI' },
  { id: 'v8', phrase: '"Analyze profile"', action: 'AI profile review', category: 'AI' },
];

const CATEGORY_COLORS: Record<string, string> = {
  profile: COLORS.blue,
  conversation: COLORS.green,
  photo: COLORS.yellow,
  safety: COLORS.red,
};

const TONE_COLORS: Record<string, string> = {
  friendly: COLORS.blue,
  flirty: COLORS.red,
  witty: COLORS.yellow,
  sincere: COLORS.green,
};

// ─── Main Component ───
export default function VoiceScreen() {
  const back = useNavStore((s) => s.back);
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<'coach' | 'voice' | 'replies'>('coach');
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [animPhase, setAnimPhase] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'm1', role: 'ai', text: "Hey King! I'm your AI coach. I can help you improve your profile, craft better conversations, and get more matches. What would you like help with?", timestamp: Date.now() - 60000 },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [tipsDismissed, setTipsDismissed] = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listening) {
      intervalRef.current = setInterval(() => setAnimPhase(p => (p + 1) % 4), 300);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setAnimPhase(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [listening]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const toggleListening = useCallback(() => {
    if (listening) {
      setListening(false);
      if (transcript.trim()) {
        // Simulate AI response
        const responses = [
          "Great question! I'd suggest focusing on your bio — profiles with authentic bios get 4x more engagement. Want me to help you write one?",
          "Based on your profile, adding more photos would really help. Aim for 4-6 with a mix of face and activity shots.",
          "I can help with that! Try asking open-ended questions about something specific in their profile. It shows genuine interest.",
          "Voice commands are working perfectly! Try saying 'profile tips' or 'suggest reply' for AI-powered help.",
        ];
        setChatMessages(prev => [
          ...prev,
          { id: `u${Date.now()}`, role: 'user', text: transcript.trim(), timestamp: Date.now() },
          { id: `a${Date.now()}`, role: 'ai', text: responses[Math.floor(Math.random() * responses.length)], timestamp: Date.now() + 500 },
        ]);
        setTranscript('');
      }
    } else {
      setListening(true);
      setTranscript('');
      setTimeout(() => {
        const phrases = ['How can I improve my profile?', 'Suggest a conversation starter', 'What are my best photos?', 'Help me get more matches'];
        setTranscript(phrases[Math.floor(Math.random() * phrases.length)]);
      }, 2000 + Math.random() * 1500);
    }
  }, [listening, transcript]);

  const sendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    const responses = [
      "That's a solid approach! I'd also recommend being specific — mention a hobby or interest from their profile. Specificity shows you actually read it.",
      "Good thinking! Your response rate could improve by 30% with personalized openers. Want me to analyze a specific profile?",
      "Here's a pro tip: the best conversations start with genuine curiosity. Ask about something they clearly care about. 💡",
      "I've analyzed your patterns — you do best with witty openers. Here's one: 'I see you're into [interest]. Bold choice. I respect that.' 😏",
    ];
    setChatMessages(prev => [
      ...prev,
      { id: `u${Date.now()}`, role: 'user', text: chatInput.trim(), timestamp: Date.now() },
      { id: `a${Date.now()}`, role: 'ai', text: responses[Math.floor(Math.random() * responses.length)], timestamp: Date.now() + 800 },
    ]);
    setChatInput('');
  }, [chatInput]);

  const dismissTip = useCallback((id: string) => {
    setTipsDismissed(prev => new Set([...prev, id]));
  }, []);

  const ringSize = 120 + (listening ? animPhase * 6 : 0);
  const activeTips = COACHING_TIPS.filter(t => !tipsDismissed.has(t.id));

  // ─── Styles ───
  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 11, fontWeight: 700, color: active ? COLORS.red : COLORS.w35,
    borderBottom: active ? `2px solid ${COLORS.red}` : '2px solid transparent',
    letterSpacing: '.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  });

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
          <Brain size={18} color="#7C3AED" style={{ marginRight: 8 }} />
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>AI Coach</div>
          <div style={{ padding: '3px 9px', background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.3)' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#7C3AED' }}>BETA</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${COLORS.w07}`, padding: '0 14px' }}>
        <button onClick={() => setActiveTab('coach')} style={tabStyle(activeTab === 'coach')}>
          <Sparkles size={13} /> Coach
        </button>
        <button onClick={() => setActiveTab('voice')} style={tabStyle(activeTab === 'voice')}>
          <Mic size={13} /> Voice
        </button>
        <button onClick={() => setActiveTab('replies')} style={tabStyle(activeTab === 'replies')}>
          <MessageSquare size={13} /> Replies
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* ─── Tab: Coach (Tips + Chat) ─── */}
        {activeTab === 'coach' && (
          <>
            {/* AI Chat */}
            <div style={{ padding: '12px 14px', maxHeight: 240, overflowY: 'auto', borderBottom: `1px solid ${COLORS.w07}` }}>
              {chatMessages.map(msg => (
                <div key={msg.id} style={{
                  display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10,
                }}>
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px',
                    background: msg.role === 'user' ? `${COLORS.red}15` : COLORS.bg1,
                    border: `1px solid ${msg.role === 'user' ? COLORS.red + '30' : COLORS.w07}`,
                    fontSize: 13, lineHeight: 1.5, color: msg.role === 'user' ? '#fff' : COLORS.w60,
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div style={{
              display: 'flex', gap: 8, padding: '10px 14px',
              borderBottom: `1px solid ${COLORS.w07}`,
            }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Ask your AI coach anything…"
                style={{
                  flex: 1, background: COLORS.w04, border: `1px solid ${COLORS.w12}`,
                  padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none',
                }} />
              <button onClick={sendChat} style={{
                padding: '10px 14px', background: '#7C3AED', border: 'none',
                color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
              }}>
                <Send size={14} />
              </button>
            </div>

            {/* Coaching tips */}
            <div style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 10, textTransform: 'uppercase' }}>
                <Target size={11} style={{ marginRight: 6, verticalAlign: -1 }} />
                Personalized Tips ({activeTips.length})
              </div>
              {activeTips.map(tip => (
                <div key={tip.id} style={{
                  display: 'flex', gap: 12, padding: '12px 14px', background: COLORS.bg1,
                  border: `1px solid ${COLORS.w07}`, marginBottom: 8, alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0 }}>{tip.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{tip.title}</span>
                      <span style={{
                        padding: '1px 6px', fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
                        color: CATEGORY_COLORS[tip.category], background: `${CATEGORY_COLORS[tip.category]}15`,
                        border: `1px solid ${CATEGORY_COLORS[tip.category]}30`,
                      }}>{tip.category}</span>
                      {tip.priority === 'high' && (
                        <span style={{ fontSize: 8, fontWeight: 700, color: COLORS.red }}>HIGH</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.w60, lineHeight: 1.4 }}>{tip.text}</div>
                  </div>
                  <button onClick={() => dismissTip(tip.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: COLORS.w20,
                  }}>✕</button>
                </div>
              ))}
            </div>

            {/* Profile score */}
            <div style={{ margin: '0 14px 16px', padding: '16px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  <TrendingUp size={14} color="#7C3AED" style={{ marginRight: 6, verticalAlign: -2 }} />
                  Profile Score
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.yellow }}>72/100</div>
              </div>
              <div style={{ height: 4, background: COLORS.w07, marginBottom: 12 }}>
                <div style={{ height: '100%', width: '72%', background: `linear-gradient(90deg,${COLORS.red},${COLORS.yellow})`, transition: 'width .5s' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'Photos', score: 3, max: 4, color: COLORS.green },
                  { label: 'Bio', score: 1, max: 3, color: COLORS.red },
                  { label: 'Tribes', score: 2, max: 3, color: COLORS.yellow },
                  { label: 'Verify', score: 0, max: 1, color: COLORS.red },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.score}/{s.max}</div>
                    <div style={{ fontSize: 9, color: COLORS.w35 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ─── Tab: Voice ─── */}
        {activeTab === 'voice' && (
          <>
            {/* Mic button */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '32px 14px', position: 'relative',
            }}>
              {listening && [0, 1, 2].map(i => (
                <div key={i} style={{
                  position: 'absolute', width: ringSize + i * 30, height: ringSize + i * 30,
                  borderRadius: '50%', border: `2px solid #7C3AED`,
                  opacity: 0.15 - i * 0.03,
                  animation: `pulse ${1.5 + i * 0.3}s ease-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                  top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                }} />
              ))}
              <button onClick={toggleListening} style={{
                width: 76, height: 76, borderRadius: '50%', cursor: 'pointer',
                background: listening ? COLORS.red : 'rgba(124,58,237,.15)',
                border: `3px solid ${listening ? COLORS.red : '#7C3AED'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', zIndex: 1,
              }}>
                {listening ? <MicOff size={26} color="#fff" /> : <Mic size={26} color="#7C3AED" />}
              </button>
              <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: listening ? COLORS.red : COLORS.w60, zIndex: 1 }}>
                {listening ? 'Listening...' : 'Tap to speak'}
              </div>
              {transcript && (
                <div style={{
                  marginTop: 12, padding: '8px 20px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
                  fontSize: 14, fontWeight: 600, color: '#fff', zIndex: 1,
                }}>"{transcript}"</div>
              )}
            </div>

            {/* Voice commands */}
            <div style={{ margin: '0 0 8px' }}>
              <div style={{ padding: '3px 14px 6px', fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', textTransform: 'uppercase' }}>
                <Zap size={11} style={{ marginRight: 6, verticalAlign: -1 }} />
                Voice Commands
              </div>
              <div style={{ border: `1px solid ${COLORS.w07}`, margin: '0 12px' }}>
                {VOICE_COMMANDS.map((cmd, i) => (
                  <div key={cmd.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderBottom: i < VOICE_COMMANDS.length - 1 ? `1px solid ${COLORS.w07}` : 'none',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#7C3AED' }}>{cmd.phrase}</div>
                      <div style={{ fontSize: 10, color: COLORS.w35 }}>{cmd.action}</div>
                    </div>
                    <span style={{
                      padding: '2px 8px', fontSize: 8, fontWeight: 700, color: COLORS.w35,
                      background: COLORS.w04, border: `1px solid ${COLORS.w07}`,
                    }}>{cmd.category}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice history */}
            <div style={{ margin: '12px 0 0' }}>
              <div style={{ padding: '3px 14px 6px', fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', textTransform: 'uppercase' }}>
                <Clock size={11} style={{ marginRight: 6, verticalAlign: -1 }} />
                Recent
              </div>
              <div style={{ border: `1px solid ${COLORS.w07}`, margin: '0 12px' }}>
                {[
                  { phrase: 'Profile tips', result: 'Showing 8 tips', success: true, time: '2m ago' },
                  { phrase: 'Go to discover', result: 'Navigated', success: true, time: '15m ago' },
                  { phrase: 'Blorp thing', result: 'Not recognized', success: false, time: '1h ago' },
                ].map((h, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderBottom: i < 2 ? `1px solid ${COLORS.w07}` : 'none',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: h.success ? COLORS.green : COLORS.red, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>"{h.phrase}"</div>
                      <div style={{ fontSize: 10, color: COLORS.w35 }}>{h.result}</div>
                    </div>
                    <span style={{ fontSize: 9, color: COLORS.w35 }}>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ─── Tab: Quick Replies ─── */}
        {activeTab === 'replies' && (
          <>
            <div style={{ padding: '12px 14px' }}>
              <div style={{
                padding: '14px', background: 'rgba(124,58,237,.06)', border: '1px solid rgba(124,58,237,.18)', marginBottom: 16,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED', marginBottom: 4 }}>
                  <Lightbulb size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                  Smart Replies
                </div>
                <div style={{ fontSize: 12, color: COLORS.w60, lineHeight: 1.5 }}>
                  AI-generated conversation starters based on your profile and match compatibility. Tap to copy.
                </div>
              </div>

              <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 10, textTransform: 'uppercase' }}>Conversation Starters</div>
              {QUICK_REPLIES.map(reply => (
                <button key={reply.id} onClick={() => navigator.clipboard?.writeText(reply.text)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 8,
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{reply.text}</div>
                    <span style={{
                      padding: '1px 6px', fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
                      color: TONE_COLORS[reply.tone], background: `${TONE_COLORS[reply.tone]}15`,
                      border: `1px solid ${TONE_COLORS[reply.tone]}30`,
                    }}>{reply.tone}</span>
                  </div>
                  <span style={{ fontSize: 16, color: COLORS.w20 }}><List size={16} /></span>
                </button>
              ))}
            </div>

            {/* Conversation tips */}
            <div style={{ padding: '0 14px 16px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 10, textTransform: 'uppercase' }}>Conversation Tips</div>
              {[
                { tip: 'Respond within 1 hour to show interest', icon: '' },
                { tip: 'Ask about specific things in their profile', icon: '' },
                { tip: 'Avoid one-word answers — elaborate!', icon: '' },
                { tip: "Use humor — it's the #1 trait people look for", icon: '' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 6,
                }}>
                  <div style={{
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${COLORS.yellow}12`, border: `1px solid ${COLORS.yellow}30`,
                  }}>{item.icon}</div>
                  <div style={{ fontSize: 12, color: COLORS.w60, flex: 1 }}>{item.tip}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ textAlign: 'center', padding: '12px 14px 24px', fontSize: 10, color: COLORS.w35 }}>
          Powered by on-device Phi-3 Mini + Whisper · No data leaves your device
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
