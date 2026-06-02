import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Bell, MessageSquare, Mic, DollarSign, TrendingUp,
  Building2, Link2, AlertTriangle, ChevronRight, Sparkles,
  BookOpen, Handshake, PenLine, ArrowRight, Target,
  CalendarDays, CheckSquare, PlayCircle, Zap, Trophy,
  LayoutGrid, BarChart3, GraduationCap, PenSquare, Library,
  Calendar as CalendarIcon
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { parseISO, isToday, isPast, format, subDays, startOfDay, isSameDay, addDays } from 'date-fns'
import { useApplications } from '../contexts/ApplicationContext'
import ApplicationModal from '../components/Modals/ApplicationModal'
import QuickPostModal from '../components/QuickPostModal'

/* ─── constants ─── */
const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

const HERO_TOOLS = [
  { to:'/ai/interview-coach', label:'Interview Coach', desc:'Live mock interview with a real AI hiring manager. Full scorecard.', icon:Mic,      accent:'#ffb4ab', tag:'APEX' },
  { to:'/ai/negotiate',       label:'Offer Simulator', desc:'Practice salary negotiation. AI plays the recruiter — you counter.',  icon:Handshake, accent:'#4edea3', tag:'APEX' },
  { to:'/cv/builder',         label:'CV Builder',      desc:'Build a polished, ATS-optimised CV from scratch in minutes.',         icon:PenLine,   accent:'#a3c9ff', tag:'PRO'  },
]

const MORE_TOOLS = [
  { to:'/ai/follow-up',      label:'Follow-up',      icon:MessageSquare, accent:'#ffb689' },
  { to:'/ai/salary',         label:'Salary Intel',   icon:DollarSign,    accent:'#a3c9ff' },
  { to:'/ai/market',         label:'Market Intel',   icon:TrendingUp,    accent:'#4edea3' },
  { to:'/ai/company',        label:'Company Brief',  icon:Building2,     accent:'#ffb689' },
  { to:'/ai/interview-prep', label:'Interview Prep', icon:BookOpen,      accent:'#ffb4ab' },
  { to:'/ai/linkedin',       label:'LinkedIn',       icon:Link2,         accent:'#4edea3' },
]

const STATS = [
  { key:'total',     label:'Total',      color:'#e2e2e8', accent:'rgba(226,226,232,0.12)' },
  { key:'applied',   label:'Applied',    color:'#a3c9ff', accent:'rgba(163,201,255,0.12)' },
  { key:'interview', label:'Interviews', color:'#ffb689', accent:'rgba(255,182,137,0.12)' },
  { key:'offer',     label:'Offers',     color:'#4edea3', accent:'rgba(78,222,163,0.12)'  },
  { key:'rejected',  label:'Rejected',   color:'#ffb4ab', accent:'rgba(255,180,171,0.12)' },
]

/* ─── helpers ─── */
function Spark({ data, color }) {
  const max = Math.max(...data, 1)
  const W=36, H=18, bw=6, gap=2
  return (
    <svg width={W} height={H}>
      {data.map((v,i) => {
        const h = Math.max((v/max)*H, v>0?3:1)
        return <rect key={i} x={i*(bw+gap)} y={H-h} width={bw} height={h} fill={i===data.length-1?color:`${color}55`} rx={1}/>
      })}
    </svg>
  )
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:'#161b22', border:'0.5px solid rgba(138,145,159,0.3)', padding:'6px 10px' }}>
      <p style={{ color:'#c0c7d5', fontFamily:MONO, fontSize:10, marginBottom:2 }}>{label}</p>
      <p style={{ color:'#a3c9ff', fontFamily:MONO, fontSize:13, fontWeight:600 }}>{payload[0].value}</p>
    </div>
  )
}

function useLocalStorage(key, initial) {
  const [val] = useState(() => {
    try { const s=localStorage.getItem(key); return s?JSON.parse(s):initial } catch { return initial }
  })
  return [val]
}

