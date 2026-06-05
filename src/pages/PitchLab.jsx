import { useState, useEffect, useRef } from 'react'
import {
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  TrendingUp, TrendingDown, Minus, Loader2, RotateCcw,
  Target, DollarSign, Globe, BarChart3, ShieldAlert, Rocket,
  MessageSquare, Star, Flag, ArrowRight, Building2, Zap,
  Sparkles, Send, RefreshCw
} from 'lucide-react'
import { apiFetch } from '../lib/api'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

const STAGES = ['Idea', 'MVP', 'Early Revenue', 'Growth', 'Pre-IPO']
const INDUSTRIES = [
  'SaaS', 'Fintech', 'Healthtech', 'E-commerce', 'EdTech',
  'Climate', 'AI / ML', 'Consumer', 'Marketplace', 'Deep Tech', 'Other',
]

const SECTION_META = {
  market:          { icon: Globe,      gradient: 'linear-gradient(135deg,#1a6bff22,#0ea5e910)', accent: '#7ab4ff' },
  model:           { icon: DollarSign, gradient: 'linear-gradient(135deg,#10b98122,#4edea310)', accent: '#4edea3' },
  differentiation: { icon: Target,     gradient: 'linear-gradient(135deg,#8b5cf622,#c4b5fd10)', accent: '#c4b5fd' },
  gtm:             { icon: Rocket,     gradient: 'linear-gradient(135deg,#f59e0b22,#ffb68910)', accent: '#ffb689' },
  financials:      { icon: BarChart3,  gradient: 'linear-gradient(135deg,#06b6d422,#67e8f910)', accent: '#67e8f9' },
  risk:            { icon: ShieldAlert,gradient: 'linear-gradient(135deg,#ef444422,#ffb4ab10)', accent: '#ffb4ab' },
}

const VERDICT_CFG = {
  pass:        { color:'#ff6b6b', glow:'rgba(255,107,107,0.25)', label:'Pass',        emoji:'🚫', sub:'Fundamental blockers need resolving first'   },
  conditional: { color:'#ffb347', glow:'rgba(255,179,71,0.25)',  label:'Conditional', emoji:'⚠️', sub:'Potential exists — close critical gaps first' },
  promising:   { color:'#7ab4ff', glow:'rgba(122,180,255,0.25)', label:'Promising',   emoji:'💡', sub:'Strong bones — refine and accelerate'          },
  strong:      { color:'#4edea3', glow:'rgba(78,222,163,0.25)',  label:'Strong',      emoji:'🚀', sub:'Compelling case — move fast'                   },
}

const RATING_CFG = {
  weak:     { color:'#ff6b6b', icon:TrendingDown, label:'Weak'     },
  moderate: { color:'#ffb347', icon:Minus,        label:'Moderate' },
  strong:   { color:'#4edea3', icon:TrendingUp,   label:'Strong'   },
  low:      { color:'#4edea3', icon:TrendingUp,   label:'Low Risk' },
  medium:   { color:'#ffb347', icon:Minus,        label:'Medium'   },
  high:     { color:'#ff6b6b', icon:TrendingDown, label:'High Risk'},
  critical: { color:'#ff3333', icon:AlertTriangle,label:'Critical' },
}

/* ── Animated score ring ── */
function ScoreRing({ score, color, size = 100 }) {
  const r    = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <svg width={size} height={size} style={{ display:'block' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="butt"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition:'stroke-dasharray 1.4s cubic-bezier(0.34,1.2,0.64,1)', filter:`drop-shadow(0 0 8px ${color}80)` }}/>
      <text x={size/2} y={size/2 + 6} textAnchor="middle"
        style={{ fontFamily:MONO, fontSize:size*0.22, fontWeight:900, fill:color }}>{score}</text>
    </svg>
  )
}

