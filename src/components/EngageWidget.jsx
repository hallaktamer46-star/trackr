import { useState, useEffect, useRef } from 'react'
import { Play, Square, ChevronDown, ChevronUp, Plus, X, Check } from 'lucide-react'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

const BASE_STATUSES = [
  { key: 'working',  label: 'Working',  color: '#4edea3' },
  { key: 'break',    label: 'Break',    color: '#ffb689' },
  { key: 'meeting',  label: 'Meeting',  color: '#f472b6' },
  { key: 'research', label: 'Research', color: '#a3c9ff' },
  { key: 'clerical', label: 'Clerical', color: '#fbbf24' },
  { key: 'coaching', label: 'Coaching', color: '#a78bfa' },
]

function suggestBreak(hours) {
  if (hours < 6)  return 30
  if (hours < 7)  return 45
  if (hours < 8)  return 60
  if (hours < 9)  return 90
  if (hours < 10) return 105
  return 120
}

function fmt(secs) {
  if (secs <= 0) return '0s'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`
  return `${s}s`
}

function fmtMins(mins) {
  if (!mins) return '—'
  if (mins >= 60) return `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ''}`
  return `${mins}m`
}

const KEY = 'trackr_engage'
function load() { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } }
function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }

export default function EngageWidget() {
  const today = new Date().toDateString()

  const [phase, setPhase]               = useState('idle')   // idle | setup | active | ended
  const [activeTab, setActiveTab]       = useState(null)      // null | 'engage' | 'activity'
  const [expanded, setExpanded]         = useState(false)
  const [currentStatus, setCurrentStatus] = useState('working')
  const [statusLog, setStatusLog]       = useState([])
  const [shift, setShift]               = useState({ startTime: '', endTime: '', breakMins: 90, shiftStartTs: null })
  const [custom, setCustom]             = useState([])
  const [showAdd, setShowAdd]           = useState(false)
  const [newLabel, setNewLabel]         = useState('')
  const [tick, setTick]                 = useState(0)
  const [form, setForm]                 = useState({ startTime: '', endTime: '', breakMins: 90 })
  const timerRef = useRef(null)

  // ── hydrate from localStorage ──────────────────────────────────
  useEffect(() => {
    const s = load()
    if (s && s.date === today) {
      setPhase(s.phase || 'idle')
      setCurrentStatus(s.currentStatus || 'working')
      setStatusLog(s.statusLog || [])
      setShift(s.shift || { startTime: '', endTime: '', breakMins: 90, shiftStartTs: null })
      setCustom(s.custom || [])
    }
  }, [])

  // ── persist on change ──────────────────────────────────────────
  useEffect(() => {
    save({ phase, currentStatus, statusLog, shift, custom, date: today })
  }, [phase, currentStatus, statusLog, shift, custom])

  // ── 1-second ticker when active ───────────────────────────────
  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => setTick(t => t + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [phase])

  // ── derived data ───────────────────────────────────────────────
  const allStatuses = [
    ...BASE_STATUSES,
    ...custom.map((l, i) => ({ key: 'custom_' + i, label: l, color: '#8a919f' })),
  ]
  const currentObj = allStatuses.find(s => s.key === currentStatus) || allStatuses[0]

  function totals() {
    const now = Date.now()
    const t = {}
    for (const e of statusLog) {
      const secs = Math.floor(((e.end || now) - e.start) / 1000)
      t[e.status] = (t[e.status] || 0) + secs
    }
    return t
  }

  const statusTotals  = totals()
  const currentSecs   = statusLog.length ? Math.floor((Date.now() - (statusLog[statusLog.length - 1]?.start || Date.now())) / 1000) : 0
  const shiftElapsed  = shift.shiftStartTs ? Math.floor((Date.now() - shift.shiftStartTs) / 1000) : 0
  const shiftTotal    = (() => {
    if (!shift.startTime || !shift.endTime) return 0
    const [sh, sm] = shift.startTime.split(':').map(Number)
    const [eh, em] = shift.endTime.split(':').map(Number)
    return ((eh * 60 + em) - (sh * 60 + sm)) * 60
  })()
  const breakSecs  = statusTotals['break'] || 0
  const breakLimit = (shift.breakMins || 90) * 60
  const breakOver  = phase === 'active' && breakSecs > breakLimit

  // ── actions ────────────────────────────────────────────────────
  function handleFormTime(field, value) {
    const updated = { ...form, [field]: value }
    const s = updated.startTime, e = updated.endTime
    if (s && e) {
      const [sh, sm] = s.split(':').map(Number)
      const [eh, em] = e.split(':').map(Number)
      const hrs = ((eh * 60 + em) - (sh * 60 + sm)) / 60
      if (hrs > 0) updated.breakMins = suggestBreak(hrs)
    }
    setForm(updated)
  }

  function startShift() {
    const now = Date.now()
    const newShift = { ...form, shiftStartTs: now, date: today }
    setShift(newShift)
    setStatusLog([{ status: 'working', start: now }])
    setCurrentStatus('working')
    setPhase('active')
    setExpanded(false)
  }

  function switchStatus(key) {
    const now = Date.now()
    setStatusLog(log => {
      const copy = [...log]
      if (copy.length && !copy[copy.length - 1].end) copy[copy.length - 1] = { ...copy[copy.length - 1], end: now }
      return [...copy, { status: key, start: now }]
    })
    setCurrentStatus(key)
    setExpanded(false)
  }

  function endShift() {
    const now = Date.now()
    setStatusLog(log => {
      const copy = [...log]
      if (copy.length && !copy[copy.length - 1].end) copy[copy.length - 1] = { ...copy[copy.length - 1], end: now }
      return copy
    })
    setPhase('ended')
    setActiveTab('activity')
    setExpanded(false)
  }

  function addCustom() {
    const label = newLabel.trim()
    if (!label) return
    setCustom(c => [...c, label])
    setNewLabel('')
    setShowAdd(false)
  }

  function openTab(tab) {
    setActiveTab(t => t === tab ? null : tab)
    setExpanded(false)
  }

  // ── shared styles ──────────────────────────────────────────────
  const panel = {
    position: 'absolute', bottom: 42, right: 0, width: 250,
    background: 'rgba(10,14,20,0.97)',
    border: '0.5px solid rgba(48,54,61,0.9)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 -4px 32px rgba(0,0,0,0.6)',
  }

  const monoLabel = {
    fontFamily: MONO, fontSize: 8, fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a5568',
    display: 'block', marginBottom: 5,
  }

  const timeInput = {
    width: '100%', padding: '7px 10px',
    background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)',
    color: '#e2e2e8', fontSize: 12, fontFamily: MONO, outline: 'none',
  }

  // ── render ─────────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', bottom: 18, right: 20, zIndex: 9999, fontFamily: SANS, userSelect: 'none' }}>

      {/* ── ENGAGE PANEL ─────────────────────────────────────── */}
      {activeTab === 'engage' && (
        <div style={panel}>

          {/* IDLE — prompt to start */}
          {(phase === 'idle' || phase === 'ended') && (
            <div style={{ padding: 16 }}>
              {phase === 'ended' ? (
                <>
                  <p style={{ fontFamily: MONO, fontSize: 9, color: '#4edea3', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Shift Complete</p>
                  <p style={{ fontSize: 12, color: '#8a919f', marginBottom: 14, lineHeight: 1.5 }}>Great work. Check Activity for your breakdown.</p>
                  <button onClick={() => { setPhase('idle'); setStatusLog([]); setShift({ startTime: '', endTime: '', breakMins: 90, shiftStartTs: null }); setCustom([]) }}
                    style={{ width: '100%', padding: '8px 0', background: 'rgba(78,222,163,0.08)', border: '0.5px solid rgba(78,222,163,0.25)', color: '#4edea3', fontSize: 10, fontFamily: MONO, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em' }}>
                    RESET FOR TOMORROW
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontFamily: MONO, fontSize: 9, color: '#8a919f', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Ready to start?</p>
                  <button onClick={() => setPhase('setup')}
                    style={{ width: '100%', padding: '10px 0', background: '#4edea3', border: 'none', color: '#0d1117', fontSize: 11, fontFamily: MONO, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em' }}>
                    ▶ START SHIFT
                  </button>
                </>
              )}
            </div>
          )}

          {/* SETUP FORM */}
          {phase === 'setup' && (
            <div style={{ padding: 16 }}>
              <p style={{ fontFamily: MONO, fontSize: 9, color: '#a3c9ff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Shift Setup</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={monoLabel}>Start Time</label>
                  <input type="time" value={form.startTime} onChange={e => handleFormTime('startTime', e.target.value)} style={timeInput} />
                </div>
                <div>
                  <label style={monoLabel}>End Time</label>
                  <input type="time" value={form.endTime} onChange={e => handleFormTime('endTime', e.target.value)} style={timeInput} />
                </div>
                <div>
                  <label style={{ ...monoLabel, display: 'flex', alignItems: 'center', gap: 6 }}>
                    Break Allowance (mins)
                    {form.startTime && form.endTime && (
                      <span style={{ color: '#4edea3', fontSize: 8 }}>· auto-suggested</span>
                    )}
                  </label>
                  <input type="number" value={form.breakMins} min={0} max={480}
                    onChange={e => setForm(f => ({ ...f, breakMins: parseInt(e.target.value) || 0 }))}
                    style={timeInput} />
                </div>
              </div>
              <button onClick={startShift} disabled={!form.startTime || !form.endTime}
                style={{
                  width: '100%', padding: '10px 0', border: 'none', cursor: 'pointer',
                  background: form.startTime && form.endTime ? '#4edea3' : '#1a2230',
                  color: form.startTime && form.endTime ? '#0d1117' : '#4a5568',
                  fontSize: 11, fontFamily: MONO, fontWeight: 700, letterSpacing: '0.08em',
                  transition: 'all 0.15s',
                }}>
                START SHIFT ▶
              </button>
              <button onClick={() => setPhase('idle')}
                style={{ width: '100%', padding: '6px 0', marginTop: 6, background: 'transparent', border: 'none', color: '#4a5568', fontSize: 10, fontFamily: MONO, cursor: 'pointer' }}>
                ← back
              </button>
            </div>
          )}

          {/* ACTIVE */}
          {phase === 'active' && (
            <>
              {/* Current status row */}
              <div onClick={() => setExpanded(e => !e)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 14px',
                  background: expanded ? `${currentObj.color}0a` : `${currentObj.color}06`,
                  borderBottom: expanded ? '0.5px solid rgba(48,54,61,0.7)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: currentObj.color, boxShadow: `0 0 8px ${currentObj.color}80` }} />
                  <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: currentObj.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {currentObj.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: '#8a919f' }}>{fmt(currentSecs)}</span>
                  {expanded
                    ? <ChevronUp  size={11} style={{ color: '#4a5568' }} />
                    : <ChevronDown size={11} style={{ color: '#4a5568' }} />
                  }
                </div>
              </div>

              {/* Expanded status list */}
              {expanded && (
                <div>
                  {allStatuses.filter(s => s.key !== currentStatus).map((s, i, arr) => (
                    <div key={s.key} onClick={() => switchStatus(s.key)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderBottom: i < arr.length - 1 || showAdd ? '0.5px solid rgba(48,54,61,0.5)' : 'none',
                        cursor: 'pointer', transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = `${s.color}0e`}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, opacity: 0.8 }} />
                        <span style={{ fontFamily: MONO, fontSize: 10, color: '#c0c7d5', letterSpacing: '0.04em' }}>{s.label}</span>
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: '#3a4354' }}>{fmt(statusTotals[s.key] || 0)}</span>
                    </div>
                  ))}

                  {/* Add custom status */}
                  {showAdd ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}>
                      <input autoFocus value={newLabel}
                        onChange={e => setNewLabel(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addCustom(); if (e.key === 'Escape') { setShowAdd(false); setNewLabel('') } }}
                        placeholder="Status name…"
                        style={{ flex: 1, padding: '5px 8px', background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', color: '#e2e2e8', fontSize: 11, fontFamily: MONO, outline: 'none' }}
                      />
                      <button onClick={addCustom}
                        style={{ padding: '5px 8px', background: '#4edea3', border: 'none', color: '#0d1117', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Check size={11} />
                      </button>
                      <button onClick={() => { setShowAdd(false); setNewLabel('') }}
                        style={{ padding: '5px 8px', background: '#161b22', border: '0.5px solid rgba(48,54,61,0.9)', color: '#8a919f', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <X size={11} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 10px' }}>
                      <button onClick={() => setShowAdd(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'transparent', border: '0.5px solid rgba(48,54,61,0.6)', color: '#3a4354', fontSize: 9, fontFamily: MONO, cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(163,201,255,0.3)'; e.currentTarget.style.color = '#a3c9ff' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(48,54,61,0.6)'; e.currentTarget.style.color = '#3a4354' }}
                      >
                        <Plus size={9} /> ADD
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Break over-limit warning banner */}
              {breakOver && !expanded && (
                <div style={{ padding: '6px 14px', background: 'rgba(255,180,171,0.08)', borderTop: '0.5px solid rgba(255,180,171,0.2)' }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: '#ffb4ab', letterSpacing: '0.06em' }}>
                    ⚠ BREAK LIMIT EXCEEDED
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── ACTIVITY PANEL ───────────────────────────────────── */}
      {activeTab === 'activity' && (
        <div style={panel}>
          <div style={{ padding: '14px 16px' }}>
            <p style={{ fontFamily: MONO, fontSize: 8, color: '#4a5568', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
              Today's Activity
            </p>

            {phase === 'idle' ? (
              <p style={{ fontSize: 11, color: '#4a5568', fontFamily: MONO }}>No shift started yet.</p>
            ) : (
              <>
                {/* Shift bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: MONO, fontSize: 8, color: '#8a919f', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Shift</span>
                    <span style={{ fontFamily: MONO, fontSize: 8, color: '#8a919f' }}>
                      {fmt(shiftElapsed)} / {shiftTotal > 0 ? fmt(shiftTotal) : '—'}
                    </span>
                  </div>
                  <div style={{ height: 4, background: '#161b22' }}>
                    <div style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #4edea3, #a3c9ff)',
                      width: shiftTotal > 0 ? `${Math.min(100, (shiftElapsed / shiftTotal) * 100)}%` : '0%',
                      transition: 'width 1s linear',
                    }} />
                  </div>
                </div>

                {/* Break bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', color: breakOver ? '#ffb4ab' : '#8a919f' }}>
                      Break {breakOver && '· ⚠ OVER'}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 8, color: breakOver ? '#ffb4ab' : '#8a919f' }}>
                      {fmt(breakSecs)} / {fmtMins(shift.breakMins)}
                    </span>
                  </div>
                  <div style={{ height: 4, background: '#161b22' }}>
                    <div style={{
                      height: '100%',
                      background: breakOver ? '#ffb4ab' : '#ffb689',
                      width: `${Math.min(100, (breakSecs / breakLimit) * 100)}%`,
                      transition: 'width 1s linear',
                    }} />
                  </div>
                </div>

                {/* Per-status bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {allStatuses.map(s => {
                    const secs = statusTotals[s.key] || 0
                    if (secs === 0 && s.key !== currentStatus) return null
                    const pct = shiftElapsed > 0 ? Math.min(100, (secs / shiftElapsed) * 100) : 0
                    return (
                      <div key={s.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
                            <span style={{ fontFamily: MONO, fontSize: 8, color: '#8a919f', letterSpacing: '0.04em' }}>{s.label}</span>
                            {s.key === currentStatus && phase === 'active' && (
                              <div style={{ width: 4, height: 4, borderRadius: '50%', background: s.color, animation: 'pulse 1.5s ease-in-out infinite' }} />
                            )}
                          </div>
                          <span style={{ fontFamily: MONO, fontSize: 8, color: '#4a5568' }}>{fmt(secs)}</span>
                        </div>
                        <div style={{ height: 3, background: '#0d1117' }}>
                          <div style={{ height: '100%', background: s.color, width: `${pct}%`, opacity: 0.75, transition: 'width 1s linear' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── BOTTOM TAB BAR ───────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>

        {/* START button (idle only) */}
        {phase === 'idle' && (
          <button onClick={() => { setActiveTab('engage') }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 10px',
              background: 'rgba(78,222,163,0.1)',
              border: '0.5px solid rgba(78,222,163,0.35)',
              color: '#4edea3', fontFamily: MONO, fontSize: 9, fontWeight: 700,
              letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(78,222,163,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(78,222,163,0.1)'}
          >
            <Play size={9} fill="#4edea3" /> START
          </button>
        )}

        {/* END SHIFT button (active only) */}
        {phase === 'active' && (
          <button onClick={endShift}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 10px',
              background: 'rgba(255,180,171,0.06)',
              border: '0.5px solid rgba(255,180,171,0.25)',
              color: '#ffb4ab', fontFamily: MONO, fontSize: 9, fontWeight: 700,
              letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,180,171,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,180,171,0.06)'}
          >
            <Square size={9} fill="#ffb4ab" /> END
          </button>
        )}

        {/* ENGAGE tab */}
        <button onClick={() => openTab('engage')}
          style={{
            padding: '5px 12px',
            background: activeTab === 'engage' ? '#161b22' : 'rgba(13,17,23,0.85)',
            border: `0.5px solid ${activeTab === 'engage' ? (currentObj?.color || '#4edea3') : 'rgba(48,54,61,0.9)'}`,
            color: activeTab === 'engage' ? (currentObj?.color || '#4edea3') : '#3a4354',
            fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
            cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.15s',
          }}>
          ENGAGE
        </button>

        {/* ACTIVITY tab */}
        <button onClick={() => openTab('activity')}
          style={{
            padding: '5px 12px',
            background: activeTab === 'activity' ? '#161b22' : 'rgba(13,17,23,0.85)',
            border: `0.5px solid ${activeTab === 'activity' ? '#a3c9ff' : 'rgba(48,54,61,0.9)'}`,
            color: activeTab === 'activity' ? '#a3c9ff' : '#3a4354',
            fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
            cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.15s',
          }}>
          ACTIVITY
        </button>
      </div>
    </div>
  )
}
