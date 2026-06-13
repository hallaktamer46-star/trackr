import { useMemo, useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const MONO    = '"Geist Mono", "JetBrains Mono", "Fira Code", monospace'
const DISPLAY = '"Inter", "SF Pro Display", -apple-system, sans-serif'

const S = {
  working:   { label:'Working',   color:'#00ffb3', dim:'rgba(0,255,179,0.1)'  },
  break:     { label:'Break',     color:'#ff9500', dim:'rgba(255,149,0,0.1)'  },
  meeting:   { label:'Meeting',   color:'#ff2d78', dim:'rgba(255,45,120,0.1)' },
  research:  { label:'Research',  color:'#00d4ff', dim:'rgba(0,212,255,0.1)'  },
  clerical:  { label:'Clerical',  color:'#ffe600', dim:'rgba(255,230,0,0.1)'  },
  coaching:  { label:'Coaching',  color:'#bf5af2', dim:'rgba(191,90,242,0.1)' },
  not_ready: { label:'Not Ready', color:'#ff453a', dim:'rgba(255,69,58,0.1)'  },
}

function fmtSecs(s) {
  if (!s || s <= 0) return '0m'
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${String(m).padStart(2,'0')}m` : `${m}m`
}
function fmtSecsShort(s) {
  const h = Math.floor(s / 3600)
  return h > 0 ? `${h}h` : `${Math.floor(s / 60)}m`
}
function loadHistory() {
  try { return JSON.parse(localStorage.getItem('trackr_history') || '[]') } catch { return [] }
}
function loadCustomStatuses() {
  try {
    const d = JSON.parse(localStorage.getItem('trackr_engage_v2') || '{}')
    const custom = d.custom || []
    const map = {}
    custom.forEach((label, i) => { map['c'+i] = { label, color:'#60a5fa', dim:'rgba(96,165,250,0.1)' } })
    return map
  } catch { return {} }
}
function loadToday() {
  try {
    const d = JSON.parse(localStorage.getItem('trackr_engage_v2') || '{}')
    const today = new Date().toDateString()
    const sessionDate = d.sessionDate || d.date
    const hasActiveSession = d.status !== null && d.shiftStart
    if (d.shiftStart && !d.status) {
      const shiftDay = new Date(d.shiftStart).toDateString()
      if (shiftDay !== today) return null
    }
    if (!hasActiveSession && sessionDate !== today) return null
    const now = Date.now(), t = {}
    for (const e of (d.log || [])) {
      const s = Math.floor(((e.end || now) - e.start) / 1000)
      t[e.status] = (t[e.status] || 0) + s
    }
    let fallback = 0
    for (const e of (d.log || [])) { if (e.end) fallback += Math.floor((e.end - e.start) / 1000) }
    const total = d.shiftStart ? Math.floor((now - d.shiftStart) / 1000) : fallback
    return { statuses: t, total, shiftStart: d.shiftStart, live: d.status !== null, currentStatus: d.status }
  } catch { return null }
}
function getLast7() {
  return Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toDateString()
  })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{background:'#020408',border:'1px solid rgba(0,212,255,0.25)',padding:'12px 16px',fontFamily:MONO,boxShadow:'0 12px 40px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,212,255,0.1)'}}>
      <p style={{fontSize:8,color:'rgba(0,212,255,0.5)',marginBottom:10,letterSpacing:'0.18em',textTransform:'uppercase'}}>{label}</p>
      {payload.map(p => p.value > 0 && (
        <div key={p.name} style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
          <div style={{width:6,height:6,background:S[p.name]?.color||'#00d4ff',boxShadow:`0 0 6px ${S[p.name]?.color||'#00d4ff'}`}}/>
          <span style={{fontSize:10,color:S[p.name]?.color||'#c8d8f0'}}>{S[p.name]?.label||p.name}</span>
          <span style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginLeft:'auto'}}>{fmtSecs(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// Fancy animated breakdown row
const Row = ({ k, secs, total, S_ALL, index = 0 }) => {
  const def = S_ALL[k] || { label:k, color:'#00d4ff', dim:'rgba(0,212,255,0.1)' }
  const pct = total > 0 ? Math.min(100, (secs / total) * 100) : 0
  return (
    <div style={{
      position:'relative', height:48, marginBottom:3, overflow:'hidden',
      animation:`fadeUp 0.4s ${index * 0.06}s ease both`,
    }}>
      {/* background fill */}
      <div style={{
        position:'absolute', left:0, top:0, height:'100%',
        width:`${pct}%`,
        background:`linear-gradient(90deg, ${def.color}22 0%, ${def.color}08 100%)`,
        borderRight:`1.5px solid ${def.color}80`,
        boxShadow:`0 0 24px ${def.color}20`,
        transition:'width 1.4s cubic-bezier(0.22,1,0.36,1)',
      }}/>
      {/* shimmer */}
      <div style={{
        position:'absolute', left:0, top:0, height:'100%', width:'100%',
        background:`linear-gradient(90deg, transparent 0%, ${def.color}08 50%, transparent 100%)`,
        backgroundSize:'200% 100%',
        animation:'shimmer 3s linear infinite',
        opacity: pct > 0 ? 1 : 0,
      }}/>
      {/* content */}
      <div style={{
        position:'absolute', inset:0, display:'flex', alignItems:'center',
        justifyContent:'space-between', padding:'0 18px',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:def.color,boxShadow:`0 0 8px ${def.color}`}}/>
          <span style={{fontFamily:MONO,fontSize:10,color:def.color,letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:700}}>{def.label}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <span style={{fontFamily:MONO,fontSize:9,color:`${def.color}50`,letterSpacing:'0.06em'}}>{Math.round(pct)}%</span>
          <span style={{fontFamily:MONO,fontSize:14,color:def.color,fontWeight:800,letterSpacing:'-0.02em'}}>{fmtSecs(secs)}</span>
        </div>
      </div>
    </div>
  )
}

// Card component for stat numbers
const StatCard = ({ label, value, color, sub, index = 0 }) => (
  <div style={{
    background:`linear-gradient(135deg, ${color}09 0%, rgba(0,0,0,0) 70%)`,
    borderTop:`2px solid ${color}60`,
    padding:'22px 24px 20px',
    position:'relative', overflow:'hidden',
    animation:`fadeUp 0.5s ${index * 0.08}s ease both`,
  }}>
    {/* corner glow */}
    <div style={{position:'absolute',top:-20,right:-20,width:80,height:80,borderRadius:'50%',background:`radial-gradient(circle, ${color}20 0%, transparent 70%)`}}/>
    <p style={{fontFamily:MONO,fontSize:8,color:`${color}55`,letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:12,fontWeight:600}}>{label}</p>
    <p style={{fontFamily:MONO,fontSize:26,fontWeight:900,color,letterSpacing:'-0.03em',lineHeight:1,marginBottom:sub?6:0,filter:`drop-shadow(0 0 12px ${color}60)`}}>{value}</p>
    {sub && <p style={{fontFamily:MONO,fontSize:9,color:`${color}50`,letterSpacing:'0.06em'}}>{sub}</p>}
  </div>
)

export default function TimeReport() {
  const [tab, setTab]   = useState('today')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'timereport-bg'
    style.textContent = `
      html, body { background: #020408 !important }
      .min-h-screen { background: #020408 !important }
      @keyframes fadeUp {
        from { opacity:0; transform:translateY(20px) }
        to   { opacity:1; transform:translateY(0) }
      }
      @keyframes shimmer {
        from { background-position: -200% center }
        to   { background-position:  200% center }
      }
      @keyframes pulse {
        0%,100% { opacity:1; box-shadow:0 0 8px #00d4ff, 0 0 16px rgba(0,212,255,0.5) }
        50%     { opacity:0.5; box-shadow:0 0 3px #00d4ff }
      }
      @keyframes livering {
        0%   { transform:scale(1);   opacity:0.6 }
        100% { transform:scale(2.6); opacity:0 }
      }
      @keyframes heroIn {
        from { opacity:0; filter:blur(12px); transform:translateY(12px) }
        to   { opacity:1; filter:blur(0);    transform:translateY(0) }
      }
      @keyframes borderGlow {
        0%,100% { border-color: rgba(0,212,255,0.15) }
        50%     { border-color: rgba(0,212,255,0.35) }
      }
    `
    document.head.appendChild(style)
    return () => document.getElementById('timereport-bg')?.remove()
  }, [])

  const history   = useMemo(() => loadHistory(), [])
  const customSt  = useMemo(() => loadCustomStatuses(), [tick])
  const S_ALL     = useMemo(() => ({...S, ...customSt}), [customSt])
  const today     = new Date().toDateString()
  const todayData = useMemo(() => loadToday(), [tick])

  useEffect(() => {
    const t = setInterval(() => setTick(x => x+1), 1000)
    return () => clearInterval(t)
  }, [])

  const allData = useMemo(() => {
    const hist = [...history]
    if (todayData) {
      const i = hist.findIndex(h => h.date === today)
      const r = { date: today, ...todayData }
      i >= 0 ? hist.splice(i, 1, r) : hist.unshift(r)
    }
    return hist
  }, [history, todayData, tick])

  const weekDays = getLast7()
  const weekData = weekDays.map(date => {
    const d = allData.find(h => h.date === date)
    return { date: new Date(date).toLocaleDateString('en', {weekday:'short'}), total: d?.total||0, ...(d?.statuses||{}) }
  })

  const overall = useMemo(() => {
    const t = {}; let g = 0
    for (const d of allData) for (const [k,v] of Object.entries(d.statuses||{})) { t[k]=(t[k]||0)+v; g+=v }
    return { s:t, total:g }
  }, [allData])

  const TD        = todayData?.statuses || {}
  const TTOT      = todayData?.total || 0
  const keys      = Object.keys(S_ALL)

  const weekTotal = weekData.reduce((a,d) => a + d.total, 0)
  const weekAvg   = weekTotal > 0 ? Math.floor(weekTotal / weekData.filter(d => d.total > 0).length) : 0

  return (
    <div style={{
      fontFamily: DISPLAY,
      background: '#020408',
      minHeight: '100vh',
      position: 'relative',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100vw',
      marginTop: '-24px',
      marginBottom: '-24px',
      padding: '0 0 100px',
      backgroundImage: `
        radial-gradient(ellipse 100% 50% at 50% -5%, rgba(0,212,255,0.07) 0%, transparent 65%),
        radial-gradient(ellipse 60% 30% at 80% 80%, rgba(0,255,179,0.03) 0%, transparent 60%),
        linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)
      `,
      backgroundSize: '100% 100%, 100% 100%, 48px 48px, 48px 48px',
    }}>

      {/* ── HEADER ── */}
      <div style={{
        padding: '18px 48px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
      }}>
        <div/>

        {/* Center — LIVE */}
        <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
          {todayData?.live ? (
            <div style={{display:'flex',alignItems:'center',gap:9}}>
              <div style={{position:'relative',width:7,height:7,flexShrink:0}}>
                <div style={{position:'absolute',inset:0,borderRadius:'50%',background:'#00d4ff',animation:'pulse 1.8s ease-in-out infinite'}}/>
                <div style={{position:'absolute',inset:-4,borderRadius:'50%',background:'rgba(0,212,255,0.25)',animation:'livering 1.8s ease-out infinite'}}/>
              </div>
              <span style={{fontFamily:MONO,fontSize:9,fontWeight:800,color:'rgba(0,212,255,0.7)',letterSpacing:'0.24em'}}>LIVE</span>
              {todayData?.currentStatus && (
                <span style={{fontFamily:MONO,fontSize:8,color:'rgba(255,255,255,0.22)',letterSpacing:'0.06em'}}>
                  · {S_ALL[todayData.currentStatus]?.label || todayData.currentStatus}
                </span>
              )}
            </div>
          ) : <div/>}
        </div>

        {/* Right — date */}
        <div style={{display:'flex',justifyContent:'flex-end',flexDirection:'column',alignItems:'flex-end',gap:3}}>
          <span style={{fontFamily:MONO,fontSize:13,fontWeight:800,color:'rgba(0,212,255,0.8)',letterSpacing:'0.04em'}}>
            {new Date().toLocaleDateString('en', {weekday:'long'})}
          </span>
          <span style={{fontFamily:MONO,fontSize:8,color:'rgba(0,212,255,0.3)',letterSpacing:'0.16em',textTransform:'uppercase'}}>
            {new Date().toLocaleDateString('en', {month:'long', day:'numeric', year:'numeric'})}
          </span>
        </div>
      </div>

      {/* ── HERO ── */}
      <div style={{padding:'48px 48px 0',position:'relative'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:32,alignItems:'end'}}>
          <div>
            <p style={{fontFamily:MONO,fontSize:8,letterSpacing:'0.28em',color:'rgba(255,255,255,0.15)',textTransform:'uppercase',marginBottom:20,fontWeight:600}}>
              Total tracked today
            </p>
            <div style={{display:'flex',alignItems:'baseline',gap:20,flexWrap:'wrap'}}>
              <span style={{
                fontFamily: MONO, fontWeight: 900,
                fontSize: 'clamp(64px,10vw,108px)',
                letterSpacing: '-0.04em', lineHeight: 0.85,
                background: TTOT > 0
                  ? 'linear-gradient(140deg, #ffffff 0%, #e8f4fd 30%, #00d4ff 100%)'
                  : 'linear-gradient(140deg, rgba(255,255,255,0.1), rgba(0,212,255,0.2))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: TTOT > 0 ? 'drop-shadow(0 0 40px rgba(0,212,255,0.3))' : 'none',
                animation: 'heroIn 0.7s ease both',
              }}>
                {TTOT > 0 ? fmtSecs(TTOT) : '——'}
              </span>
            </div>
          </div>

          {/* Mini status pills */}
          {TTOT > 0 && (
            <div style={{display:'flex',flexDirection:'column',gap:2,paddingBottom:4,animation:'fadeUp 0.6s 0.15s ease both'}}>
              {keys.filter(k => (TD[k]||0) > 0).slice(0,5).map(k => (
                <div key={k} style={{
                  display:'flex',alignItems:'center',justifyContent:'space-between',gap:20,
                  padding:'6px 14px',
                  background:`linear-gradient(90deg, ${S_ALL[k]?.color || '#00d4ff'}10, transparent)`,
                  borderLeft:`2px solid ${S_ALL[k]?.color || '#00d4ff'}70`,
                }}>
                  <span style={{fontFamily:MONO,fontSize:9,color:S_ALL[k]?.color||'#00d4ff',letterSpacing:'0.08em',textTransform:'uppercase',fontWeight:600}}>{S_ALL[k]?.label||k}</span>
                  <span style={{fontFamily:MONO,fontSize:9,color:`${S_ALL[k]?.color||'#00d4ff'}70`,fontWeight:700}}>{fmtSecs(TD[k]||0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{display:'flex',alignItems:'center',padding:'36px 48px 0',gap:0}}>
        {[['today','TODAY'],['weekly','WEEKLY'],['alltime','ALL TIME']].map(([k,l], i) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '10px 24px', border: 'none', cursor: 'pointer',
            fontFamily: MONO, fontSize: 9, fontWeight: 800, letterSpacing: '0.18em',
            background: tab === k ? 'linear-gradient(180deg, rgba(0,212,255,0.08), transparent)' : 'transparent',
            color: tab === k ? '#00d4ff' : 'rgba(255,255,255,0.18)',
            borderBottom: tab === k ? '2px solid #00d4ff' : '2px solid rgba(255,255,255,0.06)',
            borderRight: i < 2 ? '1px solid rgba(0,212,255,0.08)' : 'none',
            transition: 'all 0.15s',
            boxShadow: tab === k ? '0 -1px 0 rgba(0,212,255,0.4) inset' : 'none',
          }}
          onMouseEnter={e => { if (tab !== k) e.currentTarget.style.color = 'rgba(0,212,255,0.5)' }}
          onMouseLeave={e => { if (tab !== k) e.currentTarget.style.color = 'rgba(255,255,255,0.18)' }}>
            {l}
          </button>
        ))}
        <div style={{flex:1,height:'2px',background:'linear-gradient(90deg,rgba(0,212,255,0.08),transparent)',marginBottom:'-2px'}}/>
      </div>

      {/* ── CONTENT ── */}
      <div style={{padding:'28px 48px 0'}}>

        {/* TODAY */}
        {tab === 'today' && (
          <div>
            {!todayData ? (
              <div style={{padding:'80px 0',textAlign:'center',animation:'fadeUp 0.5s ease both'}}>
                <div style={{width:60,height:60,borderRadius:'50%',border:'1px solid rgba(0,212,255,0.15)',margin:'0 auto 20px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <div style={{width:20,height:20,borderRadius:'50%',border:'2px solid rgba(0,212,255,0.3)'}}/>
                </div>
                <p style={{fontFamily:MONO,fontSize:11,color:'rgba(255,255,255,0.12)',letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:8}}>
                  No shift started
                </p>
                <p style={{fontFamily:MONO,fontSize:9,color:'rgba(255,255,255,0.07)',letterSpacing:'0.12em',textTransform:'uppercase'}}>
                  Open Engage to clock in
                </p>
              </div>
            ) : (
              <>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3,marginBottom:3}}>
                  <StatCard label="Total Time"   value={fmtSecs(TTOT)}  color="#00d4ff" index={0}/>
                  <StatCard label="Shift Start"  color="#a78bfa" index={1}
                    value={todayData.shiftStart ? new Date(todayData.shiftStart).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'}) : '—'}/>
                  <StatCard label="Status" index={2}
                    value={todayData.currentStatus ? S_ALL[todayData.currentStatus]?.label||'—' : 'Off'}
                    color={todayData.currentStatus ? S_ALL[todayData.currentStatus]?.color||'#00d4ff' : 'rgba(255,255,255,0.2)'}/>
                </div>

                <div style={{
                  padding:'22px 0 18px',
                  animation:'fadeUp 0.5s 0.2s ease both',
                  animationFillMode:'both',
                }}>
                  <p style={{fontFamily:MONO,fontSize:8,color:'rgba(255,255,255,0.18)',letterSpacing:'0.22em',textTransform:'uppercase',marginBottom:16,fontWeight:700}}>Breakdown</p>
                  {keys.map((k, i) => {
                    const s = TD[k] || 0; if (!s) return null
                    return <Row key={k} k={k} secs={s} total={TTOT} S_ALL={S_ALL} index={i}/>
                  })}
                  {Object.entries(TD).filter(([k]) => !keys.includes(k)).map(([k,s], i) =>
                    <Row key={k} k={k} secs={s} total={TTOT} S_ALL={S_ALL} index={keys.length+i}/>
                  )}
                  {Object.values(TD).every(v => !v) && (
                    <p style={{fontFamily:MONO,fontSize:10,color:'rgba(255,255,255,0.1)',textAlign:'center',padding:'20px 0',letterSpacing:'0.12em'}}>
                      NO STATUS TIME RECORDED YET
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* WEEKLY */}
        {tab === 'weekly' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3,marginBottom:3}}>
              <StatCard label="Week Total"  value={fmtSecs(weekTotal)} color="#00d4ff" index={0}/>
              <StatCard label="Active Days" value={weekData.filter(d=>d.total>0).length} color="#00ffb3" index={1}/>
              <StatCard label="Daily Avg"   value={weekAvg ? fmtSecs(weekAvg) : '—'} color="#bf5af2" index={2}/>
            </div>

            {/* Chart */}
            <div style={{padding:'22px 0 12px',marginBottom:3,animation:'fadeUp 0.5s 0.2s ease both',animationFillMode:'both'}}>
              <p style={{fontFamily:MONO,fontSize:8,color:'rgba(255,255,255,0.18)',letterSpacing:'0.22em',textTransform:'uppercase',marginBottom:20,fontWeight:700}}>Last 7 Days</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weekData} barSize={28} margin={{top:0,right:0,left:-20,bottom:0}}>
                  <XAxis dataKey="date" tick={{fontFamily:MONO,fontSize:9,fill:'rgba(255,255,255,0.2)'}} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={v=>fmtSecsShort(v)} tick={{fontFamily:MONO,fontSize:8,fill:'rgba(255,255,255,0.15)'}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>} cursor={{fill:'rgba(0,212,255,0.04)'}}/>
                  {keys.map(k => (
                    <Bar key={k} dataKey={k} stackId="a" fill={S[k]?.color||'#00d4ff'} opacity={0.85}
                      radius={k==='coaching'?[3,3,0,0]:[0,0,0,0]}/>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Day grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3,marginBottom:3}}>
              {weekData.map((d, i) => {
                const isToday = i === 6
                const c = d.total > 0 ? '#00d4ff' : 'rgba(255,255,255,0.07)'
                return (
                  <div key={d.date} style={{
                    background: isToday ? 'rgba(0,212,255,0.05)' : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${isToday ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
                    borderTop: `2px solid ${isToday ? '#00d4ff' : d.total > 0 ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
                    padding:'14px 10px', textAlign:'center',
                    animation:`fadeUp 0.4s ${i * 0.04}s ease both`,
                    animationFillMode:'both',
                  }}>
                    <p style={{fontFamily:MONO,fontSize:8,color:isToday?'#00d4ff':'rgba(255,255,255,0.2)',marginBottom:8,letterSpacing:'0.1em',fontWeight:isToday?700:400}}>{d.date}</p>
                    <p style={{fontFamily:MONO,fontSize:13,fontWeight:700,color:c,letterSpacing:'-0.02em'}}>{d.total>0?fmtSecs(d.total):'—'}</p>
                  </div>
                )
              })}
            </div>

            {/* Weekly breakdown */}
            <div style={{padding:'22px 0 18px',animation:'fadeUp 0.5s 0.3s ease both',animationFillMode:'both'}}>
              <p style={{fontFamily:MONO,fontSize:8,color:'rgba(255,255,255,0.18)',letterSpacing:'0.22em',textTransform:'uppercase',marginBottom:16,fontWeight:700}}>This Week By Status</p>
              {(() => {
                const wt = {}; let wg = 0
                for (const d of weekData) for (const [k,v] of Object.entries(d)) {
                  if (k === 'date' || k === 'total') continue; wt[k]=(wt[k]||0)+v; wg+=v
                }
                return keys.map((k, i) => { const s=wt[k]||0; if (!s) return null; return <Row key={k} k={k} secs={s} total={wg} S_ALL={S_ALL} index={i}/> })
              })()}
            </div>
          </div>
        )}

        {/* ALL TIME */}
        {tab === 'alltime' && (
          <div>
            {allData.length === 0 ? (
              <div style={{padding:'80px 0',textAlign:'center',animation:'fadeUp 0.5s ease both'}}>
                <p style={{fontFamily:MONO,fontSize:11,color:'rgba(255,255,255,0.12)',letterSpacing:'0.2em',textTransform:'uppercase'}}>No History Yet</p>
                <p style={{fontFamily:MONO,fontSize:9,color:'rgba(255,255,255,0.06)',letterSpacing:'0.12em',textTransform:'uppercase',marginTop:8}}>Start tracking to see your data</p>
              </div>
            ) : (
              <>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3,marginBottom:3}}>
                  <StatCard label="Total Tracked" value={fmtSecs(overall.total)} color="#00d4ff" index={0}/>
                  <StatCard label="Days Logged"   value={allData.length}          color="#00ffb3" index={1}/>
                  <StatCard label="Avg / Day"
                    value={allData.length > 0 ? fmtSecs(Math.floor(overall.total / allData.length)) : '—'}
                    color="#bf5af2" index={2}/>
                </div>

                {/* Distribution */}
                <div style={{padding:'22px 0 18px',marginBottom:3,animation:'fadeUp 0.5s 0.2s ease both',animationFillMode:'both'}}>
                  <p style={{fontFamily:MONO,fontSize:8,color:'rgba(255,255,255,0.18)',letterSpacing:'0.22em',textTransform:'uppercase',marginBottom:16,fontWeight:700}}>All-Time Distribution</p>
                  {keys.map((k, i) => { const s=overall.s[k]||0; if (!s) return null; return <Row key={k} k={k} secs={s} total={overall.total} S_ALL={S_ALL} index={i}/> })}
                </div>

                {/* History log */}
                <div style={{padding:'22px 0 8px',animation:'fadeUp 0.5s 0.3s ease both',animationFillMode:'both'}}>
                  <p style={{fontFamily:MONO,fontSize:8,color:'rgba(255,255,255,0.18)',letterSpacing:'0.22em',textTransform:'uppercase',marginBottom:18,fontWeight:700}}>History Log</p>
                  {allData.map((d, i) => (
                    <div key={d.date} style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'12px 0',
                      borderBottom: i < allData.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      animation:`fadeUp 0.4s ${Math.min(i,8) * 0.04}s ease both`,
                      animationFillMode:'both',
                    }}>
                      <span style={{fontFamily:MONO,fontSize:10,color:'rgba(255,255,255,0.3)',minWidth:150,letterSpacing:'0.04em'}}>
                        {new Date(d.date).toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})}
                      </span>
                      <div style={{display:'flex',gap:4,flex:1,justifyContent:'center',flexWrap:'wrap'}}>
                        {Object.entries(d.statuses||{}).map(([k,v]) => v > 0 && (
                          <span key={k} style={{
                            fontFamily:MONO, fontSize:8,
                            color: S_ALL[k]?.color||'#00d4ff',
                            background:`${S_ALL[k]?.color||'#00d4ff'}10`,
                            padding:'3px 9px',
                            border:`1px solid ${S_ALL[k]?.color||'#00d4ff'}25`,
                            letterSpacing:'0.06em', textTransform:'uppercase',
                          }}>
                            {(S_ALL[k]?.label||k).split(' ')[0]} {fmtSecs(v)}
                          </span>
                        ))}
                      </div>
                      <span style={{fontFamily:MONO,fontSize:13,fontWeight:800,color:'#00d4ff',minWidth:60,textAlign:'right',filter:'drop-shadow(0 0 6px rgba(0,212,255,0.5))'}}>{fmtSecs(d.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
