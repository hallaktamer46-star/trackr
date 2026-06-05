import { useState } from 'react'
import {
  Zap, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  TrendingUp, TrendingDown, Minus, Loader2, RotateCcw,
  Target, DollarSign, Globe, BarChart3, ShieldAlert, Rocket,
  MessageSquare, Star, Flag, ArrowRight, Building2
} from 'lucide-react'
import { apiFetch } from '../lib/api'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'
const SURFACE = '#161b22'
const BORDER  = 'rgba(48,54,61,0.9)'

const STAGES = ['Idea', 'MVP / Prototype', 'Early Revenue', 'Growth / Scale', 'Pre-IPO']
const INDUSTRIES = [
  'SaaS / Software', 'Fintech', 'Healthtech', 'E-commerce', 'EdTech',
  'Climate / GreenTech', 'AI / ML', 'Consumer', 'Marketplace', 'Deep Tech', 'Other',
]

const SECTION_ICONS = {
  market:          Globe,
  model:           DollarSign,
  differentiation: Target,
  gtm:             Rocket,
  financials:      BarChart3,
  risk:            ShieldAlert,
}

const VERDICT_CFG = {
  pass:        { color: '#ffb4ab', bg: 'rgba(255,180,171,0.1)', border: 'rgba(255,180,171,0.35)', label: 'Pass',        sub: 'Fundamental issues need resolving first' },
  conditional: { color: '#ffb689', bg: 'rgba(255,182,137,0.1)', border: 'rgba(255,182,137,0.35)', label: 'Conditional', sub: 'Potential exists — critical gaps must be addressed' },
  promising:   { color: '#a3c9ff', bg: 'rgba(163,201,255,0.1)', border: 'rgba(163,201,255,0.35)', label: 'Promising',   sub: 'Strong foundation with refinements needed' },
  strong:      { color: '#4edea3', bg: 'rgba(78,222,163,0.1)',  border: 'rgba(78,222,163,0.35)',  label: 'Strong',      sub: 'Compelling business case — move fast' },
}

const RATING_CFG = {
  weak:     { color: '#ffb4ab', icon: TrendingDown },
  moderate: { color: '#ffb689', icon: Minus        },
  strong:   { color: '#4edea3', icon: TrendingUp   },
  low:      { color: '#4edea3', icon: TrendingUp   },
  medium:   { color: '#ffb689', icon: Minus        },
  high:     { color: '#ffb4ab', icon: TrendingDown },
  critical: { color: '#ff4040', icon: AlertTriangle },
}

