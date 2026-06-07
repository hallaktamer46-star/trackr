import { useState } from 'react'
import {
  Lightbulb, Users, BarChart2, Sparkles, DollarSign,
  Map, BookOpen, FileText, CheckCircle2, Lock,
  Loader2, ArrowRight, Check, ChevronDown, ChevronUp,
  AlertCircle, TrendingUp, Star, Zap
} from 'lucide-react'
import { apiFetch } from '../lib/api'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

const STEPS = [
  { id: 1, label: 'Idea Validator',   short: 'Idea',       desc: 'Score your concept',      color: '#a78bfa', glow: 'rgba(167,139,250,0.35)', icon: Lightbulb  },
  { id: 2, label: 'Competitor Intel', short: 'Compete',    desc: 'Map the competition',      color: '#fb7185', glow: 'rgba(251,113,133,0.35)', icon: Users      },
  { id: 3, label: 'Business Model',   short: 'Model',      desc: 'Find how you make money',  color: '#38bdf8', glow: 'rgba(56,189,248,0.35)',  icon: BarChart2  },
  { id: 4, label: 'Name Studio',      short: 'Name',       desc: 'Name your venture',        color: '#f472b6', glow: 'rgba(244,114,182,0.35)', icon: Sparkles   },
  { id: 5, label: 'Financial Model',  short: 'Finance',    desc: 'Project your numbers',     color: '#34d399', glow: 'rgba(52,211,153,0.35)',  icon: DollarSign },
  { id: 6, label: 'Go-to-Market',     short: 'GTM',        desc: '90-day launch plan',       color: '#fbbf24', glow: 'rgba(251,191,36,0.35)',  icon: Map        },
  { id: 7, label: 'Legal Structure',  short: 'Legal',      desc: 'Set up properly',          color: '#22d3ee', glow: 'rgba(34,211,238,0.35)',  icon: BookOpen   },
  { id: 8, label: 'Pitch Builder',    short: 'Pitch',      desc: 'Investor-ready pitch',     color: '#fb923c', glow: 'rgba(251,146,60,0.35)',  icon: FileText   },
]

