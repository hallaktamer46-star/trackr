import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Bell, AlertTriangle, ChevronRight, ArrowRight, Target,
  TrendingUp, TrendingDown, Briefcase, CheckCircle2, Activity,
  CalendarDays, DollarSign, BarChart3, PenSquare, Library,
  GraduationCap, BookOpen, Building2, MessageSquare, Link2,
  Mic, Handshake, PenLine
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { parseISO, isToday, isPast, format, subDays, startOfDay, isSameDay, addDays } from 'date-fns'
import { useApplications } from '../contexts/ApplicationContext'
import ApplicationModal from '../components/Modals/ApplicationModal'
import QuickPostModal from '../components/QuickPostModal'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

const STATUS_CFG = {
  wishlist:  { label:'Wishlist',  color:'#8a919f' },
  applied:   { label:'Applied',   color:'#a3c9ff' },
  interview: { label:'Interview', color:'#ffb689' },
  offer:     { label:'Offer',     color:'#4edea3' },
  rejected:  { label:'Rejected',  color:'#ffb4ab' },
}

function useLocalStorage(key, init) {
  const [v] = useState(() => { try { const s=localStorage.getItem(key); return s?JSON.parse(s):init } catch { return init } })
  return [v]
}

/* ─── Ripple hook ─── */
function useRipple() {
  const [ripples, setRipples] = useState([])
  const add = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left, y = e.clientY - rect.top
    const id = Date.now()
    setRipples(r => [...r, { id, x, y }])
    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 600)
  }
  const el = ripples.map(r => (
    <span key={r.id} style={{ position:'absolute', left:r.x, top:r.y, width:6, height:6, marginLeft:-3, marginTop:-3, borderRadius:'50%', background:'rgba(255,255,255,0.35)', animation:'rippleOut 0.6s ease-out forwards', pointerEvents:'none' }}/>
  ))
  return [el, add]
}

/* ─── KPI Card ─── */
function KPICard({ label, value, sub, icon: Icon, color, gradient, trend, trendUp, delay = 0 }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [ripples, addRipple] = useRipple()

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={(e) => { setPressed(true); addRipple(e) }}
      onMouseUp={() => setPressed(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, rgba(22,27,34,0.95), rgba(13,17,23,0.98))',
        border: `0.5px solid ${hovered ? color + '50' : color + '18'}`,
        borderLeft: `2px solid ${hovered ? color : color + '60'}`,
        padding: '14px 16px',
        cursor: 'default',
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}15, 0 0 40px ${color}12`
          : '0 2px 12px rgba(0,0,0,0.3)',
        transform: pressed ? 'translateY(0) scale(0.98)' : hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        animation: `cardIn 0.5s ease both`,
        animationDelay: `${delay}s`,
      }}
    >
      {/* shimmer sweep */}
      {hovered && <div style={{ position:'absolute', inset:0, background:'linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.04) 50%,transparent 65%)', backgroundSize:'200% 100%', animation:'shimmer 1.2s ease infinite', pointerEvents:'none' }}/>}
      {/* corner glow */}
      <div style={{ position:'absolute', top:-30, right:-30, width:90, height:90, borderRadius:'50%', background:`radial-gradient(circle, ${color}18, transparent 70%)`, filter:'blur(12px)', pointerEvents:'none', transition:'opacity 0.3s', opacity:hovered?1:0.4 }}/>
      {/* ripples */}
      {ripples}

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, position:'relative' }}>
        <div style={{
          width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center',
          background: hovered ? `${color}20` : `${color}10`,
          border: `0.5px solid ${hovered ? color + '50' : color + '25'}`,
          boxShadow: hovered ? `0 0 16px ${color}30` : 'none',
          transition: 'all 0.25s',
        }}>
          <Icon size={15} style={{ color, transition:'transform 0.25s', transform: hovered ? 'scale(1.15)' : 'scale(1)' }}/>
        </div>
        {trend != null && (
          <span style={{ display:'flex', alignItems:'center', gap:3, fontFamily:MONO, fontSize:8, fontWeight:700, color: trendUp?'#4edea3':'#ffb4ab', background: trendUp?'rgba(78,222,163,0.1)':'rgba(255,180,171,0.1)', border:`0.5px solid ${trendUp?'rgba(78,222,163,0.3)':'rgba(255,180,171,0.3)'}`, padding:'2px 6px' }}>
            {trendUp?<TrendingUp size={8}/>:<TrendingDown size={8}/>} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#404753', textTransform:'uppercase', marginBottom:4, position:'relative' }}>{label}</p>
      <p style={{ fontFamily:MONO, fontSize:26, fontWeight:900, letterSpacing:'-0.04em', lineHeight:1, marginBottom:4, position:'relative', background:`linear-gradient(135deg, #e2e2e8 0%, ${color} 100%)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', filter:`drop-shadow(0 0 8px ${color}40)` }}>{value}</p>
      <p style={{ fontFamily:MONO, fontSize:8, color:'#3a4455', position:'relative' }}>{sub}</p>
    </div>
  )
}

