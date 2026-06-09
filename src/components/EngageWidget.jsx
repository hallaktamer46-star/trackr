import { useState, useEffect, useRef } from 'react'
import { Power, Play, Plus, X, Check, Circle, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'

const NUM  = 'Geist Mono, monospace'
const BODY = 'Geist, Inter, -apple-system, sans-serif'

const STATUSES = [
  { key: 'not_ready', label: 'Not Ready',  color: '#ff6b6b' },
  { key: 'working',   label: 'Working',    color: '#4edea3' },
  { key: 'break',     label: 'Break',      color: '#ffb689' },
  { key: 'meeting',   label: 'Meeting',    color: '#f472b6' },
  { key: 'research',  label: 'Research',   color: '#60a5fa' },
  { key: 'clerical',  label: 'Clerical',   color: '#fbbf24' },
  { key: 'coaching',  label: 'Coaching',   color: '#a78bfa' },
]

function fmt(s) {
  if (!s || s <= 0) return '0s'
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60
  if (h > 0) return `${h}h ${String(m).padStart(2,'0')}m ${String(sec).padStart(2,'0')}s`
  if (m > 0) return `${m}m ${String(sec).padStart(2,'0')}s`
  return `${sec}s`
}

const KEY       = 'trackr_engage_v2'
const TASKS_KEY = 'trackr_tasks'
const load      = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } }
const save      = v  => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }
const loadTasks = () => { try { return JSON.parse(localStorage.getItem(TASKS_KEY)) || [] } catch { return [] } }
const saveTasks = v  => { try { localStorage.setItem(TASKS_KEY, JSON.stringify(v)) } catch {} }

