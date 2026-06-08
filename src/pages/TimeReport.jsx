import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Zap, Flame, Clock, Calendar, TrendingUp } from 'lucide-react'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

const STATUS_COLORS = {
  not_ready: '#ff6b6b',
  working:   '#4edea3',
  break:     '#ffb347',
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
const STATUS_GRADIENTS = {
  not_ready: 'linear-gradient(135deg,#ff6b6b,#ff4757)',
  working:   'linear-gradient(135deg,#4edea3,#00d2aa)',
  break:     'linear-gradient(135deg,#ffb347,#ff9500)',
  meeting:   'linear-gradient(135deg,#f472b6,#ec4899)',
  research:  'linear-gradient(135deg,#60a5fa,#3b82f6)',
  clerical:  'linear-gradient(135deg,#fbbf24,#f59e0b)',
  coaching:  'linear-gradient(135deg,#a78bfa,#8b5cf6)',
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
    const now = Date.now(), t = {}
    for (const e of (d.log||[])) { const s=Math.floor(((e.end||now)-e.start)/1000); t[e.status]=(t[e.status]||0)+s }
    const total = d.shiftStart ? Math.floor((now - d.shiftStart)/1000) : 0
    return { statuses: t, total, shiftStart: d.shiftStart, live: d.status !== null }
  } catch { return null }
}
function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate()-i); days.push(d.toDateString()) }
  return days
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'rgba(5,8,20,0.97)', border:'1px solid rgba(96,165,250,0.25)', padding:'12px 16px', fontFamily:MONO, borderRadius:8, boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
      <p style={{ fontSize:10, color:'#60a5fa', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</p>
      {payload.map(p => p.value > 0 && (
        <div key={p.name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:STATUS_COLORS[p.name]||'#60a5fa' }}/>
          <p style={{ fontSize:11, color: STATUS_COLORS[p.name]||'#c8d8f0' }}>
            {STATUS_LABELS[p.name]||p.name}: {fmtSecs(p.value)}
          </p>
        </div>
      ))}
    </div>
  )
}

function GlowCard({ children, color = '#60a5fa', style = {} }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}08 0%, rgba(5,8,20,0.9) 100%)`,
      border: `1px solid ${color}30`,
      borderRadius: 16,
      boxShadow: `0 0 32px ${color}12, inset 0 1px 0 ${color}15`,
      backdropFilter: 'blur(12px)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function StatBar({ label, secs, total, color, gradient }) {
  const pct = total > 0 ? Math.min(100, (secs/total)*100) : 0
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}` }}/>
          <span style={{ fontSize:13, fontWeight:500, color:'#c8d8f0', fontFamily:SANS }}>{label}</span>
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <span style={{ fontFamily:MONO, fontSize:10, color:`${color}99` }}>{Math.round(pct)}%</span>
          <span style={{ fontFamily:MONO, fontSize:12, fontWeight:700, color }}>{fmtSecs(secs)}</span>
        </div>
      </div>
      <div style={{ height:6, background:'rgba(255,255,255,0.04)', borderRadius:99, overflow:'hidden' }}>
        <div style={{
          height:'100%', borderRadius:99,
          background: gradient || color,
          width:`${pct}%`,
          boxShadow:`0 0 12px ${color}80`,
          transition:'width 0.8s cubic-bezier(0.34,1.2,0.64,1)',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)', animation:'shimmer 2s infinite' }}/>
        </div>
      </div>
    </div>
  )
}