/* ─── Sidebar nav button ─── */
function SideBtn({ label, icon:Icon, soon, action }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={()=>{ if(soon)return; action?.() }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 12px', background:hov?'rgba(163,201,255,0.06)':'transparent', border:`0.5px solid ${hov?'rgba(163,201,255,0.12)':'transparent'}`, cursor:soon?'default':'pointer', textAlign:'left', transition:'all 0.18s', opacity:soon?0.35:1, width:'100%', position:'relative', overflow:'hidden' }}>
      {hov && !soon && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:2, background:'linear-gradient(180deg,#a3c9ff,#4edea3)', borderRadius:1 }}/>}
      <Icon size={13} style={{ color: hov&&!soon?'#a3c9ff':'#8a919f', flexShrink:0, transition:'color 0.18s' }}/>
      <div>
        <p style={{ fontSize:12, fontWeight:500, color: hov&&!soon?'#c0c7d5':'#8a919f', letterSpacing:'-0.01em', whiteSpace:'nowrap', transition:'color 0.18s' }}>{label}</p>
        {soon && <p style={{ fontFamily:MONO, fontSize:7, color:'#2a3040', letterSpacing:'0.06em', marginTop:1 }}>SOON</p>}
      </div>
    </button>
  )
}

/* ─── Table row ─── */
function AppRow({ app, onClick, index }) {
  const [hov, setHov] = useState(false)
  const sc = STATUS_CFG[app.status] || STATUS_CFG.applied
  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'grid', gridTemplateColumns:'1fr 96px 80px 32px', gap:0, padding:'10px 18px', borderBottom:'0.5px solid rgba(48,54,61,0.5)', cursor:'pointer', background: hov?`${sc.color}06`:'transparent', borderLeft: `2px solid ${hov?sc.color:'transparent'}`, transition:'all 0.18s', animation:'rowIn 0.4s ease both', animationDelay:`${index*0.05}s` }}>
      <div>
        <p style={{ fontSize:12, fontWeight:600, color: hov?'#e2e2e8':'#c0c7d5', transition:'color 0.18s', lineHeight:1.2 }}>{app.job_title||'—'}</p>
        <p style={{ fontFamily:MONO, fontSize:9, color:'#5a6478', marginTop:2 }}>{app.company||'—'}</p>
      </div>
      <div style={{ display:'flex', alignItems:'center' }}>
        <span style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:sc.color, background:`${sc.color}12`, border:`0.5px solid ${sc.color}${hov?'50':'25'}`, padding:'3px 8px', boxShadow: hov?`0 0 10px ${sc.color}25`:'none', transition:'all 0.18s' }}>{sc.label}</span>
      </div>
      <div style={{ display:'flex', alignItems:'center' }}>
        <p style={{ fontFamily:MONO, fontSize:9, color:'#3a4455' }}>{app.date_applied?format(parseISO(app.date_applied),'MMM d'):'—'}</p>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
        <ChevronRight size={12} style={{ color: hov?'#a3c9ff':'#2a3040', transform: hov?'translateX(2px)':'none', transition:'all 0.18s' }}/>
      </div>
    </div>
  )
}

