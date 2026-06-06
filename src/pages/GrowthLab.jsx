import { useState, useRef } from 'react'
import {
  Telescope, Target, Zap, BookOpen, ArrowRight, ChevronRight,
  Loader2, Check, Star, TrendingUp, Clock, Flame,
  RefreshCw, RotateCcw, Lock, Unlock, Map, Brain, Sparkles
} from 'lucide-react'
import { apiFetch } from '../lib/api'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

/* ── colours per horizon ── */
const HORIZON_CFG = {
  '5yr':   { color: '#c084fc', glow: 'rgba(192,132,252,0.3)', bg: 'rgba(192,132,252,0.07)', label: '5 Years'    },
  '1yr':   { color: '#818cf8', glow: 'rgba(129,140,248,0.3)', bg: 'rgba(129,140,248,0.07)', label: '1 Year'     },
  '6mo':   { color: '#38bdf8', glow: 'rgba(56,189,248,0.3)',  bg: 'rgba(56,189,248,0.07)',  label: '6 Months'   },
  '1mo':   { color: '#34d399', glow: 'rgba(52,211,153,0.3)',  bg: 'rgba(52,211,153,0.07)',  label: 'This Month' },
  '1wk':   { color: '#fbbf24', glow: 'rgba(251,191,36,0.3)',  bg: 'rgba(251,191,36,0.07)',  label: 'This Week'  },
  'today': { color: '#f87171', glow: 'rgba(248,113,113,0.35)',bg: 'rgba(248,113,113,0.08)', label: 'Today'      },
}

const PRIORITY_CFG = {
  critical: { color: '#f87171', label: 'Critical' },
  high:     { color: '#fb923c', label: 'High'     },
  medium:   { color: '#fbbf24', label: 'Medium'   },
  low:      { color: '#4ade80', label: 'Low'       },
}

/* ── Custom SVG radar chart ── */
function RadarChart({ skills, size = 280 }) {
  if (!skills?.length) return null
  const cx = size / 2, cy = size / 2, r = size * 0.38
  const n = Math.min(skills.length, 8)
  const pts = skills.slice(0, n)

  const angle = (i) => (i * 2 * Math.PI) / n - Math.PI / 2
  const pt = (i, val) => {
    const a = angle(i), frac = val / 100
    return { x: cx + r * frac * Math.cos(a), y: cy + r * frac * Math.sin(a) }
  }
  const labelPt = (i) => {
    const a = angle(i)
    return { x: cx + (r + 26) * Math.cos(a), y: cy + (r + 26) * Math.sin(a) }
  }

  const polygon = (vals) => vals.map((v, i) => {
    const p = pt(i, v)
    return `${p.x},${p.y}`
  }).join(' ')

  const currentPts = pts.map(s => s.current_level)
  const requiredPts = pts.map(s => s.required_level)

  /* grid rings */
  const rings = [20, 40, 60, 80, 100]

  return (
    <svg width={size} height={size} style={{ display: 'block', overflow: 'visible' }}>
      {/* grid rings */}
      {rings.map(ring => (
        <polygon key={ring}
          points={pts.map((_, i) => { const p = pt(i, ring); return `${p.x},${p.y}` }).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
      ))}

      {/* spokes */}
      {pts.map((_, i) => {
        const p = pt(i, 100)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
      })}

      {/* required level area */}
      <polygon points={polygon(requiredPts)} fill="rgba(129,140,248,0.08)" stroke="rgba(129,140,248,0.3)" strokeWidth="1.5" strokeDasharray="4 3"/>

      {/* current level area */}
      <polygon points={polygon(currentPts)} fill="rgba(192,132,252,0.15)" stroke="#c084fc" strokeWidth="2"
        style={{ filter: 'drop-shadow(0 0 8px rgba(192,132,252,0.4))' }}/>

      {/* dots */}
      {pts.map((s, i) => {
        const cp = pt(i, s.current_level)
        const rp = pt(i, s.required_level)
        return (
          <g key={i}>
            <circle cx={rp.x} cy={rp.y} r={3} fill="#818cf8" opacity={0.5}/>
            <circle cx={cp.x} cy={cp.y} r={4} fill="#c084fc" style={{ filter: 'drop-shadow(0 0 5px rgba(192,132,252,0.8))' }}/>
          </g>
        )
      })}

      {/* labels */}
      {pts.map((s, i) => {
        const lp = labelPt(i)
        const anchor = lp.x < cx - 4 ? 'end' : lp.x > cx + 4 ? 'start' : 'middle'
        return (
          <text key={i} x={lp.x} y={lp.y + 4} textAnchor={anchor}
            style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, fill: '#8a919f' }}>
            {s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name}
          </text>
        )
      })}

      {/* centre */}
      <circle cx={cx} cy={cy} r={3} fill="rgba(192,132,252,0.6)"/>
    </svg>
  )
}