export default function TimeReport() {
  const [activeTab, setActiveTab] = useState('today')
  const history  = useMemo(() => loadHistory(), [])
  const todayData = useMemo(() => loadToday(), [])
  const today    = new Date().toDateString()

  const allData = useMemo(() => {
    const hist = [...history]
    if (todayData) {
      const idx = hist.findIndex(h => h.date === today)
      const record = { date:today, ...todayData }
      if (idx>=0) hist[idx]=record; else hist.unshift(record)
    }
    return hist
  }, [history, todayData])

  const weekDays = getLast7Days()
  const weekData = weekDays.map(date => {
    const d = allData.find(h => h.date === date)
    const label = new Date(date).toLocaleDateString('en',{weekday:'short'})
    if (!d) return { date:label, total:0 }
    return { date:label, total:d.total, ...d.statuses }
  })

  const overallTotals = useMemo(() => {
    const t = {}; let grand = 0
    for (const d of allData) for (const [k,v] of Object.entries(d.statuses||{})) { t[k]=(t[k]||0)+v; grand+=v }
    return { statuses:t, total:grand }
  }, [allData])

  const todayStatuses = todayData?.statuses || {}
  const todayTotal    = todayData?.total    || 0
  const statusKeys    = Object.keys(STATUS_LABELS)

  const TABS = [
    { key:'today',   label:'Today',    icon:Zap },
    { key:'weekly',  label:'Weekly',   icon:Calendar },
    { key:'alltime', label:'All Time', icon:TrendingUp },
  ]

  return (
    <div style={{ fontFamily:SANS, maxWidth:860, margin:'0 auto', position:'relative' }}>

      {/* Background orbs */}
      <div style={{ position:'fixed', top:'10%', right:'-5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(96,165,250,0.06) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'fixed', bottom:'15%', left:'-8%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(78,222,163,0.05) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 }}/>

      <div style={{ position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#60a5fa20,#4edea315)', border:'1px solid rgba(96,165,250,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Clock size={14} style={{ color:'#60a5fa' }}/>
            </div>
            <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.14em', color:'rgba(96,165,250,0.6)', textTransform:'uppercase' }}>
              Engage Tracker
            </p>
          </div>
          <h1 style={{ fontSize:30, fontWeight:800, letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:8, background:'linear-gradient(135deg,#e2e8f0 0%,#60a5fa 50%,#4edea3 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Time Report
          </h1>
          <p style={{ fontSize:13, color:'#4a6a8a', lineHeight:1.5 }}>
            Your activity, patterns, and how your time is really spent.
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', gap:4, marginBottom:28, background:'rgba(5,8,20,0.6)', border:'1px solid rgba(96,165,250,0.12)', borderRadius:12, padding:4 }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7,
              padding:'9px 0', border:'none', borderRadius:9, cursor:'pointer', transition:'all 0.2s',
              background: activeTab===key ? 'linear-gradient(135deg,rgba(96,165,250,0.18),rgba(78,222,163,0.12))' : 'transparent',
              color: activeTab===key ? '#60a5fa' : '#2a4060',
              fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:'0.06em',
              boxShadow: activeTab===key ? '0 2px 12px rgba(96,165,250,0.15),inset 0 1px 0 rgba(96,165,250,0.15)' : 'none',
            }}>
              <Icon size={12}/>{label}
            </button>
          ))}
        </div>

        {/* ── TODAY ── */}
        {activeTab === 'today' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {!todayData ? (
              <GlowCard color="#60a5fa" style={{ padding:'48px 32px', textAlign:'center' }}>
                <Zap size={28} style={{ color:'#60a5fa', margin:'0 auto 16px', opacity:0.4 }}/>
                <p style={{ fontFamily:MONO, fontSize:11, color:'#2a4a70', letterSpacing:'0.08em' }}>Clock in to start tracking today.</p>
              </GlowCard>
            ) : (
              <>
                {/* Top stat cards */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <GlowCard color="#4edea3" style={{ padding:'22px 24px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                      <Flame size={13} style={{ color:'#4edea3' }}/>
                      <p style={{ fontFamily:MONO, fontSize:9, color:'rgba(78,222,163,0.6)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Total today</p>
                      {todayData.live && <span style={{ fontFamily:MONO, fontSize:8, color:'#4edea3', background:'rgba(78,222,163,0.12)', padding:'2px 7px', borderRadius:99, border:'1px solid rgba(78,222,163,0.3)' }}>● LIVE</span>}
                    </div>
                    <p style={{ fontFamily:MONO, fontSize:32, fontWeight:800, letterSpacing:'-0.05em', background:'linear-gradient(135deg,#4edea3,#00d2aa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                      {fmtSecs(todayTotal)}
                    </p>
                  </GlowCard>
                  <GlowCard color="#60a5fa" style={{ padding:'22px 24px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                      <Clock size={13} style={{ color:'#60a5fa' }}/>
                      <p style={{ fontFamily:MONO, fontSize:9, color:'rgba(96,165,250,0.6)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Started at</p>
                    </div>
                    <p style={{ fontFamily:MONO, fontSize:28, fontWeight:800, letterSpacing:'-0.04em', background:'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                      {todayData.shiftStart ? new Date(todayData.shiftStart).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'}) : '—'}
                    </p>
                    <p style={{ fontFamily:MONO, fontSize:9, color:'#2a4060', marginTop:6 }}>
                      {new Date().toLocaleDateString('en',{weekday:'long',month:'short',day:'numeric'})}
                    </p>
                  </GlowCard>
                </div>

                {/* Status breakdown */}
                <GlowCard color="#a78bfa" style={{ padding:'24px 26px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22 }}>
                    <div style={{ width:3, height:18, borderRadius:99, background:'linear-gradient(180deg,#a78bfa,#60a5fa)' }}/>
                    <p style={{ fontFamily:MONO, fontSize:10, color:'rgba(167,139,250,0.7)', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700 }}>How you spent today</p>
                  </div>
                  {statusKeys.map(key => {
                    const secs = todayStatuses[key]||0; if(!secs) return null
                    return <StatBar key={key} label={STATUS_LABELS[key]} secs={secs} total={todayTotal} color={STATUS_COLORS[key]} gradient={STATUS_GRADIENTS[key]} />
                  })}
                  {Object.entries(todayStatuses).filter(([k])=>!statusKeys.includes(k)).map(([key,secs])=>(
                    <StatBar key={key} label={key} secs={secs} total={todayTotal} color="#60a5fa" gradient="linear-gradient(135deg,#60a5fa,#3b82f6)"/>
                  ))}
                </GlowCard>
              </>
            )}
          </div>
        )}

        {/* ── WEEKLY ── */}
        {activeTab === 'weekly' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Bar chart */}
            <GlowCard color="#f472b6" style={{ padding:'24px 26px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22 }}>
                <div style={{ width:3, height:18, borderRadius:99, background:'linear-gradient(180deg,#f472b6,#a78bfa)' }}/>
                <p style={{ fontFamily:MONO, fontSize:10, color:'rgba(244,114,182,0.7)', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700 }}>Hours — last 7 days</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weekData} barSize={32} margin={{ top:4, right:8, left:-16, bottom:0 }}>
                  <XAxis dataKey="date" tick={{ fontFamily:MONO, fontSize:10, fill:'#2a4a70' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v=>fmtSecsShort(v)} tick={{ fontFamily:MONO, fontSize:9, fill:'#2a4a70' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip/>} cursor={{ fill:'rgba(96,165,250,0.05)', radius:8 }} />
                  {statusKeys.map(key => (
                    <Bar key={key} dataKey={key} stackId="a" fill={STATUS_COLORS[key]} opacity={0.85} radius={key==='coaching'?[6,6,0,0]:[0,0,0,0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </GlowCard>

            {/* Day cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8 }}>
              {weekData.map((d,i) => {
                const isToday = i===6
                const color = d.total>0 ? '#60a5fa' : '#1a2a3a'
                return (
                  <div key={d.date} style={{
                    background: isToday ? 'linear-gradient(135deg,rgba(96,165,250,0.15),rgba(78,222,163,0.08))' : 'rgba(5,8,20,0.7)',
                    border: `1px solid ${isToday ? 'rgba(96,165,250,0.35)' : 'rgba(96,165,250,0.08)'}`,
                    borderRadius:10, padding:'12px 8px', textAlign:'center',
                    boxShadow: isToday ? '0 0 20px rgba(96,165,250,0.12)' : 'none',
                  }}>
                    <p style={{ fontFamily:MONO, fontSize:9, color: isToday?'#60a5fa':'#2a4060', marginBottom:6, fontWeight: isToday?700:400 }}>{d.date}</p>
                    <p style={{ fontFamily:MONO, fontSize:13, fontWeight:700, color }}>{d.total>0?fmtSecs(d.total):'—'}</p>
                  </div>
                )
              })}
            </div>

            {/* Weekly status summary */}
            <GlowCard color="#fbbf24" style={{ padding:'24px 26px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22 }}>
                <div style={{ width:3, height:18, borderRadius:99, background:'linear-gradient(180deg,#fbbf24,#ffb347)' }}/>
                <p style={{ fontFamily:MONO, fontSize:10, color:'rgba(251,191,36,0.7)', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700 }}>This week by status</p>
              </div>
              {(() => {
                const wt = {}; let wg = 0
                for (const d of weekData) for (const [k,v] of Object.entries(d)) { if(k==='date'||k==='total') continue; wt[k]=(wt[k]||0)+v; wg+=v }
                return statusKeys.map(key => {
                  const secs = wt[key]||0; if(!secs) return null
                  return <StatBar key={key} label={STATUS_LABELS[key]} secs={secs} total={wg} color={STATUS_COLORS[key]} gradient={STATUS_GRADIENTS[key]}/>
                })
              })()}
            </GlowCard>
          </div>
        )}

        {/* ── ALL TIME ── */}
        {activeTab === 'alltime' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {allData.length === 0 ? (
              <GlowCard color="#a78bfa" style={{ padding:'48px 32px', textAlign:'center' }}>
                <TrendingUp size={28} style={{ color:'#a78bfa', margin:'0 auto 16px', opacity:0.4 }}/>
                <p style={{ fontFamily:MONO, fontSize:11, color:'#2a4060', letterSpacing:'0.08em' }}>No history yet — start tracking.</p>
              </GlowCard>
            ) : (
              <>
                {/* Big stat cards */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                  {[
                    { label:'Total tracked', value:fmtSecs(overallTotals.total), color:'#60a5fa', gradient:'linear-gradient(135deg,#60a5fa,#3b82f6)' },
                    { label:'Days tracked',  value:allData.length,               color:'#4edea3', gradient:'linear-gradient(135deg,#4edea3,#00d2aa)' },
                    { label:'Avg per day',   value:allData.length>0?fmtSecs(Math.floor(overallTotals.total/allData.length)):'—', color:'#a78bfa', gradient:'linear-gradient(135deg,#a78bfa,#8b5cf6)' },
                  ].map(({ label, value, color, gradient }) => (
                    <GlowCard key={label} color={color} style={{ padding:'22px 24px' }}>
                      <p style={{ fontFamily:MONO, fontSize:9, color:`${color}70`, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>{label}</p>
                      <p style={{ fontFamily:MONO, fontSize:26, fontWeight:800, letterSpacing:'-0.04em', background:gradient, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{value}</p>
                    </GlowCard>
                  ))}
                </div>

                {/* All-time distribution */}
                <GlowCard color="#4edea3" style={{ padding:'24px 26px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22 }}>
                    <div style={{ width:3, height:18, borderRadius:99, background:'linear-gradient(180deg,#4edea3,#60a5fa)' }}/>
                    <p style={{ fontFamily:MONO, fontSize:10, color:'rgba(78,222,163,0.7)', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700 }}>All-time distribution</p>
                  </div>
                  {statusKeys.map(key => {
                    const secs = overallTotals.statuses[key]||0; if(!secs) return null
                    return <StatBar key={key} label={STATUS_LABELS[key]} secs={secs} total={overallTotals.total} color={STATUS_COLORS[key]} gradient={STATUS_GRADIENTS[key]}/>
                  })}
                </GlowCard>

                {/* History log */}
                <GlowCard color="#f472b6" style={{ padding:'24px 26px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
                    <div style={{ width:3, height:18, borderRadius:99, background:'linear-gradient(180deg,#f472b6,#fbbf24)' }}/>
                    <p style={{ fontFamily:MONO, fontSize:10, color:'rgba(244,114,182,0.7)', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700 }}>History</p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                    {allData.map((d,i) => (
                      <div key={d.date} style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'12px 0',
                        borderBottom: i<allData.length-1 ? '1px solid rgba(96,165,250,0.06)' : 'none',
                      }}>
                        <span style={{ fontSize:12, fontWeight:500, color:'#a8c4e0', minWidth:130 }}>
                          {new Date(d.date).toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})}
                        </span>
                        <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap', flex:1, justifyContent:'flex-end' }}>
                          {Object.entries(d.statuses||{}).map(([k,v]) => v>0 && (
                            <span key={k} style={{
                              fontFamily:MONO, fontSize:9, color:STATUS_COLORS[k]||'#60a5fa',
                              background:`${STATUS_COLORS[k]||'#60a5fa'}15`,
                              padding:'3px 8px', borderRadius:99,
                              border:`1px solid ${STATUS_COLORS[k]||'#60a5fa'}30`,
                            }}>
                              {(STATUS_LABELS[k]||k).split(' ')[0]} {fmtSecs(v)}
                            </span>
                          ))}
                          <span style={{ fontFamily:MONO, fontSize:12, fontWeight:700, color:'#60a5fa', marginLeft:8 }}>{fmtSecs(d.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlowCard>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}