/* ─── Update feed item ─── */
function FeedItem({ dot, title, sub, time, index }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 16px', borderBottom:'0.5px solid rgba(48,54,61,0.5)', background: hov?'rgba(163,201,255,0.03)':'transparent', transition:'background 0.18s', animation:'rowIn 0.4s ease both', animationDelay:`${index*0.06}s`, cursor:'default' }}>
      <div style={{ position:'relative', marginTop:5, flexShrink:0 }}>
        <div style={{ width:7, height:7, borderRadius:'50%', background:dot }}/>
        <div style={{ position:'absolute', inset:-2, borderRadius:'50%', background:dot, opacity:hov?0.25:0, animation: hov?'pingOut 1s ease infinite':'none', transition:'opacity 0.2s' }}/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:12, fontWeight:600, color:'#c0c7d5', marginBottom:2 }}>{title}</p>
        <p style={{ fontSize:11, color:'#5a6478', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{sub}</p>
        {time && <p style={{ fontFamily:MONO, fontSize:8, color:dot, marginTop:3 }}>{time}</p>}
      </div>
    </div>
  )
}

/* ─── Chart tooltip ─── */
const ChartTip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:'rgba(13,17,23,0.95)', border:'0.5px solid rgba(163,201,255,0.2)', padding:'8px 12px', backdropFilter:'blur(8px)', boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
      <p style={{ color:'#5a6478', fontFamily:MONO, fontSize:9, marginBottom:3 }}>{label}</p>
      <p style={{ color:'#a3c9ff', fontFamily:MONO, fontSize:14, fontWeight:800 }}>{payload[0].value}</p>
    </div>
  )
}

/* ─── Donut ─── */
function DonutCard({ label, value, total, color, sub }) {
  const [hov, setHov] = useState(false)
  const pct = total > 0 ? Math.round((value/total)*100) : 0
  const data = [{ v:value },{ v:Math.max(0,total-value) }]
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'12px 8px', transition:'background 0.2s', background: hov?`${color}06`:'transparent', cursor:'default' }}>
      <div style={{ position:'relative', width:68, height:68 }}>
        <PieChart width={68} height={68}>
          <Pie data={data} cx={30} cy={30} innerRadius={20} outerRadius={30} startAngle={90} endAngle={-270} dataKey="v" strokeWidth={0}>
            <Cell fill={color} opacity={hov?1:0.85}/>
            <Cell fill="rgba(255,255,255,0.04)"/>
          </Pie>
        </PieChart>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontFamily:MONO, fontSize:11, fontWeight:900, color, filter:`drop-shadow(0 0 6px ${color}60)`, transition:'filter 0.2s' }}>{pct}%</span>
        </div>
        {hov && <div style={{ position:'absolute', inset:-4, borderRadius:'50%', border:`1px solid ${color}20`, animation:'pingOut 1.5s ease infinite' }}/>}
      </div>
      <p style={{ fontFamily:MONO, fontSize:11, fontWeight:800, color:'#e2e2e8', marginTop:6 }}>{value}</p>
      <p style={{ fontFamily:MONO, fontSize:7, color:'#5a6478', textTransform:'uppercase', letterSpacing:'0.08em', textAlign:'center', marginTop:1 }}>{label}</p>
      <p style={{ fontFamily:MONO, fontSize:7, color:'#3a4455', marginTop:1 }}>{sub}</p>
    </div>
  )
}

