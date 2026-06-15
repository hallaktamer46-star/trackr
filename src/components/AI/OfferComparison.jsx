import { useState } from 'react'
import { Plus, Trash2, Loader2, Trophy, AlertTriangle, Lightbulb, ChevronDown, RotateCcw } from 'lucide-react'
import { apiFetch } from '../../lib/api'

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
const SANS = 'Geist, Inter, sans-serif'

const LABEL = {
  fontFamily: MONO, fontSize: 9, fontWeight: 600,
  letterSpacing: '0.1em', color: '#8a919f',
  textTransform: 'uppercase', display: 'block', marginBottom: 6,
}
const INPUT = {
  width: '100%', padding: '9px 12px',
  background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)',
  color: '#e2e2e8', fontSize: 12, outline: 'none', fontFamily: SANS,
  boxSizing: 'border-box',
}

const CAREER_GOALS = [
  { key: 'Maximise salary',       icon: '💰', desc: 'Total comp is the priority'         },
  { key: 'Career growth',         icon: '🚀', desc: 'Learning, progression, trajectory'  },
  { key: 'Work-life balance',     icon: '⚖️',  desc: 'Flexibility, remote, commute'       },
  { key: 'Stability',             icon: '🏛️',  desc: 'Job security, established company' },
]

const REMOTE_OPTIONS = ['Full remote', 'Hybrid', 'On-site']
const COMPANY_SIZES  = ['Startup', 'SME', 'Enterprise']
const BENEFITS_LIST  = ['Health insurance', 'Pension / 401k', 'Gym / wellness', 'Stock options', 'Learning budget', 'Parental leave']

const accentFor = (i) => ['#a3c9ff', '#4edea3', '#ffb689', '#ffb4ab'][i] || '#a3c9ff'

const emptyOffer = (i) => ({
  company: '', jobTitle: '', baseSalary: '', currency: 'USD',
  location: '', bonus: '', equity: '',
  benefits: [], remotePolicy: 'Hybrid',
  companySize: 'SME', industry: '', roleLevel: '',
  commute: '', notes: '',
  _accent: accentFor(i),
})

// ── small field ───────────────────────────────────────────────────
function F({ label, value, onChange, placeholder = '', type = 'text', half }) {
  return (
    <div style={{ flex: half ? '1 1 calc(50% - 6px)' : '1 1 100%', minWidth: 0 }}>
      <label style={LABEL}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={INPUT} />
    </div>
  )
}

// ── pill toggle ───────────────────────────────────────────────────
function Pills({ options, value, onChange, accent }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{
          padding: '5px 12px', fontFamily: MONO, fontSize: 9, fontWeight: 700,
          letterSpacing: '0.05em', cursor: 'pointer', textTransform: 'uppercase',
          background: value === o ? `${accent}18` : 'transparent',
          border: `0.5px solid ${value === o ? accent + '60' : 'rgba(138,145,159,0.2)'}`,
          color: value === o ? accent : '#8a919f',
        }}>{o}</button>
      ))}
    </div>
  )
}

// ── score ring ────────────────────────────────────────────────────
function Ring({ score, accent, size = 72 }) {
  const r = size / 2 - 6
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(48,54,61,0.5)" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={accent} strokeWidth={5}
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="butt"
        style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        style={{ fill: accent, fontSize: size * 0.24, fontFamily: MONO, fontWeight: 700,
          transform: `rotate(90deg)`, transformOrigin: `${size/2}px ${size/2}px` }}>
        {score}
      </text>
    </svg>
  )
}

// ── metric bar ────────────────────────────────────────────────────
function Bar({ label, score, comment, accent }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: MONO, fontSize: 9, color: '#8a919f', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: accent }}>{score}</span>
      </div>
      <div style={{ height: 2, background: 'rgba(48,54,61,0.6)', marginBottom: 4 }}>
        <div style={{ height: '100%', width: `${score}%`, background: accent, transition: 'width 1s ease' }} />
      </div>
      <p style={{ fontSize: 11, color: '#8a919f', lineHeight: 1.4, fontFamily: SANS }}>{comment}</p>
    </div>
  )
}

