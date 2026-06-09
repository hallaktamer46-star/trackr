import { useState, useEffect } from 'react'
import { Zap, Target, Shield, Flame, Brain, Wrench, Star, Compass, Loader2, RotateCcw, Sparkles, AlertTriangle, ListOrdered, Lightbulb, History, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import BackToHome from '../components/BackToHome'
import { apiFetch } from '../lib/api'
import { format } from 'date-fns'

const SESSIONS_KEY = 'trackr_roundtable_sessions'

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]') } catch { return [] }
}
function saveSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 20)))
}

const SANS = 'Geist, Inter, sans-serif'
const MONO = 'Geist Mono, monospace'

const EXPERTS = [
  { key: 'operator',     name: 'The Operator',     sub: 'Execution & results',     icon: Zap,     color: '#ff6b6b', angle: 270 },
  { key: 'strategist',   name: 'The Strategist',   sub: 'Long game & position',    icon: Target,  color: '#60a5fa', angle: 315 },
  { key: 'commander',    name: 'The Commander',    sub: 'Mission & discipline',    icon: Shield,  color: '#fbbf24', angle: 0   },
  { key: 'contrarian',   name: 'The Contrarian',   sub: 'Challenges everything',   icon: Flame,   color: '#f472b6', angle: 45  },
  { key: 'psychologist', name: 'The Psychologist', sub: "What's really going on",  icon: Brain,   color: '#a78bfa', angle: 90  },
  { key: 'builder',      name: 'The Builder',      sub: 'Build with nothing',      icon: Wrench,  color: '#4edea3', angle: 135 },
  { key: 'mentor',       name: 'The Mentor',       sub: 'Seen it before',          icon: Star,    color: '#ffb689', angle: 180 },
  { key: 'stoic',        name: 'The Stoic',        sub: 'Strip & clarify',         icon: Compass, color: '#00d4ff', angle: 225 },
]

// chair position on the circle
function chairPos(angleDeg, radius = 188) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius }
}

// ─── Expert Chair ─────────────────────────────────────────────────────────────
function ExpertChair({ expert, selected, onClick, disabled }) {
  const [hov, setHov] = useState(false)
  const [pop, setPop] = useState(false)
  const Icon = expert.icon
  const pos  = chairPos(expert.angle)

  const handleClick = () => {
    if (disabled) return
    setPop(true); setTimeout(() => setPop(false), 350)
    onClick(expert.key)
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'absolute',
        left: `calc(50% + ${pos.x}px - 48px)`,
        top:  `calc(50% + ${pos.y}px - 52px)`,
        width: 96, height: 104,
        background: selected
          ? `linear-gradient(135deg, ${expert.color}18, ${expert.color}08)`
          : hov ? `${expert.color}08` : '#0d1117',
        border: `1.5px solid ${selected ? expert.color + '80' : hov ? expert.color + '35' : 'rgba(48,54,61,0.8)'}`,
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7,
        padding: '10px 6px 8px',
        boxShadow: selected
          ? `0 0 28px ${expert.color}22, 0 0 0 1px ${expert.color}18, 0 4px 20px rgba(0,0,0,0.5)`
          : hov ? `0 6px 24px rgba(0,0,0,0.5)` : `0 2px 12px rgba(0,0,0,0.3)`,
        animation: pop ? 'chair-pop 0.35s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
        transition: 'background 0.18s, border-color 0.18s, box-shadow 0.18s',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* top glow bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${expert.color}, transparent)`,
        opacity: selected ? 1 : hov ? 0.5 : 0,
        transition: 'opacity 0.18s',
      }}/>

      {/* selected dot */}
      {selected && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          width: 14, height: 14, background: expert.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="#000" strokeWidth="1.5" strokeLinecap="square"/>
          </svg>
        </div>
      )}

      {/* icon */}
      <div style={{
        width: 38, height: 38,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: selected || hov ? `${expert.color}15` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected || hov ? expert.color + '35' : 'rgba(48,54,61,0.6)'}`,
        boxShadow: selected ? `0 0 16px ${expert.color}30` : 'none',
        transition: 'all 0.18s',
        flexShrink: 0,
      }}>
        <Icon size={16} style={{ color: selected || hov ? expert.color : '#3a4f68', transition: 'color 0.18s' }}/>
      </div>

      <span style={{
        fontFamily: SANS, fontSize: 10, fontWeight: 700,
        color: selected ? expert.color : hov ? expert.color + 'cc' : '#3a4f68',
        letterSpacing: '-0.01em', lineHeight: 1.2, textAlign: 'center',
        transition: 'color 0.18s',
      }}>
        {expert.name.replace('The ', '')}
      </span>

      <span style={{
        fontFamily: MONO, fontSize: 7, fontWeight: 600,
        color: selected ? expert.color + '99' : '#1e3050',
        letterSpacing: '0.04em', textAlign: 'center',
        lineHeight: 1.3,
        transition: 'color 0.18s',
      }}>
        {expert.sub}
      </span>
    </button>
  )
}

