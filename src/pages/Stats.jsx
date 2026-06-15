import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { format, parseISO, subWeeks, startOfWeek, endOfWeek,
  isWithinInterval, differenceInDays, subDays, startOfDay } from 'date-fns'
import { useApplications } from '../contexts/ApplicationContext'
import { useNavigate } from 'react-router-dom'
import { Lock, TrendingUp, Zap, Target, Clock, AlertTriangle, Flame, Plus } from 'lucide-react'

const MONO = 'Consolas, Menlo, Monaco, monospace'
const SANS = 'Geist, Inter, sans-serif'

const SC = {
  wishlist:  '#8a919f',
  applied:   '#a3c9ff',
  interview: '#ffb689',
  offer:     '#4edea3',
  rejected:  '#ffb4ab',
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#060c18', border:'0.5px solid rgba(163,201,255,0.15)', padding:'8px 12px', fontFamily:MONO, boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
      <p style={{ fontSize:9, color:'rgba(163,201,255,0.4)', letterSpacing:'0.08em', marginBottom:4 }}>{label}</p>
      <p style={{ fontSize:18, fontWeight:800, letterSpacing:'-0.04em', background:`linear-gradient(135deg,#fff,${payload[0].color||'#a3c9ff'})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{payload[0].value}</p>
    </div>
  )
}

function GradNum({ value, color, size = 36 }) {
  const empty = !value || value === 0 || value === '0' || value === '0%'
  const str = empty ? '' : String(value)
  const hasPercent = str.endsWith('%')
  const numPart = hasPercent ? str.slice(0, -1) : str
  const gradStyle = {
    background: `linear-gradient(135deg,#fff 0%,${color} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: `drop-shadow(0 0 8px ${color}40)`,
  }
  if (empty) return (
    <span style={{ fontFamily:MONO, fontSize:size, fontWeight:800, color:'rgba(138,145,159,0.15)', lineHeight:1 }}>
      {typeof value === 'string' && value.includes('%') ? '—' : '0'}
    </span>
  )
  return (
    <span style={{ display:'inline-flex', alignItems:'baseline', gap:1, lineHeight:1 }}>
      <span style={{ fontFamily:MONO, fontSize:size, fontWeight:800, letterSpacing:'-0.06em', ...gradStyle }}>{numPart}</span>
      {hasPercent && <span style={{ fontFamily:MONO, fontSize:size*0.55, fontWeight:700, letterSpacing:'0', ...gradStyle }}>%</span>}
    </span>
  )
}

function LockedCard({ icon: Icon, label, desc, hint }) {
  const navigate = useNavigate()
  return (
    <div style={{
      background:'rgba(163,201,255,0.02)', border:'0.5px dashed rgba(163,201,255,0.08)',
      padding:'14px 16px', display:'flex', flexDirection:'column', gap:6, position:'relative',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <Icon size={11} style={{ color:'#3a4455' }} />
        <span style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.1em', color:'#2a3040', textTransform:'uppercase' }}>{label}</span>
        <span style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:4, fontFamily:MONO, fontSize:8, color:'#1e2a3a' }}>
          <Lock size={8} /> NEEDS DATA
        </span>
      </div>
      <p style={{ fontFamily:SANS, fontSize:11, color:'#1e2a3a', lineHeight:1.4 }}>{desc}</p>
      <button onClick={() => navigate('/board')} style={{
        display:'inline-flex', alignItems:'center', gap:4,
        fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase',
        color:'#3a4455', background:'none', border:'none', cursor:'pointer', padding:0, marginTop:2,
      }}>
        <Plus size={8} /> {hint}
      </button>
    </div>
  )
}

export default function Stats() {
  const { applications } = useApplications()

  // ── core counts ──────────────────────────────────────────
  const total      = applications.length
  const applied    = applications.filter(a => a.status !== 'wishlist').length
  const active     = applications.filter(a => ['applied','interview'].includes(a.status)).length
  const interviews = applications.filter(a => a.status === 'interview').length
  const offers     = applications.filter(a => a.status === 'offer').length
  const rejected   = applications.filter(a => a.status === 'rejected').length
  const wishlist   = applications.filter(a => a.status === 'wishlist').length
  const responded  = interviews + offers + rejected

  const responseRate = applied  > 0 ? Math.round((responded  / applied)  * 100) : 0
  const interviewRate = applied > 0 ? Math.round((interviews / applied)  * 100) : 0
  const offerRate    = interviews > 0 ? Math.round((offers / interviews) * 100) : 0

  // ── ghosting rate (applied > 14 days, no movement) ───────
  const ghosted = useMemo(() =>
    applications.filter(a => {
      if (a.status !== 'applied') return false
      if (!a.date_applied && !a.created_at) return false
      const d = parseISO(a.date_applied || a.created_at)
      return differenceInDays(new Date(), d) > 14
    }).length
  , [applications])

  const ghostRate = applied > 0 ? Math.round((ghosted / applied) * 100) : 0

  // ── weekly activity (8 weeks) ─────────────────────────────
  const activity = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => {
      const anchor = subWeeks(new Date(), 7 - i)
      const start  = startOfWeek(anchor, { weekStartsOn: 1 })
      const end    = endOfWeek(anchor,   { weekStartsOn: 1 })
      return {
        week: format(start, 'MMM d'),
        count: applications.filter(a => {
          const d = a.date_applied || a.created_at
          return d && isWithinInterval(parseISO(d), { start, end })
        }).length,
      }
    })
  , [applications])

  // ── velocity (avg apps/week last 4 weeks) ─────────────────
  const velocity = useMemo(() => {
    const last4 = activity.slice(-4)
    const sum = last4.reduce((acc, w) => acc + w.count, 0)
    return sum > 0 ? (sum / 4).toFixed(1) : '0'
  }, [activity])

  // ── peak day of week ──────────────────────────────────────
  const peakDay = useMemo(() => {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const counts = Array(7).fill(0)
    applications.forEach(a => {
      const d = a.date_applied || a.created_at
      if (d) counts[parseISO(d).getDay()]++
    })
    const max = Math.max(...counts)
    if (max === 0) return null
    return days[counts.indexOf(max)]
  }, [applications])

  // ── streak (consecutive weeks with ≥1 app) ───────────────
  const streak = useMemo(() => {
    let s = 0
    for (let i = 0; i < 8; i++) {
      const anchor = subWeeks(new Date(), i)
      const start  = startOfWeek(anchor, { weekStartsOn: 1 })
      const end    = endOfWeek(anchor,   { weekStartsOn: 1 })
      const has    = applications.some(a => {
        const d = a.date_applied || a.created_at
        return d && isWithinInterval(parseISO(d), { start, end })
      })
      if (has) s++; else break
    }
    return s
  }, [applications])

  // ── funnel data ───────────────────────────────────────────
  const funnel = [
    { label: 'Wishlist',  value: wishlist,   color: '#8a919f', pct: total  > 0 ? Math.round((wishlist   / total)  * 100) : 0 },
    { label: 'Applied',   value: applied,    color: '#a3c9ff', pct: total  > 0 ? Math.round((applied    / total)  * 100) : 0 },
    { label: 'Interview', value: interviews, color: '#ffb689', pct: applied > 0 ? Math.round((interviews / applied) * 100) : 0 },
    { label: 'Offer',     value: offers,     color: '#4edea3', pct: applied > 0 ? Math.round((offers     / applied) * 100) : 0 },
  ]

  // ── status pie ────────────────────────────────────────────
  const pieData = Object.keys(SC).map(s => ({
    name: s, value: applications.filter(a => a.status === s).length, color: SC[s],
  }))

  const hasData = total > 0

  return (
    <div style={{ fontFamily: SANS, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 1000 }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', paddingTop: 4 }}>
        <div>
          <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.14em', color:'rgba(163,201,255,0.4)', textTransform:'uppercase', marginBottom:4 }}>Analytics</p>
          <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.04em', color:'#e2e2e8', lineHeight:1 }}>Job Search Dashboard</h1>
        </div>
        <p style={{ fontFamily:MONO, fontSize:9, color:'#2a3040', letterSpacing:'0.06em' }}>
          {format(new Date(), 'MMM yyyy')}
        </p>
      </div>

      {/* ── KPI strip ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:2 }}>
        {[
          { label:'Total',       val: total,              raw: total,        color:'#e2e2e8' },
          { label:'Applied',     val: applied,            raw: applied,      color:'#a3c9ff' },
          { label:'Interviews',  val: interviews,         raw: interviews,   color:'#ffb689' },
          { label:'Offers',      val: offers,             raw: offers,       color:'#4edea3' },
          { label:'Response',    val:`${responseRate}%`,  raw: responseRate, color:'#ffb689' },
          { label:'Interview %', val:`${interviewRate}%`, raw: interviewRate,color:'#ffb4ab' },
        ].map(({ label, val, raw, color }, i) => (
          <div key={label} style={{
            background:'linear-gradient(160deg,#0d1f3c,#080f1e)',
            border:'0.5px solid rgba(163,201,255,0.06)',
            padding:'12px 14px', position:'relative', overflow:'hidden',
            transition:'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = `${color}08`}
            onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(160deg,#0d1f3c,#080f1e)'}
          >
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background: raw > 0 ? `linear-gradient(90deg,${color},${color}00)` : 'rgba(138,145,159,0.06)' }} />
            {raw > 0 && <div style={{ position:'absolute', top:-16, left:-16, width:60, height:60, borderRadius:'50%', background:`radial-gradient(circle,${color}20,transparent 70%)`, filter:'blur(10px)', pointerEvents:'none' }} />}
            <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color: raw > 0 ? `${color}80` : '#1e2a3a', marginBottom:6 }}>{label}</p>
            <GradNum value={val} color={color} size={28} />
          </div>
        ))}
      </div>

      {/* ── Main bento ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gridTemplateRows:'auto auto', gap:2 }}>

        {/* Activity chart — spans 2 cols, 2 rows */}
        <div style={{ gridColumn:'1/3', gridRow:'1/3', background:'linear-gradient(160deg,#0d1f3c,#080f1e)', border:'0.5px solid rgba(163,201,255,0.07)', padding:'16px 18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
            <div>
              <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.12em', color:'rgba(163,201,255,0.4)', textTransform:'uppercase', marginBottom:3 }}>Activity</p>
              <p style={{ fontFamily:SANS, fontSize:13, fontWeight:700, color:'#e2e2e8', letterSpacing:'-0.01em' }}>Weekly applications</p>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontFamily:MONO, fontSize:8, color:'#2a3040', letterSpacing:'0.06em', marginBottom:2 }}>AVG/WEEK</p>
                <GradNum value={velocity} color='#a3c9ff' size={18} />
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activity} margin={{ top:4, right:0, left:-28, bottom:0 }}>
              <defs>
                <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a3c9ff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#a3c9ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontFamily:MONO, fontSize:8, fill:'#3a4455', fontWeight:600 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontFamily:MONO, fontSize:8, fill:'#3a4455' }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} cursor={{ stroke:'rgba(163,201,255,0.08)', strokeWidth:1 }} />
              <Area type="monotone" dataKey="count" stroke="#a3c9ff" strokeWidth={2} fill="url(#aG)"
                dot={{ fill:'#a3c9ff', r:3, strokeWidth:0 }}
                activeDot={{ fill:'#a3c9ff', r:5, strokeWidth:0, filter:'drop-shadow(0 0 6px #a3c9ff)' }} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Mini stat row inside chart */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:2, marginTop:10 }}>
            {[
              { icon:Flame,         label:'Streak',     value: streak ? `${streak}w` : '—',   color:'#ffb689' },
              { icon:Target,        label:'Peak day',   value: peakDay || '—',                 color:'#a3c9ff' },
              { icon:AlertTriangle, label:'Ghosted',    value: ghosted ? `${ghosted}` : '0',   color:'#ffb4ab' },
              { icon:Zap,           label:'Ghost rate', value: ghostRate ? `${ghostRate}%`:'—',color:'#ffb4ab' },
            ].map(({ icon:Icon, label, value, color }) => (
              <div key={label} style={{ background:'rgba(163,201,255,0.03)', border:'0.5px solid rgba(163,201,255,0.06)', padding:'8px 10px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
                  <Icon size={9} style={{ color }} />
                  <span style={{ fontFamily:MONO, fontSize:8, color:'#2a3040', letterSpacing:'0.08em', textTransform:'uppercase' }}>{label}</span>
                </div>
                <GradNum value={value} color={color} size={16} />
              </div>
            ))}
          </div>
        </div>

        {/* Status pie — top right */}
        <div style={{ background:'linear-gradient(160deg,#0d1f3c,#080f1e)', border:'0.5px solid rgba(163,201,255,0.07)', padding:'16px 18px' }}>
          <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.12em', color:'rgba(163,201,255,0.4)', textTransform:'uppercase', marginBottom:12 }}>Pipeline</p>
          <ResponsiveContainer width="100%" height={110}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={32} outerRadius={50}
                paddingAngle={pieData.filter(d => d.value > 0).length > 1 ? 3 : 0} stroke="none">
                {pieData.map(d => <Cell key={d.name} fill={d.color} opacity={d.value === 0 ? 0.07 : 0.9} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:8 }}>
            {pieData.map(d => {
              const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
              return (
                <div key={d.name}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:5, height:5, background:d.color, opacity: d.value===0?0.15:1 }} />
                      <span style={{ fontFamily:SANS, fontSize:10, color: d.value===0?'#2a3040':'#6b7583' }}>{d.name.charAt(0).toUpperCase()+d.name.slice(1)}</span>
                    </div>
                    <span style={{ fontFamily:MONO, fontSize:10, fontWeight:700, color: d.value===0?'#1e2a3a':d.color }}>{d.value}</span>
                  </div>
                  <div style={{ height:2, background:'rgba(163,201,255,0.04)' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:d.color, opacity: d.value===0?0.06:0.5, transition:'width 0.8s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Conversion funnel — bottom right */}
        <div style={{ background:'linear-gradient(160deg,#0d1f3c,#080f1e)', border:'0.5px solid rgba(163,201,255,0.07)', padding:'16px 18px' }}>
          <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.12em', color:'rgba(163,201,255,0.4)', textTransform:'uppercase', marginBottom:12 }}>Funnel</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {funnel.map(({ label, value, color, pct }) => (
              <div key={label}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontFamily:SANS, fontSize:11, color: value===0?'#2a3040':'#8a919f' }}>{label}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontFamily:MONO, fontSize:9, color:'#2a3040' }}>{pct}%</span>
                    <GradNum value={value} color={color} size={14} />
                  </div>
                </div>
                <div style={{ height:5, background:'rgba(163,201,255,0.05)', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${color}90,${color}30)`, transition:'width 0.9s ease' }} />
                </div>
              </div>
            ))}
          </div>
          {/* rates */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginTop:12 }}>
            {[
              { label:'Response', val:`${responseRate}%`, color:'#ffb689' },
              { label:'Offer',    val:`${offerRate}%`,    color:'#4edea3' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background:`${color}06`, border:`0.5px solid ${color}15`, padding:'8px 10px' }}>
                <p style={{ fontFamily:MONO, fontSize:7, color:`${color}60`, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>{label} rate</p>
                <GradNum value={val} color={color} size={20} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Locked insights ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:2 }}>
        <LockedCard icon={TrendingUp} label="Source ROI"       desc='"LinkedIn gets you 3× more interviews than Indeed"'     hint="Add source to applications" />
        <LockedCard icon={Clock}      label="Avg Response Time" desc='"You typically hear back in 8 days"'                    hint="Add interview dates"        />
        <LockedCard icon={Target}     label="Salary Range"      desc='"Your target: $90k–$120k. Avg offer: $105k"'            hint="Add salary to applications" />
        <LockedCard icon={Zap}        label="Level Performance" desc='"Senior roles give you 2× your interview rate"'         hint="Add job level field"        />
      </div>

    </div>
  )
}
