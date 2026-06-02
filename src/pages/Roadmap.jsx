import { useState, useEffect, useRef } from 'react'
import {
  Briefcase, BookOpen, Activity, DollarSign, Heart, Plane,
  Dumbbell, Coffee, Music, Plus, Check, X, Edit3, Trash2,
  MapPin, Flag, Zap, Star, Target, ChevronDown, ChevronUp,
  Sunset, Brain, Salad
} from 'lucide-react'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'
const BG   = '#0d1117'

function useLocalStorage(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init } catch { return init }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }, [key, v])
  return [v, setV]
}

/* ── Default paths ── */
const DEFAULT_PATHS = [
  {
    id: 'career', label: 'Career', icon: 'Briefcase', color: '#a3c9ff',
    nodes: [
      { id: '1', label: 'Day 0',           desc: 'Unemployed · searching',           status: 'current'  },
      { id: '2', label: '50 Applications', desc: 'Build serious momentum',            status: 'active'   },
      { id: '3', label: 'First Interview', desc: 'Break through the door',            status: 'future'   },
      { id: '4', label: 'Offer In Hand',   desc: 'The dream is real',                 status: 'future'   },
    ]
  },
  {
    id: 'mind', label: 'Mind', icon: 'Brain', color: '#c4b5fd',
    nodes: [
      { id: '1', label: 'Right Now',       desc: 'Scattered · building habits',       status: 'current'  },
      { id: '2', label: '1 Book/Month',    desc: 'Deep Work · Atomic Habits',         status: 'active'   },
      { id: '3', label: 'Online Course',   desc: 'New marketable skill unlocked',     status: 'future'   },
      { id: '4', label: 'Sharp & Ready',   desc: 'Knowledge compounds daily',         status: 'future'   },
    ]
  },
  {
    id: 'body', label: 'Body', icon: 'Dumbbell', color: '#4edea3',
    nodes: [
      { id: '1', label: 'Starting Point',  desc: 'Building consistency',              status: 'current'  },
      { id: '2', label: 'Gym 3× / Week',   desc: 'Habit locked in',                   status: 'active'   },
      { id: '3', label: 'Run 5K',          desc: 'First race goal',                   status: 'future'   },
      { id: '4', label: 'Peak Form',       desc: 'Strong · consistent · energised',   status: 'future'   },
    ]
  },
  {
    id: 'money', label: 'Finance', icon: 'DollarSign', color: '#ffb689',
    nodes: [
      { id: '1', label: 'Managing Now',    desc: 'Budgeting · protecting runway',     status: 'current'  },
      { id: '2', label: 'Monthly Budget',  desc: 'Every dollar has a job',            status: 'active'   },
      { id: '3', label: 'Emergency Fund',  desc: '3 months of expenses saved',        status: 'future'   },
      { id: '4', label: 'Investing',       desc: 'Money working while you sleep',     status: 'future'   },
    ]
  },
  {
    id: 'health', label: 'Emotional', icon: 'Heart', color: '#ffb4ab',
    nodes: [
      { id: '1', label: 'Ground Zero',     desc: 'Processing · resting · resetting',  status: 'current'  },
      { id: '2', label: 'Daily Journaling',desc: '10 min every morning',              status: 'active'   },
      { id: '3', label: 'Therapy / Coach', desc: 'Outside perspective unlocked',      status: 'future'   },
      { id: '4', label: 'Inner Peace',     desc: 'Grounded · calm · resilient',       status: 'future'   },
    ]
  },
  {
    id: 'after5', label: 'After 5', icon: 'Sunset', color: '#fcd34d',
    nodes: [
      { id: '1', label: 'Right Now',       desc: 'Evenings feel aimless',             status: 'current'  },
      { id: '2', label: 'Hobby Locked In', desc: 'Guitar · drawing · cooking',        status: 'active'   },
      { id: '3', label: 'Side Project',    desc: 'Building something real',           status: 'future'   },
      { id: '4', label: 'Full Life',       desc: 'Work ends · living begins',         status: 'future'   },
    ]
  },
]

