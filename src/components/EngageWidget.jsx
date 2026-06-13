import { useState, useEffect, useRef } from 'react'
import { Power, Play, Plus, X, Check, Circle, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import SetShiftModal from './SetShiftModal'

const NUM  = 'Geist Mono, monospace'
const BODY = 'Geist, Inter, -apple-system, sans-serif'

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

const KEY       = 'trackr_engage_v2'
const TASKS_KEY = 'trackr_tasks'
const load      = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } }
const save      = v  => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }
const loadTasks = () => { try { return JSON.parse(localStorage.getItem(TASKS_KEY)) || [] } catch { return [] } }
const saveTasks = v  => { try { localStorage.setItem(TASKS_KEY, JSON.stringify(v)) } catch {} }

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
  const [showTaskAdd, setShowTaskAdd] = useState(false)
  const [newTask, setNewTask]         = useState('')
  const taskInputRef = useRef(null)

  const [editingTask, setEditingTask] = useState(null)
  const [editForm, setEditForm]       = useState({ title:'', date:'', desc:'', importance:3 })

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
  const timer     = useRef(null)
  const widgetRef = useRef(null)

  useEffect(() => {
    const h = (e) => { if (widgetRef.current && !widgetRef.current.contains(e.target)) setTab(null) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const s = load()
    if (!s) return
    // If shiftStart is from a previous calendar day and session is not active → stale data, ignore it
    if (s.shiftStart && !s.status) {
      const shiftDay = new Date(s.shiftStart).toDateString()
      if (shiftDay !== today) {
        setCustom(s.custom || [])  // keep custom statuses
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
    if (!shiftGoal || !shiftStart || status === null) return
    const goalEnd = getGoalEnd(shiftGoal, shiftStart)
    if (!goalEnd) return
    const ms = goalEnd - Date.now()
    if (ms <= 0) return
    shiftGoalRef.current = setTimeout(() => {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Trackr — Shift complete!', { body: 'Your shift goal is up. Time to clock out!', tag: 'trackr-goal' })
      }
    }, ms)
    return () => clearTimeout(shiftGoalRef.current)
  }, [shiftGoal, shiftStart, status]) // eslint-disable-line

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

  useEffect(() => { if (showTaskAdd) taskInputRef.current?.focus() }, [showTaskAdd])

  const allStatuses = [...STATUSES, ...custom.map((l,i) => ({ key:'c'+i, label:l, color:'#60a5fa' }))]
  const cur = allStatuses.find(s => s.key === status)

  const totals = () => {
    const now = Date.now(), t = {}
    for (const e of log) { const s = Math.floor(((e.end||now)-e.start)/1000); t[e.status]=(t[e.status]||0)+s }
    return t
  }
  const T         = totals()
  const curSecs   = log.length && !log[log.length-1]?.end ? Math.floor((Date.now()-log[log.length-1].start)/1000) : 0
  const shiftSecs = shiftStart
    ? Math.floor((Date.now()-shiftStart)/1000)
    : log.reduce((acc,e) => acc + (e.end && e.start ? Math.floor((e.end-e.start)/1000) : 0), 0)

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
    setCheckInState({ deadline, cutoffTime })
    clearTimeout(checkInRef.current)
    checkInRef.current = setTimeout(() => {
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
    setCheckInState(null)
    setLastCheckIn(Date.now())
  }


  function addCustom() {
    const lbl = newLabel.trim(); if (!lbl) return
    setCustom(c=>[...c,lbl]); setNewLabel(''); setShowAdd(false)
  }

  function removeCustom(idx) {
    setCustom(c => c.filter((_,i) => i !== idx))
    // If currently on this custom status, reset to null
    if (status === 'c'+idx) setStatus(null)
  }

  function addTask() {
    const title = newTask.trim(); if (!title) return
    setTasks(prev => [...prev, { id: Date.now(), title, done: false, due: todayStr }])
    setNewTask(''); setShowTaskAdd(false)
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

  const IMP_COLORS = { 1:'#4edea3', 2:'#a3c9ff', 3:'#fbbf24', 4:'#ffb689', 5:'#ffb4ab' }
  const priorityToImp = p => p === 'low' ? 1 : p === 'high' ? 5 : 3
  const impToPriority = n => n <= 2 ? 'low' : n === 3 ? 'medium' : 'high'

  function openEdit(t) {
    setEditForm({ title: t.title, date: t.due, desc: t.note || '', importance: priorityToImp(t.priority) })
    setEditingTask(t)
  }

  function saveEdit() {
    if (!editForm.title.trim()) return
    setTasks(prev => prev.map(t => t.id === editingTask.id ? {
      ...t,
      title: editForm.title,
      due: editForm.date,
      note: editForm.desc,
      priority: impToPriority(editForm.importance),
    } : t))
    setEditingTask(null)
  }

  const openTab = t => setTab(p => p === t ? null : t)

  const BG      = '#07090f'
  const BORDER  = 'rgba(60,100,200,0.18)'
  const DIVIDER = 'rgba(40,80,180,0.12)'

  const goalEnd       = getGoalEnd(shiftGoal, shiftStart)
  const goalRemaining = goalEnd ? Math.max(0, goalEnd - Date.now()) : null
  const goalOver      = goalEnd !== null && goalRemaining === 0

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
          flex:1, padding:'12px 0', border:'none',
          background: tab==='engage' ? `${cur?.color || '#4edea3'}10` : 'transparent',
          borderBottom: tab==='engage' ? `2px solid ${cur?.color || '#4edea3'}` : '2px solid transparent',
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

                {/* 2h check-in banner */}
                {checkInState && (
                  <div style={{padding:'10px 14px',background:'rgba(255,107,107,0.08)',borderBottom:`1px solid rgba(255,107,107,0.2)`}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                      <span style={{fontFamily:NUM,fontSize:9,color:'#ff6b6b',letterSpacing:'0.08em',fontWeight:800}}>STILL WORKING?</span>
                      <span style={{fontFamily:NUM,fontSize:12,color:'#ff6b6b',fontWeight:700}}>{fmtCountdown(checkInState.deadline - Date.now())}</span>
                    </div>
                    <p style={{fontSize:10,color:'rgba(255,150,150,0.6)',fontFamily:BODY,margin:'0 0 8px',lineHeight:1.4}}>
                      No response → auto clock-out, last 30m removed
                    </p>
                    <button onClick={confirmStillHere}
                      style={{width:'100%',padding:'7px',background:'rgba(78,222,163,0.12)',border:'1px solid rgba(78,222,163,0.3)',color:'#4edea3',fontSize:10,fontFamily:BODY,fontWeight:700,cursor:'pointer',letterSpacing:'0.04em',transition:'background 0.15s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(78,222,163,0.2)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(78,222,163,0.12)'}>
                      ✓ &nbsp;I'm still here
                    </button>
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
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
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
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 14px',borderTop:`1px solid ${DIVIDER}`}}>
                    <button onClick={()=>setShowSetShift(true)}
                      style={{display:'flex',alignItems:'center',gap:4,padding:'4px 9px',background:shiftGoal?'rgba(96,165,250,0.08)':'transparent',border:`1px solid ${shiftGoal?'rgba(96,165,250,0.3)':'rgba(60,100,200,0.2)'}`,color:shiftGoal?'#60a5fa':'#3a6090',fontSize:9,fontFamily:BODY,fontWeight:600,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s',whiteSpace:'nowrap'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(96,165,250,0.5)';e.currentTarget.style.color='#60a5fa'}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=shiftGoal?'rgba(96,165,250,0.3)':'rgba(60,100,200,0.2)';e.currentTarget.style.color=shiftGoal?'#60a5fa':'#3a6090'}}>
                      ⏱ {shiftGoalLabel || 'Set shift'}
                    </button>
                    <button onClick={()=>setShowAdd(true)}
                      style={{display:'flex',alignItems:'center',gap:4,padding:'4px 9px',background:'transparent',border:'1px solid rgba(60,100,200,0.2)',color:'#3a6090',fontSize:9,fontFamily:BODY,fontWeight:600,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(96,165,250,0.5)';e.currentTarget.style.color='#60a5fa'}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(60,100,200,0.2)';e.currentTarget.style.color='#3a6090'}}>
                      <Plus size={9}/> Add status
                    </button>
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
                  <div style={{display:'flex',alignItems:'center',gap:7}}>
                    <button onClick={() => navigate('/calendar')}
                      style={{fontFamily:NUM,fontSize:9,fontWeight:800,color:'#5090d8',letterSpacing:'0.12em',textTransform:'uppercase',background:'none',border:'none',cursor:'pointer',padding:0,textDecoration:'none',transition:'color 0.15s'}}
                      onMouseEnter={e=>{ e.currentTarget.style.color='#60a5fa' }}
                      onMouseLeave={e=>{ e.currentTarget.style.color='#5090d8' }}>
                      Tasks
                    </button>
                    {pending.length > 0 && (
                      <span style={{fontFamily:NUM,fontSize:8,fontWeight:900,color:'#60a5fa',background:'rgba(96,165,250,0.15)',border:'1px solid rgba(96,165,250,0.3)',padding:'1px 6px',boxShadow:'0 0 6px rgba(96,165,250,0.2)'}}>
                        {pending.length}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowTaskAdd(v => !v)}
                    style={{
                      display:'flex',alignItems:'center',gap:4,padding:'4px 9px',
                      background: showTaskAdd ? 'rgba(96,165,250,0.12)' : 'transparent',
                      border:`1px solid ${showTaskAdd ? 'rgba(96,165,250,0.4)' : 'rgba(60,100,200,0.2)'}`,
                      color: showTaskAdd ? '#60a5fa' : '#3a6090',
                      fontSize:9,fontFamily:BODY,fontWeight:700,cursor:'pointer',transition:'all 0.15s',letterSpacing:'0.04em',
                    }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(96,165,250,0.45)'; e.currentTarget.style.color='#60a5fa' }}
                    onMouseLeave={e=>{ if(!showTaskAdd){ e.currentTarget.style.borderColor='rgba(60,100,200,0.2)'; e.currentTarget.style.color='#3a6090' }}}>
                    <Plus size={9}/> Add
                  </button>
                </div>

                {/* Quick-add */}
                {showTaskAdd && (
                  <div style={{display:'flex',alignItems:'center',gap:5,padding:'7px 10px',borderBottom:`1px solid ${DIVIDER}`,flexShrink:0}}>
                    <input
                      ref={taskInputRef}
                      value={newTask}
                      onChange={e => setNewTask(e.target.value)}
                      onKeyDown={e => { if(e.key==='Enter') addTask(); if(e.key==='Escape'){ setShowTaskAdd(false); setNewTask('') } }}
                      placeholder="Task for today…"
                      style={{flex:1,padding:'6px 9px',background:'rgba(40,80,200,0.08)',border:`1px solid rgba(96,165,250,0.2)`,color:'#d0e4ff',fontSize:12,fontFamily:BODY,outline:'none',caretColor:'#60a5fa'}}
                    />
                    <button onClick={addTask}
                      style={{padding:'6px 9px',background:'#60a5fa',border:'none',color:'#07090f',cursor:'pointer',display:'flex',alignItems:'center',flexShrink:0,fontWeight:800}}>
                      <Check size={11}/>
                    </button>
                  </div>
                )}

                {/* Task list */}
                <div style={{ flex:1, overflowY:'auto', paddingBottom:8 }}>
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

                  {pending.map(t => (
                    <div key={t.id}
                      style={{display:'flex',alignItems:'center',gap:8,padding:'7px 12px',transition:'background 0.12s'}}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(96,165,250,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <button onClick={() => toggleTask(t.id)}
                        style={{background:'none',border:'none',padding:0,cursor:'pointer',flexShrink:0,color:'#2a4898',display:'flex',transition:'color 0.15s'}}
                        onMouseEnter={e => e.currentTarget.style.color='#4edea3'}
                        onMouseLeave={e => e.currentTarget.style.color='#2a4898'}>
                        <Circle size={13}/>
                      </button>
                      <span onClick={() => openEdit(t)}
                        style={{flex:1,fontSize:12,fontWeight:500,color:'#c8dcff',lineHeight:1.35,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',cursor:'pointer',transition:'color 0.15s'}}
                        onMouseEnter={e => e.currentTarget.style.color='#a3c9ff'}
                        onMouseLeave={e => e.currentTarget.style.color='#c8dcff'}>
                        {t.title}
                      </span>
                      <button onClick={() => removeTask(t.id)}
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

      {/* ── Task edit modal ── */}
      {editingTask && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:99999, padding:20 }}
          onClick={() => setEditingTask(null)}>
          <div style={{ width:'100%', maxWidth:380, background:'#0a0e1c', border:'0.5px solid rgba(163,201,255,0.15)', padding:'36px 32px', display:'flex', flexDirection:'column', gap:16, animation:'slideUp 0.18s cubic-bezier(0.22,1,0.36,1)' }}
            onClick={e => e.stopPropagation()}>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <h2 style={{ fontFamily:NUM, fontSize:13, fontWeight:800, color:'#e2e2e8', letterSpacing:'-0.01em', margin:0 }}>Edit Task</h2>
              <button onClick={() => setEditingTask(null)} style={{ background:'none', border:'none', color:'rgba(163,201,255,0.35)', cursor:'pointer', fontSize:18, lineHeight:1, padding:4, transition:'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color='rgba(163,201,255,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(163,201,255,0.35)'}>×</button>
            </div>

            <input value={editForm.title} onChange={e => setEditForm(f=>({...f,title:e.target.value}))}
              onKeyDown={e => e.key==='Enter' && saveEdit()}
              placeholder="Task title…"
              style={{ padding:'10px 14px', background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(163,201,255,0.14)', color:'#e2e2e8', fontSize:14, fontFamily:BODY, outline:'none', width:'100%', boxSizing:'border-box' }}/>

            <input type="date" value={editForm.date} onChange={e => setEditForm(f=>({...f,date:e.target.value}))}
              style={{ padding:'10px 14px', background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(163,201,255,0.14)', color:'#8a919f', fontSize:13, fontFamily:NUM, outline:'none', colorScheme:'dark', width:'100%', boxSizing:'border-box' }}/>

            <textarea value={editForm.desc} onChange={e => setEditForm(f=>({...f,desc:e.target.value}))}
              placeholder="Description (optional)…" rows={3}
              style={{ padding:'10px 14px', background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(163,201,255,0.14)', color:'#c0c7d5', fontSize:13, fontFamily:BODY, outline:'none', resize:'none', width:'100%', boxSizing:'border-box' }}/>

            <div>
              <p style={{ fontFamily:NUM, fontSize:9, color:'rgba(163,201,255,0.3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Importance</p>
              <div style={{ display:'flex', gap:6 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setEditForm(f=>({...f,importance:n}))}
                    style={{
                      flex:1, padding:'9px 0',
                      border:`0.5px solid ${editForm.importance===n ? IMP_COLORS[n]+'80' : 'rgba(163,201,255,0.1)'}`,
                      background: editForm.importance===n ? `${IMP_COLORS[n]}18` : 'rgba(255,255,255,0.02)',
                      color: editForm.importance===n ? IMP_COLORS[n] : 'rgba(163,201,255,0.3)',
                      fontFamily:NUM, fontSize:13, fontWeight:700, cursor:'pointer', transition:'all .12s',
                    }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={saveEdit}
              style={{ padding:'12px 0', background:'linear-gradient(135deg,rgba(96,165,250,0.18),rgba(163,201,255,0.1))', border:'0.5px solid rgba(96,165,250,0.35)', color:'#60a5fa', fontFamily:NUM, fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(96,165,250,0.22)'; e.currentTarget.style.borderColor='rgba(96,165,250,0.55)' }}
              onMouseLeave={e => { e.currentTarget.style.background='linear-gradient(135deg,rgba(96,165,250,0.18),rgba(163,201,255,0.1))'; e.currentTarget.style.borderColor='rgba(96,165,250,0.35)' }}>
              Save Changes
            </button>
          </div>
        </div>
      )}

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
