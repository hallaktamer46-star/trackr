import { useState, useEffect, useMemo } from 'react' // v2
import { useNavigate } from 'react-router-dom'
import {
  Plus, Bell, AlertTriangle, ChevronRight, Sparkles,
  Mic, Handshake, PenLine, ArrowRight, Target,
  TrendingUp, TrendingDown, Briefcase, CheckCircle2,
  Clock, CalendarDays, DollarSign, BarChart3, Zap,
  BookOpen, Building2, MessageSquare, Link2, Activity,
  PenSquare, Library, GraduationCap, Newspaper, LayoutGrid,
  FileText, Mail, Brain, Users, LayoutList, Flame, X, SlidersHorizontal, RefreshCw
} from 'lucide-react'
import TaskModal from '../components/TaskModal'
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

const MONO = 'Consolas, Menlo, Monaco, monospace'
const SANS = "'Plus Jakarta Sans', system-ui, sans-serif"
const IMP_COLORS = { 1:'#4edea3', 2:'#a3c9ff', 3:'#fbbf24', 4:'#ffb689', 5:'#ffb4ab' }

const STATUS_CONFIG = {
  wishlist:  { label: 'Wishlist',  color: '#5888c8' },
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
          <p style={{ fontFamily:SANS, fontSize:22, fontWeight:900, letterSpacing:'-0.04em', color:'#fff', lineHeight:1 }}>{value}</p>
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

/* ─── Mini stat card ─── */
function MiniStatCard({ label, value, sub, color, data, pct, up, total }) {
  const dotCount = total != null ? Math.min(total, 24) : 0
  const filledDots = total != null && pct != null ? Math.round((pct / 100) * dotCount) : 0
  return (
    <div style={{
      background: '#0e1b2e',
      border: '0.5px solid rgba(0,140,255,0.15)',
      borderTop: `2px solid ${color}`,
      padding:'15px 16px', flex:1,
    }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:6 }}>
        <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.12em', color:`${color}99`, textTransform:'uppercase' }}>{label}</p>
        {pct != null && (
          <span style={{ display:'flex', alignItems:'center', gap:3, fontFamily:MONO, fontSize:9, fontWeight:700, color:up?'#4edea3':'#ffb4ab', background:up?'rgba(78,222,163,0.12)':'rgba(255,180,171,0.12)', border:`0.5px solid ${up?'rgba(78,222,163,0.3)':'rgba(255,180,171,0.3)'}`, padding:'2px 6px' }}>
            {up?<TrendingUp size={8}/>:<TrendingDown size={8}/>} {pct}%
          </span>
        )}
      </div>
      <p style={{ fontFamily:SANS, fontSize:28, fontWeight:900, letterSpacing:'-0.04em', color, lineHeight:1, marginBottom:4 }}>{value}</p>
      <p style={{ fontFamily:MONO, fontSize:9, color:'#1a3452', marginBottom:10 }}>{sub}</p>

      {/* Dot grid — neutral squares, filled vs dim */}
      {dotCount > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
          {Array.from({ length: dotCount }, (_, i) => (
            <div key={i} style={{
              width: 7, height: 7,
              borderRadius: 2,
              background: i < filledDots ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.06)',
            }}/>
          ))}
        </div>
      )}

      {/* Sparkline for time-type data */}
      {dotCount === 0 && data && data.length > 0 && (
        <ResponsiveContainer width="100%" height={42}>
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

/* ─── Stat bar — bold number + animated glow fill, no circles ─── */
function StatBar({ label, value, total, color, sub }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  const [w, setW] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(pct))
    return () => cancelAnimationFrame(id)
  }, [pct])
  return (
    <div style={{ flex:1, padding:'14px 16px', display:'flex', flexDirection:'column', justifyContent:'center', gap:3 }}>
      <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color:`${color}bb`, textTransform:'uppercase', letterSpacing:'0.12em' }}>{label}</p>
      <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
        <span style={{ fontFamily:SANS, fontSize:26, fontWeight:900, letterSpacing:'-0.04em', color, lineHeight:1 }}>{value}</span>
        <span style={{ fontFamily:SANS, fontSize:9, color:`${color}45` }}>/ {total}</span>
      </div>
      <div style={{ height:4, background:`${color}15`, borderRadius:2, overflow:'hidden', margin:'6px 0 4px' }}>
        <div style={{
          height:'100%', width:`${w}%`,
          background:`linear-gradient(90deg, ${color}70, ${color})`,
          boxShadow:`0 0 10px ${color}80`,
          borderRadius:2,
          transition:'width 0.9s cubic-bezier(0.22,1,0.36,1)',
        }}/>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontFamily:SANS, fontSize:16, fontWeight:900, color, letterSpacing:'-0.03em' }}>{pct}%</span>
        {sub && <span style={{ fontFamily:MONO, fontSize:7, color:'#1a3452' }}>{sub}</span>}
      </div>
    </div>
  )
}

