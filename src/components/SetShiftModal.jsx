import { useState, useEffect } from 'react'

const MONO = '"Geist Mono", "JetBrains Mono", monospace'
const BODY = 'Inter, -apple-system, sans-serif'

const PRESETS_DURATION = [
  { label: '4h',  hours: 4  },
  { label: '6h',  hours: 6  },
  { label: '8h',  hours: 8  },
  { label: '10h', hours: 10 },
]
const PRESETS_TIME = [
  { label: '5:00 PM', value: '17:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
]

export default function SetShiftModal({ open, onClose, onSave, current }) {
  const [type, setType]       = useState(current?.type || 'duration')
  const [hours, setHours]     = useState(current?.hours ?? 8)
  const [endTime, setEndTime] = useState(current?.endTime || '18:00')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      // Reset to current value
      setType(current?.type || 'duration')
      setHours(current?.hours ?? 8)
      setEndTime(current?.endTime || '18:00')
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handle = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [open, onClose])

  function save() {
    const goal = type === 'duration'
      ? { type: 'duration', hours: Math.max(0.5, parseFloat(hours) || 8) }
      : { type: 'deadline', endTime }
    onSave(goal)
    onClose()
  }

  function clear() {
    onSave(null)
    onClose()
  }

  if (!open && !visible) return null

  const displayHours = parseFloat(hours) || 0
  const hoursLabel = displayHours === Math.floor(displayHours)
    ? `${displayHours}h`
    : `${displayHours}h`

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: visible ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(18px)' : 'blur(0px)',
        transition: 'background 0.35s ease, backdrop-filter 0.35s ease',
      }}
    >
      {/* Animated BG mesh */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:`
          radial-gradient(ellipse 60% 50% at 30% 40%, rgba(0,212,255,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 50% 60% at 70% 60%, rgba(0,255,179,0.04) 0%, transparent 70%),
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize:'100% 100%, 100% 100%, 44px 44px, 44px 44px',
      }}/>

      {/* Card */}
      <div style={{
        position: 'relative',
        width: '100%', maxWidth: 520,
        margin: '0 24px',
        background: 'linear-gradient(145deg, rgba(7,12,24,0.98) 0%, rgba(4,8,18,0.99) 100%)',
        border: '1px solid rgba(0,212,255,0.18)',
        boxShadow: '0 0 0 1px rgba(0,212,255,0.06), 0 40px 80px rgba(0,0,0,0.9), 0 0 120px rgba(0,212,255,0.06)',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.96)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease',
      }}>
        {/* Top glow line */}
        <div style={{position:'absolute',top:0,left:'10%',right:'10%',height:'1px',background:'linear-gradient(90deg,transparent,rgba(0,212,255,0.6),transparent)'}}/>

        {/* Corner decorators */}
        <div style={{position:'absolute',top:16,left:16,width:12,height:12,borderTop:'1.5px solid rgba(0,212,255,0.4)',borderLeft:'1.5px solid rgba(0,212,255,0.4)'}}/>
        <div style={{position:'absolute',top:16,right:16,width:12,height:12,borderTop:'1.5px solid rgba(0,212,255,0.4)',borderRight:'1.5px solid rgba(0,212,255,0.4)'}}/>
        <div style={{position:'absolute',bottom:16,left:16,width:12,height:12,borderBottom:'1.5px solid rgba(0,212,255,0.4)',borderLeft:'1.5px solid rgba(0,212,255,0.4)'}}/>
        <div style={{position:'absolute',bottom:16,right:16,width:12,height:12,borderBottom:'1.5px solid rgba(0,212,255,0.4)',borderRight:'1.5px solid rgba(0,212,255,0.4)'}}/>

        <div style={{padding:'40px 40px 36px'}}>
          {/* Header */}
          <div style={{marginBottom:36}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <div style={{width:2,height:20,background:'linear-gradient(180deg,#00d4ff,#00ffb3)',borderRadius:2}}/>
              <span style={{fontFamily:MONO,fontSize:8,fontWeight:700,color:'rgba(0,212,255,0.45)',letterSpacing:'0.26em',textTransform:'uppercase'}}>Engage — Shift Config</span>
            </div>
            <h2 style={{fontFamily:MONO,fontSize:26,fontWeight:900,color:'#e8f4fd',letterSpacing:'-0.03em',margin:0,lineHeight:1}}>
              Set Your Shift
            </h2>
            <p style={{fontFamily:BODY,fontSize:12,color:'rgba(255,255,255,0.25)',marginTop:8,lineHeight:1.5}}>
              Define how long you're working — get notified when time's up.
            </p>
          </div>

          {/* Mode toggle */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:3,marginBottom:28}}>
            {[['duration','Duration','How many hours'], ['deadline','End Time','Specific clock time']].map(([k, title, sub]) => (
              <button key={k} onClick={() => setType(k)} style={{
                padding:'16px 18px', border:'none', cursor:'pointer', textAlign:'left',
                background: type === k
                  ? 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,255,179,0.04))'
                  : 'rgba(255,255,255,0.02)',
                borderWidth:1, borderStyle:'solid',
                borderColor: type === k ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.07)',
                borderTop: type === k ? '2px solid #00d4ff' : '2px solid transparent',
                transition:'all 0.2s ease',
                boxShadow: type === k ? '0 0 24px rgba(0,212,255,0.08), inset 0 1px 0 rgba(0,212,255,0.1)' : 'none',
              }}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <div style={{
                    width:8, height:8, borderRadius:'50%',
                    background: type === k ? '#00d4ff' : 'rgba(255,255,255,0.15)',
                    boxShadow: type === k ? '0 0 10px #00d4ff' : 'none',
                    transition:'all 0.2s',
                  }}/>
                  <span style={{fontFamily:MONO,fontSize:11,fontWeight:700,color: type===k ? '#00d4ff' : 'rgba(255,255,255,0.4)',letterSpacing:'0.04em',transition:'color 0.2s'}}>
                    {title}
                  </span>
                </div>
                <span style={{fontFamily:BODY,fontSize:10,color: type===k ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.18)',paddingLeft:16}}>
                  {sub}
                </span>
              </button>
            ))}
          </div>

          {/* Input area */}
          {type === 'duration' ? (
            <div>
              {/* Big display */}
              <div style={{
                textAlign:'center', padding:'28px 0 24px',
                background:'rgba(0,212,255,0.03)', border:'1px solid rgba(0,212,255,0.1)',
                marginBottom:16, position:'relative', overflow:'hidden',
              }}>
                <div style={{position:'absolute',top:0,left:'20%',right:'20%',height:'1px',background:'linear-gradient(90deg,transparent,rgba(0,212,255,0.3),transparent)'}}/>
                <span style={{
                  fontFamily:MONO, fontSize:72, fontWeight:900, lineHeight:1,
                  letterSpacing:'-0.04em',
                  background:'linear-gradient(135deg, #ffffff 0%, #00d4ff 50%, #00ffb3 100%)',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                  filter:'drop-shadow(0 0 30px rgba(0,212,255,0.4))',
                }}>
                  {hoursLabel}
                </span>
                <p style={{fontFamily:MONO,fontSize:9,color:'rgba(0,212,255,0.35)',letterSpacing:'0.18em',textTransform:'uppercase',marginTop:6}}>hours</p>
              </div>

              {/* Preset chips */}
              <div style={{display:'flex',gap:3,marginBottom:16}}>
                {PRESETS_DURATION.map(p => (
                  <button key={p.hours} onClick={() => setHours(p.hours)} style={{
                    flex:1, padding:'9px 0', border:'none', cursor:'pointer',
                    fontFamily:MONO, fontSize:10, fontWeight:700,
                    background: hours == p.hours ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
                    border:`1px solid ${hours == p.hours ? 'rgba(0,212,255,0.45)' : 'rgba(255,255,255,0.07)'}`,
                    color: hours == p.hours ? '#00d4ff' : 'rgba(255,255,255,0.3)',
                    transition:'all 0.15s',
                    boxShadow: hours == p.hours ? '0 0 12px rgba(0,212,255,0.1)' : 'none',
                  }}
                  onMouseEnter={e=>{ if(hours != p.hours){ e.currentTarget.style.color='rgba(0,212,255,0.6)'; e.currentTarget.style.borderColor='rgba(0,212,255,0.2)' }}}
                  onMouseLeave={e=>{ if(hours != p.hours){ e.currentTarget.style.color='rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)' }}}>
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontFamily:MONO,fontSize:9,color:'rgba(255,255,255,0.2)',letterSpacing:'0.12em',whiteSpace:'nowrap'}}>CUSTOM</span>
                <input
                  type="number" min="0.5" max="24" step="0.5" value={hours}
                  onChange={e => setHours(e.target.value)}
                  style={{
                    flex:1, padding:'10px 14px',
                    background:'rgba(0,212,255,0.05)',
                    border:'1px solid rgba(0,212,255,0.2)',
                    color:'#d0e8ff', fontFamily:MONO, fontSize:14, fontWeight:700,
                    outline:'none', colorScheme:'dark', letterSpacing:'0.04em',
                    transition:'border-color 0.15s',
                  }}
                  onFocus={e=>e.currentTarget.style.borderColor='rgba(0,212,255,0.5)'}
                  onBlur={e=>e.currentTarget.style.borderColor='rgba(0,212,255,0.2)'}
                />
                <span style={{fontFamily:MONO,fontSize:9,color:'rgba(0,212,255,0.4)',letterSpacing:'0.1em'}}>hrs</span>
              </div>
            </div>
          ) : (
            <div>
              {/* Big time display */}
              <div style={{
                textAlign:'center', padding:'28px 0 24px',
                background:'rgba(0,212,255,0.03)', border:'1px solid rgba(0,212,255,0.1)',
                marginBottom:16, position:'relative', overflow:'hidden',
              }}>
                <div style={{position:'absolute',top:0,left:'20%',right:'20%',height:'1px',background:'linear-gradient(90deg,transparent,rgba(0,212,255,0.3),transparent)'}}/>
                <span style={{
                  fontFamily:MONO, fontSize:60, fontWeight:900, lineHeight:1,
                  letterSpacing:'-0.02em',
                  background:'linear-gradient(135deg, #ffffff 0%, #00ffb3 60%, #00d4ff 100%)',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                  filter:'drop-shadow(0 0 30px rgba(0,255,179,0.4))',
                }}>
                  {(() => {
                    const [h, m] = endTime.split(':').map(Number)
                    const ampm = h >= 12 ? 'PM' : 'AM'
                    const h12 = h % 12 || 12
                    return `${h12}:${String(m).padStart(2,'0')} ${ampm}`
                  })()}
                </span>
                <p style={{fontFamily:MONO,fontSize:9,color:'rgba(0,255,179,0.35)',letterSpacing:'0.18em',textTransform:'uppercase',marginTop:6}}>end of shift</p>
              </div>

              {/* Preset times */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:3,marginBottom:16}}>
                {PRESETS_TIME.map(p => (
                  <button key={p.value} onClick={() => setEndTime(p.value)} style={{
                    padding:'10px 0', border:'none', cursor:'pointer',
                    fontFamily:MONO, fontSize:10, fontWeight:700,
                    background: endTime === p.value ? 'rgba(0,255,179,0.1)' : 'rgba(255,255,255,0.03)',
                    border:`1px solid ${endTime === p.value ? 'rgba(0,255,179,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    color: endTime === p.value ? '#00ffb3' : 'rgba(255,255,255,0.3)',
                    transition:'all 0.15s',
                    boxShadow: endTime === p.value ? '0 0 12px rgba(0,255,179,0.1)' : 'none',
                  }}>
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Custom time */}
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontFamily:MONO,fontSize:9,color:'rgba(255,255,255,0.2)',letterSpacing:'0.12em',whiteSpace:'nowrap'}}>CUSTOM</span>
                <input
                  type="time" value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  style={{
                    flex:1, padding:'10px 14px',
                    background:'rgba(0,255,179,0.05)',
                    border:'1px solid rgba(0,255,179,0.2)',
                    color:'#d0e8ff', fontFamily:MONO, fontSize:14, fontWeight:700,
                    outline:'none', colorScheme:'dark', letterSpacing:'0.04em',
                    transition:'border-color 0.15s',
                  }}
                  onFocus={e=>e.currentTarget.style.borderColor='rgba(0,255,179,0.5)'}
                  onBlur={e=>e.currentTarget.style.borderColor='rgba(0,255,179,0.2)'}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{display:'flex',gap:10,marginTop:28}}>
            {/* Save */}
            <button onClick={save} style={{
              flex:1, padding:'14px 0', border:'none', cursor:'pointer',
              fontFamily:MONO, fontSize:10, fontWeight:800, letterSpacing:'0.16em',
              color:'#020408', textTransform:'uppercase',
              background:'linear-gradient(135deg, #00d4ff 0%, #00ffb3 100%)',
              position:'relative', overflow:'hidden',
              transition:'opacity 0.15s, transform 0.15s',
              boxShadow:'0 0 32px rgba(0,212,255,0.3), 0 4px 16px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={e=>{ e.currentTarget.style.opacity='0.85'; e.currentTarget.style.transform='translateY(-1px)' }}
            onMouseLeave={e=>{ e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)' }}>
              Confirm Shift
            </button>

            {/* Clear (if goal is set) */}
            {current && (
              <button onClick={clear} style={{
                padding:'14px 18px', border:'1px solid rgba(255,69,58,0.3)', cursor:'pointer',
                fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:'0.1em',
                color:'rgba(255,69,58,0.7)', background:'rgba(255,69,58,0.05)',
                transition:'all 0.15s',
              }}
              onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,69,58,0.12)'; e.currentTarget.style.color='#ff453a' }}
              onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,69,58,0.05)'; e.currentTarget.style.color='rgba(255,69,58,0.7)' }}>
                Clear
              </button>
            )}

            {/* Cancel */}
            <button onClick={onClose} style={{
              padding:'14px 18px', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer',
              fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:'0.1em',
              color:'rgba(255,255,255,0.25)', background:'rgba(255,255,255,0.02)',
              transition:'all 0.15s',
            }}
            onMouseEnter={e=>{ e.currentTarget.style.color='rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)' }}
            onMouseLeave={e=>{ e.currentTarget.style.color='rgba(255,255,255,0.25)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)' }}>
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
