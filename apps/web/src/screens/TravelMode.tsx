// ═══════════════════════════════════════════════════════════════
// SCREEN: Travel Mode — browse from a different city
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { Plane, MapPin, Calendar, Search, ArrowLeft, Check, X } from 'lucide-react';
import { useNavStore } from '@/store';
import { COLORS } from '@/types';

const POPULAR_CITIES = [
  { name: 'New York', country: 'USA', emoji: '🗽' },
  { name: 'London', country: 'UK', emoji: '🇬🇧' },
  { name: 'Paris', country: 'France', emoji: '🇫🇷' },
  { name: 'Berlin', country: 'Germany', emoji: '🇩🇪' },
  { name: 'Barcelona', country: 'Spain', emoji: '🇪🇸' },
  { name: 'Amsterdam', country: 'Netherlands', emoji: '🇳🇱' },
  { name: 'Sydney', country: 'Australia', emoji: '🇦🇺' },
  { name: 'Tokyo', country: 'Japan', emoji: '🇯🇵' },
];

export default function TravelModeScreen() {
  const back = useNavStore((s) => s.back);
  const [enabled, setEnabled] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<typeof POPULAR_CITIES[0] | null>(null);
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');

  const filtered = POPULAR_CITIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectCity = useCallback((city: typeof POPULAR_CITIES[0]) => {
    setSelectedCity(city);
    setSearch('');
  }, []);

  const handleActivate = useCallback(() => {
    if (selectedCity && arrivalDate && departureDate) {
      setEnabled(true);
    }
  }, [selectedCity, arrivalDate, departureDate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0, background: 'rgba(6,6,16,0.97)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${COLORS.w07}`, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,#D97706,transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 52 }}>
          <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginRight: 6, color: COLORS.w60 }}>
            <ArrowLeft size={18} />
          </button>
          <Plane size={18} color={COLORS.yellow} style={{ marginRight: 8 }} />
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Travel Mode</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Active badge preview */}
        {enabled && selectedCity && (
          <div style={{
            margin: '12px 14px', padding: '16px', background: `${COLORS.yellow}08`,
            border: `1px solid ${COLORS.yellow}25`, textAlign: 'center',
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: `${COLORS.yellow}15`, border: `1px solid ${COLORS.yellow}40`, marginBottom: 10 }}>
              <Plane size={12} color={COLORS.yellow} />
              <span style={{ fontSize: 11, fontWeight: 800, color: COLORS.yellow, textTransform: 'uppercase', letterSpacing: '.08em' }}>Travel Mode Active</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{selectedCity.emoji} {selectedCity.name}</div>
            <div style={{ fontSize: 12, color: COLORS.w60 }}>{selectedCity.country}</div>
            <div style={{ fontSize: 11, color: COLORS.w35, marginTop: 8 }}>
              {arrivalDate} - {departureDate}
            </div>
            <button onClick={() => setEnabled(false)} style={{
              marginTop: 12, padding: '8px 24px', background: 'rgba(239,68,68,.08)',
              border: '1px solid rgba(239,68,68,.25)', color: '#ef4444',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
              <X size={12} style={{ marginRight: 6, verticalAlign: -1 }} />
              Deactivate
            </button>
          </div>
        )}

        {!enabled && (
          <>
            {/* Toggle */}
            <div style={{
              margin: '12px 14px', padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${COLORS.yellow}12`, border: `1px solid ${COLORS.yellow}30`,
              }}>
                <Plane size={16} color={COLORS.yellow} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Travel Mode</div>
                <div style={{ fontSize: 11, color: COLORS.w35 }}>Browse and match from another city before you arrive</div>
              </div>
              <div onClick={() => {}} style={{
                width: 40, height: 22, borderRadius: 11, padding: 2,
                background: 'rgba(255,255,255,.15)', cursor: 'pointer',
              }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff' }} />
              </div>
            </div>

            {/* City search */}
            <div style={{ margin: '12px 14px 0' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 8, textTransform: 'uppercase' }}>
                <MapPin size={11} style={{ marginRight: 6, verticalAlign: -1 }} />
                Select Destination
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, marginBottom: 8,
              }}>
                <Search size={14} color={COLORS.w35} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search cities..."
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13 }}
                />
              </div>
              {filtered.map(c => (
                <button key={c.name} onClick={() => handleSelectCity(c)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  width: '100%', background: selectedCity?.name === c.name ? `${COLORS.yellow}08` : 'transparent',
                  border: `1px solid ${selectedCity?.name === c.name ? COLORS.yellow + '30' : COLORS.w07}`,
                  cursor: 'pointer', marginBottom: 6, textAlign: 'left',
                }}>
                  <span style={{ fontSize: 20 }}>{c.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.w35 }}>{c.country}</div>
                  </div>
                  {selectedCity?.name === c.name && <Check size={16} color={COLORS.yellow} />}
                </button>
              ))}
            </div>

            {/* Date pickers */}
            {selectedCity && (
              <div style={{ margin: '16px 14px 0' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.w35, letterSpacing: '.14em', marginBottom: 8, textTransform: 'uppercase' }}>
                  <Calendar size={11} style={{ marginRight: 6, verticalAlign: -1 }} />
                  Travel Dates
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: COLORS.w35, marginBottom: 4 }}>Arrival</label>
                    <input type="date" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)} style={{
                      width: '100%', padding: '10px 12px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
                      color: '#fff', fontSize: 13, outline: 'none',
                    }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: COLORS.w35, marginBottom: 4 }}>Departure</label>
                    <input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} style={{
                      width: '100%', padding: '10px 12px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`,
                      color: '#fff', fontSize: 13, outline: 'none',
                    }} />
                  </div>
                </div>

                {/* Preview */}
                <div style={{
                  padding: '14px', background: COLORS.bg1, border: `1px solid ${COLORS.w07}`, textAlign: 'center', marginBottom: 16,
                }}>
                  <div style={{ fontSize: 11, color: COLORS.w35, marginBottom: 6 }}>Badge Preview</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: `${COLORS.yellow}15`, border: `1px solid ${COLORS.yellow}40` }}>
                    <Plane size={10} color={COLORS.yellow} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: COLORS.yellow }}>✈ {selectedCity.name}</span>
                  </div>
                </div>

                <button onClick={handleActivate} style={{
                  width: '100%', padding: '14px', background: `${COLORS.yellow}15`,
                  border: `1px solid ${COLORS.yellow}40`, color: COLORS.yellow,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}>
                  <Plane size={14} style={{ marginRight: 8, verticalAlign: -2 }} />
                  Activate Travel Mode
                </button>
              </div>
            )}
          </>
        )}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
