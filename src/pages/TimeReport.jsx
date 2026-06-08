import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

const STATUS_COLORS = {
  not_ready: '#ff6b6b',
  working:   '#4edea3',
  break:     '#ffb689',
  meeting:   '#f472b6',
  research:  '#60a5fa',
  clerical:  '#fbbf24',
  coaching:  '#a78bfa',
}
const STATUS_LABELS = {
  not_ready: 'Not Ready',
  working:   'Working',
  break:     'Break',
  meeting:   'Meeting',
  research:  'Research',
  clerical:  'Clerical',
  coaching:  'Coaching',
}

function fmtSecs(s) {
  if (!s || s <= 0) return '0m'
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60)
  if (h > 0) return `${h}h ${String(m).padStart(2,'0')}m`
  return `${m}m`
}

function fmtSecsShort(s) {
  const h = Math.floor(s/3600)
  return h > 0 ? `${h}h` : `${Math.floor(s/60)}m`
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem('trackr_history') || '[]') } catch { return [] }
}

function loadToday() {
  try {
    const d = JSON.parse(localStorage.getItem('trackr_engage_v2') || '{}')
    const today = new Date().toDateString()
    if (d.date !== today) return null
    // compute totals from live log
    const now = Date.now()
    const t = {}
    for (const e of (d.log||[])) { const s=Math.floor(((e.end||now)-e.start)/1000); t[e.status]=(t[e.status]||0)+s }
    const total = d.shiftStart ? Math.floor((now - d.shiftStart)/1000) : 0
    return { statuses: t, total, shiftStart: d.shiftStart, live: d.status !== null }
  } catch { return null }
}

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    days.push(d.toDateString())
  }
  return days
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'rgba(9,13,19,0.97)', border:'0.5px solid rgba(80,130,200,0.2)', padding:'10px 14px', fontFamily:MONO }}>
      <p style={{ fontSize:10, color:'#60a5fa', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ fontSize:11, color: STATUS_COLORS[p.name] || '#c8d8f0', marginBottom:2 }}>
          {STATUS_LABELS[p.name] || p.name}: {fmtSecs(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function TimeReport() {
  const [activeTab, setActiveTab] = useState('today')
  const history = useMemo(() => loadHistory(), [])
  const todayData = useMemo(() => loadToday(), [])
  const today = new Date().toDateString()

  // merge today (live) into history view
  const allData = useMemo(() => {
    const hist = [...history]
    if (todayData) {
      const idx = hist.findIndex(h => h.date === today)
      const record = { date: today, ...todayData }
      if (idx >= 0) hist[idx] = record; else hist.unshift(record)
    }
    return hist
  }, [history, todayData])

  // last 7 days for weekly chart
  const weekDays = getLast7Days()
  const weekData = weekDays.map(date => {
    const d = allData.find(h => h.date === date)
    const label = new Date(date).toLocaleDateString('en', { weekday: 'short' })
    if (!d) return { date: label, total: 0 }
    return { date: label, total: d.total, ...d.statuses }
  })

  // overall totals across all history
  const overallTotals = useMemo(() => {
    const t = {}; let grand = 0
    for (const d of allData) { for (const [k,v] of Object.entries(d.statuses||{})) { t[k]=(t[k]||0)+v; grand+=v } }
    return { statuses: t, total: grand }
  }, [allData])

  const todayStatuses = todayData?.statuses || {}
  const todayTotal    = todayData?.total    || 0

  const statusKeys = Object.keys(STATUS_LABELS)

  const TAB = (key, label) => (
    <button onClick={() => setActiveTab(key)} style={{
      padding:'8px 18px', border:'none', cursor:'pointer', fontFamily:MONO,
      fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase',
      background: activeTab===key ? 'rgba(96,165,250,0.12)' : 'transparent',
      color: activeTab===key ? '#60a5fa' : '#2a4060',
      borderBottom: activeTab===key ? '1.5px solid #60a5fa' : '1.5px solid transparent',
      transition:'all 0.15s',
    }}>{label}</button>
  )

  return (
    <div style={{ fontFamily:SANS, maxWidth:820, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.14em', color:'rgba(96,165,250,0.5)', textTransform:'uppercase', marginBottom:6 }}>
          Engage Tracker
        </p>
        <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:'-0.03em', color:'#e2e2e8', lineHeight:1.15, marginBottom:6 }}>
          Time Report
        </h1>
        <p style={{ fontSize:13, color:'#2a4060', lineHeight:1.5 }}>
          Your daily activity, weekly patterns, and how you spend your time.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(60,120,200,0.12)', marginBottom:28 }}>
        {TAB('today',   'Today')}
        {TAB('weekly',  'Weekly')}
        {TAB('alltime', 'All Time')}
      </div>

      {/* ── TODAY ── */}
      {activeTab === 'today' && (
        <div>
          {!todayData ? (
            <div style={{ background:'rgba(13,17,23,0.85)', border:'0.5px solid rgba(80,130,200,0.12)', padding:'40px 32px', textAlign:'center' }}>
              <p style={{ fontFamily:MONO, fontSize:11, color:'#2a4060', letterSpacing:'0.08em' }}>No shift tracked today yet.</p>
            </div>
          ) : (
            <>
              {/* Total card */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2, marginBottom:2 }}>
                <div style={{ background:'rgba(13,17,23,0.85)', border:'0.5px solid rgba(80,130,200,0.12)', padding:'20px 24px' }}>
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#2a4060', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Total time</p>
                  <p style={{ fontFamily:MONO, fontSize:28, fontWeight:700, color:'#60a5fa', letterSpacing:'-0.04em' }}>{fmtSecs(todayTotal)}</p>
                  {todayData.live && <p style={{ fontFamily:MONO, fontSize:9, color:'#4edea3', marginTop:6 }}>● Live</p>}
                </div>
                <div style={{ background:'rgba(13,17,23,0.85)', border:'0.5px solid rgba(80,130,200,0.12)', padding:'20px 24px' }}>
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#2a4060', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Started</p>
                  <p style={{ fontFamily:MONO, fontSize:20, fontWeight:700, color:'#e2e2e8', letterSpacing:'-0.03em' }}>
                    {todayData.shiftStart ? new Date(todayData.shiftStart).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'}) : '—'}
                  </p>
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#2a4060', marginTop:6 }}>{new Date().toLocaleDateString('en',{weekday:'long',month:'short',day:'numeric'})}</p>
                </div>
              </div>

              {/* Status breakdown */}
              <div style={{ background:'rgba(13,17,23,0.85)', border:'0.5px solid rgba(80,130,200,0.12)', padding:'22px 24px' }}>
                <p style={{ fontFamily:MONO, fontSize:9, color:'#2a4060', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:18 }}>Status breakdown</p>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {statusKeys.map(key => {
                    const secs = todayStatuses[key] || 0
                    if (secs === 0) return null
                    const pct = todayTotal > 0 ? (secs/todayTotal)*100 : 0
                    return (
                      <div key={key}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:7, height:7, borderRadius:'50%', background:STATUS_COLORS[key] }}/>
                            <span style={{ fontSize:13, fontWeight:500, color:'#a8c4e0' }}>{STATUS_LABELS[key]}</span>
                          </div>
                          <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                            <span style={{ fontFamily:MONO, fontSize:10, color:'#3a6090' }}>{Math.round(pct)}%</span>
                            <span style={{ fontFamily:MONO, fontSize:11, color:STATUS_COLORS[key] }}>{fmtSecs(secs)}</span>
                          </div>
                        </div>
                        <div style={{ height:5, background:'#0a0e14', borderRadius:99 }}>
                          <div style={{ height:'100%', borderRadius:99, background:STATUS_COLORS[key], width:`${pct}%`, opacity:0.75, transition:'width 0.6s ease' }}/>
                        </div>
                      </div>
                    )
                  })}
                  {/* custom statuses */}
                  {Object.entries(todayStatuses).filter(([k]) => !statusKeys.includes(k)).map(([key, secs]) => {
                    const pct = todayTotal > 0 ? (secs/todayTotal)*100 : 0
                    return (
                      <div key={key}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:7, height:7, borderRadius:'50%', background:'#60a5fa' }}/>
                            <span style={{ fontSize:13, fontWeight:500, color:'#a8c4e0' }}>{key}</span>
                          </div>
                          <span style={{ fontFamily:MONO, fontSize:11, color:'#60a5fa' }}>{fmtSecs(secs)}</span>
                        </div>
                        <div style={{ height:5, background:'#0a0e14', borderRadius:99 }}>
                          <div style={{ height:'100%', borderRadius:99, background:'#60a5fa', width:`${pct}%`, opacity:0.75 }}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── WEEKLY ── */}
      {activeTab === 'weekly' && (
        <div>
          <div style={{ background:'rgba(13,17,23,0.85)', border:'0.5px solid rgba(80,130,200,0.12)', padding:'22px 24px', marginBottom:2 }}>
            <p style={{ fontFamily:MONO, fontSize:9, color:'#2a4060', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:20 }}>Hours per day — last 7 days</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekData} barSize={28} margin={{ top:4, right:8, left:-20, bottom:0 }}>
                <XAxis dataKey="date" tick={{ fontFamily:MONO, fontSize:10, fill:'#2a4060' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => fmtSecsShort(v)} tick={{ fontFamily:MONO, fontSize:9, fill:'#2a4060' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip/>} cursor={{ fill:'rgba(96,165,250,0.05)' }} />
                {statusKeys.map(key => (
                  <Bar key={key} dataKey={key} stackId="a" fill={STATUS_COLORS[key]} opacity={0.8} radius={0} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly totals */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:2 }}>
            {weekData.map(d => (
              <div key={d.date} style={{ background:'rgba(13,17,23,0.85)', border:'0.5px solid rgba(80,130,200,0.12)', padding:'14px 10px', textAlign:'center' }}>
                <p style={{ fontFamily:MONO, fontSize:9, color:'#2a4060', marginBottom:6 }}>{d.date}</p>
                <p style={{ fontFamily:MONO, fontSize:13, fontWeight:700, color: d.total>0?'#60a5fa':'#1a2a3a' }}>{d.total>0?fmtSecs(d.total):'—'}</p>
              </div>
            ))}
          </div>

          {/* Weekly status summary */}
          <div style={{ background:'rgba(13,17,23,0.85)', border:'0.5px solid rgba(80,130,200,0.12)', padding:'22px 24px' }}>
            <p style={{ fontFamily:MONO, fontSize:9, color:'#2a4060', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:18 }}>This week by status</p>
            {(() => {
              const weekTotals = {}; let weekGrand = 0
              for (const d of weekData) { for (const [k,v] of Object.entries(d)) { if(k==='date'||k==='total') continue; weekTotals[k]=(weekTotals[k]||0)+v; weekGrand+=v } }
              return statusKeys.map(key => {
                const secs = weekTotals[key]||0; if(!secs) return null
                const pct = weekGrand>0?(secs/weekGrand)*100:0
                return (
                  <div key={key} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:STATUS_COLORS[key], flexShrink:0 }}/>
                    <span style={{ fontSize:12, fontWeight:500, color:'#a8c4e0', width:80 }}>{STATUS_LABELS[key]}</span>
                    <div style={{ flex:1, height:4, background:'#0a0e14', borderRadius:99 }}>
                      <div style={{ height:'100%', borderRadius:99, background:STATUS_COLORS[key], width:`${pct}%`, opacity:0.7 }}/>
                    </div>
                    <span style={{ fontFamily:MONO, fontSize:10, color:STATUS_COLORS[key], width:52, textAlign:'right' }}>{fmtSecs(secs)}</span>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}

      {/* ── ALL TIME ── */}
      {activeTab === 'alltime' && (
        <div>
          {allData.length === 0 ? (
            <div style={{ background:'rgba(13,17,23,0.85)', border:'0.5px solid rgba(80,130,200,0.12)', padding:'40px 32px', textAlign:'center' }}>
              <p style={{ fontFamily:MONO, fontSize:11, color:'#2a4060', letterSpacing:'0.08em' }}>No data recorded yet.</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2, marginBottom:2 }}>
                <div style={{ background:'rgba(13,17,23,0.85)', border:'0.5px solid rgba(80,130,200,0.12)', padding:'20px 24px' }}>
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#2a4060', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Total tracked</p>
                  <p style={{ fontFamily:MONO, fontSize:22, fontWeight:700, color:'#60a5fa', letterSpacing:'-0.03em' }}>{fmtSecs(overallTotals.total)}</p>
                </div>
                <div style={{ background:'rgba(13,17,23,0.85)', border:'0.5px solid rgba(80,130,200,0.12)', padding:'20px 24px' }}>
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#2a4060', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Days tracked</p>
                  <p style={{ fontFamily:MONO, fontSize:22, fontWeight:700, color:'#4edea3', letterSpacing:'-0.03em' }}>{allData.length}</p>
                </div>
                <div style={{ background:'rgba(13,17,23,0.85)', border:'0.5px solid rgba(80,130,200,0.12)', padding:'20px 24px' }}>
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#2a4060', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Avg / day</p>
                  <p style={{ fontFamily:MONO, fontSize:22, fontWeight:700, color:'#a78bfa', letterSpacing:'-0.03em' }}>
                    {allData.length>0 ? fmtSecs(Math.floor(overallTotals.total/allData.length)) : '—'}
                  </p>
                </div>
              </div>

              {/* All-time status distribution */}
              <div style={{ background:'rgba(13,17,23,0.85)', border:'0.5px solid rgba(80,130,200,0.12)', padding:'22px 24px', marginBottom:2 }}>
                <p style={{ fontFamily:MONO, fontSize:9, color:'#2a4060', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:18 }}>All-time status distribution</p>
                <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                  {statusKeys.map(key => {
                    const secs = overallTotals.statuses[key]||0; if(!secs) return null
                    const pct = overallTotals.total>0?(secs/overallTotals.total)*100:0
                    return (
                      <div key={key}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:7, height:7, borderRadius:'50%', background:STATUS_COLORS[key] }}/>
                            <span style={{ fontSize:13, fontWeight:500, color:'#a8c4e0' }}>{STATUS_LABELS[key]}</span>
                          </div>
                          <div style={{ display:'flex', gap:14 }}>
                            <span style={{ fontFamily:MONO, fontSize:10, color:'#3a6090' }}>{Math.round(pct)}%</span>
                            <span style={{ fontFamily:MONO, fontSize:11, color:STATUS_COLORS[key] }}>{fmtSecs(secs)}</span>
                          </div>
                        </div>
                        <div style={{ height:5, background:'#0a0e14', borderRadius:99 }}>
                          <div style={{ height:'100%', borderRadius:99, background:STATUS_COLORS[key], width:`${pct}%`, opacity:0.75 }}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Day-by-day history */}
              <div style={{ background:'rgba(13,17,23,0.85)', border:'0.5px solid rgba(80,130,200,0.12)', padding:'22px 24px' }}>
                <p style={{ fontFamily:MONO, fontSize:9, color:'#2a4060', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:16 }}>History</p>
                <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                  {allData.map(d => (
                    <div key={d.date} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 0', borderBottom:'0.5px solid rgba(60,120,200,0.08)' }}>
                      <span style={{ fontSize:12, color:'#a8c4e0' }}>{new Date(d.date).toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})}</span>
                      <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                        {Object.entries(d.statuses||{}).map(([k,v]) => v>0 && (
                          <span key={k} style={{ fontFamily:MONO, fontSize:9, color:STATUS_COLORS[k]||'#60a5fa', background:`${STATUS_COLORS[k]||'#60a5fa'}15`, padding:'2px 7px', borderRadius:99 }}>
                            {(STATUS_LABELS[k]||k).split(' ')[0]} {fmtSecs(v)}
                          </span>
                        ))}
                        <span style={{ fontFamily:MONO, fontSize:11, color:'#60a5fa', marginLeft:6 }}>{fmtSecs(d.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
