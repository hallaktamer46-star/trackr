import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, Plus, X, Check, Square } from 'lucide-react'

const NUM  = 'Geist Mono, monospace'
const BODY = "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"

const BASE_STATUSES = [
  { key: 'working',  label: 'Working',  color: '#4edea3' },
  { key: 'break',    label: 'Break',    color: '#ffb689' },
  { key: 'meeting',  label: 'Meeting',  color: '#f472b6' },
  { key: 'research', label: 'Research', color: '#a3c9ff' },
  { key: 'clerical', label: 'Clerical', color: '#fbbf24' },
  { key: 'coaching', label: 'Coaching', color: '#a78bfa' },
]

function suggestBreak(h) {
  if (h < 6) return 30; if (h < 7) return 45; if (h < 8) return 60
  if (h < 9) return 90; if (h < 10) return 105; return 120
}

function fmt(s) {
  if (!s || s <= 0) return '0s'
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  if (h > 0) return `${h}h ${String(m).padStart(2,'0')}m`
  if (m > 0) return `${m}m ${String(sec).padStart(2,'0')}s`
  return `${sec}s`
}
function fmtMins(m) {
  if (!m) return '—'
  return m >= 60 ? `${Math.floor(m/60)}h${m%60>0?` ${m%60}m`:''}` : `${m}m`
}

const KEY = 'trackr_engage'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } }
const save = v => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }

