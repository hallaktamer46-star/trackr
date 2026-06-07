import { useState } from 'react'
import {
  Lightbulb, Users, BarChart2, Sparkles, DollarSign,
  Map, BookOpen, FileText, CheckCircle2, Lock,
  Loader2, ArrowRight, Check, ChevronDown, ChevronUp,
  Star, AlertCircle, TrendingUp, Globe
} from 'lucide-react'
import { apiFetch } from '../lib/api'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

const STEPS = [
  { id: 1, label: 'Idea Validator',   desc: 'Score your concept',      color: '#a78bfa', glow: 'rgba(167,139,250,0.2)', icon: Lightbulb  },
  { id: 2, label: 'Competitor Intel', desc: 'Map the competition',      color: '#f87171', glow: 'rgba(248,113,113,0.2)', icon: Users      },
  { id: 3, label: 'Business Model',   desc: 'Find how you make money',  color: '#60a5fa', glow: 'rgba(96,165,250,0.2)',  icon: BarChart2  },
  { id: 4, label: 'Name Studio',      desc: 'Name your venture',        color: '#f472b6', glow: 'rgba(244,114,182,0.2)', icon: Sparkles   },
  { id: 5, label: 'Financial Model',  desc: 'Project your numbers',     color: '#34d399', glow: 'rgba(52,211,153,0.2)',  icon: DollarSign },
  { id: 6, label: 'Go-to-Market',     desc: '90-day launch plan',       color: '#fbbf24', glow: 'rgba(251,191,36,0.2)',  icon: Map        },
  { id: 7, label: 'Legal Structure',  desc: 'Set up properly',          color: '#22d3ee', glow: 'rgba(34,211,238,0.2)',  icon: BookOpen   },
  { id: 8, label: 'Pitch Builder',    desc: 'Investor-ready pitch',     color: '#fb923c', glow: 'rgba(251,146,60,0.2)',  icon: FileText   },
]

const STAGES    = ['Idea', 'Pre-seed', 'Seed', 'Series A']
const VIBES     = ['Modern', 'Bold', 'Playful', 'Professional', 'Luxury']
const TEAM_SIZES = ['Just me', '2-3', '4-10', '10+']
const BUDGETS   = ['Bootstrap (<$1k)', '$1k–$5k', '$5k–$20k', '$20k+']
const GOALS     = ['First 10 customers', 'Build an email list', 'Launch & go viral', 'Enterprise contracts']

// ── shared input styles ────────────────────────────────────────────
const labelSt = { fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase', display: 'block', marginBottom: 6 }

function SInput({ label, accentColor = '#a78bfa', ...props }) {
  return (
    <div>
      {label && <label style={labelSt}>{label}</label>}
      <input {...props} style={{
        width: '100%', padding: '10px 14px', boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10, color: '#f1f5f9', fontSize: 13, fontFamily: SANS,
        outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', ...props.style,
      }}
      onFocus={e => { e.target.style.borderColor = accentColor + '80'; e.target.style.boxShadow = `0 0 0 3px ${accentColor}15` }}
      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

function STextarea({ label, accentColor = '#a78bfa', rows = 4, ...props }) {
  return (
    <div>
      {label && <label style={labelSt}>{label}</label>}
      <textarea rows={rows} {...props} style={{
        width: '100%', padding: '10px 14px', boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10, color: '#f1f5f9', fontSize: 13, fontFamily: SANS,
        outline: 'none', resize: 'vertical', lineHeight: 1.6, transition: 'border-color 0.2s, box-shadow 0.2s',
        ...props.style,
      }}
      onFocus={e => { e.target.style.borderColor = accentColor + '80'; e.target.style.boxShadow = `0 0 0 3px ${accentColor}15` }}
      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

function Pills({ options, value, onChange, color }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{
          padding: '7px 16px', borderRadius: 20, border: `1px solid ${value === o ? color + '80' : 'rgba(255,255,255,0.1)'}`,
          background: value === o ? color + '18' : 'rgba(255,255,255,0.04)',
          color: value === o ? color : '#9ca3af', fontFamily: MONO, fontSize: 10, fontWeight: 700,
          cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em',
        }}>
          {o}
        </button>
      ))}
    </div>
  )
}