const ICON_MAP = { Briefcase, BookOpen, Activity, DollarSign, Heart, Plane, Dumbbell, Coffee, Music, Brain, Target, Star, Sunset, Salad }
const STATUS_ORDER = { current: 0, active: 1, complete: 2, future: 3 }

/* ── Curved dashed SVG arrow ── */
function Arrow({ color, flip = false }) {
  const cy = flip ? 28 : 4
  return (
    <svg width={88} height={32} viewBox="0 0 88 32" style={{ flexShrink: 0, overflow: 'visible' }}>
      <defs>
        <marker id={`ah-${color.replace('#','')}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill={color} opacity="0.6"/>
        </marker>
      </defs>
      <path
        d={`M 2,16 C 22,${cy} 66,${cy === 4 ? 28 : 4} 86,16`}
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="5 5"
        fill="none"
        opacity="0.55"
        markerEnd={`url(#ah-${color.replace('#','')})`}
        style={{ animation: 'dashFlow 1.8s linear infinite' }}
      />
    </svg>
  )
}

/* ── Journey node ── */
function JourneyNode({ node, color, isLast, onToggle, onEdit, onDelete, isFirst }) {
  const [hov, setHov] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ label: node.label, desc: node.desc })

  const statusStyle = {
    current:  { bg: `${color}18`, border: color, labelColor: color,    opacity: 1,    glow: `0 0 20px ${color}35` },
    active:   { bg: `${color}0d`, border: `${color}70`, labelColor: color, opacity: 1, glow: 'none' },
    complete: { bg: 'rgba(78,222,163,0.08)', border: 'rgba(78,222,163,0.35)', labelColor: '#4edea3', opacity: 0.75, glow: 'none' },
    future:   { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.06)', labelColor: '#3a4455', opacity: 0.6, glow: 'none' },
  }
  const s = statusStyle[node.status] || statusStyle.future

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          position: 'relative', width: 148, flexShrink: 0,
          opacity: s.opacity,
          transform: hov && node.status !== 'future' ? 'translateY(-3px)' : 'none',
          transition: 'all 0.22s cubic-bezier(0.34,1.4,0.64,1)',
        }}
      >
        {/* Node circle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: node.status === 'current'
              ? `radial-gradient(circle at 35% 35%, ${color}40, ${color}18)`
              : s.bg,
            border: `1.5px solid ${s.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: node.status === 'current' ? s.glow : hov ? `0 4px 16px rgba(0,0,0,0.4)` : 'none',
            cursor: 'pointer', transition: 'all 0.2s',
            position: 'relative',
          }}
            onClick={() => onToggle(node.id)}
          >
            {/* Pulse ring for current */}
            {node.status === 'current' && (
              <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: `1px solid ${color}30`, animation: 'pulseRing 2s ease-in-out infinite' }}/>
            )}
            {node.status === 'complete'
              ? <Check size={20} style={{ color: '#4edea3' }}/>
              : node.status === 'current'
                ? <MapPin size={20} style={{ color }}/>
                : <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.labelColor }}/>
            }
          </div>

          {/* Labels */}
          {editing ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <input value={draft.label} onChange={e => setDraft(d => ({...d, label: e.target.value}))}
                style={{ width: '100%', boxSizing: 'border-box', padding: '4px 6px', background: 'rgba(255,255,255,0.05)', border: `0.5px solid ${color}40`, color: '#e2e2e8', fontSize: 11, fontFamily: SANS, outline: 'none', textAlign: 'center' }}/>
              <input value={draft.desc} onChange={e => setDraft(d => ({...d, desc: e.target.value}))}
                style={{ width: '100%', boxSizing: 'border-box', padding: '3px 6px', background: 'rgba(255,255,255,0.03)', border: `0.5px solid rgba(255,255,255,0.08)`, color: '#8a919f', fontSize: 9, fontFamily: MONO, outline: 'none', textAlign: 'center' }}/>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                <button onClick={() => { onEdit(node.id, draft); setEditing(false) }} style={{ padding: '2px 8px', background: `${color}20`, border: `0.5px solid ${color}50`, color, fontFamily: MONO, fontSize: 8, cursor: 'pointer' }}>Save</button>
                <button onClick={() => setEditing(false)} style={{ padding: '2px 8px', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.08)', color: '#5a6478', fontFamily: MONO, fontSize: 8, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              {node.status === 'current' && (
                <span style={{ fontFamily: MONO, fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', color, background: `${color}18`, border: `0.5px solid ${color}35`, padding: '1px 6px', display: 'inline-block', marginBottom: 4 }}>YOU ARE HERE</span>
              )}
              <p style={{ fontSize: 11, fontWeight: 700, color: node.status === 'future' ? '#3a4455' : '#e2e2e8', letterSpacing: '-0.01em', marginBottom: 3, lineHeight: 1.2 }}>{node.label}</p>
              <p style={{ fontFamily: MONO, fontSize: 8, color: node.status === 'future' ? '#2a3040' : '#5a6478', lineHeight: 1.4 }}>{node.desc}</p>
            </div>
          )}
        </div>

        {/* Hover actions */}
        {hov && !editing && (
          <div style={{ position: 'absolute', top: 0, right: -4, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <button onClick={() => setEditing(true)} style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(163,201,255,0.1)', border: '0.5px solid rgba(163,201,255,0.2)', cursor: 'pointer', color: '#a3c9ff' }}><Edit3 size={9}/></button>
            {!isFirst && <button onClick={() => onDelete(node.id)} style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,180,171,0.1)', border: '0.5px solid rgba(255,180,171,0.2)', cursor: 'pointer', color: '#ffb4ab' }}><Trash2 size={9}/></button>}
          </div>
        )}
      </div>

      {/* Arrow between nodes */}
      {!isLast && <Arrow color={color} flip={Math.random() > 0.5}/>}
    </div>
  )
}