/* ── Skill row ── */
function SkillRow({ skill, index }) {
  const [hov, setHov] = useState(false)
  const pri = PRIORITY_CFG[skill.priority] || PRIORITY_CFG.medium
  const gap = Math.max(0, skill.required_level - skill.current_level)

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '12px 16px', background: hov ? 'rgba(192,132,252,0.05)' : 'rgba(255,255,255,0.02)',
        border: `0.5px solid ${hov ? 'rgba(192,132,252,0.25)' : 'rgba(48,54,61,0.9)'}`,
        borderLeft: `2px solid ${pri.color}`,
        transition: 'all 0.18s', animation: `rowIn 0.4s ease ${index * 0.06}s both`,
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#e2e2e8' }}>{skill.name}</p>
            <span style={{ fontFamily: MONO, fontSize: 7, fontWeight: 700, color: pri.color, background: `${pri.color}12`, border: `0.5px solid ${pri.color}35`, padding: '2px 6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{pri.label}</span>
            <span style={{ fontFamily: MONO, fontSize: 7, color: '#404753', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.06)', padding: '2px 6px' }}>{skill.category}</span>
          </div>
          <p style={{ fontFamily: MONO, fontSize: 9, color: '#5a6478' }}>{skill.why}</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
          <p style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: gap > 40 ? '#f87171' : gap > 20 ? '#fbbf24' : '#4ade80', letterSpacing: '-0.04em', lineHeight: 1 }}>
            {skill.roi_score}
          </p>
          <p style={{ fontFamily: MONO, fontSize: 7, color: '#404753' }}>ROI score</p>
        </div>
      </div>

      {/* Dual progress bar: current vs required */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: MONO, fontSize: 8, color: '#5a6478' }}>Current: <strong style={{ color: '#c084fc' }}>{skill.current_level}</strong></span>
          <span style={{ fontFamily: MONO, fontSize: 8, color: '#5a6478' }}>Required: <strong style={{ color: '#818cf8' }}>{skill.required_level}</strong></span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', overflow: 'hidden', position: 'relative' }}>
          {/* required bar */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${skill.required_level}%`, background: 'rgba(129,140,248,0.25)', transition: 'width 1s ease' }}/>
          {/* current bar */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${skill.current_level}%`, background: 'linear-gradient(90deg,#c084fc,#a78bfa)', boxShadow: '0 0 8px rgba(192,132,252,0.5)', transition: 'width 1s ease' }}/>
        </div>
      </div>

      {skill.resource && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <BookOpen size={9} style={{ color: '#fbbf24' }}/>
          <span style={{ fontFamily: MONO, fontSize: 8, color: '#fbbf24' }}>{skill.resource}</span>
        </div>
      )}
    </div>
  )
}

