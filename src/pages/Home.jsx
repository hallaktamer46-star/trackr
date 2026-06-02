import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Bell, AlertTriangle, ChevronRight, Sparkles,
  Mic, Handshake, PenLine, ArrowRight, Target,
  TrendingUp, TrendingDown, Briefcase, CheckCircle2,
  Clock, CalendarDays, DollarSign, BarChart3, Zap,
  BookOpen, Building2, MessageSquare, Link2, Activity,
  PenSquare, Library, GraduationCap
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  parseISO, isToday, isPast, format, subDays,
  startOfDay, isSameDay, addDays
} from 'date-fns'
import { useApplications } from '../contexts/ApplicationContext'
import ApplicationModal from '../components/Modals/ApplicationModal'
import QuickPostModal from '../components/QuickPostModal'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

const STATUS_CONFIG = {
  wishlist:  { label: 'Wishlist',  color: '#8a919f' },
  applied:   { label: 'Applied',   color: '#a3c9ff' },
  interview: { label: 'Interview', color: '#ffb689' },
  offer:     { label: 'Offer',     color: '#4edea3' },
  rejected:  { label: 'Rejected',  color: '#ffb4ab' },
}

function useLocalStorage(key, initial) {
  const [val] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial } catch { return initial }
  })
  return [val]
}

