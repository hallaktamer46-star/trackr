import { useState, useEffect, useRef, useMemo } from 'react'
import { Power, Play, Plus, X, Check, Circle, CheckCircle2, GripVertical } from 'lucide-react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import SetShiftModal from './SetShiftModal'
import TaskModal from './TaskModal'
import { Button } from '@/components/ui/button'

const NUM  = 'Consolas, Menlo, Monaco, monospace'
const BODY = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"

const STATUSES = [
  { key: 'not_ready', label: 'Not Ready',  color: '#ff6b6b' },
  { key: 'working',   label: 'Working',    color: '#4edea3' },
  { key: 'break',     label: 'Break',      color: '#ffb689' },
  { key: 'meeting',   label: 'Meeting',    color: '#f472b6' },
  { key: 'research',  label: 'Research',   color: '#60a5fa' },
  { key: 'clerical',  label: 'Clerical',   color: '#fbbf24' },
  { key: 'coaching',  label: 'Coaching',   color: '#a78bfa' },
]

function fmt(s) {
  if (!s || s <= 0) return '0s'
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60
  if (h > 0) return `${h}h ${String(m).padStart(2,'0')}m ${String(sec).padStart(2,'0')}s`
  if (m > 0) return `${m}m ${String(sec).padStart(2,'0')}s`
  return `${sec}s`
}

const KEY        = 'trackr_engage_v2'
const TASKS_KEY  = 'trackr_tasks'
const CHECKIN_KEY = 'trackr_checkin_pending'
const load      = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } }
const save      = v  => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }
const loadTasks = () => { try { return JSON.parse(localStorage.getItem(TASKS_KEY)) || [] } catch { return [] } }
const saveTasks = v  => { try { localStorage.setItem(TASKS_KEY, JSON.stringify(v)) } catch {} }

// Run synchronously before React state loads — if check-in deadline passed while app was closed,
// trim the log and save the ended shift to history, then clear the active session from storage.
function recoverMissedClockOut() {
  try {
    const raw = localStorage.getItem(CHECKIN_KEY)
    if (!raw) return
    const { deadline, cutoffTime } = JSON.parse(raw)
    if (Date.now() < deadline) return // still within grace period
    const shiftData = JSON.parse(localStorage.getItem(KEY))
    if (!shiftData?.shiftStart) { localStorage.removeItem(CHECKIN_KEY); return }
    const rawLog = shiftData.log || []
    const trimmed = rawLog.reduce((acc, e) => {
      if (e.start >= cutoffTime) return acc
      acc.push(!e.end || e.end > cutoffTime ? { ...e, end: cutoffTime } : e)
      return acc
    }, [])
    const finalTotals = {}
    for (const e of trimmed) {
      if (e.end && e.start) {
        const s = Math.floor((e.end - e.start) / 1000)
        finalTotals[e.status] = (finalTotals[e.status] || 0) + s
      }
    }
    const totalSecs = Math.floor((cutoffTime - shiftData.shiftStart) / 1000)
    const recordDate = shiftData.sessionDate || shiftData.date
    const hist = JSON.parse(localStorage.getItem('trackr_history') || '[]')
    const idx = hist.findIndex(h => h.date === recordDate)
    const record = { date: recordDate, total: totalSecs, statuses: finalTotals, shiftStart: shiftData.shiftStart, shiftEnd: cutoffTime }
    if (idx >= 0) hist[idx] = record; else hist.push(record)
    hist.sort((a, b) => new Date(b.date) - new Date(a.date))
    localStorage.setItem('trackr_history', JSON.stringify(hist.slice(0, 60)))
    // Mark shift as ended in storage so the load effect sees it as inactive
    localStorage.setItem(KEY, JSON.stringify({ ...shiftData, status: null, shiftStart: null, sessionDate: null, log: trimmed }))
    localStorage.removeItem(CHECKIN_KEY)
  } catch {}
}