// ─── Response Card ────────────────────────────────────────────────────────────
function ResponseCard({ resp, index }) {
  const Icon = resp.icon
  return (
    <div style={{
      background: '#0d1117',
      border: `1.5px solid ${resp.color}30`,
      borderLeft: `3px solid ${resp.color}`,
      padding: '20px 22px',
      position: 'relative', overflow: 'hidden',
      animation: `response-in 0.45s cubic-bezier(0.22,1,0.36,1) both`,
      animationDelay: `${index * 0.08}s`,
    }}>
      {/* bg tint */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at top left, ${resp.color}06, transparent 60%)`,
        pointerEvents: 'none',
      }}/>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, position: 'relative' }}>
        <div style={{
          width: 34, height: 34, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${resp.color}15`,
          border: `1px solid ${resp.color}35`,
          boxShadow: `0 0 14px ${resp.color}20`,
        }}>
          <Icon size={15} style={{ color: resp.color }}/>
        </div>
        <div>
          <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: resp.color, letterSpacing: '-0.01em', marginBottom: 1 }}>
            {resp.expertName}
          </p>
          <p style={{ fontFamily: MONO, fontSize: 8, color: resp.color + '70', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {resp.sub}
          </p>
        </div>
      </div>

      <p style={{
        fontFamily: SANS, fontSize: 13.5, color: '#b8c8dc',
        lineHeight: 1.7, position: 'relative',
      }}>
        {resp.response}
      </p>
    </div>
  )
}