/* ══════════════════════════════════════════════════════════════ */
export default function Home() {
  const { applications, addApplication, updateApplication, deleteApplication, canAddMore } = useApplications()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingApp, setEditingApp]   = useState(null)
  const [quickPostOpen, setQuickPostOpen] = useState(false)

  const firstName = user?.user_metadata?.first_name || null
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    return h<12 ? 'Good morning' : h<17 ? 'Good afternoon' : 'Good evening'
  }, [])

  const stats = useMemo(() => ({
    total:     applications.length,
    applied:   applications.filter(a=>a.status==='applied').length,
    interview: applications.filter(a=>a.status==='interview').length,
    offer:     applications.filter(a=>a.status==='offer').length,
    rejected:  applications.filter(a=>a.status==='rejected').length,
  }), [applications])

  const sparkData = useMemo(() => {
    const weeks = Array.from({length:4}, (_,i) => {
      const start = startOfDay(subDays(new Date(),(3-i)*7+6))
      const end   = addDays(start,7)
      const week  = applications.filter(a => a.created_at && parseISO(a.created_at)>=start && parseISO(a.created_at)<end)
      return { total:week.length, applied:week.filter(a=>a.status==='applied').length, interview:week.filter(a=>a.status==='interview').length, offer:week.filter(a=>a.status==='offer').length, rejected:week.filter(a=>a.status==='rejected').length }
    })
    return { total:weeks.map(w=>w.total), applied:weeks.map(w=>w.applied), interview:weeks.map(w=>w.interview), offer:weeks.map(w=>w.offer), rejected:weeks.map(w=>w.rejected) }
  }, [applications])

  const thisWeekCount = useMemo(() => applications.filter(a => a.created_at && parseISO(a.created_at)>=startOfDay(subDays(new Date(),6))).length, [applications])
  const lastWeekCount = useMemo(() => applications.filter(a => { if(!a.created_at)return false; const d=parseISO(a.created_at); return d>=startOfDay(subDays(new Date(),13))&&d<startOfDay(subDays(new Date(),6)) }).length, [applications])
  const weekDelta = thisWeekCount - lastWeekCount

  const followUps = useMemo(() =>
    applications.filter(a => a.reminder_date && (isToday(parseISO(a.reminder_date))||isPast(parseISO(a.reminder_date))))
      .sort((a,b) => new Date(a.reminder_date)-new Date(b.reminder_date))
  , [applications])

  const weeklyData = useMemo(() =>
    Array.from({length:7}, (_,i) => {
      const date = startOfDay(subDays(new Date(),6-i))
      return { day:format(date,'EEE').toUpperCase(), count:applications.filter(a=>a.created_at&&isSameDay(parseISO(a.created_at),date)).length }
    })
  , [applications])

  const maxCount = Math.max(...weeklyData.map(d=>d.count),1)

  const handleSave = async (data) => {
    if (data.id) await updateApplication(data.id, data)
    else await addApplication({...data, status:data.status||'wishlist'})
  }

  /* calendar widget data */
  const [tasks]    = useLocalStorage('trackr_tasks',    [])
  const [goals]    = useLocalStorage('trackr_goals',    [])
  const [sessions] = useLocalStorage('trackr_sessions', [])
  const todayStr   = format(new Date(),'yyyy-MM-dd')
  const pendingTasks   = tasks.filter(t=>!t.done)
  const overdueTasks   = tasks.filter(t=>!t.done && t.due < todayStr)
  const todayTasks     = tasks.filter(t=>!t.done && t.due===todayStr)
  const todaySessions  = sessions.filter(s=>s.date===todayStr)
  const activeGoals    = goals.filter(g=>Number(g.progress)<Number(g.target))

  const SIDEBAR = [
    { label:'Start a Blog', icon:PenSquare,     action:()=>setQuickPostOpen(true) },
    { label:'Library',      icon:Library,        soon:true },
    { label:'Market',       icon:BarChart3,       soon:true },
    { label:'Skills',       icon:GraduationCap,   soon:true },
  ]

  return (
    <div style={{ fontFamily:SANS, display:'flex', gap:24, alignItems:'flex-start', maxWidth:1160, margin:'0 auto' }}>

      {/* ── Left sidebar ── */}
      <aside style={{ width:156, flexShrink:0, position:'sticky', top:72 }}>
        <nav style={{ display:'flex', flexDirection:'column', gap:1, paddingTop:8 }}>
          {SIDEBAR.map(({ label, icon:Icon, soon, action }) => (
            <button key={label} onClick={()=>{ if(soon)return; action?.() }}
              style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 10px', background:'transparent', border:'0.5px solid transparent', cursor:soon?'default':'pointer', textAlign:'left', transition:'all 0.15s', opacity:soon?0.35:1 }}
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
          <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#2a3040', textTransform:'uppercase', marginBottom:6 }}>Job Boards</p>
          <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
            {[
              { label:'LinkedIn',    url:'https://linkedin.com/jobs',            color:'#0a66c2' },
              { label:'Indeed',      url:'https://indeed.com',                   color:'#2164f3' },
              { label:'Glassdoor',   url:'https://glassdoor.com/Job/index.htm',  color:'#0caa41' },
              { label:'Wellfound',   url:'https://wellfound.com/jobs',           color:'#fb4f4f' },
              { label:'Levels.fyi',  url:'https://levels.fyi/jobs',              color:'#7c3aed' },
            ].map(({label,url,color}) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 8px', textDecoration:'none', border:'0.5px solid transparent', transition:'all 0.15s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=`${color}10`; e.currentTarget.style.borderColor=`${color}25` }}
                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent' }}>
                <div style={{ width:4, height:4, borderRadius:'50%', background:color, flexShrink:0, opacity:0.7 }}/>
                <span style={{ fontSize:11, fontWeight:500, color:'#6b7583', whiteSpace:'nowrap' }}>{label}</span>
              </a>
            ))}
          </div>
        </div>

        <div style={{ height:'0.5px', background:'rgba(163,201,255,0.05)', margin:'10px 10px' }}/>
        <p style={{ fontFamily:MONO, fontSize:7, color:'#1e2a3a', letterSpacing:'0.08em', textTransform:'uppercase', padding:'0 10px' }}>Trackr © 2026</p>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:14, paddingTop:8 }}>

        {/* ══ ROW 1: Greeting + CTA ══ */}
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontFamily:MONO, fontSize:9, fontWeight:600, letterSpacing:'0.1em', color:'#404753', textTransform:'uppercase', marginBottom:5 }}>
              {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
            </p>
            <h1 style={{ fontSize:30, fontWeight:900, letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:0 }}>
              <span style={{ color:'#e2e2e8' }}>{greeting}</span>
              {firstName && <span style={{ background:'linear-gradient(135deg,#a3c9ff,#4edea3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{`, ${firstName}`}</span>}
              <span style={{ color:'#e2e2e8' }}>.</span>
            </h1>
          </div>

          {canAddMore && (
            <button onClick={()=>{ setEditingApp(null); setModalOpen(true) }}
              style={{ position:'relative', display:'flex', alignItems:'center', gap:10, padding:'11px 22px 11px 14px', borderRadius:999, background:'linear-gradient(135deg,#1493ff,#6366f1)', border:'none', cursor:'pointer', boxShadow:'0 0 0 1px rgba(99,102,241,0.4),0 4px 24px rgba(20,147,255,0.35),0 0 40px rgba(99,102,241,0.15)', transition:'transform 0.2s,box-shadow 0.2s', overflow:'hidden' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 0 0 1px rgba(99,102,241,0.6),0 8px 32px rgba(20,147,255,0.5),0 0 60px rgba(99,102,241,0.25)' }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 0 0 1px rgba(99,102,241,0.4),0 4px 24px rgba(20,147,255,0.35),0 0 40px rgba(99,102,241,0.15)' }}>
              <span style={{ position:'absolute', inset:0, background:'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%)', backgroundSize:'200% 100%', animation:'shimmer 3s infinite', borderRadius:999, pointerEvents:'none' }}/>
              <span style={{ width:24, height:24, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Plus size={13} color="#fff" strokeWidth={2.5}/>
              </span>
              <span style={{ fontSize:13, fontWeight:700, color:'#fff', letterSpacing:'-0.01em', whiteSpace:'nowrap' }}>Track a role</span>
            </button>
          )}
        </div>

        {/* ══ ROW 2: Stats bar (5-col) ══ */}
        <section style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', background:'linear-gradient(160deg,#0d1f3c,#080f1e)', border:'0.5px solid rgba(163,201,255,0.07)', boxShadow:'0 8px 40px rgba(0,0,0,0.5)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% -20%,rgba(163,201,255,0.04),transparent 60%)', pointerEvents:'none' }}/>
          {STATS.map(({key,label,color,accent},idx) => {
            const val = stats[key]
            const empty = val===0
            const pct = key!=='total'&&stats.total>0 ? Math.round((val/stats.total)*100) : null
            const responseRate = key==='interview'&&stats.applied>0 ? Math.round((stats.interview/stats.applied)*100) : null
            const closeRate    = key==='offer'&&stats.interview>0   ? Math.round((stats.offer/stats.interview)*100)   : null
            let context=null
            if(key==='total')      context=weekDelta>0?{text:`+${weekDelta} this week`,up:true}:weekDelta<0?{text:`${weekDelta} vs last week`,up:false}:thisWeekCount>0?{text:`${thisWeekCount} this week`,up:null}:{text:'no activity',up:null}
            else if(key==='applied')   context=pct!==null?{text:`${pct}% of total`,up:null}:null
            else if(key==='interview') context=responseRate!==null?{text:`${responseRate}% rate`,up:responseRate>=15}:pct!==null?{text:`${pct}% of total`,up:null}:null
            else if(key==='offer')     context=closeRate!==null?{text:`${closeRate}% close`,up:closeRate>=30}:pct!==null?{text:`${pct}% of total`,up:null}:null
            else if(key==='rejected')  context=pct!==null?{text:`${pct}% of total`,up:pct<40}:null
            const ctxColor = context?.up===true?'#4edea3':context?.up===false?'#ffb4ab':'#3a4455'
            return (
              <div key={key} style={{ position:'relative', padding:'18px 18px 14px', borderRight:idx<4?'0.5px solid rgba(163,201,255,0.05)':'none', overflow:'hidden', transition:'background 0.25s' }}
                onMouseEnter={e=>e.currentTarget.style.background=`${color}06`} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ position:'absolute',top:0,left:0,right:0,height:2,pointerEvents:'none', background:empty?'rgba(138,145,159,0.06)':`linear-gradient(90deg,${color},${color}00)` }}/>
                {!empty&&<div style={{ position:'absolute',top:-20,left:-20,width:100,height:100,pointerEvents:'none',borderRadius:'50%',background:`radial-gradient(circle,${color}20,transparent 70%)`,filter:'blur(12px)' }}/>}
                <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:empty?'#1e2a3a':`${color}70`, marginBottom:8, position:'relative' }}>{label}</p>
                <p style={{ fontFamily:MONO, fontSize:38, fontWeight:800, letterSpacing:'-0.07em', lineHeight:1, marginBottom:6, position:'relative', background:empty?'none':`linear-gradient(135deg,#fff,${color})`, WebkitBackgroundClip:empty?'unset':'text', WebkitTextFillColor:empty?'rgba(138,145,159,0.1)':'transparent', filter:empty?'none':`drop-shadow(0 0 10px ${color}50)` }}>{val}</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative' }}>
                  <p style={{ fontFamily:MONO, fontSize:8, letterSpacing:'0.04em', color:ctxColor, minHeight:10 }}>
                    {context&&<>{context.up===true&&'↑ '}{context.up===false&&'↓ '}{context.text}</>}
                  </p>
                  {!empty&&<Spark data={sparkData[key]} color={color}/>}
                </div>
                {!empty&&<div style={{ position:'absolute',bottom:0,left:0,right:0,height:1 }}><div style={{ height:'100%', width:`${key==='total'?100:pct||0}%`, background:`linear-gradient(90deg,${color}60,${color}00)`, transition:'width 0.8s ease' }}/></div>}
              </div>
            )
          })}
        </section>

        {/* ══ ROW 3: Chart (left) + Right panel (follow-ups + calendar) ══ */}
        {applications.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:12, alignItems:'flex-start' }}>

            {/* ── Left: Weekly chart ── */}
            <div style={{ background:'linear-gradient(160deg,#0d1f3c,#080f1e)', border:'0.5px solid rgba(163,201,255,0.07)', boxShadow:'0 4px 24px rgba(0,0,0,0.3)', padding:'18px 20px 14px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.12em', color:'rgba(163,201,255,0.4)', textTransform:'uppercase', marginBottom:3 }}>Activity</p>
                  <p style={{ fontSize:14, fontWeight:600, color:'#e2e2e8', letterSpacing:'-0.01em' }}>Applications this week</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {weekDelta!==0&&(
                    <span style={{ fontFamily:MONO, fontSize:9, fontWeight:700, color:weekDelta>0?'#4edea3':'#ffb4ab', background:weekDelta>0?'rgba(78,222,163,0.08)':'rgba(255,180,171,0.08)', border:`0.5px solid ${weekDelta>0?'rgba(78,222,163,0.2)':'rgba(255,180,171,0.2)'}`, padding:'3px 8px' }}>
                      {weekDelta>0?'↑':'↓'} {Math.abs(weekDelta)} vs last week
                    </span>
                  )}
                  <div style={{ fontFamily:MONO, fontSize:28, fontWeight:800, letterSpacing:'-0.05em', background:'linear-gradient(135deg,#fff,#a3c9ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{thisWeekCount}</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyData} barSize={24} margin={{top:4,right:0,left:-28,bottom:0}}>
                  <XAxis dataKey="day" tick={{fontFamily:MONO,fontSize:8,fill:'#3a4455',fontWeight:600}} axisLine={false} tickLine={false}/>
                  <YAxis allowDecimals={false} tick={{fontFamily:MONO,fontSize:8,fill:'#3a4455'}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<ChartTooltip/>} cursor={{fill:'rgba(163,201,255,0.04)'}}/>
                  <Bar dataKey="count" radius={[3,3,0,0]}>
                    {weeklyData.map((e,i)=>(
                      <Cell key={i}
                        fill={e.count>0&&e.count===maxCount?'url(#peak)':e.count>0?'rgba(163,201,255,0.18)':'rgba(255,255,255,0.03)'}
                        stroke={e.count>0&&e.count===maxCount?'rgba(163,201,255,0.4)':'none'} strokeWidth={1}/>
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="peak" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a3c9ff" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#a3c9ff" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ── Right panel: Follow-ups + Calendar stacked ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

              {/* Follow-ups */}
              <div style={{ background:'linear-gradient(160deg,#1a1000,#080f1e)', border:'0.5px solid rgba(255,182,137,0.15)', padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <Bell size={11} style={{ color:'#ffb689' }}/>
                    <span style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'#ffb689', textTransform:'uppercase' }}>Follow-ups</span>
                    {followUps.length>0&&<span style={{ fontFamily:MONO, fontSize:8, fontWeight:800, background:'#e56f03', color:'#fff', padding:'1px 5px' }}>{followUps.length}</span>}
                  </div>
                  <button onClick={()=>navigate('/ai/follow-up')} style={{ fontFamily:MONO, fontSize:8, color:'#a3c9ff', background:'none', border:'none', cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:3 }}>
                    Write <ChevronRight size={9}/>
                  </button>
                </div>
                {followUps.length===0 ? (
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#2a3040' }}>No reminders due — you're clear.</p>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {followUps.slice(0,4).map(app=>(
                      <button key={app.id} onClick={()=>{ setEditingApp(app); setModalOpen(true) }}
                        style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'rgba(255,182,137,0.05)', border:'0.5px solid rgba(255,182,137,0.12)', cursor:'pointer', textAlign:'left', transition:'background 0.15s', width:'100%' }}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,182,137,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,182,137,0.05)'}>
                        <AlertTriangle size={10} style={{ color:'#ffb689', flexShrink:0 }}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:11, fontWeight:600, color:'#e2e2e8', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{app.job_title}</p>
                          <p style={{ fontFamily:MONO, fontSize:8, color:'#5a6478', marginTop:1 }}>{app.company} · {format(parseISO(app.reminder_date),'MMM d')}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Calendar preview */}
              <div style={{ background:'linear-gradient(160deg,#0d1f3c,#080f1e)', border:'0.5px solid rgba(163,201,255,0.07)', padding:'14px 16px', cursor:'pointer' }}
                onClick={()=>navigate('/calendar')}
                onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(163,201,255,0.2)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(163,201,255,0.07)'}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <CalendarDays size={11} style={{ color:'#a3c9ff' }}/>
                    <span style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'rgba(163,201,255,0.6)', textTransform:'uppercase' }}>Planner</span>
                  </div>
                  <span style={{ fontFamily:MONO, fontSize:8, color:'#3a4455', letterSpacing:'0.06em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:3 }}>Open <ArrowRight size={9}/></span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                  {[
                    { icon:CheckSquare, color:'#a3c9ff', val:pendingTasks.length,  sub:overdueTasks.length>0?`${overdueTasks.length} overdue`:todayTasks.length>0?'due today':'all clear' },
                    { icon:Target,      color:'#4edea3', val:activeGoals.length,   sub:'active goals' },
                    { icon:PlayCircle,  color:'#c4b5fd', val:todaySessions.length, sub:'sessions today' },
                  ].map(({icon:Icon,color,val,sub})=>(
                    <div key={sub} style={{ padding:'8px 10px', background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.04)' }}>
                      <Icon size={10} style={{ color, marginBottom:5 }}/>
                      <p style={{ fontFamily:MONO, fontSize:18, fontWeight:800, letterSpacing:'-0.04em', color, lineHeight:1, marginBottom:3 }}>{val}</p>
                      <p style={{ fontFamily:MONO, fontSize:7, color:'#3a4455', letterSpacing:'0.04em', textTransform:'uppercase' }}>{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ ROW 3 (empty state): full width hero ══ */}
        {applications.length===0 && (
          <section style={{ position:'relative', overflow:'hidden', background:'linear-gradient(160deg,#0d1f3c,#070d1a)', border:'0.5px solid rgba(163,201,255,0.08)', boxShadow:'0 8px 40px rgba(0,0,0,0.5)', padding:'52px 48px' }}>
            <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle,rgba(163,201,255,0.06) 1px,transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }}/>
            <div style={{ position:'absolute',top:0,left:'20%',right:'20%',height:1,background:'linear-gradient(90deg,transparent,rgba(163,201,255,0.3),transparent)',pointerEvents:'none' }}/>
            <div style={{ position:'absolute',top:-60,left:-60,width:260,height:260,borderRadius:'50%',background:'radial-gradient(circle,rgba(20,147,255,0.08),transparent 70%)',filter:'blur(24px)',pointerEvents:'none' }}/>
            <div style={{ position:'absolute',bottom:-40,right:-40,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(78,222,163,0.06),transparent 70%)',filter:'blur(20px)',pointerEvents:'none' }}/>
            <div style={{ position:'relative', maxWidth:520, margin:'0 auto', textAlign:'center' }}>
              <div style={{ width:52,height:52,margin:'0 auto 20px',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,rgba(20,147,255,0.15),rgba(78,222,163,0.08))',border:'0.5px solid rgba(163,201,255,0.2)',boxShadow:'0 0 32px rgba(20,147,255,0.15)' }}>
                <Target size={22} style={{ color:'#a3c9ff' }}/>
              </div>
              <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.16em', color:'rgba(163,201,255,0.5)', textTransform:'uppercase', marginBottom:10 }}>Pipeline Empty</p>
              <h2 style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:12, background:'linear-gradient(135deg,#fff 20%,#a3c9ff 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Your job search starts here.</h2>
              <p style={{ fontSize:13, color:'#3a4455', lineHeight:1.7, marginBottom:28 }}>Add your first application and Trackr does the rest — reminders, analytics, AI coaching, salary data.</p>
              <button onClick={()=>{ setEditingApp(null); setModalOpen(true) }}
                style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 28px', background:'linear-gradient(90deg,#1493ff,#0ea5e9)', border:'none', cursor:'pointer', color:'#fff', fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', boxShadow:'0 4px 24px rgba(20,147,255,0.35)', transition:'filter 0.15s,transform 0.15s', marginBottom:32 }}
                onMouseEnter={e=>{ e.currentTarget.style.filter='brightness(1.12)'; e.currentTarget.style.transform='translateY(-1px)' }}
                onMouseLeave={e=>{ e.currentTarget.style.filter='none'; e.currentTarget.style.transform='none' }}>
                <Plus size={12}/> Add First Application
              </button>
              <div style={{ display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap' }}>
                {[{icon:LayoutGrid,label:'Kanban'},{icon:Zap,label:'AI Tools'},{icon:Trophy,label:'Coaching'},{icon:BarChart3,label:'Analytics'}].map(({icon:Icon,label})=>(
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:'rgba(163,201,255,0.04)', border:'0.5px solid rgba(163,201,255,0.08)' }}>
                    <Icon size={9} style={{ color:'#3a4455' }}/>
                    <span style={{ fontFamily:MONO, fontSize:8, fontWeight:600, color:'#3a4455', letterSpacing:'0.06em' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ ROW 4: AI Tools — 3 hero cards + 6 pill row ══ */}
        <section>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <Sparkles size={12} style={{ color:'#a3c9ff' }}/>
              <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.12em', color:'rgba(163,201,255,0.6)', textTransform:'uppercase' }}>AI Toolkit</p>
            </div>
            <button onClick={()=>navigate('/ai')} style={{ display:'flex', alignItems:'center', gap:3, fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.08em', color:'#3a4455', textTransform:'uppercase', background:'none', border:'none', cursor:'pointer', transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#a3c9ff'} onMouseLeave={e=>e.currentTarget.style.color='#3a4455'}>
              All tools <ArrowRight size={9}/>
            </button>
          </div>

          {/* 3 hero cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2, marginBottom:2 }}>
            {HERO_TOOLS.map(({to,label,desc,icon:Icon,accent,tag})=>(
              <button key={to} onClick={()=>navigate(to)}
                style={{ position:'relative', textAlign:'left', padding:'18px 18px 14px', background:'linear-gradient(160deg,#0d1f3c,#080f1e)', border:'0.5px solid rgba(163,201,255,0.07)', cursor:'pointer', overflow:'hidden', transition:'border-color 0.2s,background 0.2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=`${accent}30`; e.currentTarget.style.background=`linear-gradient(160deg,${accent}08,#080f1e)` }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(163,201,255,0.07)'; e.currentTarget.style.background='linear-gradient(160deg,#0d1f3c,#080f1e)' }}>
                <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${accent},${accent}00)` }}/>
                <div style={{ position:'absolute',top:-16,left:-16,width:70,height:70,borderRadius:'50%',background:`radial-gradient(circle,${accent}18,transparent 70%)`,filter:'blur(8px)',pointerEvents:'none' }}/>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, position:'relative' }}>
                  <div style={{ width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',background:`${accent}12`,border:`0.5px solid ${accent}30` }}>
                    <Icon size={14} style={{ color:accent }}/>
                  </div>
                  <span style={{ fontFamily:MONO,fontSize:7,fontWeight:700,letterSpacing:'0.08em',background:tag==='APEX'?'linear-gradient(90deg,#4edea3,#a3c9ff)':'#1493ff',color:tag==='APEX'?'#0d1117':'#fff',padding:'2px 6px' }}>{tag}</span>
                </div>
                <p style={{ fontSize:12,fontWeight:700,color:'#e2e2e8',letterSpacing:'-0.01em',marginBottom:4,position:'relative' }}>{label}</p>
                <p style={{ fontSize:10,color:'#4a5568',lineHeight:1.5,marginBottom:10,position:'relative' }}>{desc}</p>
                <div style={{ display:'flex',alignItems:'center',gap:3,position:'relative' }}>
                  <span style={{ fontFamily:MONO,fontSize:8,fontWeight:700,letterSpacing:'0.08em',color:accent,textTransform:'uppercase' }}>Start</span>
                  <ArrowRight size={9} style={{ color:accent }}/>
                </div>
              </button>
            ))}
          </div>

          {/* 6 pill tools */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:2 }}>
            {MORE_TOOLS.map(({to,label,icon:Icon,accent})=>(
              <button key={to} onClick={()=>navigate(to)}
                style={{ display:'flex',alignItems:'center',gap:6,padding:'9px 12px',background:'#0a1628',border:'0.5px solid rgba(163,201,255,0.05)',cursor:'pointer',transition:'background 0.15s,border-color 0.15s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=`${accent}08`; e.currentTarget.style.borderColor=`${accent}20` }}
                onMouseLeave={e=>{ e.currentTarget.style.background='#0a1628'; e.currentTarget.style.borderColor='rgba(163,201,255,0.05)' }}>
                <Icon size={11} style={{ color:accent,flexShrink:0 }}/>
                <span style={{ fontFamily:MONO,fontSize:8,fontWeight:600,color:'#3a4455',letterSpacing:'0.04em',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{label}</span>
              </button>
            ))}
          </div>
        </section>

      </div>{/* end main */}

      <ApplicationModal open={modalOpen} onClose={()=>setModalOpen(false)} onSave={handleSave} onDelete={deleteApplication} initial={editingApp??{status:'wishlist'}}/>
      {quickPostOpen && <QuickPostModal onClose={()=>setQuickPostOpen(false)} onPublished={()=>{}}/>}

      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>
    </div>
  )
}
