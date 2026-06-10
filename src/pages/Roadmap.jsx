import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BackToHome from '../components/BackToHome'
import {
  Briefcase, BookOpen, Activity, DollarSign, Heart, Plane,
  Dumbbell, Coffee, Music, Plus, X, Target, Star, Sunset, Brain,
  Salad, Flag, Trash2, ArrowUpRight, Check, MapPin
} from 'lucide-react'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

function useLocalStorage(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init } catch { return init }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }, [key, v])
  return [v, setV]
}

const DEFAULT_PATHS = [
  {
    id: 'career', label: 'Career', icon: 'Briefcase', color: '#60a5fa',
    nodes: [
      { id: '1', label: 'Day 0',           desc: 'Unemployed · searching',           status: 'current'  },
      { id: '2', label: '50 Applications', desc: 'Build serious momentum',            status: 'active'   },
      { id: '3', label: 'First Interview', desc: 'Break through the door',            status: 'future'   },
      { id: '4', label: 'Offer In Hand',   desc: 'The dream is real',                 status: 'future'   },
    ]
  },
  {
    id: 'mind', label: 'Mind', icon: 'Brain', color: '#a78bfa',
    nodes: [
      { id: '1', label: 'Right Now',       desc: 'Scattered · building habits',       status: 'current'  },
      { id: '2', label: '1 Book/Month',    desc: 'Deep Work · Atomic Habits',         status: 'active'   },
      { id: '3', label: 'Online Course',   desc: 'New marketable skill unlocked',     status: 'future'   },
      { id: '4', label: 'Sharp & Ready',   desc: 'Knowledge compounds daily',         status: 'future'   },
    ]
  },
  {
    id: 'body', label: 'Body', icon: 'Dumbbell', color: '#34d399',
    nodes: [
      { id: '1', label: 'Starting Point',  desc: 'Building consistency',              status: 'current'  },
      { id: '2', label: 'Gym 3× / Week',   desc: 'Habit locked in',                   status: 'active'   },
      { id: '3', label: 'Run 5K',          desc: 'First race goal',                   status: 'future'   },
      { id: '4', label: 'Peak Form',       desc: 'Strong · consistent · energised',   status: 'future'   },
    ]
  },
  {
    id: 'money', label: 'Finance', icon: 'DollarSign', color: '#fb923c',
    nodes: [
      { id: '1', label: 'Managing Now',    desc: 'Budgeting · protecting runway',     status: 'current'  },
      { id: '2', label: 'Monthly Budget',  desc: 'Every dollar has a job',            status: 'active'   },
      { id: '3', label: 'Emergency Fund',  desc: '3 months of expenses saved',        status: 'future'   },
      { id: '4', label: 'Investing',       desc: 'Money working while you sleep',     status: 'future'   },
    ]
  },
  {
    id: 'health', label: 'Emotional', icon: 'Heart', color: '#f87171',
    nodes: [
      { id: '1', label: 'Ground Zero',     desc: 'Processing · resting · resetting',  status: 'current'  },
      { id: '2', label: 'Daily Journaling',desc: '10 min every morning',              status: 'active'   },
      { id: '3', label: 'Therapy / Coach', desc: 'Outside perspective unlocked',      status: 'future'   },
      { id: '4', label: 'Inner Peace',     desc: 'Grounded · calm · resilient',       status: 'future'   },
    ]
  },
  {
    id: 'after5', label: 'After 5', icon: 'Sunset', color: '#fbbf24',
    nodes: [
      { id: '1', label: 'Right Now',       desc: 'Evenings feel aimless',             status: 'current'  },
      { id: '2', label: 'Hobby Locked In', desc: 'Guitar · drawing · cooking',        status: 'active'   },
      { id: '3', label: 'Side Project',    desc: 'Building something real',           status: 'future'   },
      { id: '4', label: 'Full Life',       desc: 'Work ends · living begins',         status: 'future'   },
    ]
  },
]

export const ICON_MAP = { Briefcase, BookOpen, Activity, DollarSign, Heart, Plane, Dumbbell, Coffee, Music, Brain, Target, Star, Sunset, Salad }

const PATH_PRESETS = [
  { label:'Career',     icon:'Briefcase',  color:'#60a5fa', defaultDesc:'Job hunting journey'  },
  { label:'Mind',       icon:'Brain',      color:'#a78bfa', defaultDesc:'Learning & growth'     },
  { label:'Body',       icon:'Dumbbell',   color:'#34d399', defaultDesc:'Fitness & health'      },
  { label:'Finance',    icon:'DollarSign', color:'#fb923c', defaultDesc:'Financial freedom'     },
  { label:'Emotional',  icon:'Heart',      color:'#f87171', defaultDesc:'Mental wellbeing'      },
  { label:'After 5',    icon:'Sunset',     color:'#fbbf24', defaultDesc:'Life outside work'     },
  { label:'Travel',     icon:'Plane',      color:'#22d3ee', defaultDesc:'Places to explore'     },
  { label:'Nutrition',  icon:'Salad',      color:'#86efac', defaultDesc:'Eating & energy'       },
  { label:'Hobbies',    icon:'Music',      color:'#f9a8d4', defaultDesc:'Creative pursuits'     },
]

