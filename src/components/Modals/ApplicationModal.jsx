import { useState, useEffect, useRef } from 'react'
import { X, Trash2, Briefcase, Building2, Link2, DollarSign, FileText, Bell, Calendar, ChevronDown, Sparkles } from 'lucide-react'
import { STATUSES, STATUS_CONFIG } from '../../contexts/ApplicationContext'
import { format, subDays } from 'date-fns'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

const STATUS_ACCENT = {
  wishlist:  { color: '#8a919f', bg: 'rgba(138,145,159,0.12)', border: 'rgba(138,145,159,0.3)',  dot: '#8a919f'  },
  applied:   { color: '#a3c9ff', bg: 'rgba(163,201,255,0.12)', border: 'rgba(163,201,255,0.35)', dot: '#a3c9ff'  },
  interview: { color: '#ffb689', bg: 'rgba(255,182,137,0.12)', border: 'rgba(255,182,137,0.35)', dot: '#ffb689'  },
  offer:     { color: '#4edea3', bg: 'rgba(78,222,163,0.12)',  border: 'rgba(78,222,163,0.35)',  dot: '#4edea3'  },
  rejected:  { color: '#ffb4ab', bg: 'rgba(255,180,171,0.12)', border: 'rgba(255,180,171,0.35)', dot: '#ffb4ab' },
}

const STATUS_EMOJI = {
  wishlist:  '⭐',
  applied:   '📨',
  interview: '🎯',
  offer:     '🎉',
  rejected:  '✕',
}

const EMPTY = {
  company: '', job_title: '', date_applied: '', url: '',
  salary_range: '', notes: '', status: 'applied', reminder_date: '',
}

const today    = () => format(new Date(), 'yyyy-MM-dd')
const daysAgo  = (n) => format(subDays(new Date(), n), 'yyyy-MM-dd')
const fmtShort = (iso) => {
  if (!iso) return ''
  try { return format(new Date(iso + 'T00:00:00'), 'MMM d, yyyy') } catch { return iso }
}

/* ── Reusable field wrapper ── */
function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: MONO, fontSize: 9, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#5a6478', marginBottom: 7,
      }}>
        {Icon && <Icon size={9} style={{ color: '#5a6478' }} />}
        {label}
      </label>
      {children}
    </div>
  )
}

/* ── Input with left icon ── */
function IconInput({ icon: Icon, accent, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <Icon size={13} style={{
        position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
        color: focused ? (accent || '#a3c9ff') : '#3a4455',
        transition: 'color 0.2s', pointerEvents: 'none',
      }} />
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e => { setFocused(false); props.onBlur?.(e) }}
        style={{
          width: '100%', padding: '11px 14px 11px 36px', boxSizing: 'border-box',
          background: focused ? 'rgba(163,201,255,0.04)' : 'rgba(255,255,255,0.025)',
          border: `0.5px solid ${focused ? (accent ? accent + '55' : 'rgba(163,201,255,0.35)') : 'rgba(255,255,255,0.07)'}`,
          color: '#e2e2e8', fontSize: 13, fontFamily: SANS, outline: 'none',
          transition: 'border-color 0.2s, background 0.2s',
          boxShadow: focused ? `0 0 0 3px ${accent ? accent + '12' : 'rgba(163,201,255,0.08)'}` : 'none',
          ...props.style,
        }}
      />
    </div>
  )
}