/* ── Week card ── */
function WeekCard({ week, index }) {
  const [hov, setHov] = useState(false)
  const colors = ['#c084fc','#818cf8','#38bdf8','#34d399','#fbbf24','#fb923c','#f87171','#a78bfa']
  const c = colors[index % colors.length]
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '14px 16px', background: hov ? `${c}0a` : 'rgba(255,255,255,0.02)',
        border: `0.5px solid ${hov ? c + '40' : 'rgba(48,54,61,0.9)'}`,
        borderTop: `2px solid ${c}`,
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 6px 20px rgba(0,0,0,0.35), 0 0 20px ${c}15` : 'none',
        transition: 'all 0.2s cubic-bezier(0.34,1.4,0.64,1)',
        animation: `cardIn 0.5s ease ${index * 0.07}s both`,
      }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${c}15`, border: `0.5px solid ${c}35`, fontFamily: MONO, fontSize: 10, fontWeight: 900, color: c }}>
            {week.week}
          </div>
          <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: c, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{week.theme}</p>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 8, color: '#5a6478' }}>{week.daily_commitment}</span>
      </div>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#c0c7d5', marginBottom: 6, lineHeight: 1.4 }}>{week.deliverable}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: `${c}08`, border: `0.5px solid ${c}18` }}>
        <Zap size={9} style={{ color: c, flexShrink: 0 }}/>
        <p style={{ fontFamily: MONO, fontSize: 8, color: `${c}cc` }}>{week.action}</p>
      </div>
      {week.skills_focus?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
          {week.skills_focus.map(s => (
            <span key={s} style={{ fontFamily: MONO, fontSize: 7, color: '#5a6478', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(48,54,61,0.9)', padding: '2px 7px' }}>{s}</span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Horizon node ── */
function HorizonNode({ h, data, index, checked, onCheck }) {
  const [open, setOpen] = useState(index >= 3)
  const [hov, setHov] = useState(false)
  const cfg = HORIZON_CFG[h.id] || HORIZON_CFG['1yr']

  return (
    <div style={{ animation: `cardIn 0.5s ease ${index * 0.08}s both` }}>
      {/* connector line */}
      {index < 5 && (
        <div style={{ display: 'flex', justifyContent: 'center', height: 24, position: 'relative' }}>
          <div style={{ width: 1.5, height: '100%', background: `linear-gradient(180deg,${cfg.color}60,${HORIZON_CFG[['5yr','1yr','6mo','1mo','1wk','today'][index+1]]?.color || cfg.color}60)` }}/>
        </div>
      )}

      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? cfg.bg : 'rgba(13,18,32,0.98)',
          border: `0.5px solid ${hov ? cfg.color + '50' : cfg.color + '25'}`,
          borderLeft: `3px solid ${cfg.color}`,
          overflow: 'hidden', transition: 'all 0.22s ease',
          boxShadow: hov ? `0 4px 24px rgba(0,0,0,0.4), 0 0 24px ${cfg.glow}` : 'none',
        }}>

        <button onClick={() => setOpen(o => !o)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          {/* dot */}
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 10px ${cfg.glow}`, flexShrink: 0 }}/>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, color: cfg.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{cfg.label}</span>
              <span style={{ fontFamily: MONO, fontSize: 8, color: '#404753' }}>·</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e2e8' }}>{data.title}</span>
            </div>
            <p style={{ fontFamily: MONO, fontSize: 8, color: '#5a6478', marginTop: 3 }}>{data.focus}</p>
          </div>
          <div style={{ color: '#5a6478', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
            <ChevronRight size={14}/>
          </div>
        </button>

        {open && (
          <div style={{ padding: '0 18px 16px', borderTop: '0.5px solid rgba(48,54,61,0.5)' }}>
            <p style={{ fontSize: 13, color: '#8a919f', lineHeight: 1.75, marginTop: 12, marginBottom: 12 }}>{data.description}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.milestones?.map((m, mi) => (
                <button key={mi} onClick={() => onCheck(h.id, mi)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 10px', background: checked?.[mi] ? `${cfg.color}0d` : 'rgba(255,255,255,0.02)', border: `0.5px solid ${checked?.[mi] ? cfg.color + '30' : 'rgba(48,54,61,0.8)'}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${checked?.[mi] ? cfg.color : 'rgba(255,255,255,0.15)'}`, background: checked?.[mi] ? `${cfg.color}20` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.15s' }}>
                    {checked?.[mi] && <Check size={9} style={{ color: cfg.color }}/>}
                  </div>
                  <p style={{ fontSize: 12, color: checked?.[mi] ? '#5a6478' : '#c0c7d5', textDecoration: checked?.[mi] ? 'line-through' : 'none', lineHeight: 1.5, transition: 'all 0.15s' }}>{m}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════════════════════════ */
export default function GrowthLab() {
  /* ── Dream section state ── */
  const [dream, setDream]         = useState('')
  const [dreamResult, setDreamResult] = useState(null)
  const [dreamLoading, setDreamLoading] = useState(false)
  const [dreamError, setDreamError]   = useState(null)
  const [dreamChecked, setDreamChecked] = useState({}) // { horizonId: { milestoneIndex: bool } }

  /* ── Skill section state ── */
  const [goal, setGoal]           = useState('')
  const [currentSkills, setCurrentSkills] = useState('')
  const [skillResult, setSkillResult] = useState(null)
  const [skillLoading, setSkillLoading] = useState(false)
  const [skillError, setSkillError]   = useState(null)
  const [activeTab, setActiveTab]   = useState('skills') // 'skills' | 'roadmap'

  const skillLocked = !dreamResult

  /* ── Handlers ── */
  const runDream = async () => {
    if (!dream.trim() || dreamLoading) return
    setDreamLoading(true); setDreamError(null)
    try {
      const res  = await apiFetch('/api/ai/dream-reverse', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ dream }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDreamResult(data); setDreamChecked({})
      // auto-fill goal for skill radar
      if (data.dream_title) setGoal(data.dream_title)
    } catch (err) { setDreamError(err.message) }
    finally { setDreamLoading(false) }
  }

  const runSkillGap = async () => {
    if (!goal.trim() || skillLoading) return
    setSkillLoading(true); setSkillError(null)
    try {
      const res  = await apiFetch('/api/ai/skill-gap', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ goal, currentSkills }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSkillResult(data)
    } catch (err) { setSkillError(err.message) }
    finally { setSkillLoading(false) }
  }

  const toggleCheck = (horizonId, mi) => {
    setDreamChecked(c => ({
      ...c,
      [horizonId]: { ...c[horizonId], [mi]: !c[horizonId]?.[mi] }
    }))
  }

  const horizonOrder = ['5yr','1yr','6mo','1mo','1wk','today']

  return (
    <div style={{ fontFamily: SANS, maxWidth: 1060, margin: '0 auto', paddingTop: 4 }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,rgba(192,132,252,0.2),rgba(129,140,248,0.1))', border: '0.5px solid rgba(192,132,252,0.35)', boxShadow: '0 0 20px rgba(192,132,252,0.15)' }}>
            <Telescope size={17} style={{ color: '#c084fc' }}/>
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.03em', color: '#e2e2e8', lineHeight: 1 }}>Growth Lab</h1>
            <p style={{ fontFamily: MONO, fontSize: 8, color: '#5a6478', marginTop: 3, letterSpacing: '0.08em' }}>DREAM · REVERSE-ENGINEER · CLOSE THE SKILL GAP</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: '#8a919f', maxWidth: 560, lineHeight: 1.65 }}>
          Describe your dream. AI reverse-engineers the exact path to get there — then maps every skill you need to build along the way.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'flex-start' }}>

        {/* ══ LEFT: Dream Reverse-Engineer ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Map size={14} style={{ color: '#c084fc' }}/>
            <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#c084fc', textTransform: 'uppercase' }}>Dream Blueprint</span>
          </div>

          {/* Input */}
          <div style={{ background: 'linear-gradient(145deg,rgba(18,10,40,0.97),rgba(7,11,24,0.99))', border: '0.5px solid rgba(192,132,252,0.2)', borderTop: '2px solid #c084fc', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px 0' }}>
              <label style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(192,132,252,0.8)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Sparkles size={9}/> Describe your dream life or goal
              </label>
            </div>
            <textarea rows={5} value={dream} onChange={e => setDream(e.target.value)}
              placeholder="e.g. I want to become a startup founder with a profitable SaaS business generating $50k/month, working from anywhere, financially free by 35..."
              onKeyDown={e => e.key === 'Enter' && e.metaKey && runDream()}
              style={{ width: '100%', boxSizing: 'border-box', padding: '0 16px 14px', background: 'transparent', border: 'none', color: '#e2e2e8', fontSize: 13, fontFamily: SANS, lineHeight: 1.7, outline: 'none', resize: 'none' }}/>
            <div style={{ height: 2, background: 'rgba(192,132,252,0.06)' }}>
              <div style={{ height: '100%', width: `${Math.min(100,(dream.length/300)*100)}%`, background: dream.length < 20 ? '#f87171' : 'linear-gradient(90deg,#c084fc,#818cf8)', transition: 'width 0.3s, background 0.3s' }}/>
            </div>
          </div>

          {dreamError && <p style={{ fontFamily: MONO, fontSize: 10, color: '#f87171', padding: '8px 12px', background: 'rgba(248,113,113,0.06)', border: '0.5px solid rgba(248,113,113,0.2)' }}>{dreamError}</p>}

          {/* Run button */}
          <button onClick={runDream} disabled={dream.trim().length < 20 || dreamLoading}
            style={{
              width: '100%', padding: '13px 0', position: 'relative', overflow: 'hidden',
              background: dream.trim().length >= 20 ? 'linear-gradient(135deg,#7c3aed,#c084fc,#818cf8)' : 'rgba(255,255,255,0.03)',
              border: dream.trim().length >= 20 ? 'none' : '0.5px solid rgba(48,54,61,0.9)',
              color: dream.trim().length >= 20 ? '#fff' : '#3a4455',
              fontFamily: MONO, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: dream.trim().length >= 20 && !dreamLoading ? 'pointer' : 'not-allowed',
              boxShadow: dream.trim().length >= 20 ? '0 4px 28px rgba(124,58,237,0.4), 0 0 0 0.5px rgba(192,132,252,0.3)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if(dream.trim().length>=20&&!dreamLoading) e.currentTarget.style.filter='brightness(1.1)' }}
            onMouseLeave={e => e.currentTarget.style.filter='none'}
            onMouseDown={e => { if(dream.trim().length>=20) e.currentTarget.style.transform='scale(0.99)' }}
            onMouseUp={e => e.currentTarget.style.transform='none'}>
            {dream.trim().length >= 20 && !dreamLoading && <span style={{ position:'absolute',inset:0,background:'linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.14) 50%,transparent 65%)',backgroundSize:'200% 100%',animation:'shimmer 2s ease infinite',pointerEvents:'none' }}/>}
            {dreamLoading ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> Reverse-engineering your future…</> : <><Map size={14}/> Build My Blueprint</>}
          </button>

          {/* Timeline result */}
          {dreamResult && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Dream title */}
              <div style={{ padding: '12px 16px', background: 'rgba(192,132,252,0.07)', border: '0.5px solid rgba(192,132,252,0.2)', marginBottom: 12 }}>
                <p style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(192,132,252,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Your Dream</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#e2e2e8', letterSpacing: '-0.01em', marginBottom: 6 }}>{dreamResult.dream_title}</p>
                <p style={{ fontFamily: MONO, fontSize: 9, color: '#5a6478', lineHeight: 1.6 }}>{dreamResult.reality_check}</p>
              </div>

              {/* Horizon timeline */}
              {horizonOrder.map((id, i) => {
                const data = dreamResult.horizons?.find(h => h.id === id)
                if (!data) return null
                const h = { id }
                return (
                  <HorizonNode key={id} h={h} data={data} index={i}
                    checked={dreamChecked[id] || {}}
                    onCheck={toggleCheck}/>
                )
              })}

              <button onClick={() => { setDreamResult(null); setDream('') }}
                style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(48,54,61,0.9)', color: '#5a6478', fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', width: 'fit-content', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color='#c0c7d5'; e.currentTarget.style.background='rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.color='#5a6478'; e.currentTarget.style.background='rgba(255,255,255,0.03)' }}>
                <RotateCcw size={10}/> New Dream
              </button>
            </div>
          )}
        </div>

        {/* ══ RIGHT: Skill Gap Radar ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={14} style={{ color: skillLocked ? '#3a4455' : '#818cf8' }}/>
            <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: skillLocked ? '#3a4455' : '#818cf8', textTransform: 'uppercase' }}>Skill Gap Radar</span>
            {skillLocked && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(48,54,61,0.9)' }}>
                <Lock size={8} style={{ color: '#3a4455' }}/>
                <span style={{ fontFamily: MONO, fontSize: 7, color: '#3a4455', letterSpacing: '0.06em' }}>Build your blueprint first</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ background: skillLocked ? 'rgba(255,255,255,0.01)' : 'linear-gradient(145deg,rgba(10,12,35,0.97),rgba(7,11,24,0.99))', border: `0.5px solid ${skillLocked ? 'rgba(48,54,61,0.5)' : 'rgba(129,140,248,0.2)'}`, borderTop: `2px solid ${skillLocked ? 'rgba(48,54,61,0.5)' : '#818cf8'}`, opacity: skillLocked ? 0.4 : 1, transition: 'all 0.3s', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px 0' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontFamily: MONO, fontSize: 7, fontWeight: 700, color: 'rgba(129,140,248,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Dream Role / Goal</label>
                  <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Startup Founder" disabled={skillLocked}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', background: 'rgba(129,140,248,0.06)', border: '0.5px solid rgba(129,140,248,0.2)', color: '#e2e2e8', fontSize: 12, fontFamily: SANS, outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor='rgba(129,140,248,0.5)'} onBlur={e => e.target.style.borderColor='rgba(129,140,248,0.2)'}/>
                </div>
              </div>
              <label style={{ fontFamily: MONO, fontSize: 7, fontWeight: 700, color: '#5a6478', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Your Current Skills (optional)</label>
              <input value={currentSkills} onChange={e => setCurrentSkills(e.target.value)} placeholder="e.g. React, product management, basic marketing" disabled={skillLocked}
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', marginBottom: 14, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(48,54,61,0.9)', color: '#e2e2e8', fontSize: 12, fontFamily: SANS, outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor='rgba(129,140,248,0.4)'} onBlur={e => e.target.style.borderColor='rgba(48,54,61,0.9)'}/>
            </div>
          </div>

          {skillError && <p style={{ fontFamily: MONO, fontSize: 10, color: '#f87171', padding: '8px 12px', background: 'rgba(248,113,113,0.06)', border: '0.5px solid rgba(248,113,113,0.2)' }}>{skillError}</p>}

          {/* Run skill button */}
          <button onClick={runSkillGap} disabled={skillLocked || goal.trim().length < 3 || skillLoading}
            style={{
              width: '100%', padding: '13px 0', position: 'relative', overflow: 'hidden',
              background: !skillLocked && goal.trim().length >= 3 ? 'linear-gradient(135deg,#3730a3,#818cf8,#38bdf8)' : 'rgba(255,255,255,0.03)',
              border: !skillLocked && goal.trim().length >= 3 ? 'none' : '0.5px solid rgba(48,54,61,0.9)',
              color: !skillLocked && goal.trim().length >= 3 ? '#fff' : '#3a4455',
              fontFamily: MONO, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: !skillLocked && goal.trim().length >= 3 && !skillLoading ? 'pointer' : 'not-allowed',
              boxShadow: !skillLocked && goal.trim().length >= 3 ? '0 4px 28px rgba(55,48,163,0.4)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if(!skillLocked&&goal.trim().length>=3&&!skillLoading) e.currentTarget.style.filter='brightness(1.1)' }}
            onMouseLeave={e => e.currentTarget.style.filter='none'}>
            {!skillLocked && goal.trim().length >= 3 && !skillLoading && <span style={{ position:'absolute',inset:0,background:'linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.12) 50%,transparent 65%)',backgroundSize:'200% 100%',animation:'shimmer 2s ease infinite',pointerEvents:'none' }}/>}
            {skillLoading ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> Mapping your skill gaps…</> : skillLocked ? <><Lock size={13}/> Build Blueprint First</> : <><Brain size={14}/> Analyse Skill Gap</>}
          </button>

          {/* Skill results */}
          {skillResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Summary */}
              <div style={{ padding: '12px 16px', background: 'rgba(129,140,248,0.06)', border: '0.5px solid rgba(129,140,248,0.2)' }}>
                <p style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(129,140,248,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>{skillResult.goal_title}</p>
                <p style={{ fontSize: 12, color: '#8a919f', lineHeight: 1.7 }}>{skillResult.summary}</p>
              </div>

              {/* Radar + legend */}
              <div style={{ background: 'rgba(13,18,32,0.98)', border: '0.5px solid rgba(48,54,61,0.9)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <RadarChart skills={skillResult.skills}/>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 20, height: 2, background: '#c084fc', boxShadow: '0 0 4px rgba(192,132,252,0.5)' }}/>
                    <span style={{ fontFamily: MONO, fontSize: 8, color: '#5a6478' }}>Current</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 20, height: 2, background: 'rgba(129,140,248,0.5)', borderTop: '1px dashed rgba(129,140,248,0.5)' }}/>
                    <span style={{ fontFamily: MONO, fontSize: 8, color: '#5a6478' }}>Required</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 0, border: '0.5px solid rgba(48,54,61,0.9)' }}>
                {[['skills','Skill Gaps'],['roadmap','8-Week Roadmap']].map(([k,l]) => (
                  <button key={k} onClick={() => setActiveTab(k)}
                    style={{ flex: 1, padding: '9px 0', fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: activeTab===k ? 'rgba(129,140,248,0.12)' : 'transparent', border: 'none', borderRight: k==='skills' ? '0.5px solid rgba(48,54,61,0.9)' : 'none', color: activeTab===k ? '#818cf8' : '#5a6478', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {l}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === 'skills' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {skillResult.skills?.sort((a,b)=>b.roi_score-a.roi_score).map((s,i) => <SkillRow key={s.name} skill={s} index={i}/>)}
                </div>
              )}

              {activeTab === 'roadmap' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {skillResult.roadmap?.map((w,i) => <WeekCard key={w.week} week={w} index={i}/>)}
                </div>
              )}

              <button onClick={() => setSkillResult(null)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(48,54,61,0.9)', color: '#5a6478', fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', width: 'fit-content', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color='#c0c7d5'; e.currentTarget.style.background='rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.color='#5a6478'; e.currentTarget.style.background='rgba(255,255,255,0.03)' }}>
                <RefreshCw size={10}/> Re-analyse
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes cardIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes rowIn   { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