export default function EngageWidget() {
  const today    = new Date().toDateString()
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const [tab, setTab]               = useState(null)
  const [status, setStatus]         = useState(null)
  const [log, setLog]               = useState([])
  const [custom, setCustom]         = useState([])
  const [showAdd, setShowAdd]       = useState(false)
  const [newLabel, setNewLabel]     = useState('')
  const [shiftStart, setShiftStart] = useState(null)
  const [, setTick]                 = useState(0)

  const [tasks, setTasks]             = useState(loadTasks)
  const [showTaskAdd, setShowTaskAdd] = useState(false)
  const [newTask, setNewTask]         = useState('')
  const taskInputRef = useRef(null)

  const timer     = useRef(null)
  const widgetRef = useRef(null)

  useEffect(() => {
    const h = (e) => { if (widgetRef.current && !widgetRef.current.contains(e.target)) setTab(null) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const s = load()
    if (s?.date === today) {
      setStatus(s.status ?? null); setLog(s.log || [])
      setCustom(s.custom || []); setShiftStart(s.shiftStart || null)
    }
  }, [])

  useEffect(() => { save({ status, log, custom, shiftStart, date: today }) }, [status, log, custom, shiftStart])
  useEffect(() => { saveTasks(tasks) }, [tasks])

  useEffect(() => {
    if (status !== null) timer.current = setInterval(() => setTick(t => t+1), 1000)
    else clearInterval(timer.current)
    return () => clearInterval(timer.current)
  }, [status])

  useEffect(() => { if (showTaskAdd) taskInputRef.current?.focus() }, [showTaskAdd])

  const allStatuses = [...STATUSES, ...custom.map((l,i) => ({ key:'c'+i, label:l, color:'#60a5fa' }))]
  const cur = allStatuses.find(s => s.key === status)

  const totals = () => {
    const now = Date.now(), t = {}
    for (const e of log) { const s = Math.floor(((e.end||now)-e.start)/1000); t[e.status]=(t[e.status]||0)+s }
    return t
  }
  const T         = totals()
  const curSecs   = log.length && !log[log.length-1]?.end ? Math.floor((Date.now()-log[log.length-1].start)/1000) : 0
  const shiftSecs = shiftStart ? Math.floor((Date.now()-shiftStart)/1000) : 0

  const todayTasks = tasks.filter(t => t.due === todayStr)
  const pending    = todayTasks.filter(t => !t.done)
  const doneTasks  = todayTasks.filter(t => t.done)

  function pickStatus(key) {
    const now = Date.now()
    if (shiftStart === null) setShiftStart(now)
    setLog(l => {
      const c = [...l]
      if (c.length && !c[c.length-1].end) c[c.length-1] = {...c[c.length-1], end: now}
      return [...c, { status: key, start: now }]
    })
    setStatus(key)
  }

  function endShift() {
    const now = Date.now()
    const finalLog = log.map((e,i) => i===log.length-1 && !e.end ? {...e,end:now} : e)
    const finalTotals = {}
    for (const e of finalLog) { const s=Math.floor((e.end-e.start)/1000); finalTotals[e.status]=(finalTotals[e.status]||0)+s }
    const totalSecs = shiftStart ? Math.floor((now-shiftStart)/1000) : 0
    try {
      const hist = JSON.parse(localStorage.getItem('trackr_history')||'[]')
      const idx  = hist.findIndex(h=>h.date===today)
      const record = { date:today, total:totalSecs, statuses:finalTotals, shiftStart, shiftEnd:now }
      if (idx>=0) hist[idx]=record; else hist.push(record)
      hist.sort((a,b)=>new Date(b.date)-new Date(a.date))
      localStorage.setItem('trackr_history', JSON.stringify(hist.slice(0,60)))
    } catch {}
    setLog(finalLog); setStatus(null); setShiftStart(null); setLog([]); setTab('activity')
  }

  function addCustom() {
    const lbl = newLabel.trim(); if (!lbl) return
    setCustom(c=>[...c,lbl]); setNewLabel(''); setShowAdd(false)
  }

  function addTask() {
    const title = newTask.trim(); if (!title) return
    setTasks(prev => [...prev, { id: Date.now(), title, done: false, due: todayStr }])
    setNewTask(''); setShowTaskAdd(false)
  }

  function toggleTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function removeTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const openTab = t => setTab(p => p === t ? null : t)

  const BG      = '#07090f'
  const BORDER  = 'rgba(60,100,200,0.18)'
  const DIVIDER = 'rgba(40,80,180,0.12)'

  return (
    <div ref={widgetRef} style={{ position:'fixed', bottom:0, right:0, width: tab ? 620 : 340, zIndex:9999, fontFamily:BODY, display:'flex', flexDirection:'column', transition:'width 0.2s cubic-bezier(0.22,1,0.36,1)' }}>

      {/* ── TAB BAR ── */}
      <div style={{
        display:'flex',
        background: BG,
        borderTop: `1px solid ${BORDER}`,
        borderLeft: `1px solid ${BORDER}`,
        backdropFilter: 'blur(24px)',
        boxShadow: status && cur ? `0 -3px 24px ${cur.color}25` : '0 -2px 16px rgba(0,0,0,0.5)',
        transition: 'box-shadow 0.4s',
      }}>
        <button onClick={() => openTab('engage')} style={{
          flex:1, padding:'12px 0', border:'none',
          background: tab==='engage' ? `${cur?.color || '#4edea3'}10` : 'transparent',
          borderBottom: tab==='engage' ? `2px solid ${cur?.color || '#4edea3'}` : '2px solid transparent',
          cursor:'pointer', transition:'all 0.15s',
        }}>
          {cur && tab !== 'engage' ? (
            <span style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
              <span style={{fontSize:12,fontWeight:600,color:cur.color}}>Engage</span>
              <span style={{fontSize:9,color:cur.color,fontFamily:NUM,opacity:0.8}}>{cur.label} · {fmt(curSecs)}</span>
            </span>
          ) : (
            <span style={{fontSize:12,fontWeight:600,color: tab==='engage' ? (cur?.color||'#4edea3') : '#4a70b0'}}>Engage</span>
          )}
        </button>
        <button onClick={() => openTab('activity')} style={{
          flex:1, padding:'12px 0', border:'none',
          background: tab==='activity' ? 'rgba(96,165,250,0.08)' : 'transparent',
          borderBottom: tab==='activity' ? '2px solid #60a5fa' : '2px solid transparent',
          cursor:'pointer', transition:'all 0.15s',
        }}>
          <span style={{fontSize:12,fontWeight:600,color: tab==='activity' ? '#60a5fa' : '#4a70b0'}}>Activity</span>
        </button>
      </div>

      {/* ── PANEL ── */}
      {tab && (
        <div style={{
          background: BG,
          borderBottom: `1px solid ${BORDER}`,
          borderLeft: `1px solid ${BORDER}`,
          backdropFilter: 'blur(24px)',
          boxShadow: '-4px 0px 40px rgba(0,0,0,0.7)',
          animation: 'slideUp 0.18s cubic-bezier(0.22,1,0.36,1)',
        }}>

          {/* ══ ENGAGE PANEL — two columns ══ */}
          {tab === 'engage' && (
            <div style={{ display:'flex', alignItems:'stretch' }}>

              {/* ── LEFT: Status switcher ── */}
              <div style={{ flex:'0 0 300px', borderRight:`1px solid ${DIVIDER}` }}>

                {/* Clock In / Out */}
                <div style={{display:'flex',borderBottom:`1px solid ${DIVIDER}`}}>
                  <button onClick={endShift} disabled={status===null}
                    style={{
                      flex:1, padding:'12px 0', border:'none',
                      borderRight:`1px solid ${DIVIDER}`,
                      background: status!==null ? 'rgba(255,107,107,0.07)' : 'transparent',
                      color: status!==null ? '#ff6b6b' : '#1e3a70',
                      cursor: status!==null ? 'pointer' : 'default',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                      fontSize:11, fontFamily:BODY, fontWeight:700, letterSpacing:'0.02em',
                      transition:'background 0.15s',
                    }}
                    onMouseEnter={e=>{ if(status!==null) e.currentTarget.style.background='rgba(255,107,107,0.15)' }}
                    onMouseLeave={e=>{ if(status!==null) e.currentTarget.style.background='rgba(255,107,107,0.07)' }}>
                    <Power size={12}/> Clock out
                  </button>
                  <button onClick={() => { if(status===null) pickStatus('not_ready') }} disabled={status!==null}
                    style={{
                      flex:1, padding:'12px 0', border:'none',
                      background: status===null ? 'rgba(78,222,163,0.08)' : 'transparent',
                      color: status===null ? '#4edea3' : '#1e3a70',
                      cursor: status===null ? 'pointer' : 'default',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                      fontSize:11, fontFamily:BODY, fontWeight:700, letterSpacing:'0.02em',
                      transition:'background 0.15s',
                    }}
                    onMouseEnter={e=>{ if(status===null) e.currentTarget.style.background='rgba(78,222,163,0.15)' }}
                    onMouseLeave={e=>{ if(status===null) e.currentTarget.style.background='rgba(78,222,163,0.08)' }}>
                    <Play size={12} fill={status===null?'#4edea3':'#1e3a70'}/> Clock in
                  </button>
                </div>

                {/* Active status */}
                {cur && (
                  <div style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'10px 14px',
                    background:`linear-gradient(135deg, ${cur.color}12, ${cur.color}06)`,
                    borderBottom:`1px solid ${cur.color}20`,
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:7,height:7,borderRadius:'50%',background:cur.color,boxShadow:`0 0 8px ${cur.color}`,animation:'status-pulse 2s ease-in-out infinite'}}/>
                      <span style={{fontSize:13,fontWeight:800,color:cur.color,letterSpacing:'-0.01em'}}>{cur.label}</span>
                    </div>
                    <span style={{fontFamily:NUM,fontSize:12,fontWeight:700,color:cur.color}}>{fmt(curSecs)}</span>
                  </div>
                )}

                {/* Switch to */}
                {cur && (
                  <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 14px 3px'}}>
                    <div style={{flex:1,height:'1px',background:`linear-gradient(90deg, ${cur.color}30, transparent)`}}/>
                    <span style={{fontFamily:NUM,fontSize:7,fontWeight:800,color:'#3a70d0',letterSpacing:'0.12em',textTransform:'uppercase',whiteSpace:'nowrap'}}>switch to</span>
                    <div style={{flex:1,height:'1px',background:`linear-gradient(270deg, ${cur.color}30, transparent)`}}/>
                  </div>
                )}

                {/* Status list */}
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {allStatuses.filter(s => s.key !== status).map((s, i, arr) => (
                    <div key={s.key} onClick={() => status !== null ? pickStatus(s.key) : null}
                      style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'9px 14px',
                        borderBottom: i < arr.length-1 ? `1px solid ${DIVIDER}` : 'none',
                        cursor: status!==null ? 'pointer' : 'default',
                        opacity: status===null ? 0.3 : 1,
                        transition:'background 0.12s',
                      }}
                      onMouseEnter={e=>{ if(status!==null) e.currentTarget.style.background=`${s.color}10` }}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:7,height:7,borderRadius:'50%',background:s.color,boxShadow:`0 0 5px ${s.color}80`}}/>
                        <span style={{fontSize:12,fontWeight:600,color:'#d0e4ff'}}>{s.label}</span>
                      </div>
                      <span style={{fontFamily:NUM,fontSize:10,fontWeight:600,color: T[s.key] ? s.color+'cc' : '#2a4898'}}>
                        {fmt(T[s.key]||0)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add custom status */}
                {showAdd ? (
                  <div style={{display:'flex',alignItems:'center',gap:5,padding:'8px 14px',borderTop:`1px solid ${DIVIDER}`}}>
                    <input autoFocus value={newLabel} onChange={e=>setNewLabel(e.target.value)}
                      onKeyDown={e=>{if(e.key==='Enter')addCustom();if(e.key==='Escape'){setShowAdd(false);setNewLabel('')}}}
                      placeholder="Status name…"
                      style={{flex:1,padding:'6px 8px',background:'rgba(40,80,200,0.1)',border:`1px solid rgba(60,120,255,0.25)`,color:'#d0e4ff',fontSize:11,fontFamily:BODY,outline:'none'}}/>
                    <button onClick={addCustom} style={{padding:'6px 8px',background:'#4edea3',border:'none',color:'#07090f',cursor:'pointer',display:'flex',alignItems:'center'}}><Check size={11}/></button>
                    <button onClick={()=>{setShowAdd(false);setNewLabel('')}} style={{padding:'6px 8px',background:'transparent',border:`1px solid rgba(60,120,255,0.25)`,color:'#60a5fa',cursor:'pointer',display:'flex',alignItems:'center'}}><X size={11}/></button>
                  </div>
                ) : (
                  <div style={{display:'flex',justifyContent:'flex-end',padding:'7px 14px',borderTop:`1px solid ${DIVIDER}`}}>
                    <button onClick={()=>setShowAdd(true)}
                      style={{display:'flex',alignItems:'center',gap:4,padding:'4px 9px',background:'transparent',border:'1px solid rgba(60,100,200,0.2)',color:'#3a6090',fontSize:9,fontFamily:BODY,fontWeight:600,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(96,165,250,0.5)';e.currentTarget.style.color='#60a5fa'}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(60,100,200,0.2)';e.currentTarget.style.color='#3a6090'}}>
                      <Plus size={9}/> Add status
                    </button>
                  </div>
                )}
              </div>

              {/* ── RIGHT: Today's Tasks ── */}
              <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

                {/* Header */}
                <div style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'10px 14px 8px',
                  borderBottom:`1px solid ${DIVIDER}`,
                  flexShrink: 0,
                }}>
                  <div style={{display:'flex',alignItems:'center',gap:7}}>
                    <div style={{width:6,height:6,background:'#60a5fa',boxShadow:'0 0 8px #60a5fa',flexShrink:0}}/>
                    <span style={{fontFamily:NUM,fontSize:9,fontWeight:800,color:'#5090d8',letterSpacing:'0.12em',textTransform:'uppercase'}}>
                      Tasks
                    </span>
                    {pending.length > 0 && (
                      <span style={{fontFamily:NUM,fontSize:8,fontWeight:900,color:'#60a5fa',background:'rgba(96,165,250,0.15)',border:'1px solid rgba(96,165,250,0.3)',padding:'1px 6px',boxShadow:'0 0 6px rgba(96,165,250,0.2)'}}>
                        {pending.length}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowTaskAdd(v => !v)}
                    style={{
                      display:'flex',alignItems:'center',gap:4,padding:'4px 9px',
                      background: showTaskAdd ? 'rgba(96,165,250,0.12)' : 'transparent',
                      border:`1px solid ${showTaskAdd ? 'rgba(96,165,250,0.4)' : 'rgba(60,100,200,0.2)'}`,
                      color: showTaskAdd ? '#60a5fa' : '#3a6090',
                      fontSize:9,fontFamily:BODY,fontWeight:700,cursor:'pointer',transition:'all 0.15s',letterSpacing:'0.04em',
                    }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(96,165,250,0.45)'; e.currentTarget.style.color='#60a5fa' }}
                    onMouseLeave={e=>{ if(!showTaskAdd){ e.currentTarget.style.borderColor='rgba(60,100,200,0.2)'; e.currentTarget.style.color='#3a6090' }}}>
                    <Plus size={9}/> Add
                  </button>
                </div>

                {/* Quick-add */}
                {showTaskAdd && (
                  <div style={{display:'flex',alignItems:'center',gap:5,padding:'7px 10px',borderBottom:`1px solid ${DIVIDER}`,flexShrink:0}}>
                    <input
                      ref={taskInputRef}
                      value={newTask}
                      onChange={e => setNewTask(e.target.value)}
                      onKeyDown={e => { if(e.key==='Enter') addTask(); if(e.key==='Escape'){ setShowTaskAdd(false); setNewTask('') } }}
                      placeholder="Task for today…"
                      style={{flex:1,padding:'6px 9px',background:'rgba(40,80,200,0.08)',border:`1px solid rgba(96,165,250,0.2)`,color:'#d0e4ff',fontSize:12,fontFamily:BODY,outline:'none',caretColor:'#60a5fa'}}
                    />
                    <button onClick={addTask}
                      style={{padding:'6px 9px',background:'#60a5fa',border:'none',color:'#07090f',cursor:'pointer',display:'flex',alignItems:'center',flexShrink:0,fontWeight:800}}>
                      <Check size={11}/>
                    </button>
                  </div>
                )}

                {/* Task list */}
                <div style={{ flex:1, overflowY:'auto', paddingBottom:8 }}>
                  {todayTasks.length === 0 && (
                    <p style={{padding:'10px 14px',fontSize:11,color:'#2a4898',fontStyle:'italic'}}>Nothing due today.</p>
                  )}

                  {pending.map(t => (
                    <div key={t.id}
                      style={{display:'flex',alignItems:'center',gap:8,padding:'7px 12px',transition:'background 0.12s'}}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(96,165,250,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <button onClick={() => toggleTask(t.id)}
                        style={{background:'none',border:'none',padding:0,cursor:'pointer',flexShrink:0,color:'#2a4898',display:'flex',transition:'color 0.15s'}}
                        onMouseEnter={e => e.currentTarget.style.color='#4edea3'}
                        onMouseLeave={e => e.currentTarget.style.color='#2a4898'}>
                        <Circle size={13}/>
                      </button>
                      <span style={{flex:1,fontSize:12,fontWeight:500,color:'#c8dcff',lineHeight:1.35,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {t.title}
                      </span>
                      <button onClick={() => removeTask(t.id)}
                        style={{background:'none',border:'none',padding:0,cursor:'pointer',flexShrink:0,color:'#1e3870',display:'flex',transition:'color 0.15s'}}
                        onMouseEnter={e => e.currentTarget.style.color='#ff6b6b'}
                        onMouseLeave={e => e.currentTarget.style.color='#1e3870'}>
                        <X size={10}/>
                      </button>
                    </div>
                  ))}

                  {doneTasks.length > 0 && pending.length > 0 && (
                    <div style={{margin:'3px 12px',height:'1px',background:'rgba(40,80,180,0.15)'}}/>
                  )}

                  {doneTasks.map(t => (
                    <div key={t.id}
                      style={{display:'flex',alignItems:'center',gap:8,padding:'6px 12px',opacity:0.38,transition:'opacity 0.15s'}}
                      onMouseEnter={e => e.currentTarget.style.opacity='0.62'}
                      onMouseLeave={e => e.currentTarget.style.opacity='0.38'}>
                      <button onClick={() => toggleTask(t.id)}
                        style={{background:'none',border:'none',padding:0,cursor:'pointer',flexShrink:0,color:'#4edea3',display:'flex'}}>
                        <CheckCircle2 size={13}/>
                      </button>
                      <span style={{flex:1,fontSize:12,color:'#4a70a8',textDecoration:'line-through',lineHeight:1.35,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {t.title}
                      </span>
                      <button onClick={() => removeTask(t.id)}
                        style={{background:'none',border:'none',padding:0,cursor:'pointer',flexShrink:0,color:'#1e3870',display:'flex'}}>
                        <X size={10}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ ACTIVITY PANEL ══ */}
          {tab === 'activity' && (
            <div style={{padding:'18px 20px'}}>
              <p style={{fontSize:10,fontWeight:800,color:'#60a5fa',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:16}}>
                Today's Activity
              </p>
              {shiftStart === null && status === null ? (
                <p style={{fontSize:12,color:'#2a4898',lineHeight:1.6}}>Pick a status in Engage to start tracking.</p>
              ) : (
                <>
                  <div style={{marginBottom:18}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                      <span style={{fontSize:11,fontWeight:600,color:'#5090c8'}}>Total time</span>
                      <span style={{fontFamily:NUM,fontSize:12,fontWeight:700,color:'#60a5fa'}}>{fmt(shiftSecs)}</span>
                    </div>
                    <div style={{height:4,background:'rgba(40,80,200,0.12)'}}>
                      <div style={{height:'100%',background:'linear-gradient(90deg,#4edea3,#60a5fa)',width:'100%',opacity:0.6}}/>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {allStatuses.map(s => {
                      const secs = T[s.key]||0
                      if (secs===0 && s.key!==status) return null
                      const pct = shiftSecs>0 ? Math.min(100,(secs/shiftSecs)*100) : 0
                      return (
                        <div key={s.key}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <div style={{width:7,height:7,borderRadius:'50%',background:s.color,boxShadow:`0 0 6px ${s.color}80`}}/>
                              <span style={{fontSize:12,fontWeight:600,color:'#b0ccf0'}}>{s.label}</span>
                              {s.key===status && <div style={{width:5,height:5,borderRadius:'50%',background:s.color,boxShadow:`0 0 8px ${s.color}`,animation:'status-pulse 1.5s ease-in-out infinite'}}/>}
                            </div>
                            <span style={{fontFamily:NUM,fontSize:11,fontWeight:700,color:s.color+'bb'}}>{fmt(secs)}</span>
                          </div>
                          <div style={{height:4,background:'rgba(40,80,200,0.1)'}}>
                            <div style={{height:'100%',background:s.color,width:`${pct}%`,opacity:0.75,transition:'width 1s linear',boxShadow:`0 0 8px ${s.color}60`}}/>
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

      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes status-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.65; }
        }
      `}</style>
    </div>
  )
}