// ── offer input card ──────────────────────────────────────────────
function OfferCard({ offer, index, onChange, onRemove, canRemove }) {
  const [open, setOpen] = useState(true)
  const accent = offer._accent
  const u = (key) => (val) => onChange({ ...offer, [key]: val })
  const toggleBenefit = (b) => {
    const has = offer.benefits.includes(b)
    u('benefits')(has ? offer.benefits.filter(x => x !== b) : [...offer.benefits, b])
  }

  return (
    <div style={{ border: `0.5px solid ${accent}30`, background: '#0d1117', marginBottom: 2 }}>
      {/* Card header */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', cursor: 'pointer',
          borderLeft: `3px solid ${accent}`,
          background: open ? `${accent}08` : 'transparent',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${accent}18`, border: `0.5px solid ${accent}40`,
            fontFamily: MONO, fontSize: 10, fontWeight: 700, color: accent,
          }}>{index + 1}</div>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: offer.company ? '#e2e2e8' : '#404753' }}>
            {offer.company || `Offer ${index + 1}`}
          </span>
          {offer.baseSalary && (
            <span style={{ fontFamily: MONO, fontSize: 10, color: '#8a919f' }}>{offer.currency} {Number(offer.baseSalary).toLocaleString()}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {canRemove && (
            <button onClick={e => { e.stopPropagation(); onRemove() }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#404753', padding: 4 }}>
              <Trash2 size={13} />
            </button>
          )}
          <ChevronDown size={13} style={{ color: '#8a919f', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </div>

      {open && (
        <div style={{ padding: '16px 18px' }}>
          {/* Row 1 */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <F half label="Company Name *" value={offer.company}   onChange={u('company')}   placeholder="e.g. Google" />
            <F half label="Job Title"      value={offer.jobTitle}  onChange={u('jobTitle')}  placeholder="e.g. Product Manager" />
          </div>
          {/* Row 2 — salary */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ flex: '0 0 80px' }}>
              <label style={LABEL}>Currency</label>
              <select value={offer.currency} onChange={e => u('currency')(e.target.value)}
                style={{ ...INPUT, padding: '9px 8px' }}>
                {['USD','GBP','EUR','CAD','AUD','AED','SGD'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <F half label="Base Salary"  value={offer.baseSalary} onChange={u('baseSalary')} placeholder="85000"  type="number" />
            <F half label="Bonus"        value={offer.bonus}      onChange={u('bonus')}      placeholder="10% or $8,000" />
            <F half label="Equity / Stock" value={offer.equity}   onChange={u('equity')}     placeholder="$50k RSU or 0.5%" />
          </div>
          {/* Row 3 */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <F half label="Location"      value={offer.location}  onChange={u('location')}  placeholder="San Francisco, CA" />
            <F half label="Industry"      value={offer.industry}  onChange={u('industry')}  placeholder="FinTech, SaaS…" />
            <F half label="Role Level"    value={offer.roleLevel} onChange={u('roleLevel')} placeholder="IC4 / Manager / L6…" />
            <F half label="Commute (min/day)" value={offer.commute} onChange={u('commute')} placeholder="0 if remote" type="number" />
          </div>
          {/* Remote */}
          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Remote Policy</label>
            <Pills options={REMOTE_OPTIONS} value={offer.remotePolicy} onChange={u('remotePolicy')} accent={accent} />
          </div>
          {/* Company size */}
          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Company Size</label>
            <Pills options={COMPANY_SIZES} value={offer.companySize} onChange={u('companySize')} accent={accent} />
          </div>
          {/* Benefits */}
          <div style={{ marginBottom: 14 }}>
            <label style={LABEL}>Benefits Included</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {BENEFITS_LIST.map(b => {
                const on = offer.benefits.includes(b)
                return (
                  <button key={b} onClick={() => toggleBenefit(b)} style={{
                    padding: '5px 12px', fontFamily: MONO, fontSize: 9, fontWeight: 600,
                    letterSpacing: '0.04em', cursor: 'pointer',
                    background: on ? `${accent}14` : 'transparent',
                    border: `0.5px solid ${on ? accent + '50' : 'rgba(138,145,159,0.2)'}`,
                    color: on ? accent : '#8a919f',
                  }}>{b}</button>
                )
              })}
            </div>
          </div>
          {/* Notes */}
          <div>
            <label style={LABEL}>Notes / Gut Feel</label>
            <textarea value={offer.notes} onChange={e => u('notes')(e.target.value)}
              placeholder="Culture impressions, team vibes, concerns, anything that doesn't fit above…"
              rows={2} style={{ ...INPUT, resize: 'vertical' }} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── results ───────────────────────────────────────────────────────
function Results({ data, offerInputs, onReset }) {
  const accentMap = {}
  offerInputs.forEach((o, i) => { accentMap[o.company] = accentFor(i) })
  const getAccent = (company) => accentMap[company] || '#a3c9ff'

  return (
    <div style={{ fontFamily: SANS }}>

      {/* Winner banner */}
      <div style={{
        padding: '20px 24px', marginBottom: 2,
        background: `linear-gradient(135deg, ${getAccent(data.winner)}12 0%, #0c1d35 100%)`,
        border: `0.5px solid ${getAccent(data.winner)}30`,
        borderLeft: `3px solid ${getAccent(data.winner)}`,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <Trophy size={22} style={{ color: getAccent(data.winner), flexShrink: 0 }} />
        <div>
          <p style={{ fontFamily: MONO, fontSize: 9, color: getAccent(data.winner), letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
            Best Overall Offer
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#e2e2e8', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {data.winner}
          </p>
          <p style={{ fontSize: 12, color: '#8a919f', lineHeight: 1.5 }}>{data.winnerReason}</p>
        </div>
      </div>

      {/* Per-offer columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${data.offers.length}, 1fr)`,
        gap: 2, marginBottom: 2,
      }}>
        {data.offers.map((o, i) => {
          const accent = getAccent(o.company)
          const isWinner = o.company === data.winner
          return (
            <div key={i} style={{
              background: '#0d1117',
              border: `0.5px solid ${isWinner ? accent + '40' : 'rgba(48,54,61,0.9)'}`,
              borderTop: `2px solid ${isWinner ? accent : 'transparent'}`,
              padding: '20px 18px',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Ring score={o.totalCompScore} accent={accent} size={64} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#e2e2e8', marginBottom: 2 }}>{o.company}</p>
                  <p style={{ fontFamily: MONO, fontSize: 10, color: accent }}>{o.totalComp}</p>
                  {isWinner && (
                    <span style={{
                      display: 'inline-block', marginTop: 4,
                      fontFamily: MONO, fontSize: 7, fontWeight: 700, letterSpacing: '0.06em',
                      background: accent, color: '#0d1117', padding: '2px 6px',
                    }}>BEST PICK</span>
                  )}
                </div>
              </div>

              {/* Score bars */}
              <div style={{ marginBottom: 16 }}>
                {Object.entries(o.scores).map(([key, val]) => (
                  <Bar key={key} label={key} score={val.score} comment={val.comment} accent={accent} />
                ))}
              </div>

              {/* Pros */}
              <div style={{ marginBottom: 12 }}>
                <p style={{ ...LABEL, color: '#4edea3', marginBottom: 8 }}>Pros</p>
                {o.pros.map((p, pi) => (
                  <div key={pi} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: '#4edea3', flexShrink: 0, fontSize: 12, lineHeight: 1.5 }}>✓</span>
                    <p style={{ fontSize: 11, color: '#c0c7d5', lineHeight: 1.5 }}>{p}</p>
                  </div>
                ))}
              </div>

              {/* Cons */}
              <div style={{ marginBottom: 12 }}>
                <p style={{ ...LABEL, color: '#ffb4ab', marginBottom: 8 }}>Cons</p>
                {o.cons.map((c, ci) => (
                  <div key={ci} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: '#ffb4ab', flexShrink: 0, fontSize: 12, lineHeight: 1.5 }}>✕</span>
                    <p style={{ fontSize: 11, color: '#c0c7d5', lineHeight: 1.5 }}>{c}</p>
                  </div>
                ))}
              </div>

              {/* Watch out */}
              {o.watchOut && (
                <div style={{
                  padding: '10px 12px', marginBottom: 10,
                  background: 'rgba(255,182,137,0.05)', border: '0.5px solid rgba(255,182,137,0.2)',
                }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <AlertTriangle size={11} style={{ color: '#ffb689', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 11, color: '#ffb689', lineHeight: 1.5 }}>{o.watchOut}</p>
                  </div>
                </div>
              )}

              {/* Negotiation tip */}
              {o.negotiationTip && (
                <div style={{
                  padding: '10px 12px',
                  background: 'rgba(163,201,255,0.04)', border: '0.5px solid rgba(163,201,255,0.15)',
                }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <Lightbulb size={11} style={{ color: '#a3c9ff', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 11, color: '#a3c9ff', lineHeight: 1.5 }}>{o.negotiationTip}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Head to head table */}
      {data.headToHead?.length > 0 && (
        <div style={{ background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', marginBottom: 2 }}>
          <div style={{ padding: '14px 20px', borderBottom: '0.5px solid rgba(48,54,61,0.6)' }}>
            <p style={{ ...LABEL, color: '#a3c9ff', margin: 0 }}>Head-to-Head</p>
          </div>
          {data.headToHead.map((row, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '11px 20px',
              borderBottom: i < data.headToHead.length - 1 ? '0.5px solid rgba(48,54,61,0.4)' : 'none',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
            }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: '#8a919f', textTransform: 'uppercase', letterSpacing: '0.06em', width: 120, flexShrink: 0 }}>{row.category}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: getAccent(row.winner), width: 100, flexShrink: 0 }}>{row.winner}</span>
              <span style={{ fontSize: 11, color: '#8a919f', lineHeight: 1.4 }}>{row.reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Verdict */}
      <div style={{
        padding: '20px 24px', marginBottom: 2,
        background: '#0c1d35', border: '0.5px solid rgba(20,60,110,0.5)',
      }}>
        <p style={{ ...LABEL, color: '#4edea3', marginBottom: 10 }}>Bottom Line</p>
        <p style={{ fontSize: 13, color: '#c0c7d5', lineHeight: 1.7 }}>{data.verdict}</p>
      </div>

      <button onClick={onReset} style={{
        width: '100%', padding: '12px 0',
        background: 'rgba(163,201,255,0.06)', border: '0.5px solid rgba(163,201,255,0.2)',
        color: '#a3c9ff', fontFamily: MONO, fontSize: 11, fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <RotateCcw size={12} /> Compare New Offers
      </button>
    </div>
  )
}

// ── main ──────────────────────────────────────────────────────────
export default function OfferComparison() {
  const [offers, setOffers]         = useState([emptyOffer(0), emptyOffer(1)])
  const [careerGoal, setCareerGoal] = useState('Career growth')
  const [yearsExp, setYearsExp]     = useState('')
  const [location, setLocation]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [result, setResult]         = useState(null)

  const updateOffer = (i, val) => setOffers(o => o.map((x, idx) => idx === i ? val : x))
  const removeOffer = (i)      => setOffers(o => o.filter((_, idx) => idx !== i))
  const addOffer    = ()       => setOffers(o => [...o, emptyOffer(o.length)])

  const compare = async () => {
    const valid = offers.filter(o => o.company.trim() && o.baseSalary)
    if (valid.length < 2) { setError('Fill in at least 2 offers with a company name and salary.'); return }
    setLoading(true); setError(null)
    try {
      const res = await apiFetch('/api/ai/compare-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offers: valid, careerGoal, yearsExp, location }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult({ data, offerInputs: valid })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setOffers([emptyOffer(0), emptyOffer(1)])
    setResult(null); setError(null)
  }

  if (result) return <Results data={result.data} offerInputs={result.offerInputs} onReset={reset} />

  return (
    <div style={{ fontFamily: SANS }}>

      {/* Offers */}
      {offers.map((offer, i) => (
        <OfferCard
          key={i} offer={offer} index={i}
          onChange={val => updateOffer(i, val)}
          onRemove={() => removeOffer(i)}
          canRemove={offers.length > 2}
        />
      ))}

      {offers.length < 4 && (
        <button onClick={addOffer} style={{
          width: '100%', padding: '10px 0', marginBottom: 16,
          background: 'transparent', border: '0.5px dashed rgba(163,201,255,0.25)',
          color: '#a3c9ff', fontFamily: MONO, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Plus size={12} /> Add Another Offer
        </button>
      )}

      {/* Career goal */}
      <div style={{ background: '#0c1d35', border: '0.5px solid rgba(20,60,110,0.5)', padding: '20px 24px', marginBottom: 2 }}>
        <label style={{ ...LABEL, color: '#a3c9ff', marginBottom: 14 }}>What matters most to you?</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {CAREER_GOALS.map(g => (
            <button key={g.key} onClick={() => setCareerGoal(g.key)} style={{
              padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
              background: careerGoal === g.key ? 'rgba(163,201,255,0.08)' : 'rgba(138,145,159,0.04)',
              border: `0.5px solid ${careerGoal === g.key ? 'rgba(163,201,255,0.4)' : 'rgba(138,145,159,0.15)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 16 }}>{g.icon}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: careerGoal === g.key ? '#a3c9ff' : '#c0c7d5', letterSpacing: '0.04em' }}>{g.key}</span>
              </div>
              <p style={{ fontFamily: MONO, fontSize: 9, color: '#404753', letterSpacing: '0.02em', paddingLeft: 24 }}>{g.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Context */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 16 }}>
        <div style={{ background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', padding: '16px 20px' }}>
          <label style={LABEL}>Your Location</label>
          <input value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. London, UK" style={INPUT} />
        </div>
        <div style={{ background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', padding: '16px 20px' }}>
          <label style={LABEL}>Years of Experience</label>
          <input type="number" value={yearsExp} onChange={e => setYearsExp(e.target.value)}
            placeholder="e.g. 5" style={INPUT} />
        </div>
      </div>

      {error && (
        <p style={{ fontFamily: MONO, fontSize: 11, color: '#ffb4ab', marginBottom: 12 }}>{error}</p>
      )}

      <button onClick={compare} disabled={loading} style={{
        width: '100%', padding: '13px 0',
        background: loading ? 'rgba(163,201,255,0.1)' : '#1493ff',
        border: 'none', color: loading ? '#8a919f' : '#fff',
        fontFamily: MONO, fontSize: 12, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        cursor: loading ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        {loading
          ? <><Loader2 size={14} className="animate-spin" /> Comparing offers…</>
          : <><Trophy size={14} /> Compare Offers</>
        }
      </button>
    </div>
  )
}
