import { useState, useEffect, useMemo, useRef } from 'react'
import BackToHome from '../components/BackToHome'
import TaskModal from '../components/TaskModal'
import {
  CheckSquare, Target, CalendarDays, Zap, Plus, X, Check,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Trash2, ExternalLink, Link2,
  Clock, Flag, Star, Circle, PlayCircle, Coffee, BookOpen,
  BarChart3, Edit3, CalendarIcon, GripVertical
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay,
  isToday, addMonths, subMonths, parseISO, isFuture, isPast, startOfDay } from 'date-fns'
import { useApplications } from '../contexts/ApplicationContext'

const MONO = 'Consolas, Menlo, Monaco, monospace'
const SANS = 'Geist, Inter, sans-serif'
const SURFACE = 'rgba(13,18,32,0.97)'
const BG = '#060b14'
const BORDER = 'rgba(255,255,255,0.07)'

const PRIORITY_COLOR = { high: '#f87171', medium: '#60a5fa', low: '#4edea3' }
const PRIORITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' }

const GOAL_QUOTES = [
  'One more step closer.',
  'Keep the streak alive.',
  'Progress is progress, no matter how small.',
  "You're building momentum.",
  'That one counts.',
  'Every rep adds up.',
  'Consistency is the key.',
  'You showed up. That matters.',
  'Small wins stack into big results.',
  'Forward, always forward.',
  'Done beats perfect.',
  "That's how it gets done.",
  'Another brick in the wall.',
  "You're in motion — stay there.",
  "The scoreboard doesn't lie.",
  'One step at a time gets you there.',
  "That's the work.",
  'Keep going.',
  "Proof you're serious.",
  'It adds up faster than you think.',
]

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
  const c = accent || '#60a5fa'
  return (
    <div style={{
      background: `linear-gradient(145deg, ${c}0d 0%, rgba(6,11,20,0.97) 55%)`,
      border: `1px solid ${c}22`,
      borderTop: `2px solid ${c}`,
      boxShadow: `0 0 40px ${c}06, inset 0 1px 0 ${c}12`,
      padding: 18, ...style,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* subtle corner glow */}
      <div style={{ position:'absolute', top:-40, right:-40, width:140, height:140, borderRadius:'50%', background:`radial-gradient(circle, ${c}0a, transparent)`, pointerEvents:'none' }}/>
      <div style={{ position:'relative', zIndex:1 }}>{children}</div>
    </div>
  )
}