/* ─── Tooltip ─── */
const ChartTip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:'#0d1117', border:'0.5px solid rgba(163,201,255,0.2)', padding:'6px 10px' }}>
      <p style={{ color:'#2a5070', fontFamily:MONO, fontSize:9, marginBottom:2 }}>{label}</p>
      <p style={{ color:'#a3c9ff', fontFamily:MONO, fontSize:12, fontWeight:700 }}>{payload[0].value}</p>
    </div>
  )
}
const HoursTip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  const h = Math.floor(payload[0].value), m = Math.round((payload[0].value - h)*60)
  return (
    <div style={{ background:'#0d1117', border:'0.5px solid rgba(167,139,250,0.25)', padding:'6px 10px' }}>
      <p style={{ color:'#2a5070', fontFamily:MONO, fontSize:9, marginBottom:2 }}>{label}</p>
      <p style={{ color:'#a78bfa', fontFamily:MONO, fontSize:12, fontWeight:700 }}>{h>0?`${h}h ${m}m`:`${m}m`}</p>
    </div>
  )
}

/* ─── Custom KPI options ─── */
const DEFAULT_KPIS = ['total_apps', 'interviews', 'hours_today', 'tasks_today']
const KPI_CATEGORY_ORDER = ['Jobs', 'Time', 'Tasks', 'Personal']
const KPI_OPTIONS = [
  { id:'total_apps',    label:'Total Applications', category:'Jobs',     icon:Briefcase,   gradient:'linear-gradient(135deg,#1a6bff,#6366f1)',
    compute: d => ({ value:d.stats.total,     sub:`${d.thisWeek} added this week`,       trend:d.thisWeek>0?Math.round((d.thisWeek/(d.lastWeek||1))*100)-100:null, trendUp:d.thisWeek>=d.lastWeek }) },
  { id:'applied',       label:'Applied',            category:'Jobs',     icon:Target,      gradient:'linear-gradient(135deg,#0ea5e9,#38bdf8)',
    compute: d => ({ value:d.stats.applied,   sub:`${d.stats.wishlist} in wishlist`,     trend:d.stats.total>0?Math.round((d.stats.applied/d.stats.total)*100):null, trendUp:true }) },
  { id:'interviews',    label:'Interviews',          category:'Jobs',     icon:CalendarDays,gradient:'linear-gradient(135deg,#f59e0b,#fb923c)',
    compute: d => ({ value:d.stats.interview, sub:`${d.responseRate}% response rate`,    trend:d.responseRate, trendUp:d.responseRate>=15 }) },
  { id:'offers',        label:'Offers',              category:'Jobs',     icon:DollarSign,  gradient:'linear-gradient(135deg,#10b981,#4edea3)',
    compute: d => ({ value:d.stats.offer,     sub:`${d.offerRate}% interview-to-offer`,  trend:d.offerRate,    trendUp:d.offerRate>=30 }) },
  { id:'response_rate', label:'Response Rate',       category:'Jobs',     icon:TrendingUp,  gradient:'linear-gradient(135deg,#6366f1,#8b5cf6)',
    compute: d => ({ value:`${d.responseRate}%`, sub:`${d.stats.applied} applied`,       trend:null }) },
  { id:'hours_today',   label:'Hours Today',         category:'Time',     icon:Clock,       gradient:'linear-gradient(135deg,#7c3aed,#a78bfa)',
    compute: d => { const h=Math.floor(d.todayTotalSecs/3600),m=Math.floor((d.todayTotalSecs%3600)/60); return { value:h>0?`${h}h ${m}m`:`${m}m`, sub:d.currentStatus?`Active: ${d.currentStatus}`:'Not clocked in', trend:null } }},
  { id:'hours_week',    label:'Hours This Week',     category:'Time',     icon:Activity,    gradient:'linear-gradient(135deg,#0284c7,#38bdf8)',
    compute: d => { const h=Math.floor(d.weekTotalSecs/3600); return { value:`${h}h`, sub:`${d.weekDays} day${d.weekDays!==1?'s':''} logged`, trend:null } }},
  { id:'avg_daily',     label:'Avg Daily Hours',     category:'Time',     icon:BarChart3,   gradient:'linear-gradient(135deg,#0f766e,#2dd4bf)',
    compute: d => { const h=Math.floor(d.avgDailySecs/3600),m=Math.floor((d.avgDailySecs%3600)/60); return { value:h>0?`${h}h ${m}m`:`${m}m`, sub:'7-day average', trend:null } }},
  { id:'tasks_today',   label:'Tasks Due Today',     category:'Tasks',    icon:CheckCircle2,gradient:'linear-gradient(135deg,#16a34a,#4edea3)',
    compute: d => ({ value:d.tasksDueToday,   sub:`${d.tasksPending} total pending`,    trend:null }) },
  { id:'tasks_done',    label:'Completed Tasks',     category:'Tasks',    icon:Zap,         gradient:'linear-gradient(135deg,#ca8a04,#fbbf24)',
    compute: d => ({ value:d.tasksCompleted,  sub:`${d.tasksPending} still pending`,    trend:null }) },
  { id:'active_goals',  label:'Active Goals',        category:'Personal', icon:Target,      gradient:'linear-gradient(135deg,#be185d,#f472b6)',
    compute: d => ({ value:d.activeGoals,     sub:`${d.goalsCompleted} completed`,      trend:null }) },
  { id:'sessions_today',label:"Today's Sessions",    category:'Personal', icon:BookOpen,    gradient:'linear-gradient(135deg,#92400e,#fb923c)',
    compute: d => ({ value:d.todaySessCount,  sub:`${d.totalSessions} total logged`,    trend:null }) },
]

