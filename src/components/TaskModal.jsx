import { useState, useEffect, useRef } from 'react'

const DISPLAY = "'Nunito', 'Plus Jakarta Sans', system-ui, sans-serif"
const MONO    = "'Geist Mono', 'Consolas', monospace"

const IMP_COLORS = { 1: '#4edea3', 2: '#a3c9ff', 3: '#fbbf24', 4: '#ffb689', 5: '#ffb4ab' }
const IMP_LABELS = { 1: 'min', 2: 'low', 3: 'mid', 4: 'high', 5: 'max' }
const priorityToImp = p => p === 'low' ? 1 : p === 'high' ? 5 : 3
const impToPriority = n => n <= 2 ? 'low' : n === 3 ? 'medium' : 'high'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function ChevronDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}
function ChevronUp() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function FieldLabel({ children }) {
  return (
    <span style={{
      fontFamily:    MONO,
      fontSize:      9,
      fontWeight:    600,
      color:         'rgba(96,165,250,0.55)',
      letterSpacing: '0.13em',
      textTransform: 'uppercase',
      display:       'block',
      marginBottom:  7,
    }}>
      {children}
    </span>
  )
}

export default function TaskModal({ open, task, onClose, onSave }) {
  const isNew = !task?.id
  const [form, setForm]           = useState({ title: '', date: todayISO(), desc: '', importance: 3 })
  const [visible, setVisible]     = useState(false)
  const [expanded, setExpanded]   = useState(false)
  const [overflows, setOverflows] = useState(false)
  const [focused, setFocused]     = useState(null)
  const titleRef = useRef(null)

  useEffect(() => {
    if (open) {
      setForm({
        title:      task?.title    || '',
        date:       task?.due      || todayISO(),
        desc:       task?.note     || '',
        importance: priorityToImp(task?.priority || 'medium'),
      })
      setExpanded(false)
      setOverflows(false)
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [open, task])

  useEffect(() => {
    if (!open) return
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  useEffect(() => {
    if (expanded) return
    requestAnimationFrame(() => {
      if (titleRef.current) {
        setOverflows(titleRef.current.scrollWidth > titleRef.current.clientWidth)
      }
    })
  }, [form.title, expanded, visible])

  function save() {
    if (!form.title.trim()) return
    onSave({
      id:       task?.id || null,
      title:    form.title.trim(),
      due:      form.date,
      note:     form.desc,
      priority: impToPriority(form.importance),
    })
  }

  if (!open && !visible) return null

  function inputStyle(isFocused, extra = {}) {
    return {
      background:   isFocused ? 'rgba(0,212,255,0.03)' : 'rgba(255,255,255,0.04)',
      border:       `1px solid ${isFocused ? 'rgba(0,212,255,0.5)' : 'rgba(163,201,255,0.13)'}`,
      boxShadow:    isFocused ? '0 0 0 3px rgba(0,212,255,0.07)' : 'none',
      borderRadius: 8,
      color:        '#dce5f3',
      fontSize:     14,
      fontFamily:   DISPLAY,
      fontWeight:   500,
      outline:      'none',
      width:        '100%',
      boxSizing:    'border-box',
      padding:      '11px 36px 11px 14px',
      transition:   'border-color 0.15s, box-shadow 0.15s, background 0.15s',
      ...extra,
    }
  }

  return (
    <div
      style={{
        position:       'fixed', inset: 0,
        background:     visible ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
        display:        'flex', alignItems: 'center', justifyContent: 'center',
        zIndex:         99999, padding: 20,
        transition:     'background 0.22s, backdrop-filter 0.22s',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width:        '100%', maxWidth: 400,
          background:   '#0d1117',
          border:       '1px solid rgba(163,201,255,0.12)',
          borderRadius: 16,
          overflow:     'hidden',
          display:      'flex', flexDirection: 'column',
          transform:    visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
          opacity:      visible ? 1 : 0,
          transition:   'transform 0.28s cubic-bezier(0.22,1,0.36,1), opacity 0.22s',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent stripe */}
        <div style={{
          height:     2,
          background: 'linear-gradient(90deg, #00d4ff 0%, rgba(96,165,250,0.4) 55%, transparent 100%)',
          flexShrink: 0,
        }} />

        {/* Body */}
        <div style={{ padding: '22px 26px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <h2 style={{
              fontFamily:    DISPLAY,
              fontSize:      17,
              fontWeight:    800,
              color:         '#e8edf8',
              letterSpacing: '-0.02em',
              margin:        0,
            }}>
              {isNew ? 'New Task' : 'Edit Task'}
            </h2>
            <button
              onClick={onClose}
              style={{
                background:  'none',
                border:      'none',
                color:       'rgba(163,201,255,0.4)',
                cursor:      'pointer',
                width:       32, height: 32,
                display:     'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8,
                padding:     0,
                transition:  'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color       = '#e8edf8'
                e.currentTarget.style.background  = 'rgba(163,201,255,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color       = 'rgba(163,201,255,0.4)'
                e.currentTarget.style.background  = 'none'
              }}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Title */}
          <div>
            <FieldLabel>Title</FieldLabel>
            <div style={{ position: 'relative' }}>
              {expanded ? (
                <textarea
                  ref={titleRef}
                  autoFocus
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onFocus={() => setFocused('title')}
                  onBlur={() => setFocused(null)}
                  rows={3}
                  placeholder="What needs to be done?"
                  style={inputStyle(focused === 'title', { resize: 'none', lineHeight: 1.55 })}
                />
              ) : (
                <input
                  ref={titleRef}
                  autoFocus
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onFocus={() => setFocused('title')}
                  onBlur={() => setFocused(null)}
                  onKeyDown={e => e.key === 'Enter' && save()}
                  placeholder="What needs to be done?"
                  style={inputStyle(focused === 'title')}
                />
              )}
              {(overflows || expanded) && (
                <button
                  onClick={() => setExpanded(v => !v)}
                  title={expanded ? 'Collapse' : 'Expand'}
                  style={{
                    position:  'absolute',
                    right:     8,
                    top:       expanded ? 10 : '50%',
                    transform: expanded ? 'none' : 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color:      'rgba(163,201,255,0.3)',
                    display:    'flex', padding: 2,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(163,201,255,0.3)'}
                >
                  {expanded ? <ChevronUp /> : <ChevronDown />}
                </button>
              )}
            </div>
          </div>

          {/* Date */}
          <div>
            <FieldLabel>Due Date</FieldLabel>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              onFocus={() => setFocused('date')}
              onBlur={() => setFocused(null)}
              style={inputStyle(focused === 'date', {
                padding:     '11px 14px',
                fontFamily:  MONO,
                fontSize:    13,
                colorScheme: 'dark',
              })}
            />
          </div>

          {/* Notes */}
          <div>
            <FieldLabel>Notes</FieldLabel>
            <textarea
              value={form.desc}
              onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              onFocus={() => setFocused('desc')}
              onBlur={() => setFocused(null)}
              placeholder="Add context or details…"
              rows={3}
              style={inputStyle(focused === 'desc', {
                padding:    '11px 14px',
                resize:     'none',
                lineHeight: 1.55,
                fontSize:   13,
              })}
            />
          </div>

          {/* Priority */}
          <div>
            <FieldLabel>Priority</FieldLabel>
            <div style={{ display: 'flex', gap: 5 }}>
              {[1, 2, 3, 4, 5].map(n => {
                const sel = form.importance === n
                const col = IMP_COLORS[n]
                return (
                  <button
                    key={n}
                    onClick={() => setForm(f => ({ ...f, importance: n }))}
                    style={{
                      flex:         1,
                      padding:      '10px 0 8px',
                      border:       `1px solid ${sel ? col : 'rgba(163,201,255,0.1)'}`,
                      borderRadius: 8,
                      background:   sel ? `${col}1c` : 'transparent',
                      cursor:       'pointer',
                      display:      'flex', flexDirection: 'column',
                      alignItems:   'center', gap: 4,
                      transition:   'all .13s ease',
                      position:     'relative', overflow: 'hidden',
                    }}
                    onMouseEnter={e => {
                      if (!sel) {
                        e.currentTarget.style.borderColor = `${col}55`
                        e.currentTarget.style.background  = `${col}0e`
                      }
                    }}
                    onMouseLeave={e => {
                      if (!sel) {
                        e.currentTarget.style.borderColor = 'rgba(163,201,255,0.1)'
                        e.currentTarget.style.background  = 'transparent'
                      }
                    }}
                  >
                    {sel && (
                      <div style={{
                        position:   'absolute', top: 0, left: 0, right: 0,
                        height:     2,
                        background: col,
                        boxShadow:  `0 0 8px ${col}`,
                      }} />
                    )}
                    <span style={{
                      fontFamily: MONO,
                      fontSize:   13,
                      fontWeight: sel ? 700 : 500,
                      color:      sel ? col : 'rgba(163,201,255,0.28)',
                      lineHeight: 1,
                      transition: 'color 0.13s',
                    }}>
                      {n}
                    </span>
                    <span style={{
                      fontFamily:    MONO,
                      fontSize:      8,
                      fontWeight:    600,
                      color:         sel ? col : 'rgba(163,201,255,0.18)',
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      transition:    'color 0.13s',
                    }}>
                      {IMP_LABELS[n]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={save}
            style={{
              padding:       '13px 0',
              background:    '#00d4ff',
              border:        'none',
              borderRadius:  10,
              color:         '#04111e',
              fontFamily:    DISPLAY,
              fontSize:      14,
              fontWeight:    800,
              letterSpacing: '0.01em',
              cursor:        'pointer',
              transition:    'background 0.18s, box-shadow 0.18s',
              marginTop:     2,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#2adcff'
              e.currentTarget.style.boxShadow  = '0 0 28px rgba(0,212,255,0.38)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#00d4ff'
              e.currentTarget.style.boxShadow  = 'none'
            }}
          >
            {isNew ? 'Add Task' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
