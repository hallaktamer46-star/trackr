import { useState, useEffect } from 'react'
import { Zap, Target, Shield, Flame, Brain, Wrench, Star, Compass, Loader2, RotateCcw, Sparkles, AlertTriangle, ListOrdered, Lightbulb, History, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import BackToHome from '../components/BackToHome'
import { apiFetch } from '../lib/api'
import { format } from 'date-fns'

const SESSIONS_KEY = 'trackr_roundtable_sessions'
function loadSessions() { try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]') } catch { return [] } }
function saveSessions(s) { localStorage.setItem(SESSIONS_KEY, JSON.stringify(s.slice(0, 20))) }

const SANS = "'Plus Jakarta Sans', system-ui, sans-serif"
const MONO = 'Consolas, Menlo, Monaco, monospace'

// Parse bullet text → array of clean strings
function parseBullets(text) {
  if (!text) return []
  return text
    .split('\n')
    .map(l => l.trim().replace(/^[•\-\*]\s*/, '').trim())
    .filter(Boolean)
}

const EXPERTS = [
  { key: 'operator',     name: 'The Operator',     sub: 'Execution & results',    icon: Zap,     color: '#ff6b6b', angle: 270 },
  { key: 'strategist',   name: 'The Strategist',   sub: 'Long game & position',   icon: Target,  color: '#60a5fa', angle: 315 },
  { key: 'commander',    name: 'The Commander',    sub: 'Mission & discipline',   icon: Shield,  color: '#fbbf24', angle: 0   },
  { key: 'contrarian',   name: 'The Contrarian',   sub: 'Challenges everything',  icon: Flame,   color: '#f472b6', angle: 45  },
  { key: 'psychologist', name: 'The Psychologist', sub: "What's really going on", icon: Brain,   color: '#a78bfa', angle: 90  },
  { key: 'builder',      name: 'The Builder',      sub: 'Build with nothing',     icon: Wrench,  color: '#4edea3', angle: 135 },
  { key: 'mentor',       name: 'The Mentor',       sub: 'Seen it before',         icon: Star,    color: '#ffb689', angle: 180 },
  { key: 'stoic',        name: 'The Stoic',        sub: 'Strip & clarify',        icon: Compass, color: '#00d4ff', angle: 225 },
]

function chairPos(angleDeg, radius = 192) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius }
}

// ─── Expert Chair ──────────────────────────────────────────────────────────────
function ExpertChair({ expert, selected, onClick }) {
  const [hov, setHov] = useState(false)
  const [pop, setPop] = useState(false)
  const Icon = expert.icon
  const pos  = chairPos(expert.angle)

  const handleClick = () => {
    setPop(true); setTimeout(() => setPop(false), 380)
    onClick(expert.key)
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'absolute',
        left: `calc(50% + ${pos.x}px - 48px)`,
        top:  `calc(50% + ${pos.y}px - 54px)`,
        width: 96, height: 108,
        background: selected
          ? `linear-gradient(145deg, ${expert.color}20, ${expert.color}08, #080d18)`
          : hov ? `${expert.color}0a` : '#080d18',
        border: `1.5px solid ${selected ? expert.color + '90' : hov ? expert.color + '50' : 'rgba(30,60,160,0.3)'}`,
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7,
        padding: '10px 6px 8px',
        boxShadow: selected
          ? `0 0 32px ${expert.color}28, 0 0 64px ${expert.color}10, 0 0 0 1px ${expert.color}20, 0 8px 24px rgba(0,0,0,0.6)`
          : hov
          ? `0 0 20px ${expert.color}18, 0 6px 24px rgba(0,0,0,0.5)`
          : '0 2px 12px rgba(0,0,0,0.4)',
        animation: pop ? 'chair-pop 0.38s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Top glow bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${expert.color}, transparent)`,
        opacity: selected ? 1 : hov ? 0.6 : 0,
        transition: 'opacity 0.2s',
      }}/>

      {/* Bottom shimmer on hover */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${expert.color}60, transparent)`,
        opacity: selected ? 0.5 : hov ? 0.3 : 0,
        transition: 'opacity 0.2s',
      }}/>

      {/* Check badge */}
      {selected && (
        <div style={{
          position: 'absolute', top: 5, right: 5,
          width: 15, height: 15, background: expert.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 10px ${expert.color}80`,
        }}>
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="#000" strokeWidth="1.5" strokeLinecap="square"/>
          </svg>
        </div>
      )}

      {/* Icon circle */}
      <div style={{
        width: 40, height: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: selected ? `${expert.color}1a` : hov ? `${expert.color}10` : 'rgba(30,60,160,0.12)',
        border: `1px solid ${selected ? expert.color + '50' : hov ? expert.color + '30' : 'rgba(30,60,160,0.25)'}`,
        boxShadow: selected ? `0 0 20px ${expert.color}35` : hov ? `0 0 12px ${expert.color}18` : 'none',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}>
        <Icon size={17}
          style={{ color: selected ? expert.color : hov ? expert.color + 'cc' : '#2a50a8', transition: 'color 0.2s' }}
        />
      </div>

      <span style={{
        fontFamily: SANS, fontSize: 10, fontWeight: 700,
        color: selected ? expert.color : hov ? expert.color + 'dd' : '#2a50a8',
        letterSpacing: '-0.01em', lineHeight: 1.2, textAlign: 'center',
        transition: 'color 0.2s',
      }}>
        {expert.name.replace('The ', '')}
      </span>

      <span style={{
        fontFamily: MONO, fontSize: 7, fontWeight: 600,
        color: selected ? expert.color + 'aa' : hov ? expert.color + '55' : '#142050',
        letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.3,
        transition: 'color 0.2s',
      }}>
        {expert.sub}
      </span>
    </button>
  )
}

