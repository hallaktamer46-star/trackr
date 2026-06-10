import { useState, useEffect } from 'react'
import { Plus, Trash2, X } from 'lucide-react'

const MONO = '"Geist Mono", "JetBrains Mono", "Fira Code", monospace'
const SANS = '"Geist", "Inter", -apple-system, sans-serif'

const DAY_START = 5 // 5 AM
const TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24]

function hourLabel(offset) {
  const h = (DAY_START + offset) % 24
  if (h === 0) return '12AM'
  if (h < 12) return `${h}AM`
  if (h === 12) return '12PM'
  return `${h - 12}PM`
}

const COLORS = [
  '#a3c9ff', '#4edea3', '#60a5fa', '#ffb689', '#fbbf24',
  '#f472b6', '#ff6b6b', '#a78bfa', '#00d4ff', '#e879f9',
  '#34d399', '#fb923c',
]

const PRESETS = [
  { name: 'Sleep',          color: '#a3c9ff' },
  { name: 'Work',           color: '#4edea3' },
  { name: 'University',     color: '#60a5fa' },
  { name: 'Gym',            color: '#ffb689' },
  { name: 'Meals',          color: '#fbbf24' },
  { name: 'Leisure',        color: '#f472b6' },
  { name: 'Distraction',    color: '#ff6b6b' },
  { name: 'Mental Health',  color: '#a78bfa' },
  { name: 'Transit',        color: '#00d4ff' },
  { name: 'Deep Study',     color: '#34d399' },
  { name: 'Side Project',   color: '#e879f9' },
  { name: 'Social',         color: '#fb923c' },
]

const KEY = 'trackr_lifeplan'
function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }

const CSS = `
  @keyframes lp-pulse {
    0%,100% { opacity:.35; }
    50%      { opacity:.7;  }
  }
  @keyframes lp-in {
    from { opacity:0; transform:translateY(-10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes lp-bar-in {
    from { opacity:0; transform:scaleX(0.97); }
    to   { opacity:1; transform:scaleX(1); }
  }
`