// ─── Session History Card ─────────────────────────────────────────────────────
function SessionHistoryCard({ session, onRestore, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid rgba(48,54,61,0.9)',
      marginBottom: 8,
      animation: 'response-in 0.3s ease both',
    }}>
      <div
        onClick={() => setExpanded(p => !p)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}
      >
        {/* Expert dots */}
        <div style={{ display: 'flex', gap: -4, flexShrink: 0 }}>
          {session.experts.slice(0, 4).map((eKey, i) => {
            const e = EXPERTS.find(x => x.key === eKey)
            if (!e) return null
            const Icon = e.icon
            return (
              <div key={eKey} style={{
                width: 22, height: 22,
                background: `${e.color}18`, border: `1px solid ${e.color}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginLeft: i > 0 ? -6 : 0,
              }}>
                <Icon size={10} style={{ color: e.color }}/>
              </div>
            )
          })}
          {session.experts.length > 4 && (
            <div style={{ width: 22, height: 22, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(48,54,61,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -6 }}>
              <span style={{ fontFamily: MONO, fontSize: 8, color: '#4a6080' }}>+{session.experts.length - 4}</span>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SANS, fontSize: 12, color: '#8090a8', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session.problem}
          </p>
          <p style={{ fontFamily: MONO, fontSize: 9, color: '#2a4060', marginTop: 3, letterSpacing: '0.04em' }}>
            {format(new Date(session.createdAt), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {expanded
            ? <ChevronUp size={13} style={{ color: '#2a4060' }}/>
            : <ChevronDown size={13} style={{ color: '#2a4060' }}/>}
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(48,54,61,0.7)', padding: '16px 16px 12px' }}>
          {/* Expert responses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            {session.responses.map(r => {
              const e = EXPERTS.find(x => x.key === r.expertKey)
              if (!e) return null
              const Icon = e.icon
              return (
                <div key={r.expertKey} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, background: `${e.color}15`, border: `1px solid ${e.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={11} style={{ color: e.color }}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: MONO, fontSize: 9, color: e.color, fontWeight: 700, marginBottom: 4, letterSpacing: '0.04em' }}>{r.expertName}</p>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: '#8090a8', lineHeight: 1.6 }}>{r.response}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Synthesis */}
          {session.synthesis && (
            <div style={{ background: 'rgba(163,201,255,0.03)', border: '1px solid rgba(163,201,255,0.1)', padding: '12px 14px', marginBottom: 12 }}>
              <p style={{ fontFamily: MONO, fontSize: 8, color: '#a3c9ff', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Synthesis</p>
              <p style={{ fontFamily: SANS, fontSize: 12, color: '#8090a8', lineHeight: 1.6, marginBottom: 10 }}>{session.synthesis.core_truth}</p>
              {session.synthesis.action_plan?.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 5 }}>
                  <div style={{ width: 16, height: 16, background: ['#60a5fa','#4edea3','#a78bfa'][i] || '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 800, color: '#000' }}>{i+1}</span>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 11, color: '#6070a0', lineHeight: 1.5 }}>{step}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onRestore(session)} style={{
              flex: 1, padding: '7px 12px', background: 'rgba(163,201,255,0.06)', border: '1px solid rgba(163,201,255,0.15)', cursor: 'pointer',
              fontFamily: MONO, fontSize: 10, fontWeight: 600, color: '#a3c9ff', letterSpacing: '0.06em',
            }}>
              VIEW FULL
            </button>
            <button onClick={() => onDelete(session.id)} style={{
              width: 32, height: 32, background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trash2 size={12} style={{ color: '#ff6b6b' }}/>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RoundTable() {
  const [selected, setSelected]   = useState(new Set())
  const [problem, setProblem]     = useState('')
  const [phase, setPhase]         = useState('setup')   // 'setup' | 'running' | 'done'
  const [responses, setResponses] = useState([])
  const [synthesis, setSynthesis] = useState(null)
  const [error, setError]         = useState('')
  const [sessions, setSessions]   = useState(() => loadSessions())
  const [showHistory, setShowHistory] = useState(false)

  // Persist sessions whenever they change
  useEffect(() => { saveSessions(sessions) }, [sessions])

  const toggleExpert = (key) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const convene = async () => {
    if (selected.size < 2 || !problem.trim()) return
    setPhase('running')
    setResponses([])
    setSynthesis(null)
    setError('')

    const seated = EXPERTS.filter(e => selected.has(e.key))

    // Fire all expert calls in parallel — display each as it lands
    const promises = seated.map(async (expert) => {
      try {
        const res  = await apiFetch('/api/ai/roundtable/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problem, expertKey: expert.key }),
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Server error ${res.status}`)
        }
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        const entry = { expertKey: expert.key, expertName: expert.name, response: data.response, color: expert.color, icon: expert.icon, sub: expert.sub }
        setResponses(prev => [...prev, entry])
        return { expertKey: expert.key, expertName: expert.name, response: data.response }
      } catch (err) {
        const entry = { expertKey: expert.key, expertName: expert.name, response: `[Failed to respond: ${err.message}]`, color: EXPERTS.find(e=>e.key===expert.key)?.color || '#666', icon: expert.icon, sub: expert.sub }
        setResponses(prev => [...prev, entry])
        return { expertKey: expert.key, expertName: expert.name, response: `[Error: ${err.message}]` }
      }
    })

    const all = await Promise.all(promises)

    let synthData = null
    // Synthesis
    try {
      const synthRes  = await apiFetch('/api/ai/roundtable/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, responses: all }),
      })
      if (!synthRes.ok) throw new Error(`Server error ${synthRes.status}`)
      synthData = await synthRes.json()
      if (synthData.error) throw new Error(synthData.error)
      setSynthesis(synthData)
    } catch (err) {
      setError(err.message)
    }

    // Save session to localStorage
    const newSession = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      problem,
      experts: [...selected],
      responses: all.map(r => ({ expertKey: r.expertKey, expertName: r.expertName, response: r.response })),
      synthesis: synthData,
    }
    setSessions(prev => [newSession, ...prev])

    setPhase('done')
  }

  const reset = () => {
    setPhase('setup'); setSelected(new Set())
    setProblem(''); setResponses([]); setSynthesis(null); setError('')
  }

  const restoreSession = (session) => {
    setSelected(new Set(session.experts))
    setProblem(session.problem)
    // Rehydrate responses with icon/color from EXPERTS
    const rehydrated = session.responses.map(r => {
      const e = EXPERTS.find(x => x.key === r.expertKey)
      return { ...r, color: e?.color || '#666', icon: e?.icon || Zap, sub: e?.sub || '' }
    })
    setResponses(rehydrated)
    setSynthesis(session.synthesis)
    setPhase('done')
    setError('')
    setShowHistory(false)
  }

  const deleteSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  const canConvene = selected.size >= 2 && problem.trim().length > 0 && phase === 'setup'
  const seatedCount = selected.size

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', fontFamily: SANS, padding: '28px 24px 80px' }}>
      <style>{`
        @keyframes chair-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.1); }
          70%  { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        @keyframes response-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes synthesis-in {
          from { opacity: 0; transform: translateY(28px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes table-pulse {
          0%, 100% { box-shadow: 0 0 60px rgba(163,201,255,0.06), inset 0 0 40px rgba(163,201,255,0.03); }
          50%       { box-shadow: 0 0 90px rgba(163,201,255,0.12), inset 0 0 60px rgba(163,201,255,0.06); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <BackToHome />

        {/* ── Page title ── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px 5px 10px',
            background: 'rgba(163,201,255,0.06)',
            border: '1px solid rgba(163,201,255,0.15)',
            marginBottom: 16,
          }}>
            <Sparkles size={12} style={{ color: '#a3c9ff' }}/>
            <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: '#a3c9ff', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              AI Round Table
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 12px',
            background: 'linear-gradient(135deg, #ffffff 0%, #a3c9ff 45%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            The Round Table
          </h1>

          <p style={{ fontSize: 14, color: '#4a6080', letterSpacing: '-0.01em', margin: '0 0 16px' }}>
            {phase === 'setup'
              ? 'Choose your council. One problem. Every angle.'
              : phase === 'running'
              ? 'The council is deliberating…'
              : 'The council has spoken.'}
          </p>

          {/* History toggle */}
          {sessions.length > 0 && (
            <button
              onClick={() => setShowHistory(p => !p)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '6px 14px',
                background: showHistory ? 'rgba(163,201,255,0.08)' : 'transparent',
                border: `1px solid ${showHistory ? 'rgba(163,201,255,0.25)' : 'rgba(48,54,61,0.8)'}`,
                cursor: 'pointer', transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(163,201,255,0.25)' }}
              onMouseLeave={e => { if (!showHistory) e.currentTarget.style.borderColor = 'rgba(48,54,61,0.8)' }}
            >
              <History size={12} style={{ color: showHistory ? '#a3c9ff' : '#2a4060' }}/>
              <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: showHistory ? '#a3c9ff' : '#2a4060', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {sessions.length} Past Session{sessions.length !== 1 ? 's' : ''}
              </span>
            </button>
          )}
        </div>

        {/* ── History panel ── */}
        {showHistory && (
          <div style={{ marginBottom: 32 }}>
            {sessions.map(s => (
              <SessionHistoryCard
                key={s.id}
                session={s}
                onRestore={restoreSession}
                onDelete={deleteSession}
              />
            ))}
          </div>
        )}

        {/* ══ SETUP PHASE ══ */}
        {phase === 'setup' && (
          <>
            {/* ── The table ── */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
              <div style={{ position: 'relative', width: 540, height: 540, flexShrink: 0 }}>

                {/* Table surface */}
                <div style={{
                  position: 'absolute',
                  left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 260, height: 260,
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at 40% 35%, #1a2540 0%, #111824 45%, #090e16 100%)',
                  border: '1.5px solid rgba(163,201,255,0.12)',
                  boxShadow: '0 0 60px rgba(163,201,255,0.06), inset 0 0 40px rgba(163,201,255,0.03), 0 20px 60px rgba(0,0,0,0.6)',
                  animation: 'table-pulse 4s ease-in-out infinite',
                  zIndex: 0,
                }}>
                  {/* Compass ring */}
                  <div style={{
                    position: 'absolute', inset: 16,
                    borderRadius: '50%',
                    border: '0.5px solid rgba(163,201,255,0.06)',
                  }}/>
                  <div style={{
                    position: 'absolute', inset: 32,
                    borderRadius: '50%',
                    border: '0.5px solid rgba(163,201,255,0.04)',
                  }}/>

                  {/* Cross lines */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', width: '70%', height: '0.5px', background: 'linear-gradient(90deg, transparent, rgba(163,201,255,0.07), transparent)' }}/>
                    <div style={{ position: 'absolute', width: '0.5px', height: '70%', background: 'linear-gradient(180deg, transparent, rgba(163,201,255,0.07), transparent)' }}/>
                  </div>

                  {/* Center label */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}>
                    {seatedCount === 0 ? (
                      <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(163,201,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.6, padding: '0 24px' }}>
                        Select your<br/>council
                      </span>
                    ) : (
                      <>
                        <span style={{
                          fontFamily: MONO, fontSize: 28, fontWeight: 900,
                          background: 'linear-gradient(135deg, #a3c9ff, #a78bfa)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                          lineHeight: 1,
                        }}>{seatedCount}</span>
                        <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(163,201,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          {seatedCount === 1 ? 'expert' : 'experts'} seated
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Chair cards */}
                {EXPERTS.map(expert => (
                  <ExpertChair
                    key={expert.key}
                    expert={expert}
                    selected={selected.has(expert.key)}
                    onClick={toggleExpert}
                    disabled={false}
                  />
                ))}
              </div>
            </div>

            {/* ── Input area ── */}
            <div style={{ maxWidth: 620, margin: '0 auto' }}>
              <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 20, background: 'linear-gradient(135deg, #a3c9ff, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, color: '#000' }}>?</span>
                </div>
                <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: '#4a6080' }}>
                  What's your situation, decision, or challenge?
                </span>
              </div>

              <div style={{ background: '#10151c', border: '1.5px solid rgba(48,54,61,0.9)', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: 'linear-gradient(90deg, #a3c9ff, #a78bfa, #a3c9ff00)',
                  opacity: problem.length > 0 ? 1 : 0, transition: 'opacity 0.3s',
                }}/>
                <textarea
                  value={problem}
                  onChange={e => setProblem(e.target.value)}
                  placeholder="Be specific. The more precise you are, the sharper the council's advice will be. Business, personal, idea, decision — anything."
                  rows={5}
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    resize: 'vertical', fontFamily: SANS, fontSize: 14, color: '#c8d8f0',
                    lineHeight: 1.65, padding: '16px 18px', boxSizing: 'border-box',
                    minHeight: 120,
                  }}
                />
                <div style={{ padding: '0 18px 10px', textAlign: 'right', fontFamily: MONO, fontSize: 10, color: '#1e3050' }}>
                  {problem.length} chars
                </div>
              </div>

              {/* Validation hints */}
              <div style={{ display: 'flex', gap: 12, marginTop: 10, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, background: seatedCount >= 2 ? '#4edea3' : '#1e3050' }}/>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: seatedCount >= 2 ? '#4edea3' : '#1e3050', letterSpacing: '0.06em' }}>
                    {seatedCount >= 2 ? `${seatedCount} experts seated` : 'Select at least 2 experts'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, background: problem.trim().length > 0 ? '#4edea3' : '#1e3050' }}/>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: problem.trim().length > 0 ? '#4edea3' : '#1e3050', letterSpacing: '0.06em' }}>
                    {problem.trim().length > 0 ? 'Situation entered' : 'Describe your situation'}
                  </span>
                </div>
              </div>

              {/* Convene button */}
              <button
                onClick={convene}
                disabled={!canConvene}
                style={{
                  width: '100%', padding: '16px 24px',
                  background: canConvene
                    ? 'linear-gradient(135deg, #1a3360 0%, #1e1b4b 50%, #1a3360 100%)'
                    : '#0d1117',
                  border: `1.5px solid ${canConvene ? 'rgba(163,201,255,0.3)' : 'rgba(48,54,61,0.5)'}`,
                  cursor: canConvene ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  position: 'relative', overflow: 'hidden',
                  boxShadow: canConvene ? '0 0 40px rgba(163,201,255,0.12), 0 4px 24px rgba(0,0,0,0.4)' : 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (canConvene) e.currentTarget.style.filter = 'brightness(1.15)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
              >
                {canConvene && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                    pointerEvents: 'none',
                  }}/>
                )}
                <Sparkles size={17} style={{ color: canConvene ? '#a3c9ff' : '#1e3050' }}/>
                <span style={{
                  fontFamily: SANS, fontSize: 15, fontWeight: 700,
                  color: canConvene ? '#e2e8f0' : '#1e3050',
                  letterSpacing: '-0.02em',
                }}>
                  Convene the Table
                </span>
              </button>
            </div>
          </>
        )}

        {/* ══ RUNNING / DONE PHASE ══ */}
        {(phase === 'running' || phase === 'done') && (
          <>
            {/* Mini table header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 20px',
              background: '#0d1117',
              border: '1px solid rgba(163,201,255,0.1)',
              marginBottom: 28,
            }}>
              {/* Seated avatars */}
              <div style={{ display: 'flex', gap: -4 }}>
                {EXPERTS.filter(e => selected.has(e.key)).map((e, i) => {
                  const Icon = e.icon
                  return (
                    <div key={e.key} style={{
                      width: 28, height: 28,
                      background: `${e.color}18`,
                      border: `1.5px solid ${e.color}50`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginLeft: i > 0 ? -8 : 0,
                      boxShadow: `0 0 10px ${e.color}20`,
                    }}>
                      <Icon size={12} style={{ color: e.color }}/>
                    </div>
                  )
                })}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: MONO, fontSize: 9, color: '#3a6090', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                  {selected.size} experts · Round Table Session
                </p>
                <p style={{ fontFamily: SANS, fontSize: 12, color: '#6080a0', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {problem}
                </p>
              </div>
              {phase === 'running' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <Loader2 size={14} style={{ color: '#a3c9ff', animation: 'spin 0.9s linear infinite' }}/>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: '#3a6090', letterSpacing: '0.06em' }}>
                    {responses.length}/{selected.size}
                  </span>
                </div>
              )}
            </div>

            {/* Response cards grid */}
            {responses.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 14,
                marginBottom: 20,
              }}>
                {responses.map((resp, i) => (
                  <ResponseCard key={resp.expertKey} resp={resp} index={i}/>
                ))}
              </div>
            )}

            {/* Loading placeholders */}
            {phase === 'running' && responses.length < selected.size && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 14,
                marginBottom: 20,
              }}>
                {Array.from({ length: selected.size - responses.length }).map((_, i) => (
                  <div key={i} style={{
                    background: '#0d1117',
                    border: '1.5px solid rgba(48,54,61,0.5)',
                    borderLeft: '3px solid rgba(48,54,61,0.8)',
                    padding: '20px 22px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <Loader2 size={16} style={{ color: '#1e3050', animation: 'spin 1s linear infinite', flexShrink: 0 }}/>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: '#1e3050', letterSpacing: '0.06em' }}>Thinking…</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Synthesis ── */}
            {synthesis && (
              <div style={{
                background: '#0d1117',
                border: '1.5px solid rgba(163,201,255,0.2)',
                position: 'relative', overflow: 'hidden',
                marginBottom: 28,
                animation: 'synthesis-in 0.55s cubic-bezier(0.22,1,0.36,1) both',
              }}>
                {/* gradient top bar */}
                <div style={{
                  height: 2,
                  background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #4edea3, #ffb689)',
                }}/>

                {/* bg glow */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'radial-gradient(ellipse at top center, rgba(163,201,255,0.04), transparent 60%)',
                  pointerEvents: 'none',
                }}/>

                <div style={{ padding: '22px 26px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 20 }}>
                    <div style={{
                      width: 32, height: 32,
                      background: 'linear-gradient(135deg, rgba(163,201,255,0.15), rgba(167,139,250,0.15))',
                      border: '1px solid rgba(163,201,255,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Sparkles size={15} style={{ color: '#a3c9ff' }}/>
                    </div>
                    <div>
                      <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, color: '#a3c9ff', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        Synthesis
                      </span>
                      <p style={{ fontFamily: MONO, fontSize: 8, color: '#2a4060', letterSpacing: '0.06em', marginTop: 1 }}>
                        The table's unified verdict
                      </p>
                    </div>
                  </div>

                  {/* Core truth */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                      <Lightbulb size={13} style={{ color: '#fbbf24', flexShrink: 0 }}/>
                      <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, color: '#fbbf24', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Core Truth</span>
                    </div>
                    <p style={{
                      fontFamily: SANS, fontSize: 15, fontWeight: 600,
                      color: '#e2e8f0', lineHeight: 1.65,
                      borderLeft: '2px solid #fbbf2450', paddingLeft: 14,
                    }}>
                      {synthesis.core_truth}
                    </p>
                  </div>

                  {/* Action plan */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                      <ListOrdered size={13} style={{ color: '#4edea3', flexShrink: 0 }}/>
                      <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, color: '#4edea3', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Action Plan</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {synthesis.action_plan?.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          <div style={{
                            width: 24, height: 24, flexShrink: 0,
                            background: ['#60a5fa', '#4edea3', '#a78bfa'][i] || '#60a5fa',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginTop: 1,
                          }}>
                            <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 800, color: '#000' }}>{i + 1}</span>
                          </div>
                          <p style={{ fontFamily: SANS, fontSize: 13.5, color: '#b8c8dc', lineHeight: 1.6, flex: 1 }}>{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warning */}
                  <div style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '12px 16px',
                    background: 'rgba(255,107,107,0.06)',
                    border: '1px solid rgba(255,107,107,0.2)',
                  }}>
                    <AlertTriangle size={14} style={{ color: '#ff6b6b', flexShrink: 0, marginTop: 1 }}/>
                    <p style={{ fontFamily: SANS, fontSize: 13, color: '#b8c8dc', lineHeight: 1.55 }}>
                      <span style={{ color: '#ff6b6b', fontWeight: 700 }}>Watch out: </span>
                      {synthesis.warning}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', marginBottom: 20, fontFamily: MONO, fontSize: 12, color: '#ff6b6b' }}>
                {error}
              </div>
            )}

            {/* New session */}
            {phase === 'done' && (
              <button
                onClick={reset}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid rgba(48,54,61,0.9)',
                  cursor: 'pointer', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(163,201,255,0.35)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(48,54,61,0.9)'}
              >
                <RotateCcw size={14} style={{ color: '#3a6090' }}/>
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: '#3a6090', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  New Session
                </span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
