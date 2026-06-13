import { useState, useEffect } from 'react'

const NUM  = 'Geist Mono, monospace'
const BODY = 'Geist, Inter, -apple-system, sans-serif'

const IMP_COLORS = { 1: '#4edea3', 2: '#a3c9ff', 3: '#fbbf24', 4: '#ffb689', 5: '#ffb4ab' }
const priorityToImp = p => p === 'low' ? 1 : p === 'high' ? 5 : 3
const impToPriority = n => n <= 2 ? 'low' : n === 3 ? 'medium' : 'high'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function TaskModal({ open, task, onClose, onSave }) {
  const isNew = !task?.id
  const [form, setForm] = useState({ title: '', date: todayISO(), desc: '', importance: 3 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({
        title:      task?.title    || '',
        date:       task?.due      || todayISO(),
        desc:       task?.note     || '',
        importance: priorityToImp(task?.priority || 'medium'),
      })
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

        <input
          autoFocus
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && save()}
          placeholder="Task title…"
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.03)',
            border: '0.5px solid rgba(163,201,255,0.14)',
            color: '#e2e2e8', fontSize: 14, fontFamily: BODY,
            outline: 'none', width: '100%', boxSizing: 'border-box',
          }}
        />

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
