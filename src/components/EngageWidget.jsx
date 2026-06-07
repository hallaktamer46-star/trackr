import { useState, useEffect, useRef } from 'react'
import { Power, Play, Plus, X, Check } from 'lucide-react'

const NUM  = 'Geist Mono, monospace'
const BODY = "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"

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
  if (h > 0) return `${h}h ${String(m).padStart(2,'0')}m`
  if (m > 0) return `${m}m ${String(sec).padStart(2,'0')}s`
  return `${sec}s`
}

const KEY = 'trackr_engage_v2'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } }
const save = v  => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }

export default function EngageWidget() {
  const today = new Date().toDateString()

  const [tab, setTab]           = useState(null)      // null | 'engage' | 'activity'
  const [status, setStatus]     = useState(null)      // null = not started
  const [log, setLog]           = useState([])
  const [custom, setCustom]     = useState([])
  const [showAdd, setShowAdd]   = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [shiftStart, setShiftStart] = useState(null)
  const [, setTick]             = useState(0)
  const timer = useRef(null)
  const widgetRef = useRef(null)

  // close panel on outside click
  useEffect(() => {
    function handleClick(e) {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setTab(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // hydrate
  useEffect(() => {
    const s = load()
    if (s?.date === today) {
      setStatus(s.status ?? null); setLog(s.log || [])
      setCustom(s.custom || []); setShiftStart(s.shiftStart || null)
    }
  }, [])

  useEffect(() => { save({ status, log, custom, shiftStart, date: today }) }, [status, log, custom, shiftStart])

  useEffect(() => {
    if (status !== null) timer.current = setInterval(() => setTick(t => t+1), 1000)
    else clearInterval(timer.current)
    return () => clearInterval(timer.current)
  }, [status])

  const allStatuses = [...STATUSES, ...custom.map((l,i) => ({ key:'c'+i, label:l, color:'#60a5fa' }))]
  const cur = allStatuses.find(s => s.key === status)

  // totals
  const totals = () => {
    const now = Date.now(), t = {}
    for (const e of log) { const s = Math.floor(((e.end||now)-e.start)/1000); t[e.status]=(t[e.status]||0)+s }
    return t
  }
  const T        = totals()
  const curSecs  = log.length && !log[log.length-1]?.end ? Math.floor((Date.now()-log[log.length-1].start)/1000) : 0
  const shiftSecs = shiftStart ? Math.floor((Date.now()-shiftStart)/1000) : 0

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
    setLog(l => { const c=[...l]; if(c.length&&!c[c.length-1].end) c[c.length-1]={...c[c.length-1],end:now}; return c })
    setStatus(null); setShiftStart(null); setLog([]); setTab('activity')
  }

  function addCustom() {
    const lbl = newLabel.trim(); if (!lbl) return
    setCustom(c=>[...c,lbl]); setNewLabel(''); setShowAdd(false)
  }

  const openTab = t => setTab(p => p === t ? null : t)

  // ── colors (zero gray) ─────────────────────────────────────
  const BG       = '#07090f'
  const BORDER   = 'rgba(80,130,200,0.15)'
  const DIM      = '#2a4060'       // dark blue for inactive text — not gray
  const DIVIDER  = 'rgba(60,120,200,0.1)'

  const tabBtn = (active, color) => ({
    flex: 1, padding: '12px 0', border: 'none',
    background: active ? `${color}12` : 'transparent',
    color: active ? color : DIM,
    fontFamily: BODY, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.2px',
  })

  return (
    <div ref={widgetRef} style={{ position:'fixed', bottom:0, right:0, width:300, zIndex:9999, fontFamily:BODY, display:'flex', flexDirection:'column' }}>

      {/* ── TAB BAR (always on top) ──────────────────────── */}
      <div style={{
        display:'flex', order: 0,
        background: BG,
        borderTop: `1px solid ${BORDER}`,
        borderLeft: `1px solid ${BORDER}`,
        backdropFilter: 'blur(24px)',
        boxShadow: status ? `0 -2px 20px ${cur?.color}20` : 'none',
        transition: 'box-shadow 0.4s',
      }}>


        {/* ENGAGE */}
        <button onClick={() => openTab('engage')} style={tabBtn(tab==='engage', cur?.color || '#4edea3')}>
          {cur && tab !== 'engage' ? (
            <span style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
              <span>Engage</span>
              <span style={{fontSize:9,color:cur.color,fontFamily:NUM}}>{cur.label} · {fmt(curSecs)}</span>
            </span>
          ) : 'Engage'}
        </button>

        {/* ACTIVITY */}
        <button onClick={() => openTab('activity')} style={tabBtn(tab==='activity', '#60a5fa')}>
          Activity
        </button>
      </div>

      {/* ── PANEL (below tab bar, slides down toward bottom edge) ── */}
      {tab && (
        <div style={{
          order: 1,
          background: BG,
          borderBottom: `1px solid ${BORDER}`,
          borderLeft: `1px solid ${BORDER}`,
          borderRight: `0px`,
          backdropFilter: 'blur(24px)',
          boxShadow: '-4px 4px 32px rgba(0,0,0,0.6)',
          animation: 'slideDown 0.18s ease',
        }}>

          {/* ══ ENGAGE PANEL ══ */}
          {tab === 'engage' && (
            <>
              {/* ── Clock In / Clock Out buttons ── */}
              <div style={{display:'flex',gap:0,borderBottom:`1px solid ${DIVIDER}`}}>

                {/* Clock Out — Power icon */}
                <button
                  onClick={endShift}
                  disabled={status === null}
                  title="Clock out"
                  style={{
                    flex:1, padding:'13px 0', border:'none', borderRight:`1px solid ${DIVIDER}`,
                    background: status !== null ? 'rgba(255,107,107,0.06)' : 'transparent',
                    color: status !== null ? '#ff6b6b' : '#1e3050',
                    cursor: status !== null ? 'pointer' : 'default',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                    fontSize:11, fontFamily:BODY, fontWeight:600, transition:'background 0.15s',
                  }}
                  onMouseEnter={e=>{ if(status!==null) e.currentTarget.style.background='rgba(255,107,107,0.13)' }}
                  onMouseLeave={e=>{ if(status!==null) e.currentTarget.style.background='rgba(255,107,107,0.06)' }}
                >
                  <Power size={14}/> Clock out
                </button>

                {/* Clock In — Play icon */}
                <button
                  onClick={() => { if(status===null) pickStatus('not_ready') }}
                  disabled={status !== null}
                  title="Clock in"
                  style={{
                    flex:1, padding:'13px 0', border:'none',
                    background: status === null ? 'rgba(78,222,163,0.08)' : 'transparent',
                    color: status === null ? '#4edea3' : '#1e3050',
                    cursor: status === null ? 'pointer' : 'default',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                    fontSize:11, fontFamily:BODY, fontWeight:600, transition:'background 0.15s',
                  }}
                  onMouseEnter={e=>{ if(status===null) e.currentTarget.style.background='rgba(78,222,163,0.15)' }}
                  onMouseLeave={e=>{ if(status===null) e.currentTarget.style.background='rgba(78,222,163,0.08)' }}
                >
                  <Play size={14} fill={status===null?'#4edea3':'#1e3050'}/> Clock in
                </button>
              </div>

              {/* ── Current status (only when active) ── */}
              {cur && (
                <div style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'13px 18px',
                  background:`${cur.color}0c`,
                }}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:9,height:9,borderRadius:'50%',background:cur.color,boxShadow:`0 0 8px ${cur.color}`}}/>
                    <span style={{fontSize:13,fontWeight:700,color:cur.color,letterSpacing:'-0.1px'}}>{cur.label}</span>
                  </div>
                  <span style={{fontFamily:NUM,fontSize:12,color:cur.color,opacity:0.8}}>{fmt(curSecs)}</span>
                </div>
              )}

              {/* ── Separator ── */}
              {cur && (
                <div style={{display:'flex',alignItems:'center',gap:10,padding:'0 18px',margin:'2px 0'}}>
                  <div style={{flex:1,height:'1px',background:`linear-gradient(90deg, ${cur.color}40, transparent)`}}/>
                  <span style={{fontFamily:NUM,fontSize:8,color:cur.color,opacity:0.5,letterSpacing:'0.1em',textTransform:'uppercase',whiteSpace:'nowrap'}}>switch to</span>
                  <div style={{flex:1,height:'1px',background:`linear-gradient(270deg, ${cur.color}40, transparent)`}}/>
                </div>
              )}

              {/* ── Status list ── */}
              {allStatuses.filter(s => s.key !== status).map((s, i, arr) => (
                <div key={s.key} onClick={() => status !== null ? pickStatus(s.key) : null}
                  style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'12px 18px',
                    borderBottom: i < arr.length-1 ? `1px solid ${DIVIDER}` : 'none',
                    cursor: status !== null ? 'pointer' : 'default',
                    opacity: status === null ? 0.35 : 1,
                    transition:'background 0.1s',
                  }}
                  onMouseEnter={e=>{ if(status!==null) e.currentTarget.style.background=`${s.color}0e` }}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:s.color,opacity:0.85}}/>
                    <span style={{fontSize:13,fontWeight:500,color:'#c8d8f0'}}>{s.label}</span>
                  </div>
                  <span style={{fontFamily:NUM,fontSize:10,color:'#2a4a70'}}>{fmt(T[s.key]||0)}</span>
                </div>
              ))}

              {/* Add custom */}
              {showAdd ? (
                <div style={{display:'flex',alignItems:'center',gap:6,padding:'10px 18px',borderTop:`1px solid ${DIVIDER}`}}>
                  <input autoFocus value={newLabel} onChange={e=>setNewLabel(e.target.value)}
                    onKeyDown={e=>{if(e.key==='Enter')addCustom();if(e.key==='Escape'){setShowAdd(false);setNewLabel('')}}}
                    placeholder="Status name…"
                    style={{flex:1,padding:'7px 10px',background:'#0d1520',border:`1px solid ${BORDER}`,color:'#c8d8f0',fontSize:12,fontFamily:BODY,outline:'none',borderRadius:4}}/>
                  <button onClick={addCustom} style={{padding:'7px 9px',background:'#4edea3',border:'none',color:'#07090f',cursor:'pointer',borderRadius:3,display:'flex',alignItems:'center'}}><Check size={12}/></button>
                  <button onClick={()=>{setShowAdd(false);setNewLabel('')}} style={{padding:'7px 9px',background:'#0d1520',border:`1px solid ${BORDER}`,color:'#60a5fa',cursor:'pointer',borderRadius:3,display:'flex',alignItems:'center'}}><X size={12}/></button>
                </div>
              ) : (
                <div style={{display:'flex',justifyContent:'flex-end',padding:'8px 18px',borderTop:`1px solid ${DIVIDER}`}}>
                  <button onClick={()=>setShowAdd(true)}
                    style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',background:'transparent',border:`1px solid ${DIM}30`,color:DIM,fontSize:10,fontFamily:BODY,cursor:'pointer',borderRadius:3,transition:'all 0.15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(96,165,250,0.5)';e.currentTarget.style.color='#60a5fa'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=`${DIM}30`;e.currentTarget.style.color=DIM}}>
                    <Plus size={10}/> Add status
                  </button>
                </div>
              )}
            </>
          )}

          {/* ══ ACTIVITY PANEL ══ */}
          {tab === 'activity' && (
            <div style={{padding:'18px 20px'}}>
              <p style={{fontSize:10,fontWeight:700,color:'#60a5fa',letterSpacing:'0.8px',textTransform:'uppercase',marginBottom:16}}>
                Today's Activity
              </p>

              {shiftStart === null && status === null ? (
                <p style={{fontSize:12,color:DIM,lineHeight:1.6}}>Pick a status in Engage to start tracking.</p>
              ) : (
                <>
                  {/* Shift elapsed */}
                  <div style={{marginBottom:18}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                      <span style={{fontSize:11,fontWeight:500,color:'#4a8abf'}}>Total time</span>
                      <span style={{fontFamily:NUM,fontSize:11,color:'#60a5fa'}}>{fmt(shiftSecs)}</span>
                    </div>
                    <div style={{height:4,background:'#0d1520',borderRadius:99}}>
                      <div style={{height:'100%',borderRadius:99,background:'linear-gradient(90deg,#4edea3,#60a5fa)',width:'100%',opacity:0.5}}/>
                    </div>
                  </div>

                  {/* Per-status bars */}
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {allStatuses.map(s => {
                      const secs = T[s.key]||0
                      if (secs===0 && s.key!==status) return null
                      const pct = shiftSecs>0 ? Math.min(100,(secs/shiftSecs)*100) : 0
                      return (
                        <div key={s.key}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <div style={{width:7,height:7,borderRadius:'50%',background:s.color}}/>
                              <span style={{fontSize:12,fontWeight:500,color:'#a8c4e0'}}>{s.label}</span>
                              {s.key===status && <div style={{width:5,height:5,borderRadius:'50%',background:s.color,boxShadow:`0 0 5px ${s.color}`}}/>}
                            </div>
                            <span style={{fontFamily:NUM,fontSize:10,color:'#3a6090'}}>{fmt(secs)}</span>
                          </div>
                          <div style={{height:4,background:'#0d1520',borderRadius:99}}>
                            <div style={{height:'100%',borderRadius:99,background:s.color,width:`${pct}%`,opacity:0.7,transition:'width 1s linear'}}/>
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
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}