export default function LifePlan() {
  const [blocks, setBlocks]   = useState(load)
  const [form, setForm]       = useState(null)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = CSS
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(blocks)) }, [blocks])

  const total    = blocks.reduce((s, b) => s + b.hours, 0)
  const free     = Math.max(0, 24 - total)
  const formHrs  = parseFloat(form?.hours) || 0
  const overBudget = total + formHrs > 24

  function openForm(preset = null) {
    setForm(preset
      ? { name: preset.name, hours: '', color: preset.color }
      : { name: '', hours: '', color: COLORS[blocks.length % COLORS.length] })
  }

  function addBlock() {
    const hrs = parseFloat(form?.hours)
    if (!form?.name?.trim() || isNaN(hrs) || hrs <= 0 || overBudget) return
    setBlocks(p => [...p, { id: Date.now(), name: form.name.trim(), hours: hrs, color: form.color }])
    setForm(null)
  }

  function removeBlock(id) { setBlocks(p => p.filter(b => b.id !== id)) }

  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', fontFamily: MONO }}>

      {/* Rainbow top line */}
      <div style={{ height: 2, background: 'linear-gradient(90deg,#00d4ff,#60a5fa,#a78bfa,#f472b6,#ffb689,#4edea3)' }} />

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '36px 24px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 10, color: '#00d4ff', letterSpacing: '0.25em', marginBottom: 8, textTransform: 'uppercase' }}>
              ◈ LIFE PLAN
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: '#e6edf3', margin: 0, letterSpacing: '-0.03em', fontFamily: SANS }}>
              Daily Time Budget
            </h1>
            <div style={{ fontSize: 11, color: '#60a5fa', marginTop: 6 }}>
              5AM → 5AM · 24 hours to design
            </div>
          </div>
          <button
            onClick={() => openForm()}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.4)',
              color: '#00d4ff', fontSize: 11, fontWeight: 700,
              padding: '10px 20px', cursor: 'pointer',
              letterSpacing: '0.15em', fontFamily: MONO,
              boxShadow: '0 0 20px rgba(0,212,255,0.12)',
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(0,212,255,0.16)'; e.currentTarget.style.boxShadow='0 0 32px rgba(0,212,255,0.28)' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(0,212,255,0.08)'; e.currentTarget.style.boxShadow='0 0 20px rgba(0,212,255,0.12)' }}
          >
            <Plus size={13} /> ADD BLOCK
          </button>
        </div>

        {/* ── 24h bar ── */}
        <div style={{ marginBottom: 6, animation: 'lp-bar-in .35s ease' }}>
          <div style={{ display: 'flex', height: 80, gap: 2 }}>
            {blocks.map(b => (
              <div
                key={b.id}
                onMouseEnter={() => setHovered(b.id)}
                onMouseLeave={() => setHovered(null)}
                title={`${b.name} · ${b.hours}h`}
                style={{
                  flex: b.hours,
                  background: `linear-gradient(170deg, ${b.color} 0%, ${b.color}bb 100%)`,
                  boxShadow: hovered === b.id
                    ? `0 0 28px ${b.color}99, inset 0 0 20px rgba(255,255,255,0.1)`
                    : `0 0 10px ${b.color}44`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                  transition: 'all .2s ease',
                  opacity: hovered && hovered !== b.id ? 0.45 : 1,
                  transform: hovered === b.id ? 'scaleY(1.06)' : 'scaleY(1)',
                  cursor: 'default',
                }}
              >
                {b.hours >= 1.5 && (
                  <span style={{ fontSize: 10, color: '#0d1117', fontWeight: 900, letterSpacing: '0.04em' }}>
                    {b.hours}h
                  </span>
                )}
                {b.hours >= 2.5 && (
                  <span style={{ fontSize: 8, color: 'rgba(13,17,23,0.7)', marginTop: 1, letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '90%', textOverflow: 'ellipsis' }}>
                    {b.name}
                  </span>
                )}
              </div>
            ))}
            {free > 0 && (
              <div style={{
                flex: free,
                border: '1px dashed rgba(0,212,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'lp-pulse 2.4s ease-in-out infinite',
                cursor: 'pointer',
              }}
                onClick={() => openForm()}
                title="Click to add a block"
              >
                {free >= 2 && (
                  <span style={{ fontSize: 10, color: 'rgba(0,212,255,0.45)', letterSpacing: '0.1em' }}>
                    + {free}h
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tick marks 5AM→5AM */}
          <div style={{ position: 'relative', height: 28, marginTop: 4 }}>
            {TICKS.map(t => (
              <div key={t} style={{
                position: 'absolute',
                left: `${(t / 24) * 100}%`,
                transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              }}>
                <div style={{ width: 1, height: 5, background: t === 0 || t === 24 ? '#00d4ff' : 'rgba(0,212,255,0.25)' }} />
                <span style={{
                  fontSize: 9, letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  color: t === 0 || t === 24 ? '#00d4ff' : 'rgba(96,165,250,0.5)',
                  fontWeight: t === 0 || t === 24 ? 700 : 400,
                }}>
                  {hourLabel(t)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 28 }}>
          {[
            { label: 'ALLOCATED', value: `${total}h`,   color: '#4edea3' },
            { label: 'FREE',      value: `${free}h`,    color: free > 0 ? '#ffb689' : '#4edea3' },
            { label: 'COVERAGE',  value: `${Math.round((total/24)*100)}%`, color: '#60a5fa' },
            { label: 'BLOCKS',    value: blocks.length,  color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: '#161b22',
              border: '1px solid rgba(0,212,255,0.07)',
              borderTop: `2px solid ${s.color}`,
              padding: '13px 14px',
            }}>
              <div style={{ fontSize: 8, color: '#60a5fa', letterSpacing: '0.2em', marginBottom: 7 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: SANS, textShadow: `0 0 24px ${s.color}66` }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Add form ── */}
        {form && (
          <div style={{
            background: '#161b22',
            border: '1px solid rgba(0,212,255,0.22)',
            boxShadow: '0 0 48px rgba(0,212,255,0.07)',
            padding: '18px 20px',
            marginBottom: 24,
            animation: 'lp-in .18s ease',
          }}>
            <div style={{ fontSize: 9, color: '#00d4ff', letterSpacing: '0.22em', marginBottom: 14 }}>NEW BLOCK</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 8, color: '#60a5fa', letterSpacing: '0.15em', marginBottom: 5 }}>ACTIVITY</div>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Sleep"
                  onKeyDown={e => e.key === 'Enter' && addBlock()}
                  autoFocus
                  style={{
                    background: '#0d1117',
                    border: '1px solid rgba(0,212,255,0.18)',
                    borderLeft: `3px solid ${form.color}`,
                    color: '#e6edf3', fontSize: 13,
                    padding: '9px 12px', fontFamily: MONO,
                    width: '100%', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ width: 88 }}>
                <div style={{ fontSize: 8, color: '#60a5fa', letterSpacing: '0.15em', marginBottom: 5 }}>HOURS</div>
                <input
                  type="number" min="0.5" max="24" step="0.5"
                  value={form.hours}
                  onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addBlock()}
                  placeholder="8"
                  style={{
                    background: '#0d1117',
                    border: '1px solid rgba(0,212,255,0.18)',
                    color: '#e6edf3', fontSize: 13,
                    padding: '9px 12px', fontFamily: MONO,
                    width: '100%', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 8, color: '#60a5fa', letterSpacing: '0.15em', marginBottom: 5 }}>COLOR</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 150 }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{
                        width: 17, height: 17, background: c, cursor: 'pointer',
                        outline: form.color === c ? '2px solid #fff' : '2px solid transparent',
                        outlineOffset: 2,
                        boxShadow: form.color === c ? `0 0 10px ${c}` : 'none',
                        transition: 'box-shadow .15s',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={addBlock}
                  disabled={!form.name?.trim() || !form.hours || overBudget}
                  style={{
                    background: '#00d4ff', color: '#0d1117',
                    border: 'none', fontSize: 11, fontWeight: 900,
                    padding: '9px 22px', cursor: 'pointer', fontFamily: MONO,
                    letterSpacing: '0.14em',
                    boxShadow: '0 0 18px rgba(0,212,255,0.35)',
                    opacity: (!form.name?.trim() || !form.hours || overBudget) ? 0.3 : 1,
                  }}
                >
                  ADD
                </button>
                <button onClick={() => setForm(null)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(163,201,255,0.2)',
                    color: '#a3c9ff', padding: '9px 12px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>
            {overBudget && (
              <div style={{ fontSize: 10, color: '#ff6b6b', marginTop: 10, letterSpacing: '0.05em' }}>
                {(total + formHrs - 24).toFixed(1)}h over budget — reduce hours or remove a block first
              </div>
            )}
          </div>
        )}

        {/* ── Main grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16, alignItems: 'start' }}>

          {/* Blocks list */}
          <div>
            <div style={{ fontSize: 9, color: '#60a5fa', letterSpacing: '0.22em', marginBottom: 10 }}>TIME BLOCKS</div>
            {blocks.length === 0 ? (
              <div
                onClick={() => openForm()}
                style={{
                  border: '1px dashed rgba(0,212,255,0.15)',
                  padding: '44px 24px', textAlign: 'center', cursor: 'pointer',
                  transition: 'border-color .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)'}
              >
                <div style={{ fontSize: 24, marginBottom: 10 }}>◫</div>
                <div style={{ fontSize: 11, color: 'rgba(0,212,255,0.4)', letterSpacing: '0.12em', marginBottom: 4 }}>
                  YOUR DAY IS BLANK
                </div>
                <div style={{ fontSize: 10, color: 'rgba(96,165,250,0.3)' }}>
                  Click to add a block, or pick a preset →
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {blocks.map(b => (
                  <div
                    key={b.id}
                    onMouseEnter={() => setHovered(b.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      background: hovered === b.id ? `rgba(${hexToRgb(b.color)},0.05)` : '#161b22',
                      border: '1px solid rgba(0,212,255,0.06)',
                      borderLeft: `3px solid ${b.color}`,
                      padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      transition: 'all .15s',
                      boxShadow: hovered === b.id ? `inset 0 0 30px ${b.color}10` : 'none',
                    }}
                  >
                    <div style={{ width: 9, height: 9, background: b.color, flexShrink: 0, boxShadow: `0 0 8px ${b.color}99` }} />
                    <span style={{ fontSize: 12, color: '#e6edf3', flex: 1, fontWeight: 600 }}>{b.name}</span>
                    <span style={{ fontSize: 14, color: b.color, fontWeight: 900 }}>{b.hours}h</span>
                    <span style={{ fontSize: 9, color: '#60a5fa', minWidth: 28, textAlign: 'right' }}>
                      {Math.round((b.hours / 24) * 100)}%
                    </span>
                    <div style={{ width: 60, height: 3, background: 'rgba(0,212,255,0.08)', flexShrink: 0 }}>
                      <div style={{ width: `${(b.hours/24)*100}%`, height:'100%', background: b.color, boxShadow: `0 0 6px ${b.color}` }} />
                    </div>
                    <button onClick={() => removeBlock(b.id)}
                      style={{ background:'transparent', border:'none', color:'rgba(255,107,107,0.3)', cursor:'pointer', padding:4, display:'flex', alignItems:'center', transition:'color .15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,107,107,0.3)'}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Presets */}
          <div>
            <div style={{ fontSize: 9, color: '#60a5fa', letterSpacing: '0.22em', marginBottom: 10 }}>QUICK PRESETS</div>
            <div style={{ background: '#161b22', border: '1px solid rgba(0,212,255,0.07)' }}>
              {PRESETS.map(p => {
                const used = blocks.some(b => b.name === p.name)
                return (
                  <button key={p.name} onClick={() => !used && openForm(p)} disabled={used}
                    style={{
                      background: 'transparent', border: 'none',
                      borderBottom: '1px solid rgba(0,212,255,0.05)',
                      padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 10,
                      cursor: used ? 'default' : 'pointer', textAlign: 'left', width: '100%',
                      opacity: used ? 0.35 : 1, transition: 'background .12s',
                    }}
                    onMouseEnter={e => { if (!used) e.currentTarget.style.background='rgba(0,212,255,0.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.background='transparent' }}
                  >
                    <div style={{ width: 7, height: 7, background: p.color, boxShadow: used ? 'none' : `0 0 6px ${p.color}88`, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: '#c8d8f0', fontFamily: MONO }}>{p.name}</span>
                    {used && <span style={{ fontSize: 9, color: p.color, marginLeft: 'auto' }}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}
