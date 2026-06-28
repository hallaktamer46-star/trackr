import { useState, useEffect, useRef } from 'react'

const NUM  = 'Consolas, Menlo, Monaco, monospace'
const BODY = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"

const IMP_COLORS = { 1: '#4edea3', 2: '#a3c9ff', 3: '#fbbf24', 4: '#ffb689', 5: '#ffb4ab' }
const priorityToImp = p => p === 'low' ? 1 : p === 'high' ? 5 : 3
const impToPriority = n => n <= 2 ? 'low' : n === 3 ? 'medium' : 'high'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

// Small chevron SVGs — no lucide dependency needed here
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

export default function TaskModal({ open, task, onClose, onSave }) {
  const isNew = !task?.id
  const [form, setForm]           = useState({ title: '', date: todayISO(), desc: '', importance: 3 })
  const [visible, setVisible]     = useState(false)
  const [expanded, setExpanded]   = useState(false)
  const [overflows, setOverflows] = useState(false)
  const titleRef = useRef(null)

  // Reset form + expansion whenever the modal opens for a (new) task
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

  // Escape key
  useEffect(() => {
    if (!open) return
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  // Detect whether the single-line input overflows so we can show the expand arrow
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

  const inputBase = {
    background: 'rgba(255,255,255,0.03)',
    border: '0.5px solid rgba(163,201,255,0.14)',
    color: '#e2e2e8', fontSize: 14, fontFamily: BODY,
    outline: 'none', width: '100%', boxSizing: 'border-box',
    // leave room on the right for the expand button
    padding: '10px 36px 10px 14px',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: visible ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999, padding: 20,
        transition: 'background 0.2s',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 380,
          background: '#0a0e1c',
          border: '0.5px solid rgba(163,201,255,0.15)',
          padding: '36px 32px',
          display: 'flex', flexDirection: 'column', gap: 16,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1), opacity 0.2s',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: NUM, fontSize: 13, fontWeight: 800, color: '#e2e2e8', letterSpacing: '-0.01em', margin: 0 }}>
            {isNew ? 'New Task' : 'Edit Task'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(163,201,255,0.35)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4, transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(163,201,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(163,201,255,0.35)'}
          >×</button>
        </div>

        {/* Title field with expand toggle */}
        <div style={{ position: 'relative' }}>
          {expanded ? (
            <textarea
              ref={titleRef}
              autoFocus
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              rows={3}
              style={{ ...inputBase, resize: 'none', lineHeight: 1.5 }}
            />
          ) : (
            <input
              ref={titleRef}
              autoFocus
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && save()}
              placeholder="Task title…"
              style={inputBase}
            />
          )}

          {/* Expand/collapse arrow — only visible when text overflows or is already expanded */}
          {(overflows || expanded) && (
            <button
              onClick={() => setExpanded(v => !v)}
              title={expanded ? 'Collapse' : 'Expand'}
              style={{
                position: 'absolute',
                right: 8,
                top: expanded ? 10 : '50%',
                transform: expanded ? 'none' : 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(163,201,255,0.35)',
                display: 'flex', padding: 2,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(163,201,255,0.75)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(163,201,255,0.35)'}
            >
              {expanded ? <ChevronUp /> : <ChevronDown />}
            </button>
          )}
        </div>

        {/* Date */}
        <input
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.03)',
            border: '0.5px solid rgba(163,201,255,0.14)',
            color: '#8a919f', fontSize: 13, fontFamily: NUM,
            outline: 'none', colorScheme: 'dark',
            width: '100%', boxSizing: 'border-box',
          }}
        />

        {/* Description */}
        <textarea
          value={form.desc}
          onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
          placeholder="Description (optional)…"
          rows={3}
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.03)',
            border: '0.5px solid rgba(163,201,255,0.14)',
            color: '#c0c7d5', fontSize: 13, fontFamily: BODY,
            outline: 'none', resize: 'none',
            width: '100%', boxSizing: 'border-box',
          }}
        />

        {/* Importance */}
        <div>
          <p style={{ fontFamily: NUM, fontSize: 9, color: 'rgba(163,201,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            Importance
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setForm(f => ({ ...f, importance: n }))}
                style={{
                  flex: 1, padding: '9px 0',
                  border: `0.5px solid ${form.importance === n ? IMP_COLORS[n] + '80' : 'rgba(163,201,255,0.1)'}`,
                  background: form.importance === n ? `${IMP_COLORS[n]}18` : 'rgba(255,255,255,0.02)',
                  color: form.importance === n ? IMP_COLORS[n] : 'rgba(163,201,255,0.3)',
                  fontFamily: NUM, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .12s',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={save}
          style={{
            padding: '12px 0',
            background: 'linear-gradient(135deg,rgba(96,165,250,0.18),rgba(163,201,255,0.1))',
            border: '0.5px solid rgba(96,165,250,0.35)',
            color: '#60a5fa', fontFamily: NUM, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(96,165,250,0.22)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.55)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(96,165,250,0.18),rgba(163,201,255,0.1))'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.35)' }}
        >
          {isNew ? 'Add Task' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
