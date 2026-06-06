import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame, TrendingUp, Target, Calendar, Zap, Star,
  Award, BarChart3, ArrowRight, Clock, ChevronLeft, ChevronRight
} from 'lucide-react'
import {
  format, subDays, startOfDay, isSameDay, parseISO,
  eachDayOfInterval, startOfWeek, addDays, isToday,
  differenceInDays, getDay
} from 'date-fns'
import { useApplications } from '../contexts/ApplicationContext'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

/* ── colour scale: 0 → 5+ applications ── */
const SCALE = [
  { min: 0,  max: 0,  color: 'rgba(163,201,255,0.04)', glow: null,                border: 'rgba(163,201,255,0.06)' },
  { min: 1,  max: 1,  color: 'rgba(99,102,241,0.35)',  glow: null,                border: 'rgba(99,102,241,0.4)'   },
  { min: 2,  max: 2,  color: 'rgba(139,92,246,0.55)',  glow: null,                border: 'rgba(139,92,246,0.5)'   },
  { min: 3,  max: 3,  color: 'rgba(168,85,247,0.75)',  glow: null,                border: 'rgba(168,85,247,0.6)'   },
  { min: 4,  max: 4,  color: 'rgba(192,132,252,0.9)',  glow: 'rgba(192,132,252,0.4)', border: '#c084fc'            },
  { min: 5,  max: 99, color: '#e879f9',                glow: 'rgba(232,121,249,0.6)', border: '#f0abfc'            },
]

function getScale(count) {
  return SCALE.find(s => count >= s.min && count <= s.max) || SCALE[0]
}

/* ── build 52-week grid ── */
function buildGrid(applications) {
  const today    = startOfDay(new Date())
  const gridStart= startOfDay(subDays(today, 363)) // 52 weeks back
  const days     = eachDayOfInterval({ start: gridStart, end: today })

  // count apps per day
  const countMap = {}
  applications.forEach(a => {
    const d = a.date_applied || a.created_at
    if (!d) return
    try {
      const key = format(startOfDay(parseISO(d)), 'yyyy-MM-dd')
      countMap[key] = (countMap[key] || 0) + 1
    } catch {}
  })

  // group into weeks (columns)
  const weeks = []
  let week = []
  // pad start so first day aligns to its weekday
  const firstDOW = getDay(gridStart) // 0=Sun
  for (let i = 0; i < firstDOW; i++) week.push(null)
  days.forEach(day => {
    const key   = format(day, 'yyyy-MM-dd')
    const count = countMap[key] || 0
    week.push({ date: day, key, count })
    if (week.length === 7) { weeks.push(week); week = [] }
  })
  if (week.length) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return { weeks, countMap }
}

/* ── streak helpers ── */
function calcStreaks(applications) {
  const today = startOfDay(new Date())
  const dateSet = new Set(
    applications
      .map(a => a.date_applied || a.created_at)
      .filter(Boolean)
      .map(d => { try { return format(startOfDay(parseISO(d)), 'yyyy-MM-dd') } catch { return null } })
      .filter(Boolean)
  )

  let current = 0, longest = 0, temp = 0
  // current streak: count backwards from today
  for (let i = 0; i < 365; i++) {
    const key = format(subDays(today, i), 'yyyy-MM-dd')
    if (dateSet.has(key)) { current++; if (i === 0 || current > 0) {} }
    else break
  }
  // longest streak
  const allDays = Array.from({ length: 365 }, (_, i) => format(subDays(today, 364 - i), 'yyyy-MM-dd'))
  allDays.forEach(key => {
    if (dateSet.has(key)) { temp++; longest = Math.max(longest, temp) }
    else temp = 0
  })
  return { current, longest }
}