function PathCard({ path, onClick, onDelete }) {
  const [hov, setHov] = useState(false)
  const [delHov, setDelHov] = useState(false)
  const IconComp = ICON_MAP[path.icon] || Target
  const completedCount = path.nodes.filter(n => n.status === 'complete').length
  const currentNode = path.nodes.find(n => n.status === 'current')
  const activeNode  = path.nodes.find(n => n.status === 'active')
  const pct = path.nodes.length > 0 ? Math.round((completedCount / path.nodes.length) * 100) : 0
  const c = path.color

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setDelHov(false) }}
      style={{ position: 'relative', cursor: 'pointer' }}
    >
      <div
        onClick={onClick}
        style={{
          background: `linear-gradient(145deg, rgba(6,11,20,0.97) 0%, rgba(13,20,38,0.95) 100%)`,
          border: `1px solid ${hov ? c + '55' : c + '22'}`,
          borderTop: `2px solid ${hov ? c : c + 'aa'}`,
          padding: '26px 24px 22px',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.28s cubic-bezier(0.34,1.4,0.64,1)',
          transform: hov ? 'translateY(-6px) scale(1.01)' : 'none',
          boxShadow: hov
            ? `0 24px 64px rgba(0,0,0,0.7), 0 0 80px ${c}14, inset 0 1px 0 ${c}18`
            : `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 ${c}08`,
        }}
      >
        {/* Corner glow blob */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${c}10 0%, transparent 70%)`, pointerEvents: 'none', transition: 'opacity 0.3s', opacity: hov ? 1 : 0.4 }}/>
        {/* Bottom right watermark icon */}
        <div style={{ position: 'absolute', bottom: -12, right: -8, pointerEvents: 'none', opacity: hov ? 0.07 : 0.04, transition: 'opacity 0.3s' }}>
          <IconComp size={100} color={c}/>
        </div>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{
              width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${c}20, ${c}08)`,
              border: `1px solid ${c}45`,
              boxShadow: hov ? `0 0 24px ${c}35, inset 0 1px 0 ${c}30` : `0 0 12px ${c}18`,
              transition: 'all 0.25s', flexShrink: 0,
            }}>
              <IconComp size={20} style={{ color: c }}/>
            </div>
            <div>
              <p style={{
                fontFamily: SANS, fontSize: 22, fontWeight: 900,
                letterSpacing: '-0.035em', color: '#f0f6ff', lineHeight: 1,
                marginBottom: 5,
              }}>{path.label}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: c + 'bb' }}>{path.nodes.length} milestones</span>
                {completedCount > 0 && <>
                  <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 8 }}>·</span>
                  <span style={{ fontFamily: MONO, fontSize: 8, color: '#34d399bb', letterSpacing: '0.06em' }}>{completedCount} done</span>
                </>}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {hov && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(path.id) }}
                onMouseEnter={() => setDelHov(true)}
                onMouseLeave={() => setDelHov(false)}
                style={{
                  width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: delHov ? 'rgba(248,113,113,0.18)' : 'rgba(248,113,113,0.08)',
                  border: `1px solid ${delHov ? 'rgba(248,113,113,0.5)' : 'rgba(248,113,113,0.2)'}`,
                  color: '#f87171', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
                }}
              ><Trash2 size={11}/></button>
            )}
            <div style={{ opacity: hov ? 1 : 0.4, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={16} color={c}/>
            </div>
          </div>
        </div>

        {/* Current position */}
        {currentNode && (
          <div style={{ marginBottom: 16 }}>
            <span style={{
              fontFamily: MONO, fontSize: 7, fontWeight: 800, letterSpacing: '0.14em',
              color: c, background: `${c}15`, border: `1px solid ${c}30`,
              padding: '2px 8px', display: 'inline-block', marginBottom: 7,
            }}>YOU ARE HERE</span>
            <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: '#e8f0ff', letterSpacing: '-0.02em', marginBottom: 3 }}>{currentNode.label}</p>
            <p style={{ fontFamily: MONO, fontSize: 9, color: c + '80', lineHeight: 1.5 }}>{currentNode.desc}</p>
          </div>
        )}
        {!currentNode && activeNode && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: MONO, fontSize: 7, fontWeight: 800, letterSpacing: '0.14em', color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', padding: '2px 8px', display: 'inline-block', marginBottom: 7 }}>IN PROGRESS</span>
            <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: '#e8f0ff', letterSpacing: '-0.02em', marginBottom: 3 }}>{activeNode.label}</p>
            <p style={{ fontFamily: MONO, fontSize: 9, color: '#34d39980', lineHeight: 1.5 }}>{activeNode.desc}</p>
          </div>
        )}

        {/* Node dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          {path.nodes.map((n, i) => (
            <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: n.status === 'current' ? 11 : 7,
                height: n.status === 'current' ? 11 : 7,
                borderRadius: '50%',
                background: n.status === 'complete' ? '#34d399'
                  : n.status === 'current' ? c
                  : n.status === 'active' ? c + 'aa'
                  : `${c}20`,
                border: n.status === 'current' ? `2px solid ${c}` : n.status === 'active' ? `1.5px solid ${c}60` : `1px solid ${c}20`,
                boxShadow: n.status === 'current' ? `0 0 10px ${c}70` : 'none',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}/>
              {i < path.nodes.length - 1 && (
                <div style={{ width: 14, height: 1, background: n.status === 'complete' ? 'rgba(52,211,153,0.4)' : `${c}18` }}/>
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 3, background: `${c}12`, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: `linear-gradient(90deg, ${c}90, ${c})`,
              transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            }}/>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 800, color: pct > 0 ? c : `${c}40`, letterSpacing: '-0.02em', minWidth: 32, textAlign: 'right' }}>{pct}%</span>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color, icon: Icon, gradient }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, padding: '18px 20px', position: 'relative', overflow: 'hidden',
        background: gradient,
        border: `1px solid ${color}20`,
        boxShadow: hov ? `0 8px 32px rgba(0,0,0,0.5), 0 0 40px ${color}12` : '0 4px 20px rgba(0,0,0,0.3)',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'all 0.22s cubic-bezier(0.34,1.4,0.64,1)',
      }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg, ${color}60, transparent)` }}/>
      <div style={{ position:'absolute', right:-16, bottom:-16, width:80, height:80, borderRadius:'50%', background:`radial-gradient(circle, ${color}10, transparent)`, pointerEvents:'none' }}/>
      <div style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', marginBottom:12, boxShadow: hov ? `0 0 20px ${color}40` : 'none', transition:'box-shadow 0.2s' }}>
        <Icon size={14} color="#fff"/>
      </div>
      <p style={{ fontFamily:MONO, fontSize:7, fontWeight:700, letterSpacing:'0.12em', color:'rgba(255,255,255,0.45)', textTransform:'uppercase', marginBottom:4 }}>{label}</p>
      <p style={{ fontFamily:SANS, fontSize:26, fontWeight:900, letterSpacing:'-0.04em', color:'#fff', lineHeight:1, marginBottom:4 }}>{value}</p>
      <p style={{ fontFamily:MONO, fontSize:8, color:'rgba(255,255,255,0.4)' }}>{sub}</p>
    </div>
  )
}

export default function Roadmap() {
  const navigate = useNavigate()
  const [paths, setPaths] = useLocalStorage('trackr_roadmap_paths', DEFAULT_PATHS)
  const [showAddPath, setShowAddPath] = useState(false)
  const [newPathLabel, setNewPathLabel] = useState('')
  const [newPathIcon, setNewPathIcon] = useState('Target')
  const [newPathColor, setNewPathColor] = useState('#60a5fa')

  const deletePath = id => setPaths(ps => ps.filter(p => p.id !== id))

  const addPath = preset => {
    const id = Date.now().toString()
    setPaths(ps => [...ps, {
      id, label: preset?.label || newPathLabel || 'New Path',
      icon: preset?.icon || newPathIcon,
      color: preset?.color || newPathColor,
      nodes: [
        { id: '1', label: 'Start Here', desc: preset?.defaultDesc || 'Your starting point', status: 'current' },
        { id: '2', label: 'First Step',  desc: 'Define your next move', status: 'future' },
      ]
    }])
    setShowAddPath(false)
    setNewPathLabel('')
  }

  const completedNodes = paths.flatMap(p => p.nodes).filter(n => n.status === 'complete').length
  const totalNodes     = paths.flatMap(p => p.nodes).length
  const overallPct     = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0
  const activePaths    = paths.filter(p => p.nodes.some(n => n.status === 'active')).length

  return (
    <div style={{ fontFamily: SANS, maxWidth: 1200, margin: '0 auto', paddingTop: 4 }}>
      <BackToHome />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', color: '#f0f6ff', marginBottom: 6, lineHeight: 1 }}>
            Life Roadmap
          </h1>
          <p style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(96,165,250,0.6)', letterSpacing: '0.04em' }}>
            Every dimension of who you're becoming — tracked, lived, owned
          </p>
        </div>
        <button onClick={() => setShowAddPath(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px',
            background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
            border: 'none', cursor: 'pointer', color: '#fff',
            fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            boxShadow: '0 4px 24px rgba(99,102,241,0.35)',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.filter='brightness(1.15)'; e.currentTarget.style.transform='translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.filter='none'; e.currentTarget.style.transform='none' }}>
          <Plus size={12}/> Add Path
        </button>
      </div>

      {/* Stat bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <StatCard label="Overall Progress" value={`${overallPct}%`}    sub={`${completedNodes} of ${totalNodes} milestones`} color="#60a5fa" icon={Target}   gradient="linear-gradient(145deg,rgba(10,24,54,0.98),rgba(6,11,20,0.98))"/>
        <StatCard label="Active Paths"     value={paths.length}          sub={`${activePaths} in motion now`}                  color="#34d399" icon={Activity} gradient="linear-gradient(145deg,rgba(4,22,16,0.98),rgba(6,11,20,0.98))"/>
        <StatCard label="Milestones Done"  value={completedNodes}         sub="completed across all paths"                      color="#fb923c" icon={Flag}     gradient="linear-gradient(145deg,rgba(24,12,4,0.98),rgba(6,11,20,0.98))"/>
        <StatCard label="Dimensions"       value={paths.length}          sub={`${paths.filter(p=>p.nodes.some(n=>n.status==='complete')).length} paths with wins`} color="#a78bfa" icon={Star} gradient="linear-gradient(145deg,rgba(18,8,32,0.98),rgba(6,11,20,0.98))"/>
      </div>

      {/* Path cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {paths.map(path => (
          <PathCard
            key={path.id}
            path={path}
            onClick={() => navigate(`/roadmap/${path.id}`)}
            onDelete={deletePath}
          />
        ))}
      </div>

      {/* Add path modal */}
      {showAddPath && (
        <div
          style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(16px)', animation:'fadeIn 0.15s ease' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddPath(false) }}>
          <div style={{ width:'100%', maxWidth:500, background:'linear-gradient(160deg,#080f20,#060b14)', border:'1px solid rgba(96,165,250,0.15)', boxShadow:'0 40px 100px rgba(0,0,0,0.9), 0 0 80px rgba(96,165,250,0.05)', padding:28, position:'relative', animation:'slideUp 0.22s cubic-bezier(0.34,1.4,0.64,1)' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg, rgba(96,165,250,0.5), transparent)' }}/>
            <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, color:'#60a5fa', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:4 }}>New Path</p>
            <h2 style={{ fontSize:20, fontWeight:900, color:'#f0f6ff', letterSpacing:'-0.03em', marginBottom:22 }}>Choose a life dimension</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:22 }}>
              {PATH_PRESETS.map(p => {
                const Icon = ICON_MAP[p.icon] || Target
                return (
                  <button key={p.label} onClick={() => addPath(p)}
                    style={{ padding:'14px 10px', background:`${p.color}08`, border:`1px solid ${p.color}20`, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:7, transition:'all 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.background=`${p.color}18`; e.currentTarget.style.borderColor=`${p.color}50`; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 24px rgba(0,0,0,0.4), 0 0 20px ${p.color}15` }}
                    onMouseLeave={e => { e.currentTarget.style.background=`${p.color}08`; e.currentTarget.style.borderColor=`${p.color}20`; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
                    <Icon size={20} style={{ color: p.color }}/>
                    <span style={{ fontFamily:MONO, fontSize:8, fontWeight:700, color:p.color, letterSpacing:'0.08em', textTransform:'uppercase' }}>{p.label}</span>
                  </button>
                )
              })}
            </div>
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:18 }}>
              <p style={{ fontFamily:MONO, fontSize:8, color:'rgba(96,165,250,0.4)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Or name your own</p>
              <div style={{ display:'flex', gap:8 }}>
                <input value={newPathLabel} onChange={e => setNewPathLabel(e.target.value)} placeholder="Path name…"
                  onKeyDown={e => e.key === 'Enter' && addPath(null)}
                  style={{ flex:1, padding:'10px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', color:'#f0f6ff', fontSize:13, fontFamily:SANS, outline:'none' }}/>
                <button onClick={() => addPath(null)}
                  style={{ padding:'10px 18px', background:'rgba(96,165,250,0.12)', border:'1px solid rgba(96,165,250,0.3)', color:'#60a5fa', fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer' }}>Create</button>
              </div>
            </div>
            <button onClick={() => setShowAddPath(false)}
              style={{ position:'absolute', top:14, right:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', cursor:'pointer', color:'rgba(255,255,255,0.4)', padding:'5px 6px', display:'flex', alignItems:'center', transition:'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color='#f0f6ff'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
              <X size={13}/>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px) scale(0.96)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  )
}