function GenBtn({ loading, disabled, onClick, color }) {
  return (
    <button onClick={onClick} disabled={loading || disabled} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px',
      borderRadius: 12, border: 'none', cursor: loading || disabled ? 'default' : 'pointer',
      background: loading || disabled ? 'rgba(255,255,255,0.07)' : `linear-gradient(135deg, ${color}, ${color}bb)`,
      color: loading || disabled ? '#6b7280' : '#fff',
      fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
      boxShadow: loading || disabled ? 'none' : `0 4px 24px ${color}50`,
      transition: 'all 0.2s',
    }}
    onMouseEnter={e => { if (!loading && !disabled) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.1)' } }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'none' }}
    >
      {loading
        ? <><Loader2 size={13} style={{ animation: 'studioSpin 1s linear infinite' }} /> Generating…</>
        : <>Generate <ArrowRight size={13} /></>
      }
    </button>
  )
}

function NextBtn({ onClick, label, color }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px',
      borderRadius: 12, border: `1px solid ${color}50`,
      background: `${color}12`, color, cursor: 'pointer',
      fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
      transition: 'all 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = `${color}22` }}
    onMouseLeave={e => { e.currentTarget.style.background = `${color}12` }}
    >
      {label || 'Continue to Next Step'} <ArrowRight size={13} />
    </button>
  )
}

function ResultTag({ label, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '4px 12px',
      borderRadius: 20, border: `1px solid ${color}40`,
      background: `${color}10`, color,
      fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
    }}>
      {label}
    </span>
  )
}

function Section({ title, color, children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: `${color}08` }}>
        <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color, textTransform: 'uppercase' }}>{title}</p>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  )
}

// ── Step Panels ────────────────────────────────────────────────────

function IdeaValidatorPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const color = STEPS[0].color
  const result = data.ideaResult

  async function generate() {
    if (!data.pitch?.trim()) return setError('Please describe your business idea.')
    setError(null); setLoading(true)
    try {
      const res = await apiFetch('/api/ai/pitch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch: data.pitch, industry: data.industry, stage: data.stage, fundingAsk: data.fundingAsk, targetMarket: data.targetMarket }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onUpdate({ ideaResult: json })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const verdictColor = { pass: '#f87171', conditional: '#fbbf24', promising: '#60a5fa', strong: '#34d399' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gap: 14 }}>
        <STextarea label="Your Business Idea" accentColor={color} rows={3}
          placeholder="Describe what your business does, the problem it solves, and who it's for…"
          value={data.pitch || ''} onChange={e => onUpdate({ pitch: e.target.value })} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <SInput label="Industry" accentColor={color} placeholder="e.g. FinTech, HealthTech, SaaS"
            value={data.industry || ''} onChange={e => onUpdate({ industry: e.target.value })} />
          <SInput label="Target Market" accentColor={color} placeholder="e.g. SMB founders in the US"
            value={data.targetMarket || ''} onChange={e => onUpdate({ targetMarket: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelSt}>Stage</label>
            <Pills options={STAGES} value={data.stage || 'Idea'} onChange={v => onUpdate({ stage: v })} color={color} />
          </div>
          <SInput label="Funding Ask (optional)" accentColor={color} placeholder="e.g. $500k"
            value={data.fundingAsk || ''} onChange={e => onUpdate({ fundingAsk: e.target.value })} />
        </div>
      </div>

      <GenBtn loading={loading} disabled={!data.pitch?.trim()} onClick={generate} color={color} />

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'studioFadeIn 0.5s ease' }}>
          {/* Score + Verdict */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', borderRadius: 16, background: `linear-gradient(135deg, ${color}10, rgba(255,255,255,0.02))`, border: `1px solid ${color}30` }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 52, fontWeight: 900, fontFamily: MONO, color, lineHeight: 1, letterSpacing: '-0.04em' }}>{result.overall_score}</div>
              <div style={{ fontFamily: MONO, fontSize: 8, color: color + '80', letterSpacing: '0.1em', marginTop: 2 }}>/ 100</div>
            </div>
            <div style={{ flex: 1 }}>
              <ResultTag label={result.verdict?.toUpperCase()} color={verdictColor[result.verdict] || color} />
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7, marginTop: 10 }}>{result.executive_summary}</p>
            </div>
          </div>

          {/* Sections */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {result.sections?.map(s => {
              const sc = s.score >= 70 ? '#34d399' : s.score >= 45 ? '#fbbf24' : '#f87171'
              return (
                <div key={s.id} style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.title}</p>
                    <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 800, color: sc }}>{s.score}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{s.analysis?.slice(0, 140)}…</p>
                </div>
              )
            })}
          </div>

          {/* What works + Fatal flaws */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Section title="What Works" color="#34d399">
              {result.what_works?.map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <Check size={12} style={{ color: '#34d399', marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{w}</p>
                </div>
              ))}
            </Section>
            <Section title="Critical Questions" color="#fbbf24">
              {result.critical_questions?.map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <AlertCircle size={11} style={{ color: '#fbbf24', marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{q}</p>
                </div>
              ))}
            </Section>
          </div>

          {/* Recommendation */}
          <Section title="Recommendation" color={color}>
            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>{result.recommendation}</p>
          </Section>

          <NextBtn onClick={onNext} label="Continue to Competitor Intel" color={color} />
        </div>
      )}
    </div>
  )
}

function CompetitorPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const color = STEPS[1].color
  const result = data.competitorResult

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

  const threatColor = { High: '#f87171', Medium: '#fbbf24', Low: '#34d399' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SInput label="Known Competitors (optional)" accentColor={color}
        placeholder="e.g. Notion, Airtable, Coda — we'll find more"
        value={data.knownCompetitors || ''} onChange={e => onUpdate({ knownCompetitors: e.target.value })} />

      <GenBtn loading={loading} disabled={!data.pitch} onClick={generate} color={color} />

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'studioFadeIn 0.5s ease' }}>
          <Section title="Market Overview" color={color}>
            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>{result.market_overview}</p>
          </Section>

          {/* Competitor cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.competitors?.map((c, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'start' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 3 }}>{c.name}</p>
                  <p style={{ fontSize: 11, color: '#64748b' }}>{c.founded} · {c.funding}</p>
                </div>
                <div>
                  <p style={{ fontFamily: MONO, fontSize: 8, color: '#34d399', letterSpacing: '0.08em', marginBottom: 4 }}>STRENGTH</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{c.strength}</p>
                </div>
                <div>
                  <p style={{ fontFamily: MONO, fontSize: 8, color: '#f87171', letterSpacing: '0.08em', marginBottom: 4 }}>WEAKNESS</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{c.weakness}</p>
                </div>
                <ResultTag label={c.threat_level} color={threatColor[c.threat_level] || color} />
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Section title="Market Gaps You Can Exploit" color="#34d399">
              {result.market_gaps?.map((g, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <TrendingUp size={11} style={{ color: '#34d399', marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{g}</p>
                </div>
              ))}
            </Section>
            <Section title="Your Winning Angle" color={color}>
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>{result.your_angle}</p>
            </Section>
          </div>

          <NextBtn onClick={onNext} label="Continue to Business Model" color={color} />
        </div>
      )}
    </div>
  )
}

function BusinessModelPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const color = STEPS[2].color
  const result = data.businessModelResult

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

  const priorityColor = { Primary: '#34d399', Secondary: '#60a5fa', Future: '#9ca3af' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontFamily: MONO, fontSize: 9, color: '#64748b', letterSpacing: '0.08em', marginBottom: 4 }}>GENERATING FROM YOUR IDEA</p>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>{data.pitch?.slice(0, 120)}…</p>
      </div>

      <GenBtn loading={loading} disabled={!data.pitch} onClick={generate} color={color} />

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'studioFadeIn 0.5s ease' }}>
          {/* Model + Why */}
          <div style={{ padding: '20px 24px', borderRadius: 16, background: `linear-gradient(135deg, ${color}10, rgba(255,255,255,0.02))`, border: `1px solid ${color}30` }}>
            <p style={{ fontFamily: MONO, fontSize: 9, color: color, letterSpacing: '0.12em', marginBottom: 8 }}>RECOMMENDED MODEL</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: 12 }}>{result.recommended_model}</p>
            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>{result.why}</p>
          </div>

          {/* Revenue streams */}
          <Section title="Revenue Streams" color={color}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.revenue_streams?.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                  <ResultTag label={r.priority} color={priorityColor[r.priority] || color} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{r.stream}</p>
                    <p style={{ fontSize: 11, color: '#64748b' }}>{r.description}</p>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: '#34d399', fontWeight: 700 }}>{r.typical_margin} margin</span>
                </div>
              ))}
            </div>
          </Section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Section title="Pricing Strategy" color={color}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{result.pricing_strategy?.approach}</p>
              <p style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color, marginBottom: 8 }}>{result.pricing_strategy?.suggested_price_range}</p>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{result.pricing_strategy?.reasoning}</p>
            </Section>
            <Section title="Unit Economics" color={color}>
              {[
                { label: 'CAC Estimate', value: result.unit_economics?.cac_estimate },
                { label: 'LTV Estimate', value: result.unit_economics?.ltv_estimate },
                { label: 'LTV:CAC Ratio', value: result.unit_economics?.ltv_cac_ratio },
                { label: 'Payback Period', value: result.unit_economics?.payback_period },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: '#64748b', letterSpacing: '0.06em' }}>{label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>{value}</span>
                </div>
              ))}
            </Section>
          </div>

          <NextBtn onClick={onNext} label="Continue to Name Studio" color={color} />
        </div>
      )}
    </div>
  )
}

function NameStudioPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const color = STEPS[3].color
  const result = data.nameResult

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

  const scoreColor = s => s >= 8 ? '#34d399' : s >= 6 ? '#fbbf24' : '#9ca3af'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelSt}>Brand Vibe</label>
          <Pills options={VIBES} value={data.nameVibe || 'Modern'} onChange={v => onUpdate({ nameVibe: v })} color={color} />
        </div>
        <SInput label="Keywords to Include (optional)" accentColor={color} placeholder="e.g. fast, smart, connect"
          value={data.nameKeywords || ''} onChange={e => onUpdate({ nameKeywords: e.target.value })} />
      </div>

      <GenBtn loading={loading} disabled={!data.pitch} onClick={generate} color={color} />

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'studioFadeIn 0.5s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {result.names?.map((n, i) => (
              <div key={i} onClick={() => onUpdate({ selectedName: n.name })}
                style={{
                  padding: 16, borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                  background: data.selectedName === n.name ? `${color}12` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${data.selectedName === n.name ? color + '50' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: data.selectedName === n.name ? `0 0 20px ${color}20` : 'none',
                }}
                onMouseEnter={e => { if (data.selectedName !== n.name) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { if (data.selectedName !== n.name) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 800, color: data.selectedName === n.name ? color : '#f1f5f9', letterSpacing: '-0.02em' }}>{n.name}</p>
                    <p style={{ fontFamily: MONO, fontSize: 9, color: '#64748b', marginTop: 2 }}>{n.domain_hint}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={11} style={{ color: scoreColor(n.score) }} />
                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: scoreColor(n.score) }}>{n.score}</span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', marginBottom: 6 }}>"{n.tagline}"</p>
                <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>{n.why}</p>
                {data.selectedName === n.name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Check size={11} style={{ color }} />
                    <span style={{ fontFamily: MONO, fontSize: 9, color, letterSpacing: '0.06em' }}>SELECTED</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <NextBtn onClick={onNext} label="Continue to Financial Model" color={color} />
        </div>
      )}
    </div>
  )
}

function FinancialPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const color = STEPS[4].color
  const result = data.financialResult

  async function generate() {
    setError(null); setLoading(true)
    try {
      const res = await apiFetch('/api/ai/startup/financial', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: data.pitch, businessModel: data.businessModelResult?.recommended_model,
          pricingStrategy: data.businessModelResult?.pricing_strategy,
          teamSize: data.teamSize || 'Just me', location: data.location,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onUpdate({ financialResult: json })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelSt}>Team Size</label>
          <Pills options={TEAM_SIZES} value={data.teamSize || 'Just me'} onChange={v => onUpdate({ teamSize: v })} color={color} />
        </div>
        <SInput label="Location / Market" accentColor={color} placeholder="e.g. United States, London, Remote"
          value={data.location || ''} onChange={e => onUpdate({ location: e.target.value })} />
      </div>

      <GenBtn loading={loading} disabled={!data.pitch} onClick={generate} color={color} />

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'studioFadeIn 0.5s ease' }}>
          {/* 3-year table */}
          <Section title="3-Year Projection" color={color}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Metric', 'Year 1', 'Year 2', 'Year 3'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontFamily: MONO, fontSize: 9, color: '#64748b', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Revenue', 'revenue'], ['COGS', 'cogs'], ['Gross Profit', 'gross_profit'],
                    ['Operating Costs', 'operating_costs'], ['Net', 'net'],
                    ['Customers EOY', 'customers_eoy'], ['MRR EOY', 'mrr_eoy'],
                  ].map(([label, key]) => (
                    <tr key={key}>
                      <td style={{ padding: '8px 12px', fontFamily: MONO, fontSize: 10, color: '#9ca3af', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{label}</td>
                      {['year1', 'year2', 'year3'].map(yr => {
                        const val = result[yr]?.[key] || '—'
                        const isNet = key === 'net'
                        const isNeg = isNet && typeof val === 'string' && val.startsWith('-')
                        return (
                          <td key={yr} style={{ padding: '8px 12px', fontFamily: MONO, fontSize: 11, fontWeight: 700, color: isNet ? (isNeg ? '#f87171' : '#34d399') : '#e2e8f0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {val}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Section title="Startup Costs" color={color}>
              {result.startup_costs?.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{c.item}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>{c.amount}</span>
                    <ResultTag label={c.type} color="#64748b" />
                  </div>
                </div>
              ))}
            </Section>
            <Section title="Key Milestones" color={color}>
              <div style={{ padding: '12px 16px', borderRadius: 10, background: `${color}10`, border: `1px solid ${color}30`, marginBottom: 10 }}>
                <p style={{ fontFamily: MONO, fontSize: 9, color, letterSpacing: '0.08em', marginBottom: 4 }}>BREAK-EVEN</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', fontFamily: MONO }}>Month {result.break_even_month}</p>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{result.fundraising_note}</p>
            </Section>
          </div>

          <Section title="Financial Risks" color="#f87171">
            {result.key_risks?.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <AlertCircle size={11} style={{ color: '#f87171', marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{r}</p>
              </div>
            ))}
          </Section>

          <NextBtn onClick={onNext} label="Continue to Go-to-Market" color={color} />
        </div>
      )}
    </div>
  )
}

function GTMPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const color = STEPS[5].color
  const result = data.gtmResult
  const [expandedWeeks, setExpandedWeeks] = useState(new Set([1, 2, 3]))

  const toggleWeek = w => setExpandedWeeks(prev => {
    const n = new Set(prev); n.has(w) ? n.delete(w) : n.add(w); return n
  })

  async function generate() {
    setError(null); setLoading(true)
    try {
      const res = await apiFetch('/api/ai/startup/gtm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: data.pitch, targetMarket: data.targetMarket,
          businessModel: data.businessModelResult?.recommended_model,
          budget: data.marketingBudget || 'Bootstrap (<$1k)',
          goal: data.gtmGoal || 'First 10 customers',
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onUpdate({ gtmResult: json })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const focusColor = { Foundation: '#a78bfa', Outreach: '#60a5fa', Launch: '#34d399', Scale: '#fbbf24' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelSt}>Marketing Budget</label>
          <Pills options={BUDGETS} value={data.marketingBudget || 'Bootstrap (<$1k)'} onChange={v => onUpdate({ marketingBudget: v })} color={color} />
        </div>
        <div>
          <label style={labelSt}>Primary Goal</label>
          <Pills options={GOALS} value={data.gtmGoal || 'First 10 customers'} onChange={v => onUpdate({ gtmGoal: v })} color={color} />
        </div>
      </div>

      <GenBtn loading={loading} disabled={!data.pitch} onClick={generate} color={color} />

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'studioFadeIn 0.5s ease' }}>
          <Section title="Strategy" color={color}>
            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>{result.strategy_summary}</p>
          </Section>

          <Section title="Getting Your First 10 Customers" color="#34d399">
            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>{result.first_10_customers}</p>
          </Section>

          {/* Channels */}
          <Section title="Acquisition Channels" color={color}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.channels?.map((c, i) => (
                <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{c.channel}</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <ResultTag label={c.difficulty} color={c.difficulty === 'Easy' ? '#34d399' : c.difficulty === 'Hard' ? '#f87171' : '#fbbf24'} />
                      <span style={{ fontFamily: MONO, fontSize: 9, color: '#64748b' }}>{c.monthly_cost}/mo</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{c.tactic}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* 12-week plan */}
          <Section title="12-Week Action Plan" color={color}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {result.weeks?.map(w => (
                <div key={w.week} style={{ borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <button onClick={() => toggleWeek(w.week)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: focusColor[w.focus] + '20', border: `1px solid ${focusColor[w.focus]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, color: focusColor[w.focus] }}>{w.week}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{w.theme}</p>
                      <p style={{ fontFamily: MONO, fontSize: 9, color: '#64748b', marginTop: 1 }}>{w.milestone}</p>
                    </div>
                    <ResultTag label={w.focus} color={focusColor[w.focus]} />
                    {expandedWeeks.has(w.week) ? <ChevronUp size={13} style={{ color: '#64748b' }} /> : <ChevronDown size={13} style={{ color: '#64748b' }} />}
                  </button>
                  {expandedWeeks.has(w.week) && (
                    <div style={{ padding: '0 14px 12px 50px' }}>
                      {w.actions?.map((a, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 4, height: 4, borderRadius: '50%', background: focusColor[w.focus], marginTop: 6, flexShrink: 0 }} />
                          <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{a}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <NextBtn onClick={onNext} label="Continue to Legal Structure" color={color} />
        </div>
      )}
    </div>
  )
}

function LegalPanel({ data, onUpdate, onNext, loading, setLoading, setError }) {
  const color = STEPS[6].color
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SInput label="Country of Registration" accentColor={color}
          placeholder="e.g. United States, United Kingdom, UAE"
          value={data.legalCountry || ''} onChange={e => onUpdate({ legalCountry: e.target.value })} />
        <SInput label="Number of Founders" accentColor={color} type="number" min="1" max="20"
          placeholder="e.g. 1"
          value={data.founders || ''} onChange={e => onUpdate({ founders: e.target.value })} />
      </div>

      <GenBtn loading={loading} disabled={!data.pitch} onClick={generate} color={color} />

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'studioFadeIn 0.5s ease' }}>
          {/* Recommended structure */}
          <div style={{ padding: '20px 24px', borderRadius: 16, background: `linear-gradient(135deg, ${color}10, rgba(255,255,255,0.02))`, border: `1px solid ${color}30` }}>
            <p style={{ fontFamily: MONO, fontSize: 9, color, letterSpacing: '0.12em', marginBottom: 8 }}>RECOMMENDED STRUCTURE</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: 10 }}>{result.recommended_structure}</p>
            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>{result.why}</p>
          </div>

          {/* Registration steps */}
          <Section title="Registration Steps" color={color}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.registration_steps?.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color }}>{s.step}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{s.action}</p>
                    <p style={{ fontFamily: MONO, fontSize: 9, color: '#64748b' }}>{s.timeline} · {s.cost} · {s.service}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Section title="Key Considerations" color={color}>
              {result.key_considerations?.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <AlertCircle size={11} style={{ color, marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{c}</p>
                </div>
              ))}
            </Section>
            <Section title="IP & Tax" color={color}>
              <p style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.08em', marginBottom: 6 }}>TAXES</p>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 12 }}>{result.tax_overview}</p>
              <p style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.08em', marginBottom: 6 }}>IP PROTECTION</p>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{result.ip_advice}</p>
            </Section>
          </div>

          {result.equity_split_note && (
            <Section title="Equity & Vesting" color="#fbbf24">
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>{result.equity_split_note}</p>
            </Section>
          )}

          <NextBtn onClick={onNext} label="Continue to Pitch Builder" color={color} />
        </div>
      )}
    </div>
  )
}

function PitchBuilderPanel({ data, onUpdate, loading, setLoading, setError }) {
  const color = STEPS[7].color
  const result = data.pitchBuilderResult

  async function generate() {
    setError(null); setLoading(true)
    try {
      const res = await apiFetch('/api/ai/startup/pitch-builder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: data.pitch, industry: data.industry, targetMarket: data.targetMarket,
          businessModel: data.businessModelResult?.recommended_model,
          financials: data.financialResult,
          competitors: data.competitorResult?.competitors,
          gtm: data.gtmResult,
          fundingAsk: data.fundingAsk,
          equity: data.pitchEquity,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onUpdate({ pitchBuilderResult: json })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const slideColors = ['#a78bfa','#f87171','#60a5fa','#f472b6','#34d399','#fbbf24','#22d3ee','#fb923c','#a78bfa','#34d399']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SInput label="Equity Offered (optional)" accentColor={color} placeholder="e.g. 10%"
        value={data.pitchEquity || ''} onChange={e => onUpdate({ pitchEquity: e.target.value })} />

      <GenBtn loading={loading} disabled={!data.pitch} onClick={generate} color={color} />

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'studioFadeIn 0.5s ease' }}>
          {/* Deck title + one-liner */}
          <div style={{ padding: '20px 24px', borderRadius: 16, background: `linear-gradient(135deg, ${color}10, rgba(255,255,255,0.02))`, border: `1px solid ${color}30` }}>
            <p style={{ fontFamily: MONO, fontSize: 9, color, letterSpacing: '0.12em', marginBottom: 6 }}>INVESTOR PITCH DECK</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>{result.deck_title}</p>
            <p style={{ fontSize: 14, color: '#cbd5e1', fontStyle: 'italic' }}>{result.one_liner}</p>
          </div>

          {/* Investor notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Section title="Strongest Slide" color="#34d399">
              <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>{result.strongest_slide}</p>
            </Section>
            <Section title="Needs Most Work" color="#f87171">
              <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>{result.weakest_slide}</p>
            </Section>
          </div>

          {/* Slides */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.slides?.map((s, i) => (
              <div key={s.number} style={{ padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${slideColors[i]}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: slideColors[i] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 800, color: slideColors[i] }}>{s.number}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{s.title}</p>
                    <p style={{ fontFamily: MONO, fontSize: 9, color: '#64748b' }}>{s.key_message}</p>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: slideColors[i], fontStyle: 'italic', marginBottom: 10 }}>"{s.hook}"</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
                  {s.bullets?.map((b, j) => (
                    <div key={j} style={{ display: 'flex', gap: 8 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: slideColors[i], marginTop: 6, flexShrink: 0 }} />
                      <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{b}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '8px 12px', borderRadius: 8, background: `${slideColors[i]}08`, border: `1px solid ${slideColors[i]}20` }}>
                  <Sparkles size={11} style={{ color: slideColors[i], marginTop: 1, flexShrink: 0 }} />
                  <p style={{ fontFamily: MONO, fontSize: 9, color: slideColors[i] + 'cc', lineHeight: 1.5 }}>{s.design_tip}</p>
                </div>
              </div>
            ))}
          </div>

          <Section title="Investor Notes" color={color}>
            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>{result.investor_notes}</p>
          </Section>
        </div>
      )}
    </div>
  )
}

// ── STEP PANEL ROUTER ──────────────────────────────────────────────
function StepContent({ stepId, data, onUpdate, onGoTo, loading, setLoading, setError }) {
  const props = { data, onUpdate, loading, setLoading, setError }
  const nextStep = () => onGoTo(stepId + 1)
  switch (stepId) {
    case 1: return <IdeaValidatorPanel   {...props} onNext={nextStep} />
    case 2: return <CompetitorPanel      {...props} onNext={nextStep} />
    case 3: return <BusinessModelPanel   {...props} onNext={nextStep} />
    case 4: return <NameStudioPanel      {...props} onNext={nextStep} />
    case 5: return <FinancialPanel       {...props} onNext={nextStep} />
    case 6: return <GTMPanel             {...props} onNext={nextStep} />
    case 7: return <LegalPanel           {...props} onNext={nextStep} />
    case 8: return <PitchBuilderPanel    {...props} />
    default: return null
  }
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────
export default function StartupStudio() {
  const [activeStep, setActiveStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    pitch: '', industry: '', targetMarket: '', stage: 'Idea', fundingAsk: '',
    knownCompetitors: '', nameVibe: 'Modern', nameKeywords: '',
    teamSize: 'Just me', location: '', legalCountry: '', founders: '1',
    marketingBudget: 'Bootstrap (<$1k)', gtmGoal: 'First 10 customers',
    pitchEquity: '',
    ideaResult: null, competitorResult: null, businessModelResult: null,
    nameResult: null, selectedName: '', financialResult: null,
    gtmResult: null, legalResult: null, pitchBuilderResult: null,
  })

  function onUpdate(partial) {
    setData(d => ({ ...d, ...partial }))
    // Auto-mark step as complete when result appears
    const resultKeys = ['ideaResult','competitorResult','businessModelResult','nameResult','financialResult','gtmResult','legalResult','pitchBuilderResult']
    const stepResultKey = resultKeys[activeStep - 1]
    if (stepResultKey && partial[stepResultKey]) {
      setCompletedSteps(prev => new Set(prev).add(activeStep))
    }
  }

  function goToStep(id) {
    // can only go to completed steps or the first unlocked one
    const firstUnlocked = Math.min(...[...Array(8)].map((_, i) => i + 1).filter(i => !completedSteps.has(i)))
    if (id <= firstUnlocked || completedSteps.has(id)) {
      setActiveStep(id)
      setError(null)
    }
  }

  const step = STEPS[activeStep - 1]
  const firstUnlocked = Math.min(...[1,...[...completedSteps]].map(n => n + 1).concat([1]))
  const maxUnlocked = completedSteps.size > 0 ? Math.max(...[...completedSteps]) + 1 : 1

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: SANS, paddingBottom: 60, position: 'relative' }}>

      {/* ── Animated background orbs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', animation: 'studioOrb1 25s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)', animation: 'studioOrb2 30s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', animation: 'studioOrb3 20s ease-in-out infinite' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Hero ── */}
        <div style={{ paddingTop: 8, paddingBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 20, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', marginBottom: 16 }}>
            <Sparkles size={10} style={{ color: '#a78bfa' }} />
            <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.12em' }}>TRACKR STARTUP STUDIO</span>
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 12 }}>
            <span style={{ background: 'linear-gradient(135deg, #e2e8f0 0%, #a78bfa 50%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Turn your idea
            </span>
            <br />
            <span style={{ color: '#475569' }}>into a real business.</span>
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', maxWidth: 480, lineHeight: 1.7 }}>
            8 AI-powered steps — from raw idea to investor pitch. Context carries forward automatically, so you only explain your business once.
          </p>
        </div>

        {/* ── Step Timeline ── */}
        <div style={{ marginBottom: 32, position: 'relative' }}>
          {/* connecting line */}
          <div style={{ position: 'absolute', top: 20, left: 20, right: 20, height: 1, background: 'rgba(255,255,255,0.06)', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: 20, left: 20, height: 1, zIndex: 0, transition: 'width 0.6s ease', background: `linear-gradient(90deg, #a78bfa, ${step.color})`, width: `${Math.max(0, (completedSteps.size / 7) * 100)}%` }} />

          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
            {STEPS.map(s => {
              const done = completedSteps.has(s.id)
              const active = s.id === activeStep
              const locked = s.id > maxUnlocked
              const Icon = s.icon
              return (
                <button key={s.id} onClick={() => goToStep(s.id)} disabled={locked}
                  style={{
                    flex: '1 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    padding: '0 8px 0', background: 'transparent', border: 'none',
                    cursor: locked ? 'default' : 'pointer', position: 'relative', zIndex: 1,
                    opacity: locked ? 0.3 : 1, transition: 'opacity 0.3s',
                  }}
                >
                  {/* circle */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? s.color : active ? `${s.color}20` : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${done ? s.color : active ? s.color : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: active ? `0 0 20px ${s.glow}` : done ? `0 0 12px ${s.glow}` : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {done
                      ? <CheckCircle2 size={18} style={{ color: '#fff' }} />
                      : locked
                        ? <Lock size={14} style={{ color: '#475569' }} />
                        : <Icon size={16} style={{ color: active ? s.color : '#475569' }} />
                    }
                  </div>
                  {/* label */}
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', color: active ? s.color : done ? s.color + 'aa' : '#475569', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {s.label}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Active Step Panel ── */}
        <div style={{
          borderRadius: 20, overflow: 'hidden',
          border: `1px solid ${step.color}25`,
          boxShadow: `0 0 60px ${step.glow}, 0 24px 64px rgba(0,0,0,0.3)`,
          background: 'rgba(8,12,24,0.85)', backdropFilter: 'blur(24px)',
        }}>
          {/* colored top stripe */}
          <div style={{ height: 3, background: `linear-gradient(90deg, ${step.color}, ${step.color}44, transparent)` }} />

          {/* panel header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${step.color}15`, border: `1px solid ${step.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(() => { const Icon = step.icon; return <Icon size={18} style={{ color: step.color }} /> })()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: step.color, letterSpacing: '0.12em' }}>STEP {step.id} OF 8</p>
                {completedSteps.has(step.id) && <ResultTag label="DONE" color="#34d399" />}
              </div>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>{step.label}</p>
              <p style={{ fontSize: 12, color: '#64748b' }}>{step.desc}</p>
            </div>
          </div>

          {/* panel body */}
          <div style={{ padding: 28 }}>
            {error && (
              <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', marginBottom: 16 }}>
                <AlertCircle size={14} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: '#f87171' }}>{error}</p>
              </div>
            )}

            <StepContent
              stepId={activeStep}
              data={data}
              onUpdate={onUpdate}
              onGoTo={id => { setActiveStep(id); setError(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes studioSpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes studioFadeIn { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
        @keyframes studioOrb1 { 0%,100% { transform: translate(0,0) scale(1) } 33% { transform: translate(-40px,60px) scale(1.08) } 66% { transform: translate(30px,-30px) scale(0.95) } }
        @keyframes studioOrb2 { 0%,100% { transform: translate(0,0) scale(1) } 33% { transform: translate(60px,-40px) scale(1.05) } 66% { transform: translate(-20px,40px) scale(0.97) } }
        @keyframes studioOrb3 { 0%,100% { transform: translate(0,0) scale(1) } 50% { transform: translate(-30px,20px) scale(1.1) } }
      `}</style>
    </div>
  )
}