/* ─── Score bar ─── */
function ScoreBar({ score, color }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ flex:1, height:3, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${score}%`, background:`linear-gradient(90deg,${color}80,${color})`, transition:'width 1s ease' }}/>
      </div>
      <span style={{ fontFamily:MONO, fontSize:10, fontWeight:800, color, minWidth:28, textAlign:'right' }}>{score}</span>
    </div>
  )
}

/* ─── Section card ─── */
function SectionCard({ section, index }) {
  const [open, setOpen] = useState(index < 2)
  const Icon    = SECTION_ICONS[section.id] || Target
  const rating  = RATING_CFG[section.rating] || RATING_CFG.moderate
  const RIcon   = rating.icon

  return (
    <div style={{
      background: SURFACE, border: `0.5px solid ${BORDER}`,
      borderLeft: `2px solid ${rating.color}`,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
      animation: `sectionIn 0.4s ease both`,
      animationDelay: `${index * 0.07}s`,
    }}>
      {/* Header row */}
      <button onClick={() => setOpen(o => !o)}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:`${rating.color}12`, border:`0.5px solid ${rating.color}30` }}>
            <Icon size={14} style={{ color: rating.color }}/>
          </div>
          <div>
            <p style={{ fontFamily:MONO, fontSize:10, fontWeight:700, color:'#e2e2e8', letterSpacing:'0.04em' }}>{section.title}</p>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
              <RIcon size={9} style={{ color: rating.color }}/>
              <span style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color: rating.color, letterSpacing:'0.06em', textTransform:'uppercase' }}>{section.rating}</span>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:100 }}>
            <ScoreBar score={section.score} color={rating.color}/>
          </div>
          {open ? <ChevronUp size={14} style={{ color:'#5a6478' }}/> : <ChevronDown size={14} style={{ color:'#5a6478' }}/>}
        </div>
      </button>

      {/* Body */}
      {open && (
        <div style={{ padding:'0 18px 18px', borderTop:`0.5px solid ${BORDER}` }}>
          <p style={{ fontSize:13, color:'#8a919f', lineHeight:1.75, marginTop:14, marginBottom:16 }}>{section.analysis}</p>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {/* Red flags */}
            {section.flags?.length > 0 && (
              <div style={{ background:'rgba(255,180,171,0.05)', border:'0.5px solid rgba(255,180,171,0.15)', padding:'12px 14px' }}>
                <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color:'#ffb4ab', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
                  <AlertTriangle size={9}/> Red Flags
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  {section.flags.map((f,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                      <div style={{ width:4, height:4, borderRadius:'50%', background:'#ffb4ab', marginTop:5, flexShrink:0 }}/>
                      <p style={{ fontSize:12, color:'#c0c7d5', lineHeight:1.5 }}>{f}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Positives */}
            {section.positives?.length > 0 && (
              <div style={{ background:'rgba(78,222,163,0.05)', border:'0.5px solid rgba(78,222,163,0.15)', padding:'12px 14px' }}>
                <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color:'#4edea3', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
                  <CheckCircle2 size={9}/> What Works
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  {section.positives.map((p,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                      <div style={{ width:4, height:4, borderRadius:'50%', background:'#4edea3', marginTop:5, flexShrink:0 }}/>
                      <p style={{ fontSize:12, color:'#c0c7d5', lineHeight:1.5 }}>{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
export default function PitchLab() {
  const [pitch,       setPitch]       = useState('')
  const [industry,    setIndustry]    = useState('')
  const [stage,       setStage]       = useState('')
  const [fundingAsk,  setFundingAsk]  = useState('')
  const [targetMarket,setTargetMarket]= useState('')
  const [loading,     setLoading]     = useState(false)
  const [result,      setResult]      = useState(null)
  const [error,       setError]       = useState(null)

  const canSubmit = pitch.trim().length > 40

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res  = await apiFetch('/api/ai/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch, industry, stage, fundingAsk, targetMarket }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setResult(null); setError(null) }

  const verdict = result ? (VERDICT_CFG[result.verdict] || VERDICT_CFG.conditional) : null

  return (
    <div style={{ fontFamily:SANS, maxWidth:900, margin:'0 auto', paddingTop:4 }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <div style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,rgba(163,201,255,0.15),rgba(78,222,163,0.08))', border:'0.5px solid rgba(163,201,255,0.25)' }}>
            <Building2 size={15} style={{ color:'#a3c9ff' }}/>
          </div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:'-0.03em', color:'#e2e2e8', lineHeight:1 }}>AI Pitch Lab</h1>
            <p style={{ fontFamily:MONO, fontSize:9, color:'#5a6478', marginTop:2 }}>KPMG-grade deal advisory · brutally honest · structured feedback</p>
          </div>
        </div>

        {/* Consultant badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'8px 14px', background:'rgba(163,201,255,0.04)', border:'0.5px solid rgba(163,201,255,0.1)', marginTop:4 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#4edea3', boxShadow:'0 0 6px #4edea3' }}/>
          <p style={{ fontFamily:MONO, fontSize:9, color:'#5a6478', letterSpacing:'0.04em' }}>
            Modelled on a <span style={{ color:'#c0c7d5', fontWeight:700 }}>KPMG Senior Partner, Deal Advisory</span> · 20 years · 400+ deals assessed
          </p>
        </div>
      </div>

      {!result ? (
        /* ── Input form ── */
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Main pitch textarea */}
          <div style={{ background:SURFACE, border:`0.5px solid ${BORDER}`, borderTop:'2px solid #a3c9ff', padding:20 }}>
            <label style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.1em', color:'#a3c9ff', textTransform:'uppercase', display:'block', marginBottom:10 }}>
              Your Business Pitch
            </label>
            <textarea
              rows={8}
              value={pitch}
              onChange={e => setPitch(e.target.value)}
              placeholder={`Describe your business idea. The more detail the better.\n\nWhat problem does it solve? Who is the customer? How does it make money? What's your unfair advantage? What traction do you have?\n\nWrite it like you're pitching to an investor in a meeting — don't hold back.`}
              style={{
                width:'100%', boxSizing:'border-box',
                padding:'12px 14px',
                background:'rgba(255,255,255,0.025)',
                border:`0.5px solid ${BORDER}`,
                color:'#e2e2e8', fontSize:13, fontFamily:SANS,
                lineHeight:1.7, outline:'none', resize:'vertical',
                transition:'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor='rgba(163,201,255,0.35)'}
              onBlur={e  => e.target.style.borderColor=BORDER}
            />
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
              <p style={{ fontFamily:MONO, fontSize:8, color: pitch.length < 40 ? '#ffb4ab' : '#3a4455' }}>
                {pitch.length < 40 ? `${40 - pitch.length} more characters needed` : `${pitch.length} characters`}
              </p>
              <p style={{ fontFamily:MONO, fontSize:8, color:'#3a4455' }}>The more detail, the sharper the analysis</p>
            </div>
          </div>

          {/* Context fields */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ background:SURFACE, border:`0.5px solid ${BORDER}`, padding:'14px 16px' }}>
              <label style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#5a6478', textTransform:'uppercase', display:'block', marginBottom:8 }}>Industry</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {INDUSTRIES.map(ind => (
                  <button key={ind} onClick={() => setIndustry(industry === ind ? '' : ind)}
                    style={{ padding:'5px 10px', fontFamily:MONO, fontSize:8, fontWeight:600, cursor:'pointer', transition:'all 0.15s', letterSpacing:'0.04em',
                      background: industry === ind ? 'rgba(163,201,255,0.12)' : 'rgba(255,255,255,0.02)',
                      border: `0.5px solid ${industry === ind ? 'rgba(163,201,255,0.4)' : BORDER}`,
                      color: industry === ind ? '#a3c9ff' : '#5a6478',
                    }}>
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ background:SURFACE, border:`0.5px solid ${BORDER}`, padding:'14px 16px' }}>
                <label style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#5a6478', textTransform:'uppercase', display:'block', marginBottom:8 }}>Stage</label>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {STAGES.map(s => (
                    <button key={s} onClick={() => setStage(stage === s ? '' : s)}
                      style={{ padding:'5px 10px', fontFamily:MONO, fontSize:8, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                        background: stage === s ? 'rgba(78,222,163,0.1)' : 'rgba(255,255,255,0.02)',
                        border: `0.5px solid ${stage === s ? 'rgba(78,222,163,0.35)' : BORDER}`,
                        color: stage === s ? '#4edea3' : '#5a6478',
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div style={{ background:SURFACE, border:`0.5px solid ${BORDER}`, padding:'12px 14px' }}>
                  <label style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#5a6478', textTransform:'uppercase', display:'block', marginBottom:6 }}>Funding Ask</label>
                  <input value={fundingAsk} onChange={e => setFundingAsk(e.target.value)} placeholder="e.g. $500k"
                    style={{ width:'100%', boxSizing:'border-box', padding:'7px 10px', background:'rgba(255,255,255,0.02)', border:`0.5px solid ${BORDER}`, color:'#e2e2e8', fontSize:12, fontFamily:SANS, outline:'none', transition:'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor='rgba(163,201,255,0.3)'} onBlur={e => e.target.style.borderColor=BORDER}/>
                </div>
                <div style={{ background:SURFACE, border:`0.5px solid ${BORDER}`, padding:'12px 14px' }}>
                  <label style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#5a6478', textTransform:'uppercase', display:'block', marginBottom:6 }}>Target Market</label>
                  <input value={targetMarket} onChange={e => setTargetMarket(e.target.value)} placeholder="e.g. SMBs in MENA"
                    style={{ width:'100%', boxSizing:'border-box', padding:'7px 10px', background:'rgba(255,255,255,0.02)', border:`0.5px solid ${BORDER}`, color:'#e2e2e8', fontSize:12, fontFamily:SANS, outline:'none', transition:'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor='rgba(163,201,255,0.3)'} onBlur={e => e.target.style.borderColor=BORDER}/>
                </div>
              </div>
            </div>
          </div>

          {error && <p style={{ fontFamily:MONO, fontSize:11, color:'#ffb4ab', padding:'10px 14px', background:'rgba(255,180,171,0.06)', border:'0.5px solid rgba(255,180,171,0.2)' }}>{error}</p>}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={!canSubmit || loading}
            style={{
              width:'100%', padding:'14px 0',
              background: canSubmit ? 'linear-gradient(135deg,#1493ff,#6366f1)' : 'rgba(255,255,255,0.04)',
              border: canSubmit ? 'none' : `0.5px solid ${BORDER}`,
              color: canSubmit ? '#fff' : '#3a4455',
              fontFamily:MONO, fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase',
              cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
              boxShadow: canSubmit ? '0 4px 24px rgba(20,147,255,0.3)' : 'none',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              transition:'all 0.2s',
            }}
            onMouseEnter={e => { if(canSubmit&&!loading) e.currentTarget.style.filter='brightness(1.1)' }}
            onMouseLeave={e => e.currentTarget.style.filter='none'}>
            {loading
              ? <><Loader2 size={15} className="animate-spin"/> Consulting the partners…</>
              : <><Building2 size={15}/> Run KPMG Analysis</>
            }
          </button>

          {loading && (
            <div style={{ textAlign:'center' }}>
              <p style={{ fontFamily:MONO, fontSize:9, color:'#3a4455', letterSpacing:'0.06em' }}>
                Reviewing market opportunity · Stress-testing your model · Identifying risk vectors…
              </p>
            </div>
          )}
        </div>

      ) : (
        /* ── Results ── */
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* ── Verdict hero ── */}
          <div style={{ background:`linear-gradient(145deg, ${verdict.bg.replace('0.1','0.15')}, rgba(7,13,26,0.98))`, border:`0.5px solid ${verdict.border}`, padding:'24px 28px', position:'relative', overflow:'hidden', animation:'sectionIn 0.4s ease both' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${verdict.color},${verdict.color}44,transparent)` }}/>
            <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:`radial-gradient(circle,${verdict.color}12,transparent 70%)`, filter:'blur(20px)', pointerEvents:'none' }}/>

            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:20, position:'relative' }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <span style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:verdict.color, background:`${verdict.color}15`, border:`0.5px solid ${verdict.color}40`, padding:'3px 10px' }}>
                    KPMG Verdict · {verdict.label}
                  </span>
                </div>
                <p style={{ fontSize:14, color:'#c0c7d5', lineHeight:1.75, maxWidth:580 }}>{result.executive_summary}</p>
              </div>

              {/* Score ring */}
              <div style={{ textAlign:'center', flexShrink:0 }}>
                <div style={{ position:'relative', width:80, height:80 }}>
                  <svg width={80} height={80} viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5"/>
                    <circle cx="40" cy="40" r="32" fill="none" stroke={verdict.color} strokeWidth="5"
                      strokeDasharray={`${(result.overall_score/100)*201} 201`}
                      strokeLinecap="butt" transform="rotate(-90 40 40)"
                      style={{ transition:'stroke-dasharray 1.2s ease' }}/>
                    <text x="40" y="45" textAnchor="middle" style={{ fontFamily:MONO, fontSize:18, fontWeight:900, fill:verdict.color }}>{result.overall_score}</text>
                  </svg>
                </div>
                <p style={{ fontFamily:MONO, fontSize:7, color:'#5a6478', letterSpacing:'0.08em', textTransform:'uppercase', marginTop:4 }}>Overall Score</p>
              </div>
            </div>
          </div>

          {/* ── 3-col summary: Fatal Flaws | What Works | Critical Questions ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>

            {/* Fatal flaws */}
            <div style={{ background:SURFACE, border:'0.5px solid rgba(255,180,171,0.2)', borderTop:'2px solid #ffb4ab', padding:'14px 16px', animation:'sectionIn 0.4s ease 0.1s both' }}>
              <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#ffb4ab', textTransform:'uppercase', marginBottom:12, display:'flex', alignItems:'center', gap:5 }}>
                <AlertTriangle size={10}/> Fatal Flaws
              </p>
              {result.fatal_flaws?.length > 0
                ? result.fatal_flaws.map((f,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                      <div style={{ width:4, height:4, borderRadius:'50%', background:'#ffb4ab', marginTop:6, flexShrink:0 }}/>
                      <p style={{ fontSize:12, color:'#c0c7d5', lineHeight:1.5 }}>{f}</p>
                    </div>
                  ))
                : <p style={{ fontFamily:MONO, fontSize:9, color:'#3a4455' }}>No fatal flaws identified.</p>
              }
            </div>

            {/* What works */}
            <div style={{ background:SURFACE, border:'0.5px solid rgba(78,222,163,0.2)', borderTop:'2px solid #4edea3', padding:'14px 16px', animation:'sectionIn 0.4s ease 0.15s both' }}>
              <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#4edea3', textTransform:'uppercase', marginBottom:12, display:'flex', alignItems:'center', gap:5 }}>
                <Star size={10}/> What Works
              </p>
              {result.what_works?.map((w,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                  <div style={{ width:4, height:4, borderRadius:'50%', background:'#4edea3', marginTop:6, flexShrink:0 }}/>
                  <p style={{ fontSize:12, color:'#c0c7d5', lineHeight:1.5 }}>{w}</p>
                </div>
              ))}
            </div>

            {/* Critical questions */}
            <div style={{ background:SURFACE, border:`0.5px solid ${BORDER}`, borderTop:'2px solid #ffb689', padding:'14px 16px', animation:'sectionIn 0.4s ease 0.2s both' }}>
              <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#ffb689', textTransform:'uppercase', marginBottom:12, display:'flex', alignItems:'center', gap:5 }}>
                <MessageSquare size={10}/> Questions You Must Answer
              </p>
              {result.critical_questions?.map((q,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                  <span style={{ fontFamily:MONO, fontSize:9, fontWeight:800, color:'#ffb689', flexShrink:0, marginTop:1 }}>{i+1}.</span>
                  <p style={{ fontSize:12, color:'#c0c7d5', lineHeight:1.5 }}>{q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section breakdown ── */}
          <div>
            <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.12em', color:'#5a6478', textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
              <BarChart3 size={10}/> Detailed Analysis · Click each section to expand
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {result.sections?.map((s,i) => <SectionCard key={s.id} section={s} index={i}/>)}
            </div>
          </div>

          {/* ── Recommendation ── */}
          <div style={{ background:'linear-gradient(145deg,rgba(13,31,60,0.95),rgba(7,13,26,0.98))', border:`0.5px solid rgba(163,201,255,0.15)`, padding:'20px 22px', animation:'sectionIn 0.4s ease 0.5s both', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(163,201,255,0.2),transparent)', pointerEvents:'none' }}/>
            <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.12em', color:'#a3c9ff', textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
              <Flag size={10}/> Partner Recommendation
            </p>
            <p style={{ fontSize:14, color:'#c0c7d5', lineHeight:1.8 }}>{result.recommendation}</p>
          </div>

          {/* ── Actions ── */}
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={reset}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', background:'rgba(255,255,255,0.04)', border:`0.5px solid ${BORDER}`, color:'#8a919f', fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='#c0c7d5' }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#8a919f' }}>
              <RotateCcw size={13}/> Pitch Again
            </button>
            <button onClick={() => { setPitch(''); setIndustry(''); setStage(''); setFundingAsk(''); setTargetMarket(''); reset() }}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', background:'rgba(163,201,255,0.08)', border:'0.5px solid rgba(163,201,255,0.25)', color:'#a3c9ff', fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(163,201,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(163,201,255,0.08)'}>
              <ArrowRight size={13}/> New Pitch
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes sectionIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