/* ── Compact date picker ── */
function DatePicker({ value, onChange, placeholder = 'Set date' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const shortcuts = [
    { label: 'Today',      val: today()    },
    { label: 'Yesterday',  val: daysAgo(1) },
    { label: '3 days ago', val: daysAgo(3) },
    { label: '1 week ago', val: daysAgo(7) },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', padding: '11px 14px 11px 36px',
          background: value ? 'rgba(163,201,255,0.04)' : 'rgba(255,255,255,0.025)',
          border: `0.5px solid ${value ? 'rgba(163,201,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
          color: value ? '#c0c7d5' : '#3a4455',
          fontFamily: SANS, fontSize: 13, textAlign: 'left',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'all 0.2s', position: 'relative',
        }}
      >
        <Calendar size={13} style={{ position: 'absolute', left: 13, color: value ? '#a3c9ff' : '#3a4455', transition: 'color 0.2s' }} />
        <span>{value ? fmtShort(value) : placeholder}</span>
        <ChevronDown size={11} style={{ color: '#3a4455', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
          background: '#0a1628', border: '0.5px solid rgba(163,201,255,0.15)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        }}>
          {shortcuts.map((s, i) => (
            <button
              key={s.label} type="button"
              onClick={() => { onChange(s.val); setOpen(false) }}
              style={{
                width: '100%', padding: '10px 14px', border: 'none',
                background: value === s.val ? 'rgba(163,201,255,0.08)' : 'transparent',
                color: value === s.val ? '#a3c9ff' : '#8a919f',
                fontFamily: SANS, fontSize: 12, cursor: 'pointer', textAlign: 'left',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: i < shortcuts.length - 1 ? '0.5px solid rgba(163,201,255,0.05)' : 'none',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (value !== s.val) e.currentTarget.style.background = 'rgba(163,201,255,0.04)' }}
              onMouseLeave={e => { if (value !== s.val) e.currentTarget.style.background = 'transparent' }}
            >
              {s.label}
              <span style={{ fontFamily: MONO, fontSize: 9, color: '#3a4455' }}>{fmtShort(s.val)}</span>
            </button>
          ))}
          <div style={{ padding: '8px 14px', borderTop: '0.5px solid rgba(163,201,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: MONO, fontSize: 9, color: '#3a4455', whiteSpace: 'nowrap' }}>PICK DATE</span>
            <input
              type="date" value={value}
              onChange={e => { onChange(e.target.value); setOpen(false) }}
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#8a919f', fontFamily: MONO, fontSize: 10, outline: 'none', colorScheme: 'dark' }}
            />
          </div>
          {value && (
            <button type="button" onClick={() => { onChange(''); setOpen(false) }}
              style={{ width: '100%', padding: '8px 14px', border: 'none', borderTop: '0.5px solid rgba(163,201,255,0.06)', background: 'transparent', color: '#ffb4ab', fontFamily: MONO, fontSize: 9, cursor: 'pointer', textAlign: 'left', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════ */
export default function ApplicationModal({ open, onClose, onSave, onDelete, initial }) {
  const [form, setForm] = useState(EMPTY)
  const isEditing = Boolean(initial?.id)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (open) setForm(initial ? {
      company:       initial.company       || '',
      job_title:     initial.job_title     || '',
      date_applied:  initial.date_applied  || '',
      url:           initial.url           || '',
      salary_range:  initial.salary_range  || '',
      notes:         initial.notes         || '',
      status:        initial.status        || 'applied',
      reminder_date: initial.reminder_date || '',
    } : { ...EMPTY, date_applied: today() })
  }, [open, initial])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.company.trim() || !form.job_title.trim()) return
    onSave({ ...initial, ...form })
    onClose()
  }

  const accent = STATUS_ACCENT[form.status] || STATUS_ACCENT.applied

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)',
        animation: 'fadeIn 0.18s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%', maxWidth: 520,
        background: 'linear-gradient(160deg, #0c1829 0%, #070d1a 100%)',
        border: `0.5px solid ${accent.border}`,
        boxShadow: `0 0 0 1px ${accent.color}08, 0 32px 80px rgba(0,0,0,0.8), 0 0 80px ${accent.color}10`,
        animation: 'slideUp 0.22s cubic-bezier(0.34,1.4,0.64,1)',
        fontFamily: SANS,
        transition: 'border-color 0.4s, box-shadow 0.4s',
        overflow: 'hidden',
      }}>

        {/* ── Accent top bar ── */}
        <div style={{ height: 2, background: `linear-gradient(90deg, ${accent.color}, ${accent.color}44, transparent)`, transition: 'background 0.4s' }} />

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px 16px',
          borderBottom: `0.5px solid rgba(255,255,255,0.04)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: accent.bg, border: `0.5px solid ${accent.border}`,
              boxShadow: `0 0 20px ${accent.color}25`,
              transition: 'all 0.4s',
            }}>
              <Sparkles size={14} style={{ color: accent.color }} />
            </div>
            <div>
              <p style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: accent.color, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1, transition: 'color 0.4s' }}>
                {isEditing ? 'Edit Application' : 'Track a New Role'}
              </p>
              <p style={{ fontFamily: SANS, fontSize: 11, color: '#3a4455', marginTop: 3, lineHeight: 1 }}>
                {form.company && form.job_title
                  ? `${form.company} · ${form.job_title}`
                  : 'Fill in the details below'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.06)', cursor: 'pointer', color: '#3a4455', padding: '6px 7px', transition: 'all 0.15s', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e2e2e8'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#3a4455'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Company + Role */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Company" icon={Building2}>
                <IconInput
                  icon={Building2}
                  required
                  value={form.company}
                  onChange={e => set('company', e.target.value)}
                  placeholder="Stripe, Google…"
                />
              </Field>
              <Field label="Role" icon={Briefcase}>
                <IconInput
                  icon={Briefcase}
                  required
                  value={form.job_title}
                  onChange={e => set('job_title', e.target.value)}
                  placeholder="Design Engineer"
                />
              </Field>
            </div>

            {/* Status */}
            <Field label="Application Status">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                {STATUSES.map(s => {
                  const a = STATUS_ACCENT[s]
                  const active = form.status === s
                  return (
                    <button key={s} type="button" onClick={() => set('status', s)}
                      style={{
                        padding: '10px 6px',
                        border: `0.5px solid ${active ? a.border : 'rgba(255,255,255,0.06)'}`,
                        background: active ? a.bg : 'rgba(255,255,255,0.02)',
                        color: active ? a.color : '#3a4455',
                        fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                        textTransform: 'uppercase', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        transition: 'all 0.15s',
                        boxShadow: active ? `0 0 16px ${a.color}20, inset 0 0 20px ${a.color}06` : 'none',
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = a.border; e.currentTarget.style.color = a.color; e.currentTarget.style.background = a.bg } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#3a4455'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' } }}
                    >
                      <span style={{ fontSize: 16 }}>{STATUS_EMOJI[s]}</span>
                      <span>{STATUS_CONFIG[s]?.label || s}</span>
                    </button>
                  )
                })}
              </div>
            </Field>

            {/* Applied Date + Reminder */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Applied Date" icon={Calendar}>
                <DatePicker value={form.date_applied} onChange={v => set('date_applied', v)} placeholder="When did you apply?" />
              </Field>
              <Field label="Follow-up Reminder" icon={Bell}>
                <DatePicker value={form.reminder_date} onChange={v => set('reminder_date', v)} placeholder="Set a reminder" />
              </Field>
            </div>

            {/* Salary + URL */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Salary Range" icon={DollarSign}>
                <IconInput
                  icon={DollarSign}
                  value={form.salary_range}
                  onChange={e => set('salary_range', e.target.value)}
                  placeholder="$120k – $150k"
                  accent="#4edea3"
                />
              </Field>
              <Field label="Job Posting URL" icon={Link2}>
                <IconInput
                  icon={Link2}
                  value={form.url}
                  onChange={e => set('url', e.target.value)}
                  placeholder="Paste link here"
                  type="url"
                />
              </Field>
            </div>

            {/* Notes */}
            <Field label="Notes" icon={FileText}>
              <div style={{ position: 'relative' }}>
                <FileText size={13} style={{ position: 'absolute', left: 13, top: 13, color: '#3a4455', pointerEvents: 'none' }} />
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Recruiter name, referral source, prep notes…"
                  style={{
                    width: '100%', padding: '11px 14px 11px 36px', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.025)', border: '0.5px solid rgba(255,255,255,0.07)',
                    color: '#c0c7d5', fontSize: 13, fontFamily: SANS, lineHeight: 1.65,
                    outline: 'none', resize: 'none', transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(163,201,255,0.35)'; e.target.style.background = 'rgba(163,201,255,0.04)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.background = 'rgba(255,255,255,0.025)' }}
                />
              </div>
            </Field>
          </div>

          {/* ── Footer ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 22px 18px',
            borderTop: '0.5px solid rgba(255,255,255,0.04)',
          }}>
            {isEditing ? (
              <button type="button"
                onClick={() => { onDelete(initial.id); onClose() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#3a4455', fontFamily: MONO, fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'color 0.15s', padding: '6px 2px',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffb4ab'}
                onMouseLeave={e => e.currentTarget.style.color = '#3a4455'}
              >
                <Trash2 size={11} /> Delete
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={onClose}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '0.5px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer', color: '#5a6478',
                  fontFamily: MONO, fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#8a919f' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#5a6478' }}
              >
                Cancel
              </button>
              <button type="submit"
                style={{
                  padding: '10px 28px',
                  background: `linear-gradient(135deg, ${accent.color} 0%, ${accent.color}cc 100%)`,
                  border: 'none', cursor: 'pointer',
                  color: form.status === 'rejected' ? '#fff' : '#070d1a',
                  fontFamily: MONO, fontSize: 10, fontWeight: 800,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  boxShadow: `0 4px 24px ${accent.color}40, 0 0 0 0.5px ${accent.color}50`,
                  transition: 'filter 0.15s, transform 0.15s, box-shadow 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none' }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              >
                {isEditing ? 'Save Changes' : '+ Track Role'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(28px) scale(0.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.3); cursor: pointer; }
      `}</style>
    </div>
  )
}
