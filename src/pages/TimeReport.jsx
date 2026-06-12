import { useMemo, useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const MONO = '"Geist Mono", "JetBrains Mono", "Fira Code", monospace'
const DISPLAY = '"Inter", "SF Pro Display", -apple-system, sans-serif'

const S = {
  working:   { label:'Working',   color:'#00ffb3', dim:'rgba(0,255,179,0.12)' },
  break:     { label:'Break',     color:'#ff9500', dim:'rgba(255,149,0,0.12)' },
  meeting:   { label:'Meeting',   color:'#ff2d78', dim:'rgba(255,45,120,0.12)' },
  research:  { label:'Research',  color:'#00d4ff', dim:'rgba(0,212,255,0.12)' },
  clerical:  { label:'Clerical',  color:'#ffe600', dim:'rgba(255,230,0,0.12)' },
  coaching:  { label:'Coaching',  color:'#bf5af2', dim:'rgba(191,90,242,0.12)' },
  not_ready: { label:'Not Ready', color:'#ff453a', dim:'rgba(255,69,58,0.12)'  },
}

function fmtSecs(s) {
  if (!s || s<=0) return '0m'
  const h=Math.floor(s/3600), m=Math.floor((s%3600)/60)
  return h>0 ? `${h}h ${String(m).padStart(2,'0')}m` : `${m}m`
}
function fmtSecsShort(s) {
  const h=Math.floor(s/3600)
  return h>0 ? `${h}h` : `${Math.floor(s/60)}m`
}
function loadHistory() {
  try { return JSON.parse(localStorage.getItem('trackr_history')||'[]') } catch { return [] }
}
function loadToday() {
  try {
    const d=JSON.parse(localStorage.getItem('trackr_engage_v2')||'{}')
    if (d.date!==new Date().toDateString()) return null
    const now=Date.now(), t={}
    for (const e of (d.log||[])) { const s=Math.floor(((e.end||now)-e.start)/1000); t[e.status]=(t[e.status]||0)+s }
    let fallbackTotal = 0
    for (const e of (d.log||[])) { if (e.end) fallbackTotal += Math.floor((e.end - e.start) / 1000) }
    const total = d.shiftStart ? Math.floor((now - d.shiftStart) / 1000) : fallbackTotal
    return { statuses:t, total, shiftStart:d.shiftStart, live:d.status!==null, currentStatus:d.status }
  } catch { return null }
}
function getLast7() {
  return Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return d.toDateString() })
}

