import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'

const BODY = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
const KEY  = 'trackr_engage_v2'

const COLORS = [
  '#60a5fa','#4edea3','#a78bfa','#f97316',
  '#fb7185','#fbbf24','#38bdf8','#c084fc',
  '#34d399','#f43f5e','#06b6d4','#e879f9',
]

const DIVIDER = 'rgba(48,54,61,0.9)'
const BG      = '#0b0f1c'
const SURFACE = '#0d1117'

export default function NewStatus() {
  const navigate = useNavigate()
  const [label, setLabel] = useState('')
  const [color, setColor] = useState('#60a5fa')
  const [type,  setType]  = useState('fixed')

  function save() {
    const lbl = label.trim()
    if (!lbl) return
    try {
      const raw  = localStorage.getItem(KEY)
      const data = raw ? JSON.parse(raw) : {}
      const prev = Array.isArray(data.custom) ? data.custom : []
      const next = [...prev, { label: lbl, color, type }]
      localStorage.setItem(KEY, JSON.stringify({ ...data, custom: next }))
      window.dispatchEvent(new Event('trackr-custom-updated'))
    } catch {}
    navigate(-1)
  }

  const rowStyle = {
    display: 'flex', alignItems: 'center', minHeight: 44,
    borderBottom: `1px solid ${DIVIDER}`, padding: '0 20px', gap: 14,
  }
  const rowLabel = {
    width: 64, flexShrink: 0, fontSize: 9, fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'rgba(148,180,255,0.38)', fontFamily: BODY,
  }

  return (
    <div style={{
      minHeight: '100vh', background: SURFACE,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: BODY, padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 320 }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: 'rgba(148,180,255,0.45)', fontSize: 12, fontFamily: BODY, fontWeight: 500,
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#a3c9ff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,180,255,0.45)'}
        >
          <ArrowLeft size={13}/> Back
        </button>

        {/* Card */}
        <div style={{
          background: BG,
          border: `1px solid ${DIVIDER}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${DIVIDER}` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(220,235,255,0.9)', margin: 0, letterSpacing: '-0.01em' }}>
              New status
            </p>
            <p style={{ fontSize: 11, color: 'rgba(148,180,255,0.35)', margin: '3px 0 0', fontWeight: 400 }}>
              Custom statuses appear in your Engage panel
            </p>
          </div>

          {/* Name row */}
          <div style={rowStyle}>
            <span style={rowLabel}>Name</span>
            <input
              autoFocus
              value={label}
              onChange={e => setLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') navigate(-1) }}
              placeholder="e.g. Deep focus…"
              style={{
                flex: 1, background: 'transparent', border: 'none',
                color: '#d8ecff', fontSize: 13, fontWeight: 500,
                outline: 'none', fontFamily: BODY,
              }}
            />
          </div>

          {/* Color row */}
          <div style={{ ...rowStyle, minHeight: 48 }}>
            <span style={rowLabel}>Color</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setColor(c)} style={{
                  width: 16, height: 16, borderRadius: '50%', background: c,
                  cursor: 'pointer', flexShrink: 0, transition: 'all 0.12s',
                  outline: color === c ? `2px solid ${c}` : undefined,
                  outlineOffset: color === c ? 2 : undefined,
                  boxShadow: color === c ? `0 0 8px ${c}80` : undefined,
                }}/>
              ))}
            </div>
          </div>

          {/* Preview row */}
          <div style={{ ...rowStyle }}>
            <span style={rowLabel}>Preview</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 7px ${color}` }}/>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#d0e4ff' }}>
                {label || <span style={{ color: 'rgba(148,180,255,0.3)' }}>Status name</span>}
              </span>
            </div>
          </div>

          {/* Type row */}
          <div style={rowStyle}>
            <span style={rowLabel}>Type</span>
            <div style={{ display: 'flex', gap: 3 }}>
              {['fixed', 'temporary'].map(t => (
                <button key={t} onClick={() => setType(t)} style={{
                  padding: '4px 13px', borderRadius: 20, border: 'none',
                  background: type === t ? 'rgba(96,165,250,0.18)' : 'transparent',
                  color: type === t ? '#c0dcff' : 'rgba(148,180,255,0.32)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  fontFamily: BODY, transition: 'all 0.12s', textTransform: 'capitalize',
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {type === 'temporary' && (
            <div style={{ padding: '8px 20px', borderBottom: `1px solid ${DIVIDER}`, background: 'rgba(96,165,250,0.04)' }}>
              <p style={{ fontSize: 10, color: 'rgba(148,180,255,0.4)', margin: 0, lineHeight: 1.6 }}>
                Temporary statuses auto-revert to your previous status after your shift ends.
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, padding: '12px 20px' }}>
            <button onClick={save} style={{
              flex: 1, padding: '9px 0', background: 'rgba(96,165,250,0.18)',
              border: 'none', borderRadius: 8, color: '#c0dcff',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: BODY,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(96,165,250,0.28)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(96,165,250,0.18)'}
            >
              <Check size={12}/> Add status
            </button>
            <button onClick={() => navigate(-1)} style={{
              padding: '9px 16px', background: 'transparent',
              border: `1px solid rgba(96,165,250,0.14)`, borderRadius: 8,
              color: 'rgba(148,180,255,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: BODY,
            }}>
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
