import { useState, useEffect } from 'react'
import { Plus, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'

const MONO = '"Geist Mono", "JetBrains Mono", monospace'
const SANS = '"Geist", "Inter", system-ui, -apple-system, sans-serif'

const KEY       = 'trackr_lifeplan'
const KEY_START = 'trackr_lifeplan_daystart'

const TICKS = [0, 4, 8, 12, 16, 20, 24]

const COLORS = [
  '#a3c9ff','#4edea3','#60a5fa','#ffb689','#fbbf24',
  '#f472b6','#ff6b6b','#a78bfa','#00d4ff','#e879f9',
  '#34d399','#fb923c',
]

const PRESETS = [
  { name:'Sleep',         color:'#a3c9ff' },
  { name:'Work',          color:'#4edea3' },
  { name:'University',    color:'#60a5fa' },
  { name:'Gym',           color:'#ffb689' },
  { name:'Meals',         color:'#fbbf24' },
  { name:'Leisure',       color:'#f472b6' },
  { name:'Distraction',   color:'#ff6b6b' },
  { name:'Mental Health', color:'#a78bfa' },
  { name:'Transit',       color:'#00d4ff' },
  { name:'Deep Study',    color:'#34d399' },
  { name:'Side Project',  color:'#e879f9' },
  { name:'Social',        color:'#fb923c' },
]

function loadBlocks() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
function loadStart()  { return parseInt(localStorage.getItem(KEY_START) || '5') }

function fmt(h) {
  if (h === 0)  return '12 AM'
  if (h < 12)   return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}
function tickLabel(offset, start) { return fmt((start + offset) % 24) }

const CSS = `
  @keyframes lp-slide {
    from { opacity:0; transform:translateY(-8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes lp-fade {
    from { opacity:0; }
    to   { opacity:1; }
  }
`

/* Dot-grid background SVG */
const DOT_BG = `url("data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='0.8' fill='rgba(163%2C201%2C255%2C0.07)'/%3E%3C/svg%3E")`

export default function LifePlan() {
  const [blocks,  setBlocks]  = useState(loadBlocks)
  const [dayStart,setDayStart]= useState(loadStart)
  const [form,    setForm]    = useState(null)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = CSS
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])

  useEffect(() => { localStorage.setItem(KEY,       JSON.stringify(blocks))  }, [blocks])
  useEffect(() => { localStorage.setItem(KEY_START, String(dayStart))        }, [dayStart])

  const total   = blocks.reduce((s,b) => s + b.hours, 0)
  const free    = Math.max(0, 24 - total)
  const formHrs = parseFloat(form?.hours) || 0
  const over    = total + formHrs > 24

  function shiftStart(dir) { setDayStart(s => (s + dir + 24) % 24) }

  function openForm(preset = null) {
    setForm(preset
      ? { name:preset.name, hours:'', color:preset.color }
      : { name:'',          hours:'', color:COLORS[blocks.length % COLORS.length] })
  }

  function addBlock() {
    const hrs = parseFloat(form?.hours)
    if (!form?.name?.trim() || isNaN(hrs) || hrs <= 0 || over) return
    setBlocks(p => [...p, { id:Date.now(), name:form.name.trim(), hours:hrs, color:form.color }])
    setForm(null)
  }

  function removeBlock(id) { setBlocks(p => p.filter(b => b.id !== id)) }

  const BG = {
    background: `
      radial-gradient(ellipse 80% 40% at 50% 0%, rgba(0,100,200,0.07) 0%, transparent 65%),
      ${DOT_BG},
      #080c10
    `,
    minHeight: '100vh',
    fontFamily: MONO,
  }

  const surface = { background:'rgba(13,18,28,0.9)', border:'1px solid rgba(163,201,255,0.09)' }

  return (
    <div style={BG}>
      {/* Slim top accent */}
      <div style={{ height:1, background:'linear-gradient(90deg,transparent,#00d4ff,#a78bfa,transparent)' }} />

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'40px 28px' }}>

        {/* ── Header ── */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:40 }}>
          <div>
            <div style={{ fontSize:9, color:'rgba(0,212,255,0.55)', letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:10, fontFamily:MONO }}>
              Life Plan
            </div>
            <h1 style={{ fontSize:34, fontWeight:800, color:'#dce8f4', margin:0, letterSpacing:'-0.04em', lineHeight:1, fontFamily:SANS }}>
              Daily Time Budget
            </h1>
            <p style={{ fontSize:12, color:'rgba(163,201,255,0.5)', marginTop:8, fontFamily:SANS, fontWeight:400 }}>
              Design your ideal 24-hour day, from alarm to alarm.
            </p>
          </div>

          <button
            onClick={() => openForm()}
            style={{
              display:'flex', alignItems:'center', gap:8,
              background:'rgba(0,212,255,0.07)',
              border:'1px solid rgba(0,212,255,0.25)',
              color:'#a3c9ff', fontSize:11, fontWeight:600,
              padding:'10px 20px', cursor:'pointer',
              letterSpacing:'0.14em', fontFamily:MONO,
              transition:'all .18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(0,212,255,0.13)'; e.currentTarget.style.color='#00d4ff'; e.currentTarget.style.borderColor='rgba(0,212,255,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(0,212,255,0.07)'; e.currentTarget.style.color='#a3c9ff'; e.currentTarget.style.borderColor='rgba(0,212,255,0.25)' }}
          >
            <Plus size={13} strokeWidth={2.5} />
            NEW BLOCK
          </button>
        </div>

        {/* ── Day-start adjuster ── */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <span style={{ fontSize:9, color:'rgba(163,201,255,0.45)', letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:MONO }}>
            Day starts at
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:0, ...surface }}>
            <button onClick={() => shiftStart(-1)}
              style={{ background:'transparent', border:'none', color:'rgba(163,201,255,0.5)', padding:'5px 9px', cursor:'pointer', display:'flex', alignItems:'center', transition:'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color='#a3c9ff'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(163,201,255,0.5)'}
            >
              <ChevronLeft size={13} />
            </button>
            <span style={{ fontSize:11, color:'#dce8f4', fontFamily:MONO, padding:'5px 14px', fontWeight:700, letterSpacing:'0.08em', borderLeft:'1px solid rgba(163,201,255,0.09)', borderRight:'1px solid rgba(163,201,255,0.09)' }}>
              {fmt(dayStart)}
            </span>
            <button onClick={() => shiftStart(1)}
              style={{ background:'transparent', border:'none', color:'rgba(163,201,255,0.5)', padding:'5px 9px', cursor:'pointer', display:'flex', alignItems:'center', transition:'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color='#a3c9ff'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(163,201,255,0.5)'}
            >
              <ChevronRight size={13} />
            </button>
          </div>
          <span style={{ fontSize:9, color:'rgba(163,201,255,0.25)', fontFamily:MONO }}>
            → {fmt((dayStart + 24) % 24)}
          </span>
        </div>

        {/* ── 24h bar ── */}
        <div style={{ marginBottom:6, animation:'lp-fade .4s ease' }}>
          <div style={{ display:'flex', height:72, gap:1.5, overflow:'hidden' }}>
            {blocks.map(b => (
              <div key={b.id}
                onMouseEnter={() => setHovered(b.id)}
                onMouseLeave={() => setHovered(null)}
                title={`${b.name} · ${b.hours}h`}
                style={{
                  flex: b.hours,
                  background: `linear-gradient(180deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0) 2px), ${b.color}`,
                  display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center',
                  overflow:'hidden', cursor:'default',
                  transition:'opacity .18s, filter .18s',
                  opacity: hovered && hovered !== b.id ? 0.38 : 1,
                  filter: hovered === b.id ? 'brightness(1.12)' : 'brightness(1)',
                }}
              >
                {b.hours >= 1.5 && (
                  <span style={{ fontSize:10, color:'rgba(10,14,22,0.85)', fontWeight:800, fontFamily:SANS, letterSpacing:'-0.01em' }}>
                    {b.hours}h
                  </span>
                )}
                {b.hours >= 3 && (
                  <span style={{ fontSize:8, color:'rgba(10,14,22,0.55)', marginTop:1, fontFamily:SANS, whiteSpace:'nowrap', overflow:'hidden', maxWidth:'90%', textOverflow:'ellipsis' }}>
                    {b.name}
                  </span>
                )}
              </div>
            ))}
            {free > 0 && (
              <div
                onClick={() => openForm()}
                title="Click to add a block"
                style={{
                  flex: free,
                  border:'1px dashed rgba(163,201,255,0.14)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', transition:'border-color .18s, background .18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(163,201,255,0.35)'; e.currentTarget.style.background='rgba(163,201,255,0.03)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(163,201,255,0.14)'; e.currentTarget.style.background='transparent' }}
              >
                {free >= 2 && (
                  <span style={{ fontSize:10, color:'rgba(163,201,255,0.3)', letterSpacing:'0.12em', fontFamily:MONO }}>
                    {free}h free
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tick marks */}
          <div style={{ position:'relative', height:26, marginTop:5 }}>
            {TICKS.map(t => (
              <div key={t} style={{
                position:'absolute',
                left:`${(t/24)*100}%`,
                transform:'translateX(-50%)',
                display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              }}>
                <div style={{ width:1, height:4, background: t===0||t===24 ? 'rgba(0,212,255,0.5)' : 'rgba(163,201,255,0.2)' }} />
                <span style={{
                  fontSize:9, letterSpacing:'0.04em', whiteSpace:'nowrap', fontFamily:MONO,
                  color: t===0||t===24 ? 'rgba(0,212,255,0.7)' : 'rgba(163,201,255,0.35)',
                  fontWeight: t===0||t===24 ? 600 : 400,
                }}>
                  {tickLabel(t, dayStart)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display:'flex', gap:1.5, marginBottom:32 }}>
          {[
            { label:'ALLOCATED', value:`${total}h`,                           color:'#4edea3' },
            { label:'FREE',      value:`${free}h`,                            color: free>0?'#ffb689':'#4edea3' },
            { label:'COVERAGE',  value:`${Math.round((total/24)*100)}%`,      color:'#60a5fa' },
            { label:'BLOCKS',    value: blocks.length,                        color:'#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{
              flex:1,
              background:'rgba(13,18,28,0.7)',
              border:'1px solid rgba(163,201,255,0.08)',
              borderTop:`2px solid ${s.color}33`,
              padding:'14px 16px',
            }}>
              <div style={{ fontSize:8, color:'rgba(163,201,255,0.4)', letterSpacing:'0.22em', marginBottom:8, fontFamily:MONO }}>
                {s.label}
              </div>
              <div style={{ fontSize:24, fontWeight:800, color:s.color, fontFamily:SANS, letterSpacing:'-0.03em', lineHeight:1 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Add form ── */}
        {form && (
          <div style={{
            ...surface,
            padding:'20px 22px', marginBottom:24,
            animation:'lp-slide .2s ease',
          }}>
            <div style={{ fontSize:9, color:'rgba(0,212,255,0.6)', letterSpacing:'0.25em', marginBottom:16, fontFamily:MONO }}>
              NEW BLOCK
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'flex-end', flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:160 }}>
                <div style={{ fontSize:8, color:'rgba(163,201,255,0.45)', letterSpacing:'0.2em', marginBottom:6, fontFamily:MONO }}>
                  ACTIVITY
                </div>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name:e.target.value }))}
                  placeholder="e.g. Sleep"
                  onKeyDown={e => e.key==='Enter' && addBlock()}
                  autoFocus
                  style={{
                    background:'rgba(8,12,16,0.8)',
                    border:'1px solid rgba(163,201,255,0.15)',
                    borderLeft:`3px solid ${form.color}`,
                    color:'#dce8f4', fontSize:13, fontWeight:500,
                    padding:'9px 12px', fontFamily:SANS,
                    width:'100%', outline:'none', boxSizing:'border-box',
                  }}
                />
              </div>
              <div style={{ width:90 }}>
                <div style={{ fontSize:8, color:'rgba(163,201,255,0.45)', letterSpacing:'0.2em', marginBottom:6, fontFamily:MONO }}>
                  HOURS
                </div>
                <input
                  type="number" min="0.5" max="24" step="0.5"
                  value={form.hours}
                  onChange={e => setForm(f => ({ ...f, hours:e.target.value }))}
                  onKeyDown={e => e.key==='Enter' && addBlock()}
                  placeholder="8"
                  style={{
                    background:'rgba(8,12,16,0.8)',
                    border:'1px solid rgba(163,201,255,0.15)',
                    color:'#dce8f4', fontSize:13, fontWeight:500,
                    padding:'9px 12px', fontFamily:SANS,
                    width:'100%', outline:'none', boxSizing:'border-box',
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize:8, color:'rgba(163,201,255,0.45)', letterSpacing:'0.2em', marginBottom:6, fontFamily:MONO }}>
                  COLOR
                </div>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap', maxWidth:158 }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setForm(f => ({ ...f, color:c }))}
                      style={{
                        width:18, height:18, background:c, cursor:'pointer',
                        outline: form.color===c ? `2px solid rgba(255,255,255,0.7)` : '2px solid transparent',
                        outlineOffset:2, transition:'outline-color .12s',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={addBlock}
                  disabled={!form.name?.trim() || !form.hours || over}
                  style={{
                    background: over ? 'rgba(255,107,107,0.12)' : 'rgba(0,212,255,0.12)',
                    border: over ? '1px solid rgba(255,107,107,0.3)' : '1px solid rgba(0,212,255,0.3)',
                    color: over ? '#ff6b6b' : '#00d4ff',
                    fontSize:11, fontWeight:700,
                    padding:'9px 22px', cursor:'pointer', fontFamily:MONO,
                    letterSpacing:'0.14em', transition:'all .15s',
                    opacity: (!form.name?.trim() || !form.hours) ? 0.3 : 1,
                  }}
                >
                  {over ? `+${(total+formHrs-24).toFixed(1)}h OVER` : 'ADD'}
                </button>
                <button onClick={() => setForm(null)}
                  style={{
                    background:'transparent',
                    border:'1px solid rgba(163,201,255,0.15)',
                    color:'rgba(163,201,255,0.5)', padding:'9px 12px',
                    cursor:'pointer', display:'flex', alignItems:'center',
                    transition:'color .15s, border-color .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color='#a3c9ff'; e.currentTarget.style.borderColor='rgba(163,201,255,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.color='rgba(163,201,255,0.5)'; e.currentTarget.style.borderColor='rgba(163,201,255,0.15)' }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Main grid ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 234px', gap:16, alignItems:'start' }}>

          {/* Blocks list */}
          <div>
            <div style={{ fontSize:8, color:'rgba(163,201,255,0.4)', letterSpacing:'0.25em', marginBottom:10, fontFamily:MONO }}>
              TIME BLOCKS
            </div>

            {blocks.length === 0 ? (
              <div
                onClick={() => openForm()}
                style={{
                  border:'1px dashed rgba(163,201,255,0.1)',
                  padding:'48px 24px', textAlign:'center', cursor:'pointer',
                  transition:'border-color .18s, background .18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(163,201,255,0.28)'; e.currentTarget.style.background='rgba(163,201,255,0.02)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(163,201,255,0.1)'; e.currentTarget.style.background='transparent' }}
              >
                <div style={{ fontSize:28, marginBottom:12, opacity:.25 }}>◫</div>
                <div style={{ fontSize:12, color:'rgba(163,201,255,0.35)', letterSpacing:'0.05em', fontFamily:SANS, marginBottom:4 }}>
                  Your day is a blank canvas.
                </div>
                <div style={{ fontSize:11, color:'rgba(163,201,255,0.2)', fontFamily:SANS }}>
                  Click here or pick a preset to start building.
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:1.5 }}>
                {blocks.map(b => (
                  <div key={b.id}
                    onMouseEnter={() => setHovered(b.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      background: hovered===b.id ? 'rgba(163,201,255,0.03)' : 'rgba(13,18,28,0.7)',
                      border:'1px solid rgba(163,201,255,0.07)',
                      borderLeft:`2.5px solid ${b.color}`,
                      padding:'12px 14px',
                      display:'flex', alignItems:'center', gap:12,
                      transition:'background .15s',
                    }}
                  >
                    <div style={{ width:8, height:8, background:b.color, flexShrink:0 }} />
                    <span style={{ fontSize:13, color:'#dce8f4', flex:1, fontWeight:500, fontFamily:SANS }}>{b.name}</span>
                    <span style={{ fontSize:14, color:b.color, fontWeight:800, fontFamily:SANS, letterSpacing:'-0.02em' }}>{b.hours}h</span>
                    <span style={{ fontSize:9, color:'rgba(163,201,255,0.4)', minWidth:26, textAlign:'right', fontFamily:MONO }}>
                      {Math.round((b.hours/24)*100)}%
                    </span>
                    <div style={{ width:56, height:2, background:'rgba(163,201,255,0.08)', flexShrink:0 }}>
                      <div style={{ width:`${(b.hours/24)*100}%`, height:'100%', background:b.color }} />
                    </div>
                    <button onClick={() => removeBlock(b.id)}
                      style={{ background:'transparent', border:'none', color:'rgba(255,107,107,0.25)', cursor:'pointer', padding:4, display:'flex', alignItems:'center', transition:'color .15s' }}
                      onMouseEnter={e => e.currentTarget.style.color='#ff6b6b'}
                      onMouseLeave={e => e.currentTarget.style.color='rgba(255,107,107,0.25)'}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Presets */}
          <div>
            <div style={{ fontSize:8, color:'rgba(163,201,255,0.4)', letterSpacing:'0.25em', marginBottom:10, fontFamily:MONO }}>
              QUICK PRESETS
            </div>
            <div style={{ ...surface }}>
              {PRESETS.map(p => {
                const used = blocks.some(b => b.name===p.name)
                return (
                  <button key={p.name} onClick={() => !used && openForm(p)} disabled={used}
                    style={{
                      background:'transparent', border:'none',
                      borderBottom:'1px solid rgba(163,201,255,0.05)',
                      padding:'9px 13px', display:'flex', alignItems:'center', gap:10,
                      cursor: used?'default':'pointer', textAlign:'left', width:'100%',
                      opacity: used ? 0.3 : 1, transition:'background .12s',
                    }}
                    onMouseEnter={e => { if(!used) e.currentTarget.style.background='rgba(163,201,255,0.04)' }}
                    onMouseLeave={e => { e.currentTarget.style.background='transparent' }}
                  >
                    <div style={{ width:6, height:6, background:p.color, flexShrink:0 }} />
                    <span style={{ fontSize:11, color:'#c4d8ee', fontFamily:SANS, fontWeight:500 }}>{p.name}</span>
                    {used && <span style={{ fontSize:9, color:p.color, marginLeft:'auto', fontFamily:MONO }}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