const TT = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div style={{background:'#020408',border:'1px solid rgba(0,212,255,0.2)',padding:'10px 14px',fontFamily:MONO,boxShadow:'0 8px 32px rgba(0,0,0,0.8)'}}>
      <p style={{fontSize:9,color:'#00d4ff',marginBottom:8,letterSpacing:'0.12em',textTransform:'uppercase'}}>{label}</p>
      {payload.map(p=>p.value>0&&(
        <div key={p.name} style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
          <div style={{width:5,height:5,background:S[p.name]?.color||'#00d4ff'}}/>
          <span style={{fontSize:10,color:S[p.name]?.color||'#c8d8f0'}}>{S[p.name]?.label||p.name} · {fmtSecs(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function TimeReport() {
  const [tab, setTab]   = useState('today')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'timereport-bg'
    style.textContent = 'html,body{background:#020408!important}.min-h-screen{background:#020408!important}'
    document.head.appendChild(style)
    return () => document.getElementById('timereport-bg')?.remove()
  }, [])
  const history   = useMemo(()=>loadHistory(),[])
  const today     = new Date().toDateString()
  const todayData = useMemo(()=>loadToday(),[tick])

  useEffect(()=>{
    const t=setInterval(()=>setTick(x=>x+1),1000)
    return ()=>clearInterval(t)
  },[])

  const allData = useMemo(()=>{
    const hist=[...history]
    if (todayData) { const i=hist.findIndex(h=>h.date===today); const r={date:today,...todayData}; i>=0?hist.splice(i,1,r):hist.unshift(r) }
    return hist
  },[history,todayData,tick])

  const weekDays = getLast7()
  const weekData = weekDays.map(date=>{
    const d=allData.find(h=>h.date===date)
    return { date:new Date(date).toLocaleDateString('en',{weekday:'short'}), total:d?.total||0, ...(d?.statuses||{}) }
  })

  const overall = useMemo(()=>{
    const t={};let g=0
    for (const d of allData) for (const [k,v] of Object.entries(d.statuses||{})) { t[k]=(t[k]||0)+v; g+=v }
    return {s:t,total:g}
  },[allData])

  const TD   = todayData?.statuses||{}
  const TTOT = todayData?.total||0
  const keys = Object.keys(S)

  const topStatus = TTOT>0 ? keys.reduce((a,b)=>(TD[a]||0)>(TD[b]||0)?a:b) : null

  // ── shared pieces ────────────────────────────────────────────

  const Row = ({k, secs, total}) => {
    const def = S[k]||{label:k,color:'#00d4ff',dim:'rgba(0,212,255,0.1)'}
    const pct = total>0 ? Math.min(100,(secs/total)*100) : 0
    return (
      <div style={{display:'flex',alignItems:'center',gap:0,marginBottom:2}}>
        <div style={{width:3,alignSelf:'stretch',background:def.color,opacity:0.9,flexShrink:0}}/>
        <div style={{flex:1,background:def.dim,padding:'10px 16px',display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontFamily:MONO,fontSize:10,color:def.color,letterSpacing:'0.06em',textTransform:'uppercase',width:80,flexShrink:0}}>{def.label}</span>
          <div style={{flex:1,height:3,background:'rgba(255,255,255,0.05)'}}>
            <div style={{height:'100%',background:def.color,width:`${pct}%`,boxShadow:`0 0 8px ${def.color}`,transition:'width 1s ease'}}/>
          </div>
          <span style={{fontFamily:MONO,fontSize:11,color:def.color,fontWeight:700,minWidth:52,textAlign:'right'}}>{fmtSecs(secs)}</span>
          <span style={{fontFamily:MONO,fontSize:9,color:`${def.color}60`,minWidth:28,textAlign:'right'}}>{Math.round(pct)}%</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{fontFamily:DISPLAY,background:'#020408',minHeight:'100vh',position:'relative',left:'50%',transform:'translateX(-50%)',width:'100vw',marginTop:'-24px',marginBottom:'-24px',padding:'0 0 80px'}}>

      {/* ── TOP STRIP ───────────────────────────────────────── */}
      <div style={{borderBottom:'1px solid rgba(0,212,255,0.1)',padding:'14px 32px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontFamily:MONO,fontSize:9,letterSpacing:'0.22em',color:'rgba(0,212,255,0.4)',textTransform:'uppercase'}}>ENGAGE · TRACKER</span>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          {todayData?.live && (
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:5,height:5,background:'#00ffb3',boxShadow:'0 0 8px #00ffb3',animation:'pulse 1.5s ease-in-out infinite'}}/>
              <span style={{fontFamily:MONO,fontSize:8,color:'#00ffb3',letterSpacing:'0.14em'}}>LIVE</span>
            </div>
          )}
          <span style={{fontFamily:MONO,fontSize:9,letterSpacing:'0.16em',color:'rgba(0,212,255,0.35)',textTransform:'uppercase'}}>
            {new Date().toLocaleDateString('en',{weekday:'long',month:'short',day:'numeric'})}
          </span>
        </div>
      </div>

      {/* ── HERO ────────────────────────────────────────────── */}
      <div style={{padding:'40px 32px 0',display:'grid',gridTemplateColumns:'1fr auto',alignItems:'end',gap:24,marginBottom:0}}>
        <div>
          <p style={{fontFamily:MONO,fontSize:9,letterSpacing:'0.22em',color:'rgba(255,255,255,0.2)',textTransform:'uppercase',marginBottom:16}}>TIME REPORT</p>
          <div style={{display:'flex',alignItems:'baseline',gap:16,flexWrap:'wrap'}}>
            <span style={{
              fontFamily:MONO, fontWeight:900, lineHeight:0.9,
              fontSize:'clamp(52px,8vw,88px)',
              letterSpacing:'-0.04em',
              background:'linear-gradient(135deg,#e8f4fd 0%,#00d4ff 60%,#00ffb3 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            }}>
              {TTOT>0 ? fmtSecs(TTOT) : '——'}
            </span>
            <div style={{paddingBottom:8}}>
              <p style={{fontFamily:MONO,fontSize:9,color:'rgba(255,255,255,0.2)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:4}}>TODAY</p>
              {topStatus && (
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:6,height:6,background:S[topStatus]?.color}}/>
                  <span style={{fontFamily:MONO,fontSize:10,color:S[topStatus]?.color,letterSpacing:'0.06em'}}>
                    {S[topStatus]?.label} · {fmtSecs(TD[topStatus]||0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick status pills */}
        <div style={{display:'flex',flexDirection:'column',gap:3,paddingBottom:4}}>
          {keys.filter(k=>(TD[k]||0)>0).slice(0,4).map(k=>(
            <div key={k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,padding:'5px 12px',background:S[k].dim,border:`1px solid ${S[k].color}25`}}>
              <span style={{fontFamily:MONO,fontSize:9,color:S[k].color,letterSpacing:'0.08em',textTransform:'uppercase'}}>{S[k].label}</span>
              <span style={{fontFamily:MONO,fontSize:9,color:`${S[k].color}80`}}>{fmtSecs(TD[k]||0)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────── */}
      <div style={{display:'flex',alignItems:'center',gap:0,padding:'32px 32px 0',marginBottom:0}}>
        {[['today','TODAY'],['weekly','WEEKLY'],['alltime','ALL TIME']].map(([k,l],i)=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding:'10px 22px', border:'none', cursor:'pointer', fontFamily:MONO,
            fontSize:10, fontWeight:700, letterSpacing:'0.14em',
            background:'transparent',
            color: tab===k ? '#00d4ff' : 'rgba(255,255,255,0.18)',
            borderBottom: tab===k ? '2px solid #00d4ff' : '2px solid transparent',
            borderRight: i<2 ? '1px solid rgba(0,212,255,0.1)' : 'none',
            transition:'all 0.15s',
          }}>{l}</button>
        ))}
        <div style={{flex:1,height:1,background:'linear-gradient(90deg,rgba(0,212,255,0.15),transparent)',marginLeft:8}}/>
      </div>

      <div style={{padding:'24px 32px 0'}}>

        {/* ── TODAY ───────────────────────────────────────── */}
        {tab==='today' && (
          <div>
            {!todayData ? (
              <div style={{padding:'60px 0',textAlign:'center'}}>
                <p style={{fontFamily:MONO,fontSize:11,color:'rgba(255,255,255,0.15)',letterSpacing:'0.14em',textTransform:'uppercase'}}>
                  NO SHIFT STARTED · OPEN ENGAGE TO CLOCK IN
                </p>
              </div>
            ) : (
              <>
                {/* top row */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,marginBottom:2}}>
                  {[
                    {l:'TOTAL TIME',    v:fmtSecs(TTOT),  c:'#00d4ff'},
                    {l:'SHIFT START',   v:todayData.shiftStart?new Date(todayData.shiftStart).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'}):'—', c:'#00ffb3'},
                    {l:'STATUS',        v:todayData.currentStatus?S[todayData.currentStatus]?.label||'—':'Off', c:todayData.currentStatus?S[todayData.currentStatus]?.color:'rgba(255,255,255,0.3)'},
                  ].map(({l,v,c})=>(
                    <div key={l} style={{background:'rgba(255,255,255,0.02)',border:`1px solid ${c}18`,borderTop:`2px solid ${c}`,padding:'18px 20px'}}>
                      <p style={{fontFamily:MONO,fontSize:8,color:`${c}60`,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:10}}>{l}</p>
                      <p style={{fontFamily:MONO,fontSize:22,fontWeight:800,color:c,letterSpacing:'-0.02em'}}>{v}</p>
                    </div>
                  ))}
                </div>

                {/* breakdown */}
                <div style={{background:'rgba(255,255,255,0.01)',border:'1px solid rgba(255,255,255,0.05)',padding:'20px 20px 16px',marginBottom:2}}>
                  <p style={{fontFamily:MONO,fontSize:8,color:'rgba(255,255,255,0.2)',letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:14}}>BREAKDOWN</p>
                  {keys.map(k=>{ const s=TD[k]||0; if(!s) return null; return <Row key={k} k={k} secs={s} total={TTOT}/> })}
                  {Object.entries(TD).filter(([k])=>!keys.includes(k)).map(([k,s])=><Row key={k} k={k} secs={s} total={TTOT}/>)}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── WEEKLY ──────────────────────────────────────── */}
        {tab==='weekly' && (
          <div>
            {/* chart */}
            <div style={{background:'rgba(255,255,255,0.01)',border:'1px solid rgba(255,255,255,0.05)',padding:'20px 20px 8px',marginBottom:2}}>
              <p style={{fontFamily:MONO,fontSize:8,color:'rgba(255,255,255,0.2)',letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:18}}>LAST 7 DAYS</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weekData} barSize={30} margin={{top:0,right:0,left:-20,bottom:0}}>
                  <XAxis dataKey="date" tick={{fontFamily:MONO,fontSize:9,fill:'rgba(255,255,255,0.25)'}} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={v=>fmtSecsShort(v)} tick={{fontFamily:MONO,fontSize:8,fill:'rgba(255,255,255,0.2)'}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<TT/>} cursor={{fill:'rgba(0,212,255,0.04)'}}/>
                  {keys.map(k=><Bar key={k} dataKey={k} stackId="a" fill={S[k].color} opacity={0.85} radius={k==='coaching'?[4,4,0,0]:[0,0,0,0]}/>)}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* day grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:2}}>
              {weekData.map((d,i)=>{
                const isToday=i===6
                const c=d.total>0?'#00d4ff':'rgba(255,255,255,0.08)'
                return (
                  <div key={d.date} style={{
                    background: isToday?'rgba(0,212,255,0.06)':'rgba(255,255,255,0.01)',
                    border:`1px solid ${isToday?'rgba(0,212,255,0.25)':'rgba(255,255,255,0.05)'}`,
                    borderTop:`2px solid ${isToday?'#00d4ff':'transparent'}`,
                    padding:'12px 10px',textAlign:'center',
                  }}>
                    <p style={{fontFamily:MONO,fontSize:8,color:isToday?'#00d4ff':'rgba(255,255,255,0.2)',marginBottom:6,letterSpacing:'0.1em'}}>{d.date}</p>
                    <p style={{fontFamily:MONO,fontSize:12,fontWeight:700,color:c}}>{d.total>0?fmtSecs(d.total):'—'}</p>
                  </div>
                )
              })}
            </div>

            {/* weekly status breakdown */}
            <div style={{background:'rgba(255,255,255,0.01)',border:'1px solid rgba(255,255,255,0.05)',padding:'20px 20px 16px'}}>
              <p style={{fontFamily:MONO,fontSize:8,color:'rgba(255,255,255,0.2)',letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:14}}>THIS WEEK BY STATUS</p>
              {(()=>{
                const wt={};let wg=0
                for (const d of weekData) for (const [k,v] of Object.entries(d)) { if(k==='date'||k==='total') continue; wt[k]=(wt[k]||0)+v; wg+=v }
                return keys.map(k=>{ const s=wt[k]||0; if(!s) return null; return <Row key={k} k={k} secs={s} total={wg}/> })
              })()}
            </div>
          </div>
        )}

        {/* ── ALL TIME ────────────────────────────────────── */}
        {tab==='alltime' && (
          <div>
            {allData.length===0 ? (
              <div style={{padding:'60px 0',textAlign:'center'}}>
                <p style={{fontFamily:MONO,fontSize:11,color:'rgba(255,255,255,0.15)',letterSpacing:'0.14em',textTransform:'uppercase'}}>NO HISTORY YET</p>
              </div>
            ) : (
              <>
                {/* stats row */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,marginBottom:2}}>
                  {[
                    {l:'TOTAL TRACKED', v:fmtSecs(overall.total),                                                     c:'#00d4ff'},
                    {l:'DAYS LOGGED',   v:allData.length,                                                              c:'#00ffb3'},
                    {l:'AVG / DAY',     v:allData.length>0?fmtSecs(Math.floor(overall.total/allData.length)):'—',     c:'#bf5af2'},
                  ].map(({l,v,c})=>(
                    <div key={l} style={{background:'rgba(255,255,255,0.02)',border:`1px solid ${c}18`,borderTop:`2px solid ${c}`,padding:'18px 20px'}}>
                      <p style={{fontFamily:MONO,fontSize:8,color:`${c}60`,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:10}}>{l}</p>
                      <p style={{fontFamily:MONO,fontSize:22,fontWeight:800,color:c,letterSpacing:'-0.02em'}}>{v}</p>
                    </div>
                  ))}
                </div>

                {/* distribution */}
                <div style={{background:'rgba(255,255,255,0.01)',border:'1px solid rgba(255,255,255,0.05)',padding:'20px 20px 16px',marginBottom:2}}>
                  <p style={{fontFamily:MONO,fontSize:8,color:'rgba(255,255,255,0.2)',letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:14}}>ALL-TIME DISTRIBUTION</p>
                  {keys.map(k=>{ const s=overall.s[k]||0; if(!s) return null; return <Row key={k} k={k} secs={s} total={overall.total}/> })}
                </div>

                {/* history log */}
                <div style={{background:'rgba(255,255,255,0.01)',border:'1px solid rgba(255,255,255,0.05)',padding:'20px 20px 8px'}}>
                  <p style={{fontFamily:MONO,fontSize:8,color:'rgba(255,255,255,0.2)',letterSpacing:'0.18em',textTransform:'uppercase',marginBottom:14}}>HISTORY LOG</p>
                  {allData.map((d,i)=>(
                    <div key={d.date} style={{
                      display:'flex',alignItems:'center',justifyContent:'space-between',
                      padding:'10px 0',
                      borderBottom:i<allData.length-1?'1px solid rgba(255,255,255,0.04)':'none',
                    }}>
                      <span style={{fontFamily:MONO,fontSize:10,color:'rgba(255,255,255,0.35)',minWidth:140,letterSpacing:'0.04em'}}>
                        {new Date(d.date).toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})}
                      </span>
                      <div style={{display:'flex',gap:6,flex:1,justifyContent:'center',flexWrap:'wrap'}}>
                        {Object.entries(d.statuses||{}).map(([k,v])=>v>0&&(
                          <span key={k} style={{
                            fontFamily:MONO,fontSize:8,color:S[k]?.color||'#00d4ff',
                            background:`${S[k]?.color||'#00d4ff'}12`,
                            padding:'2px 8px',
                            border:`1px solid ${S[k]?.color||'#00d4ff'}25`,
                            letterSpacing:'0.06em',textTransform:'uppercase',
                          }}>
                            {(S[k]?.label||k).split(' ')[0]} {fmtSecs(v)}
                          </span>
                        ))}
                      </div>
                      <span style={{fontFamily:MONO,fontSize:12,fontWeight:700,color:'#00d4ff',minWidth:52,textAlign:'right'}}>{fmtSecs(d.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; box-shadow:0 0 8px #00ffb3; }
          50%      { opacity:0.4; box-shadow:0 0 3px #00ffb3; }
        }
      `}</style>
    </div>
  )
}