/* ─── KPI Card — compact horizontal pill ─── */
function KPICard({ label, value, sub, icon: Icon, gradient, trend, trendUp }) {
  return (
    <div style={{
      background: gradient, padding: '11px 14px',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ position:'absolute', right:-12, top:-12, width:60, height:60, borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }}/>
      <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={14} color="#fff"/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontFamily:MONO, fontSize:8, fontWeight:600, letterSpacing:'0.08em', color:'rgba(255,255,255,0.55)', textTransform:'uppercase', marginBottom:2 }}>{label}</p>
        <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
          <p style={{ fontFamily:MONO, fontSize:22, fontWeight:900, letterSpacing:'-0.04em', color:'#fff', lineHeight:1 }}>{value}</p>
          {trend != null && (
            <span style={{ display:'flex', alignItems:'center', gap:2, fontFamily:MONO, fontSize:8, fontWeight:700, color:'rgba(255,255,255,0.8)', background:'rgba(255,255,255,0.15)', padding:'2px 5px', borderRadius:999 }}>
              {trendUp ? <TrendingUp size={8}/> : <TrendingDown size={8}/>} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p style={{ fontFamily:MONO, fontSize:8, color:'rgba(255,255,255,0.4)', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{sub}</p>
      </div>
    </div>
  )
}

/* ─── Mini area chart card ─── */
function MiniStatCard({ label, value, sub, color, data, pct, up }) {
  return (
    <div style={{ background:'#161b22', border:'0.5px solid rgba(48,54,61,0.9)', padding:'14px 16px', flex:1 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
        <div>
          <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#5a6478', textTransform:'uppercase', marginBottom:4 }}>{label}</p>
          <p style={{ fontFamily:MONO, fontSize:28, fontWeight:900, letterSpacing:'-0.04em', color, lineHeight:1 }}>{value}</p>
        </div>
        {pct != null && (
          <span style={{ display:'flex', alignItems:'center', gap:3, fontFamily:MONO, fontSize:9, fontWeight:700, color: up?'#4edea3':'#ffb4ab', background: up?'rgba(78,222,163,0.1)':'rgba(255,180,171,0.1)', border:`0.5px solid ${up?'rgba(78,222,163,0.25)':'rgba(255,180,171,0.25)'}`, padding:'3px 7px' }}>
            {up?<TrendingUp size={9}/>:<TrendingDown size={9}/>} {pct}%
          </span>
        )}
      </div>
      <p style={{ fontFamily:MONO, fontSize:9, color:'#3a4455', marginBottom:8 }}>{sub}</p>
      {data && data.length > 0 && (
        <ResponsiveContainer width="100%" height={48}>
          <AreaChart data={data} margin={{top:0,right:0,left:0,bottom:0}}>
            <defs>
              <linearGradient id={`ag${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="100%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#ag${color.replace('#','')})`} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

/* ─── Donut chart card ─── */
function DonutCard({ label, value, total, color, sub }) {
  const pct = total > 0 ? Math.round((value/total)*100) : 0
  const data = [{ v: value }, { v: Math.max(0, total - value) }]
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'12px 8px' }}>
      <div style={{ position:'relative', width:72, height:72 }}>
        <PieChart width={72} height={72}>
          <Pie data={data} cx={31} cy={31} innerRadius={22} outerRadius={32} startAngle={90} endAngle={-270} dataKey="v" strokeWidth={0}>
            <Cell fill={color}/>
            <Cell fill="rgba(255,255,255,0.05)"/>
          </Pie>
        </PieChart>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontFamily:MONO, fontSize:12, fontWeight:800, color }}>{pct}%</span>
        </div>
      </div>
      <p style={{ fontFamily:MONO, fontSize:10, fontWeight:800, color:'#e2e2e8', marginTop:6, letterSpacing:'-0.02em' }}>{value.toLocaleString()}</p>
      <p style={{ fontFamily:MONO, fontSize:7, color:'#5a6478', textTransform:'uppercase', letterSpacing:'0.08em', textAlign:'center', marginTop:2 }}>{label}</p>
      {sub && <p style={{ fontFamily:MONO, fontSize:7, color:'#3a4455', marginTop:1 }}>{sub}</p>}
    </div>
  )
}

/* ─── Tooltip ─── */
const ChartTip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:'#0d1117', border:'0.5px solid rgba(163,201,255,0.2)', padding:'6px 10px' }}>
      <p style={{ color:'#5a6478', fontFamily:MONO, fontSize:9, marginBottom:2 }}>{label}</p>
      <p style={{ color:'#a3c9ff', fontFamily:MONO, fontSize:12, fontWeight:700 }}>{payload[0].value}</p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
export default function Home() {
  const { applications, addApplication, updateApplication, deleteApplication, canAddMore } = useApplications()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState(null)
  const [quickPostOpen, setQuickPostOpen] = useState(false)

  const firstName = user?.user_metadata?.first_name || null
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }, [])

  /* ── Core stats ── */
  const stats = useMemo(() => ({
    total:     applications.length,
    applied:   applications.filter(a=>a.status==='applied').length,
    interview: applications.filter(a=>a.status==='interview').length,
    offer:     applications.filter(a=>a.status==='offer').length,
    rejected:  applications.filter(a=>a.status==='rejected').length,
    wishlist:  applications.filter(a=>a.status==='wishlist').length,
  }), [applications])

  /* ── Weekly bar chart ── */
  const weeklyData = useMemo(() =>
    Array.from({length:7}, (_,i) => {
      const date = startOfDay(subDays(new Date(),6-i))
      return { day:format(date,'EEE'), count:applications.filter(a=>a.created_at&&isSameDay(parseISO(a.created_at),date)).length }
    })
  , [applications])

  /* ── 4-week trend for mini area charts ── */
  const weeklyTrend = useMemo(() =>
    Array.from({length:8}, (_,i) => {
      const start = startOfDay(subDays(new Date(), (7-i)*3))
      const end   = addDays(start, 3)
      return {
        v: applications.filter(a=>a.created_at&&parseISO(a.created_at)>=start&&parseISO(a.created_at)<end).length
      }
    })
  , [applications])

  const interviewTrend = useMemo(() =>
    Array.from({length:8},(_,i)=>({v:Math.max(0,(i===7?stats.interview:Math.round(stats.interview*(0.5+i*0.07))))}))
  ,[stats.interview])

  /* ── Week delta ── */
  const thisWeek = useMemo(()=>applications.filter(a=>a.created_at&&parseISO(a.created_at)>=startOfDay(subDays(new Date(),6))).length,[applications])
  const lastWeek = useMemo(()=>applications.filter(a=>{ if(!a.created_at)return false; const d=parseISO(a.created_at); return d>=startOfDay(subDays(new Date(),13))&&d<startOfDay(subDays(new Date(),6)) }).length,[applications])

  /* ── Follow-ups ── */
  const followUps = useMemo(()=>
    applications.filter(a=>a.reminder_date&&(isToday(parseISO(a.reminder_date))||isPast(parseISO(a.reminder_date))))
      .sort((a,b)=>new Date(a.reminder_date)-new Date(b.reminder_date))
  ,[applications])

  /* ── Recent apps ── */
  const recentApps = useMemo(()=>
    [...applications].sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,6)
  ,[applications])

  /* ── Calendar data ── */
  const [tasks]    = useLocalStorage('trackr_tasks',    [])
  const [goals]    = useLocalStorage('trackr_goals',    [])
  const [sessions] = useLocalStorage('trackr_sessions', [])
  const todayStr   = format(new Date(),'yyyy-MM-dd')
  const todayTasks = tasks.filter(t=>!t.done&&t.due===todayStr)
  const todaySess  = sessions.filter(s=>s.date===todayStr)

  const handleSave = async data => {
    if (data.id) await updateApplication(data.id,data)
    else await addApplication({...data,status:data.status||'wishlist'})
  }

  const responseRate = stats.applied > 0 ? Math.round((stats.interview/stats.applied)*100) : 0
  const offerRate    = stats.interview > 0 ? Math.round((stats.offer/stats.interview)*100) : 0
  const maxCount     = Math.max(...weeklyData.map(d=>d.count),1)

  const SIDEBAR_LINKS = [
    { label:'Start a Blog', icon:PenSquare,    action:()=>setQuickPostOpen(true) },
    { label:'Library',      icon:Library,       soon:true },
    { label:'Market',       icon:BarChart3,      soon:true },
    { label:'Skills',       icon:GraduationCap,  soon:true },
    { label:'Calendar',     icon:CalendarDays,  action:()=>navigate('/calendar') },
    { label:'Roadmap',      icon:Target,        action:()=>navigate('/roadmap') },
  ]

  return (
    <div style={{ fontFamily:SANS, maxWidth:1280, margin:'0 auto', display:'flex', gap:20, alignItems:'flex-start', paddingTop:4 }}>

      {/* ── Left sidebar ── */}
      <aside style={{ width:148, flexShrink:0, position:'sticky', top:72 }}>
        <nav style={{ display:'flex', flexDirection:'column', gap:1, paddingTop:8 }}>
          {SIDEBAR_LINKS.map(({ label, icon:Icon, soon, action }) => (
            <button key={label} onClick={()=>{ if(soon)return; action?.() }}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'transparent', border:'0.5px solid transparent', cursor:soon?'default':'pointer', textAlign:'left', transition:'all 0.15s', opacity:soon?0.35:1 }}
              onMouseEnter={e=>{ if(!soon){ e.currentTarget.style.background='rgba(163,201,255,0.04)'; e.currentTarget.style.borderColor='rgba(163,201,255,0.08)' }}}
              onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent' }}>
              <Icon size={13} style={{ color:'#8a919f', flexShrink:0 }}/>
              <div>
                <p style={{ fontSize:12, fontWeight:500, color:'#8a919f', letterSpacing:'-0.01em', whiteSpace:'nowrap' }}>{label}</p>
                {soon && <p style={{ fontFamily:MONO, fontSize:7, color:'#2a3040', letterSpacing:'0.06em', marginTop:1 }}>SOON</p>}
              </div>
            </button>
          ))}
        </nav>

        <div style={{ height:'0.5px', background:'rgba(163,201,255,0.05)', margin:'10px 10px' }}/>

        <div style={{ padding:'0 10px' }}>
          <p style={{ fontFamily:MONO, fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'#2a3040', textTransform:'uppercase', marginBottom:6 }}>Job Boards</p>
          {[
            { label:'LinkedIn',   url:'https://linkedin.com/jobs',           color:'#0a66c2' },
            { label:'Indeed',     url:'https://indeed.com',                  color:'#2164f3' },
            { label:'Glassdoor',  url:'https://glassdoor.com/Job/index.htm', color:'#0caa41' },
            { label:'Wellfound',  url:'https://wellfound.com/jobs',          color:'#fb4f4f' },
            { label:'Levels.fyi', url:'https://levels.fyi/jobs',             color:'#7c3aed' },
          ].map(({label,url,color})=>(
            <a key={label} href={url} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 8px', textDecoration:'none', border:'0.5px solid transparent', transition:'all 0.15s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background=`${color}10`; e.currentTarget.style.borderColor=`${color}25` }}
              onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent' }}>
              <div style={{ width:4, height:4, borderRadius:'50%', background:color, flexShrink:0, opacity:0.7 }}/>
              <span style={{ fontSize:11, fontWeight:500, color:'#6b7583', whiteSpace:'nowrap' }}>{label}</span>
            </a>
          ))}
        </div>

        <div style={{ height:'0.5px', background:'rgba(163,201,255,0.05)', margin:'10px 10px' }}/>
        <p style={{ fontFamily:MONO, fontSize:7, color:'#1e2a3a', letterSpacing:'0.08em', textTransform:'uppercase', padding:'0 10px' }}>Trackr © 2026</p>
      </aside>

      {/* ── Main dashboard ── */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:12 }}>

      {/* ══ Header row ══ */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <p style={{ fontFamily:MONO, fontSize:9, color:'#404753', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>
            {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
          </p>
          <h1 style={{ fontSize:26, fontWeight:900, letterSpacing:'-0.03em', color:'#e2e2e8', lineHeight:1 }}>
            {greeting}{firstName
              ? <>, <span style={{ background:'linear-gradient(135deg,#a3c9ff,#4edea3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{firstName}</span></>
              : ''}.
          </h1>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {canAddMore && (
            <button onClick={()=>{ setEditingApp(null); setModalOpen(true) }}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:999, background:'linear-gradient(135deg,#1493ff,#6366f1)', border:'none', cursor:'pointer', boxShadow:'0 0 0 1px rgba(99,102,241,0.4),0 4px 20px rgba(20,147,255,0.3)', transition:'transform 0.15s,filter 0.15s', position:'relative', overflow:'hidden' }}
              onMouseEnter={e=>{ e.currentTarget.style.filter='brightness(1.1)'; e.currentTarget.style.transform='translateY(-1px)' }}
              onMouseLeave={e=>{ e.currentTarget.style.filter='none'; e.currentTarget.style.transform='none' }}>
              <Plus size={13} color="#fff" strokeWidth={2.5}/>
              <span style={{ fontFamily:MONO, fontSize:10, fontWeight:700, color:'#fff', letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap' }}>Track a Role</span>
            </button>
          )}
        </div>
      </div>

      {/* ══ ROW 1: 4 KPI cards ══ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        <KPICard label="Total Applications" value={stats.total}     sub={`${thisWeek} added this week`}              icon={Briefcase}  gradient="linear-gradient(135deg,#1a6bff,#6366f1)"   trend={thisWeek>0?Math.round((thisWeek/(lastWeek||1))*100)-100:null} trendUp={thisWeek>=lastWeek}/>
        <KPICard label="Applied"            value={stats.applied}   sub={`${stats.wishlist} in wishlist`}             icon={Target}     gradient="linear-gradient(135deg,#0ea5e9,#38bdf8)"   trend={stats.total>0?Math.round((stats.applied/stats.total)*100):null} trendUp/>
        <KPICard label="Interviews"         value={stats.interview} sub={`${responseRate}% response rate`}            icon={CalendarDays} gradient="linear-gradient(135deg,#f59e0b,#fb923c)" trend={responseRate} trendUp={responseRate>=15}/>
        <KPICard label="Offers"             value={stats.offer}     sub={`${offerRate}% interview-to-offer`}          icon={DollarSign} gradient="linear-gradient(135deg,#10b981,#4edea3)"   trend={offerRate} trendUp={offerRate>=30}/>
      </div>

      {/* ══ ROW 2: Big chart | Mini stats | Donuts ══ */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 200px 200px', gap:12 }}>

        {/* Left: Activity chart */}
        <div style={{ background:'#161b22', border:'0.5px solid rgba(48,54,61,0.9)', padding:'18px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.12em', color:'#5a6478', textTransform:'uppercase', marginBottom:3 }}>Activity</p>
              <p style={{ fontSize:15, fontWeight:700, color:'#e2e2e8', letterSpacing:'-0.01em' }}>Weekly Applications</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {thisWeek !== lastWeek && (
                <span style={{ fontFamily:MONO, fontSize:9, fontWeight:700, color:thisWeek>lastWeek?'#4edea3':'#ffb4ab', background:thisWeek>lastWeek?'rgba(78,222,163,0.1)':'rgba(255,180,171,0.1)', border:`0.5px solid ${thisWeek>lastWeek?'rgba(78,222,163,0.25)':'rgba(255,180,171,0.25)'}`, padding:'3px 8px' }}>
                  {thisWeek>lastWeek?'↑':'↓'} {Math.abs(thisWeek-lastWeek)} vs last week
                </span>
              )}
              <span style={{ fontFamily:MONO, fontSize:28, fontWeight:900, letterSpacing:'-0.05em', background:'linear-gradient(135deg,#fff,#a3c9ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{thisWeek}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={28} margin={{top:4,right:0,left:-28,bottom:0}}>
              <XAxis dataKey="day" tick={{fontFamily:MONO,fontSize:8,fill:'#3a4455',fontWeight:600}} axisLine={false} tickLine={false}/>
              <YAxis allowDecimals={false} tick={{fontFamily:MONO,fontSize:8,fill:'#3a4455'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTip/>} cursor={{fill:'rgba(163,201,255,0.04)'}}/>
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {weeklyData.map((e,i)=>(
                  <Cell key={i}
                    fill={e.count>0&&e.count===maxCount?'url(#peak)':e.count>0?'rgba(163,201,255,0.2)':'rgba(255,255,255,0.03)'}
                    stroke={e.count>0&&e.count===maxCount?'rgba(163,201,255,0.5)':'none'} strokeWidth={1}/>
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

        {/* Middle: 2 stacked mini stat cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <MiniStatCard
            label="Response Rate" value={`${responseRate}%`}
            sub="Applied → Interview" color="#ffb689"
            data={interviewTrend} pct={responseRate} up={responseRate>=15}
          />
          <MiniStatCard
            label="Total Tracked" value={stats.total}
            sub={`${stats.rejected} rejected`} color="#a3c9ff"
            data={weeklyTrend} pct={thisWeek>0?Math.round((thisWeek/(lastWeek||1))*100)-100:null} up={thisWeek>=lastWeek}
          />
        </div>

        {/* Right: Donut charts */}
        <div style={{ background:'#161b22', border:'0.5px solid rgba(48,54,61,0.9)', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'12px 14px 8px', borderBottom:'0.5px solid rgba(48,54,61,0.9)' }}>
            <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#5a6478', textTransform:'uppercase' }}>Pipeline</p>
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', divideY:'0.5px solid rgba(48,54,61,0.9)' }}>
            <div style={{ borderBottom:'0.5px solid rgba(48,54,61,0.9)' }}>
              <DonutCard label="Interview Rate" value={stats.interview} total={Math.max(stats.applied,1)} color="#ffb689" sub={`of ${stats.applied} applied`}/>
            </div>
            <DonutCard label="Offer Rate" value={stats.offer} total={Math.max(stats.interview,1)} color="#4edea3" sub={`of ${stats.interview} interviews`}/>
          </div>
        </div>
      </div>

      {/* ══ ROW 3: Recent apps table | Updates feed ══ */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:12 }}>

        {/* Left: Recent applications table */}
        <div style={{ background:'#161b22', border:'0.5px solid rgba(48,54,61,0.9)', overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'0.5px solid rgba(48,54,61,0.9)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Activity size={13} style={{ color:'#a3c9ff' }}/>
              <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.1em', color:'#8a919f', textTransform:'uppercase' }}>Recent Applications</p>
            </div>
            <button onClick={()=>navigate('/board')} style={{ fontFamily:MONO, fontSize:8, color:'#a3c9ff', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:3, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              View board <ArrowRight size={9}/>
            </button>
          </div>

          {/* Table header */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 90px 80px', gap:0, padding:'8px 18px', borderBottom:'0.5px solid rgba(48,54,61,0.9)' }}>
            {['Role / Company','Status','Date',''].map((h,i)=>(
              <p key={i} style={{ fontFamily:MONO, fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'#3a4455', textTransform:'uppercase' }}>{h}</p>
            ))}
          </div>

          {recentApps.length === 0 ? (
            <div style={{ padding:'40px 18px', textAlign:'center' }}>
              <p style={{ fontFamily:MONO, fontSize:10, color:'#2a3040', marginBottom:8 }}>No applications tracked yet.</p>
              <button onClick={()=>{ setEditingApp(null); setModalOpen(true) }} style={{ fontFamily:MONO, fontSize:9, color:'#a3c9ff', background:'none', border:'none', cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase' }}>Add your first →</button>
            </div>
          ) : recentApps.map((app, i) => {
            const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
            return (
              <div key={app.id}
                style={{ display:'grid', gridTemplateColumns:'1fr 100px 90px 80px', gap:0, padding:'10px 18px', borderBottom:i<recentApps.length-1?'0.5px solid rgba(48,54,61,0.5)':'none', cursor:'pointer', transition:'background 0.15s' }}
                onClick={()=>{ setEditingApp(app); setModalOpen(true) }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(163,201,255,0.03)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:'#c0c7d5', lineHeight:1.2 }}>{app.job_title||'—'}</p>
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#5a6478', marginTop:2 }}>{app.company||'—'}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center' }}>
                  <span style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:sc.color, background:`${sc.color}12`, border:`0.5px solid ${sc.color}30`, padding:'3px 7px' }}>{sc.label}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center' }}>
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#3a4455' }}>{app.date_applied ? format(parseISO(app.date_applied),'MMM d') : '—'}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
                  <ChevronRight size={12} style={{ color:'#2a3040' }}/>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right: Updates feed */}
        <div style={{ background:'#161b22', border:'0.5px solid rgba(48,54,61,0.9)', overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'0.5px solid rgba(48,54,61,0.9)', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <Bell size={12} style={{ color:'#a3c9ff' }}/>
              <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.1em', color:'#8a919f', textTransform:'uppercase' }}>Updates</p>
            </div>
            {followUps.length > 0 && (
              <span style={{ fontFamily:MONO, fontSize:8, fontWeight:800, background:'#e56f03', color:'#fff', padding:'2px 6px' }}>{followUps.length}</span>
            )}
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'10px 0' }}>
            {/* Follow-ups */}
            {followUps.slice(0,4).map(app => (
              <div key={app.id}
                style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 16px', cursor:'pointer', borderBottom:'0.5px solid rgba(48,54,61,0.5)', transition:'background 0.15s' }}
                onClick={()=>{ setEditingApp(app); setModalOpen(true) }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,182,137,0.05)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#ffb689', marginTop:4, flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'#c0c7d5', marginBottom:2 }}>Follow-up due</p>
                  <p style={{ fontSize:11, color:'#8a919f' }}>{app.job_title} @ {app.company}</p>
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#ffb689', marginTop:3 }}>{format(parseISO(app.reminder_date),'MMM d, yyyy')}</p>
                </div>
              </div>
            ))}

            {/* Today's tasks */}
            {todayTasks.slice(0,2).map(t => (
              <div key={t.id}
                style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 16px', borderBottom:'0.5px solid rgba(48,54,61,0.5)' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#a3c9ff', marginTop:4, flexShrink:0 }}/>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:'#c0c7d5', marginBottom:2 }}>Task due today</p>
                  <p style={{ fontSize:11, color:'#8a919f' }}>{t.title}</p>
                </div>
              </div>
            ))}

            {/* Interview alerts */}
            {applications.filter(a=>a.status==='interview').slice(0,2).map(a => (
              <div key={a.id}
                style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 16px', borderBottom:'0.5px solid rgba(48,54,61,0.5)' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#4edea3', marginTop:4, flexShrink:0 }}/>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:'#c0c7d5', marginBottom:2 }}>Interview in progress</p>
                  <p style={{ fontSize:11, color:'#8a919f' }}>{a.job_title} @ {a.company}</p>
                </div>
              </div>
            ))}

            {followUps.length===0 && todayTasks.length===0 && applications.filter(a=>a.status==='interview').length===0 && (
              <div style={{ padding:'32px 16px', textAlign:'center' }}>
                <CheckCircle2 size={24} style={{ color:'#2a3040', margin:'0 auto 8px' }}/>
                <p style={{ fontFamily:MONO, fontSize:9, color:'#2a3040', letterSpacing:'0.06em' }}>All caught up — nothing due.</p>
              </div>
            )}
          </div>

          {/* AI quick actions */}
          <div style={{ borderTop:'0.5px solid rgba(48,54,61,0.9)', padding:'10px 12px', flexShrink:0 }}>
            <p style={{ fontFamily:MONO, fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'#3a4455', textTransform:'uppercase', marginBottom:8 }}>Quick AI</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
              {[
                { label:'Interview Coach', to:'/ai/interview-coach', color:'#ffb4ab' },
                { label:'Salary Intel',    to:'/ai/salary',          color:'#a3c9ff' },
                { label:'Cover Letter',    to:'/ai/cover-letter',    color:'#4edea3' },
                { label:'Offer Simulator', to:'/ai/negotiate',       color:'#4edea3' },
              ].map(({label,to,color})=>(
                <button key={to} onClick={()=>navigate(to)}
                  style={{ padding:'7px 8px', background:'rgba(255,255,255,0.02)', border:`0.5px solid ${color}20`, cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=`${color}08`; e.currentTarget.style.borderColor=`${color}40` }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor=`${color}20` }}>
                  <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color, letterSpacing:'0.04em', lineHeight:1.3 }}>{label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      <ApplicationModal open={modalOpen} onClose={()=>setModalOpen(false)} onSave={handleSave} onDelete={deleteApplication} initial={editingApp??{status:'wishlist'}}/>
      {quickPostOpen && <QuickPostModal onClose={()=>setQuickPostOpen(false)} onPublished={()=>{}}/>}

      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      </div>
    </div>
  )
}