/* ── Mini score bar ── */
function ScoreBar({ score, color }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, height:4, background:'rgba(255,255,255,0.06)', overflow:'hidden', borderRadius:2 }}>
        <div style={{ height:'100%', width:`${score}%`, background:`linear-gradient(90deg,${color}70,${color})`, transition:'width 1.2s cubic-bezier(0.34,1.2,0.64,1)', borderRadius:2 }}/>
      </div>
      <span style={{ fontFamily:MONO, fontSize:11, fontWeight:800, color, minWidth:26 }}>{score}</span>
    </div>
  )
}

/* ── Section accordion ── */
function SectionCard({ section, index }) {
  const [open, setOpen] = useState(index < 2)
  const [hov, setHov]   = useState(false)
  const meta   = SECTION_META[section.id] || SECTION_META.market
  const rating = RATING_CFG[section.rating] || RATING_CFG.moderate
  const Icon   = meta.icon
  const RIcon  = rating.icon

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? meta.gradient : 'rgba(22,27,34,0.95)',
        border: `0.5px solid ${hov ? meta.accent + '40' : 'rgba(48,54,61,0.9)'}`,
        borderLeft: `3px solid ${rating.color}`,
        overflow:'hidden',
        transition:'all 0.22s ease',
        boxShadow: hov ? `0 4px 24px rgba(0,0,0,0.4), 0 0 0 0.5px ${meta.accent}15` : 'none',
        animation:`sectionIn 0.45s ease both`,
        animationDelay:`${index * 0.08}s`,
      }}
    >
      <button onClick={() => setOpen(o => !o)}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', background:'none', border:'none', cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', background:`${meta.accent}15`, border:`0.5px solid ${meta.accent}35`, boxShadow: open ? `0 0 16px ${meta.accent}25` : 'none', transition:'box-shadow 0.2s' }}>
            <Icon size={16} style={{ color:meta.accent }}/>
          </div>
          <div style={{ textAlign:'left' }}>
            <p style={{ fontFamily:MONO, fontSize:11, fontWeight:700, color:'#e2e2e8', letterSpacing:'0.04em', marginBottom:4 }}>{section.title}</p>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <RIcon size={10} style={{ color:rating.color }}/>
              <span style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color:rating.color, letterSpacing:'0.08em', textTransform:'uppercase' }}>{rating.label}</span>
              <span style={{ fontFamily:MONO, fontSize:8, color:'rgba(48,54,61,0.9)' }}>·</span>
              <div style={{ width:60 }}><ScoreBar score={section.score} color={rating.color}/></div>
            </div>
          </div>
        </div>
        <div style={{ color:'#5a6478', transition:'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <ChevronDown size={15}/>
        </div>
      </button>

      {open && (
        <div style={{ padding:'0 20px 20px', borderTop:'0.5px solid rgba(48,54,61,0.5)' }}>
          <p style={{ fontSize:13, color:'#8a919f', lineHeight:1.8, marginTop:16, marginBottom:16 }}>{section.analysis}</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {section.flags?.length > 0 && (
              <div style={{ background:'rgba(255,107,107,0.06)', border:'0.5px solid rgba(255,107,107,0.2)', borderRadius:0, padding:'12px 14px' }}>
                <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color:'#ff6b6b', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
                  <AlertTriangle size={9}/> Red Flags
                </p>
                {section.flags.map((f,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:7 }}>
                    <div style={{ width:4,height:4,borderRadius:'50%',background:'#ff6b6b',marginTop:6,flexShrink:0 }}/>
                    <p style={{ fontSize:12,color:'#c0c7d5',lineHeight:1.55 }}>{f}</p>
                  </div>
                ))}
              </div>
            )}
            {section.positives?.length > 0 && (
              <div style={{ background:'rgba(78,222,163,0.06)', border:'0.5px solid rgba(78,222,163,0.2)', padding:'12px 14px' }}>
                <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color:'#4edea3', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
                  <CheckCircle2 size={9}/> What Works
                </p>
                {section.positives.map((p,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:7 }}>
                    <div style={{ width:4,height:4,borderRadius:'50%',background:'#4edea3',marginTop:6,flexShrink:0 }}/>
                    <p style={{ fontSize:12,color:'#c0c7d5',lineHeight:1.55 }}>{p}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
export default function PitchLab() {
  const [pitch,        setPitch]        = useState('')
  const [industry,     setIndustry]     = useState('')
  const [stage,        setStage]        = useState('')
  const [fundingAsk,   setFundingAsk]   = useState('')
  const [targetMarket, setTargetMarket] = useState('')
  const [loading,      setLoading]      = useState(false)
  const [result,       setResult]       = useState(null)
  const [error,        setError]        = useState(null)
  const [charCount,    setCharCount]    = useState(0)
  const textRef = useRef(null)

  useEffect(() => { setCharCount(pitch.length) }, [pitch])

  const canSubmit = pitch.trim().length > 40 && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res  = await apiFetch('/api/ai/pitch', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ pitch, industry, stage, fundingAsk, targetMarket }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message || 'Analysis failed — please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setResult(null); setError(null) }
  const fullReset = () => { setResult(null); setError(null); setPitch(''); setIndustry(''); setStage(''); setFundingAsk(''); setTargetMarket('') }

  const verdict = result ? (VERDICT_CFG[result.verdict] || VERDICT_CFG.conditional) : null

  return (
    <div style={{ fontFamily:SANS, maxWidth:940, margin:'0 auto', paddingTop:4 }}>

      {/* ══ HERO HEADER ══ */}
      <div style={{ position:'relative', marginBottom:32, overflow:'hidden', background:'linear-gradient(145deg,#0c1829,#070d1a)', border:'0.5px solid rgba(163,201,255,0.1)', padding:'32px 36px', animation:'heroIn 0.5s ease both' }}>
        {/* ambient orbs */}
        <div style={{ position:'absolute', top:-60, left:-60, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,rgba(20,147,255,0.12),transparent 70%)', filter:'blur(30px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-40, right:-40, width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle,rgba(78,222,163,0.1),transparent 70%)', filter:'blur(24px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(163,201,255,0.3),rgba(78,222,163,0.2),transparent)', pointerEvents:'none' }}/>

        <div style={{ position:'relative', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:24 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{ width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,rgba(20,147,255,0.2),rgba(78,222,163,0.1))', border:'0.5px solid rgba(163,201,255,0.3)', boxShadow:'0 0 24px rgba(20,147,255,0.2)' }}>
                <Building2 size={18} style={{ color:'#a3c9ff' }}/>
              </div>
              <div>
                <h1 style={{ fontSize:24, fontWeight:900, letterSpacing:'-0.03em', color:'#e2e2e8', lineHeight:1 }}>AI Pitch Lab</h1>
                <p style={{ fontFamily:MONO, fontSize:8, color:'#5a6478', marginTop:3, letterSpacing:'0.06em' }}>POWERED BY KPMG DEAL ADVISORY FRAMEWORK</p>
              </div>
            </div>
            <p style={{ fontSize:14, color:'#8a919f', lineHeight:1.7, maxWidth:460 }}>
              Pitch your business idea. Get the same structured, brutal feedback a KPMG Senior Partner would deliver in a real due diligence meeting — no flattery, no fluff.
            </p>
          </div>

          {/* 3 criteria pills */}
          <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
            {[
              { label:'Market Analysis',   color:'#7ab4ff' },
              { label:'Business Model',    color:'#4edea3' },
              { label:'Risk Assessment',   color:'#ffb689' },
              { label:'Competitive Moat',  color:'#c4b5fd' },
              { label:'Financial Viability',color:'#67e8f9' },
              { label:'GTM Strategy',      color:'#ffb4ab' },
            ].map(p => (
              <div key={p.label} style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 12px', background:`${p.color}0c`, border:`0.5px solid ${p.color}25` }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:p.color, boxShadow:`0 0 6px ${p.color}` }}/>
                <span style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color:p.color, letterSpacing:'0.06em' }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!result ? (
        /* ══ INPUT FORM ══ */
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Pitch textarea — full width hero input */}
          <div style={{ position:'relative', background:'rgba(22,27,34,0.97)', border:'0.5px solid rgba(48,54,61,0.9)', borderTop:'2px solid #a3c9ff', overflow:'hidden', animation:'sectionIn 0.4s ease 0.1s both' }}>
            <div style={{ padding:'18px 20px 0' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <Sparkles size={13} style={{ color:'#a3c9ff' }}/>
                <label style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.12em', color:'#a3c9ff', textTransform:'uppercase' }}>Your Business Pitch</label>
                <span style={{ marginLeft:'auto', fontFamily:MONO, fontSize:8, color: charCount < 40 ? '#ff6b6b' : charCount > 200 ? '#4edea3' : '#5a6478', transition:'color 0.3s' }}>{charCount} chars {charCount < 40 ? `· ${40-charCount} more needed` : '· looks good'}</span>
              </div>
            </div>
            <textarea
              ref={textRef}
              rows={9}
              value={pitch}
              onChange={e => setPitch(e.target.value)}
              placeholder={"Describe your business idea in detail.\n\nWhat problem does it solve? Who is the customer? How does it make money? What's your unfair advantage? What traction do you have?\n\nWrite like you're pitching to an investor — no holding back."}
              style={{
                width:'100%', boxSizing:'border-box', padding:'0 20px 18px',
                background:'transparent', border:'none', color:'#e2e2e8',
                fontSize:13, fontFamily:SANS, lineHeight:1.75, outline:'none', resize:'none',
              }}
            />
            {/* char progress bar */}
            <div style={{ height:2, background:'rgba(255,255,255,0.04)' }}>
              <div style={{ height:'100%', width:`${Math.min(100,(charCount/500)*100)}%`, background: charCount < 40 ? '#ff6b6b' : 'linear-gradient(90deg,#a3c9ff,#4edea3)', transition:'width 0.3s, background 0.3s' }}/>
            </div>
          </div>

          {/* Context row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, animation:'sectionIn 0.4s ease 0.15s both' }}>

            {/* Industry */}
            <div style={{ background:'rgba(22,27,34,0.97)', border:'0.5px solid rgba(48,54,61,0.9)', padding:'16px 18px' }}>
              <label style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.12em', color:'#7ab4ff', textTransform:'uppercase', display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                <Globe size={9}/> Industry
              </label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {INDUSTRIES.map(ind => (
                  <button key={ind} onClick={() => setIndustry(industry===ind?'':ind)}
                    style={{
                      padding:'5px 11px', fontFamily:MONO, fontSize:8, fontWeight:600, cursor:'pointer', transition:'all 0.18s', letterSpacing:'0.04em',
                      background: industry===ind ? 'rgba(122,180,255,0.14)' : 'rgba(255,255,255,0.025)',
                      border: `0.5px solid ${industry===ind ? 'rgba(122,180,255,0.5)' : 'rgba(48,54,61,0.9)'}`,
                      color: industry===ind ? '#7ab4ff' : '#5a6478',
                      transform: industry===ind ? 'translateY(-1px)' : 'none',
                      boxShadow: industry===ind ? '0 2px 12px rgba(122,180,255,0.2)' : 'none',
                    }}>
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {/* Stage */}
              <div style={{ background:'rgba(22,27,34,0.97)', border:'0.5px solid rgba(48,54,61,0.9)', padding:'14px 16px' }}>
                <label style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.12em', color:'#4edea3', textTransform:'uppercase', display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
                  <Rocket size={9}/> Stage
                </label>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {STAGES.map(s => (
                    <button key={s} onClick={() => setStage(stage===s?'':s)}
                      style={{
                        padding:'5px 12px', fontFamily:MONO, fontSize:8, fontWeight:600, cursor:'pointer', transition:'all 0.18s',
                        background: stage===s ? 'rgba(78,222,163,0.14)' : 'rgba(255,255,255,0.025)',
                        border: `0.5px solid ${stage===s ? 'rgba(78,222,163,0.5)' : 'rgba(48,54,61,0.9)'}`,
                        color: stage===s ? '#4edea3' : '#5a6478',
                        transform: stage===s ? 'translateY(-1px)' : 'none',
                        boxShadow: stage===s ? '0 2px 12px rgba(78,222,163,0.2)' : 'none',
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Funding + Market */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { key:'fundingAsk',   val:fundingAsk,   set:setFundingAsk,   label:'Funding Ask',    ph:'e.g. $500k',      color:'#ffb689', icon:DollarSign },
                  { key:'targetMarket', val:targetMarket, set:setTargetMarket, label:'Target Market',  ph:'e.g. SMBs in MENA', color:'#c4b5fd', icon:Target },
                ].map(f => (
                  <div key={f.key} style={{ background:'rgba(22,27,34,0.97)', border:'0.5px solid rgba(48,54,61,0.9)', padding:'12px 14px' }}>
                    <label style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:f.color, textTransform:'uppercase', display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
                      <f.icon size={9}/> {f.label}
                    </label>
                    <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                      style={{ width:'100%', boxSizing:'border-box', padding:'7px 10px', background:'rgba(255,255,255,0.025)', border:'0.5px solid rgba(48,54,61,0.9)', color:'#e2e2e8', fontSize:12, fontFamily:SANS, outline:'none', transition:'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor=f.color+'60'} onBlur={e => e.target.style.borderColor='rgba(48,54,61,0.9)'}/>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding:'12px 16px', background:'rgba(255,107,107,0.07)', border:'0.5px solid rgba(255,107,107,0.25)', display:'flex', alignItems:'center', gap:10 }}>
              <AlertTriangle size={13} style={{ color:'#ff6b6b', flexShrink:0 }}/>
              <p style={{ fontFamily:MONO, fontSize:11, color:'#ff6b6b' }}>{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button onClick={handleSubmit} disabled={!canSubmit}
            style={{
              width:'100%', padding:'16px 0', position:'relative', overflow:'hidden',
              background: canSubmit ? 'linear-gradient(135deg,#1a6bff,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.04)',
              backgroundSize: '200% 100%',
              border: canSubmit ? 'none' : '0.5px solid rgba(48,54,61,0.9)',
              color: canSubmit ? '#fff' : '#3a4455',
              fontFamily:MONO, fontSize:12, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              boxShadow: canSubmit ? '0 4px 32px rgba(99,102,241,0.4), 0 0 0 0.5px rgba(139,92,246,0.3)' : 'none',
              display:'flex', alignItems:'center', justifyContent:'center', gap:12,
              transition:'all 0.22s', animation:'sectionIn 0.4s ease 0.2s both',
            }}
            onMouseEnter={e => { if(canSubmit) e.currentTarget.style.filter='brightness(1.12)' }}
            onMouseLeave={e => e.currentTarget.style.filter='none'}
            onMouseDown={e => { if(canSubmit) e.currentTarget.style.transform='scale(0.99)' }}
            onMouseUp={e => e.currentTarget.style.transform='none'}>
            {canSubmit && !loading && <span style={{ position:'absolute', inset:0, background:'linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.12) 50%,transparent 65%)', backgroundSize:'200% 100%', animation:'shimmer 2s ease infinite', pointerEvents:'none' }}/>}
            {loading
              ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> Consulting the partners…</>
              : <><Send size={15}/> Run KPMG Analysis</>
            }
          </button>

          {loading && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'20px 0' }}>
              <div style={{ display:'flex', gap:16 }}>
                {['Reviewing market opportunity', 'Stress-testing the model', 'Mapping competitive risk', 'Assessing financials'].map((t,i) => (
                  <div key={t} style={{ display:'flex', alignItems:'center', gap:6, opacity: 0.5, animation:`fadeInUp 0.4s ease ${i*0.15}s both` }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:'#a3c9ff', animation:'pulse 1.4s ease infinite', animationDelay:`${i*0.3}s` }}/>
                    <span style={{ fontFamily:MONO, fontSize:8, color:'#5a6478' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      ) : (
        /* ══ RESULTS ══ */
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* ── Verdict hero ── */}
          <div style={{
            position:'relative', overflow:'hidden',
            background:`linear-gradient(145deg, rgba(7,13,26,0.99), rgba(13,18,32,0.98))`,
            border:`0.5px solid ${verdict.color}35`,
            padding:'28px 32px',
            animation:'heroIn 0.5s ease both',
          }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${verdict.color},${verdict.color}55,transparent)` }}/>
            <div style={{ position:'absolute', top:-50, right:-50, width:200, height:200, borderRadius:'50%', background:`radial-gradient(circle,${verdict.glow},transparent 70%)`, filter:'blur(30px)', pointerEvents:'none' }}/>
            <div style={{ position:'absolute', bottom:-30, left:0, width:300, height:120, background:`radial-gradient(ellipse,${verdict.color}06,transparent 70%)`, filter:'blur(20px)', pointerEvents:'none' }}/>

            <div style={{ position:'relative', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:24 }}>
              <div style={{ flex:1 }}>
                {/* verdict badge */}
                <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'6px 14px', background:`${verdict.color}15`, border:`0.5px solid ${verdict.color}50`, marginBottom:16 }}>
                  <span style={{ fontSize:14 }}>{verdict.emoji}</span>
                  <span style={{ fontFamily:MONO, fontSize:9, fontWeight:800, color:verdict.color, letterSpacing:'0.12em', textTransform:'uppercase' }}>
                    KPMG Verdict · {verdict.label}
                  </span>
                  <span style={{ fontFamily:MONO, fontSize:8, color:`${verdict.color}80` }}>·</span>
                  <span style={{ fontFamily:MONO, fontSize:8, color:`${verdict.color}80` }}>{verdict.sub}</span>
                </div>

                <p style={{ fontSize:14, color:'#c0c7d5', lineHeight:1.8, maxWidth:560, marginBottom:20 }}>{result.executive_summary}</p>

                {/* Section scores mini row */}
                <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                  {result.sections?.map(s => {
                    const rc = RATING_CFG[s.rating] || RATING_CFG.moderate
                    const m  = SECTION_META[s.id]   || SECTION_META.market
                    return (
                      <div key={s.id} style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <m.icon size={10} style={{ color:m.accent }}/>
                        <div style={{ width:36, height:2, background:'rgba(255,255,255,0.06)', overflow:'hidden', borderRadius:1 }}>
                          <div style={{ height:'100%', width:`${s.score}%`, background:rc.color, transition:'width 1.2s ease' }}/>
                        </div>
                        <span style={{ fontFamily:MONO, fontSize:9, fontWeight:700, color:rc.color }}>{s.score}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Score ring */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                <ScoreRing score={result.overall_score} color={verdict.color} size={96}/>
                <p style={{ fontFamily:MONO, fontSize:7, color:'#5a6478', letterSpacing:'0.08em', textTransform:'uppercase', marginTop:6 }}>Overall Score</p>
              </div>
            </div>
          </div>

          {/* ── 3 summary cards ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, animation:'sectionIn 0.4s ease 0.1s both' }}>

            {/* Fatal flaws */}
            <div style={{ background:'rgba(255,107,107,0.06)', border:'0.5px solid rgba(255,107,107,0.2)', borderTop:'2px solid #ff6b6b', padding:'16px' }}>
              <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#ff6b6b', textTransform:'uppercase', marginBottom:12, display:'flex', alignItems:'center', gap:5 }}>
                <AlertTriangle size={9}/> Fatal Flaws
              </p>
              {result.fatal_flaws?.length > 0
                ? result.fatal_flaws.map((f,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                      <div style={{ width:4,height:4,borderRadius:'50%',background:'#ff6b6b',marginTop:6,flexShrink:0,boxShadow:'0 0 4px #ff6b6b' }}/>
                      <p style={{ fontSize:12,color:'#c0c7d5',lineHeight:1.55 }}>{f}</p>
                    </div>
                  ))
                : <p style={{ fontFamily:MONO, fontSize:9, color:'#3a4455' }}>None identified.</p>
              }
            </div>

            {/* What works */}
            <div style={{ background:'rgba(78,222,163,0.06)', border:'0.5px solid rgba(78,222,163,0.2)', borderTop:'2px solid #4edea3', padding:'16px' }}>
              <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#4edea3', textTransform:'uppercase', marginBottom:12, display:'flex', alignItems:'center', gap:5 }}>
                <Star size={9}/> What Works
              </p>
              {result.what_works?.map((w,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                  <div style={{ width:4,height:4,borderRadius:'50%',background:'#4edea3',marginTop:6,flexShrink:0,boxShadow:'0 0 4px #4edea3' }}/>
                  <p style={{ fontSize:12,color:'#c0c7d5',lineHeight:1.55 }}>{w}</p>
                </div>
              ))}
            </div>

            {/* Critical questions */}
            <div style={{ background:'rgba(255,179,71,0.06)', border:'0.5px solid rgba(255,179,71,0.2)', borderTop:'2px solid #ffb347', padding:'16px' }}>
              <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#ffb347', textTransform:'uppercase', marginBottom:12, display:'flex', alignItems:'center', gap:5 }}>
                <MessageSquare size={9}/> Must-Answer Questions
              </p>
              {result.critical_questions?.map((q,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                  <span style={{ fontFamily:MONO, fontSize:9, fontWeight:800, color:'#ffb347', flexShrink:0, marginTop:1, width:14 }}>{i+1}.</span>
                  <p style={{ fontSize:12,color:'#c0c7d5',lineHeight:1.55 }}>{q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section deep dives ── */}
          <div>
            <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.12em', color:'#5a6478', textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
              <BarChart3 size={9}/> Deep Analysis · Click to expand each section
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {result.sections?.map((s,i) => <SectionCard key={s.id} section={s} index={i}/>)}
            </div>
          </div>

          {/* ── Partner recommendation ── */}
          <div style={{ position:'relative', overflow:'hidden', background:'linear-gradient(145deg,rgba(13,31,60,0.97),rgba(7,13,26,0.98))', border:'0.5px solid rgba(163,201,255,0.15)', padding:'22px 26px', animation:'sectionIn 0.4s ease 0.6s both' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(163,201,255,0.25),rgba(78,222,163,0.15),transparent)', pointerEvents:'none' }}/>
            <div style={{ position:'absolute', bottom:-30, right:0, width:200, height:100, background:'radial-gradient(ellipse,rgba(163,201,255,0.06),transparent)', filter:'blur(20px)', pointerEvents:'none' }}/>
            <div style={{ position:'relative' }}>
              <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.12em', color:'#a3c9ff', textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                <Flag size={10}/> Partner Recommendation
              </p>
              <p style={{ fontSize:14, color:'#c0c7d5', lineHeight:1.85 }}>{result.recommendation}</p>
            </div>
          </div>

          {/* ── Actions ── */}
          <div style={{ display:'flex', gap:10, animation:'sectionIn 0.4s ease 0.7s both' }}>
            <button onClick={reset}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 20px', background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(48,54,61,0.9)', color:'#8a919f', fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='#c0c7d5' }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#8a919f' }}>
              <RotateCcw size={13}/> Refine & Retry
            </button>
            <button onClick={fullReset}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 20px', background:'linear-gradient(135deg,rgba(20,147,255,0.12),rgba(99,102,241,0.08))', border:'0.5px solid rgba(163,201,255,0.3)', color:'#a3c9ff', fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.18s' }}
              onMouseEnter={e => e.currentTarget.style.background='linear-gradient(135deg,rgba(20,147,255,0.2),rgba(99,102,241,0.15))'}
              onMouseLeave={e => e.currentTarget.style.background='linear-gradient(135deg,rgba(20,147,255,0.12),rgba(99,102,241,0.08))'}>
              <RefreshCw size={13}/> New Pitch
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes heroIn    { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:none} }
        @keyframes sectionIn { from{opacity:0;transform:translateY(10px)}  to{opacity:1;transform:none} }
        @keyframes fadeInUp  { from{opacity:0;transform:translateY(6px)}   to{opacity:0.5;transform:none} }
        @keyframes shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
      `}</style>
    </div>
  )
}
