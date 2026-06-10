import { useState, useEffect } from 'react'
import { Plus, Trash2, Target } from 'lucide-react'

const MONO = '"Geist Mono", "JetBrains Mono", "Fira Code", monospace'

const COLORS = [
  '#a3c9ff','#4edea3','#60a5fa','#ffb689','#fbbf24',
  '#f472b6','#ff6b6b','#a78bfa','#00d4ff','#e879f9',
  '#34d399','#fb923c',
]

const PRESETS = [
  { name: 'Sleep',         color: '#a3c9ff' },
  { name: 'Work',          color: '#4edea3' },
  { name: 'University',    color: '#60a5fa' },
  { name: 'Gym',           color: '#ffb689' },
  { name: 'Meals',         color: '#fbbf24' },
  { name: 'Leisure',       color: '#f472b6' },
  { name: 'Distraction',   color: '#ff6b6b' },
  { name: 'Mental Health', color: '#a78bfa' },
  { name: 'Transit',       color: '#00d4ff' },
  { name: 'Deep Study',    color: '#34d399' },
  { name: 'Side Project',  color: '#e879f9' },
  { name: 'Social',        color: '#fb923c' },
]

const STORAGE_KEY = 'trackr_lifeplan'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export default function LifePlan() {
  const [blocks, setBlocks] = useState(load)
  const [form, setForm] = useState({ name: '', hours: '', color: COLORS[0] })
  const [adding, setAdding] = useState(false)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks))
  }, [blocks])

  const totalHours = blocks.reduce((s, b) => s + b.hours, 0)
  const remaining = Math.max(0, 24 - totalHours)
  const formHours = parseFloat(form.hours) || 0

  function addBlock() {
    const hours = parseFloat(form.hours)
    if (!form.name.trim() || isNaN(hours) || hours <= 0 || totalHours + hours > 24) return
    setBlocks(prev => [...prev, { id: Date.now(), name: form.name.trim(), hours, color: form.color }])
    setForm({ name: '', hours: '', color: COLORS[(blocks.length + 1) % COLORS.length] })
    setAdding(false)
  }

  function removeBlock(id) {
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  function applyPreset(p) {
    setForm(f => ({ ...f, name: p.name, color: p.color }))
    setAdding(true)
  }

  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', padding: '32px 24px', fontFamily: MONO }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Target size={16} color="#00d4ff" />
          <span style={{ fontSize: 10, color: '#00d4ff', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            LIFE PLAN
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e6edf3', letterSpacing: '-0.02em', margin: 0 }}>
          Daily Time Budget
        </h1>
        <p style={{ fontSize: 12, color: 'rgba(96,165,250,0.7)', marginTop: 6 }}>
          Design your ideal 24-hour day — slice the bar into what matters.
        </p>
      </div>

      {/* 24h bar */}
      <div style={{ background: '#161b22', border: '1px solid rgba(0,212,255,0.12)', padding: 20, marginBottom: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 9, color: '#60a5fa', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            24-HOUR VIEW
          </span>
          {remaining > 0 ? (
            <span style={{ fontSize: 9, color: '#ffb689' }}>— {remaining}h unallocated</span>
          ) : (
            <span style={{ fontSize: 9, color: '#4edea3' }}>— fully allocated</span>
          )}
        </div>

        <div style={{ display: 'flex', height: 48, width: '100%', gap: 1 }}>
          {blocks.map(b => (
            <div
              key={b.id}
              onMouseEnter={() => setHovered(b.id)}
              onMouseLeave={() => setHovered(null)}
              title={`${b.name}: ${b.hours}h`}
              style={{
                flex: b.hours,
                background: hovered === b.id ? b.color : b.color,
                opacity: hovered && hovered !== b.id ? 0.45 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                transition: 'opacity 0.15s',
                cursor: 'default',
              }}
            >
              {b.hours >= 1.5 && (
                <span style={{
                  fontSize: 9,
                  color: '#0d1117',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                  padding: '0 4px',
                }}>
                  {b.hours}h
                </span>
              )}
            </div>
          ))}
          {remaining > 0 && (
            <div style={{
              flex: remaining,
              background: 'rgba(255,255,255,0.03)',
              border: '1px dashed rgba(0,212,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {remaining >= 2 && (
                <span style={{ fontSize: 9, color: 'rgba(0,212,255,0.3)', letterSpacing: '0.1em' }}>
                  {remaining}h
                </span>
              )}
            </div>
          )}
        </div>

        {/* Hour ticks */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          {[0, 4, 8, 12, 16, 20, 24].map(h => (
            <span key={h} style={{ fontSize: 9, color: 'rgba(0,212,255,0.3)', letterSpacing: '0.05em' }}>
              {h}h
            </span>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 1, marginBottom: 28 }}>
        {[
          { label: 'ALLOCATED',  value: `${totalHours}h`,  color: '#4edea3' },
          { label: 'REMAINING',  value: `${remaining}h`,   color: remaining > 0 ? '#ffb689' : '#4edea3' },
          { label: 'BLOCKS',     value: blocks.length,      color: '#60a5fa' },
          { label: 'COVERAGE',   value: `${Math.round((totalHours / 24) * 100)}%`, color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1,
            background: '#161b22',
            border: '1px solid rgba(0,212,255,0.06)',
            padding: '12px 14px',
          }}>
            <div style={{ fontSize: 8, color: 'rgba(96,165,250,0.6)', letterSpacing: '0.18em', marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start' }}>

        {/* Left: block list */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 9, color: '#60a5fa', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              TIME BLOCKS
            </span>
            <button
              onClick={() => setAdding(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: adding ? 'rgba(0,212,255,0.08)' : 'transparent',
                border: '1px solid rgba(0,212,255,0.25)',
                color: '#00d4ff', fontSize: 10,
                padding: '5px 10px', cursor: 'pointer',
                letterSpacing: '0.12em', fontFamily: MONO,
              }}
            >
              <Plus size={11} /> ADD BLOCK
            </button>
          </div>

          {/* Add form */}
          {adding && (
            <div style={{
              background: '#161b22',
              border: '1px solid rgba(0,212,255,0.18)',
              padding: 16,
              marginBottom: 10,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#60a5fa', letterSpacing: '0.14em', marginBottom: 5 }}>
                    ACTIVITY NAME
                  </div>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Sleep"
                    onKeyDown={e => e.key === 'Enter' && addBlock()}
                    autoFocus
                    style={{
                      background: '#0d1117',
                      border: '1px solid rgba(0,212,255,0.18)',
                      color: '#e6edf3', fontSize: 12,
                      padding: '8px 10px', fontFamily: MONO,
                      width: '100%', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#60a5fa', letterSpacing: '0.14em', marginBottom: 5 }}>
                    HOURS
                  </div>
                  <input
                    type="number"
                    min="0.5" max="24" step="0.5"
                    value={form.hours}
                    onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addBlock()}
                    placeholder="8"
                    style={{
                      background: '#0d1117',
                      border: '1px solid rgba(0,212,255,0.18)',
                      color: '#e6edf3', fontSize: 12,
                      padding: '8px 10px', fontFamily: MONO,
                      width: '100%', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Color picker */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, color: '#60a5fa', letterSpacing: '0.14em', marginBottom: 7 }}>COLOR</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <div
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{
                        width: 18, height: 18,
                        background: c, cursor: 'pointer',
                        outline: form.color === c ? `2px solid #fff` : '2px solid transparent',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={addBlock}
                  disabled={!form.name.trim() || !form.hours || totalHours + formHours > 24}
                  style={{
                    background: '#00d4ff', color: '#0d1117',
                    border: 'none', fontSize: 11, fontWeight: 800,
                    padding: '8px 20px', cursor: 'pointer',
                    fontFamily: MONO, letterSpacing: '0.12em',
                    opacity: (!form.name.trim() || !form.hours || totalHours + formHours > 24) ? 0.35 : 1,
                  }}
                >
                  ADD
                </button>
                <button
                  onClick={() => setAdding(false)}
                  style={{
                    background: 'transparent', border: '1px solid rgba(255,107,107,0.25)',
                    color: '#ff6b6b', fontSize: 10, padding: '8px 14px',
                    cursor: 'pointer', fontFamily: MONO, letterSpacing: '0.1em',
                  }}
                >
                  CANCEL
                </button>
                {totalHours + formHours > 24 && (
                  <span style={{ fontSize: 10, color: '#ff6b6b' }}>
                    Exceeds 24h
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Block rows */}
          {blocks.length === 0 ? (
            <div style={{
              background: '#161b22',
              border: '1px dashed rgba(0,212,255,0.08)',
              padding: '36px 24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(96,165,250,0.35)', letterSpacing: '0.12em' }}>
                NO BLOCKS YET
              </div>
              <div style={{ fontSize: 10, color: 'rgba(96,165,250,0.2)', marginTop: 4 }}>
                Add a block or pick a preset →
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {blocks.map(b => (
                <div
                  key={b.id}
                  onMouseEnter={() => setHovered(b.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: hovered === b.id ? 'rgba(255,255,255,0.03)' : '#161b22',
                    border: '1px solid rgba(0,212,255,0.06)',
                    borderLeft: `3px solid ${b.color}`,
                    padding: '11px 14px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'background 0.12s',
                  }}
                >
                  <div style={{ width: 8, height: 8, background: b.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#e6edf3', flex: 1 }}>{b.name}</span>
                  <span style={{ fontSize: 12, color: b.color, fontWeight: 700 }}>{b.hours}h</span>
                  <span style={{ fontSize: 9, color: 'rgba(96,165,250,0.4)', minWidth: 28, textAlign: 'right' }}>
                    {Math.round((b.hours / 24) * 100)}%
                  </span>
                  {/* Mini proportion bar */}
                  <div style={{ width: 72, height: 3, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                    <div style={{ width: `${(b.hours / 24) * 100}%`, height: '100%', background: b.color }} />
                  </div>
                  <button
                    onClick={() => removeBlock(b.id)}
                    style={{
                      background: 'transparent', border: 'none',
                      color: 'rgba(255,107,107,0.35)', cursor: 'pointer',
                      padding: 4, display: 'flex', alignItems: 'center',
                      transition: 'color 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,107,107,0.35)'}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: presets */}
        <div>
          <div style={{ fontSize: 9, color: '#60a5fa', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
            QUICK PRESETS
          </div>
          <div style={{ background: '#161b22', border: '1px solid rgba(0,212,255,0.08)' }}>
            {PRESETS.map(p => {
              const already = blocks.find(b => b.name === p.name)
              return (
                <button
                  key={p.name}
                  onClick={() => !already && applyPreset(p)}
                  disabled={!!already}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(0,212,255,0.04)',
                    padding: '9px 12px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    cursor: already ? 'default' : 'pointer',
                    textAlign: 'left', width: '100%',
                    opacity: already ? 0.4 : 1,
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!already) e.currentTarget.style.background = 'rgba(0,212,255,0.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ width: 7, height: 7, background: p.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: already ? 'rgba(200,216,240,0.4)' : '#c8d8f0', fontFamily: MONO }}>
                    {p.name}
                  </span>
                  {already && (
                    <span style={{ fontSize: 9, color: p.color, marginLeft: 'auto' }}>✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