/* ── tooltip ── */
function Tooltip({ day, x, y }) {
  if (!day) return null
  const s = getScale(day.count)
  return (
    <div style={{
      position: 'fixed', left: x + 10, top: y - 40, zIndex: 200,
      background: 'rgba(7,13,26,0.96)', border: `0.5px solid ${day.count > 0 ? s.border : 'rgba(163,201,255,0.12)'}`,
      padding: '6px 12px', pointerEvents: 'none',
      boxShadow: day.count > 0 ? `0 4px 20px ${s.glow || 'rgba(0,0,0,0.4)'}` : '0 4px 16px rgba(0,0,0,0.4)',
      animation: 'tipIn 0.12s ease both',
      whiteSpace: 'nowrap',
    }}>
      <p style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: day.count > 0 ? s.color : '#5a6478', marginBottom: 2 }}>
        {day.count > 0 ? `${day.count} application${day.count > 1 ? 's' : ''}` : 'No applications'}
      </p>
      <p style={{ fontFamily: MONO, fontSize: 8, color: '#5a6478' }}>{format(day.date, 'EEEE, MMM d yyyy')}</p>
    </div>
  )
}

/* ── animated count-up ── */
function CountUp({ target, duration = 1200, suffix = '' }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target])
  return <>{val}{suffix}</>
}

