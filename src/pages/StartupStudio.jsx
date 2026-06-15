import { useState, useRef } from 'react'
import { Plus, Pencil } from 'lucide-react'
import {
  Lightbulb, Users, BarChart2, Sparkles, DollarSign,
  Map, BookOpen, FileText, CheckCircle2, Lock,
  Loader2, ArrowRight, Check, ChevronDown, ChevronUp,
  AlertCircle, TrendingUp, Star, Zap, Package, Copy
} from 'lucide-react'
import { apiFetch } from '../lib/api'

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
const SANS = 'Geist, Inter, sans-serif'

/* ─── localStorage session persistence ──────────────────────────── */
const SESSIONS_KEY = 'trackr_studio_v1'
const ACTIVE_KEY   = 'trackr_studio_active_v1'

const EMPTY_DATA = {
  pitch: '', industry: '', targetMarket: '', fundingAsk: '',
  knownCompetitors: '', nameVibe: 'Modern', nameKeywords: '',
  teamSize: 'Just me', location: '', legalCountry: '', founders: '1',
  marketingBudget: 'Self-funded', gtmGoal: 'First 10 customers', pitchEquity: '',
  ideaResult: null, competitorResult: null, businessModelResult: null,
  nameResult: null, selectedName: '', financialResult: null,
  productionResult: null,
  gtmResult: null, legalResult: null, pitchBuilderResult: null,
}