export default function EngageWidget() {
  const today = new Date().toDateString()
  const [phase, setPhase]           = useState('idle')
  const [tab, setTab]               = useState(null)
  const [expanded, setExpanded]     = useState(false)
  const [status, setStatus]         = useState('working')
  const [log, setLog]               = useState([])
  const [shift, setShift]           = useState({ startTime:'', endTime:'', breakMins:90, shiftStartTs:null })
  const [custom, setCustom]         = useState([])
  const [showAdd, setShowAdd]       = useState(false)
  const [newLabel, setNewLabel]     = useState('')
  const [, setTick]                 = useState(0)
  const [form, setForm]             = useState({ startTime:'', endTime:'', breakMins:90 })
  const timer = useRef(null)

  useEffect(() => {
    const s = load()
    if (s?.date === today) {
      setPhase(s.phase||'idle'); setStatus(s.status||'working')
      setLog(s.log||[]); setShift(s.shift||{ startTime:'',endTime:'',breakMins:90,shiftStartTs:null })
      setCustom(s.custom||[])
    }
  }, [])

  useEffect(() => { save({ phase, status, log, shift, custom, date: today }) }, [phase, status, log, shift, custom])

  useEffect(() => {
    if (phase === 'active') timer.current = setInterval(() => setTick(t=>t+1), 1000)
    else clearInterval(timer.current)
    return () => clearInterval(timer.current)
  }, [phase])

  const allStatuses = [...BASE_STATUSES, ...custom.map((l,i) => ({ key:'c'+i, label:l, color:'#8a919f' }))]
  const cur = allStatuses.find(s => s.key === status) || allStatuses[0]

  const totals = () => {
    const now = Date.now(), t = {}
    for (const e of log) { const s = Math.floor(((e.end||now)-e.start)/1000); t[e.status]=(t[e.status]||0)+s }
    return t
  }
  const T = totals()
  const curSecs    = log.length && !log[log.length-1]?.end ? Math.floor((Date.now()-log[log.length-1].start)/1000) : 0
  const shiftSecs  = shift.shiftStartTs ? Math.floor((Date.now()-shift.shiftStartTs)/1000) : 0
  const shiftTotal = (() => {
    if (!shift.startTime||!shift.endTime) return 0
    const [sh,sm]=shift.startTime.split(':').map(Number), [eh,em]=shift.endTime.split(':').map(Number)
    return ((eh*60+em)-(sh*60+sm))*60
  })()
  const breakSecs  = T['break']||0
  const breakLimit = (shift.breakMins||90)*60
  const breakOver  = phase==='active' && breakSecs>breakLimit

  function handleTime(field, value) {
    const u = {...form, [field]:value}
    if (u.startTime && u.endTime) {
      const [sh,sm]=u.startTime.split(':').map(Number),[eh,em]=u.endTime.split(':').map(Number)
      const hrs=((eh*60+em)-(sh*60+sm))/60
      if (hrs>0) u.breakMins=suggestBreak(hrs)
    }
    setForm(u)
  }

  function startShift() {
    const now = Date.now()
    setShift({...form, shiftStartTs:now, date:today})
    setLog([{status:'working',start:now}])
    setStatus('working'); setPhase('active'); setExpanded(false)
  }

  function switchStatus(key) {
    const now = Date.now()
    setLog(l => { const c=[...l]; if(c.length&&!c[c.length-1].end) c[c.length-1]={...c[c.length-1],end:now}; return [...c,{status:key,start:now}] })
    setStatus(key); setExpanded(false)
  }

  function endShift() {
    const now = Date.now()
    setLog(l => { const c=[...l]; if(c.length&&!c[c.length-1].end) c[c.length-1]={...c[c.length-1],end:now}; return c })
    setPhase('ended'); setTab('activity'); setExpanded(false)
  }

  function addCustom() {
    const lbl = newLabel.trim(); if (!lbl) return
    setCustom(c=>[...c,lbl]); setNewLabel(''); setShowAdd(false)
  }

  const openTab = t => { setTab(p => p===t ? null : t); setExpanded(false) }

  // ─────────────────────────────────────────────────────────────
  const inputSty = {
    width:'100%', padding:'8px 10px',
    background:'#0a0e14', border:'0.5px solid rgba(48,54,61,0.9)',
    color:'#e2e2e8', fontSize:13, fontFamily:BODY, outline:'none',
    borderRadius: 4,
  }

  return (
    <div style={{ position:'fixed', bottom:0, right:0, width:300, zIndex:9999, fontFamily:BODY }}>

      {/* ── PANEL ──────────────────────────────────────── */}
      {tab && (
        <div style={{
          background:'rgba(9,13,19,0.97)',
          borderTop:'0.5px solid rgba(48,54,61,0.8)',
          borderLeft:'0.5px solid rgba(48,54,61,0.8)',
          backdropFilter:'blur(20px)',
          boxShadow:'-4px -4px 32px rgba(0,0,0,0.55)',
          animation:'slideUp 0.18s ease',
        }}>

          {/* ══ ENGAGE ══ */}
          {tab === 'engage' && (
            <>
              {/* idle / ended */}
              {(phase==='idle'||phase==='ended') && (
                <div style={{padding:'20px 20px 18px'}}>
                  {phase==='ended' ? (
                    <>
                      <p style={{fontSize:11,fontWeight:600,color:'#4edea3',letterSpacing:'0.5px',marginBottom:8,textTransform:'uppercase'}}>Shift Complete</p>
                      <p style={{fontSize:12,color:'#5a6478',marginBottom:16,lineHeight:1.55}}>Check Activity for your full breakdown.</p>
                      <button onClick={()=>{setPhase('idle');setLog([]);setShift({startTime:'',endTime:'',breakMins:90,shiftStartTs:null});setCustom([])}}
                        style={{width:'100%',padding:'10px 0',background:'rgba(78,222,163,0.08)',border:'0.5px solid rgba(78,222,163,0.3)',color:'#4edea3',fontSize:11,fontFamily:BODY,fontWeight:600,cursor:'pointer',borderRadius:4}}>
                        Reset for tomorrow
                      </button>
                    </>
                  ) : (
                    <>
                      <p style={{fontSize:11,fontWeight:600,color:'#5a6478',letterSpacing:'0.5px',marginBottom:14,textTransform:'uppercase'}}>Set up your shift</p>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                        <div>
                          <label style={{fontSize:10,color:'#3a4354',display:'block',marginBottom:4}}>Start time</label>
                          <input type="time" value={form.startTime} onChange={e=>handleTime('startTime',e.target.value)} style={inputSty} />
                        </div>
                        <div>
                          <label style={{fontSize:10,color:'#3a4354',display:'block',marginBottom:4}}>End time</label>
                          <input type="time" value={form.endTime} onChange={e=>handleTime('endTime',e.target.value)} style={inputSty} />
                        </div>
                      </div>
                      <div style={{marginBottom:16}}>
                        <label style={{fontSize:10,color:'#3a4354',display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                          Break (mins) {form.startTime&&form.endTime&&<span style={{color:'#4edea3',fontSize:9}}>· suggested</span>}
                        </label>
                        <input type="number" value={form.breakMins} min={0} max={480}
                          onChange={e=>setForm(f=>({...f,breakMins:parseInt(e.target.value)||0}))} style={inputSty} />
                      </div>
                      <button onClick={startShift} disabled={!form.startTime||!form.endTime}
                        style={{
                          width:'100%', padding:'11px 0', border:'none', borderRadius:4, cursor: form.startTime&&form.endTime?'pointer':'default',
                          background:form.startTime&&form.endTime?'#4edea3':'#161b22',
                          color:form.startTime&&form.endTime?'#0d1117':'#3a4354',
                          fontSize:12, fontFamily:BODY, fontWeight:700, letterSpacing:'0.3px', transition:'all 0.15s',
                        }}>
                        Start Shift
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* active */}
              {phase==='active' && (
                <>
                  {/* current status bar */}
                  <div onClick={()=>setExpanded(e=>!e)} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'14px 18px',
                    background:`${cur.color}09`,
                    borderBottom: expanded?'0.5px solid rgba(48,54,61,0.6)':'none',
                    cursor:'pointer',
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:9,height:9,borderRadius:'50%',background:cur.color,boxShadow:`0 0 8px ${cur.color}90`}} />
                      <span style={{fontSize:14,fontWeight:600,color:cur.color,letterSpacing:'-0.2px'}}>{cur.label}</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontFamily:NUM,fontSize:13,color:'#8a919f',letterSpacing:'-0.3px'}}>{fmt(curSecs)}</span>
                      {expanded ? <ChevronUp size={13} style={{color:'#3a4354'}}/> : <ChevronDown size={13} style={{color:'#3a4354'}}/>}
                    </div>
                  </div>

                  {/* expanded list */}
                  {expanded && (
                    <div>
                      {allStatuses.filter(s=>s.key!==status).map((s,i,arr)=>(
                        <div key={s.key} onClick={()=>switchStatus(s.key)}
                          style={{
                            display:'flex', alignItems:'center', justifyContent:'space-between',
                            padding:'12px 18px',
                            borderBottom: i<arr.length-1?'0.5px solid rgba(48,54,61,0.35)':'none',
                            cursor:'pointer', transition:'background 0.1s',
                          }}
                          onMouseEnter={e=>e.currentTarget.style.background=`${s.color}0d`}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <div style={{width:7,height:7,borderRadius:'50%',background:s.color,opacity:0.8}}/>
                            <span style={{fontSize:13,fontWeight:500,color:'#bcc4d0'}}>{s.label}</span>
                          </div>
                          <span style={{fontFamily:NUM,fontSize:10,color:'#3a4354'}}>{fmt(T[s.key]||0)}</span>
                        </div>
                      ))}
                      {/* add */}
                      {showAdd ? (
                        <div style={{display:'flex',alignItems:'center',gap:6,padding:'10px 18px',borderTop:'0.5px solid rgba(48,54,61,0.4)'}}>
                          <input autoFocus value={newLabel} onChange={e=>setNewLabel(e.target.value)}
                            onKeyDown={e=>{if(e.key==='Enter')addCustom();if(e.key==='Escape'){setShowAdd(false);setNewLabel('')}}}
                            placeholder="Status name…"
                            style={{...inputSty,flex:1,width:'auto',fontSize:12,padding:'6px 10px'}}/>
                          <button onClick={addCustom} style={{padding:'6px 8px',background:'#4edea3',border:'none',color:'#0d1117',cursor:'pointer',borderRadius:3,display:'flex',alignItems:'center'}}><Check size={12}/></button>
                          <button onClick={()=>{setShowAdd(false);setNewLabel('')}} style={{padding:'6px 8px',background:'#161b22',border:'0.5px solid rgba(48,54,61,0.9)',color:'#8a919f',cursor:'pointer',borderRadius:3,display:'flex',alignItems:'center'}}><X size={12}/></button>
                        </div>
                      ) : (
                        <div style={{display:'flex',justifyContent:'flex-end',padding:'8px 18px',borderTop:'0.5px solid rgba(48,54,61,0.35)'}}>
                          <button onClick={()=>setShowAdd(true)}
                            style={{display:'flex',alignItems:'center',gap:5,padding:'4px 10px',background:'transparent',border:'0.5px solid rgba(48,54,61,0.6)',color:'#3a4354',fontSize:10,fontFamily:BODY,cursor:'pointer',borderRadius:3,transition:'all 0.15s'}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(163,201,255,0.35)';e.currentTarget.style.color='#a3c9ff'}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(48,54,61,0.6)';e.currentTarget.style.color='#3a4354'}}>
                            <Plus size={10}/> Add status
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* break warning */}
                  {breakOver && !expanded && (
                    <div style={{padding:'7px 18px',background:'rgba(255,180,171,0.06)',borderTop:'0.5px solid rgba(255,180,171,0.18)'}}>
                      <span style={{fontSize:10,color:'#ffb4ab',fontWeight:500}}>⚠ Break limit exceeded · {fmt(breakSecs-breakLimit)} over</span>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ══ ACTIVITY ══ */}
          {tab === 'activity' && (
            <div style={{padding:'20px 20px 18px'}}>
              <p style={{fontSize:11,fontWeight:600,color:'#3a4354',letterSpacing:'0.5px',textTransform:'uppercase',marginBottom:16}}>Today's Activity</p>

              {phase==='idle' ? (
                <p style={{fontSize:12,color:'#3a4354'}}>Start a shift to begin tracking.</p>
              ) : (
                <>
                  {/* shift */}
                  <div style={{marginBottom:14}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <span style={{fontSize:11,fontWeight:500,color:'#6b7583'}}>Shift</span>
                      <span style={{fontFamily:NUM,fontSize:10,color:'#6b7583'}}>{fmt(shiftSecs)} / {shiftTotal>0?fmt(shiftTotal):'—'}</span>
                    </div>
                    <div style={{height:5,background:'#161b22',borderRadius:99}}>
                      <div style={{height:'100%',borderRadius:99,background:'linear-gradient(90deg,#4edea3,#a3c9ff)',width:shiftTotal>0?`${Math.min(100,(shiftSecs/shiftTotal)*100)}%`:'0%',transition:'width 1s linear'}}/>
                    </div>
                  </div>

                  {/* break */}
                  <div style={{marginBottom:18}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <span style={{fontSize:11,fontWeight:500,color:breakOver?'#ffb4ab':'#6b7583'}}>Break {breakOver&&'· ⚠ over'}</span>
                      <span style={{fontFamily:NUM,fontSize:10,color:breakOver?'#ffb4ab':'#6b7583'}}>{fmt(breakSecs)} / {fmtMins(shift.breakMins)}</span>
                    </div>
                    <div style={{height:5,background:'#161b22',borderRadius:99}}>
                      <div style={{height:'100%',borderRadius:99,background:breakOver?'#ffb4ab':'#ffb689',width:`${Math.min(100,(breakSecs/breakLimit)*100)}%`,transition:'width 1s linear'}}/>
                    </div>
                  </div>

                  {/* per status */}
                  <div style={{display:'flex',flexDirection:'column',gap:11}}>
                    {allStatuses.map(s=>{
                      const secs=T[s.key]||0
                      if(secs===0&&s.key!==status) return null
                      const pct=shiftSecs>0?Math.min(100,(secs/shiftSecs)*100):0
                      return (
                        <div key={s.key}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                            <div style={{display:'flex',alignItems:'center',gap:7}}>
                              <div style={{width:6,height:6,borderRadius:'50%',background:s.color}}/>
                              <span style={{fontSize:12,fontWeight:500,color:'#6b7583'}}>{s.label}</span>
                              {s.key===status&&phase==='active'&&<div style={{width:4,height:4,borderRadius:'50%',background:s.color,opacity:0.6}}/>}
                            </div>
                            <span style={{fontFamily:NUM,fontSize:10,color:'#3a4354'}}>{fmt(secs)}</span>
                          </div>
                          <div style={{height:3,background:'#0a0e14',borderRadius:99}}>
                            <div style={{height:'100%',borderRadius:99,background:s.color,width:`${pct}%`,opacity:0.65,transition:'width 1s linear'}}/>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB BAR ────────────────────────────────────── */}
      <div style={{
        display:'flex',
        background:'rgba(9,13,19,0.97)',
        borderTop:'0.5px solid rgba(48,54,61,0.7)',
        borderLeft:'0.5px solid rgba(48,54,61,0.7)',
        backdropFilter:'blur(20px)',
      }}>

        {/* END SHIFT (active only) */}
        {phase==='active' && (
          <button onClick={endShift} style={{
            padding:'11px 14px', border:'none', borderRight:'0.5px solid rgba(48,54,61,0.7)',
            background:'transparent', color:'#ffb4ab', fontFamily:BODY,
            fontSize:11, fontWeight:600, cursor:'pointer', transition:'background 0.15s',
            display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap',
          }}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,180,171,0.07)'}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <Square size={10} fill="#ffb4ab"/> End
          </button>
        )}

        {/* ENGAGE */}
        <button onClick={()=>openTab('engage')} style={{
          flex:1, padding:'11px 0', border:'none',
          borderRight:'0.5px solid rgba(48,54,61,0.7)',
          background: tab==='engage' ? `${cur.color}10` : 'transparent',
          color: tab==='engage' ? cur.color : '#3a4354',
          fontFamily:BODY, fontSize:11, fontWeight:600,
          cursor:'pointer', transition:'all 0.15s', letterSpacing:'0.2px',
        }}>
          Engage
        </button>

        {/* ACTIVITY */}
        <button onClick={()=>openTab('activity')} style={{
          flex:1, padding:'11px 0', border:'none',
          background: tab==='activity' ? 'rgba(163,201,255,0.08)' : 'transparent',
          color: tab==='activity' ? '#a3c9ff' : '#3a4354',
          fontFamily:BODY, fontSize:11, fontWeight:600,
          cursor:'pointer', transition:'all 0.15s', letterSpacing:'0.2px',
        }}>
          Activity
        </button>
      </div>

      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