/* ── Path row ── */
function PathRow({ path, onUpdatePath, onDeletePath }) {
  const IconComp = ICON_MAP[path.icon] || Target
  const [collapsed, setCollapsed] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newNode, setNewNode] = useState({ label: '', desc: '' })

  const cycleStatus = (nodeId) => {
    const order = ['current', 'active', 'future', 'complete']
    onUpdatePath({ ...path, nodes: path.nodes.map(n => n.id === nodeId ? { ...n, status: order[(order.indexOf(n.status) + 1) % order.length] } : n) })
  }

  const editNode = (nodeId, draft) => {
    onUpdatePath({ ...path, nodes: path.nodes.map(n => n.id === nodeId ? { ...n, ...draft } : n) })
  }

  const deleteNode = (nodeId) => {
    onUpdatePath({ ...path, nodes: path.nodes.filter(n => n.id !== nodeId) })
  }

  const addNode = () => {
    if (!newNode.label.trim()) return
    onUpdatePath({ ...path, nodes: [...path.nodes, { id: Date.now().toString(), ...newNode, status: 'future' }] })
    setNewNode({ label: '', desc: '' })
    setAdding(false)
  }

  const completedCount = path.nodes.filter(n => n.status === 'complete').length
  const pct = path.nodes.length > 0 ? Math.round((completedCount / path.nodes.length) * 100) : 0

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(13,18,32,0.95), rgba(7,13,22,0.98))',
      border: `0.5px solid rgba(48,54,61,0.9)`,
      borderLeft: `3px solid ${path.color}`,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Path header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: collapsed ? 'none' : '0.5px solid rgba(48,54,61,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${path.color}14`, border: `0.5px solid ${path.color}30` }}>
            <IconComp size={14} style={{ color: path.color }}/>
          </div>
          <div>
            <p style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: path.color, textTransform: 'uppercase' }}>{path.label}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <div style={{ width: 60, height: 2, background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: path.color, transition: 'width 0.5s ease' }}/>
              </div>
              <span style={{ fontFamily: MONO, fontSize: 8, color: '#3a4455' }}>{completedCount}/{path.nodes.length} done</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => setAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: `${path.color}10`, border: `0.5px solid ${path.color}30`, color: path.color, fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background=`${path.color}20`} onMouseLeave={e => e.currentTarget.style.background=`${path.color}10`}>
            <Plus size={9}/> Add stop
          </button>
          <button onClick={() => onDeletePath(path.id)} style={{ padding: '4px 6px', background: 'transparent', border: '0.5px solid rgba(255,180,171,0.15)', color: '#ffb4ab', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,180,171,0.4)'} onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,180,171,0.15)'}>
            <Trash2 size={10}/>
          </button>
          <button onClick={() => setCollapsed(c => !c)} style={{ padding: '4px 6px', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.06)', color: '#5a6478', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {collapsed ? <ChevronDown size={12}/> : <ChevronUp size={12}/>}
          </button>
        </div>
      </div>

      {/* Nodes */}
      {!collapsed && (
        <div style={{ padding: '28px 24px 24px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'max-content' }}>
            {path.nodes.map((node, i) => (
              <JourneyNode key={node.id} node={node} color={path.color}
                isFirst={i === 0} isLast={i === path.nodes.length - 1}
                onToggle={cycleStatus} onEdit={editNode} onDelete={deleteNode}/>
            ))}

            {/* Add node inline */}
            {adding && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <Arrow color={path.color}/>
                <div style={{ width: 148, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: `1.5px dashed ${path.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={18} style={{ color: path.color, opacity: 0.5 }}/>
                  </div>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <input autoFocus value={newNode.label} onChange={e => setNewNode(n => ({...n, label: e.target.value}))} placeholder="Milestone name"
                      onKeyDown={e => e.key === 'Enter' && addNode()}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '5px 8px', background: 'rgba(255,255,255,0.04)', border: `0.5px solid ${path.color}40`, color: '#e2e2e8', fontSize: 11, fontFamily: SANS, outline: 'none', textAlign: 'center' }}/>
                    <input value={newNode.desc} onChange={e => setNewNode(n => ({...n, desc: e.target.value}))} placeholder="Short description"
                      onKeyDown={e => e.key === 'Enter' && addNode()}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '4px 8px', background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', color: '#8a919f', fontSize: 9, fontFamily: MONO, outline: 'none', textAlign: 'center' }}/>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button onClick={addNode} style={{ padding: '3px 10px', background: `${path.color}20`, border: `0.5px solid ${path.color}50`, color: path.color, fontFamily: MONO, fontSize: 8, fontWeight: 700, cursor: 'pointer' }}>Add</button>
                      <button onClick={() => setAdding(false)} style={{ padding: '3px 8px', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.08)', color: '#5a6478', fontFamily: MONO, fontSize: 8, cursor: 'pointer' }}>✕</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Command center banner card ── */
function CommandCard({ label, value, sub, color, icon: Icon, gradient }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, padding: '20px 22px', position: 'relative', overflow: 'hidden',
        background: gradient,
        border: `0.5px solid ${color}25`,
        boxShadow: hov ? `0 8px 32px rgba(0,0,0,0.5), 0 0 40px ${color}12` : '0 4px 20px rgba(0,0,0,0.3)',
        transform: hov ? 'translateY(-3px)' : 'none',
        transition: 'all 0.22s cubic-bezier(0.34,1.4,0.64,1)',
        cursor: 'default',
      }}>
      <div style={{ position:'absolute', right:-20, bottom:-20, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg, ${color}60, transparent)`, pointerEvents:'none' }}/>
      <div style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.1)', border:'0.5px solid rgba(255,255,255,0.15)', marginBottom:14, boxShadow: hov ? `0 0 20px ${color}40` : 'none', transition:'box-shadow 0.2s' }}>
        <Icon size={16} color="#fff"/>
      </div>
      <p style={{ fontFamily:MONO, fontSize:8, fontWeight:700, letterSpacing:'0.1em', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', marginBottom:4 }}>{label}</p>
      <p style={{ fontFamily:MONO, fontSize:28, fontWeight:900, letterSpacing:'-0.04em', color:'#fff', lineHeight:1, marginBottom:4 }}>{value}</p>
      <p style={{ fontFamily:MONO, fontSize:9, color:'rgba(255,255,255,0.45)' }}>{sub}</p>
    </div>
  )
}

/* ── Add path modal ── */
const PATH_PRESETS = [
  { label:'Career',     icon:'Briefcase',  color:'#a3c9ff', defaultDesc:'Job hunting journey'  },
  { label:'Mind',       icon:'Brain',      color:'#c4b5fd', defaultDesc:'Learning & growth'     },
  { label:'Body',       icon:'Dumbbell',   color:'#4edea3', defaultDesc:'Fitness & health'      },
  { label:'Finance',    icon:'DollarSign', color:'#ffb689', defaultDesc:'Financial freedom'     },
  { label:'Emotional',  icon:'Heart',      color:'#ffb4ab', defaultDesc:'Mental wellbeing'      },
  { label:'After 5',    icon:'Sunset',     color:'#fcd34d', defaultDesc:'Life outside work'     },
  { label:'Travel',     icon:'Plane',      color:'#67e8f9', defaultDesc:'Places to explore'     },
  { label:'Nutrition',  icon:'Salad',      color:'#86efac', defaultDesc:'Eating & energy'       },
  { label:'Hobbies',    icon:'Music',      color:'#f9a8d4', defaultDesc:'Creative pursuits'     },
]

/* ══════════════════════════════════════════════════════════════ */
export default function Roadmap() {
  const [paths, setPaths] = useLocalStorage('trackr_roadmap_paths', DEFAULT_PATHS)
  const [showAddPath, setShowAddPath] = useState(false)
  const [newPathLabel, setNewPathLabel] = useState('')
  const [newPathIcon, setNewPathIcon] = useState('Target')
  const [newPathColor, setNewPathColor] = useState('#a3c9ff')

  const updatePath = (updated) => setPaths(ps => ps.map(p => p.id === updated.id ? updated : p))
  const deletePath = (id) => setPaths(ps => ps.filter(p => p.id !== id))

  const addPath = (preset) => {
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

  /* ── Banner stats ── */
  const currentNodes   = paths.flatMap(p => p.nodes).filter(n => n.status === 'current').length
  const completedNodes = paths.flatMap(p => p.nodes).filter(n => n.status === 'complete').length
  const totalNodes     = paths.flatMap(p => p.nodes).length
  const overallPct     = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0
  const activePaths    = paths.filter(p => p.nodes.some(n => n.status === 'active')).length

  return (
    <div style={{ fontFamily: SANS, maxWidth: 1200, margin: '0 auto', paddingTop: 4 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', color: '#e2e2e8', marginBottom: 6 }}>
            Life Roadmap
          </h1>
          <p style={{ fontFamily: MONO, fontSize: 10, color: '#5a6478' }}>
            Your personal growth ecosystem — every dimension of who you're becoming
          </p>
        </div>
        <button onClick={() => setShowAddPath(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'linear-gradient(135deg, #1493ff, #6366f1)', border: 'none', cursor: 'pointer', color: '#fff', fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', boxShadow: '0 4px 20px rgba(20,147,255,0.3)', transition: 'filter 0.15s, transform 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.filter='brightness(1.1)'; e.currentTarget.style.transform='translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.filter='none'; e.currentTarget.style.transform='none' }}>
          <Plus size={13}/> Add Path
        </button>
      </div>

      {/* ── Command center banner: 4 stat cards ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <CommandCard label="Overall Progress" value={`${overallPct}%`}    sub={`${completedNodes} of ${totalNodes} milestones reached`} color="#a3c9ff" icon={Target}    gradient="linear-gradient(145deg,rgba(13,31,60,0.98),rgba(7,13,26,0.98))"/>
        <CommandCard label="Active Paths"     value={paths.length}          sub={`${activePaths} in motion right now`}                   color="#4edea3" icon={Activity}  gradient="linear-gradient(145deg,rgba(5,28,20,0.98),rgba(7,13,26,0.98))"/>
        <CommandCard label="Next Milestone"   value={completedNodes}         sub="milestones completed so far"                             color="#ffb689" icon={Flag}      gradient="linear-gradient(145deg,rgba(30,20,5,0.98),rgba(7,13,26,0.98))"/>
        <CommandCard label="Life Dimensions"  value={paths.length}          sub={`${paths.filter(p=>p.nodes.some(n=>n.status==='complete')).length} paths with wins`} color="#c4b5fd" icon={Star}     gradient="linear-gradient(145deg,rgba(20,10,35,0.98),rgba(7,13,26,0.98))"/>
      </div>

      {/* ── Journey paths ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {paths.map(path => (
          <PathRow key={path.id} path={path} onUpdatePath={updatePath} onDeletePath={deletePath}/>
        ))}
      </div>

      {/* ── Add path overlay ── */}
      {showAddPath && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', animation: 'fadeIn 0.15s ease' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddPath(false) }}>
          <div style={{ width: '100%', maxWidth: 480, background: 'linear-gradient(160deg,#0c1829,#070d1a)', border: '0.5px solid rgba(163,201,255,0.15)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', padding: 24, animation: 'slideUp 0.2s cubic-bezier(0.34,1.4,0.64,1)' }}>
            <p style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: '#a3c9ff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Add a Life Path</p>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e2e2e8', letterSpacing: '-0.02em', marginBottom: 20 }}>Choose a dimension to track</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
              {PATH_PRESETS.map(p => {
                const Icon = ICON_MAP[p.icon] || Target
                return (
                  <button key={p.label} onClick={() => addPath(p)}
                    style={{ padding: '12px 10px', background: `${p.color}08`, border: `0.5px solid ${p.color}25`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background=`${p.color}18`; e.currentTarget.style.borderColor=`${p.color}50`; e.currentTarget.style.transform='translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.background=`${p.color}08`; e.currentTarget.style.borderColor=`${p.color}25`; e.currentTarget.style.transform='none' }}>
                    <Icon size={18} style={{ color: p.color }}/>
                    <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: p.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{p.label}</span>
                  </button>
                )
              })}
            </div>

            <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
              <p style={{ fontFamily: MONO, fontSize: 8, color: '#5a6478', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Or create custom</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={newPathLabel} onChange={e => setNewPathLabel(e.target.value)} placeholder="Path name…"
                  onKeyDown={e => e.key === 'Enter' && addPath(null)}
                  style={{ flex: 1, padding: '9px 12px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', color: '#e2e2e8', fontSize: 13, fontFamily: SANS, outline: 'none' }}/>
                <button onClick={() => addPath(null)} style={{ padding: '9px 16px', background: 'rgba(163,201,255,0.1)', border: '0.5px solid rgba(163,201,255,0.3)', color: '#a3c9ff', fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Create</button>
              </div>
            </div>
            <button onClick={() => setShowAddPath(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: '#5a6478', padding: '5px 6px', display: 'flex', alignItems: 'center' }}><X size={13}/></button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dashFlow  { from{stroke-dashoffset:36} to{stroke-dashoffset:0} }
        @keyframes pulseRing { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.15;transform:scale(1.15)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  )
}