export default function EngageWidget() {
  const today    = new Date().toDateString()
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const [tab, setTab]               = useState(null)
  const [status, setStatus]         = useState(null)
  const [log, setLog]               = useState([])
  const [custom, setCustom]         = useState([])
  const [showAdd, setShowAdd]       = useState(false)
  const [newLabel, setNewLabel]     = useState('')
  const [shiftStart, setShiftStart] = useState(null)
  const [sessionDate, setSessionDate] = useState(null)
  const [, setTick]                 = useState(0)

  const [tasks, setTasks]             = useState(loadTasks)
  const [editingTask, setEditingTask] = useState(null)
  const [wDragIdx,  setWDragIdx]  = useState(null)
  const [wDragOver, setWDragOver] = useState(null)
  const [wDragItemH, setWDragItemH] = useState(36)
  const wDragFromRef = useRef(null)
  const wDragToRef   = useRef(null)

  const [lastCompleted, setLastCompleted] = useState(null)
  const undoTimer = useRef(null)

  const [shiftGoal, setShiftGoal]       = useState(null)
  const [showSetShift, setShowSetShift] = useState(false)
  const [checkInState, setCheckInState] = useState(null)
  const [lastCheckIn, setLastCheckIn]   = useState(null)
  const twoHourRef   = useRef(null)
  const checkInRef   = useRef(null)
  const shiftGoalRef = useRef(null)
  const logRef         = useRef([])
  const shiftStartRef  = useRef(null)
  const sessionDateRef = useRef(null)

  const navigate  = useNavigate()
  const timer          = useRef(null)
  const widgetRef      = useRef(null)
  const statusListRef  = useRef(null)

  // Computed values needed in useEffect dependency arrays — must be declared before useEffect calls
  const allStatuses = [...STATUSES, ...custom.map((l,i) => ({ key:'c'+i, label:l, color:'#60a5fa' }))]
  const cur = allStatuses.find(s => s.key === status)
  const T = (() => {
    const now = Date.now(), t = {}
    for (const e of log) { const s = Math.floor(((e.end||now)-e.start)/1000); t[e.status]=(t[e.status]||0)+s }
    return t
  })()
  const curSecs   = log.length && !log[log.length-1]?.end ? Math.floor((Date.now()-log[log.length-1].start)/1000) : 0
  const shiftSecs = shiftStart
    ? Math.floor((Date.now()-shiftStart)/1000)
    : log.reduce((acc,e) => acc + (e.end && e.start ? Math.floor((e.end-e.start)/1000) : 0), 0)

  useEffect(() => {
    const h = (e) => { if (widgetRef.current && !widgetRef.current.contains(e.target)) setTab(null) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    recoverMissedClockOut() // process any missed auto-clock-out before reading state
    const s = load()
    if (!s) return
    if (s.shiftStart && !s.status) {
      const shiftDay = new Date(s.shiftStart).toDateString()
      if (shiftDay !== today) {
        setCustom(s.custom || [])
        return
      }
    }
    const sd = s.sessionDate || s.date
    const hasActiveSession = s.status !== null && s.shiftStart
    if (hasActiveSession || sd === today) {
      setStatus(s.status ?? null); setLog(s.log || [])
      setCustom(s.custom || []); setShiftStart(s.shiftStart || null)
      setSessionDate(s.sessionDate || s.date || today)
    }
  }, [])

  // Restore pending check-in timer if deadline hasn't passed yet
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKIN_KEY)
      if (!raw) return
      const { deadline, cutoffTime } = JSON.parse(raw)
      if (Date.now() >= deadline) return // already handled by recoverMissedClockOut
      setCheckInState({ deadline, cutoffTime })
      window.dispatchEvent(new CustomEvent('trackr-checkin-start', { detail: { deadline, cutoffTime } }))
      clearTimeout(checkInRef.current)
      checkInRef.current = setTimeout(() => {
        localStorage.removeItem(CHECKIN_KEY)
        window.dispatchEvent(new Event('trackr-checkin-clear'))
        const log = logRef.current
        const trimmed = log.reduce((acc, e) => {
          if (e.start >= cutoffTime) return acc
          acc.push(!e.end || e.end > cutoffTime ? { ...e, end: cutoffTime } : e)
          return acc
        }, [])
        doEndShift(trimmed, cutoffTime, shiftStartRef.current, sessionDateRef.current)
      }, deadline - Date.now())
    } catch {}
  }, []) // eslint-disable-line

  // Listen for "I'm still here" confirmed from the Header notification panel
  useEffect(() => {
    const handler = () => confirmStillHere()
    window.addEventListener('trackr-checkin-confirm', handler)
    return () => window.removeEventListener('trackr-checkin-confirm', handler)
  }, []) // eslint-disable-line

  // Listen for clock-out triggered from the check-in notification in the header
  useEffect(() => {
    const handler = () => doEndShift(logRef.current, Date.now(), shiftStartRef.current, sessionDateRef.current)
    window.addEventListener('trackr-clockout', handler)
    return () => window.removeEventListener('trackr-clockout', handler)
  }, []) // eslint-disable-line

  useEffect(() => { save({ status, log, custom, shiftStart, sessionDate, date: today }) }, [status, log, custom, shiftStart, sessionDate])
  useEffect(() => { saveTasks(tasks) }, [tasks])

  // Keep refs in sync so timer callbacks always read latest state
  useEffect(() => { logRef.current = log }, [log])
  useEffect(() => { shiftStartRef.current = shiftStart }, [shiftStart])
  useEffect(() => { sessionDateRef.current = sessionDate }, [sessionDate])

  // Load / persist shift goal across sessions
  useEffect(() => {
    try { const g = localStorage.getItem('trackr_shift_goal'); if (g) setShiftGoal(JSON.parse(g)) } catch {}
  }, [])
  useEffect(() => {
    try {
      if (shiftGoal) localStorage.setItem('trackr_shift_goal', JSON.stringify(shiftGoal))
      else localStorage.removeItem('trackr_shift_goal')
    } catch {}
  }, [shiftGoal])

  // 2-hour check-in timer: fires when worker has been active for 2h without confirming
  useEffect(() => {
    clearTimeout(twoHourRef.current)
    if (status === null || shiftStart === null || checkInState) return
    const base   = lastCheckIn || shiftStart
    const cutoff = base + 2 * 60 * 60 * 1000
    const ms     = cutoff - Date.now()
    if (ms <= 0) {
      fireCheckIn(cutoff)
    } else {
      twoHourRef.current = setTimeout(() => fireCheckIn(cutoff), ms)
    }
    return () => clearTimeout(twoHourRef.current)
  }, [status, shiftStart, lastCheckIn, checkInState]) // eslint-disable-line

  // Shift goal notification when goal time is reached
  useEffect(() => {
    clearTimeout(shiftGoalRef.current)
    if (!shiftGoal || status === null) return
    let ms
    if (shiftGoal.type === 'duration') {
      try {
        const hist = JSON.parse(localStorage.getItem('trackr_history') || '[]')
        const rec  = hist.find(h => h.date === todayStr)
        const alreadyDone = rec ? rec.total : 0
        const remaining = Math.max(0, shiftGoal.hours * 3600 - alreadyDone - shiftSecs)
        ms = remaining * 1000
      } catch { return }
    } else {
      if (!shiftStart) return
      const goalEnd = getGoalEnd(shiftGoal, shiftStart)
      if (!goalEnd) return
      ms = goalEnd - Date.now()
    }
    if (ms <= 0) return
    shiftGoalRef.current = setTimeout(() => {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Trackr — Shift complete!', { body: 'Your shift goal is up. Time to clock out!', tag: 'trackr-goal' })
      }
    }, ms)
    return () => clearTimeout(shiftGoalRef.current)
  }, [shiftGoal, shiftStart, status, shiftSecs]) // eslint-disable-line

  useEffect(() => {
    const handler = () => setTasks(loadTasks())
    window.addEventListener('trackr-tasks-updated', handler)
    return () => window.removeEventListener('trackr-tasks-updated', handler)
  }, [])

  useEffect(() => {
    if (status !== null) timer.current = setInterval(() => setTick(t => t+1), 1000)
    else clearInterval(timer.current)
    return () => clearInterval(timer.current)
  }, [status])


  const pending   = tasks.filter(t => !t.done && t.due <= todayStr)
  const doneTasks = tasks.filter(t => t.done)

  function pickStatus(key) {
    const now = Date.now()
    if (shiftStart === null) { setShiftStart(now); setSessionDate(today) }
    setLog(l => {
      const c = [...l]
      if (c.length && !c[c.length-1].end) c[c.length-1] = {...c[c.length-1], end: now}
      return [...c, { status: key, start: now }]
    })
    setStatus(key)
  }

  function fmtCountdown(ms) {
    if (!ms || ms <= 0) return '0:00'
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  function getGoalEnd(goal, start) {
    if (!goal || !start) return null
    if (goal.type === 'duration') return start + goal.hours * 3600 * 1000
    const [h, m] = goal.endTime.split(':').map(Number)
    const d = new Date(start); d.setHours(h, m, 0, 0)
    if (d.getTime() <= start) d.setDate(d.getDate() + 1)
    return d.getTime()
  }

  function doEndShift(rawLog, endTime, theShiftStart, theSessionDate) {
    const now = endTime ?? Date.now()
    const recordDate = theSessionDate || today
    const finalLog = rawLog.map((e, i) => i === rawLog.length - 1 && !e.end ? { ...e, end: now } : e)
    const finalTotals = {}
    for (const e of finalLog) {
      if (e.end && e.start) {
        const s = Math.floor((e.end - e.start) / 1000)
        finalTotals[e.status] = (finalTotals[e.status] || 0) + s
      }
    }
    const totalSecs = theShiftStart ? Math.floor((now - theShiftStart) / 1000) : 0
    try {
      const hist = JSON.parse(localStorage.getItem('trackr_history') || '[]')
      const idx  = hist.findIndex(h => h.date === recordDate)
      const record = { date: recordDate, total: totalSecs, statuses: finalTotals, shiftStart: theShiftStart, shiftEnd: now }
      if (idx >= 0) hist[idx] = record; else hist.push(record)
      hist.sort((a, b) => new Date(b.date) - new Date(a.date))
      localStorage.setItem('trackr_history', JSON.stringify(hist.slice(0, 60)))
    } catch {}
    clearTimeout(twoHourRef.current)
    clearTimeout(checkInRef.current)
    clearTimeout(shiftGoalRef.current)
    localStorage.removeItem(CHECKIN_KEY)
    window.dispatchEvent(new Event('trackr-checkin-clear'))
    setLog(finalLog); setStatus(null); setShiftStart(null); setSessionDate(null)
    setCheckInState(null); setLastCheckIn(null); setTab('activity')
  }

  function endShift() {
    doEndShift(log, Date.now(), shiftStart, sessionDate)
  }

  function fireCheckIn(cutoffTime) {
    if (typeof Notification !== 'undefined') {
      const send = () => new Notification('Trackr — Still working?', {
        body: 'You have 30 minutes to confirm, or your shift auto-ends.',
        tag: 'trackr-checkin',
      })
      if (Notification.permission === 'granted') send()
      else if (Notification.permission === 'default') {
        Notification.requestPermission().then(p => { if (p === 'granted') send() })
      }
    }
    const deadline = Date.now() + 30 * 60 * 1000
    const pending = { deadline, cutoffTime }
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(pending))
    setCheckInState({ deadline, cutoffTime })
    window.dispatchEvent(new CustomEvent('trackr-checkin-start', { detail: pending }))
    clearTimeout(checkInRef.current)
    checkInRef.current = setTimeout(() => {
      localStorage.removeItem(CHECKIN_KEY)
      window.dispatchEvent(new Event('trackr-checkin-clear'))
      const cur = logRef.current
      const trimmed = cur.reduce((acc, e) => {
        if (e.start >= cutoffTime) return acc
        acc.push(!e.end || e.end > cutoffTime ? { ...e, end: cutoffTime } : e)
        return acc
      }, [])
      doEndShift(trimmed, cutoffTime, shiftStartRef.current, sessionDateRef.current)
    }, 30 * 60 * 1000)
  }

  function confirmStillHere() {
    clearTimeout(checkInRef.current)
    localStorage.removeItem(CHECKIN_KEY)
    window.dispatchEvent(new Event('trackr-checkin-clear'))
    setCheckInState(null)
    setLastCheckIn(Date.now())
  }


  function addCustom() {
    const lbl = newLabel.trim(); if (!lbl) return
    setCustom(c=>[...c,lbl]); setNewLabel(''); setShowAdd(false)
    requestAnimationFrame(() => {
      if (statusListRef.current) statusListRef.current.scrollTop = statusListRef.current.scrollHeight
    })
  }

  function removeCustom(idx) {
    setCustom(c => c.filter((_,i) => i !== idx))
    // If currently on this custom status, reset to null
    if (status === 'c'+idx) setStatus(null)
  }

  function toggleTask(id) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const completing = !t.done
      if (completing) {
        clearTimeout(undoTimer.current)
        setLastCompleted(t)
        undoTimer.current = setTimeout(() => setLastCompleted(null), 5000)
      }
      return { ...t, done: completing, completedAt: completing ? new Date().toISOString() : null }
    }))
  }

  function undoComplete() {
    if (!lastCompleted) return
    clearTimeout(undoTimer.current)
    setTasks(prev => prev.map(t => t.id === lastCompleted.id ? { ...t, done: false, completedAt: null } : t))
    setLastCompleted(null)
  }

  function removeTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function openEdit(t) {
    setEditingTask(t)
  }

  function reorderWidgetTasks(fromIdx, toIdx) {
    if (fromIdx === null || fromIdx === toIdx) return
    const p = tasks.filter(t => !t.done && t.due <= todayStr)
    const rest = tasks.filter(t => t.done || t.due > todayStr)
    const arr = [...p]
    const [item] = arr.splice(fromIdx, 1)
    arr.splice(toIdx, 0, item)
    setTasks([...arr, ...rest])
  }

  function getWidgetItemTransform(idx) {
    if (wDragIdx === null || wDragOver === null || wDragIdx === wDragOver) return 0
    if (idx === wDragIdx) return 0
    const h = wDragItemH + 1
    if (wDragIdx < wDragOver) {
      if (idx > wDragIdx && idx <= wDragOver) return -h
    } else {
      if (idx >= wDragOver && idx < wDragIdx) return h
    }
    return 0
  }

  function handleTaskSave({ id, title, due, note, priority }) {
    if (!id) {
      setTasks(prev => {
        const updated = [...prev, { id: Date.now(), title, due, note, priority, done: false }]
        saveTasks(updated) // persist before dispatching so listeners read fresh data
        window.dispatchEvent(new Event('trackr-tasks-updated'))
        return updated
      })
    } else {
      setTasks(prev => {
        const updated = prev.map(t => t.id === id ? { ...t, title, due, note, priority } : t)
        saveTasks(updated)
        return updated
      })
    }
    setEditingTask(null)
  }

  const openTab = t => setTab(p => p === t ? null : t)

  const BG      = '#07090f'
  const BORDER  = 'rgba(60,100,200,0.18)'
  const DIVIDER = 'rgba(40,80,180,0.12)'

  // Total seconds worked today = completed sessions in history + current session
  const todayHistoryTotal = useMemo(() => {
    try {
      const hist = JSON.parse(localStorage.getItem('trackr_history') || '[]')
      const rec = hist.find(h => h.date === todayStr)
      return rec ? rec.total : 0
    } catch { return 0 }
  }, [todayStr])
  const totalSecsToday = todayHistoryTotal + shiftSecs

  // Duration goals: remaining = goal - ALL time worked today (survives clock-out/login)
  // End-time goals: remaining = goalEnd timestamp - now (unchanged)
  const goalEnd = getGoalEnd(shiftGoal, shiftStart)
  const goalRemaining = !shiftGoal ? null
    : shiftGoal.type === 'duration'
      ? Math.max(0, shiftGoal.hours * 3600 - totalSecsToday) * 1000
      : goalEnd ? Math.max(0, goalEnd - Date.now()) : null
  const goalOver = goalRemaining !== null && goalRemaining === 0

  const shiftGoalLabel = !shiftGoal ? null
    : shiftGoal.type === 'duration' ? `${shiftGoal.hours}h shift`
    : `ends ${shiftGoal.endTime}`

  return (
    <div ref={widgetRef} style={{ position:'fixed', bottom:0, right:0, width: tab ? 620 : 340, zIndex:9999, fontFamily:BODY, display:'flex', flexDirection:'column', transition:'width 0.2s cubic-bezier(0.22,1,0.36,1)' }}>

      {/* ── TAB BAR ── */}
      <div style={{
        display:'flex',
        background: BG,
        borderTop: `1px solid ${BORDER}`,
        borderLeft: `1px solid ${BORDER}`,
        backdropFilter: 'blur(24px)',
        boxShadow: status && cur ? `0 -3px 24px ${cur.color}25` : '0 -2px 16px rgba(0,0,0,0.5)',
        transition: 'box-shadow 0.4s',
      }}>
        <button onClick={() => openTab('engage')} style={{
          flex: tab === 'engage' ? '0 0 300px' : 1,
          padding:'12px 0', border:'none',
          background: tab==='engage' ? `${cur?.color || '#4edea3'}10` : 'transparent',
          borderBottom: tab==='engage' ? `2px solid ${cur?.color || '#4edea3'}` : '2px solid transparent',
          borderRight: tab === 'engage' ? `1px solid ${DIVIDER}` : 'none',
          cursor:'pointer', transition:'all 0.15s',
        }}>
          {cur && tab !== 'engage' ? (
            <span style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
              <span style={{fontSize:12,fontWeight:600,color:cur.color}}>Engage</span>
              <span style={{fontSize:9,color:cur.color,fontFamily:NUM,opacity:0.8}}>{cur.label} · {fmt(curSecs)}</span>
            </span>
          ) : (
            <span style={{fontSize:12,fontWeight:600,color: tab==='engage' ? (cur?.color||'#4edea3') : '#4a70b0'}}>Engage</span>
          )}
        </button>
        <button onClick={() => openTab('activity')} style={{
          flex:1, padding:'12px 0', border:'none',
          background: tab==='activity' ? 'rgba(96,165,250,0.08)' : 'transparent',
          borderBottom: tab==='activity' ? '2px solid #60a5fa' : '2px solid transparent',
          cursor:'pointer', transition:'all 0.15s',
        }}>
          <span style={{fontSize:12,fontWeight:600,color: tab==='activity' ? '#60a5fa' : '#4a70b0'}}>Activity</span>
        </button>
      </div>

      {/* ── PANEL ── */}
      {tab && (
        <div style={{
          background: BG,
          borderBottom: `1px solid ${BORDER}`,
          borderLeft: `1px solid ${BORDER}`,
          backdropFilter: 'blur(24px)',
          boxShadow: '-4px 0px 40px rgba(0,0,0,0.7)',
          animation: 'slideUp 0.18s cubic-bezier(0.22,1,0.36,1)',
        }}>

          {/* ══ ENGAGE PANEL — two columns ══ */}
          {tab === 'engage' && (
            <div style={{ display:'flex', alignItems:'stretch' }}>

              {/* ── LEFT: Status switcher ── */}
              <div style={{ flex:'0 0 300px', borderRight:`1px solid ${DIVIDER}` }}>

                {/* Clock In / Out */}
                <div style={{display:'flex',borderBottom:`1px solid ${DIVIDER}`}}>
                  <button onClick={endShift} disabled={status===null}
                    style={{
                      flex:1, padding:'12px 0', border:'none',
                      borderRight:`1px solid ${DIVIDER}`,
                      background: status!==null ? 'rgba(255,107,107,0.07)' : 'transparent',
                      color: status!==null ? '#ff6b6b' : '#1e3a70',
                      cursor: status!==null ? 'pointer' : 'default',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                      fontSize:11, fontFamily:BODY, fontWeight:700, letterSpacing:'0.02em',
                      transition:'background 0.15s',
                    }}
                    onMouseEnter={e=>{ if(status!==null) e.currentTarget.style.background='rgba(255,107,107,0.15)' }}
                    onMouseLeave={e=>{ if(status!==null) e.currentTarget.style.background='rgba(255,107,107,0.07)' }}>
                    <Power size={12}/> Clock out
                  </button>
                  <button onClick={() => { if(status===null) pickStatus('not_ready') }} disabled={status!==null}
                    style={{
                      flex:1, padding:'12px 0', border:'none',
                      background: status===null ? 'rgba(78,222,163,0.08)' : 'transparent',
                      color: status===null ? '#4edea3' : '#1e3a70',
                      cursor: status===null ? 'pointer' : 'default',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                      fontSize:11, fontFamily:BODY, fontWeight:700, letterSpacing:'0.02em',
                      transition:'background 0.15s',
                    }}
                    onMouseEnter={e=>{ if(status===null) e.currentTarget.style.background='rgba(78,222,163,0.15)' }}
                    onMouseLeave={e=>{ if(status===null) e.currentTarget.style.background='rgba(78,222,163,0.08)' }}>
                    <Play size={12} fill={status===null?'#4edea3':'#1e3a70'}/> Clock in
                  </button>
                </div>

                {/* Active status */}
                {cur && (
                  <div style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'10px 14px',
                    background:`linear-gradient(135deg, ${cur.color}12, ${cur.color}06)`,
                    borderBottom:`1px solid ${cur.color}20`,
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:7,height:7,borderRadius:'50%',background:cur.color,boxShadow:`0 0 8px ${cur.color}`,animation:'status-pulse 2s ease-in-out infinite'}}/>
                      <span style={{fontSize:13,fontWeight:800,color:cur.color,letterSpacing:'-0.01em'}}>{cur.label}</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      {goalRemaining !== null && (
                        <span style={{fontFamily:NUM,fontSize:9,color: goalOver ? '#ff6b6b' : '#3a6090',letterSpacing:'0.04em'}}>
                          {goalOver ? 'SHIFT OVER' : fmtCountdown(goalRemaining)}
                        </span>
                      )}
                      <span style={{fontFamily:NUM,fontSize:12,fontWeight:700,color:cur.color}}>{fmt(curSecs)}</span>
                    </div>
                  </div>
                )}

                {/* Switch to */}
                {cur && (
                  <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 14px 3px'}}>
                    <div style={{flex:1,height:'1px',background:`linear-gradient(90deg, ${cur.color}30, transparent)`}}/>
                    <span style={{fontFamily:NUM,fontSize:7,fontWeight:800,color:'#3a70d0',letterSpacing:'0.12em',textTransform:'uppercase',whiteSpace:'nowrap'}}>switch to</span>
                    <div style={{flex:1,height:'1px',background:`linear-gradient(270deg, ${cur.color}30, transparent)`}}/>
                  </div>
                )}

                {/* Status list */}
                <div ref={statusListRef} style={{ maxHeight: 260, overflowY: 'auto', scrollbarWidth:'thin', scrollbarColor:'rgba(96,165,250,0.2) transparent' }}>
                  {allStatuses.filter(s => s.key !== status).map((s, i, arr) => (
                    <div key={s.key} onClick={() => status !== null ? pickStatus(s.key) : null}
                      style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'9px 14px',
                        borderBottom: i < arr.length-1 ? `1px solid ${DIVIDER}` : 'none',
                        cursor: status!==null ? 'pointer' : 'default',
                        opacity: status===null ? 0.3 : 1,
                        transition:'background 0.12s',
                      }}
                      onMouseEnter={e=>{ if(status!==null) e.currentTarget.style.background=`${s.color}10` }}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:7,height:7,borderRadius:'50%',background:s.color,boxShadow:`0 0 5px ${s.color}80`}}/>
                        <span style={{fontSize:12,fontWeight:600,color:'#d0e4ff'}}>{s.label}</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontFamily:NUM,fontSize:10,fontWeight:600,color: T[s.key] ? s.color+'cc' : '#2a4898'}}>
                          {fmt(T[s.key]||0)}
                        </span>
                        {s.key.startsWith('c') && (
                          <button onClick={e=>{ e.stopPropagation(); removeCustom(parseInt(s.key.slice(1))) }}
                            style={{background:'none',border:'none',padding:0,cursor:'pointer',color:'#2a4070',display:'flex',lineHeight:1,transition:'color 0.15s'}}
                            onMouseEnter={e=>e.currentTarget.style.color='#ff6b6b'}
                            onMouseLeave={e=>e.currentTarget.style.color='#2a4070'}>
                            <X size={10}/>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add custom status */}
                {showAdd ? (
                  <div style={{display:'flex',alignItems:'center',gap:5,padding:'8px 14px',borderTop:`1px solid ${DIVIDER}`}}>
                    <input autoFocus value={newLabel} onChange={e=>setNewLabel(e.target.value)}
                      onKeyDown={e=>{if(e.key==='Enter')addCustom();if(e.key==='Escape'){setShowAdd(false);setNewLabel('')}}}
                      placeholder="Status name…"
                      style={{flex:1,padding:'6px 8px',background:'rgba(40,80,200,0.1)',border:`1px solid rgba(60,120,255,0.25)`,color:'#d0e4ff',fontSize:11,fontFamily:BODY,outline:'none'}}/>
                    <button onClick={addCustom} style={{padding:'6px 8px',background:'#4edea3',border:'none',color:'#07090f',cursor:'pointer',display:'flex',alignItems:'center'}}><Check size={11}/></button>
                    <button onClick={()=>{setShowAdd(false);setNewLabel('')}} style={{padding:'6px 8px',background:'transparent',border:`1px solid rgba(60,120,255,0.25)`,color:'#60a5fa',cursor:'pointer',display:'flex',alignItems:'center'}}><X size={11}/></button>
                  </div>
                ) : (
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',borderTop:`1px solid ${DIVIDER}`,gap:8}}>
                    <Button variant="notion" size="sm" onClick={()=>setShowSetShift(true)}>
                      {!shiftGoal && <Plus size={11}/>} {shiftGoalLabel || 'Set goal'}
                    </Button>
                    <Button variant="notion" size="sm" onClick={()=>setShowAdd(true)}>
                      <Plus size={11}/> New status
                    </Button>
                  </div>
                )}
              </div>

              {/* ── RIGHT: Today's Tasks ── */}
              <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

                {/* Header */}
                <div style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'10px 14px 8px',
                  borderBottom:`1px solid ${DIVIDER}`,
                  flexShrink: 0,
                }}>
                  <button onClick={() => { navigate('/calendar'); setTab(null) }}
                    style={{display:'flex',alignItems:'center',gap:6,fontFamily:NUM,fontSize:9,fontWeight:800,color:'#5090d8',letterSpacing:'0.12em',textTransform:'uppercase',background:'none',border:'none',cursor:'pointer',padding:0,transition:'color 0.15s'}}
                    onMouseEnter={e=>{ e.currentTarget.style.color='#60a5fa' }}
                    onMouseLeave={e=>{ e.currentTarget.style.color='#5090d8' }}>
                    Tasks
                  </button>
                  <Button
                    variant="notion"
                    size="sm"
                    onClick={() => openEdit({ id: null, title: '', due: todayStr, note: '', priority: 'medium' })}>
                    <Plus size={11}/> Add task
                  </Button>
                </div>

                {/* Task list */}
                <div onDragOver={e => e.preventDefault()} style={{ flex:1, overflowY:'auto', paddingBottom:8 }}>
                  {/* Undo toast */}
                  {lastCompleted && (
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 12px',background:'rgba(78,222,163,0.07)',borderBottom:'1px solid rgba(78,222,163,0.15)'}}>
                      <span style={{fontSize:11,color:'#4edea3',fontFamily:NUM,letterSpacing:'0.02em',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160}}>✓ {lastCompleted.title}</span>
                      <button onClick={undoComplete}
                        style={{flexShrink:0,fontSize:10,fontFamily:NUM,fontWeight:700,color:'#4edea3',background:'rgba(78,222,163,0.12)',border:'1px solid rgba(78,222,163,0.3)',padding:'3px 9px',cursor:'pointer',letterSpacing:'0.06em',transition:'all 0.15s'}}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(78,222,163,0.22)'}}
                        onMouseLeave={e=>{e.currentTarget.style.background='rgba(78,222,163,0.12)'}}>
                        UNDO
                      </button>
                    </div>
                  )}
                  {pending.length === 0 && doneTasks.length === 0 && (
                    <p style={{padding:'10px 14px',fontSize:11,color:'#2a4898',fontStyle:'italic'}}>No tasks yet — add one above.</p>
                  )}

                  {pending.map((t, idx) => (
                    <div key={t.id}
                      draggable={true}
                      onDragStart={e => {
                        const el = e.currentTarget
                        const rect = el.getBoundingClientRect()
                        setWDragItemH(rect.height)
                        setWDragIdx(idx)
                        wDragFromRef.current = idx
                        wDragToRef.current   = idx
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
                        const from = wDragFromRef.current
                        const to   = wDragToRef.current
                        wDragFromRef.current = null
                        wDragToRef.current   = null
                        setWDragIdx(null)
                        setWDragOver(null)
                        if (from !== null && to !== null && from !== to) reorderWidgetTasks(from, to)
                      }}
                      onClick={() => { if (wDragIdx === null) openEdit(t) }}
                      onDragOver={e => { e.preventDefault(); setWDragOver(idx); wDragToRef.current = idx }}
                      onDrop={e => { e.preventDefault() }}
                      style={{
                        display:'flex', alignItems:'center', gap:6, padding:'7px 10px',
                        borderTop: wDragOver === idx && wDragIdx !== null && wDragIdx !== idx ? '1.5px solid rgba(96,165,250,0.55)' : '1.5px solid transparent',
                        background: wDragIdx === idx ? 'transparent' : 'transparent',
                        cursor: wDragIdx === idx ? 'grabbing' : 'grab',
                        opacity: wDragIdx === idx ? 0 : 1,
                        transform: `translateY(${getWidgetItemTransform(idx)}px)`,
                        transition: wDragIdx !== null ? 'transform 0.15s ease' : 'background 0.1s',
                      }}
                      onMouseEnter={e => { if (wDragIdx === null) e.currentTarget.style.background='rgba(96,165,250,0.05)' }}
                      onMouseLeave={e => { if (wDragIdx === null) e.currentTarget.style.background='transparent' }}>

                      <GripVertical size={11} style={{ color:'rgba(96,165,250,0.22)', flexShrink:0, pointerEvents:'none' }}/>

                      <button onClick={e => { e.stopPropagation(); toggleTask(t.id) }}
                        style={{background:'none',border:'none',padding:'10px',margin:'-10px 0',cursor:'pointer',flexShrink:0,color:'rgba(96,165,250,0.55)',display:'flex',transition:'color 0.15s',zIndex:1,position:'relative'}}
                        onMouseEnter={e => e.currentTarget.style.color='#4edea3'}
                        onMouseLeave={e => e.currentTarget.style.color='rgba(96,165,250,0.55)'}>
                        <Circle size={15}/>
                      </button>

                      <span
                        title={t.title}
                        style={{flex:1,fontSize:12,fontWeight:500,color:'#c8dcff',lineHeight:1.35,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',userSelect:'none'}}>
                        {t.title}
                      </span>

                      <button onClick={e => { e.stopPropagation(); removeTask(t.id) }}
                        style={{background:'none',border:'none',padding:0,cursor:'pointer',flexShrink:0,color:'#1e3870',display:'flex',transition:'color 0.15s'}}
                        onMouseEnter={e => e.currentTarget.style.color='#ff6b6b'}
                        onMouseLeave={e => e.currentTarget.style.color='#1e3870'}>
                        <X size={10}/>
                      </button>
                    </div>
                  ))}

                </div>
              </div>
            </div>
          )}

          {/* ══ ACTIVITY PANEL ══ */}
          {tab === 'activity' && (
            <div style={{padding:'18px 20px'}}>
              <p style={{fontSize:10,fontWeight:800,color:'#60a5fa',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:16}}>
                Today's Activity
              </p>
              {log.length === 0 && status === null ? (
                <p style={{fontSize:12,color:'#2a4898',lineHeight:1.6}}>Pick a status in Engage to start tracking.</p>
              ) : (
                <>
                  <div style={{marginBottom:18}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                      <span style={{fontSize:11,fontWeight:600,color:'#5090c8'}}>Total time</span>
                      <span style={{fontFamily:NUM,fontSize:12,fontWeight:700,color:'#60a5fa'}}>{fmt(shiftSecs)}</span>
                    </div>
                    <div style={{height:4,background:'rgba(40,80,200,0.12)'}}>
                      <div style={{height:'100%',background:'linear-gradient(90deg,#4edea3,#60a5fa)',width:'100%',opacity:0.6}}/>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {allStatuses.map(s => {
                      const secs = T[s.key]||0
                      if (secs===0 && s.key!==status) return null
                      const pct = shiftSecs>0 ? Math.min(100,(secs/shiftSecs)*100) : 0
                      return (
                        <div key={s.key}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <div style={{width:7,height:7,borderRadius:'50%',background:s.color,boxShadow:`0 0 6px ${s.color}80`}}/>
                              <span style={{fontSize:12,fontWeight:600,color:'#b0ccf0'}}>{s.label}</span>
                              {s.key===status && <div style={{width:5,height:5,borderRadius:'50%',background:s.color,boxShadow:`0 0 8px ${s.color}`,animation:'status-pulse 1.5s ease-in-out infinite'}}/>}
                            </div>
                            <span style={{fontFamily:NUM,fontSize:11,fontWeight:700,color:s.color+'bb'}}>{fmt(secs)}</span>
                          </div>
                          <div style={{height:4,background:'rgba(40,80,200,0.1)'}}>
                            <div style={{height:'100%',background:s.color,width:`${pct}%`,opacity:0.75,transition:'width 1s linear',boxShadow:`0 0 8px ${s.color}60`}}/>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes status-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.65; }
        }
      `}</style>

      {/* ── Task modal (add / edit) ── */}
      <TaskModal
        open={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleTaskSave}
      />

      {/* ── Set Shift full-screen modal ── */}
      <SetShiftModal
        open={showSetShift}
        onClose={() => setShowSetShift(false)}
        current={shiftGoal}
        onSave={goal => setShiftGoal(goal)}
      />
    </div>
  )
}