const STAGES    = ['Idea', 'Pre-seed', 'Seed', 'Series A']
const VIBES     = ['Modern', 'Bold', 'Playful', 'Professional', 'Luxury']
const TEAM_SIZES = ['Just me', '2–3', '4–10', '10+']
const BUDGETS   = ['Bootstrap', '$1k–$5k', '$5k–$20k', '$20k+']
const GOALS     = ['First 10 customers', 'Email list', 'Go viral', 'Enterprise']

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
  .ss-input::placeholder { color: #2d3748; }
  .ss-input:focus {
    background: rgba(255,255,255,0.09);
    border-color: var(--sc, #a78bfa);
    box-shadow:
      0 0 0 3px var(--sc-bg, rgba(167,139,250,0.2)),
      0 0 24px var(--sc-bg, rgba(167,139,250,0.15)),
      inset 0 0 16px rgba(255,255,255,0.03);
  }
  .ss-pill {
    padding: 8px 18px; border-radius: 99px; cursor: pointer;
    font-family: Geist Mono, monospace; font-size: 11px; font-weight: 700;
    letter-spacing: 0.04em; border: 1.5px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04); color: #6b7280;
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
    cursor: pointer; font-family: Geist Mono, monospace;
    font-size: 13px; font-weight: 800; letter-spacing: 0.1em;
    text-transform: uppercase; color: white;
    background: linear-gradient(135deg, var(--sc,#a78bfa), #6d6bfa);
    transition: all 0.25s ease;
    box-shadow: 0 4px 28px var(--sg, rgba(167,139,250,0.4));
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .ss-gen-btn:hover { transform: translateY(-2px); filter: brightness(1.12); box-shadow: 0 8px 40px var(--sg, rgba(167,139,250,0.55)); }
  .ss-gen-btn:active { transform: translateY(0); filter: brightness(0.95); }
  .ss-gen-btn:disabled { background: rgba(255,255,255,0.06); color: #374151; box-shadow: none; cursor: default; transform: none; filter: none; }
  .ss-next-btn {
    display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px;
    border-radius: 12px; border: 1.5px solid var(--sc, #a78bfa);
    background: var(--sc-bg, rgba(167,139,250,0.1)); color: var(--sc, #a78bfa);
    font-family: Geist Mono, monospace; font-size: 11px; font-weight: 700;
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
  return (
    <div>
      {label && (
        <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
          {label}
        </label>
      )}
      {textarea
        ? <textarea rows={rows} className="ss-input" style={{ resize: 'vertical', lineHeight: 1.7 }} {...props} />
        : <input className="ss-input" {...props} />
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
      <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65 }}>{item}</p>
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

/* ─── Step Panels ────────────────────────────────────────────────── */

function IdeaValidatorPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const s = STEPS[0]
  const vars = useStepVars(s.color, s.glow)
  const result = data.ideaResult
  const verdictColor = { pass: '#fb7185', conditional: '#fbbf24', promising: '#38bdf8', strong: '#34d399' }

  async function generate() {
    if (!data.pitch?.trim()) return setError('Describe your idea first.')
    setError(null); setLoading(true)
    try {
      const res = await apiFetch('/api/ai/pitch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch: data.pitch, industry: data.industry, stage: data.stage || 'Idea', fundingAsk: data.fundingAsk, targetMarket: data.targetMarket }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onUpdate({ ideaResult: json })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div style={vars}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <SInput textarea rows={4} label="Your Business Idea"
          placeholder="Describe what your business does, the problem it solves, and who it's for…"
          value={data.pitch || ''} onChange={e => onUpdate({ pitch: e.target.value })} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <SInput label="Industry" placeholder="e.g. FinTech, HealthTech, SaaS"
            value={data.industry || ''} onChange={e => onUpdate({ industry: e.target.value })} />
          <SInput label="Target Market" placeholder="e.g. SMB founders in the US"
            value={data.targetMarket || ''} onChange={e => onUpdate({ targetMarket: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Stage</label>
            <Pills options={STAGES} value={data.stage || 'Idea'} onChange={v => onUpdate({ stage: v })} />
          </div>
          <SInput label="Funding Ask (optional)" placeholder="e.g. $500k"
            value={data.fundingAsk || ''} onChange={e => onUpdate({ fundingAsk: e.target.value })} />
        </div>
        <div onClick={generate}><GenBtn loading={loading} disabled={!data.pitch?.trim()} label="Validate My Idea" /></div>
      </div>

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

          {/* Sections grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {result.sections?.map(sec => {
              const sc = sec.score >= 70 ? '#34d399' : sec.score >= 45 ? '#fbbf24' : '#fb7185'
              return (
                <div key={sec.id} style={{ padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{sec.title}</p>
                    <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: sc }}>{sec.score}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{sec.analysis?.slice(0, 130)}…</p>
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
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{q}</p>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <SInput label="Known Competitors (optional)" placeholder="e.g. Notion, Airtable — we'll discover more"
          value={data.knownCompetitors || ''} onChange={e => onUpdate({ knownCompetitors: e.target.value })} />
        <div onClick={generate}><GenBtn loading={loading} disabled={!data.pitch} label="Map the Competition" /></div>
      </div>

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
                  <p style={{ fontFamily: MONO, fontSize: 9, color: '#6b7280' }}>{c.founded} · {c.funding}</p>
                </div>
                <div>
                  <p style={{ fontFamily: MONO, fontSize: 8, color: '#34d399', letterSpacing: '0.1em', marginBottom: 5 }}>STRENGTH</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{c.strength}</p>
                </div>
                <div>
                  <p style={{ fontFamily: MONO, fontSize: 8, color: '#fb7185', letterSpacing: '0.1em', marginBottom: 5 }}>WEAKNESS</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{c.weakness}</p>
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
  const priorityColor = { Primary: '#34d399', Secondary: '#38bdf8', Future: '#6b7280' }

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
      <div style={{ padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 18 }}>
        <p style={{ fontFamily: MONO, fontSize: 9, color: '#4b5563', letterSpacing: '0.1em', marginBottom: 6 }}>GENERATING FOR</p>
        <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{data.pitch?.slice(0, 160)}…</p>
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
                  <p style={{ fontSize: 11, color: '#6b7280' }}>{r.description}</p>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: '#34d399', whiteSpace: 'nowrap' }}>{r.typical_margin}</span>
              </div>
            ))}
          </ResultSection>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <ResultSection title="Pricing Strategy" color={s.color}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{result.pricing_strategy?.approach}</p>
              <p style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: s.color, marginBottom: 10 }}>{result.pricing_strategy?.suggested_price_range}</p>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{result.pricing_strategy?.reasoning}</p>
            </ResultSection>
            <ResultSection title="Unit Economics" color={s.color}>
              {[['CAC', result.unit_economics?.cac_estimate], ['LTV', result.unit_economics?.ltv_estimate], ['LTV:CAC', result.unit_economics?.ltv_cac_ratio], ['Payback', result.unit_economics?.payback_period]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: '#6b7280', letterSpacing: '0.08em' }}>{l}</span>
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
  const scoreColor = sc => sc >= 8 ? '#34d399' : sc >= 6 ? '#fbbf24' : '#94a3b8'

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
            <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Brand Vibe</label>
            <Pills options={VIBES} value={data.nameVibe || 'Modern'} onChange={v => onUpdate({ nameVibe: v })} />
          </div>
          <SInput label="Keywords to Include (optional)" placeholder="e.g. fast, smart, connect"
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
                      <p style={{ fontFamily: MONO, fontSize: 9, color: '#4b5563', marginTop: 2 }}>{n.domain_hint}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={11} style={{ color: scoreColor(n.score) }} />
                      <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 900, color: scoreColor(n.score) }}>{n.score}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', marginBottom: 8 }}>"{n.tagline}"</p>
                  <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{n.why}</p>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Team Size</label>
            <Pills options={TEAM_SIZES} value={data.teamSize || 'Just me'} onChange={v => onUpdate({ teamSize: v })} />
          </div>
          <SInput label="Location / Market" placeholder="e.g. United States, London"
            value={data.location || ''} onChange={e => onUpdate({ location: e.target.value })} />
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
                    <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontFamily: MONO, fontSize: 9, color: '#4b5563', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {[['Revenue','revenue'],['Gross Profit','gross_profit'],['Net','net'],['Customers','customers_eoy'],['MRR (EOY)','mrr_eoy']].map(([label, key]) => (
                    <tr key={key}>
                      <td style={{ padding: '9px 14px', fontFamily: MONO, fontSize: 10, color: '#6b7280', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{label}</td>
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
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{c.item}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: '#f1f5f9' }}>{c.amount}</span>
                    <Tag label={c.type} color="#6b7280" />
                  </div>
                </div>
              ))}
            </ResultSection>
            <ResultSection title="Key Milestones" color={s.color}>
              <div style={{ padding: '14px 18px', borderRadius: 12, background: `${s.color}12`, border: `1px solid ${s.color}30`, marginBottom: 12 }}>
                <p style={{ fontFamily: MONO, fontSize: 9, color: s.color, letterSpacing: '0.1em', marginBottom: 6 }}>BREAK-EVEN MONTH</p>
                <p style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', fontFamily: MONO }}>#{result.break_even_month}</p>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{result.fundraising_note}</p>
            </ResultSection>
          </div>
          <NextBtn onClick={onNext} label="Continue to Go-to-Market" color={s.color} />
        </div>
      )}
    </div>
  )
}

function GTMPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const s = STEPS[5]
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
        body: JSON.stringify({ idea: data.pitch, targetMarket: data.targetMarket, businessModel: data.businessModelResult?.recommended_model, budget: data.marketingBudget || 'Bootstrap', goal: data.gtmGoal || 'First 10 customers' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onUpdate({ gtmResult: json })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div style={vars}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Budget</label>
            <Pills options={BUDGETS} value={data.marketingBudget || 'Bootstrap'} onChange={v => onUpdate({ marketingBudget: v })} />
          </div>
          <div>
            <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: '#4b5563', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Primary Goal</label>
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
                      <p style={{ fontFamily: MONO, fontSize: 9, color: '#6b7280', marginTop: 1 }}>{w.milestone}</p>
                    </div>
                    <Tag label={w.focus} color={focusC[w.focus] || s.color} />
                    {open.has(w.week) ? <ChevronUp size={13} style={{ color: '#6b7280', flexShrink: 0 }} /> : <ChevronDown size={13} style={{ color: '#6b7280', flexShrink: 0 }} />}
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
          <NextBtn onClick={onNext} label="Continue to Legal Structure" color={s.color} />
        </div>
      )}
    </div>
  )
}

function LegalPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const s = STEPS[6]
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <SInput label="Country of Registration" placeholder="e.g. United States, UK, UAE"
            value={data.legalCountry || ''} onChange={e => onUpdate({ legalCountry: e.target.value })} />
          <SInput label="Number of Founders" type="number" min="1" placeholder="1"
            value={data.founders || ''} onChange={e => onUpdate({ founders: e.target.value })} />
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
                  <p style={{ fontFamily: MONO, fontSize: 9, color: '#6b7280' }}>{step.timeline} · {step.cost} · {step.service}</p>
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
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, marginBottom: 12 }}>{result.tax_overview}</p>
              <p style={{ fontFamily: MONO, fontSize: 8, color: s.color, letterSpacing: '0.1em', marginBottom: 6 }}>IP PROTECTION</p>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{result.ip_advice}</p>
            </ResultSection>
          </div>
          <NextBtn onClick={onNext} label="Continue to Pitch Builder" color={s.color} />
        </div>
      )}
    </div>
  )
}

function PitchBuilderPanel({ data, onUpdate, loading, setLoading, setError }) {
  const s = STEPS[7]
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
                  <p style={{ fontFamily: MONO, fontSize: 9, color: '#6b7280' }}>{sl.key_message}</p>
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
    case 6: return <GTMPanel            {...p} />
    case 7: return <LegalPanel          {...p} />
    case 8: return <PitchBuilderPanel   data={data} onUpdate={onUpdate} loading={loading} setLoading={setLoading} setError={setError} />
    default: return null
  }
}

/* ─── MAIN ────────────────────────────────────────────────────────── */
export default function StartupStudio() {
  const [active, setActive] = useState(1)
  const [done, setDone] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    pitch: '', industry: '', targetMarket: '', stage: 'Idea', fundingAsk: '',
    knownCompetitors: '', nameVibe: 'Modern', nameKeywords: '',
    teamSize: 'Just me', location: '', legalCountry: '', founders: '1',
    marketingBudget: 'Bootstrap', gtmGoal: 'First 10 customers', pitchEquity: '',
    ideaResult: null, competitorResult: null, businessModelResult: null,
    nameResult: null, selectedName: '', financialResult: null,
    gtmResult: null, legalResult: null, pitchBuilderResult: null,
  })

  const resultKeys = ['ideaResult','competitorResult','businessModelResult','nameResult','financialResult','gtmResult','legalResult','pitchBuilderResult']

  function update(partial) {
    setData(d => ({ ...d, ...partial }))
    const key = resultKeys[active - 1]
    if (key && partial[key]) setDone(prev => new Set(prev).add(active))
  }

  function goTo(id) {
    const maxReach = done.size > 0 ? Math.max(...[...done]) + 1 : 1
    if (id <= maxReach || done.has(id)) { setActive(id); setError(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }
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
        <div style={{ paddingTop: 4, paddingBottom: 36 }}>
          {/* badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', animation: 'ssBadgePulse 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 800, color: '#a78bfa', letterSpacing: '0.14em' }}>STARTUP STUDIO</span>
          </div>

          {/* title */}
          <h1 style={{
            fontSize: 50, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: 16,
            background: 'linear-gradient(135deg, #f8fafc 0%, #a78bfa 40%, #38bdf8 70%, #34d399 100%)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'ssGradTitle 6s ease-in-out infinite',
          }}>
            Turn your idea into<br />a real business.
          </h1>

          <p style={{ fontSize: 15, color: '#4b5563', maxWidth: 480, lineHeight: 1.75, marginBottom: 20 }}>
            8 AI-powered steps. Your context carries forward automatically — describe your idea once, get a complete business blueprint.
          </p>

          {/* feature pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['8 AI-Powered Tools', 'Context Carries Forward', 'Idea → Investor Pitch'].map(f => (
              <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: MONO, fontSize: 10, color: '#6b7280', letterSpacing: '0.04em' }}>
                <Check size={10} style={{ color: '#34d399' }} /> {f}
              </span>
            ))}
          </div>
        </div>

        {/* ── Step Timeline ── */}
        <div style={{ marginBottom: 28, position: 'relative' }}>
          {/* track line */}
          <div style={{ position: 'absolute', top: 26, left: 26, right: 26, height: 1, background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
          {/* fill line */}
          <div style={{ position: 'absolute', top: 26, left: 26, height: 1, zIndex: 0, transition: 'width 0.7s ease', background: `linear-gradient(90deg, #a78bfa, ${step.color})`, width: done.size === 0 ? 0 : `${(Math.max(...[...done]) / 8) * 100}%` }} />

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
                        : isLocked ? <Lock size={14} style={{ color: '#374151' }} />
                        : <Icon size={18} style={{ color: isActive ? s.color : '#374151', transition: 'color 0.3s' }} />
                      }
                    </div>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 800, letterSpacing: '0.08em', color: isActive ? s.color : isDone ? s.color + '90' : '#374151', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3, transition: 'color 0.3s' }}>
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
              <p style={{ fontSize: 13, color: '#4b5563', marginTop: 2 }}>{step.desc}</p>
            </div>

            {/* progress indicator */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontFamily: MONO, fontSize: 9, color: '#374151', letterSpacing: '0.08em', marginBottom: 4 }}>{done.size} / 8 COMPLETE</p>
              <div style={{ width: 80, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: `linear-gradient(90deg, #a78bfa, ${step.color})`, borderRadius: 99, transition: 'width 0.6s ease', width: `${(done.size / 8) * 100}%` }} />
              </div>
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