/* ══════════════════════════════════════════════════════════════ */
export default function Home() {
  const { applications, addApplication, updateApplication, deleteApplication, canAddMore } = useApplications()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState(null)
  const [quickPostOpen, setQuickPostOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [kpiConfig, setKpiConfig] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('trackr_kpi_config')); if (Array.isArray(s) && s.length === 4) return s } catch {}
    return DEFAULT_KPIS
  })
  const [kpiCustomizeOpen, setKpiCustomizeOpen] = useState(false)
  const [kpiDraft, setKpiDraft] = useState([])
  function handleTaskSave(taskData) {
    const task = {
      id: taskData.id || Date.now().toString(),
      title: taskData.title,
      due: taskData.due,
      priority: taskData.priority,
      note: taskData.note,
      done: false,
      createdAt: new Date().toISOString(),
    }
    try {
      const existing = JSON.parse(localStorage.getItem('trackr_tasks') || '[]')
      localStorage.setItem('trackr_tasks', JSON.stringify([...existing, task]))
      window.dispatchEvent(new CustomEvent('trackr-tasks-updated'))
    } catch {}
    setTaskModalOpen(false)
  }

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

  const kpiData = useMemo(() => {
    let engageData = {}
    let history = []
    try { engageData = JSON.parse(localStorage.getItem('trackr_engage_v2') || '{}') } catch {}
    try { history = JSON.parse(localStorage.getItem('trackr_history') || '[]') } catch {}
    const todayRecord = history.find(r => r.date === todayStr) || { total: 0 }
    const lastEntry = engageData.log?.length ? engageData.log[engageData.log.length - 1] : null
    const currentSecs = (lastEntry && !lastEntry.end && engageData.shiftStart)
      ? Math.floor((Date.now() - lastEntry.start) / 1000) : 0
    const todayTotalSecs = (todayRecord.total || 0) + currentSecs
    const weekStart = startOfDay(subDays(new Date(), 6))
    const weekHistory = history.filter(r => new Date(r.date) >= weekStart)
    const weekDays = weekHistory.length
    const weekTotalSecs = weekHistory.reduce((s, r) => s + (r.total || 0), 0)
    const avgDailySecs = weekDays > 0 ? Math.floor(weekTotalSecs / weekDays) : 0
    return {
      stats, thisWeek, lastWeek, responseRate, offerRate,
      todayTotalSecs, weekTotalSecs, weekDays, avgDailySecs,
      currentStatus: engageData.status || null,
      tasksDueToday: tasks.filter(t => !t.done && t.due === todayStr).length,
      tasksPending:  tasks.filter(t => !t.done).length,
      tasksCompleted: tasks.filter(t => t.done).length,
      activeGoals:   goals.filter(g => !g.done && !g.completed).length,
      goalsCompleted: goals.filter(g => g.done || g.completed).length,
      todaySessCount: todaySess.length,
      totalSessions:  sessions.length,
      weeklyHoursChart: Array.from({length:7}, (_,i) => {
        const date = startOfDay(subDays(new Date(), 6-i))
        const dateStr = format(date, 'yyyy-MM-dd')
        const record = history.find(r => r.date === dateStr)
        return { day: format(date, 'EEE'), hours: record ? +(record.total/3600).toFixed(1) : 0 }
      }),
    }
  }, [applications, tasks, goals, sessions, todaySess, todayStr, stats, thisWeek, lastWeek, responseRate, offerRate, refreshKey])

  const maxHours     = Math.max(...(kpiData.weeklyHoursChart||[]).map(d=>d.hours), 0.1)

  function handleRefresh() {
    if (isRefreshing) return
    setIsRefreshing(true)
    setTimeout(() => {
      setRefreshKey(k => k + 1)
      setIsRefreshing(false)
    }, 600)
  }

  function saveKpiConfig(config) {
    localStorage.setItem('trackr_kpi_config', JSON.stringify(config))
    setKpiConfig(config)
    setKpiCustomizeOpen(false)
  }

  const SIDEBAR_LINKS = [
    { label:'Jobs',         icon:Briefcase,    action:()=>navigate('/jobs') },
    { label:'Calendar',     icon:CalendarDays,  action:()=>navigate('/calendar') },
    { label:'Life Plan',    icon:LayoutList,    action:()=>navigate('/life') },
    { label:'Daily Debrief',icon:Flame,         action:()=>navigate('/debrief') },
    { label:'Library',      icon:Library,       action:()=>navigate('/library') },
    { label:'Market',       icon:BarChart3,      soon:true },
    { label:'Skills',       icon:GraduationCap,  soon:true },
    { label:'Roadmap',       icon:Target,        action:()=>navigate('/roadmap') },
    { label:'Community',    icon:Newspaper,     action:()=>navigate('/blog') },
    { label:'Mental Clarity', icon:Brain,       action:()=>navigate('/clarity') },
    { label:'Round Table',  icon:Users,         action:()=>navigate('/roundtable') },
  ]

  const CV_LINKS = [
    { label:'CV Builder',   icon:PenLine,   action:()=>navigate('/cv/builder'),      accent:'#a3c9ff', tag:'PRO'  },
    { label:'CV Reviewer',  icon:FileText,  action:()=>navigate('/cv/reviewer'),     accent:'#4edea3', tag:'FREE' },
    { label:'Cover Letter', icon:Mail,      action:()=>navigate('/cv/cover-letter'), accent:'#ffb689', tag:'PRO'  },
  ]

  return (
    <div style={{ fontFamily:SANS, maxWidth:1280, margin:'0 auto', paddingTop:4 }}>

      {/* ── Left sidebar removed — now global via Layout ── */}
      <aside style={{ display:'none' }}>
        {/* Drop a thought */}
        <button onClick={() => setQuickPostOpen(true)}
          style={{ display:'flex', alignItems:'center', gap:7, width:'100%', padding:'8px 10px', margin:'8px 0 4px', background:'rgba(163,201,255,0.04)', border:'0.5px solid rgba(163,201,255,0.12)', borderRadius:6, cursor:'pointer', transition:'all 0.15s', textAlign:'left' }}
          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(163,201,255,0.08)'; e.currentTarget.style.borderColor='rgba(163,201,255,0.22)' }}
          onMouseLeave={e=>{ e.currentTarget.style.background='rgba(163,201,255,0.04)'; e.currentTarget.style.borderColor='rgba(163,201,255,0.12)' }}>
          <PenSquare size={12} style={{ color:'#a3c9ff', flexShrink:0 }}/>
          <span style={{ fontFamily:SANS, fontSize:11, color:'#4a5568', fontWeight:400, whiteSpace:'nowrap' }}>Drop a thought…</span>
        </button>
        <nav style={{ display:'flex', flexDirection:'column', gap:1 }}>
          {SIDEBAR_LINKS.map(({ label, icon:Icon, soon, action }) => (
            <button key={label} onClick={()=>{ if(soon)return; action?.() }}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'transparent', border:'0.5px solid transparent', cursor:soon?'default':'pointer', textAlign:'left', transition:'all 0.15s', opacity:soon?0.35:1 }}
              onMouseEnter={e=>{ if(!soon){ e.currentTarget.style.background='rgba(163,201,255,0.04)'; e.currentTarget.style.borderColor='rgba(163,201,255,0.08)' }}}
              onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent' }}>
              <Icon size={13} style={{ color:'#5878b0', flexShrink:0 }}/>
              <div>
                <p style={{ fontSize:12, fontWeight:500, color:'#5878b0', letterSpacing:'-0.01em', whiteSpace:'nowrap' }}>{label}</p>
                {soon && <p style={{ fontFamily:MONO, fontSize:7, color:'#0e1e2e', letterSpacing:'0.06em', marginTop:1 }}>SOON</p>}
              </div>
            </button>
          ))}
        </nav>

        {/* CV Hub section */}
        <div style={{ height:'0.5px', background:'rgba(163,201,255,0.05)', margin:'10px 10px' }}/>
        <p style={{ fontFamily:MONO, fontSize:7, fontWeight:700, color:'#2a3a50', letterSpacing:'0.1em', textTransform:'uppercase', padding:'6px 10px 4px' }}>CV Hub</p>
        {CV_LINKS.map(({ label, icon:Icon, action, accent, tag }) => (
          <button key={label} onClick={action}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', background:'transparent', border:'0.5px solid transparent', cursor:'pointer', textAlign:'left', transition:'all 0.15s', width:'100%' }}
            onMouseEnter={e=>{ e.currentTarget.style.background=`${accent}06`; e.currentTarget.style.borderColor=`${accent}15` }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent' }}>
            <Icon size={13} style={{ color: accent, flexShrink:0 }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:12, fontWeight:500, color:'#5878b0', letterSpacing:'-0.01em', whiteSpace:'nowrap' }}>{label}</p>
            </div>
            <span style={{ fontFamily:MONO, fontSize:6, fontWeight:700, color:accent, background:`${accent}12`, border:`0.5px solid ${accent}25`, padding:'1px 4px', letterSpacing:'0.06em', flexShrink:0 }}>{tag}</span>
          </button>
        ))}

        <div style={{ height:'0.5px', background:'rgba(163,201,255,0.05)', margin:'10px 10px' }}/>
        <p style={{ fontFamily:MONO, fontSize:7, color:'#1e2a3a', letterSpacing:'0.08em', textTransform:'uppercase', padding:'0 10px' }}>Trackr © 2026</p>
      </aside>

      {/* ── Main dashboard ── */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

      {/* ══ Header row ══ */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <p style={{ fontFamily:MONO, fontSize:11, fontWeight:700, color:'rgba(0,212,255,0.5)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:6 }}>
            {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
          </p>
          <h1 style={{ fontSize:28, fontWeight:900, letterSpacing:'-0.03em', color:'#ffffff', lineHeight:1 }}>
            {greeting}{firstName
              ? <>, <span style={{ background:'linear-gradient(135deg,#a3c9ff,#4edea3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{firstName}</span></>
              : ''}.
          </h1>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, justifyContent:'space-between', alignSelf:'stretch' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <button
              onClick={handleRefresh}
              title="Refresh dashboard"
              style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(163,201,255,0.12)', borderRadius:8, cursor:'pointer', color:'rgba(163,201,255,0.45)', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(163,201,255,0.07)'; e.currentTarget.style.color='rgba(163,201,255,0.8)'; e.currentTarget.style.borderColor='rgba(163,201,255,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.color='rgba(163,201,255,0.45)'; e.currentTarget.style.borderColor='rgba(163,201,255,0.12)' }}
            >
              <RefreshCw size={13} style={{ transition:'transform 0.6s ease', transform: isRefreshing ? 'rotate(-360deg)' : 'rotate(0deg)' }}/>
            </button>
            <button
              onClick={() => { setKpiDraft(kpiConfig); setKpiCustomizeOpen(true) }}
              title="Customize KPIs"
              style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.28)', borderRadius:8, cursor:'pointer', color:'rgba(0,212,255,0.75)', transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(0,212,255,0.15)'; e.currentTarget.style.color='#00d4ff'; e.currentTarget.style.borderColor='rgba(0,212,255,0.5)'; e.currentTarget.style.boxShadow='0 0 14px rgba(0,212,255,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(0,212,255,0.08)'; e.currentTarget.style.color='rgba(0,212,255,0.75)'; e.currentTarget.style.borderColor='rgba(0,212,255,0.28)'; e.currentTarget.style.boxShadow='none' }}
            >
              <SlidersHorizontal size={14}/>
            </button>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={() => setTaskModalOpen(true)}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', background:'linear-gradient(135deg,#10b981,#4edea3)', border:'none', borderRadius:8, cursor:'pointer', boxShadow:'0 0 0 1px rgba(78,222,163,0.4),0 4px 20px rgba(16,185,129,0.3)', transition:'transform 0.15s,filter 0.15s' }}
              onMouseEnter={e=>{ e.currentTarget.style.filter='brightness(1.1)'; e.currentTarget.style.transform='translateY(-1px)' }}
              onMouseLeave={e=>{ e.currentTarget.style.filter='none'; e.currentTarget.style.transform='none' }}>
              <Plus size={13} color="#fff" strokeWidth={2.5}/>
              <span style={{ fontFamily:MONO, fontSize:10, fontWeight:700, color:'#fff', letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap' }}>Add Task</span>
            </button>
            {canAddMore && (
              <button onClick={()=>{ setEditingApp(null); setModalOpen(true) }}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', background:'linear-gradient(135deg,#1493ff,#6366f1)', border:'none', borderRadius:8, cursor:'pointer', boxShadow:'0 0 0 1px rgba(99,102,241,0.4),0 4px 20px rgba(20,147,255,0.3)', transition:'transform 0.15s,filter 0.15s', position:'relative', overflow:'hidden' }}
                onMouseEnter={e=>{ e.currentTarget.style.filter='brightness(1.1)'; e.currentTarget.style.transform='translateY(-1px)' }}
                onMouseLeave={e=>{ e.currentTarget.style.filter='none'; e.currentTarget.style.transform='none' }}>
                <Plus size={13} color="#fff" strokeWidth={2.5}/>
                <span style={{ fontFamily:MONO, fontSize:10, fontWeight:700, color:'#fff', letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap' }}>Track a Role</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══ ROW 1: Configurable KPI cards ══ */}
      <div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {kpiConfig.map(id => {
            const opt = KPI_OPTIONS.find(o => o.id === id)
            if (!opt) return null
            const d = opt.compute(kpiData)
            return <KPICard key={id} label={opt.label} value={d.value} sub={d.sub} icon={opt.icon} gradient={opt.gradient} trend={d.trend} trendUp={d.trendUp}/>
          })}
        </div>
      </div>

      {/* ══ ROW 2: Big chart | Mini stats | Goals ══ */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 200px 200px', gap:12 }}>

        {/* Left: Hours worked chart */}
        <div style={{ background:'#0e1b2e', border:'0.5px solid rgba(100,120,255,0.2)', borderTop:'2px solid #a78bfa', padding:'18px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.14em', color:'#a78bfa', textTransform:'uppercase', marginBottom:4 }}>Activity</p>
              <p style={{ fontSize:18, fontWeight:800, color:'#ffffff', letterSpacing:'-0.02em' }}>Hours Worked</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontFamily:MONO, fontSize:9, fontWeight:700, color:'#a78bfa', background:'rgba(167,139,250,0.1)', border:'0.5px solid rgba(167,139,250,0.25)', padding:'3px 8px' }}>
                {Math.floor(kpiData.weekTotalSecs/3600)}h this week
              </span>
              <span style={{ fontFamily:SANS, fontSize:28, fontWeight:900, letterSpacing:'-0.05em', background:'linear-gradient(135deg,#fff,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                {(() => { const h=Math.floor(kpiData.todayTotalSecs/3600),m=Math.floor((kpiData.todayTotalSecs%3600)/60); return h>0?`${h}h`:`${m}m` })()}
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={kpiData.weeklyHoursChart} barSize={28} margin={{top:4,right:0,left:-18,bottom:0}}>
              <XAxis dataKey="day" tick={{fontFamily:MONO,fontSize:8,fill:'#1a3452',fontWeight:600}} axisLine={false} tickLine={false}/>
              <YAxis allowDecimals={true} tick={{fontFamily:MONO,fontSize:8,fill:'#1a3452'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}h`}/>
              <Tooltip content={<HoursTip/>} cursor={{fill:'rgba(167,139,250,0.04)'}}/>
              <Bar dataKey="hours" radius={[4,4,0,0]}>
                {kpiData.weeklyHoursChart.map((e,i)=>(
                  <Cell key={i}
                    fill={e.hours>0&&e.hours===maxHours?'url(#peakH)':e.hours>0?'rgba(167,139,250,0.22)':'rgba(255,255,255,0.03)'}
                    stroke={e.hours>0&&e.hours===maxHours?'rgba(167,139,250,0.5)':'none'} strokeWidth={1}/>
                ))}
              </Bar>
              <defs>
                <linearGradient id="peakH" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.95}/>
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Middle: 2 stacked mini stat cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <MiniStatCard
            label="Hours Today"
            value={(() => { const h=Math.floor(kpiData.todayTotalSecs/3600),m=Math.floor((kpiData.todayTotalSecs%3600)/60); return h>0?`${h}h ${m}m`:`${m}m` })()}
            sub={kpiData.currentStatus ? `Active: ${kpiData.currentStatus}` : 'Not clocked in'}
            color="#a78bfa"
            data={kpiData.weeklyHoursChart.map(d=>({v:d.hours}))}
            pct={null} up={true}
          />
          <MiniStatCard
            label="Tasks Done"
            value={kpiData.tasksCompleted}
            sub={`${kpiData.tasksPending} still pending`}
            color="#4edea3"
            data={null}
            pct={kpiData.tasksCompleted+kpiData.tasksPending>0?Math.round((kpiData.tasksCompleted/(kpiData.tasksCompleted+kpiData.tasksPending))*100):null}
            total={kpiData.tasksCompleted+kpiData.tasksPending}
            up={true}
          />
        </div>

        {/* Right: Goals & tasks donuts */}
        <div style={{ background:'#0e1b2e', border:'0.5px solid rgba(78,222,163,0.2)', borderTop:'2px solid #4edea3', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'12px 14px 8px', borderBottom:'0.5px solid rgba(0,120,255,0.1)' }}>
            <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.14em', color:'#4edea3', textTransform:'uppercase' }}>Progress</p>
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
            <div style={{ borderBottom:'0.5px solid rgba(0,120,255,0.1)' }}>
              <StatBar label="Goals Done" value={kpiData.goalsCompleted} total={Math.max(kpiData.activeGoals+kpiData.goalsCompleted,1)} color="#f472b6" sub={`of ${kpiData.activeGoals+kpiData.goalsCompleted} goals`}/>
            </div>
            <StatBar label="Tasks Done" value={kpiData.tasksCompleted} total={Math.max(kpiData.tasksCompleted+kpiData.tasksPending,1)} color="#4edea3" sub={`of ${kpiData.tasksCompleted+kpiData.tasksPending} tasks`}/>
          </div>
        </div>
      </div>

      {/* ══ ROW 3: Recent apps table | Updates feed ══ */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:12 }}>

        {/* Left: Recent applications table */}
        <div style={{ background:'#0e1b2e', border:'0.5px solid rgba(163,201,255,0.2)', borderTop:'2px solid #60a5fa', overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'0.5px solid rgba(0,120,255,0.1)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Activity size={13} style={{ color:'#60a5fa' }}/>
              <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.12em', color:'#60a5fa', textTransform:'uppercase' }}>Recent Applications</p>
            </div>
            <button onClick={()=>navigate('/board')} style={{ fontFamily:MONO, fontSize:8, color:'#a3c9ff', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:3, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              View board <ArrowRight size={9}/>
            </button>
          </div>

          {/* Table header */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 90px 80px', gap:0, padding:'8px 18px', borderBottom:'0.5px solid rgba(0,120,255,0.1)' }}>
            {['Role / Company','Status','Date',''].map((h,i)=>(
              <p key={i} style={{ fontFamily:MONO, fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'#1a3452', textTransform:'uppercase' }}>{h}</p>
            ))}
          </div>

          {recentApps.length === 0 ? (
            <div style={{ padding:'40px 18px', textAlign:'center' }}>
              <p style={{ fontFamily:MONO, fontSize:10, color:'#1a3452', marginBottom:8 }}>No applications tracked yet.</p>
              <button onClick={()=>{ setEditingApp(null); setModalOpen(true) }} style={{ fontFamily:MONO, fontSize:9, color:'#a3c9ff', background:'none', border:'none', cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase' }}>Add your first →</button>
            </div>
          ) : recentApps.map((app, i) => {
            const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
            return (
              <div key={app.id}
                style={{ display:'grid', gridTemplateColumns:'1fr 100px 90px 80px', gap:0, padding:'10px 18px', borderBottom:i<recentApps.length-1?'0.5px solid rgba(0,100,200,0.08)':'none', cursor:'pointer', transition:'background 0.15s' }}
                onClick={()=>{ setEditingApp(app); setModalOpen(true) }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(163,201,255,0.03)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:'#98b8cc', lineHeight:1.2 }}>{app.job_title||'—'}</p>
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#2a5070', marginTop:2 }}>{app.company||'—'}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center' }}>
                  <span style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:sc.color, background:`${sc.color}12`, border:`0.5px solid ${sc.color}30`, padding:'3px 7px' }}>{sc.label}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center' }}>
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#1a3452' }}>{app.date_applied ? format(parseISO(app.date_applied),'MMM d') : '—'}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
                  <ChevronRight size={12} style={{ color:'#0e1e2e' }}/>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right: Updates feed */}
        <div style={{ background:'#0e1b2e', border:'0.5px solid rgba(255,182,137,0.2)', borderTop:'2px solid #ffb689', overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'0.5px solid rgba(0,120,255,0.1)', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <Bell size={12} style={{ color:'#a3c9ff' }}/>
              <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.12em', color:'#ffb689', textTransform:'uppercase' }}>Updates</p>
            </div>
            {followUps.length > 0 && (
              <span style={{ fontFamily:MONO, fontSize:8, fontWeight:800, background:'#e56f03', color:'#fff', padding:'2px 6px' }}>{followUps.length}</span>
            )}
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'10px 0' }}>
            {/* Follow-ups */}
            {followUps.slice(0,4).map(app => (
              <div key={app.id}
                style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 16px', cursor:'pointer', borderBottom:'0.5px solid rgba(0,100,200,0.08)', transition:'background 0.15s' }}
                onClick={()=>{ setEditingApp(app); setModalOpen(true) }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,182,137,0.05)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#ffb689', marginTop:4, flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'#98b8cc', marginBottom:2 }}>Follow-up due</p>
                  <p style={{ fontSize:11, color:'#5878b0' }}>{app.job_title} @ {app.company}</p>
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#ffb689', marginTop:3 }}>{format(parseISO(app.reminder_date),'MMM d, yyyy')}</p>
                </div>
              </div>
            ))}

            {/* Today's tasks */}
            {todayTasks.slice(0,2).map(t => (
              <div key={t.id}
                style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 16px', borderBottom:'0.5px solid rgba(0,100,200,0.08)' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#a3c9ff', marginTop:4, flexShrink:0 }}/>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:'#98b8cc', marginBottom:2 }}>Task due today</p>
                  <p style={{ fontSize:11, color:'#5878b0' }}>{t.title}</p>
                </div>
              </div>
            ))}

            {/* Interview alerts */}
            {applications.filter(a=>a.status==='interview').slice(0,2).map(a => (
              <div key={a.id}
                style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 16px', borderBottom:'0.5px solid rgba(0,100,200,0.08)' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#4edea3', marginTop:4, flexShrink:0 }}/>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:'#98b8cc', marginBottom:2 }}>Interview in progress</p>
                  <p style={{ fontSize:11, color:'#5878b0' }}>{a.job_title} @ {a.company}</p>
                </div>
              </div>
            ))}

            {followUps.length===0 && todayTasks.length===0 && applications.filter(a=>a.status==='interview').length===0 && (
              <div style={{ padding:'32px 16px', textAlign:'center' }}>
                <CheckCircle2 size={24} style={{ color:'rgba(78,222,163,0.25)', margin:'0 auto 8px', filter:'drop-shadow(0 0 6px rgba(78,222,163,0.15))' }}/>
                <p style={{ fontFamily:MONO, fontSize:9, color:'#1a3452', letterSpacing:'0.06em' }}>All caught up — nothing due.</p>
              </div>
            )}
          </div>

          {/* AI quick actions */}
          <div style={{ borderTop:'0.5px solid rgba(0,120,255,0.1)', padding:'10px 12px', flexShrink:0 }}>
            <p style={{ fontFamily:MONO, fontSize:7, fontWeight:700, letterSpacing:'0.12em', color:'rgba(0,212,255,0.3)', textTransform:'uppercase', marginBottom:8 }}>AI Tools</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
              {[
                { label:'Interview Coach', to:'/ai/interview-coach', color:'#f472b6', icon:Mic },
                { label:'Salary Intel',    to:'/ai/salary',          color:'#a3c9ff', icon:DollarSign },
                { label:'Cover Letter',    to:'/ai/cover-letter',    color:'#4edea3', icon:Mail },
                { label:'Offer Simulator', to:'/ai/negotiate',       color:'#fbbf24', icon:Handshake },
              ].map(({label,to,color,icon:Icon})=>(
                <button key={to} onClick={()=>navigate(to)}
                  style={{ padding:'9px 10px', background:`${color}06`, border:`0.5px solid ${color}22`, borderLeft:`2px solid ${color}`, cursor:'pointer', textAlign:'left', transition:'background 0.15s', display:'flex', flexDirection:'column', gap:5 }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=`${color}14` }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=`${color}06` }}>
                  <Icon size={10} style={{ color }}/>
                  <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color, letterSpacing:'0.04em', lineHeight:1.3 }}>{label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      <ApplicationModal open={modalOpen} onClose={()=>setModalOpen(false)} onSave={handleSave} onDelete={deleteApplication} initial={editingApp??{status:'wishlist'}}/>
      {quickPostOpen && <QuickPostModal onClose={()=>setQuickPostOpen(false)} onPublished={()=>{}}/>}

      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} onSave={handleTaskSave} />

      {/* ══ KPI Customize Modal ══ */}
      {kpiCustomizeOpen && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.82)', zIndex:99990, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={() => setKpiCustomizeOpen(false)}
        >
          <div
            style={{ width:'100%', maxWidth:520, background:'#0a0e1c', border:'0.5px solid rgba(163,201,255,0.15)', padding:'28px 28px 22px', display:'flex', flexDirection:'column', gap:0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
              <div>
                <p style={{ fontFamily:MONO, fontSize:7, fontWeight:700, color:'rgba(163,201,255,0.3)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:4 }}>Dashboard</p>
                <h2 style={{ fontFamily:MONO, fontSize:15, fontWeight:900, color:'#d0e4f0', letterSpacing:'-0.02em', margin:0 }}>Customize KPIs</h2>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontFamily:MONO, fontSize:10, fontWeight:700, color:kpiDraft.length===4?'#4edea3':'#ffb689', background:kpiDraft.length===4?'rgba(78,222,163,0.1)':'rgba(255,182,137,0.1)', border:`0.5px solid ${kpiDraft.length===4?'rgba(78,222,163,0.3)':'rgba(255,182,137,0.3)'}`, padding:'4px 10px' }}>
                  {kpiDraft.length} / 4
                </span>
                <button onClick={() => setKpiCustomizeOpen(false)} style={{ background:'none', border:'none', color:'#1a3452', cursor:'pointer', display:'flex', padding:4, transition:'color 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#5878b0'} onMouseLeave={e => e.currentTarget.style.color='#1a3452'}>
                  <X size={16}/>
                </button>
              </div>
            </div>

            {/* Categories */}
            <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:20 }}>
              {KPI_CATEGORY_ORDER.map(cat => {
                const catOpts = KPI_OPTIONS.filter(o => o.category === cat)
                return (
                  <div key={cat}>
                    <p style={{ fontFamily:MONO, fontSize:7, fontWeight:700, color:'rgba(163,201,255,0.22)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:7 }}>{cat}</p>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                      {catOpts.map(opt => {
                        const selected = kpiDraft.includes(opt.id)
                        const disabled = !selected && kpiDraft.length >= 4
                        const Icon = opt.icon
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              if (selected) setKpiDraft(d => d.filter(id => id !== opt.id))
                              else if (kpiDraft.length < 4) setKpiDraft(d => [...d, opt.id])
                            }}
                            style={{
                              display:'flex', flexDirection:'column', alignItems:'flex-start',
                              padding:'10px 12px', gap:7, textAlign:'left',
                              background: selected ? 'rgba(163,201,255,0.08)' : 'rgba(255,255,255,0.02)',
                              border: selected ? '0.5px solid rgba(163,201,255,0.38)' : '0.5px solid rgba(163,201,255,0.07)',
                              cursor: disabled ? 'default' : 'pointer',
                              opacity: disabled ? 0.3 : 1,
                              transition:'all 0.12s',
                            }}
                            onMouseEnter={e => { if (!disabled && !selected) { e.currentTarget.style.background='rgba(163,201,255,0.05)'; e.currentTarget.style.borderColor='rgba(163,201,255,0.18)' } }}
                            onMouseLeave={e => { if (!selected) { e.currentTarget.style.background='rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor='rgba(163,201,255,0.07)' } }}
                          >
                            <div style={{ width:22, height:22, borderRadius:'50%', background:opt.gradient, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <Icon size={10} color="#fff"/>
                            </div>
                            <span style={{ fontFamily:MONO, fontSize:9, fontWeight:700, color:selected?'#a3c9ff':'#4a5568', lineHeight:1.35 }}>{opt.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div style={{ display:'flex', gap:8 }}>
              <button
                onClick={() => setKpiCustomizeOpen(false)}
                style={{ flex:1, padding:'10px 0', background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(163,201,255,0.09)', color:'#2a4a6a', fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.12s' }}
                onMouseEnter={e => { e.currentTarget.style.color='#5878b0'; e.currentTarget.style.borderColor='rgba(163,201,255,0.18)' }}
                onMouseLeave={e => { e.currentTarget.style.color='#2a4a6a'; e.currentTarget.style.borderColor='rgba(163,201,255,0.09)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => kpiDraft.length === 4 && saveKpiConfig(kpiDraft)}
                style={{ flex:2, padding:'10px 0', background:kpiDraft.length===4?'rgba(78,222,163,0.1)':'rgba(255,255,255,0.02)', border:`0.5px solid ${kpiDraft.length===4?'rgba(78,222,163,0.38)':'rgba(163,201,255,0.07)'}`, color:kpiDraft.length===4?'#4edea3':'#2a3040', fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', cursor:kpiDraft.length===4?'pointer':'default', transition:'all 0.12s' }}
                onMouseEnter={e => { if (kpiDraft.length===4) e.currentTarget.style.background='rgba(78,222,163,0.17)' }}
                onMouseLeave={e => { if (kpiDraft.length===4) e.currentTarget.style.background='rgba(78,222,163,0.1)' }}
              >
                {kpiDraft.length < 4 ? `Pick ${4-kpiDraft.length} more` : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      </div>
    </div>
  )
}
