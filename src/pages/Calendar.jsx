import { useState, useEffect, useMemo } from 'react'
import {
  CheckSquare, Target, CalendarDays, Zap, Plus, X, Check,
  ChevronLeft, ChevronRight, Trash2, ExternalLink, Link2,
  Clock, Flag, Star, Circle, PlayCircle, Coffee, BookOpen,
  BarChart3, Edit3, Calendar
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay,
  isToday, addMonths, subMonths, parseISO, isFuture, isPast, startOfDay } from 'date-fns'
import { useApplications } from '../contexts/ApplicationContext'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'
const SURFACE = '#161b22'
const BG = '#0d1117'
const BORDER = 'rgba(48,54,61,0.9)'

const PRIORITY_COLOR = { high: '#ffb4ab', medium: '#ffb689', low: '#4edea3' }
const PRIORITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' }

const SESSION_TYPES = [
  { key: 'research',  label: 'Research',   icon: BookOpen,  color: '#a3c9ff' },
  { key: 'apply',     label: 'Apply',       icon: Target,    color: '#4edea3' },
  { key: 'network',   label: 'Network',     icon: Link2,     color: '#ffb689' },
  { key: 'prep',      label: 'Interview Prep', icon: Star,   color: '#ffb4ab' },
  { key: 'review',    label: 'CV / Cover',  icon: Edit3,     color: '#c4b5fd' },
  { key: 'break',     label: 'Break',       icon: Coffee,    color: '#8a919f' },
]

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial }
    catch { return initial }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }, [key, val])
  return [val, setVal]
}

/* ─── Section header ─── */
function SectionHead({ icon: Icon, label, color, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={13} style={{ color }} />
        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color }}>{label}</span>
      </div>
      {action}
    </div>
  )
}

/* ─── Card shell ─── */
function Card({ children, accent, style }) {
  return (
    <div style={{
      background: SURFACE, border: `0.5px solid ${BORDER}`,
      borderTop: `2px solid ${accent || 'transparent'}`,
      padding: 18, ...style,
    }}>
      {children}
    </div>
  )
}