/* ── stat card ── */
function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, padding: '16px 18px',
        background: hov ? `linear-gradient(145deg,${color}14,rgba(7,13,22,0.98))` : 'rgba(13,18,32,0.97)',
        border: `0.5px solid ${hov ? color + '45' : color + '18'}`,
        borderTop: `2px solid ${color}`,
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? `0 8px 32px rgba(0,0,0,0.4), 0 0 28px ${color}18` : 'none',
        transition: 'all 0.22s cubic-bezier(0.34,1.4,0.64,1)',
        animation: `cardIn 0.5s ease ${delay}s both`,
        cursor: 'default',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Icon size={13} style={{ color, filter: hov ? `drop-shadow(0 0 6px ${color})` : 'none', transition: 'filter 0.2s' }}/>
        <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: `${color}90`, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <p style={{ fontFamily: MONO, fontSize: 30, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 4, background: `linear-gradient(135deg,#e2e2e8,${color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: `drop-shadow(0 0 10px ${color}50)` }}>
        <CountUp target={typeof value === 'number' ? value : 0} suffix={typeof value === 'string' && !Number(value) ? value : ''}/>
        {typeof value === 'string' ? value.replace(/[0-9]/g, '') : ''}
      </p>
      {sub && <p style={{ fontFamily: MONO, fontSize: 9, color: '#3a4455' }}>{sub}</p>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
export default function ActivityHeatmap() {
  const { applications } = useApplications()
  const navigate = useNavigate()
  const [tooltip, setTooltip] = useState(null) // { day, x, y }
  const [hovWeek, setHovWeek] = useState(null)
  const containerRef = useRef(null)

  const { weeks, countMap } = useMemo(() => buildGrid(applications), [applications])
  const { current, longest } = useMemo(() => calcStreaks(applications), [applications])

  const totalDays  = useMemo(() => Object.keys(countMap).filter(k => countMap[k] > 0).length, [countMap])
  const totalApps  = applications.length
  const maxDay     = useMemo(() => Math.max(0, ...Object.values(countMap)), [countMap])
  const bestDayKey = useMemo(() => Object.entries(countMap).sort((a,b) => b[1]-a[1])[0]?.[0], [countMap])
  const bestDayLabel = bestDayKey ? format(parseISO(bestDayKey), 'MMM d') : '—'

  // month labels: find which week starts each month
  const monthLabels = useMemo(() => {
    const labels = []
    weeks.forEach((week, wi) => {
      const firstReal = week.find(d => d)
      if (!firstReal) return
      const d = firstReal.date
      if (wi === 0 || format(d, 'M') !== format(weeks[wi-1].find(x=>x)?.date || d, 'M')) {
        labels.push({ wi, label: format(d, 'MMM') })
      }
    })
    return labels
  }, [weeks])

  const CELL = 11, GAP = 3

  return (
    <div style={{ fontFamily: SANS, maxWidth: 1100, margin: '0 auto', paddingTop: 4 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', color: '#e2e2e8', marginBottom: 6 }}>
            Activity Heatmap
          </h1>
          <p style={{ fontFamily: MONO, fontSize: 10, color: '#5a6478' }}>
            Every day you applied — visualised. Build the streak, own the board.
          </p>
        </div>
        <button onClick={() => navigate('/board')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: 'rgba(163,201,255,0.06)', border: '0.5px solid rgba(163,201,255,0.2)', color: '#a3c9ff', fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(163,201,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(163,201,255,0.06)'}>
          Open Board <ArrowRight size={11}/>
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <StatCard icon={Target}    label="Total Apps"     value={totalApps} sub="tracked applications"          color="#a3c9ff" delay={0.05}/>
        <StatCard icon={Flame}     label="Current Streak" value={current}   sub={current > 0 ? 'days in a row' : 'start today!'} color="#f97316" delay={0.1}/>
        <StatCard icon={Award}     label="Best Streak"    value={longest}   sub="days — personal best"          color="#c084fc" delay={0.15}/>
        <StatCard icon={Calendar}  label="Active Days"    value={totalDays} sub="days with applications"        color="#4edea3" delay={0.2}/>
        <StatCard icon={Star}      label="Best Day"       value={maxDay}    sub={maxDay > 0 ? `${bestDayLabel} — most in one day` : 'apply today!'} color="#fbbf24" delay={0.25}/>
      </div>

      {/* ── Heatmap ── */}
      <div style={{
        background: 'linear-gradient(145deg,rgba(10,16,36,0.98),rgba(7,11,24,0.99))',
        border: '0.5px solid rgba(163,201,255,0.1)',
        padding: '24px 24px 20px',
        boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
        animation: 'cardIn 0.6s ease 0.3s both',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* top shimmer line */}
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(192,132,252,0.3),rgba(163,201,255,0.2),transparent)', pointerEvents: 'none' }}/>

        {/* ambient glow */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(192,132,252,0.08),transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }}/>

        {/* header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: '#5a6478', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>52-Week Activity Grid</p>
            <p style={{ fontFamily: MONO, fontSize: 12, fontWeight: 800, color: '#e2e2e8' }}>
              {format(subDays(new Date(), 363), 'MMM d yyyy')} — {format(new Date(), 'MMM d yyyy')}
            </p>
          </div>
          {/* scale legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: 8, color: '#3a4455' }}>Less</span>
            {SCALE.map((s, i) => (
              <div key={i} style={{
                width: CELL, height: CELL,
                background: s.color,
                border: `0.5px solid ${s.border}`,
                boxShadow: s.glow ? `0 0 6px ${s.glow}` : 'none',
              }}/>
            ))}
            <span style={{ fontFamily: MONO, fontSize: 8, color: '#3a4455' }}>More</span>
          </div>
        </div>

        {/* day-of-week labels */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 4 }}>
          <div style={{ width: 26, flexShrink: 0 }}/>
          {/* empty spacer for labels column */}
        </div>

        <div style={{ display: 'flex', gap: 0 }}>
          {/* DOW labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginRight: 6, paddingTop: 18 }}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d, i) => (
              <div key={d} style={{ height: CELL, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: 7, color: i % 2 === 1 ? '#3a4455' : 'transparent', width: 16 }}>{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {/* Month labels */}
            <div style={{ display: 'flex', gap: GAP, marginBottom: 4, paddingLeft: 0 }}>
              {weeks.map((_, wi) => {
                const ml = monthLabels.find(m => m.wi === wi)
                return (
                  <div key={wi} style={{ width: CELL, flexShrink: 0, fontFamily: MONO, fontSize: 7, color: ml ? '#5a6478' : 'transparent', whiteSpace: 'nowrap', overflow: 'visible' }}>
                    {ml ? ml.label : ''}
                  </div>
                )
              })}
            </div>

            {/* Cells */}
            <div style={{ display: 'flex', gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                  {week.map((day, di) => {
                    if (!day) return <div key={di} style={{ width: CELL, height: CELL }}/>
                    const s = getScale(day.count)
                    const isTod = isToday(day.date)
                    const isHov = tooltip?.day?.key === day.key
                    return (
                      <div
                        key={day.key}
                        onMouseEnter={e => setTooltip({ day, x: e.clientX, y: e.clientY })}
                        onMouseMove={e  => setTooltip(t => t ? ({ ...t, x: e.clientX, y: e.clientY }) : null)}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          width: CELL, height: CELL,
                          background: s.color,
                          border: `0.5px solid ${isTod ? '#a3c9ff' : s.border}`,
                          boxShadow: isHov && s.glow ? `0 0 10px ${s.glow}` : s.glow && day.count > 0 ? `0 0 5px ${s.glow}60` : 'none',
                          transform: isHov ? 'scale(1.35)' : 'scale(1)',
                          transition: 'transform 0.15s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.15s',
                          cursor: 'default',
                          animation: `cellIn 0.4s ease ${(wi * 0.005 + di * 0.002).toFixed(3)}s both`,
                          outline: isTod ? '0.5px solid rgba(163,201,255,0.6)' : 'none',
                          outlineOffset: 1,
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* streak badge */}
        {current > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '8px 14px', background: 'rgba(249,115,22,0.08)', border: '0.5px solid rgba(249,115,22,0.25)', width: 'fit-content', animation: 'cardIn 0.5s ease 0.5s both' }}>
            <Flame size={13} style={{ color: '#f97316', filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.6))', animation: 'flamePulse 1.5s ease-in-out infinite' }}/>
            <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 800, color: '#f97316', letterSpacing: '0.06em' }}>
              {current}-day streak
            </span>
            <span style={{ fontFamily: MONO, fontSize: 9, color: '#5a6478' }}>· Keep it going 🔥</span>
          </div>
        )}
      </div>

      {/* ── Monthly breakdown ── */}
      <MonthlyBars applications={applications}/>

      {tooltip && <Tooltip day={tooltip.day} x={tooltip.x} y={tooltip.y}/>}

      <style>{`
        @keyframes cardIn   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes cellIn   { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }
        @keyframes tipIn    { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
        @keyframes flamePulse { 0%,100%{filter:drop-shadow(0 0 4px rgba(249,115,22,0.5))} 50%{filter:drop-shadow(0 0 10px rgba(249,115,22,0.9))} }
      `}</style>
    </div>
  )
}

/* ── Monthly bar chart ── */
function MonthlyBars({ applications }) {
  const data = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = subDays(new Date(), (5 - i) * 30)
      const label = format(d, 'MMM')
      const year  = format(d, 'yyyy')
      const month = format(d, 'M')
      const count = applications.filter(a => {
        const src = a.date_applied || a.created_at
        if (!src) return false
        try { const p = parseISO(src); return format(p,'M') === month && format(p,'yyyy') === year }
        catch { return false }
      }).length
      return { label, count }
    })
    return months
  }, [applications])

  const max = Math.max(1, ...data.map(d => d.count))

  return (
    <div style={{ marginTop: 12, background: 'rgba(13,18,32,0.97)', border: '0.5px solid rgba(163,201,255,0.08)', padding: '18px 22px', animation: 'cardIn 0.5s ease 0.4s both' }}>
      <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#5a6478', textTransform: 'uppercase', marginBottom: 14 }}>Last 6 Months</p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 80 }}>
        {data.map((m, i) => {
          const [hov, setHov] = [useState(false), useState(false)]
          const h = max > 0 ? Math.max(4, (m.count / max) * 72) : 4
          const colors = ['#a3c9ff','#c084fc','#e879f9','#f97316','#4edea3','#fbbf24']
          const c = colors[i % colors.length]
          return (
            <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'default' }}>
              <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: m.count > 0 ? c : '#2a3040', transition: 'color 0.2s' }}>{m.count}</span>
              <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: 72 }}>
                <div
                  onMouseEnter={e => e.currentTarget.style.filter='brightness(1.3)'}
                  onMouseLeave={e => e.currentTarget.style.filter='none'}
                  style={{
                    width: '100%', height: h,
                    background: m.count > 0 ? `linear-gradient(180deg, ${c}, ${c}66)` : 'rgba(255,255,255,0.04)',
                    boxShadow: m.count > 0 ? `0 0 12px ${c}40` : 'none',
                    transition: 'filter 0.18s',
                    animation: `barIn 0.6s cubic-bezier(0.34,1.4,0.64,1) ${0.4 + i * 0.06}s both`,
                  }}
                />
              </div>
              <span style={{ fontFamily: MONO, fontSize: 8, color: '#3a4455' }}>{m.label}</span>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes barIn { from{transform:scaleY(0);transform-origin:bottom} to{transform:scaleY(1);transform-origin:bottom} }`}</style>
    </div>
  )
}