/* ─── Mini area stat ─── */
function MiniStat({ label, value, sub, color, data, pct, up }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background: hov?'rgba(22,27,34,1)':'rgba(22,27,34,0.95)', border:`0.5px solid ${hov?color+'30':'rgba(48,54,61,0.9)'}`, padding:'13px 14px', flex:1, transition:'all 0.22s', boxShadow: hov?`0 4px 24px rgba(0,0,0,0.4), 0 0 20px ${color}10`:'none', transform: hov?'translateY(-2px)':'none', cursor:'default' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
        <div>
          <p style={{ fontFamily:MONO, fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'#404753', textTransform:'uppercase', marginBottom:3 }}>{label}</p>
          <p style={{ fontFamily:MONO, fontSize:24, fontWeight:900, letterSpacing:'-0.04em', color, lineHeight:1, filter:`drop-shadow(0 0 8px ${color}40)` }}>{value}</p>
        </div>
        {pct != null && (
          <span style={{ display:'flex', alignItems:'center', gap:2, fontFamily:MONO, fontSize:8, fontWeight:700, color:up?'#4edea3':'#ffb4ab', background:up?'rgba(78,222,163,0.1)':'rgba(255,180,171,0.1)', border:`0.5px solid ${up?'rgba(78,222,163,0.25)':'rgba(255,180,171,0.25)'}`, padding:'2px 6px' }}>
            {up?<TrendingUp size={8}/>:<TrendingDown size={8}/>} {Math.abs(pct)}%
          </span>
        )}
      </div>
      <p style={{ fontFamily:MONO, fontSize:8, color:'#3a4455', marginBottom:6 }}>{sub}</p>
      {data?.length > 0 && (
        <ResponsiveContainer width="100%" height={40}>
          <AreaChart data={data} margin={{top:0,right:0,left:0,bottom:0}}>
            <defs>
              <linearGradient id={`g${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={hov?0.4:0.2}/>
                <stop offset="100%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#g${color.replace('#','')})`} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
export default function Home() {
  const { applications, addApplication, updateApplication, deleteApplication, canAddMore } = useApplications()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen]     = useState(false)
  const [editingApp, setEditingApp]   = useState(null)
  const [quickPostOpen, setQuickPostOpen] = useState(false)

  const firstName = user?.user_metadata?.first_name || null
  const greeting  = useMemo(() => { const h=new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening' }, [])

  const stats = useMemo(() => ({
    total:     applications.length,
    applied:   applications.filter(a=>a.status==='applied').length,
    interview: applications.filter(a=>a.status==='interview').length,
    offer:     applications.filter(a=>a.status==='offer').length,
    rejected:  applications.filter(a=>a.status==='rejected').length,
    wishlist:  applications.filter(a=>a.status==='wishlist').length,
  }), [applications])

  const weeklyData = useMemo(() =>
    Array.from({length:7},(_,i)=>{ const d=startOfDay(subDays(new Date(),6-i)); return { day:format(d,'EEE'), count:applications.filter(a=>a.created_at&&isSameDay(parseISO(a.created_at),d)).length } })
  ,[applications])

  const weeklyTrend = useMemo(() =>
    Array.from({length:8},(_,i)=>{ const s=startOfDay(subDays(new Date(),(7-i)*3)),e=addDays(s,3); return { v:applications.filter(a=>a.created_at&&parseISO(a.created_at)>=s&&parseISO(a.created_at)<e).length } })
  ,[applications])

  const interviewTrend = useMemo(()=>Array.from({length:8},(_,i)=>({v:Math.max(0,i===7?stats.interview:Math.round(stats.interview*(0.5+i*0.07)))})),[stats.interview])

  const thisWeek = useMemo(()=>applications.filter(a=>a.created_at&&parseISO(a.created_at)>=startOfDay(subDays(new Date(),6))).length,[applications])
  const lastWeek = useMemo(()=>applications.filter(a=>{ if(!a.created_at)return false; const d=parseISO(a.created_at); return d>=startOfDay(subDays(new Date(),13))&&d<startOfDay(subDays(new Date(),6)) }).length,[applications])

  const followUps  = useMemo(()=>applications.filter(a=>a.reminder_date&&(isToday(parseISO(a.reminder_date))||isPast(parseISO(a.reminder_date)))).sort((a,b)=>new Date(a.reminder_date)-new Date(b.reminder_date)),[applications])
  const recentApps = useMemo(()=>[...applications].sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,6),[applications])

  const [tasks]    = useLocalStorage('trackr_tasks',    [])
  const [goals]    = useLocalStorage('trackr_goals',    [])
  const [sessions] = useLocalStorage('trackr_sessions', [])
  const todayStr   = format(new Date(),'yyyy-MM-dd')
  const todayTasks = tasks.filter(t=>!t.done&&t.due===todayStr)

  const handleSave = async d => { if(d.id) await updateApplication(d.id,d); else await addApplication({...d,status:d.status||'wishlist'}) }

  const responseRate = stats.applied   > 0 ? Math.round((stats.interview/stats.applied)*100)   : 0
  const offerRate    = stats.interview > 0 ? Math.round((stats.offer/stats.interview)*100)     : 0
  const maxCount     = Math.max(...weeklyData.map(d=>d.count),1)

  const SIDEBAR_LINKS = [
    { label:'Start a Blog', icon:PenSquare,   action:()=>setQuickPostOpen(true) },
    { label:'Library',      icon:Library,      soon:true },
    { label:'Market',       icon:BarChart3,    soon:true },
    { label:'Skills',       icon:GraduationCap,soon:true },
    { label:'Calendar',     icon:CalendarDays, action:()=>navigate('/calendar') },
  ]

  return (
    <div style={{ fontFamily:SANS, maxWidth:1280, margin:'0 auto', display:'flex', gap:20, alignItems:'flex-start', paddingTop:4 }}>

      {/* ══ Sidebar ══ */}
      <aside style={{ width:150, flexShrink:0, position:'sticky', top:72 }}>
        <nav style={{ display:'flex', flexDirection:'column', gap:1, paddingTop:8 }}>
          {SIDEBAR_LINKS.map((s,i) => <SideBtn key={s.label} {...s} delay={i*0.05}/>)}
        </nav>

        <div style={{ height:'0.5px', background:'rgba(163,201,255,0.05)', margin:'12px 10px' }}/>

        <div style={{ padding:'0 10px' }}>
          <p style={{ fontFamily:MONO, fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'#2a3040', textTransform:'uppercase', marginBottom:8 }}>Job Boards</p>
          {[
            { label:'LinkedIn',   url:'https://linkedin.com/jobs',           color:'#0a66c2' },
            { label:'Indeed',     url:'https://indeed.com',                  color:'#2164f3' },
            { label:'Glassdoor',  url:'https://glassdoor.com/Job/index.htm', color:'#0caa41' },
            { label:'Wellfound',  url:'https://wellfound.com/jobs',          color:'#fb4f4f' },
            { label:'Levels.fyi', url:'https://levels.fyi/jobs',             color:'#7c3aed' },
          ].map(({label,url,color})=>(
            <a key={label} href={url} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 8px', textDecoration:'none', border:'0.5px solid transparent', transition:'all 0.18s', borderRadius:0 }}
              onMouseEnter={e=>{ e.currentTarget.style.background=`${color}12`; e.currentTarget.style.borderColor=`${color}30`; e.currentTarget.querySelector('span').style.color=color }}
              onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.querySelector('span').style.color='#6b7583' }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:color, flexShrink:0, opacity:0.7 }}/>
              <span style={{ fontSize:11, fontWeight:500, color:'#6b7583', whiteSpace:'nowrap', transition:'color 0.18s' }}>{label}</span>
            </a>
          ))}
        </div>

        <div style={{ height:'0.5px', background:'rgba(163,201,255,0.05)', margin:'12px 10px' }}/>
        <p style={{ fontFamily:MONO, fontSize:7, color:'#1e2a3a', letterSpacing:'0.08em', textTransform:'uppercase', padding:'0 10px' }}>Trackr © 2026</p>
      </aside>

      {/* ══ Main ══ */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:12 }}>

        {/* ── Header ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:4 }}>
          <div>
            <p style={{ fontFamily:MONO, fontSize:9, color:'#404753', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>
              {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
            </p>
            <h1 style={{ fontSize:27, fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, color:'#e2e2e8' }}>
              {greeting}{firstName
                ? <>, <span style={{ background:'linear-gradient(135deg,#a3c9ff 0%,#4edea3 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{firstName}</span></>
                : ''}.
            </h1>
          </div>
          {canAddMore && (
            <button onClick={()=>{ setEditingApp(null); setModalOpen(true) }}
              className="cta-btn"
              style={{ display:'flex', alignItems:'center', gap:9, padding:'11px 22px', background:'linear-gradient(135deg,#1493ff,#6366f1)', border:'none', cursor:'pointer', color:'#fff', fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', position:'relative', overflow:'hidden', boxShadow:'0 0 0 1px rgba(99,102,241,0.4), 0 4px 24px rgba(20,147,255,0.35)', transition:'transform 0.18s, box-shadow 0.18s' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 0 0 1px rgba(99,102,241,0.6),0 8px 32px rgba(20,147,255,0.5),0 0 60px rgba(99,102,241,0.2)' }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 0 0 1px rgba(99,102,241,0.4),0 4px 24px rgba(20,147,255,0.35)' }}
              onMouseDown={e=>e.currentTarget.style.transform='scale(0.97)'}
              onMouseUp={e=>e.currentTarget.style.transform='translateY(-2px)'}>
              <span style={{ position:'absolute', inset:0, background:'linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.18) 50%,transparent 65%)', backgroundSize:'200% 100%', animation:'shimmer 2s ease infinite', pointerEvents:'none' }}/>
              <Plus size={14} strokeWidth={2.5}/> Track a Role
            </button>
          )}
        </div>

        {/* ── ROW 1: 4 KPI cards ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          <KPICard label="Total Apps"    value={stats.total}     sub={`${thisWeek} this week`}         icon={Briefcase}   color="#a3c9ff" delay={0.05} trend={thisWeek>0?Math.round((thisWeek/(lastWeek||1))*100)-100:null} trendUp={thisWeek>=lastWeek}/>
          <KPICard label="Applied"       value={stats.applied}   sub={`${stats.wishlist} in wishlist`} icon={Target}      color="#7ab4ff" delay={0.10} trend={stats.total>0?Math.round((stats.applied/stats.total)*100):null} trendUp/>
          <KPICard label="Interviews"    value={stats.interview} sub={`${responseRate}% response rate`}icon={CalendarDays} color="#ffb689" delay={0.15} trend={responseRate} trendUp={responseRate>=15}/>
          <KPICard label="Offers"        value={stats.offer}     sub={`${offerRate}% close rate`}      icon={DollarSign}  color="#4edea3" delay={0.20} trend={offerRate} trendUp={offerRate>=30}/>
        </div>

        {/* ── ROW 2: Chart | Mini stats | Donuts ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 186px 186px', gap:10 }}>

          {/* Chart */}
          <div style={{ background:'linear-gradient(145deg,rgba(13,31,60,0.95),rgba(7,13,26,0.98))', border:'0.5px solid rgba(163,201,255,0.08)', padding:'16px 18px', boxShadow:'0 4px 24px rgba(0,0,0,0.3)', transition:'border-color 0.2s', position:'relative', overflow:'hidden' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(163,201,255,0.15)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(163,201,255,0.08)'}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(163,201,255,0.15),transparent)', pointerEvents:'none' }}/>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <p style={{ fontFamily:MONO, fontSize:7, fontWeight:700, letterSpacing:'0.12em', color:'#404753', textTransform:'uppercase', marginBottom:3 }}>Activity</p>
                <p style={{ fontSize:14, fontWeight:700, color:'#e2e2e8', letterSpacing:'-0.01em' }}>Weekly Applications</p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                {thisWeek!==lastWeek&&<span style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color:thisWeek>lastWeek?'#4edea3':'#ffb4ab', background:thisWeek>lastWeek?'rgba(78,222,163,0.1)':'rgba(255,180,171,0.1)', border:`0.5px solid ${thisWeek>lastWeek?'rgba(78,222,163,0.25)':'rgba(255,180,171,0.25)'}`, padding:'3px 8px' }}>{thisWeek>lastWeek?'↑':'↓'} {Math.abs(thisWeek-lastWeek)} vs last week</span>}
                <span style={{ fontFamily:MONO, fontSize:26, fontWeight:900, letterSpacing:'-0.05em', background:'linear-gradient(135deg,#fff,#a3c9ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{thisWeek}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={weeklyData} barSize={26} margin={{top:4,right:0,left:-28,bottom:0}}>
                <XAxis dataKey="day" tick={{fontFamily:MONO,fontSize:8,fill:'#3a4455',fontWeight:600}} axisLine={false} tickLine={false}/>
                <YAxis allowDecimals={false} tick={{fontFamily:MONO,fontSize:8,fill:'#3a4455'}} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTip/>} cursor={{fill:'rgba(163,201,255,0.04)'}}/>
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {weeklyData.map((e,i)=>(
                    <Cell key={i} fill={e.count>0&&e.count===maxCount?'url(#peak)':e.count>0?'rgba(163,201,255,0.18)':'rgba(255,255,255,0.03)'} stroke={e.count>0&&e.count===maxCount?'rgba(163,201,255,0.5)':'none'} strokeWidth={1}/>
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="peak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a3c9ff" stopOpacity={0.95}/>
                    <stop offset="100%" stopColor="#a3c9ff" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Mini stats stacked */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <MiniStat label="Response Rate" value={`${responseRate}%`} sub="Applied → Interview" color="#ffb689" data={interviewTrend} pct={responseRate} up={responseRate>=15}/>
            <MiniStat label="Total Tracked"  value={stats.total}        sub={`${stats.rejected} rejected`}        color="#a3c9ff" data={weeklyTrend}    pct={thisWeek>0?Math.round((thisWeek/(lastWeek||1))*100)-100:null} up={thisWeek>=lastWeek}/>
          </div>

          {/* Donuts */}
          <div style={{ background:'rgba(22,27,34,0.95)', border:'0.5px solid rgba(48,54,61,0.9)', display:'flex', flexDirection:'column', overflow:'hidden', transition:'border-color 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(163,201,255,0.15)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(48,54,61,0.9)'}>
            <div style={{ padding:'10px 14px', borderBottom:'0.5px solid rgba(48,54,61,0.9)' }}>
              <p style={{ fontFamily:MONO, fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'#3a4455', textTransform:'uppercase' }}>Pipeline</p>
            </div>
            <div style={{ borderBottom:'0.5px solid rgba(48,54,61,0.9)' }}>
              <DonutCard label="Interview Rate" value={stats.interview} total={Math.max(stats.applied,1)} color="#ffb689" sub={`of ${stats.applied} applied`}/>
            </div>
            <DonutCard label="Offer Rate" value={stats.offer} total={Math.max(stats.interview,1)} color="#4edea3" sub={`of ${stats.interview} interviews`}/>
          </div>
        </div>

        {/* ── ROW 3: Table | Feed ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 290px', gap:10 }}>

          {/* Recent apps table */}
          <div style={{ background:'rgba(22,27,34,0.95)', border:'0.5px solid rgba(48,54,61,0.9)', overflow:'hidden', transition:'border-color 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(163,201,255,0.12)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(48,54,61,0.9)'}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderBottom:'0.5px solid rgba(48,54,61,0.9)', background:'rgba(163,201,255,0.02)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <Activity size={12} style={{ color:'#a3c9ff' }}/>
                <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#8a919f', textTransform:'uppercase' }}>Recent Applications</p>
              </div>
              <button onClick={()=>navigate('/board')} style={{ fontFamily:MONO, fontSize:8, color:'#a3c9ff', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:3, letterSpacing:'0.06em', textTransform:'uppercase', transition:'opacity 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.opacity='0.7'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                View board <ArrowRight size={9}/>
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 96px 80px 32px', padding:'7px 18px', borderBottom:'0.5px solid rgba(48,54,61,0.9)' }}>
              {['Role / Company','Status','Date',''].map((h,i)=>(
                <p key={i} style={{ fontFamily:MONO, fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'#2a3040', textTransform:'uppercase' }}>{h}</p>
              ))}
            </div>
            {recentApps.length===0
              ? <div style={{ padding:'36px 18px', textAlign:'center' }}>
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#2a3040', marginBottom:8 }}>Nothing tracked yet.</p>
                  <button onClick={()=>{ setEditingApp(null); setModalOpen(true) }} style={{ fontFamily:MONO, fontSize:9, color:'#a3c9ff', background:'none', border:'none', cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase' }}>Add your first →</button>
                </div>
              : recentApps.map((app,i)=>(
                  <AppRow key={app.id} app={app} index={i} onClick={()=>{ setEditingApp(app); setModalOpen(true) }}/>
                ))
            }
          </div>

          {/* Updates feed */}
          <div style={{ background:'rgba(22,27,34,0.95)', border:'0.5px solid rgba(48,54,61,0.9)', overflow:'hidden', display:'flex', flexDirection:'column', transition:'border-color 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(163,201,255,0.12)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(48,54,61,0.9)'}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'0.5px solid rgba(48,54,61,0.9)', background:'rgba(163,201,255,0.02)', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <Bell size={12} style={{ color:'#a3c9ff' }}/>
                <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#8a919f', textTransform:'uppercase' }}>Updates</p>
              </div>
              {followUps.length>0&&<span style={{ fontFamily:MONO, fontSize:8, fontWeight:800, background:'linear-gradient(135deg,#e56f03,#f59e0b)', color:'#fff', padding:'2px 7px', boxShadow:'0 0 10px rgba(229,111,3,0.4)' }}>{followUps.length}</span>}
            </div>
            <div style={{ flex:1, overflowY:'auto' }}>
              {followUps.slice(0,3).map((a,i)=>(
                <FeedItem key={a.id} index={i} dot="#ffb689" title="Follow-up due" sub={`${a.job_title} @ ${a.company}`} time={format(parseISO(a.reminder_date),'MMM d, yyyy')}/>
              ))}
              {todayTasks.slice(0,2).map((t,i)=>(
                <FeedItem key={t.id} index={i+3} dot="#a3c9ff" title="Task due today" sub={t.title}/>
              ))}
              {applications.filter(a=>a.status==='interview').slice(0,2).map((a,i)=>(
                <FeedItem key={a.id} index={i+5} dot="#4edea3" title="Interview in progress" sub={`${a.job_title} @ ${a.company}`}/>
              ))}
              {followUps.length===0&&todayTasks.length===0&&applications.filter(a=>a.status==='interview').length===0&&(
                <div style={{ padding:'28px 16px', textAlign:'center' }}>
                  <CheckCircle2 size={22} style={{ color:'#2a3040', margin:'0 auto 8px' }}/>
                  <p style={{ fontFamily:MONO, fontSize:8, color:'#2a3040', letterSpacing:'0.06em' }}>All caught up — nothing due.</p>
                </div>
              )}
            </div>

            {/* AI quick access */}
            <div style={{ borderTop:'0.5px solid rgba(48,54,61,0.9)', padding:'10px 12px', flexShrink:0 }}>
              <p style={{ fontFamily:MONO, fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'#3a4455', textTransform:'uppercase', marginBottom:7 }}>Quick AI</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
                {[
                  { label:'Interview Coach', to:'/ai/interview-coach', color:'#ffb4ab' },
                  { label:'Salary Intel',    to:'/ai/salary',          color:'#a3c9ff' },
                  { label:'Cover Letter',    to:'/ai/cover-letter',    color:'#4edea3' },
                  { label:'Offer Simulator', to:'/ai/negotiate',       color:'#4edea3' },
                ].map(({label,to,color})=>(
                  <button key={to} onClick={()=>navigate(to)}
                    style={{ padding:'7px 8px', background:'rgba(255,255,255,0.02)', border:`0.5px solid ${color}18`, cursor:'pointer', textAlign:'left', transition:'all 0.18s', position:'relative', overflow:'hidden' }}
                    onMouseEnter={e=>{ e.currentTarget.style.background=`${color}10`; e.currentTarget.style.borderColor=`${color}45`; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow=`0 4px 12px ${color}20` }}
                    onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor=`${color}18`; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}
                    onMouseDown={e=>e.currentTarget.style.transform='scale(0.96)'}
                    onMouseUp={e=>e.currentTarget.style.transform='translateY(-1px)'}>
                    <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color, letterSpacing:'0.04em' }}>{label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ApplicationModal open={modalOpen} onClose={()=>setModalOpen(false)} onSave={handleSave} onDelete={deleteApplication} initial={editingApp??{status:'wishlist'}}/>
      {quickPostOpen && <QuickPostModal onClose={()=>setQuickPostOpen(false)} onPublished={()=>{}}/>}

      <style>{`
        @keyframes shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes cardIn    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes rowIn     { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:none} }
        @keyframes rippleOut { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(18);opacity:0} }
        @keyframes pingOut   { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.5);opacity:0} }
      `}</style>
    </div>
  )
}
