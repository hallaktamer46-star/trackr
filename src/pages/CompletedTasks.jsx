import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ArrowLeft, Calendar } from 'lucide-react'
import { format, parseISO, isWithinInterval, subDays, startOfDay } from 'date-fns'

const MONO = 'Consolas, Menlo, Monaco, monospace'
const SANS = 'Geist, Inter, sans-serif'
const BG   = '#070a0f'

const PRIORITY_COLOR = { high: '#ffb4ab', medium: '#ffb689', low: '#4edea3' }
const PRIORITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' }

export default function CompletedTasks() {
  const navigate = useNavigate()

  const tasks = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('trackr_tasks') || '[]') } catch { return [] }
  }, [])

  const cutoff = startOfDay(subDays(new Date(), 30))

  const completed = useMemo(() => {
    return tasks
      .filter(t => {
        if (!t.done) return false
        if (t.completedAt) {
          return parseISO(t.completedAt) >= cutoff
        }
        return true
      })
      .sort((a, b) => {
        const da = a.completedAt ? parseISO(a.completedAt) : new Date(0)
        const db = b.completedAt ? parseISO(b.completedAt) : new Date(0)
        return db - da
      })
  }, [tasks])

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: SANS, margin: '-12px -24px', padding: '48px 48px 100px' }}>
      <style>{`html,body,#root,#root>div,#root>div>div{background:${BG}!important}`}</style>

      <button onClick={() => navigate('/')}
        style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', color:'rgba(163,201,255,0.45)', cursor:'pointer', fontFamily:MONO, fontSize:11, marginBottom:32, padding:0 }}
        onMouseEnter={e => e.currentTarget.style.color='#a3c9ff'}
        onMouseLeave={e => e.currentTarget.style.color='rgba(163,201,255,0.45)'}>
        <ArrowLeft size={13}/> Back to Home
      </button>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <CheckCircle2 size={20} color="#4edea3"/>
            <h1 style={{ fontFamily:MONO, fontSize:22, fontWeight:900, color:'#e2e2e8', letterSpacing:'-0.03em', margin:0 }}>Completed Tasks</h1>
          </div>
          <p style={{ fontFamily:MONO, fontSize:11, color:'rgba(163,201,255,0.35)', letterSpacing:'0.04em' }}>
            Last 30 days · {completed.length} task{completed.length !== 1 ? 's' : ''}
          </p>
        </div>

        {completed.length === 0 ? (
          <div style={{ textAlign:'center', paddingTop:80 }}>
            <CheckCircle2 size={36} color="rgba(163,201,255,0.1)" style={{ marginBottom:16 }}/>
            <p style={{ fontFamily:MONO, fontSize:12, color:'rgba(163,201,255,0.25)' }}>No completed tasks in the last 30 days.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {completed.map(t => (
              <div key={t.id} style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'12px 16px',
                background:'rgba(78,222,163,0.03)',
                border:'0.5px solid rgba(78,222,163,0.08)',
                transition:'background 0.12s',
              }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(78,222,163,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(78,222,163,0.03)'}
              >
                <CheckCircle2 size={15} color="#4edea3" style={{ flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:500, color:'#8a919f', textDecoration:'line-through', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {t.title}
                  </p>
                  {t.note && (
                    <p style={{ fontFamily:MONO, fontSize:10, color:'rgba(163,201,255,0.3)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {t.note}
                    </p>
                  )}
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3, flexShrink:0 }}>
                  {t.priority && (
                    <span style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color: PRIORITY_COLOR[t.priority], letterSpacing:'0.06em', textTransform:'uppercase' }}>
                      {PRIORITY_LABEL[t.priority]}
                    </span>
                  )}
                  {t.completedAt && (
                    <span style={{ fontFamily:MONO, fontSize:9, color:'rgba(163,201,255,0.25)', display:'flex', alignItems:'center', gap:4 }}>
                      <Calendar size={9}/> {format(parseISO(t.completedAt), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