// ─── Bullet list renderer ──────────────────────────────────────────────────────
function BulletList({ text, color, animate = false }) {
  const bullets = parseBullets(text)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {bullets.map((line, i) => (
        <div key={i} style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          animation: animate ? `bullet-in 0.35s cubic-bezier(0.22,1,0.36,1) both` : 'none',
          animationDelay: animate ? `${i * 0.07}s` : '0s',
        }}>
          <div style={{
            width: 20, height: 20, flexShrink: 0, marginTop: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${color}18`,
            border: `1px solid ${color}40`,
            boxShadow: `0 0 8px ${color}20`,
          }}>
            <div style={{ width: 5, height: 5, background: color, boxShadow: `0 0 6px ${color}` }}/>
          </div>
          <p style={{
            fontFamily: SANS, fontSize: 13.5, fontWeight: 500,
            color: '#c8dcff', lineHeight: 1.6, flex: 1,
            letterSpacing: '-0.005em',
          }}>
            {line}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── Response Card ─────────────────────────────────────────────────────────────
function ResponseCard({ resp, index }) {
  const Icon = resp.icon
  return (
    <div style={{
      background: `linear-gradient(145deg, ${resp.color}06, #0a1020 60%)`,
      border: `1.5px solid ${resp.color}35`,
      borderTop: `2px solid ${resp.color}`,
      padding: '20px 22px',
      position: 'relative', overflow: 'hidden',
      animation: `response-in 0.45s cubic-bezier(0.22,1,0.36,1) both`,
      animationDelay: `${index * 0.08}s`,
      boxShadow: `0 0 40px ${resp.color}0a, 0 4px 20px rgba(0,0,0,0.4)`,
    }}>
      {/* corner glow */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 100, height: 100, borderRadius: '50%',
        background: `radial-gradient(circle, ${resp.color}12, transparent 70%)`,
        pointerEvents: 'none',
      }}/>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16, position: 'relative' }}>
        <div style={{
          width: 36, height: 36, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${resp.color}18`,
          border: `1.5px solid ${resp.color}50`,
          boxShadow: `0 0 18px ${resp.color}30, inset 0 0 12px ${resp.color}08`,
        }}>
          <Icon size={16} style={{ color: resp.color }}/>
        </div>
        <div>
          <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: resp.color, letterSpacing: '-0.02em', marginBottom: 2, textShadow: `0 0 20px ${resp.color}60` }}>
            {resp.expertName}
          </p>
          <p style={{ fontFamily: MONO, fontSize: 8, color: resp.color + '70', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {resp.sub}
          </p>
        </div>
      </div>

      <BulletList text={resp.response} color={resp.color} animate={true}/>
    </div>
  )
}

// ─── Loading Card ──────────────────────────────────────────────────────────────
function LoadingCard({ expert }) {
  const Icon = expert.icon
  return (
    <div style={{
      background: `linear-gradient(145deg, ${expert.color}04, #0a1020)`,
      border: `1.5px solid ${expert.color}20`,
      borderTop: `2px solid ${expert.color}40`,
      padding: '20px 22px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(90deg, transparent 0%, ${expert.color}06 50%, transparent 100%)`,
        animation: 'shimmer-sweep 1.6s ease-in-out infinite',
        pointerEvents: 'none',
      }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${expert.color}10`,
          border: `1.5px solid ${expert.color}30`,
        }}>
          <Icon size={16} style={{ color: expert.color + '80' }}/>
        </div>
        <div>
          <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: expert.color + '80', letterSpacing: '-0.02em', marginBottom: 2 }}>
            {expert.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Loader2 size={10} style={{ color: expert.color + '70', animation: 'spin 0.9s linear infinite' }}/>
            <span style={{ fontFamily: MONO, fontSize: 8, color: expert.color + '60', letterSpacing: '0.08em' }}>DELIBERATING…</span>
          </div>
        </div>
      </div>
      {[80, 60, 70].map((w, i) => (
        <div key={i} style={{
          height: 10, background: `${expert.color}12`,
          border: `1px solid ${expert.color}15`,
          marginBottom: 8, width: `${w}%`,
          animation: `pulse-bar 1.4s ease-in-out ${i * 0.2}s infinite`,
        }}/>
      ))}
    </div>
  )
}

// ─── History Card ──────────────────────────────────────────────────────────────
function SessionHistoryCard({ session, onRestore, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{
      background: '#080d18',
      border: '1px solid rgba(40,80,200,0.25)',
      marginBottom: 8,
      animation: 'response-in 0.3s ease both',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(60,120,255,0.4)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(40,80,200,0.25)'}
    >
      <div
        onClick={() => setExpanded(p => !p)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}
      >
        {/* Expert dots */}
        <div style={{ display: 'flex', flexShrink: 0 }}>
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
                boxShadow: `0 0 8px ${e.color}20`,
              }}>
                <Icon size={10} style={{ color: e.color }}/>
              </div>
            )
          })}
          {session.experts.length > 4 && (
            <div style={{ width: 22, height: 22, background: 'rgba(40,80,200,0.12)', border: '1px solid rgba(40,80,200,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -6 }}>
              <span style={{ fontFamily: MONO, fontSize: 8, color: '#3a70d0' }}>+{session.experts.length - 4}</span>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SANS, fontSize: 12, color: '#6090d8', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session.problem}
          </p>
          <p style={{ fontFamily: MONO, fontSize: 9, color: '#2a4898', marginTop: 3, letterSpacing: '0.04em' }}>
            {format(new Date(session.createdAt), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>

        {expanded
          ? <ChevronUp size={13} style={{ color: '#3a70d0', flexShrink: 0 }}/>
          : <ChevronDown size={13} style={{ color: '#2a4898', flexShrink: 0 }}/>}
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(40,80,200,0.2)', padding: '16px 16px 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 }}>
            {session.responses.map(r => {
              const e = EXPERTS.find(x => x.key === r.expertKey)
              if (!e) return null
              const Icon = e.icon
              return (
                <div key={r.expertKey} style={{
                  background: `${e.color}06`,
                  border: `1px solid ${e.color}25`,
                  padding: '12px 14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 22, height: 22, background: `${e.color}18`, border: `1px solid ${e.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={11} style={{ color: e.color }}/>
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: 9, color: e.color, fontWeight: 700, letterSpacing: '0.06em' }}>{r.expertName}</span>
                  </div>
                  <BulletList text={r.response} color={e.color} animate={false}/>
                </div>
              )
            })}
          </div>

          {session.synthesis && (
            <div style={{ background: 'rgba(40,80,200,0.06)', border: '1px solid rgba(60,120,255,0.2)', padding: '12px 14px', marginBottom: 12 }}>
              <p style={{ fontFamily: MONO, fontSize: 8, color: '#a3c9ff', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Synthesis</p>
              <p style={{ fontFamily: SANS, fontSize: 12, color: '#7ab0e8', lineHeight: 1.6, marginBottom: 10 }}>{session.synthesis.core_truth}</p>
              {session.synthesis.action_plan?.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ width: 16, height: 16, background: ['#60a5fa','#4edea3','#a78bfa'][i] || '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 800, color: '#000' }}>{i+1}</span>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 11, color: '#5080c8', lineHeight: 1.5 }}>{step}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onRestore(session)} style={{
              flex: 1, padding: '8px 12px',
              background: 'linear-gradient(135deg, rgba(40,80,200,0.15), rgba(100,60,200,0.15))',
              border: '1px solid rgba(80,140,255,0.3)',
              cursor: 'pointer',
              fontFamily: MONO, fontSize: 10, fontWeight: 700, color: '#a3c9ff', letterSpacing: '0.08em',
              transition: 'all 0.18s',
            }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              VIEW FULL SESSION
            </button>
            <button onClick={() => onDelete(session.id)} style={{
              width: 34, height: 34, background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.18s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,107,107,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,107,107,0.2)' }}
            >
              <Trash2 size={13} style={{ color: '#ff6b6b' }}/>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function RoundTable() {
  const [selected, setSelected]       = useState(new Set())
  const [problem, setProblem]         = useState('')
  const [phase, setPhase]             = useState('setup')
  const [responses, setResponses]     = useState([])
  const [synthesis, setSynthesis]     = useState(null)
  const [error, setError]             = useState('')
  const [sessions, setSessions]       = useState(() => loadSessions())
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => { saveSessions(sessions) }, [sessions])

  const toggleExpert = (key) => {
    setSelected(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  const convene = async () => {
    if (selected.size < 2 || !problem.trim()) return
    setPhase('running'); setResponses([]); setSynthesis(null); setError('')

    const seated = EXPERTS.filter(e => selected.has(e.key))

    const promises = seated.map(async (expert) => {
      try {
        const res  = await apiFetch('/api/ai/roundtable/respond', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problem, expertKey: expert.key }),
        })
        if (!res.ok) throw new Error(`Server error ${res.status}`)
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        const entry = { expertKey: expert.key, expertName: expert.name, response: data.response, color: expert.color, icon: expert.icon, sub: expert.sub }
        setResponses(prev => [...prev, entry])
        return { expertKey: expert.key, expertName: expert.name, response: data.response }
      } catch (err) {
        const fallback = `• Unable to respond: ${err.message}`
        const entry = { expertKey: expert.key, expertName: expert.name, response: fallback, color: expert.color, icon: expert.icon, sub: expert.sub }
        setResponses(prev => [...prev, entry])
        return { expertKey: expert.key, expertName: expert.name, response: fallback }
      }
    })

    const all = await Promise.all(promises)

    let synthData = null
    try {
      const sr = await apiFetch('/api/ai/roundtable/synthesize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, responses: all }),
      })
      if (!sr.ok) throw new Error(`Server error ${sr.status}`)
      synthData = await sr.json()
      if (synthData.error) throw new Error(synthData.error)
      setSynthesis(synthData)
    } catch (err) {
      setError(err.message)
    }

    setSessions(prev => [{
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      problem,
      experts: [...selected],
      responses: all.map(r => ({ expertKey: r.expertKey, expertName: r.expertName, response: r.response })),
      synthesis: synthData,
    }, ...prev])

    setPhase('done')
  }

  const reset = () => {
    setPhase('setup'); setSelected(new Set()); setProblem(''); setResponses([]); setSynthesis(null); setError('')
  }

  const restoreSession = (session) => {
    setSelected(new Set(session.experts))
    setProblem(session.problem)
    setResponses(session.responses.map(r => {
      const e = EXPERTS.find(x => x.key === r.expertKey)
      return { ...r, color: e?.color || '#60a5fa', icon: e?.icon || Zap, sub: e?.sub || '' }
    }))
    setSynthesis(session.synthesis)
    setPhase('done'); setError(''); setShowHistory(false)
  }

  const deleteSession = (id) => setSessions(prev => prev.filter(s => s.id !== id))

  const canConvene = selected.size >= 2 && problem.trim().length > 0 && phase === 'setup'
  const seatedCount = selected.size

  // Which experts are still loading
  const respondedKeys = new Set(responses.map(r => r.expertKey))
  const pendingExperts = phase === 'running'
    ? EXPERTS.filter(e => selected.has(e.key) && !respondedKeys.has(e.key))
    : []

  return (
    <div style={{ minHeight: '100vh', background: '#060b14', fontFamily: SANS, padding: '28px 24px 100px' }}>
      <style>{`
        @keyframes chair-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.12); }
          70%  { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes response-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bullet-in {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes synthesis-in {
          from { opacity: 0; transform: translateY(28px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes table-breathe {
          0%, 100% { box-shadow: 0 0 80px rgba(96,165,250,0.07), 0 0 160px rgba(167,139,250,0.04), inset 0 0 50px rgba(96,165,250,0.03); }
          50%       { box-shadow: 0 0 120px rgba(96,165,250,0.14), 0 0 200px rgba(167,139,250,0.08), inset 0 0 70px rgba(96,165,250,0.06); }
        }
        @keyframes orbit-spin {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer-sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes pulse-bar {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.7; }
        }
        @keyframes float-badge {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-3px); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        @keyframes title-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes border-spin {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <BackToHome />

        {/* ── Title ── */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 16px 5px 12px',
            background: 'linear-gradient(135deg, rgba(96,165,250,0.1), rgba(167,139,250,0.1))',
            border: '1px solid rgba(96,165,250,0.25)',
            marginBottom: 18,
            animation: 'float-badge 3s ease-in-out infinite',
          }}>
            <Sparkles size={12} style={{ color: '#a3c9ff', animation: 'glow-pulse 2s ease-in-out infinite' }}/>
            <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: '#a3c9ff', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              AI Round Table · Council Mode
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 14px',
            background: 'linear-gradient(135deg, #e2e8ff 0%, #a3c9ff 35%, #a78bfa 65%, #f472b6 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            animation: 'title-shimmer 5s linear infinite',
          }}>
            The Round Table
          </h1>

          <p style={{
            fontSize: 14, fontWeight: 500,
            background: 'linear-gradient(90deg, #5080c8, #a3c9ff, #5080c8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            letterSpacing: '-0.01em', margin: '0 0 20px',
          }}>
            {phase === 'setup'   ? 'Choose your council. One problem. Every angle.'
            : phase === 'running' ? 'The council is deliberating…'
            :                       'The council has spoken.'}
          </p>

          {sessions.length > 0 && (
            <button
              onClick={() => setShowHistory(p => !p)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '7px 16px',
                background: showHistory
                  ? 'linear-gradient(135deg, rgba(60,100,255,0.15), rgba(100,60,200,0.15))'
                  : 'rgba(40,80,200,0.06)',
                border: `1px solid ${showHistory ? 'rgba(100,160,255,0.4)' : 'rgba(40,80,200,0.25)'}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(100,160,255,0.4)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(60,100,255,0.12), rgba(100,60,200,0.12))' }}
              onMouseLeave={e => { if (!showHistory) { e.currentTarget.style.borderColor = 'rgba(40,80,200,0.25)'; e.currentTarget.style.background = 'rgba(40,80,200,0.06)' }}}
            >
              <History size={12} style={{ color: showHistory ? '#a3c9ff' : '#3a70d0' }}/>
              <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: showHistory ? '#a3c9ff' : '#3a70d0', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                {sessions.length} Past Session{sessions.length !== 1 ? 's' : ''}
              </span>
            </button>
          )}
        </div>

        {/* ── History Panel ── */}
        {showHistory && (
          <div style={{ marginBottom: 36 }}>
            {sessions.map(s => (
              <SessionHistoryCard key={s.id} session={s} onRestore={restoreSession} onDelete={deleteSession}/>
            ))}
          </div>
        )}

        {/* ════ SETUP PHASE ════ */}
        {phase === 'setup' && (
          <>
            {/* The Table */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
              <div style={{ position: 'relative', width: 560, height: 560, flexShrink: 0 }}>

                {/* Table circle */}
                <div style={{
                  position: 'absolute', left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 270, height: 270, borderRadius: '50%',
                  background: 'radial-gradient(ellipse at 38% 32%, #131f3a 0%, #0c1526 40%, #060b14 100%)',
                  border: '1.5px solid rgba(96,165,250,0.15)',
                  animation: 'table-breathe 5s ease-in-out infinite',
                  zIndex: 0,
                }}>
                  {/* Rings */}
                  {[16, 36, 60].map(inset => (
                    <div key={inset} style={{
                      position: 'absolute', inset,
                      borderRadius: '50%',
                      border: `0.5px solid rgba(96,165,250,${0.07 - inset * 0.001})`,
                    }}/>
                  ))}

                  {/* Cross hairs */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', width: '65%', height: '0.5px', background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.1), transparent)' }}/>
                    <div style={{ position: 'absolute', width: '0.5px', height: '65%', background: 'linear-gradient(180deg, transparent, rgba(96,165,250,0.1), transparent)' }}/>
                    <div style={{ position: 'absolute', width: '50%', height: '0.5px', background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.07), transparent)', transform: 'rotate(45deg)' }}/>
                  </div>

                  {/* Center counter */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}>
                    {seatedCount === 0 ? (
                      <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(96,165,250,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.7, padding: '0 28px' }}>
                        Select your<br/>council
                      </span>
                    ) : (
                      <>
                        <span style={{
                          fontFamily: MONO, fontSize: 34, fontWeight: 900, lineHeight: 1,
                          background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                          filter: 'drop-shadow(0 0 20px rgba(96,165,250,0.5))',
                        }}>{seatedCount}</span>
                        <span style={{
                          fontFamily: MONO, fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase',
                          background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                          opacity: 0.6,
                        }}>
                          {seatedCount === 1 ? 'expert' : 'experts'} seated
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {EXPERTS.map(expert => (
                  <ExpertChair
                    key={expert.key}
                    expert={expert}
                    selected={selected.has(expert.key)}
                    onClick={toggleExpert}
                  />
                ))}
              </div>
            </div>

            {/* Input area */}
            <div style={{ maxWidth: 620, margin: '0 auto' }}>
              <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 22, height: 22,
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, boxShadow: '0 0 16px rgba(96,165,250,0.4)',
                }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 900, color: '#000' }}>?</span>
                </div>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#5080c8' }}>
                  What's your situation, decision, or challenge?
                </span>
              </div>

              <div style={{
                background: '#080d18',
                border: '1.5px solid rgba(40,80,200,0.3)',
                position: 'relative', overflow: 'hidden',
                boxShadow: problem.length > 0 ? '0 0 40px rgba(96,165,250,0.06)' : 'none',
                transition: 'box-shadow 0.3s',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6, #4edea3)',
                  opacity: problem.length > 0 ? 1 : 0, transition: 'opacity 0.3s',
                }}/>
                <textarea
                  value={problem}
                  onChange={e => setProblem(e.target.value)}
                  placeholder="Be specific. The more precise you are, the sharper the council's advice will be."
                  rows={4}
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    resize: 'vertical', fontFamily: SANS, fontSize: 14, color: '#c0d8ff',
                    lineHeight: 1.65, padding: '16px 18px', boxSizing: 'border-box', minHeight: 110,
                    caretColor: '#60a5fa',
                  }}
                />
                <div style={{ padding: '0 18px 10px', textAlign: 'right', fontFamily: MONO, fontSize: 9, color: '#1e3a80' }}>
                  {problem.length} chars
                </div>
              </div>

              {/* Validation */}
              <div style={{ display: 'flex', gap: 16, marginTop: 10, marginBottom: 22 }}>
                {[
                  { ok: seatedCount >= 2, yes: `${seatedCount} experts seated`, no: 'Select at least 2 experts' },
                  { ok: problem.trim().length > 0, yes: 'Situation entered', no: 'Describe your situation' },
                ].map(({ ok, yes, no }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{
                      width: 7, height: 7,
                      background: ok ? '#4edea3' : '#1e3a80',
                      boxShadow: ok ? '0 0 8px #4edea3' : 'none',
                      transition: 'all 0.3s',
                    }}/>
                    <span style={{ fontFamily: MONO, fontSize: 9, color: ok ? '#4edea3' : '#1e3a80', letterSpacing: '0.06em', transition: 'color 0.3s' }}>
                      {ok ? yes : no}
                    </span>
                  </div>
                ))}
              </div>

              {/* Convene button */}
              <div style={{ position: 'relative' }}>
                {/* Outer glow halo — only when ready */}
                {canConvene && (
                  <div style={{
                    position: 'absolute', inset: -2,
                    background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6, #4edea3, #60a5fa)',
                    backgroundSize: '300% 300%',
                    animation: 'border-spin 2.5s linear infinite',
                    zIndex: 0,
                  }}/>
                )}
                <button
                  onClick={convene}
                  disabled={!canConvene}
                  style={{
                    position: 'relative', zIndex: 1, overflow: 'hidden',
                    width: '100%', padding: '22px 32px',
                    background: canConvene
                      ? 'linear-gradient(135deg, #0a1a3a 0%, #110830 35%, #1a0440 65%, #0a1a3a 100%)'
                      : '#080d18',
                    border: 'none',
                    cursor: canConvene ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), filter 0.2s',
                  }}
                  onMouseEnter={e => { if (canConvene) { e.currentTarget.style.transform = 'scale(1.015)'; e.currentTarget.style.filter = 'brightness(1.25)' }}}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'none' }}
                  onMouseDown={e => { if (canConvene) e.currentTarget.style.transform = 'scale(0.98)' }}
                  onMouseUp={e => { if (canConvene) e.currentTarget.style.transform = 'scale(1.015)' }}
                >
                  {/* Active layers */}
                  {canConvene && (
                    <>
                      {/* Radial center bloom */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(ellipse at 50% 120%, rgba(167,139,250,0.25) 0%, rgba(96,165,250,0.15) 40%, transparent 70%)',
                        pointerEvents: 'none',
                      }}/>
                      {/* Diagonal light streak */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)',
                        animation: 'shimmer-sweep 2s ease-in-out infinite',
                        pointerEvents: 'none',
                      }}/>
                    </>
                  )}

                  {/* Disabled inner border */}
                  {!canConvene && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      border: '1px solid rgba(30,60,160,0.2)',
                      pointerEvents: 'none',
                    }}/>
                  )}

                  <span style={{
                    fontFamily: SANS, fontSize: 18, fontWeight: 900,
                    letterSpacing: '-0.03em', position: 'relative', zIndex: 1,
                    ...(canConvene ? {
                      background: 'linear-gradient(135deg, #ffffff 0%, #c8e0ff 40%, #d4b8ff 70%, #ffffff 100%)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      filter: 'drop-shadow(0 0 20px rgba(163,201,255,0.6))',
                      animation: 'title-shimmer 3s linear infinite',
                    } : {
                      color: '#1e3a80',
                    }),
                  }}>
                    Convene the Table
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ════ RUNNING / DONE ════ */}
        {(phase === 'running' || phase === 'done') && (
          <>
            {/* Session header bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px',
              background: 'linear-gradient(135deg, rgba(40,80,200,0.08), rgba(100,60,200,0.05))',
              border: '1px solid rgba(60,120,255,0.18)',
              marginBottom: 28,
              boxShadow: '0 0 40px rgba(60,120,255,0.05)',
            }}>
              <div style={{ display: 'flex' }}>
                {EXPERTS.filter(e => selected.has(e.key)).map((e, i) => {
                  const Icon = e.icon
                  return (
                    <div key={e.key} style={{
                      width: 30, height: 30,
                      background: `${e.color}18`,
                      border: `1.5px solid ${e.color}55`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginLeft: i > 0 ? -9 : 0,
                      boxShadow: `0 0 12px ${e.color}25`,
                    }}>
                      <Icon size={13} style={{ color: e.color }}/>
                    </div>
                  )
                })}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: MONO, fontSize: 9, color: '#3a70d0', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                  {selected.size} experts · Round Table Session
                </p>
                <p style={{ fontFamily: SANS, fontSize: 12, color: '#5080c8', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {problem}
                </p>
              </div>
              {phase === 'running' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <Loader2 size={14} style={{ color: '#a3c9ff', animation: 'spin 0.8s linear infinite', filter: 'drop-shadow(0 0 6px rgba(163,201,255,0.6))' }}/>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: '#3a70d0', letterSpacing: '0.08em' }}>
                    {responses.length}/{selected.size}
                  </span>
                </div>
              )}
            </div>

            {/* Grid: responses + loading cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
              {responses.map((resp, i) => (
                <ResponseCard key={resp.expertKey} resp={resp} index={i}/>
              ))}
              {pendingExperts.map(expert => (
                <LoadingCard key={expert.key} expert={expert}/>
              ))}
            </div>

            {/* ── Synthesis ── */}
            {synthesis && (
              <div style={{
                background: 'linear-gradient(145deg, rgba(40,80,200,0.06), rgba(167,139,250,0.04), #060b14)',
                border: '1.5px solid rgba(100,160,255,0.25)',
                position: 'relative', overflow: 'hidden',
                marginBottom: 28,
                animation: 'synthesis-in 0.6s cubic-bezier(0.22,1,0.36,1) both',
                boxShadow: '0 0 80px rgba(96,165,250,0.06), 0 0 160px rgba(167,139,250,0.04)',
              }}>
                {/* Rainbow top bar */}
                <div style={{ height: 3, background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6, #4edea3, #fbbf24, #60a5fa)', backgroundSize: '200% 100%', animation: 'title-shimmer 3s linear infinite' }}/>

                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'radial-gradient(ellipse at top center, rgba(96,165,250,0.05), transparent 55%)',
                  pointerEvents: 'none',
                }}/>

                <div style={{ padding: '24px 28px', position: 'relative' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <div style={{
                      width: 38, height: 38,
                      background: 'linear-gradient(135deg, rgba(96,165,250,0.2), rgba(167,139,250,0.2))',
                      border: '1.5px solid rgba(96,165,250,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 0 24px rgba(96,165,250,0.25)',
                    }}>
                      <Sparkles size={17} style={{ color: '#a3c9ff', filter: 'drop-shadow(0 0 8px rgba(163,201,255,0.8))' }}/>
                    </div>
                    <div>
                      <span style={{
                        fontFamily: MONO, fontSize: 10, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase',
                        background: 'linear-gradient(90deg, #a3c9ff, #a78bfa)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}>
                        Synthesis
                      </span>
                      <p style={{ fontFamily: MONO, fontSize: 8, color: '#2a4898', letterSpacing: '0.06em', marginTop: 2 }}>
                        The table's unified verdict
                      </p>
                    </div>
                  </div>

                  {/* Core Truth */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 24, height: 24, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(251,191,36,0.2)' }}>
                        <Lightbulb size={12} style={{ color: '#fbbf24' }}/>
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.12em', textTransform: 'uppercase', textShadow: '0 0 20px rgba(251,191,36,0.4)' }}>Core Truth</span>
                    </div>
                    <p style={{
                      fontFamily: SANS, fontSize: 15, fontWeight: 600,
                      background: 'linear-gradient(135deg, #e2e8ff, #a3c9ff)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      lineHeight: 1.65,
                      borderLeft: '2px solid rgba(251,191,36,0.4)', paddingLeft: 16,
                    }}>
                      {synthesis.core_truth}
                    </p>
                  </div>

                  {/* Action Plan */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 24, height: 24, background: 'rgba(78,222,163,0.15)', border: '1px solid rgba(78,222,163,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(78,222,163,0.2)' }}>
                        <ListOrdered size={12} style={{ color: '#4edea3' }}/>
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, color: '#4edea3', letterSpacing: '0.12em', textTransform: 'uppercase', textShadow: '0 0 20px rgba(78,222,163,0.4)' }}>Action Plan</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {synthesis.action_plan?.map((step, i) => {
                        const colors = ['#60a5fa', '#4edea3', '#a78bfa', '#fbbf24', '#f472b6']
                        const c = colors[i] || '#60a5fa'
                        return (
                          <div key={i} style={{
                            display: 'flex', gap: 14, alignItems: 'flex-start',
                            animation: `bullet-in 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s both`,
                          }}>
                            <div style={{
                              width: 26, height: 26, flexShrink: 0, marginTop: 0,
                              background: `linear-gradient(135deg, ${c}25, ${c}10)`,
                              border: `1.5px solid ${c}50`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: `0 0 14px ${c}25`,
                            }}>
                              <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 900, color: c }}>{i + 1}</span>
                            </div>
                            <p style={{ fontFamily: SANS, fontSize: 14, color: '#a0c0f0', lineHeight: 1.6, flex: 1 }}>{step}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Warning */}
                  <div style={{
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    padding: '14px 18px',
                    background: 'linear-gradient(135deg, rgba(255,107,107,0.08), rgba(255,107,107,0.04))',
                    border: '1px solid rgba(255,107,107,0.25)',
                    boxShadow: '0 0 30px rgba(255,107,107,0.06)',
                  }}>
                    <div style={{ width: 28, height: 28, background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 12px rgba(255,107,107,0.2)' }}>
                      <AlertTriangle size={13} style={{ color: '#ff6b6b' }}/>
                    </div>
                    <p style={{ fontFamily: SANS, fontSize: 13.5, color: '#a0c0f0', lineHeight: 1.6 }}>
                      <span style={{ color: '#ff6b6b', fontWeight: 800, textShadow: '0 0 14px rgba(255,107,107,0.5)' }}>Watch out: </span>
                      {synthesis.warning}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{
                padding: '13px 18px',
                background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.3)',
                marginBottom: 20, fontFamily: MONO, fontSize: 12, color: '#ff6b6b',
                boxShadow: '0 0 20px rgba(255,107,107,0.06)',
              }}>
                {error}
              </div>
            )}

            {/* New session */}
            {phase === 'done' && (
              <button
                onClick={reset}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '11px 22px',
                  background: 'rgba(40,80,200,0.06)',
                  border: '1px solid rgba(40,80,200,0.25)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)'; e.currentTarget.style.background = 'rgba(40,80,200,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(40,80,200,0.25)'; e.currentTarget.style.background = 'rgba(40,80,200,0.06)' }}
              >
                <RotateCcw size={14} style={{ color: '#4a80d0' }}/>
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#4a80d0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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