function newSession(n = 1) {
  return { id: `s_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, name: `Pitch ${n}`, created: Date.now(), activeStep: 1, completedSteps: [], data: { ...EMPTY_DATA } }
}
function readSessions() { try { return JSON.parse(localStorage.getItem(SESSIONS_KEY)) || [] } catch { return [] } }
function writeSessions(s) { try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(s)) } catch {} }

const STEPS = [
  { id: 1, label: 'Idea Validator',        short: 'Idea',    desc: 'Score your concept',      color: '#a78bfa', glow: 'rgba(167,139,250,0.35)', icon: Lightbulb  },
  { id: 2, label: 'Competitor Intel',      short: 'Compete', desc: 'Map the competition',     color: '#fb7185', glow: 'rgba(251,113,133,0.35)', icon: Users      },
  { id: 3, label: 'Business Model',        short: 'Model',   desc: 'Find how you make money', color: '#38bdf8', glow: 'rgba(56,189,248,0.35)',  icon: BarChart2  },
  { id: 4, label: 'Name Studio',           short: 'Name',    desc: 'Name your venture',       color: '#f472b6', glow: 'rgba(244,114,182,0.35)', icon: Sparkles   },
  { id: 5, label: 'Financial Model',       short: 'Finance', desc: 'Project your numbers',    color: '#34d399', glow: 'rgba(52,211,153,0.35)',  icon: DollarSign },
  { id: 6, label: 'Production & Sourcing', short: 'Source',  desc: 'Find your suppliers',     color: '#f97316', glow: 'rgba(249,115,22,0.35)',  icon: Package    },
  { id: 7, label: 'Go-to-Market',          short: 'GTM',     desc: '90-day launch plan',      color: '#fbbf24', glow: 'rgba(251,191,36,0.35)',  icon: Map        },
  { id: 8, label: 'Legal Structure',       short: 'Legal',   desc: 'Set up properly',         color: '#22d3ee', glow: 'rgba(34,211,238,0.35)',  icon: BookOpen   },
  { id: 9, label: 'Pitch Builder',         short: 'Pitch',   desc: 'Investor-ready pitch',    color: '#e879f9', glow: 'rgba(232,121,249,0.35)', icon: FileText   },
]

const VIBES      = ['Modern', 'Bold', 'Playful', 'Professional', 'Luxury']
const TEAM_SIZES = ['Just me', '2–3', '4–10', '10+']
const BUDGETS    = ['Self-funded', '$1k–$5k', '$5k–$20k', '$20k+']
const GOALS      = ['First 10 customers', 'Email list', 'Go viral', 'Enterprise']
const FOUNDERS   = ['1', '2', '3', '4+']

const INDUSTRIES = ['SaaS', 'FinTech', 'HealthTech', 'E-Commerce', 'EdTech', 'AI & ML', 'Real Estate', 'Food & Beverage', 'HR Tech', 'CleanTech', 'Gaming', 'Media & Content']
const MARKETS    = ['Consumers (B2C)', 'Small Businesses', 'Enterprise (B2B)', 'Developers', 'Freelancers', 'Students', 'Healthcare Workers', 'Creators & Influencers', 'Parents & Families']
const FUNDING    = ['Self-funded', 'Under $100k', '$100k – $500k', '$500k – $2M', '$2M – $10M', '$10M+']
const LOCATIONS  = ['United States', 'United Kingdom', 'Europe', 'Middle East', 'Asia Pacific', 'Canada', 'Australia', 'Latin America']
const COUNTRIES  = ['United States', 'United Kingdom', 'UAE', 'Canada', 'Australia', 'Singapore', 'Germany', 'Netherlands']

const IDEA_STARTERS = ['A marketplace for…', 'A SaaS tool that helps…', 'A mobile app for…', 'A platform connecting…', 'An AI tool that…', 'A subscription service for…']

/* ─── CSS injected globally ─────────────────────────────────────── */
const GLOBAL_CSS = `
  .ss-input {
    width: 100%; padding: 13px 18px; box-sizing: border-box;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 14px; color: #f1f5f9;
    font-size: 14px; font-family: Geist, Inter, sans-serif;
    outline: none; transition: all 0.25s ease;
  }
  .ss-input::placeholder { color: rgba(255,255,255,0.18); }
  .ss-input.filled {
    background: rgba(255,255,255,0.07);
    border-color: var(--sc, #a78bfa);
    box-shadow:
      0 0 0 2px var(--sc-bg, rgba(167,139,250,0.18)),
      0 0 16px var(--sc-bg, rgba(167,139,250,0.12));
  }
  .ss-input:focus {
    background: rgba(255,255,255,0.09);
    border-color: var(--sc, #a78bfa);
    box-shadow:
      0 0 0 3px var(--sc-bg, rgba(167,139,250,0.25)),
      0 0 28px var(--sc-bg, rgba(167,139,250,0.2)),
      inset 0 0 16px rgba(255,255,255,0.03);
  }
  .ss-pill {
    padding: 8px 18px; border-radius: 99px; cursor: pointer;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; font-weight: 700;
    letter-spacing: 0.04em; border: 1.5px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04); color: #93c5fd;
    transition: all 0.18s ease;
  }
  .ss-pill:hover { color: #e2e8f0; border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.07); }
  .ss-pill.active {
    background: var(--sc-bg, rgba(167,139,250,0.18));
    border-color: var(--sc, #a78bfa);
    color: var(--sc, #a78bfa);
    box-shadow: 0 0 0 3px var(--sc-bg, rgba(167,139,250,0.15)), 0 0 20px var(--sc-bg, rgba(167,139,250,0.2));
  }
  .ss-gen-btn {
    width: 100%; padding: 16px 0; border: none; border-radius: 16px;
    cursor: pointer; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 13px; font-weight: 800; letter-spacing: 0.1em;
    text-transform: uppercase; color: white;
    background: linear-gradient(135deg, var(--sc,#a78bfa), #6d6bfa);
    transition: all 0.25s ease;
    box-shadow: 0 4px 28px var(--sg, rgba(167,139,250,0.4));
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .ss-gen-btn:hover { transform: translateY(-2px); filter: brightness(1.12); box-shadow: 0 8px 40px var(--sg, rgba(167,139,250,0.55)); }
  .ss-gen-btn:active { transform: translateY(0); filter: brightness(0.95); }
  .ss-gen-btn:disabled { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.2); box-shadow: none; cursor: default; transform: none; filter: none; }
  .ss-dot { border-radius: 50% !important; display: block; flex-shrink: 0; }
  .ss-next-btn {
    display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px;
    border-radius: 12px; border: 1.5px solid var(--sc, #a78bfa);
    background: var(--sc-bg, rgba(167,139,250,0.1)); color: var(--sc, #a78bfa);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s;
  }
  .ss-next-btn:hover { background: var(--sc-bg2, rgba(167,139,250,0.2)); transform: translateX(3px); }
  .ss-result-section {
    border-radius: 16px; overflow: hidden;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
  }
  .ss-result-section-head {
    padding: 10px 18px;
    background: rgba(255,255,255,0.03);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .ss-score-card {
    padding: 24px 28px; border-radius: 20px;
    background: linear-gradient(135deg, var(--sc-bg, rgba(167,139,250,0.12)) 0%, rgba(255,255,255,0.02) 100%);
    border: 1.5px solid var(--sc, #a78bfa); border-opacity: 0.3;
    box-shadow: 0 0 60px var(--sg, rgba(167,139,250,0.15));
  }
  .ss-option {
    padding: 9px 12px; border-radius: 10px; cursor: pointer; text-align: left;
    border: 1.5px solid rgba(255,255,255,0.07);
    background: rgba(10,14,28,0.65);
    color: #e2e8f0;
    font-family: Geist, Inter, sans-serif; font-size: 12px;
    transition: all 0.18s ease; width: 100%;
  }
  .ss-option:hover {
    background: var(--sc-bg, rgba(167,139,250,0.1));
    border-color: var(--sc, #a78bfa);
    color: #f1f5f9;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(0,0,0,0.25);
  }
  .ss-option.sel {
    background: var(--sc-bg, rgba(167,139,250,0.18));
    border-color: var(--sc, #a78bfa);
    color: var(--sc, #a78bfa);
    font-weight: 600;
    box-shadow: 0 0 0 2px var(--sc-bg, rgba(167,139,250,0.14)), 0 0 18px var(--sc-bg, rgba(167,139,250,0.12));
    transform: none;
  }
  .ss-option.other-opt { color: #93c5fd; font-style: italic; }
  .ss-option.other-opt:hover { color: #f1f5f9; }
  .ss-starter {
    padding: 5px 14px; border-radius: 20px; cursor: pointer;
    border: 1px solid var(--sc, rgba(167,139,250,0.3));
    background: var(--sc-bg, rgba(167,139,250,0.07));
    color: var(--sc, #a78bfa);
    font-size: 11px; font-family: Geist, Inter, sans-serif;
    transition: all 0.15s; white-space: nowrap;
  }
  .ss-starter:hover {
    background: var(--sc-bg2, rgba(167,139,250,0.16));
    color: #f1f5f9;
  }
  @keyframes ssShimmer { 0% { background-position: -300% center } 100% { background-position: 300% center } }
  @keyframes ssOrb1 { 0%,100% { transform: translate(0,0) scale(1) } 33% { transform: translate(-60px,80px) scale(1.12) } 66% { transform: translate(40px,-40px) scale(0.92) } }
  @keyframes ssOrb2 { 0%,100% { transform: translate(0,0) scale(1) } 40% { transform: translate(70px,-50px) scale(1.08) } 80% { transform: translate(-30px,50px) scale(0.95) } }
  @keyframes ssOrb3 { 0%,100% { transform: translate(0,0) scale(1) } 50% { transform: translate(-40px,30px) scale(1.15) } }
  @keyframes ssRing { 0% { transform: scale(1); opacity: 0.7 } 100% { transform: scale(2.2); opacity: 0 } }
  @keyframes ssFadeUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: none } }
  @keyframes ssGradTitle { 0%,100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }
  @keyframes ssSpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
  @keyframes ssBadgePulse { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }
`

/* ─── shared helpers ─────────────────────────────────────────────── */
function useStepVars(color, glow) {
  return {
    '--sc': color,
    '--sg': glow,
    '--sc-bg': color + '18',
    '--sc-bg2': color + '28',
  }
}

function SInput({ label, textarea, rows = 4, ...props }) {
  const isFilled = props.value != null && String(props.value).trim().length > 0
  const cls = `ss-input${isFilled ? ' filled' : ''}`
  return (
    <div>
      {label && (
        <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: '#7dd3fc', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
          {label}
        </label>
      )}
      {textarea
        ? <textarea rows={rows} className={cls} style={{ resize: 'vertical', lineHeight: 1.7 }} {...props} />
        : <input className={cls} {...props} />
      }
    </div>
  )
}

function Pills({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => (
        <button key={o} className={`ss-pill${value === o ? ' active' : ''}`} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  )
}

function OptionGrid({ options, value, onChange, cols = 3 }) {
  const isCustom = value && !options.includes(value)
  const [otherOpen, setOtherOpen] = useState(isCustom)
  const [otherText, setOtherText] = useState(isCustom ? value : '')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6 }}>
        {options.map(opt => (
          <button key={opt}
            className={`ss-option${value === opt && !otherOpen ? ' sel' : ''}`}
            onClick={() => { setOtherOpen(false); onChange(opt) }}>
            {opt}
          </button>
        ))}
        <button
          className={`ss-option other-opt${otherOpen ? ' sel' : ''}`}
          onClick={() => { setOtherOpen(true); onChange(otherText) }}>
          Other…
        </button>
      </div>
      {otherOpen && (
        <input autoFocus className={`ss-input${otherText ? ' filled' : ''}`}
          placeholder="Type your own…" value={otherText}
          onChange={e => { setOtherText(e.target.value); onChange(e.target.value) }} />
      )}
    </div>
  )
}

function FieldLabel({ color, children }) {
  return (
    <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: color + 'bb', textTransform: 'uppercase', marginBottom: 8 }}>
      {children}
    </p>
  )
}

function GenBtn({ loading, disabled, label = 'Generate' }) {
  return (
    <button type="button" className="ss-gen-btn" disabled={loading || disabled}>
      {loading
        ? <><Loader2 size={16} style={{ animation: 'ssSpin 1s linear infinite' }} /> Generating your results…</>
        : <><Zap size={15} /> {label}</>
      }
    </button>
  )
}

function NextBtn({ onClick, label, color }) {
  return (
    <button className="ss-next-btn" onClick={onClick} style={{ '--sc': color, '--sc-bg': color + '15', '--sc-bg2': color + '28' }}>
      {label} <ArrowRight size={14} />
    </button>
  )
}

function ResultSection({ title, color, children }) {
  return (
    <div className="ss-result-section">
      <div className="ss-result-section-head">
        <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color, textTransform: 'uppercase' }}>{title}</span>
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}

function BulletList({ items, color }) {
  return items?.map((item, i) => (
    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, marginTop: 6, flexShrink: 0 }} />
      <p style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.65 }}>{item}</p>
    </div>
  ))
}

function Tag({ label, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 99,
      border: `1px solid ${color}50`, background: `${color}12`, color,
      fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
    }}>
      {label}
    </span>
  )
}

/* ─── Session Tab ────────────────────────────────────────────────── */
function SessionTab({ session, isActive, stepColor, onSelect, onRename, onDelete, showDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(session.name)

  function commit() {
    const name = draft.trim() || session.name
    setDraft(name); onRename(name); setEditing(false)
  }

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {editing ? (
        <input autoFocus value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(session.name); setEditing(false) } }}
          style={{
            padding: '6px 14px', borderRadius: 20,
            border: `1.5px solid ${stepColor}`,
            background: `${stepColor}15`,
            color: '#f1f5f9', fontFamily: SANS, fontSize: 13,
            outline: 'none', width: 130,
          }}
        />
      ) : (
        <button onClick={onSelect}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px 6px 16px', borderRadius: 20, cursor: 'pointer',
            border: `1.5px solid ${isActive ? stepColor + '70' : 'rgba(255,255,255,0.1)'}`,
            background: isActive ? `${stepColor}14` : 'rgba(255,255,255,0.04)',
            color: isActive ? stepColor : '#93c5fd',
            fontFamily: SANS, fontSize: 13, fontWeight: isActive ? 600 : 400,
            transition: 'all 0.18s', boxShadow: isActive ? `0 0 16px ${stepColor}20` : 'none',
          }}
          onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)' } }}
          onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' } }}
        >
          <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.name}</span>
          <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, color: isActive ? stepColor + 'bb' : '#7dd3fc', background: isActive ? `${stepColor}18` : 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: 99 }}>
            {session.completedSteps?.length || 0}/8
          </span>
          <Pencil size={10} style={{ color: isActive ? stepColor + '80' : 'rgba(255,255,255,0.2)', cursor: 'pointer' }}
            onClick={e => { e.stopPropagation(); setEditing(true) }} />
        </button>
      )}
    </div>
  )
}

/* ─── Step Panels ────────────────────────────────────────────────── */

function IdeaValidatorPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const s = STEPS[0]
  const vars = useStepVars(s.color, s.glow)
  const result = data.ideaResult
  const verdictColor = { pass: '#fb7185', conditional: '#fbbf24', promising: '#38bdf8', strong: '#34d399' }
  const [visibleSec, setVisibleSec] = useState(null)
  const showTimer = useRef(null)
  const hideTimer = useRef(null)

  function hoverIn(id)  { clearTimeout(hideTimer.current); showTimer.current = setTimeout(() => setVisibleSec(id), 900) }
  function hoverOut()   { clearTimeout(showTimer.current); hideTimer.current = setTimeout(() => setVisibleSec(null), 180) }
  function keepOpen()   { clearTimeout(hideTimer.current) }
  function openNow(id)  { clearTimeout(showTimer.current); clearTimeout(hideTimer.current); setVisibleSec(id) }

  async function generate() {
    if (!data.pitch?.trim()) return setError('Describe your idea first.')
    setError(null); setLoading(true)
    try {
      const res = await apiFetch('/api/ai/pitch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch: data.pitch, industry: data.industry, fundingAsk: data.fundingAsk, targetMarket: data.targetMarket }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onUpdate({ ideaResult: json })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div style={vars}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 24, alignItems: 'start', marginBottom: 20 }}>

        {/* LEFT — idea textarea */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <FieldLabel color={s.color}>Your Business Idea</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 2 }}>
            {IDEA_STARTERS.map(st => (
              <button key={st} className="ss-starter" onClick={() => onUpdate({ pitch: st })}>{st}</button>
            ))}
          </div>
          <SInput textarea rows={10}
            placeholder="Describe what your business does, the problem it solves, and who it's for…"
            value={data.pitch || ''} onChange={e => onUpdate({ pitch: e.target.value })} />
        </div>

        {/* RIGHT — selectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <FieldLabel color={s.color}>Industry</FieldLabel>
            <OptionGrid options={INDUSTRIES} value={data.industry} onChange={v => onUpdate({ industry: v })} cols={3} />
          </div>
          <div>
            <FieldLabel color={s.color}>Target Market</FieldLabel>
            <OptionGrid options={MARKETS} value={data.targetMarket} onChange={v => onUpdate({ targetMarket: v })} cols={3} />
          </div>
          <div>
            <FieldLabel color={s.color}>Funding Ask</FieldLabel>
            <OptionGrid options={FUNDING} value={data.fundingAsk} onChange={v => onUpdate({ fundingAsk: v })} cols={3} />
          </div>
        </div>
      </div>

      {/* Generate button — locked once validated */}
      {result ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderRadius: 16, background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
          <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.08em' }}>VALIDATED — update your idea above to re-run</span>
        </div>
      ) : (
        <div onClick={generate}><GenBtn loading={loading} disabled={!data.pitch?.trim()} label="Validate My Idea" /></div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28, animation: 'ssFadeUp 0.5s ease' }}>
          {/* Score card */}
          <div className="ss-score-card" style={vars}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 64, fontWeight: 900, fontFamily: MONO, color: s.color, lineHeight: 1, letterSpacing: '-0.05em' }}>{result.overall_score}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: s.color + '60', letterSpacing: '0.12em', marginTop: 2 }}>OUT OF 100</div>
              </div>
              <div style={{ flex: 1 }}>
                <Tag label={result.verdict?.toUpperCase()} color={verdictColor[result.verdict] || s.color} />
                <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.75, marginTop: 12 }}>{result.executive_summary}</p>
              </div>
            </div>
          </div>

          {/* Sections grid — hover 1s to reveal full detail on the side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {result.sections?.map((sec, i) => {
              const sc = sec.score >= 70 ? '#34d399' : sec.score >= 45 ? '#fbbf24' : '#fb7185'
              const isLeft = i % 2 === 0
              const isVisible = visibleSec === sec.id
              return (
                <div key={sec.id} style={{ position: 'relative' }}
                  onMouseEnter={() => hoverIn(sec.id)}
                  onMouseLeave={hoverOut}
                >
                  {/* card */}
                  <div style={{
                    padding: '14px 16px', borderRadius: 14, cursor: 'default',
                    background: isVisible ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isVisible ? sc + '50' : 'rgba(255,255,255,0.07)'}`,
                    transition: 'all 0.2s ease', overflow: 'hidden', position: 'relative',
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: 2, background: sc, width: `${sec.score}%`, borderRadius: '14px 0 0 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, color: '#93c5fd', letterSpacing: '0.1em', textTransform: 'uppercase', flex: 1, paddingRight: 8 }}>{sec.title}</p>
                      <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: sc, flexShrink: 0 }}>{sec.score}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sec.analysis}</p>
                    <button onClick={() => openNow(sec.id)} style={{ fontFamily: MONO, fontSize: 8, color: sc + 'cc', letterSpacing: '0.08em', marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      HOVER OR CLICK TO READ MORE →
                    </button>
                  </div>

                  {/* side popover — no blur, no modal, stays on page level */}
                  {isVisible && (
                    <div
                      onMouseEnter={keepOpen}
                      onMouseLeave={hoverOut}
                      style={{
                        position: 'absolute',
                        top: 0,
                        ...(isLeft
                          ? { left: 'calc(100% + 10px)' }
                          : { right: 'calc(100% + 10px)' }
                        ),
                        width: '100%',
                        zIndex: 50,
                        background: 'linear-gradient(160deg, rgba(8,12,28,0.98) 0%, rgba(6,9,18,0.99) 100%)',
                        border: `1px solid ${sc}45`,
                        borderRadius: 16,
                        padding: '16px 18px',
                        boxShadow: `0 8px 40px rgba(0,0,0,0.55), 0 0 24px ${sc}12`,
                        animation: 'ssFadeUp 0.18s ease',
                      }}
                    >
                      <div style={{ height: 2, background: `linear-gradient(90deg, ${sc}, ${sc}30)`, borderRadius: 99, marginBottom: 14 }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <p style={{ fontFamily: MONO, fontSize: 8, fontWeight: 800, color: '#93c5fd', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>{sec.title}</p>
                          <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 900, color: sc, letterSpacing: '-0.04em', lineHeight: 1 }}>{sec.score}</span>
                          <span style={{ fontFamily: MONO, fontSize: 13, color: sc + '55' }}>/100</span>
                        </div>
                        <button onClick={() => setVisibleSec(null)} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                      </div>
                      <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.75, marginBottom: sec.flags?.length ? 14 : 0 }}>{sec.analysis}</p>
                      {sec.flags?.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <p style={{ fontFamily: MONO, fontSize: 8, fontWeight: 800, color: '#fb7185', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Concerns</p>
                          {sec.flags.map((f, fi) => (
                            <div key={fi} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                              <AlertCircle size={11} style={{ color: '#fb7185', marginTop: 2, flexShrink: 0 }} />
                              <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.6 }}>{f}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {sec.positives?.length > 0 && (
                        <div>
                          <p style={{ fontFamily: MONO, fontSize: 8, fontWeight: 800, color: '#34d399', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Positives</p>
                          {sec.positives.map((p, pi) => (
                            <div key={pi} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                              <Check size={11} style={{ color: '#34d399', marginTop: 2, flexShrink: 0 }} />
                              <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.6 }}>{p}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <ResultSection title="What Works" color="#34d399">
              <BulletList items={result.what_works} color="#34d399" />
            </ResultSection>
            <ResultSection title="Critical Questions" color="#fbbf24">
              {result.critical_questions?.map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <AlertCircle size={12} style={{ color: '#fbbf24', marginTop: 1, flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.6 }}>{q}</p>
                </div>
              ))}
            </ResultSection>
          </div>

          <ResultSection title="Recommendation" color={s.color}>
            <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.8 }}>{result.recommendation}</p>
          </ResultSection>

          <NextBtn onClick={onNext} label="Continue to Competitor Intel" color={s.color} />
        </div>
      )}
    </div>
  )
}

function CompetitorPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const s = STEPS[1]
  const vars = useStepVars(s.color, s.glow)
  const result = data.competitorResult
  const threatColor = { High: '#fb7185', Medium: '#fbbf24', Low: '#34d399' }

  async function generate() {
    setError(null); setLoading(true)
    try {
      const res = await apiFetch('/api/ai/startup/competitor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: data.pitch, industry: data.industry, targetMarket: data.targetMarket, knownCompetitors: data.knownCompetitors }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onUpdate({ competitorResult: json })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div style={vars}>
      {/* context card — shows what the AI will use */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Idea', value: data.pitch?.slice(0, 60) + (data.pitch?.length > 60 ? '…' : '') },
          { label: 'Industry', value: data.industry || '—' },
          { label: 'Target Market', value: data.targetMarket || '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: '12px 14px', borderRadius: 12, background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
            <p style={{ fontFamily: MONO, fontSize: 8, fontWeight: 800, color: s.color, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</p>
            <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.5 }}>{value}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13, color: '#7dd3fc', lineHeight: 1.65, marginBottom: 18 }}>
        We'll automatically identify who's competing in your space, their strengths and gaps, and where you can win — no input needed from you.
      </p>

      {result ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderRadius: 16, background: `rgba(${s.color === '#fb7185' ? '251,113,133' : '52,211,153'},0.07)`, border: `1px solid ${s.color}30`, marginBottom: 4 }}>
          <CheckCircle2 size={16} style={{ color: s.color, flexShrink: 0 }} />
          <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: '0.08em' }}>COMPETITION MAPPED — update Step 1 to re-run</span>
        </div>
      ) : (
        <div onClick={generate}><GenBtn loading={loading} disabled={!data.pitch} label="Map the Competition" /></div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28, animation: 'ssFadeUp 0.5s ease' }}>
          <ResultSection title="Market Overview" color={s.color}>
            <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.8 }}>{result.market_overview}</p>
          </ResultSection>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.competitors?.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr auto', gap: 16, padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', alignItems: 'start' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 3 }}>{c.name}</p>
                  <p style={{ fontFamily: MONO, fontSize: 9, color: '#93c5fd' }}>{c.founded} · {c.funding}</p>
                </div>
                <div>
                  <p style={{ fontFamily: MONO, fontSize: 8, color: '#34d399', letterSpacing: '0.1em', marginBottom: 5 }}>STRENGTH</p>
                  <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.5 }}>{c.strength}</p>
                </div>
                <div>
                  <p style={{ fontFamily: MONO, fontSize: 8, color: '#fb7185', letterSpacing: '0.1em', marginBottom: 5 }}>WEAKNESS</p>
                  <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.5 }}>{c.weakness}</p>
                </div>
                <Tag label={c.threat_level?.toUpperCase()} color={threatColor[c.threat_level] || s.color} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <ResultSection title="Gaps You Can Exploit" color="#34d399">
              <BulletList items={result.market_gaps} color="#34d399" />
            </ResultSection>
            <ResultSection title="Your Winning Angle" color={s.color}>
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>{result.your_angle}</p>
            </ResultSection>
          </div>
          <NextBtn onClick={onNext} label="Continue to Business Model" color={s.color} />
        </div>
      )}
    </div>
  )
}

function BusinessModelPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const s = STEPS[2]
  const vars = useStepVars(s.color, s.glow)
  const result = data.businessModelResult
  const priorityColor = { Primary: '#34d399', Secondary: '#38bdf8', Future: '#93c5fd' }

  async function generate() {
    setError(null); setLoading(true)
    try {
      const res = await apiFetch('/api/ai/startup/business-model', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: data.pitch, industry: data.industry, targetMarket: data.targetMarket, competitors: data.competitorResult?.competitors }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onUpdate({ businessModelResult: json })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div style={vars}>
      <div style={{ padding: 14, borderRadius: 14, background: `${s.color}08`, border: `1px solid ${s.color}20`, marginBottom: 18 }}>
        <p style={{ fontFamily: MONO, fontSize: 9, color: s.color + 'aa', letterSpacing: '0.1em', marginBottom: 6 }}>YOUR IDEA</p>
        <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{data.pitch?.slice(0, 160)}…</p>
      </div>
      <div onClick={generate}><GenBtn loading={loading} disabled={!data.pitch} label="Build My Business Model" /></div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28, animation: 'ssFadeUp 0.5s ease' }}>
          <div className="ss-score-card" style={{ ...vars, padding: '22px 26px', borderRadius: 18, background: `linear-gradient(135deg, ${s.color}12, rgba(255,255,255,0.02))`, border: `1.5px solid ${s.color}40` }}>
            <p style={{ fontFamily: MONO, fontSize: 9, color: s.color, letterSpacing: '0.14em', marginBottom: 8 }}>RECOMMENDED MODEL</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.03em', marginBottom: 12 }}>{result.recommended_model}</p>
            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.75 }}>{result.why}</p>
          </div>
          <ResultSection title="Revenue Streams" color={s.color}>
            {result.revenue_streams?.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', marginBottom: 8 }}>
                <Tag label={r.priority} color={priorityColor[r.priority] || s.color} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{r.stream}</p>
                  <p style={{ fontSize: 11, color: '#93c5fd' }}>{r.description}</p>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: '#34d399', whiteSpace: 'nowrap' }}>{r.typical_margin}</span>
              </div>
            ))}
          </ResultSection>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <ResultSection title="Pricing Strategy" color={s.color}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{result.pricing_strategy?.approach}</p>
              <p style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: s.color, marginBottom: 10 }}>{result.pricing_strategy?.suggested_price_range}</p>
              <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.6 }}>{result.pricing_strategy?.reasoning}</p>
            </ResultSection>
            <ResultSection title="Unit Economics" color={s.color}>
              {[['CAC', result.unit_economics?.cac_estimate], ['LTV', result.unit_economics?.ltv_estimate], ['LTV:CAC', result.unit_economics?.ltv_cac_ratio], ['Payback', result.unit_economics?.payback_period]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: '#e2e8f0', letterSpacing: '0.08em' }}>{l}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 800, color: '#e2e8f0' }}>{v}</span>
                </div>
              ))}
            </ResultSection>
          </div>
          <NextBtn onClick={onNext} label="Continue to Name Studio" color={s.color} />
        </div>
      )}
    </div>
  )
}

function NameStudioPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const s = STEPS[3]
  const vars = useStepVars(s.color, s.glow)
  const result = data.nameResult
  const scoreColor = sc => sc >= 8 ? '#34d399' : sc >= 6 ? '#fbbf24' : '#e2e8f0'

  async function generate() {
    setError(null); setLoading(true)
    try {
      const res = await apiFetch('/api/ai/startup/name-studio', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: data.pitch, industry: data.industry, targetMarket: data.targetMarket, vibe: data.nameVibe || 'Modern', keywords: data.nameKeywords }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onUpdate({ nameResult: json })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div style={vars}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <FieldLabel color={s.color}>Brand Vibe</FieldLabel>
            <Pills options={VIBES} value={data.nameVibe || 'Modern'} onChange={v => onUpdate({ nameVibe: v })} />
          </div>
          <SInput label="Keywords (optional)" placeholder="e.g. fast, smart, connect"
            value={data.nameKeywords || ''} onChange={e => onUpdate({ nameKeywords: e.target.value })} />
        </div>
        <div onClick={generate}><GenBtn loading={loading} disabled={!data.pitch} label="Generate 10 Brand Names" /></div>
      </div>

      {result && (
        <div style={{ marginTop: 28, animation: 'ssFadeUp 0.5s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {result.names?.map((n, i) => {
              const selected = data.selectedName === n.name
              return (
                <div key={i} onClick={() => onUpdate({ selectedName: n.name })}
                  style={{
                    padding: 18, borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
                    background: selected ? `${s.color}12` : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${selected ? s.color + '60' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: selected ? `0 0 28px ${s.glow}` : 'none',
                    transform: selected ? 'translateY(-2px)' : 'none',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 20, fontWeight: 900, color: selected ? s.color : '#f1f5f9', letterSpacing: '-0.03em' }}>{n.name}</p>
                      <p style={{ fontFamily: MONO, fontSize: 9, color: '#7dd3fc', marginTop: 2 }}>{n.domain_hint}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={11} style={{ color: scoreColor(n.score) }} />
                      <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 900, color: scoreColor(n.score) }}>{n.score}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#e2e8f0', fontStyle: 'italic', marginBottom: 8 }}>"{n.tagline}"</p>
                  <p style={{ fontSize: 11, color: '#93c5fd', lineHeight: 1.5 }}>{n.why}</p>
                  {selected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
                      <Check size={12} style={{ color: s.color }} />
                      <span style={{ fontFamily: MONO, fontSize: 9, color: s.color, fontWeight: 800, letterSpacing: '0.06em' }}>SELECTED</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <NextBtn onClick={onNext} label="Continue to Financial Model" color={s.color} />
        </div>
      )}
    </div>
  )
}

function FinancialPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const s = STEPS[4]
  const vars = useStepVars(s.color, s.glow)
  const result = data.financialResult

  async function generate() {
    setError(null); setLoading(true)
    try {
      const res = await apiFetch('/api/ai/startup/financial', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: data.pitch, businessModel: data.businessModelResult?.recommended_model, pricingStrategy: data.businessModelResult?.pricing_strategy, teamSize: data.teamSize || 'Just me', location: data.location }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onUpdate({ financialResult: json })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div style={vars}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          <div>
            <FieldLabel color={s.color}>Team Size</FieldLabel>
            <Pills options={TEAM_SIZES} value={data.teamSize || 'Just me'} onChange={v => onUpdate({ teamSize: v })} />
          </div>
          <div>
            <FieldLabel color={s.color}>Location / Market</FieldLabel>
            <OptionGrid options={LOCATIONS} value={data.location} onChange={v => onUpdate({ location: v })} cols={2} />
          </div>
        </div>
        <div onClick={generate}><GenBtn loading={loading} disabled={!data.pitch} label="Build Financial Projections" /></div>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28, animation: 'ssFadeUp 0.5s ease' }}>
          <ResultSection title="3-Year Revenue Projection" color={s.color}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Metric', 'Year 1', 'Year 2', 'Year 3'].map(h => (
                    <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontFamily: MONO, fontSize: 9, color: '#7dd3fc', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {[['Revenue','revenue'],['Gross Profit','gross_profit'],['Net','net'],['Customers','customers_eoy'],['MRR (EOY)','mrr_eoy']].map(([label, key]) => (
                    <tr key={key}>
                      <td style={{ padding: '9px 14px', fontFamily: MONO, fontSize: 10, color: '#93c5fd', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{label}</td>
                      {['year1','year2','year3'].map(yr => {
                        const val = result[yr]?.[key] || '—'
                        const neg = key === 'net' && String(val).startsWith('-')
                        return <td key={yr} style={{ padding: '9px 14px', fontFamily: MONO, fontSize: 12, fontWeight: 800, color: key==='net'?(neg?'#fb7185':'#34d399'):'#f1f5f9', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{val}</td>
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ResultSection>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <ResultSection title="Startup Costs" color={s.color}>
              {result.startup_costs?.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 12, color: '#e2e8f0' }}>{c.item}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: '#f1f5f9' }}>{c.amount}</span>
                    <Tag label={c.type} color="#93c5fd" />
                  </div>
                </div>
              ))}
            </ResultSection>
            <ResultSection title="Key Milestones" color={s.color}>
              <div style={{ padding: '14px 18px', borderRadius: 12, background: `${s.color}12`, border: `1px solid ${s.color}30`, marginBottom: 12 }}>
                <p style={{ fontFamily: MONO, fontSize: 9, color: s.color, letterSpacing: '0.1em', marginBottom: 6 }}>BREAK-EVEN MONTH</p>
                <p style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', fontFamily: MONO }}>#{result.break_even_month}</p>
              </div>
              <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.6 }}>{result.fundraising_note}</p>
            </ResultSection>
          </div>
          <NextBtn onClick={onNext} label="Continue to Production & Sourcing" color={s.color} />
        </div>
      )}
    </div>
  )
}

const SOURCING_SCOPE = ['Global', 'Local / Regional']
const POPULAR_COUNTRIES = ['China', 'USA', 'India', 'Germany', 'Vietnam', 'Turkey', 'Mexico', 'South Korea', 'Italy', 'Bangladesh', 'Any']

function ProductionPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const s = STEPS[5]
  const vars = useStepVars(s.color, s.glow)
  const result = data.productionResult
  const [copied, setCopied] = useState(false)
  const [scope, setScope] = useState(data.sourcingScope || 'Global')
  const [country, setCountry] = useState(data.preferredCountry || 'Any')

  async function generate() {
    setError(null); setLoading(true)
    onUpdate({ sourcingScope: scope, preferredCountry: country })
    try {
      const res = await apiFetch('/api/ai/startup/production', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: data.pitch, industry: data.industry, businessModel: data.businessModelResult?.recommended_model,
          pricingStrategy: data.businessModelResult?.pricing_strategy, targetMarket: data.targetMarket,
          sourcingScope: scope, preferredCountry: country === 'Any' ? null : country,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onUpdate({ productionResult: json })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  function copyTemplate() {
    if (!result?.outreach_template) return
    navigator.clipboard.writeText(result.outreach_template).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div style={vars}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 20 }}>
        <div>
          <FieldLabel color={s.color}>Sourcing Scope</FieldLabel>
          <Pills options={SOURCING_SCOPE} value={scope} onChange={setScope} />
        </div>
        <div>
          <FieldLabel color={s.color}>Preferred Supplier Country</FieldLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {POPULAR_COUNTRIES.map(c => (
              <button key={c} onClick={() => setCountry(c)} style={{
                padding: '6px 14px', fontSize: 12, fontFamily: 'Geist, Inter, sans-serif', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                background: country === c ? `${s.color}18` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${country === c ? s.color : 'rgba(255,255,255,0.08)'}`,
                color: country === c ? s.color : '#94a3b8', fontWeight: country === c ? 600 : 400,
              }}>{c}</button>
            ))}
          </div>
        </div>
      </div>
      <div onClick={generate}><GenBtn loading={loading} disabled={!data.pitch} label="Find My Suppliers" /></div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28, animation: 'ssFadeUp 0.5s ease' }}>
          <ResultSection title="Overview" color={s.color}>
            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.75 }}>{result.overview}</p>
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: `${s.color}15`, border: `1px solid ${s.color}30`, borderRadius: 6 }}>
              <Package size={12} style={{ color: s.color }} />
              <span style={{ fontFamily: MONO, fontSize: 10, color: s.color, fontWeight: 600 }}>{result.production_type}</span>
            </div>
          </ResultSection>

          <ResultSection title="Supplier Platforms" color={s.color}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.supplier_platforms?.map((p, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{p.name}</span>
                    <Tag label={p.cost_position} color={p.cost_position === 'Budget' ? '#34d399' : p.cost_position === 'Premium' ? '#f472b6' : s.color} />
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{p.best_for}</p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: '#64748b' }}>MOQ: {p.moq_range}</span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: '#64748b' }}>{p.url}</span>
                  </div>
                  {p.how_to_use && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, fontStyle: 'italic' }}>{p.how_to_use}</p>}
                </div>
              ))}
            </div>
          </ResultSection>

          <ResultSection title="Outreach Template" color="#34d399">
            <div style={{ position: 'relative' }}>
              <pre style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.75, whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '12px 14px', margin: 0 }}>
                {result.outreach_template}
              </pre>
              <button onClick={copyTemplate} style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, color: copied ? '#34d399' : '#94a3b8', fontSize: 11, cursor: 'pointer', fontFamily: MONO }}>
                <Copy size={11} />{copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </ResultSection>

          {result.cost_breakdown?.length > 0 && (
            <ResultSection title="Cost Breakdown" color={s.color}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.cost_breakdown.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < result.cost_breakdown.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div>
                      <span style={{ fontSize: 13, color: '#e2e8f0' }}>{c.item}</span>
                      {c.notes && <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{c.notes}</p>}
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: s.color, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 12 }}>{c.typical_range}</span>
                  </div>
                ))}
              </div>
            </ResultSection>
          )}

          {result.negotiation_tips?.length > 0 && (
            <ResultSection title="Negotiation Tips" color="#fbbf24">
              <BulletList items={result.negotiation_tips} color="#fbbf24" />
            </ResultSection>
          )}

          {result.red_flags?.length > 0 && (
            <ResultSection title="Red Flags to Watch" color="#fb7185">
              <BulletList items={result.red_flags} color="#fb7185" />
            </ResultSection>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 8 }}>
            <Package size={14} style={{ color: s.color, flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: '#cbd5e1' }}>
              <span style={{ color: s.color, fontWeight: 600 }}>Timeline: </span>{result.total_timeline}
            </p>
          </div>

          <NextBtn onClick={onNext} label="Continue to Go-to-Market" color={STEPS[6].color} />
        </div>
      )}
    </div>
  )
}

function GTMPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const s = STEPS[6]
  const vars = useStepVars(s.color, s.glow)
  const result = data.gtmResult
  const [open, setOpen] = useState(new Set([1, 2, 3]))
  const toggle = w => setOpen(p => { const n = new Set(p); n.has(w) ? n.delete(w) : n.add(w); return n })
  const focusC = { Foundation: '#a78bfa', Outreach: '#38bdf8', Launch: '#34d399', Scale: '#fbbf24' }

  async function generate() {
    setError(null); setLoading(true)
    try {
      const res = await apiFetch('/api/ai/startup/gtm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: data.pitch, targetMarket: data.targetMarket, businessModel: data.businessModelResult?.recommended_model, budget: data.marketingBudget || 'Self-funded', goal: data.gtmGoal || 'First 10 customers' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onUpdate({ gtmResult: json })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div style={vars}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <FieldLabel color={s.color}>Budget</FieldLabel>
            <Pills options={BUDGETS} value={data.marketingBudget || 'Self-funded'} onChange={v => onUpdate({ marketingBudget: v })} />
          </div>
          <div>
            <FieldLabel color={s.color}>Primary Goal</FieldLabel>
            <Pills options={GOALS} value={data.gtmGoal || 'First 10 customers'} onChange={v => onUpdate({ gtmGoal: v })} />
          </div>
        </div>
        <div onClick={generate}><GenBtn loading={loading} disabled={!data.pitch} label="Build My Launch Plan" /></div>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28, animation: 'ssFadeUp 0.5s ease' }}>
          <ResultSection title="Strategy" color={s.color}>
            <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.8 }}>{result.strategy_summary}</p>
          </ResultSection>
          <ResultSection title="Getting Your First 10 Customers" color="#34d399">
            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.75 }}>{result.first_10_customers}</p>
          </ResultSection>
          <ResultSection title="12-Week Action Plan" color={s.color}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {result.weeks?.map(w => (
                <div key={w.week} style={{ borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <button onClick={() => toggle(w.week)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${focusC[w.focus] || s.color}18`, border: `1px solid ${focusC[w.focus] || s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 900, color: focusC[w.focus] || s.color }}>{w.week}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{w.theme}</p>
                      <p style={{ fontFamily: MONO, fontSize: 9, color: '#e2e8f0', marginTop: 1 }}>{w.milestone}</p>
                    </div>
                    <Tag label={w.focus} color={focusC[w.focus] || s.color} />
                    {open.has(w.week) ? <ChevronUp size={13} style={{ color: '#93c5fd', flexShrink: 0 }} /> : <ChevronDown size={13} style={{ color: '#93c5fd', flexShrink: 0 }} />}
                  </button>
                  {open.has(w.week) && (
                    <div style={{ padding: '0 14px 12px 54px' }}>
                      <BulletList items={w.actions} color={focusC[w.focus] || s.color} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ResultSection>
          <NextBtn onClick={onNext} label="Continue to Legal Structure" color={STEPS[7].color} />
        </div>
      )}
    </div>
  )
}

function LegalPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const s = STEPS[7]
  const vars = useStepVars(s.color, s.glow)
  const result = data.legalResult

  async function generate() {
    if (!data.legalCountry?.trim()) return setError('Please enter your country.')
    setError(null); setLoading(true)
    try {
      const res = await apiFetch('/api/ai/startup/legal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: data.pitch, country: data.legalCountry, founders: data.founders || '1', businessType: data.industry }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onUpdate({ legalResult: json })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div style={vars}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          <div>
            <FieldLabel color={s.color}>Country of Registration</FieldLabel>
            <OptionGrid options={COUNTRIES} value={data.legalCountry} onChange={v => onUpdate({ legalCountry: v })} cols={2} />
          </div>
          <div>
            <FieldLabel color={s.color}>Number of Founders</FieldLabel>
            <Pills options={FOUNDERS} value={data.founders || '1'} onChange={v => onUpdate({ founders: v })} />
          </div>
        </div>
        <div onClick={generate}><GenBtn loading={loading} disabled={!data.pitch} label="Get Legal Advice" /></div>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28, animation: 'ssFadeUp 0.5s ease' }}>
          <div style={{ padding: '22px 26px', borderRadius: 18, background: `linear-gradient(135deg, ${s.color}10, rgba(255,255,255,0.02))`, border: `1.5px solid ${s.color}40` }}>
            <p style={{ fontFamily: MONO, fontSize: 9, color: s.color, letterSpacing: '0.14em', marginBottom: 8 }}>RECOMMENDED STRUCTURE</p>
            <p style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.03em', marginBottom: 12 }}>{result.recommended_structure}</p>
            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.75 }}>{result.why}</p>
          </div>
          <ResultSection title="Registration Steps" color={s.color}>
            {result.registration_steps?.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', marginBottom: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${s.color}18`, border: `1px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 900, color: s.color }}>{step.step}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{step.action}</p>
                  <p style={{ fontFamily: MONO, fontSize: 9, color: '#93c5fd' }}>{step.timeline} · {step.cost} · {step.service}</p>
                </div>
              </div>
            ))}
          </ResultSection>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <ResultSection title="Key Considerations" color={s.color}>
              <BulletList items={result.key_considerations} color={s.color} />
            </ResultSection>
            <ResultSection title="Tax & IP" color={s.color}>
              <p style={{ fontFamily: MONO, fontSize: 8, color: s.color, letterSpacing: '0.1em', marginBottom: 6 }}>TAX OVERVIEW</p>
              <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.6, marginBottom: 12 }}>{result.tax_overview}</p>
              <p style={{ fontFamily: MONO, fontSize: 8, color: s.color, letterSpacing: '0.1em', marginBottom: 6 }}>IP PROTECTION</p>
              <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.6 }}>{result.ip_advice}</p>
            </ResultSection>
          </div>
          <NextBtn onClick={onNext} label="Continue to Pitch Builder" color={s.color} />
        </div>
      )}
    </div>
  )
}

function PitchBuilderPanel({ data, onUpdate, loading, setLoading, setError }) {
  const s = STEPS[8]
  const vars = useStepVars(s.color, s.glow)
  const result = data.pitchBuilderResult
  const slideColors = ['#a78bfa','#fb7185','#38bdf8','#f472b6','#34d399','#fbbf24','#22d3ee','#fb923c','#a78bfa','#34d399']

  async function generate() {
    setError(null); setLoading(true)
    try {
      const res = await apiFetch('/api/ai/startup/pitch-builder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: data.pitch, industry: data.industry, targetMarket: data.targetMarket, businessModel: data.businessModelResult?.recommended_model, financials: data.financialResult, competitors: data.competitorResult?.competitors, gtm: data.gtmResult, fundingAsk: data.fundingAsk, equity: data.pitchEquity }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onUpdate({ pitchBuilderResult: json })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div style={vars}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <SInput label="Equity Offered (optional)" placeholder="e.g. 10%"
          value={data.pitchEquity || ''} onChange={e => onUpdate({ pitchEquity: e.target.value })} />
        <div onClick={generate}><GenBtn loading={loading} disabled={!data.pitch} label="Build My Investor Pitch" /></div>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28, animation: 'ssFadeUp 0.5s ease' }}>
          <div style={{ padding: '22px 26px', borderRadius: 18, background: `linear-gradient(135deg, ${s.color}10, rgba(255,255,255,0.02))`, border: `1.5px solid ${s.color}40` }}>
            <p style={{ fontFamily: MONO, fontSize: 9, color: s.color, letterSpacing: '0.14em', marginBottom: 6 }}>INVESTOR PITCH DECK</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', marginBottom: 8 }}>{result.deck_title}</p>
            <p style={{ fontSize: 14, color: '#cbd5e1', fontStyle: 'italic' }}>{result.one_liner}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
            <ResultSection title="Strongest Slide" color="#34d399">
              <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>{result.strongest_slide}</p>
            </ResultSection>
            <ResultSection title="Needs Most Work" color="#fb7185">
              <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>{result.weakest_slide}</p>
            </ResultSection>
          </div>
          {result.slides?.map((sl, i) => (
            <div key={sl.number} style={{ padding: 18, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${slideColors[i]}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: slideColors[i] + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 900, color: slideColors[i] }}>{sl.number}</span>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{sl.title}</p>
                  <p style={{ fontFamily: MONO, fontSize: 9, color: '#93c5fd' }}>{sl.key_message}</p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: slideColors[i], fontStyle: 'italic', marginBottom: 10 }}>"{sl.hook}"</p>
              <BulletList items={sl.bullets} color={slideColors[i]} />
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '8px 12px', borderRadius: 8, background: slideColors[i] + '08', border: `1px solid ${slideColors[i]}20`, marginTop: 10 }}>
                <Sparkles size={11} style={{ color: slideColors[i], marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontFamily: MONO, fontSize: 9, color: slideColors[i] + 'cc', lineHeight: 1.5 }}>{sl.design_tip}</p>
              </div>
            </div>
          ))}
          <ResultSection title="Investor Notes" color={s.color}>
            <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.8 }}>{result.investor_notes}</p>
          </ResultSection>
        </div>
      )}
    </div>
  )
}

function StepContent({ id, data, onUpdate, onGoTo, loading, setLoading, setError }) {
  const next = () => onGoTo(id + 1)
  const p = { data, onUpdate, onNext: next, loading, setLoading, setError }
  switch (id) {
    case 1: return <IdeaValidatorPanel  {...p} />
    case 2: return <CompetitorPanel     {...p} />
    case 3: return <BusinessModelPanel  {...p} />
    case 4: return <NameStudioPanel     {...p} />
    case 5: return <FinancialPanel      {...p} />
    case 6: return <ProductionPanel     {...p} />
    case 7: return <GTMPanel            {...p} />
    case 8: return <LegalPanel          {...p} />
    case 9: return <PitchBuilderPanel   data={data} onUpdate={onUpdate} loading={loading} setLoading={setLoading} setError={setError} />
    default: return null
  }
}

/* ─── MAIN ────────────────────────────────────────────────────────── */
export default function StartupStudio() {
  const resultKeys = ['ideaResult','competitorResult','businessModelResult','nameResult','financialResult','productionResult','gtmResult','legalResult','pitchBuilderResult']

  // ── session bootstrap ──────────────────────────────────────────
  const [sessions, setSessions] = useState(() => {
    const saved = readSessions()
    if (!saved.length) { const first = newSession(1); writeSessions([first]); return [first] }
    return saved
  })

  const [currentId, setCurrentId] = useState(() => {
    try { return localStorage.getItem(ACTIVE_KEY) || sessions[0].id } catch { return sessions[0].id }
  })

  const current = sessions.find(s => s.id === currentId) || sessions[0]

  const [active, setActive]   = useState(current.activeStep || 1)
  const [done,   setDone]     = useState(new Set(current.completedSteps || []))
  const [data,   setData]     = useState({ ...EMPTY_DATA, ...current.data })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // ── persist helpers ───────────────────────────────────────────
  function persist(newActive, newDone, newData, id = currentId) {
    setSessions(prev => {
      const updated = prev.map(s => s.id === id ? {
        ...s, activeStep: newActive, completedSteps: [...newDone], data: newData, updated: Date.now()
      } : s)
      writeSessions(updated)
      return updated
    })
  }

  function update(partial) {
    const newData = { ...data, ...partial }
    setData(newData)
    const key = resultKeys[active - 1]
    let newDone = done
    if (key && partial[key]) { newDone = new Set(done); newDone.add(active); setDone(newDone) }
    persist(active, newDone, newData)
  }

  function goTo(id) {
    const maxReach = done.size > 0 ? Math.max(...[...done]) + 1 : 1
    if (id <= maxReach || done.has(id)) {
      setActive(id); setError(null)
      persist(id, done, data)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // ── session switching ─────────────────────────────────────────
  function switchSession(id) {
    persist(active, done, data)
    const sess = sessions.find(s => s.id === id)
    if (!sess) return
    setCurrentId(id)
    setActive(sess.activeStep || 1)
    setDone(new Set(sess.completedSteps || []))
    setData({ ...EMPTY_DATA, ...sess.data })
    setError(null)
    try { localStorage.setItem(ACTIVE_KEY, id) } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function addSession() {
    const n = sessions.length + 1
    const sess = newSession(n)
    const updated = [...sessions, sess]
    setSessions(updated); writeSessions(updated)
    setCurrentId(sess.id)
    setActive(1); setDone(new Set()); setData({ ...EMPTY_DATA }); setError(null)
    try { localStorage.setItem(ACTIVE_KEY, sess.id) } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function renameSession(id, name) {
    setSessions(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, name } : s)
      writeSessions(updated); return updated
    })
  }

  const step = STEPS[active - 1]
  const maxReach = done.size > 0 ? Math.max(...[...done]) + 1 : 1

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', fontFamily: SANS, paddingBottom: 80, position: 'relative' }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── Orbs ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)', animation: 'ssOrb1 28s ease-in-out infinite', filter: 'blur(2px)' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-12%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 65%)', animation: 'ssOrb2 34s ease-in-out infinite', filter: 'blur(2px)' }} />
        <div style={{ position: 'absolute', top: '35%', right: '15%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 65%)', animation: 'ssOrb3 22s ease-in-out infinite', filter: 'blur(2px)' }} />
        {/* dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Hero ── */}
        <div style={{ paddingTop: 8, paddingBottom: 32 }}>
          {/* eyebrow — editorial style, no badge */}
          <p style={{
            fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.28em',
            color: '#a78bfa', textTransform: 'uppercase', marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            Startup Studio
            <span style={{ display: 'inline-block', flex: 1, maxWidth: 48, height: '0.5px', background: 'linear-gradient(90deg, #a78bfa60, transparent)' }} />
          </p>

          {/* title — contrast weight: italic light + heavy bold */}
          <h1 style={{ margin: '0 0 28px', lineHeight: 1.05 }}>
            <span style={{
              display: 'block',
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 44, fontWeight: 400, fontStyle: 'italic',
              color: 'rgba(255,255,255,0.38)', letterSpacing: '-0.01em',
              marginBottom: 2,
            }}>
              Turn your idea into
            </span>
            <span style={{
              display: 'block',
              fontFamily: SANS,
              fontSize: 60, fontWeight: 900, letterSpacing: '-0.05em',
              background: 'linear-gradient(120deg, #c4b5fd 0%, #a78bfa 25%, #60a5fa 65%, #34d399 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 0.95,
            }}>
              a real business.
            </span>
          </h1>
        </div>

        {/* ── Session tabs ── */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24, overflowX: 'auto', paddingBottom: 2 }}>
          {sessions.map(sess => (
            <SessionTab
              key={sess.id}
              session={sess}
              isActive={sess.id === currentId}
              stepColor={step.color}
              onSelect={() => switchSession(sess.id)}
              onRename={name => renameSession(sess.id, name)}
            />
          ))}
          <button onClick={addSession}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 20, cursor: 'pointer', flexShrink: 0,
              border: '1.5px dashed rgba(255,255,255,0.18)',
              background: 'transparent', color: '#93c5fd',
              fontFamily: SANS, fontSize: 13, transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = step.color; e.currentTarget.style.color = step.color }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#93c5fd' }}
          >
            <Plus size={13} /> New Pitch
          </button>
        </div>

        {/* ── Step Timeline ── */}
        <div style={{ marginBottom: 28, position: 'relative' }}>
          {/* wavy SVG connector — masked so line never enters circles */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 52, zIndex: 0, overflow: 'visible' }}
            viewBox="0 0 100 52" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor={step.color} />
              </linearGradient>
              {/* mask punches out each circle so line only shows in gaps — 9 circles */}
              <mask id="waveMask">
                <rect x="0" y="0" width="100" height="52" fill="white" />
                {[5.56, 16.67, 27.78, 38.89, 50, 61.11, 72.22, 83.33, 94.44].map((cx, i) => (
                  <ellipse key={i} cx={cx} cy={26} rx={3.0} ry={26} fill="black" />
                ))}
              </mask>
            </defs>
            {/* background wave — 9 nodes */}
            <path
              d="M5.56,26 C8.33,14 13.89,14 16.67,26 C19.44,38 25.0,38 27.78,26 C30.56,14 36.11,14 38.89,26 C41.67,38 47.22,38 50,26 C52.78,14 58.33,14 61.11,26 C63.89,38 69.44,38 72.22,26 C75.0,14 80.56,14 83.33,26 C86.11,38 91.67,38 94.44,26"
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.7"
              mask="url(#waveMask)" />
            {/* progress wave */}
            <path
              d="M5.56,26 C8.33,14 13.89,14 16.67,26 C19.44,38 25.0,38 27.78,26 C30.56,14 36.11,14 38.89,26 C41.67,38 47.22,38 50,26 C52.78,14 58.33,14 61.11,26 C63.89,38 69.44,38 72.22,26 C75.0,14 80.56,14 83.33,26 C86.11,38 91.67,38 94.44,26"
              fill="none" stroke="url(#waveGrad)" strokeWidth="1.4"
              pathLength="100" strokeDasharray="100"
              strokeDashoffset={100 - ((active - 1) / 8) * 100}
              mask="url(#waveMask)"
              style={{ transition: 'stroke-dashoffset 0.7s ease' }}
            />
          </svg>

          <div style={{ display: 'flex' }}>
            {STEPS.map(s => {
              const isDone = done.has(s.id)
              const isActive = s.id === active
              const isLocked = s.id > maxReach
              const Icon = s.icon
              return (
                <button key={s.id} onClick={() => goTo(s.id)} disabled={isLocked}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '0 4px 0', background: 'transparent', border: 'none', cursor: isLocked ? 'default' : 'pointer', opacity: isLocked ? 0.25 : 1, transition: 'opacity 0.3s', position: 'relative', zIndex: 1 }}>
                  {/* outer glow ring for active */}
                  <div style={{ position: 'relative', width: 52, height: 52 }}>
                    {isActive && (
                      <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: `1.5px solid ${s.color}`, animation: 'ssRing 2s ease-out infinite' }} />
                    )}
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDone ? s.color : isActive ? `${s.color}20` : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${isDone ? s.color : isActive ? s.color : 'rgba(255,255,255,0.1)'}`,
                      boxShadow: isActive ? `0 0 0 6px ${s.color}15, 0 0 32px ${s.glow}` : isDone ? `0 0 16px ${s.color}40` : 'none',
                      transition: 'all 0.35s ease',
                    }}>
                      {isDone
                        ? <CheckCircle2 size={20} style={{ color: '#fff' }} />
                        : isLocked ? <Lock size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />
                        : <Icon size={18} style={{ color: isActive ? s.color : 'rgba(255,255,255,0.2)', transition: 'color 0.3s' }} />
                      }
                    </div>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 800, letterSpacing: '0.08em', color: isActive ? s.color : isDone ? s.color + '90' : 'rgba(255,255,255,0.2)', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3, transition: 'color 0.3s' }}>
                    {s.short}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Active Panel ── */}
        <div style={{
          borderRadius: 24, overflow: 'hidden',
          border: `1px solid ${step.color}30`,
          boxShadow: `0 0 80px ${step.glow}, 0 32px 80px rgba(0,0,0,0.4)`,
          background: 'rgba(6,9,18,0.88)', backdropFilter: 'blur(32px)',
          transition: 'border-color 0.4s, box-shadow 0.4s',
        }}>
          {/* gradient top stripe */}
          <div style={{ height: 4, background: `linear-gradient(90deg, ${step.color}, ${step.color}66, transparent)` }} />

          {/* panel header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '22px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: `${step.color}18`, border: `1.5px solid ${step.color}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 20px ${step.glow}`,
              flexShrink: 0,
            }}>
              {(() => { const Icon = step.icon; return <Icon size={20} style={{ color: step.color }} /> })()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, color: step.color, letterSpacing: '0.14em' }}>STEP {step.id} OF 8</span>
                {done.has(step.id) && <Tag label="COMPLETE" color="#34d399" />}
              </div>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>{step.label}</p>
              <p style={{ fontSize: 13, color: '#7dd3fc', marginTop: 2 }}>{step.desc}</p>
            </div>

            {/* progress tracker */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>

              {/* 8 colored dots */}
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                {STEPS.map(s => {
                  const isDone = done.has(s.id)
                  const isCurrent = s.id === active
                  const size = isDone || isCurrent ? 11 : 8
                  return (
                    <div key={s.id} className="ss-dot" style={{
                      width: size, height: size,
                      background: isDone ? s.color : 'transparent',
                      outline: isDone ? 'none' : `${isCurrent ? 2 : 1.5}px solid ${isCurrent ? s.color : s.color + '38'}`,
                      outlineOffset: '0px',
                      filter: isDone
                        ? `drop-shadow(0 0 5px ${s.color})`
                        : isCurrent ? `drop-shadow(0 0 3px ${s.color}90)` : 'none',
                      transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                      animation: isCurrent && !isDone ? 'ssBadgePulse 1.8s ease-in-out infinite' : 'none',
                    }} />
                  )
                })}
              </div>

              {/* count — centered below dots */}
              <span style={{
                fontFamily: MONO, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1,
                fontSize: 20, color: step.color,
              }}>
                {done.size}<span style={{ fontSize: 11, fontWeight: 700, opacity: 0.55 }}>/8</span>
              </span>

              {/* status — own line, centered, only when progress made */}
              {done.size > 0 && (
                <span style={{
                  fontFamily: MONO, fontSize: 8, fontWeight: 800, letterSpacing: '0.14em',
                  color: done.size === 8 ? '#34d399' : step.color,
                  textTransform: 'uppercase',
                }}>
                  {done.size === 1 && 'ROLLING'}
                  {done.size === 2 && 'BUILDING'}
                  {done.size === 3 && 'ON FIRE 🔥'}
                  {done.size === 4 && 'HALFWAY!'}
                  {done.size === 5 && 'CRUSHING IT'}
                  {done.size === 6 && 'ALMOST!'}
                  {done.size === 7 && 'LAST ONE!'}
                  {done.size === 8 && 'COMPLETE 🚀'}
                </span>
              )}
            </div>
          </div>

          {/* body */}
          <div style={{ padding: 32 }}>
            {error && (
              <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', marginBottom: 20 }}>
                <AlertCircle size={15} style={{ color: '#fb7185', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: '#fb7185' }}>{error}</p>
              </div>
            )}
            <StepContent id={active} data={data} onUpdate={update} onGoTo={goTo} loading={loading} setLoading={setLoading} setError={setError} />
          </div>
        </div>
      </div>
    </div>
  )
}
