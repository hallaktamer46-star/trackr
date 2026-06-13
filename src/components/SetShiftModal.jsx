import { useState, useEffect } from 'react'

const MONO = '"Geist Mono", monospace'
const SANS = 'Inter, -apple-system, sans-serif'

const DURATION_PRESETS = [4, 6, 8, 10]
const TIME_PRESETS = [
  { label: '5 PM',  value: '17:00' },
  { label: '6 PM',  value: '18:00' },
  { label: '8 PM',  value: '20:00' },
  { label: '9 PM',  value: '21:00' },
]

function fmt12(val) {
  if (!val) return ''
  const [h, m] = val.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function SetShiftModal({ open, onClose, onSave, current }) {
  const [type, setType]       = useState('duration')
  const [hours, setHours]     = useState(8)
  const [endTime, setEndTime] = useState('18:00')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setType(current?.type || 'duration')
      setHours(current?.hours ?? 8)
      setEndTime(current?.endTime || '18:00')
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  function save() {
    onSave(type === 'duration'
      ? { type: 'duration', hours: Math.max(0.5, parseFloat(hours) || 8) }
      : { type: 'deadline', endTime })
    onClose()
  }

  if (!open && !visible) return null

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    color: '#e8f0fe', fontFamily: MONO, fontSize: 16, fontWeight: 600,
    outline: 'none', colorScheme: 'dark',
    transition: 'border-color 0.15s',
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: visible ? 'rgba(2,4,8,0.88)' : 'rgba(2,4,8,0)',
        backdropFilter: visible ? 'blur(20px)' : 'blur(0px)',
        transition: 'background 0.3s, backdrop-filter 0.3s',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 380, margin: '0 20px',
        background: '#0b0f1c',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(255,255,255,0.07)',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.25s',
      }}>

        {/* Header */}
        <div style={{ padding: '28px 28px 0' }}>
          <p style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
            Shift
          </p>
          <h2 style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: '#e8f0fe', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Set your shift
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            You'll get a notification when time's up.
          </p>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', margin: '24px 28px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {[['duration', 'Duration'], ['deadline', 'End Time']].map(([k, l]) => (
            <button key={k} onClick={() => setType(k)} style={{
              flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
              background: 'transparent',
              fontFamily: SANS, fontSize: 13, fontWeight: 600,
              color: type === k ? '#00d4ff' : 'rgba(255,255,255,0.25)',
              borderBottom: type === k ? '2px solid #00d4ff' : '2px solid transparent',
              marginBottom: '-1px',
              transition: 'color 0.15s',
            }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px 28px 28px' }}>

          {type === 'duration' ? (
            <>
              {/* Preset chips */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {DURATION_PRESETS.map(h => (
                  <button key={h} onClick={() => setHours(h)} style={{
                    flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer',
                    fontFamily: MONO, fontSize: 12, fontWeight: 700,
                    background: hours == h ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                    color: hours == h ? '#00d4ff' : 'rgba(255,255,255,0.3)',
                    outline: hours == h ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent',
                    transition: 'all 0.12s',
                  }}>
                    {h}h
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div style={{ position: 'relative' }}>
                <input
                  type="number" min="0.5" max="24" step="0.5"
                  value={hours}
                  onChange={e => setHours(e.target.value)}
                  placeholder="Hours…"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderBottomColor = 'rgba(0,212,255,0.5)'}
                  onBlur={e => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.1)'}
                />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }}>
                  hrs
                </span>
              </div>

              {hours && (
                <p style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(0,212,255,0.5)', marginTop: 10, letterSpacing: '0.04em' }}>
                  Shift ends {parseFloat(hours)}h after clock-in
                </p>
              )}
            </>
          ) : (
            <>
              {/* Time presets */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16 }}>
                {TIME_PRESETS.map(p => (
                  <button key={p.value} onClick={() => setEndTime(p.value)} style={{
                    padding: '9px 0', border: 'none', cursor: 'pointer',
                    fontFamily: MONO, fontSize: 12, fontWeight: 700,
                    background: endTime === p.value ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.04)',
                    color: endTime === p.value ? '#a78bfa' : 'rgba(255,255,255,0.3)',
                    outline: endTime === p.value ? '1px solid rgba(167,139,250,0.3)' : '1px solid transparent',
                    transition: 'all 0.12s',
                  }}>
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Custom time */}
              <div style={{ position: 'relative' }}>
                <input
                  type="time" value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderBottomColor = 'rgba(167,139,250,0.5)'}
                  onBlur={e => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {endTime && (
                <p style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(167,139,250,0.5)', marginTop: 10, letterSpacing: '0.04em' }}>
                  Clocking out at {fmt12(endTime)}
                </p>
              )}
            </>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
            <button onClick={save} style={{
              flex: 1, padding: '13px 0', border: 'none', cursor: 'pointer',
              fontFamily: SANS, fontSize: 13, fontWeight: 700,
              background: type === 'duration'
                ? 'linear-gradient(90deg, rgba(0,212,255,0.9), rgba(0,180,220,0.9))'
                : 'linear-gradient(90deg, rgba(167,139,250,0.9), rgba(139,92,246,0.9))',
              color: '#040810',
              letterSpacing: '0.01em',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Confirm
            </button>

            {current && (
              <button onClick={() => { onSave(null); onClose() }} style={{
                padding: '13px 14px', border: 'none', cursor: 'pointer',
                fontFamily: SANS, fontSize: 12, fontWeight: 600,
                background: 'rgba(255,255,255,0.04)', color: 'rgba(255,100,100,0.6)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,100,100,0.6)'}>
                Clear
              </button>
            )}

            <button onClick={onClose} style={{
              padding: '13px 14px', border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)',
              fontFamily: SANS, fontSize: 16, fontWeight: 300,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}>
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
