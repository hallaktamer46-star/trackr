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
  if (!secs || secs <= 0) return '0s'
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

  const [phase, setPhase]             = useState('idle')
  const [activeTab, setActiveTab]     = useState(null)
  const [expanded, setExpanded]       = useState(false)
  const [currentStatus, setCurrentStatus] = useState('working')
  const [statusLog, setStatusLog]     = useState([])
  const [shift, setShift]             = useState({ startTime: '', endTime: '', breakMins: 90, shiftStartTs: null })
  const [custom, setCustom]           = useState([])
  const [showAdd, setShowAdd]         = useState(false)
  const [newLabel, setNewLabel]       = useState('')
  const [tick, setTick]               = useState(0)
  const [form, setForm]               = useState({ startTime: '', endTime: '', breakMins: 90 })
  const timerRef = useRef(null)

  // hydrate
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

  // persist
  useEffect(() => {
    save({ phase, currentStatus, statusLog, shift, custom, date: today })
  }, [phase, currentStatus, statusLog, shift, custom])

  // ticker
  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => setTick(t => t + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [phase])

  // derived
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

  const statusTotals = totals()
  const currentSecs  = statusLog.length && !statusLog[statusLog.length - 1]?.end
    ? Math.floor((Date.now() - statusLog[statusLog.length - 1].start) / 1000)
    : 0
  const shiftElapsed = shift.shiftStartTs ? Math.floor((Date.now() - shift.shiftStartTs) / 1000) : 0
  const shiftTotal   = (() => {
    if (!shift.startTime || !shift.endTime) return 0
    const [sh, sm] = shift.startTime.split(':').map(Number)
    const [eh, em] = shift.endTime.split(':').map(Number)
    return ((eh * 60 + em) - (sh * 60 + sm)) * 60
  })()
  const breakSecs  = statusTotals['break'] || 0
  const breakLimit = (shift.breakMins || 90) * 60
  const breakOver  = phase === 'active' && breakSecs > breakLimit

  // actions
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
    setShift({ ...form, shiftStartTs: now, date: today })
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

  const panelOpen = activeTab !== null

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', bottom: 0, right: 0,
      width: 400,
      zIndex: 9999,
      fontFamily: SANS,
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── PANEL (slides up above tab bar) ─────────────────── */}
      {panelOpen && (
        <div style={{
          background: 'rgba(10,14,20,0.98)',
          borderTop: '0.5px solid rgba(48,54,61,0.9)',
          borderLeft: '0.5px solid rgba(48,54,61,0.9)',
          backdropFilter: 'blur(24px)',
          boxShadow: '-8px -8px 48px rgba(0,0,0,0.5)',
          animation: 'engageSlideUp 0.2s ease',
        }}>

          {/* ── ENGAGE PANEL ── */}
          {activeTab === 'engage' && (
            <>
              {/* IDLE */}
              {(phase === 'idle' || phase === 'ended') && (
                <div style={{ padding: 28 }}>
                  {phase === 'ended' ? (
                    <>
                      <p style={{ fontFamily: MONO, fontSize: 10, color: '#4edea3', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Shift Complete</p>
                      <p style={{ fontSize: 14, color: '#8a919f', marginBottom: 22, lineHeight: 1.6 }}>Great work today. Your activity breakdown is in the Activity tab.</p>
                      <button onClick={() => { setPhase('idle'); setStatusLog([]); setShift({ startTime: '', endTime: '', breakMins: 90, shiftStartTs: null }); setCustom([]) }}
                        style={{ width: '100%', padding: '14px 0', background: 'rgba(78,222,163,0.08)', border: '0.5px solid rgba(78,222,163,0.3)', color: '#4edea3', fontSize: 13, fontFamily: MONO, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em' }}>
                        RESET FOR TOMORROW
                      </button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontFamily: MONO, fontSize: 10, color: '#8a919f', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Ready to start?</p>
                      <p style={{ fontSize: 14, color: '#4a5568', marginBottom: 22, lineHeight: 1.5 }}>Set up your shift to start tracking your time and activity.</p>
                      <button onClick={() => setPhase('setup')}
                        style={{ width: '100%', padding: '16px 0', background: '#4edea3', border: 'none', color: '#0d1117', fontSize: 14, fontFamily: MONO, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em' }}>
                        ▶  SET UP SHIFT
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* SETUP */}
              {phase === 'setup' && (
                <div style={{ padding: 28 }}>
                  <p style={{ fontFamily: MONO, fontSize: 10, color: '#a3c9ff', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>Shift Setup</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontFamily: MONO, fontSize: 9, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Start Time</label>
                      <input type="time" value={form.startTime} onChange={e => handleFormTime('startTime', e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', color: '#e2e2e8', fontSize: 14, fontFamily: MONO, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontFamily: MONO, fontSize: 9, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>End Time</label>
                      <input type="time" value={form.endTime} onChange={e => handleFormTime('endTime', e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', color: '#e2e2e8', fontSize: 14, fontFamily: MONO, outline: 'none' }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 22 }}>
                    <label style={{ fontFamily: MONO, fontSize: 9, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      Break Allowance (minutes)
                      {form.startTime && form.endTime && <span style={{ color: '#4edea3' }}>· auto-suggested</span>}
                    </label>
                    <input type="number" value={form.breakMins} min={0} max={480}
                      onChange={e => setForm(f => ({ ...f, breakMins: parseInt(e.target.value) || 0 }))}
                      style={{ width: '100%', padding: '10px 12px', background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', color: '#e2e2e8', fontSize: 14, fontFamily: MONO, outline: 'none' }} />
                  </div>
                  <button onClick={startShift} disabled={!form.startTime || !form.endTime}
                    style={{
                      width: '100%', padding: '16px 0', border: 'none', cursor: form.startTime && form.endTime ? 'pointer' : 'default',
                      background: form.startTime && form.endTime ? '#4edea3' : '#161b22',
                      color: form.startTime && form.endTime ? '#0d1117' : '#4a5568',
                      fontSize: 14, fontFamily: MONO, fontWeight: 700, letterSpacing: '0.08em', transition: 'all 0.15s',
                    }}>
                    START SHIFT ▶
                  </button>
                  <button onClick={() => setPhase('idle')}
                    style={{ width: '100%', padding: '10px 0', marginTop: 8, background: 'transparent', border: 'none', color: '#4a5568', fontSize: 12, fontFamily: MONO, cursor: 'pointer' }}>
                    ← back
                  </button>
                </div>
              )}

              {/* ACTIVE */}
              {phase === 'active' && (
                <>
                  {/* Current status row — always visible */}
                  <div onClick={() => setExpanded(e => !e)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '18px 24px',
                      background: `${currentObj.color}08`,
                      borderBottom: expanded ? '0.5px solid rgba(48,54,61,0.7)' : 'none',
                      cursor: 'pointer',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 12, height: 12, borderRadius: '50%',
                        background: currentObj.color,
                        boxShadow: `0 0 10px ${currentObj.color}`,
                        flexShrink: 0,
                      }} />
                      <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: currentObj.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {currentObj.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontFamily: MONO, fontSize: 16, color: '#c0c7d5', fontWeight: 600 }}>{fmt(currentSecs)}</span>
                      {expanded
                        ? <ChevronUp  size={16} style={{ color: '#4a5568' }} />
                        : <ChevronDown size={16} style={{ color: '#4a5568' }} />
                      }
                    </div>
                  </div>

                  {/* Expanded list */}
                  {expanded && (
                    <div>
                      {allStatuses.filter(s => s.key !== currentStatus).map((s, i, arr) => (
                        <div key={s.key} onClick={() => switchStatus(s.key)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '15px 24px',
                            borderBottom: i < arr.length - 1 ? '0.5px solid rgba(48,54,61,0.4)' : 'none',
                            cursor: 'pointer', transition: 'background 0.12s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = `${s.color}0e`}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 9, height: 9, borderRadius: '50%', background: s.color, opacity: 0.85 }} />
                            <span style={{ fontFamily: MONO, fontSize: 13, color: '#c0c7d5', letterSpacing: '0.04em' }}>{s.label}</span>
                          </div>
                          <span style={{ fontFamily: MONO, fontSize: 11, color: '#3a4354' }}>{fmt(statusTotals[s.key] || 0)}</span>
                        </div>
                      ))}

                      {/* Add custom */}
                      {showAdd ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderTop: '0.5px solid rgba(48,54,61,0.5)' }}>
                          <input autoFocus value={newLabel}
                            onChange={e => setNewLabel(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') addCustom(); if (e.key === 'Escape') { setShowAdd(false); setNewLabel('') } }}
                            placeholder="Status name…"
                            style={{ flex: 1, padding: '8px 12px', background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', color: '#e2e2e8', fontSize: 13, fontFamily: MONO, outline: 'none' }}
                          />
                          <button onClick={addCustom}
                            style={{ padding: '8px 12px', background: '#4edea3', border: 'none', color: '#0d1117', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Check size={14} />
                          </button>
                          <button onClick={() => { setShowAdd(false); setNewLabel('') }}
                            style={{ padding: '8px 12px', background: '#161b22', border: '0.5px solid rgba(48,54,61,0.9)', color: '#8a919f', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 24px', borderTop: '0.5px solid rgba(48,54,61,0.4)' }}>
                          <button onClick={() => setShowAdd(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'transparent', border: '0.5px solid rgba(48,54,61,0.7)', color: '#4a5568', fontSize: 11, fontFamily: MONO, cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(163,201,255,0.4)'; e.currentTarget.style.color = '#a3c9ff' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(48,54,61,0.7)'; e.currentTarget.style.color = '#4a5568' }}
                          >
                            <Plus size={11} /> ADD STATUS
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Break warning */}
                  {breakOver && !expanded && (
                    <div style={{ padding: '10px 24px', background: 'rgba(255,180,171,0.07)', borderTop: '0.5px solid rgba(255,180,171,0.2)' }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: '#ffb4ab', letterSpacing: '0.06em' }}>
                        ⚠  BREAK LIMIT EXCEEDED — {fmt(breakSecs - breakLimit)} over
                      </span>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── ACTIVITY PANEL ── */}
          {activeTab === 'activity' && (
            <div style={{ padding: 28 }}>
              <p style={{ fontFamily: MONO, fontSize: 10, color: '#4a5568', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
                Today's Activity
              </p>

              {phase === 'idle' ? (
                <p style={{ fontSize: 13, color: '#4a5568', fontFamily: MONO }}>Start your shift to begin tracking.</p>
              ) : (
                <>
                  {/* Shift bar */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: '#8a919f', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Shift Progress</span>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: '#8a919f' }}>
                        {fmt(shiftElapsed)} / {shiftTotal > 0 ? fmt(shiftTotal) : '—'}
                      </span>
                    </div>
                    <div style={{ height: 6, background: '#161b22' }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #4edea3, #a3c9ff)',
                        width: shiftTotal > 0 ? `${Math.min(100, (shiftElapsed / shiftTotal) * 100)}%` : '0%',
                        transition: 'width 1s linear',
                      }} />
                    </div>
                  </div>

                  {/* Break bar */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: breakOver ? '#ffb4ab' : '#8a919f' }}>
                        Break {breakOver && '· ⚠ OVER LIMIT'}
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: breakOver ? '#ffb4ab' : '#8a919f' }}>
                        {fmt(breakSecs)} / {fmtMins(shift.breakMins)}
                      </span>
                    </div>
                    <div style={{ height: 6, background: '#161b22' }}>
                      <div style={{
                        height: '100%',
                        background: breakOver ? '#ffb4ab' : '#ffb689',
                        width: `${Math.min(100, (breakSecs / breakLimit) * 100)}%`,
                        transition: 'width 1s linear',
                      }} />
                    </div>
                  </div>

                  {/* Per-status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {allStatuses.map(s => {
                      const secs = statusTotals[s.key] || 0
                      if (secs === 0 && s.key !== currentStatus) return null
                      const pct = shiftElapsed > 0 ? Math.min(100, (secs / shiftElapsed) * 100) : 0
                      return (
                        <div key={s.key}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }} />
                              <span style={{ fontFamily: MONO, fontSize: 11, color: '#8a919f', letterSpacing: '0.04em' }}>{s.label}</span>
                              {s.key === currentStatus && phase === 'active' && (
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, opacity: 0.7 }} />
                              )}
                            </div>
                            <span style={{ fontFamily: MONO, fontSize: 11, color: '#4a5568' }}>{fmt(secs)}</span>
                          </div>
                          <div style={{ height: 4, background: '#0d1117' }}>
                            <div style={{ height: '100%', background: s.color, width: `${pct}%`, opacity: 0.7, transition: 'width 1s linear' }} />
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

      {/* ── TAB BAR ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        background: 'rgba(10,14,20,0.98)',
        borderTop: `1px solid ${panelOpen ? 'rgba(48,54,61,0.9)' : 'rgba(48,54,61,0.5)'}`,
        borderLeft: '0.5px solid rgba(48,54,61,0.9)',
        backdropFilter: 'blur(24px)',
      }}>

        {/* START (idle) */}
        {phase === 'idle' && (
          <button onClick={() => openTab('engage')}
            style={{
              flex: 1, padding: '14px 0', border: 'none', borderRight: '0.5px solid rgba(48,54,61,0.9)',
              background: activeTab === 'engage' ? 'rgba(78,222,163,0.1)' : 'transparent',
              color: '#4edea3', fontFamily: MONO, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', cursor: 'pointer', transition: 'background 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            <Play size={12} fill="#4edea3" /> START
          </button>
        )}

        {/* END SHIFT (active) */}
        {phase === 'active' && (
          <button onClick={endShift}
            style={{
              flex: 1, padding: '14px 0', border: 'none', borderRight: '0.5px solid rgba(48,54,61,0.9)',
              background: 'transparent',
              color: '#ffb4ab', fontFamily: MONO, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', cursor: 'pointer', transition: 'background 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,180,171,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Square size={12} fill="#ffb4ab" /> END SHIFT
          </button>
        )}

        {/* ENGAGE */}
        <button onClick={() => openTab('engage')}
          style={{
            flex: 2, padding: '14px 0', border: 'none', borderRight: '0.5px solid rgba(48,54,61,0.9)',
            background: activeTab === 'engage' ? `${currentObj.color}12` : 'transparent',
            color: activeTab === 'engage' ? currentObj.color : '#4a5568',
            fontFamily: MONO, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.15s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
          }}>
          <span>ENGAGE</span>
          {phase === 'active' && (
            <span style={{ fontSize: 9, color: currentObj.color, opacity: 0.7, letterSpacing: '0.06em' }}>
              {currentObj.label} · {fmt(currentSecs)}
            </span>
          )}
        </button>

        {/* ACTIVITY */}
        <button onClick={() => openTab('activity')}
          style={{
            flex: 2, padding: '14px 0', border: 'none',
            background: activeTab === 'activity' ? 'rgba(163,201,255,0.08)' : 'transparent',
            color: activeTab === 'activity' ? '#a3c9ff' : '#4a5568',
            fontFamily: MONO, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.15s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
          }}>
          <span>ACTIVITY</span>
          {phase === 'active' && shiftElapsed > 0 && (
            <span style={{ fontSize: 9, color: '#a3c9ff', opacity: 0.6, letterSpacing: '0.06em' }}>
              {fmt(shiftElapsed)} in
            </span>
          )}
        </button>
      </div>

      <style>{`
        @keyframes engageSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