/* ─── Mini calendar ─── */
function MiniCal({ selected, onSelect, marked = [] }) {
  const [month, setMonth] = useState(new Date())
  const [hovDay, setHovDay] = useState(null)
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const startOffset = startOfMonth(month).getDay()
  const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa']

  return (
    <div style={{ padding: '4px 2px' }}>

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => setMonth(m => subMonths(m, 1))}
          style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(163,201,255,0.05)', border: '0.5px solid rgba(163,201,255,0.1)', cursor: 'pointer', color: '#5a6478', transition: 'all 0.15s', borderRadius: 0 }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(163,201,255,0.12)'; e.currentTarget.style.color='#a3c9ff' }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(163,201,255,0.05)'; e.currentTarget.style.color='#5a6478' }}>
          <ChevronLeft size={12}/>
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: '#e2e2e8', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {format(month, 'MMMM')}
          </p>
          <p style={{ fontFamily: MONO, fontSize: 9, color: '#5a6478', letterSpacing: '0.08em', marginTop: 2 }}>
            {format(month, 'yyyy')}
          </p>
        </div>
        <button onClick={() => setMonth(m => addMonths(m, 1))}
          style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(163,201,255,0.05)', border: '0.5px solid rgba(163,201,255,0.1)', cursor: 'pointer', color: '#5a6478', transition: 'all 0.15s', borderRadius: 0 }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(163,201,255,0.12)'; e.currentTarget.style.color='#a3c9ff' }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(163,201,255,0.05)'; e.currentTarget.style.color='#5a6478' }}>
          <ChevronRight size={12}/>
        </button>
      </div>

      {/* Day label row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{
            fontFamily: MONO, fontSize: 8, fontWeight: 700,
            color: i === 0 || i === 6 ? '#3a4455' : '#404753',
            textAlign: 'center', paddingBottom: 6,
            letterSpacing: '0.04em',
          }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {Array(startOffset).fill(null).map((_,i) => <div key={`e${i}`}/>)}
        {days.map(day => {
          const iso  = format(day, 'yyyy-MM-dd')
          const isSel = selected && isSameDay(day, parseISO(selected))
          const isT  = isToday(day)
          const isHov = hovDay === iso
          const hasMark = marked.some(m => isSameDay(day, typeof m === 'string' ? parseISO(m) : m))
          const isWeekend = day.getDay() === 0 || day.getDay() === 6

          return (
            <button key={iso}
              onClick={() => onSelect(iso)}
              onMouseEnter={() => setHovDay(iso)}
              onMouseLeave={() => setHovDay(null)}
              style={{
                position: 'relative',
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: isSel || isT ? 700 : isWeekend ? 400 : 500,
                textAlign: 'center',
                lineHeight: 1,
                aspectRatio: '1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                border: 'none',
                borderRadius: '50%',
                background: isSel
                  ? 'linear-gradient(135deg, #a3c9ff, #7ab4ff)'
                  : isT && !isSel
                    ? 'rgba(163,201,255,0.12)'
                    : isHov && !isSel
                      ? 'rgba(163,201,255,0.08)'
                      : 'transparent',
                color: isSel
                  ? '#0a1628'
                  : isT
                    ? '#a3c9ff'
                    : isHov
                      ? '#c0c7d5'
                      : isWeekend
                        ? '#3a4455'
                        : '#8a919f',
                boxShadow: isSel
                  ? '0 2px 12px rgba(163,201,255,0.4)'
                  : isT && !isSel
                    ? '0 0 0 1px rgba(163,201,255,0.25)'
                    : 'none',
                transform: isHov && !isSel ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.15s cubic-bezier(0.34,1.4,0.64,1)',
              }}
            >
              {format(day, 'd')}
              {hasMark && !isSel && (
                <div style={{
                  position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                  width: 3, height: 3, borderRadius: '50%',
                  background: isT ? '#a3c9ff' : '#4edea3',
                  boxShadow: `0 0 4px ${isT ? '#a3c9ff' : '#4edea3'}`,
                }}/>
              )}
            </button>
          )
        })}
      </div>

      {/* Today shortcut */}
      <div style={{ marginTop: 14, textAlign: 'center' }}>
        <button onClick={() => { setMonth(new Date()); onSelect(format(new Date(), 'yyyy-MM-dd')) }}
          style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3a4455', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color='#a3c9ff'}
          onMouseLeave={e => e.currentTarget.style.color='#3a4455'}>
          Jump to today
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
export default function Calendar() {
  const { applications } = useApplications()

  /* ── State ── */
  const [tasks,    setTasks]    = useLocalStorage('trackr_tasks',    [])

  // Sync tasks with EngageWidget — listen for external saves and reload
  useEffect(() => {
    const handler = () => {
      try { const s = localStorage.getItem('trackr_tasks'); if (s) setTasks(JSON.parse(s)) } catch {}
    }
    window.addEventListener('trackr-tasks-updated', handler)
    return () => window.removeEventListener('trackr-tasks-updated', handler)
  }, [setTasks])
  const [goals,    setGoals]    = useLocalStorage('trackr_goals',    [])
  const [sessions, setSessions] = useLocalStorage('trackr_sessions', [])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  /* task modal + drag + scroll */
  const [calTaskModal, setCalTaskModal] = useState({ open: false, task: null })
  const [calDragIdx,  setCalDragIdx]  = useState(null)
  const [calDragOver, setCalDragOver] = useState(null)
  const [calDragItemH, setCalDragItemH] = useState(40)
  const calDragFromRef = useRef(null)
  const calDragToRef   = useRef(null)
  const taskListRef = useRef(null)
  const [taskListScrollable, setTaskListScrollable] = useState(false)
  const [taskScrollTop, setTaskScrollTop] = useState(0)
  const [taskDims, setTaskDims] = useState({ sh: 0, ch: 0 })
  const thumbDrag = useRef({ active: false, startY: 0, startST: 0 })
  /* goal form */
  const [goalForm, setGoalForm] = useState({ open: false, title: '', target: '', unit: 'applications', period: 'week' })
  const [motivation, setMotivation] = useState({ goalId: null, text: '' })
  const motivationTimer = useRef(null)
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

  const pendingTasks = tasks.filter(t => !t.done)
  const doneTasks    = tasks.filter(t => t.done)

  /* ── Helpers ── */
  useEffect(() => {
    const el = taskListRef.current
    if (!el) return
    const update = () => {
      setTaskListScrollable(el.scrollHeight > el.clientHeight + 4)
      setTaskDims({ sh: el.scrollHeight, ch: el.clientHeight })
      setTaskScrollTop(el.scrollTop)
    }
    update()
    el.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [tasks])

  useEffect(() => {
    const onMove = e => {
      if (!thumbDrag.current.active) return
      const el = taskListRef.current
      if (!el) return
      const ARROW = 22
      const trackArea = taskDims.ch - ARROW * 2
      const thumbH = Math.max(20, taskDims.sh > 0 ? (taskDims.ch / taskDims.sh) * trackArea : trackArea)
      const ratio = (e.clientY - thumbDrag.current.startY) / Math.max(1, trackArea - thumbH)
      el.scrollTop = Math.max(0, thumbDrag.current.startST + ratio * (taskDims.sh - taskDims.ch))
    }
    const onUp = () => { thumbDrag.current.active = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [taskDims])

  function reorderPendingTasks(fromIdx, toIdx) {
    if (fromIdx === null || fromIdx === toIdx) return
    const pending = tasks.filter(t => !t.done)
    const done    = tasks.filter(t => t.done)
    const arr = [...pending]
    const [item] = arr.splice(fromIdx, 1)
    arr.splice(toIdx, 0, item)
    syncTasks([...arr, ...done])
  }

  function getCalItemTransform(idx) {
    if (calDragIdx === null || calDragOver === null || calDragIdx === calDragOver) return 0
    if (idx === calDragIdx) return 0
    const h = calDragItemH + 4
    if (calDragIdx < calDragOver) {
      if (idx > calDragIdx && idx <= calDragOver) return -h
    } else {
      if (idx >= calDragOver && idx < calDragIdx) return h
    }
    return 0
  }

  function syncTasks(updater) {
    setTasks(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater
      try { localStorage.setItem('trackr_tasks', JSON.stringify(updated)) } catch {}
      window.dispatchEvent(new Event('trackr-tasks-updated'))
      return updated
    })
  }

  const handleCalTaskSave = ({ id, title, due, note, priority }) => {
    if (!id) {
      syncTasks(t => [...t, { id: Date.now().toString(), title, due, priority, note, done: false, createdAt: new Date().toISOString() }])
    } else {
      syncTasks(t => t.map(x => x.id === id ? { ...x, title, due, priority, note } : x))
    }
    setCalTaskModal({ open: false, task: null })
  }
  const toggleTask = id => syncTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done, completedAt: x.done ? null : new Date().toISOString() } : x))
  const deleteTask = id => syncTasks(t => t.filter(x => x.id !== id))

  const addGoal = () => {
    if (!goalForm.title.trim() || !goalForm.target) return
    setGoals(g => [...g, { id: Date.now().toString(), ...goalForm, progress: 0, createdAt: new Date().toISOString() }])
    setGoalForm(f => ({ ...f, open: false, title: '', target: '' }))
  }
  const nudgeGoal = (id, dir) => {
    setGoals(g => g.map(x => x.id === id ? { ...x, progress: Math.max(0, Math.min(Number(x.target), x.progress + dir)) } : x))
    if (dir > 0) {
      const q = GOAL_QUOTES[Math.floor(Math.random() * GOAL_QUOTES.length)]
      setMotivation({ goalId: id, text: q })
      if (motivationTimer.current) clearTimeout(motivationTimer.current)
      motivationTimer.current = setTimeout(() => setMotivation({ goalId: null, text: '' }), 3000)
    }
  }
  const setPctGoal = (id, pct, target) => {
    const clamped = Math.min(100, Math.max(0, Number(pct)))
    setGoals(g => g.map(x => x.id === id ? { ...x, progress: Math.round((clamped / 100) * Number(target)) } : x))
  }
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

  return (
    <div style={{ fontFamily: SANS, maxWidth: 1100, margin: '0 auto' }}>

      <BackToHome />

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, paddingTop: 4 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', color: '#e2e2e8', marginBottom: 6 }}>My Calendar</h1>
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
          <CalendarIcon size={12} /> Open Google Calendar <ExternalLink size={10} />
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'flex-start' }}>

        {/* ── Left: mini calendar + day view ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'linear-gradient(145deg, #0d1829, #070d1a)',
            border: '0.5px solid rgba(163,201,255,0.1)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(163,201,255,0.04)',
            padding: '18px 14px 14px',
          }}>
            <MiniCal selected={selectedDate} onSelect={setSelectedDate} marked={markedDates} />
          </div>

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
                <button onClick={() => setCalTaskModal({ open: true, task: null })}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: MONO, fontSize: 9, fontWeight: 700, color: '#a3c9ff', background: 'rgba(163,201,255,0.08)', border: '0.5px solid rgba(163,201,255,0.2)', padding: '4px 10px', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  <Plus size={10} /> Add
                </button>
              }
            />

            {/* Task list */}
            <div style={{ display:'flex', gap:6 }}>
              <div ref={taskListRef} onDragOver={e => e.preventDefault()} style={{ flex:1, display:'flex', flexDirection:'column', gap:4, maxHeight:320, overflowY:'auto', padding:'4px 0 2px', scrollbarWidth:'none', msOverflowStyle:'none' }}>
                {pendingTasks.length === 0 && (
                  <p style={{ fontFamily:MONO, fontSize:9, color:'rgba(160,200,255,0.3)', padding:'10px 10px' }}>No pending tasks — add one above.</p>
                )}
                {pendingTasks.map((t, idx) => (
                  <div
                    key={t.id}
                    draggable={true}
                    onDragStart={e => {
                      const el = e.currentTarget
                      const rect = el.getBoundingClientRect()
                      setCalDragItemH(rect.height)
                      setCalDragIdx(idx)
                      calDragFromRef.current = idx
                      calDragToRef.current   = idx
                      e.dataTransfer.effectAllowed = 'move'
                      const clone = el.cloneNode(true)
                      Object.assign(clone.style, {
                        position: 'fixed', top: rect.top + 'px', left: rect.left + 'px',
                        width: rect.width + 'px', opacity: '1', pointerEvents: 'none',
                        zIndex: '99999', margin: '0', transform: 'none',
                      })
                      document.body.appendChild(clone)
                      e.dataTransfer.setDragImage(clone, e.clientX - rect.left, e.clientY - rect.top)
                      requestAnimationFrame(() => { if (document.body.contains(clone)) document.body.removeChild(clone) })
                    }}
                    onDragEnd={() => {
                      const from = calDragFromRef.current
                      const to   = calDragToRef.current
                      calDragFromRef.current = null
                      calDragToRef.current   = null
                      setCalDragIdx(null)
                      setCalDragOver(null)
                      if (from !== null && to !== null && from !== to) reorderPendingTasks(from, to)
                    }}
                    onClick={() => { if (calDragIdx === null) setCalTaskModal({ open: true, task: t }) }}
                    onDragOver={e => { e.preventDefault(); setCalDragOver(idx); calDragToRef.current = idx }}
                    onDrop={e => { e.preventDefault() }}
                    style={{
                      display:'flex', alignItems:'center', gap:8, padding:'8px 10px',
                      border: calDragOver === idx && calDragIdx !== null && calDragIdx !== idx
                        ? '1px solid rgba(96,165,250,0.55)'
                        : '1px solid rgba(96,165,250,0.15)',
                      background: calDragOver === idx && calDragIdx !== null && calDragIdx !== idx
                        ? 'rgba(96,165,250,0.06)'
                        : 'rgba(96,165,250,0.02)',
                      cursor: calDragIdx === idx ? 'grabbing' : 'grab',
                      userSelect: 'none',
                      opacity: calDragIdx === idx ? 0 : 1,
                      transform: `translateY(${getCalItemTransform(idx)}px)`,
                      transition: calDragIdx !== null ? 'transform 0.15s ease' : 'border-color 0.1s, background 0.1s',
                    }}
                    onMouseEnter={e => { if (calDragIdx === null) { e.currentTarget.style.background='rgba(96,165,250,0.06)'; e.currentTarget.style.borderColor='rgba(96,165,250,0.28)' } }}
                    onMouseLeave={e => { if (calDragIdx === null) { e.currentTarget.style.background='rgba(96,165,250,0.02)'; e.currentTarget.style.borderColor='rgba(96,165,250,0.15)' } }}
                  >
                    <GripVertical size={12} style={{ color:'rgba(163,201,255,0.22)', flexShrink:0, pointerEvents:'none' }}/>

                    <button onClick={e => { e.stopPropagation(); toggleTask(t.id) }} style={{ background:'none', border:'none', cursor:'pointer', color: PRIORITY_COLOR[t.priority||'medium'], display:'flex', flexShrink:0, padding:'8px', margin:'-8px' }}>
                      <Circle size={14}/>
                    </button>

                    <div style={{ flex:1, minWidth:0 }}>
                      <p title={t.title} style={{ fontSize:12, color:'#c0c7d5', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.title}</p>
                      <p style={{ fontFamily:MONO, fontSize:8, marginTop:1, color: isPast(startOfDay(parseISO(t.due))) && !isToday(parseISO(t.due)) ? '#a78bfa' : '#3a4455' }}>
                        {isToday(parseISO(t.due)) ? 'Today' : format(parseISO(t.due), 'MMM d')}
                      </p>
                    </div>

                    <button onClick={e => { e.stopPropagation(); deleteTask(t.id) }} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(160,200,255,0.18)', display:'flex', padding:0, flexShrink:0, transition:'color 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.color='#f87171'} onMouseLeave={e=>e.currentTarget.style.color='rgba(160,200,255,0.18)'}>
                      <Trash2 size={11}/>
                    </button>
                  </div>
                ))}
                {doneTasks.length > 0 && (
                  <details style={{ marginTop:2 }}>
                    <summary style={{ fontFamily:MONO, fontSize:8, color:'rgba(160,200,255,0.3)', cursor:'pointer', padding:'4px 2px', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                      {doneTasks.length} completed
                    </summary>
                    {doneTasks.map(t => (
                      <div key={t.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', opacity:0.4 }}>
                        <button onClick={() => toggleTask(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#4edea3', display:'flex', flexShrink:0, padding:0 }}><Check size={14}/></button>
                        <p style={{ fontSize:11, color:'#5a6478', textDecoration:'line-through', flex:1 }}>{t.title}</p>
                        <button onClick={() => deleteTask(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(160,200,255,0.3)', display:'flex', padding:0 }}><X size={10}/></button>
                      </div>
                    ))}
                  </details>
                )}
              </div>

              {/* Custom scrollbar — only when overflow */}
              {taskListScrollable && (() => {
                const ARROW = 22
                const trackArea = Math.max(1, taskDims.ch - ARROW * 2)
                const thumbH = Math.max(20, taskDims.sh > 0 ? (taskDims.ch / taskDims.sh) * trackArea : trackArea)
                const thumbTop = taskDims.sh > taskDims.ch
                  ? (taskScrollTop / (taskDims.sh - taskDims.ch)) * (trackArea - thumbH)
                  : 0
                return (
                  <div style={{ width:10, display:'flex', flexDirection:'column', flexShrink:0, userSelect:'none' }}>
                    {/* Up arrow */}
                    <button
                      onClick={() => taskListRef.current?.scrollBy({ top:-40, behavior:'smooth' })}
                      style={{ width:10, height:ARROW, background:'rgba(96,165,250,0.1)', border:'0.5px solid rgba(96,165,250,0.25)', borderBottom:'none', color:'#60a5fa', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, padding:0 }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(96,165,250,0.25)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(96,165,250,0.1)'}>
                      <ChevronUp size={7}/>
                    </button>
                    {/* Track */}
                    <div
                      style={{ flex:1, position:'relative', background:'rgba(96,165,250,0.04)', border:'0.5px solid rgba(96,165,250,0.12)', borderTop:'none', borderBottom:'none', cursor:'pointer' }}
                      onClick={e => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const ratio = (e.clientY - rect.top) / trackArea
                        if (taskListRef.current) taskListRef.current.scrollTop = ratio * (taskDims.sh - taskDims.ch)
                      }}
                    >
                      <div
                        onMouseDown={e => { e.preventDefault(); thumbDrag.current = { active:true, startY:e.clientY, startST:taskScrollTop } }}
                        style={{
                          position:'absolute', top:thumbTop, left:0, right:0, height:thumbH,
                          background:'linear-gradient(180deg, #7ab4ff, #4d8fe0)',
                          border:'0.5px solid rgba(96,165,250,0.6)',
                          boxShadow:'0 0 6px rgba(96,165,250,0.3)',
                          cursor:'grab',
                        }}
                      />
                    </div>
                    {/* Down arrow */}
                    <button
                      onClick={() => taskListRef.current?.scrollBy({ top:40, behavior:'smooth' })}
                      style={{ width:10, height:ARROW, background:'rgba(96,165,250,0.1)', border:'0.5px solid rgba(96,165,250,0.25)', borderTop:'none', color:'#60a5fa', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, padding:0 }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(96,165,250,0.25)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(96,165,250,0.1)'}>
                      <ChevronDown size={7}/>
                    </button>
                  </div>
                )
              })()}
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
                <p style={{ fontFamily:MONO, fontSize:9, color:'rgba(160,200,255,0.3)' }}>No goals yet — set your first target above.</p>
              )}
              {goals.map(g => {
                const pct = Math.min(100, g.target > 0 ? Math.round((g.progress / g.target) * 100) : 0)
                const done = g.progress >= Number(g.target)
                return (
                  <div key={g.id} style={{ padding:'10px 12px', background:'rgba(96,165,250,0.04)', border:`1px solid rgba(96,165,250,0.1)` }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                      <div>
                        <p style={{ fontSize:12, fontWeight:600, color: done ? '#4edea3' : '#c0c7d5' }}>{g.title}</p>
                        <p style={{ fontFamily:MONO, fontSize:8, color:'#3a4455', marginTop:1, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                          {g.progress}/{g.target} {g.unit} · per {g.period}
                        </p>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <input
                          type="number" min="0" max="100"
                          value={pct}
                          onChange={e => setPctGoal(g.id, e.target.value, g.target)}
                          style={{ fontFamily:MONO, fontSize:13, fontWeight:800, color: done ? '#4edea3' : '#8a919f', background:'transparent', border:'none', borderBottom:`0.5px solid ${done ? 'rgba(78,222,163,0.3)' : 'rgba(255,255,255,0.08)'}`, width:34, textAlign:'right', outline:'none', padding:'0 0 1px 0', MozAppearance:'textfield' }}
                        />
                        <span style={{ fontFamily:MONO, fontSize:13, fontWeight:800, color: done ? '#4edea3' : '#8a919f' }}>%</span>
                        <button onClick={() => deleteGoal(g.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(160,200,255,0.3)', display:'flex', padding:0, transition:'color 0.15s' }}
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
                    {motivation.goalId === g.id && (
                      <p style={{ fontFamily:MONO, fontSize:9, color:'#4edea3', opacity:0.75, marginTop:5, letterSpacing:'0.04em', fontStyle:'italic', lineHeight:1.4 }}>
                        ↑ {motivation.text}
                      </p>
                    )}
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
                  <p style={{ fontFamily:MONO, fontSize:9, color:'rgba(160,200,255,0.3)', marginBottom:6 }}>No interviews in progress.</p>
                  <p style={{ fontFamily:MONO, fontSize:8, color:'rgba(160,200,255,0.2)' }}>Applications with "Interview" status appear here automatically.</p>
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
                          <CalendarIcon size={9}/> Add to GCal
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
                <p style={{ fontFamily:MONO, fontSize:9, color:'rgba(160,200,255,0.3)' }}>No sessions scheduled — block time to focus.</p>
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
                        <CalendarIcon size={10}/>
                      </a>
                      <button onClick={() => deleteSession(s.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(160,200,255,0.3)', display:'flex', padding:0, transition:'color 0.15s' }}
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

      <TaskModal
        open={calTaskModal.open}
        task={calTaskModal.task}
        onClose={() => setCalTaskModal({ open: false, task: null })}
        onSave={handleCalTaskSave}
      />
    </div>
  )
}