/* ─── Mini calendar ─── */
function MiniCal({ selected, onSelect, marked = [] }) {
  const [month, setMonth] = useState(new Date())
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const startOffset = startOfMonth(month).getDay()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={() => setMonth(m => subMonths(m, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6478', display: 'flex', padding: 2 }}><ChevronLeft size={14}/></button>
        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: '#c0c7d5', letterSpacing: '0.06em' }}>{format(month, 'MMM yyyy').toUpperCase()}</span>
        <button onClick={() => setMonth(m => addMonths(m, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6478', display: 'flex', padding: 2 }}><ChevronRight size={14}/></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {['S','M','T','W','T','F','S'].map((d,i) => (
          <div key={i} style={{ fontFamily: MONO, fontSize: 8, color: '#3a4455', textAlign: 'center', paddingBottom: 4 }}>{d}</div>
        ))}
        {Array(startOffset).fill(null).map((_, i) => <div key={`e${i}`}/>)}
        {days.map(day => {
          const iso = format(day, 'yyyy-MM-dd')
          const isSel = selected && isSameDay(day, parseISO(selected))
          const isT = isToday(day)
          const hasMark = marked.some(m => isSameDay(day, typeof m === 'string' ? parseISO(m) : m))
          return (
            <button key={iso} onClick={() => onSelect(iso)}
              style={{
                fontFamily: MONO, fontSize: 9, textAlign: 'center', padding: '4px 2px',
                background: isSel ? '#a3c9ff' : isT ? 'rgba(163,201,255,0.1)' : 'transparent',
                border: isT && !isSel ? '0.5px solid rgba(163,201,255,0.3)' : '0.5px solid transparent',
                color: isSel ? '#0d1117' : isT ? '#a3c9ff' : '#8a919f',
                cursor: 'pointer', position: 'relative', fontWeight: isSel || isT ? 700 : 400,
                transition: 'all 0.1s',
              }}
              onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(163,201,255,0.08)' }}
              onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = isT ? 'rgba(163,201,255,0.1)' : 'transparent' }}
            >
              {format(day, 'd')}
              {hasMark && !isSel && (
                <div style={{ position: 'absolute', bottom: 1, left: '50%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: '50%', background: '#4edea3' }}/>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
export default function Calendar() {
  const { applications } = useApplications()

  /* ── State ── */
  const [tasks,    setTasks]    = useLocalStorage('trackr_tasks',    [])
  const [goals,    setGoals]    = useLocalStorage('trackr_goals',    [])
  const [sessions, setSessions] = useLocalStorage('trackr_sessions', [])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  /* task form */
  const [taskForm, setTaskForm] = useState({ open: false, title: '', due: format(new Date(),'yyyy-MM-dd'), priority: 'medium', note: '' })
  /* goal form */
  const [goalForm, setGoalForm] = useState({ open: false, title: '', target: '', unit: 'applications', period: 'week' })
  /* session form */
  const [sessForm, setSessForm] = useState({ open: false, type: 'research', label: '', date: format(new Date(),'yyyy-MM-dd'), duration: 60, note: '' })

  /* ── Interview schedule from apps ── */
  const interviews = useMemo(() =>
    applications
      .filter(a => a.status === 'interview')
      .sort((a, b) => {
        if (a.reminder_date && b.reminder_date) return new Date(a.reminder_date) - new Date(b.reminder_date)
        return 0
      })
  , [applications])

  /* ── Marked dates for mini-cal ── */
  const markedDates = useMemo(() => [
    ...tasks.filter(t => !t.done).map(t => t.due),
    ...sessions.map(s => s.date),
    ...applications.filter(a => a.status === 'interview' && a.reminder_date).map(a => a.reminder_date),
  ].filter(Boolean), [tasks, sessions, applications])

  /* ── Helpers ── */
  const addTask = () => {
    if (!taskForm.title.trim()) return
    setTasks(t => [...t, { id: Date.now().toString(), ...taskForm, done: false, createdAt: new Date().toISOString() }])
    setTaskForm(f => ({ ...f, open: false, title: '', note: '' }))
  }
  const toggleTask = id => setTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x))
  const deleteTask = id => setTasks(t => t.filter(x => x.id !== id))

  const addGoal = () => {
    if (!goalForm.title.trim() || !goalForm.target) return
    setGoals(g => [...g, { id: Date.now().toString(), ...goalForm, progress: 0, createdAt: new Date().toISOString() }])
    setGoalForm(f => ({ ...f, open: false, title: '', target: '' }))
  }
  const nudgeGoal = (id, dir) => setGoals(g => g.map(x => x.id === id ? { ...x, progress: Math.max(0, Math.min(Number(x.target), x.progress + dir)) } : x))
  const deleteGoal = id => setGoals(g => g.filter(x => x.id !== id))

  const addSession = () => {
    if (!sessForm.label.trim()) return
    setSessions(s => [...s, { id: Date.now().toString(), ...sessForm }])
    setSessForm(f => ({ ...f, open: false, label: '', note: '' }))
  }
  const deleteSession = id => setSessions(s => s.filter(x => x.id !== id))

  /* Google Calendar URL helper */
  const gcalUrl = (title, dateStr, duration = 60) => {
    const d = new Date(dateStr + 'T09:00:00')
    const end = new Date(d.getTime() + duration * 60000)
    const fmt = dt => dt.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z'
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(d)}/${fmt(end)}`
  }

  /* Items for selected date */
  const dayTasks    = tasks.filter(t => t.due === selectedDate && !t.done)
  const daySessions = sessions.filter(s => s.date === selectedDate)
  const dayInterviews = applications.filter(a => a.status === 'interview' && a.reminder_date === selectedDate)

  const pendingTasks = tasks.filter(t => !t.done).sort((a,b) => {
    const order = { high:0, medium:1, low:2 }
    return order[a.priority] - order[b.priority]
  })
  const doneTasks = tasks.filter(t => t.done)

  return (
    <div style={{ fontFamily: SANS, maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, paddingTop: 4 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 4, height: 4, background: '#a3c9ff' }} />
            <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: '#a3c9ff', textTransform: 'uppercase' }}>Planner</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', color: '#e2e2e8', marginBottom: 4 }}>My Calendar</h1>
          <p style={{ fontFamily: MONO, fontSize: 10, color: '#5a6478' }}>
            {pendingTasks.length} tasks · {goals.filter(g=>g.progress<g.target).length} active goals · {interviews.length} interview{interviews.length!==1?'s':''} in progress
          </p>
        </div>
        <a
          href="https://calendar.google.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 16px',
            background: 'rgba(78,222,163,0.08)', border: '0.5px solid rgba(78,222,163,0.3)',
            color: '#4edea3', fontFamily: MONO, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            textDecoration: 'none', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(78,222,163,0.14)'; e.currentTarget.style.borderColor = 'rgba(78,222,163,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(78,222,163,0.08)'; e.currentTarget.style.borderColor = 'rgba(78,222,163,0.3)' }}
        >
          <Calendar size={12} /> Open Google Calendar <ExternalLink size={10} />
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'flex-start' }}>

        {/* ── Left: mini calendar + day view ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card accent="#a3c9ff">
            <MiniCal selected={selectedDate} onSelect={setSelectedDate} marked={markedDates} />
          </Card>

          {/* Day summary */}
          <Card accent="transparent" style={{ padding: 14 }}>
            <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#5a6478', textTransform: 'uppercase', marginBottom: 10 }}>
              {format(parseISO(selectedDate), 'MMM d')} · {isToday(parseISO(selectedDate)) ? 'Today' : format(parseISO(selectedDate), 'EEEE')}
            </p>
            {dayTasks.length === 0 && daySessions.length === 0 && dayInterviews.length === 0 ? (
              <p style={{ fontFamily: MONO, fontSize: 9, color: '#2a3040' }}>Nothing scheduled</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {dayInterviews.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: 'rgba(255,182,137,0.07)', border: '0.5px solid rgba(255,182,137,0.2)' }}>
                    <Star size={9} style={{ color: '#ffb689', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontFamily: MONO, fontSize: 9, color: '#ffb689', fontWeight: 700 }}>Interview</p>
                      <p style={{ fontFamily: MONO, fontSize: 8, color: '#5a6478' }}>{a.company}</p>
                    </div>
                  </div>
                ))}
                {dayTasks.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'rgba(163,201,255,0.04)', border: '0.5px solid rgba(163,201,255,0.08)' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: PRIORITY_COLOR[t.priority], flexShrink: 0 }} />
                    <p style={{ fontFamily: MONO, fontSize: 9, color: '#8a919f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                  </div>
                ))}
                {daySessions.map(s => {
                  const st = SESSION_TYPES.find(x => x.key === s.type) || SESSION_TYPES[0]
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: `${st.color}08`, border: `0.5px solid ${st.color}20` }}>
                      <Clock size={9} style={{ color: st.color, flexShrink: 0 }} />
                      <p style={{ fontFamily: MONO, fontSize: 9, color: '#8a919f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label} · {s.duration}m</p>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ── Right: 4 sections ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          {/* ── 1. Tasks ── */}
          <Card accent="#a3c9ff" style={{ gridColumn: '1', display: 'flex', flexDirection: 'column', gap: 0 }}>
            <SectionHead icon={CheckSquare} label="Tasks" color="#a3c9ff"
              action={
                <button onClick={() => setTaskForm(f => ({ ...f, open: !f.open }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: MONO, fontSize: 9, fontWeight: 700, color: '#a3c9ff', background: 'rgba(163,201,255,0.08)', border: '0.5px solid rgba(163,201,255,0.2)', padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  <Plus size={10} /> Add
                </button>
              }
            />

            {/* Add task form */}
            {taskForm.open && (
              <div style={{ background: BG, border: `0.5px solid ${BORDER}`, padding: 12, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input value={taskForm.title} onChange={e => setTaskForm(f=>({...f,title:e.target.value}))} placeholder="Task title…"
                  onKeyDown={e => e.key==='Enter' && addTask()}
                  style={{ width:'100%', boxSizing:'border-box', padding:'7px 10px', background:'rgba(255,255,255,0.025)', border:`0.5px solid ${BORDER}`, color:'#e2e2e8', fontSize:12, fontFamily:SANS, outline:'none' }}/>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  <input type="date" value={taskForm.due} onChange={e => setTaskForm(f=>({...f,due:e.target.value}))}
                    style={{ padding:'6px 8px', background:'rgba(255,255,255,0.025)', border:`0.5px solid ${BORDER}`, color:'#8a919f', fontSize:11, fontFamily:MONO, outline:'none', colorScheme:'dark' }}/>
                  <select value={taskForm.priority} onChange={e => setTaskForm(f=>({...f,priority:e.target.value}))}
                    style={{ padding:'6px 8px', background:SURFACE, border:`0.5px solid ${BORDER}`, color:'#8a919f', fontSize:11, fontFamily:MONO, outline:'none', cursor:'pointer' }}>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={addTask} style={{ flex:1, padding:'7px 0', background:'rgba(163,201,255,0.1)', border:'0.5px solid rgba(163,201,255,0.3)', color:'#a3c9ff', fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer' }}>Add Task</button>
                  <button onClick={() => setTaskForm(f=>({...f,open:false}))} style={{ padding:'7px 10px', background:'rgba(255,255,255,0.02)', border:`0.5px solid ${BORDER}`, color:'#5a6478', cursor:'pointer' }}><X size={12}/></button>
                </div>
              </div>
            )}

            {/* Task list */}
            <div style={{ display:'flex', flexDirection:'column', gap:4, maxHeight:320, overflowY:'auto' }}>
              {pendingTasks.length === 0 && !taskForm.open && (
                <p style={{ fontFamily:MONO, fontSize:9, color:'#2a3040', padding:'8px 0' }}>No pending tasks — add one above.</p>
              )}
              {pendingTasks.map(t => (
                <div key={t.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'rgba(255,255,255,0.015)', border:`0.5px solid ${BORDER}`, transition:'background 0.1s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(163,201,255,0.04)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.015)'}>
                  <button onClick={() => toggleTask(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color: PRIORITY_COLOR[t.priority], display:'flex', flexShrink:0, padding:0 }}>
                    <Circle size={14}/>
                  </button>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12, color:'#c0c7d5', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.title}</p>
                    <p style={{ fontFamily:MONO, fontSize:8, color: isPast(startOfDay(parseISO(t.due))) && !isToday(parseISO(t.due)) ? '#ffb4ab' : '#3a4455', marginTop:1 }}>
                      {isToday(parseISO(t.due)) ? 'Today' : format(parseISO(t.due), 'MMM d')}
                    </p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <a href={gcalUrl(t.title, t.due)} target="_blank" rel="noopener noreferrer"
                      style={{ color:'#3a4455', display:'flex', transition:'color 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.color='#4edea3'} onMouseLeave={e=>e.currentTarget.style.color='#3a4455'}>
                      <Calendar size={10}/>
                    </a>
                    <button onClick={() => deleteTask(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#2a3040', display:'flex', padding:0, transition:'color 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.color='#ffb4ab'} onMouseLeave={e=>e.currentTarget.style.color='#2a3040'}>
                      <Trash2 size={11}/>
                    </button>
                  </div>
                </div>
              ))}
              {doneTasks.length > 0 && (
                <details style={{ marginTop:4 }}>
                  <summary style={{ fontFamily:MONO, fontSize:8, color:'#2a3040', cursor:'pointer', padding:'4px 0', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                    {doneTasks.length} completed
                  </summary>
                  {doneTasks.map(t => (
                    <div key={t.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', opacity:0.4 }}>
                      <button onClick={() => toggleTask(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#4edea3', display:'flex', flexShrink:0, padding:0 }}><Check size={14}/></button>
                      <p style={{ fontSize:11, color:'#5a6478', textDecoration:'line-through', flex:1 }}>{t.title}</p>
                      <button onClick={() => deleteTask(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#2a3040', display:'flex', padding:0 }}><X size={10}/></button>
                    </div>
                  ))}
                </details>
              )}
            </div>
          </Card>

          {/* ── 2. Goals ── */}
          <Card accent="#4edea3" style={{ display:'flex', flexDirection:'column', gap:0 }}>
            <SectionHead icon={Target} label="Goals" color="#4edea3"
              action={
                <button onClick={() => setGoalForm(f => ({...f, open:!f.open}))}
                  style={{ display:'flex', alignItems:'center', gap:4, fontFamily:MONO, fontSize:9, fontWeight:700, color:'#4edea3', background:'rgba(78,222,163,0.08)', border:'0.5px solid rgba(78,222,163,0.2)', padding:'4px 10px', cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                  <Plus size={10}/> Add
                </button>
              }
            />

            {goalForm.open && (
              <div style={{ background:BG, border:`0.5px solid ${BORDER}`, padding:12, marginBottom:12, display:'flex', flexDirection:'column', gap:8 }}>
                <input value={goalForm.title} onChange={e=>setGoalForm(f=>({...f,title:e.target.value}))} placeholder="Goal title…"
                  style={{ width:'100%', boxSizing:'border-box', padding:'7px 10px', background:'rgba(255,255,255,0.025)', border:`0.5px solid ${BORDER}`, color:'#e2e2e8', fontSize:12, fontFamily:SANS, outline:'none' }}/>
                <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr', gap:6 }}>
                  <input type="number" min="1" value={goalForm.target} onChange={e=>setGoalForm(f=>({...f,target:e.target.value}))} placeholder="Target"
                    style={{ padding:'6px 8px', background:'rgba(255,255,255,0.025)', border:`0.5px solid ${BORDER}`, color:'#e2e2e8', fontSize:11, fontFamily:MONO, outline:'none' }}/>
                  <select value={goalForm.unit} onChange={e=>setGoalForm(f=>({...f,unit:e.target.value}))}
                    style={{ padding:'6px 8px', background:SURFACE, border:`0.5px solid ${BORDER}`, color:'#8a919f', fontSize:11, fontFamily:MONO, outline:'none', cursor:'pointer' }}>
                    <option value="applications">Applications</option>
                    <option value="interviews">Interviews</option>
                    <option value="hours">Hours</option>
                    <option value="connections">Connections</option>
                    <option value="custom">Custom</option>
                  </select>
                  <select value={goalForm.period} onChange={e=>setGoalForm(f=>({...f,period:e.target.value}))}
                    style={{ padding:'6px 8px', background:SURFACE, border:`0.5px solid ${BORDER}`, color:'#8a919f', fontSize:11, fontFamily:MONO, outline:'none', cursor:'pointer' }}>
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                  </select>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={addGoal} style={{ flex:1, padding:'7px 0', background:'rgba(78,222,163,0.1)', border:'0.5px solid rgba(78,222,163,0.3)', color:'#4edea3', fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer' }}>Add Goal</button>
                  <button onClick={() => setGoalForm(f=>({...f,open:false}))} style={{ padding:'7px 10px', background:'rgba(255,255,255,0.02)', border:`0.5px solid ${BORDER}`, color:'#5a6478', cursor:'pointer' }}><X size={12}/></button>
                </div>
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:10, maxHeight:320, overflowY:'auto' }}>
              {goals.length === 0 && !goalForm.open && (
                <p style={{ fontFamily:MONO, fontSize:9, color:'#2a3040' }}>No goals yet — set your first target above.</p>
              )}
              {goals.map(g => {
                const pct = Math.min(100, g.target > 0 ? Math.round((g.progress / g.target) * 100) : 0)
                const done = g.progress >= Number(g.target)
                return (
                  <div key={g.id} style={{ padding:'10px 12px', background:'rgba(255,255,255,0.015)', border:`0.5px solid ${BORDER}` }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                      <div>
                        <p style={{ fontSize:12, fontWeight:600, color: done ? '#4edea3' : '#c0c7d5' }}>{g.title}</p>
                        <p style={{ fontFamily:MONO, fontSize:8, color:'#3a4455', marginTop:1, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                          {g.progress}/{g.target} {g.unit} · per {g.period}
                        </p>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <span style={{ fontFamily:MONO, fontSize:13, fontWeight:800, color: done ? '#4edea3' : '#8a919f' }}>{pct}%</span>
                        <button onClick={() => deleteGoal(g.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#2a3040', display:'flex', padding:0, transition:'color 0.15s' }}
                          onMouseEnter={e=>e.currentTarget.style.color='#ffb4ab'} onMouseLeave={e=>e.currentTarget.style.color='#2a3040'}>
                          <Trash2 size={11}/>
                        </button>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height:4, background:'rgba(255,255,255,0.05)', marginBottom:8, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background: done ? '#4edea3' : 'linear-gradient(90deg, #4edea3aa, #a3c9ff)', transition:'width 0.5s ease' }}/>
                    </div>
                    {/* Nudge buttons */}
                    <div style={{ display:'flex', gap:4 }}>
                      <button onClick={() => nudgeGoal(g.id, -1)} style={{ padding:'3px 8px', background:'rgba(255,255,255,0.03)', border:`0.5px solid ${BORDER}`, color:'#5a6478', fontFamily:MONO, fontSize:9, cursor:'pointer' }}>−1</button>
                      <button onClick={() => nudgeGoal(g.id,  1)} style={{ padding:'3px 8px', background:'rgba(78,222,163,0.07)', border:'0.5px solid rgba(78,222,163,0.2)', color:'#4edea3', fontFamily:MONO, fontSize:9, fontWeight:700, cursor:'pointer' }}>+1</button>
                      <button onClick={() => nudgeGoal(g.id,  5)} style={{ padding:'3px 8px', background:'rgba(78,222,163,0.07)', border:'0.5px solid rgba(78,222,163,0.2)', color:'#4edea3', fontFamily:MONO, fontSize:9, fontWeight:700, cursor:'pointer' }}>+5</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* ── 3. Interview Schedule ── */}
          <Card accent="#ffb689" style={{ display:'flex', flexDirection:'column', gap:0 }}>
            <SectionHead icon={CalendarDays} label="Interview Schedule" color="#ffb689" />
            <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:280, overflowY:'auto' }}>
              {interviews.length === 0 ? (
                <div style={{ textAlign:'center', padding:'24px 0' }}>
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#2a3040', marginBottom:6 }}>No interviews in progress.</p>
                  <p style={{ fontFamily:MONO, fontSize:8, color:'#1e2a3a' }}>Applications with "Interview" status appear here automatically.</p>
                </div>
              ) : interviews.map(a => (
                <div key={a.id} style={{ padding:'10px 12px', background:'rgba(255,182,137,0.05)', border:'0.5px solid rgba(255,182,137,0.15)', display:'flex', alignItems:'flex-start', gap:10 }}>
                  <div style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,182,137,0.1)', border:'0.5px solid rgba(255,182,137,0.25)', fontFamily:MONO, fontWeight:800, fontSize:12, color:'#ffb689', flexShrink:0 }}>
                    {a.company?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:'#e2e2e8', marginBottom:2 }}>{a.job_title}</p>
                    <p style={{ fontFamily:MONO, fontSize:9, color:'#5a6478', marginBottom:4 }}>{a.company}</p>
                    {a.reminder_date && (
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ fontFamily:MONO, fontSize:8, color:'#ffb689', background:'rgba(255,182,137,0.1)', border:'0.5px solid rgba(255,182,137,0.2)', padding:'2px 6px' }}>
                          {isToday(parseISO(a.reminder_date)) ? 'TODAY' : format(parseISO(a.reminder_date), 'MMM d')}
                        </span>
                        <a href={gcalUrl(`Interview – ${a.job_title} @ ${a.company}`, a.reminder_date, 60)} target="_blank" rel="noopener noreferrer"
                          style={{ display:'flex', alignItems:'center', gap:3, fontFamily:MONO, fontSize:8, color:'#3a4455', textDecoration:'none', transition:'color 0.15s' }}
                          onMouseEnter={e=>e.currentTarget.style.color='#4edea3'} onMouseLeave={e=>e.currentTarget.style.color='#3a4455'}>
                          <Calendar size={9}/> Add to GCal
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── 4. Focus Sessions ── */}
          <Card accent="#c4b5fd" style={{ display:'flex', flexDirection:'column', gap:0 }}>
            <SectionHead icon={PlayCircle} label="Focus Sessions" color="#c4b5fd"
              action={
                <button onClick={() => setSessForm(f => ({...f, open:!f.open}))}
                  style={{ display:'flex', alignItems:'center', gap:4, fontFamily:MONO, fontSize:9, fontWeight:700, color:'#c4b5fd', background:'rgba(196,181,253,0.08)', border:'0.5px solid rgba(196,181,253,0.2)', padding:'4px 10px', cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                  <Plus size={10}/> Schedule
                </button>
              }
            />

            {sessForm.open && (
              <div style={{ background:BG, border:`0.5px solid ${BORDER}`, padding:12, marginBottom:12, display:'flex', flexDirection:'column', gap:8 }}>
                <input value={sessForm.label} onChange={e=>setSessForm(f=>({...f,label:e.target.value}))} placeholder="Session name…"
                  style={{ width:'100%', boxSizing:'border-box', padding:'7px 10px', background:'rgba(255,255,255,0.025)', border:`0.5px solid ${BORDER}`, color:'#e2e2e8', fontSize:12, fontFamily:SANS, outline:'none' }}/>
                {/* Type picker */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {SESSION_TYPES.map(st => (
                    <button key={st.key} onClick={() => setSessForm(f=>({...f,type:st.key}))}
                      style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 8px', background: sessForm.type===st.key ? `${st.color}18` : 'rgba(255,255,255,0.02)', border:`0.5px solid ${sessForm.type===st.key ? st.color+'55' : BORDER}`, color: sessForm.type===st.key ? st.color : '#5a6478', fontFamily:MONO, fontSize:8, fontWeight:600, cursor:'pointer', transition:'all 0.1s', letterSpacing:'0.04em' }}>
                      <st.icon size={9}/> {st.label}
                    </button>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  <input type="date" value={sessForm.date} onChange={e=>setSessForm(f=>({...f,date:e.target.value}))}
                    style={{ padding:'6px 8px', background:'rgba(255,255,255,0.025)', border:`0.5px solid ${BORDER}`, color:'#8a919f', fontSize:11, fontFamily:MONO, outline:'none', colorScheme:'dark' }}/>
                  <select value={sessForm.duration} onChange={e=>setSessForm(f=>({...f,duration:Number(e.target.value)}))}
                    style={{ padding:'6px 8px', background:SURFACE, border:`0.5px solid ${BORDER}`, color:'#8a919f', fontSize:11, fontFamily:MONO, outline:'none', cursor:'pointer' }}>
                    <option value={30}>30 min</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hrs</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                  </select>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={addSession} style={{ flex:1, padding:'7px 0', background:'rgba(196,181,253,0.1)', border:'0.5px solid rgba(196,181,253,0.3)', color:'#c4b5fd', fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer' }}>Schedule</button>
                  <button onClick={() => setSessForm(f=>({...f,open:false}))} style={{ padding:'7px 10px', background:'rgba(255,255,255,0.02)', border:`0.5px solid ${BORDER}`, color:'#5a6478', cursor:'pointer' }}><X size={12}/></button>
                </div>
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:280, overflowY:'auto' }}>
              {sessions.length === 0 && !sessForm.open && (
                <p style={{ fontFamily:MONO, fontSize:9, color:'#2a3040' }}>No sessions scheduled — block time to focus.</p>
              )}
              {[...sessions].sort((a,b) => new Date(a.date)-new Date(b.date)).map(s => {
                const st = SESSION_TYPES.find(x => x.key === s.type) || SESSION_TYPES[0]
                const past = isPast(startOfDay(parseISO(s.date))) && !isToday(parseISO(s.date))
                return (
                  <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:`${st.color}06`, border:`0.5px solid ${st.color}18`, opacity: past ? 0.45 : 1 }}>
                    <div style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', background:`${st.color}12`, border:`0.5px solid ${st.color}25`, flexShrink:0 }}>
                      <st.icon size={12} style={{ color: st.color }}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:12, color:'#c0c7d5', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.label}</p>
                      <p style={{ fontFamily:MONO, fontSize:8, color:'#3a4455', marginTop:1 }}>
                        {isToday(parseISO(s.date)) ? 'Today' : format(parseISO(s.date), 'MMM d')} · {s.duration}m · {st.label}
                      </p>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <a href={gcalUrl(s.label, s.date, s.duration)} target="_blank" rel="noopener noreferrer"
                        style={{ color:'#3a4455', display:'flex', transition:'color 0.15s' }}
                        onMouseEnter={e=>e.currentTarget.style.color=st.color} onMouseLeave={e=>e.currentTarget.style.color='#3a4455'}>
                        <Calendar size={10}/>
                      </a>
                      <button onClick={() => deleteSession(s.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#2a3040', display:'flex', padding:0, transition:'color 0.15s' }}
                        onMouseEnter={e=>e.currentTarget.style.color='#ffb4ab'} onMouseLeave={e=>e.currentTarget.style.color='#2a3040'}>
                        <Trash2 size={11}/>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

        </div>{/* end 4-section grid */}
      </div>{/* end main grid */}
    </div>
  )
}
