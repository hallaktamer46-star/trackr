import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BackToHome from '../components/BackToHome'
import {
  Briefcase, BookOpen, Activity, DollarSign, Heart, Plane,
  Dumbbell, Coffee, Music, Plus, X, Target, Star, Sunset, Brain,
  Salad, Flag, Trash2, Check, MapPin, Edit3, ArrowUpRight, ChevronRight
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
      { id: '3', label: 'Online Course',   desc: 'New marketable skill',              status: 'future'   },
      { id: '4', label: 'Sharp & Ready',   desc: 'Knowledge compounds daily',         status: 'future'   },
    ]
  },
  {
    id: 'body', label: 'Body', icon: 'Dumbbell', color: '#34d399',
    nodes: [
      { id: '1', label: 'Starting Point',  desc: 'Building consistency',              status: 'current'  },
      { id: '2', label: 'Gym 3× / Week',   desc: 'Habit locked in',                   status: 'active'   },
      { id: '3', label: 'Run 5K',          desc: 'First race goal',                   status: 'future'   },
      { id: '4', label: 'Peak Form',       desc: 'Strong · energised',                status: 'future'   },
    ]
  },
  {
    id: 'money', label: 'Finance', icon: 'DollarSign', color: '#fb923c',
    nodes: [
      { id: '1', label: 'Managing Now',    desc: 'Budgeting · runway',                status: 'current'  },
      { id: '2', label: 'Monthly Budget',  desc: 'Every dollar has a job',            status: 'active'   },
      { id: '3', label: 'Emergency Fund',  desc: '3 months saved',                    status: 'future'   },
      { id: '4', label: 'Investing',       desc: 'Money working for you',             status: 'future'   },
    ]
  },
  {
    id: 'health', label: 'Emotional', icon: 'Heart', color: '#f87171',
    nodes: [
      { id: '1', label: 'Ground Zero',     desc: 'Processing · resetting',            status: 'current'  },
      { id: '2', label: 'Daily Journaling',desc: '10 min every morning',              status: 'active'   },
      { id: '3', label: 'Therapy / Coach', desc: 'Outside perspective',               status: 'future'   },
      { id: '4', label: 'Inner Peace',     desc: 'Grounded · resilient',              status: 'future'   },
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

const STATUS_CYCLE = ['current', 'active', 'future', 'complete']

/* ── Inline milestone node ── */
function MilestoneNode({ node, index, color, isLast, onToggle, onEdit, onDelete, isFirst }) {
  const [hov, setHov] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ label: node.label, desc: node.desc })

  const isCurrent  = node.status === 'current'
  const isComplete = node.status === 'complete'
  const isActive   = node.status === 'active'
  const isFuture   = node.status === 'future'

  const dotColor = isComplete ? '#34d399' : isCurrent ? color : isActive ? `${color}cc` : `${color}25`
  const dotBorder = isComplete ? '#34d399' : isCurrent ? color : isActive ? `${color}80` : `${color}22`
  const labelColor = isFuture ? `${color}30` : isCurrent ? '#f0f6ff' : '#d0e4ff'

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => { setHov(false); if (!editing) {} }}
        style={{ width: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, position: 'relative' }}
      >
        {/* Status circle */}
        <div
          onClick={() => !editing && onToggle(node.id)}
          title="Click to advance status"
          style={{
            width: isCurrent ? 38 : 30, height: isCurrent ? 38 : 30,
            borderRadius: '50%',
            background: isComplete
              ? 'rgba(52,211,153,0.15)'
              : isCurrent
                ? `radial-gradient(circle at 35% 35%, ${color}35, ${color}10)`
                : isActive
                  ? `rgba(${hexToRgb(color)},0.08)`
                  : 'rgba(255,255,255,0.02)',
            border: `1.5px solid ${dotBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: isCurrent ? `0 0 18px ${color}35` : isComplete ? '0 0 10px rgba(52,211,153,0.25)' : 'none',
            transition: 'all 0.22s cubic-bezier(0.34,1.4,0.64,1)',
            transform: hov ? 'scale(1.12)' : 'scale(1)',
            position: 'relative', zIndex: 1,
            flexShrink: 0,
          }}
        >
          {isCurrent && <div style={{ position:'absolute', inset:-5, borderRadius:'50%', border:`1px solid ${color}22`, animation:'pulseRing 2.2s ease-in-out infinite', pointerEvents:'none' }}/>}
          {isComplete
            ? <Check size={13} style={{ color: '#34d399' }}/>
            : isCurrent
              ? <MapPin size={13} style={{ color }}/>
              : <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, color: dotColor }}>{index + 1}</span>
          }
        </div>

        {/* Label & edit */}
        {editing ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 10 }}>
            <input autoFocus value={draft.label}
              onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') { onEdit(node.id, draft); setEditing(false) } if (e.key === 'Escape') setEditing(false) }}
              style={{ width: '100%', boxSizing: 'border-box', padding: '3px 6px', background: `${color}10`, border: `1px solid ${color}40`, color: '#f0f6ff', fontSize: 10, fontFamily: SANS, fontWeight: 700, outline: 'none', textAlign: 'center' }}/>
            <input value={draft.desc}
              onChange={e => setDraft(d => ({ ...d, desc: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') { onEdit(node.id, draft); setEditing(false) } if (e.key === 'Escape') setEditing(false) }}
              style={{ width: '100%', boxSizing: 'border-box', padding: '2px 6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', fontSize: 8, fontFamily: MONO, outline: 'none', textAlign: 'center' }}/>
            <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
              <button onClick={() => { onEdit(node.id, draft); setEditing(false) }}
                style={{ padding: '2px 8px', background: `${color}18`, border: `1px solid ${color}40`, color, fontFamily: MONO, fontSize: 7, fontWeight: 700, cursor: 'pointer' }}>✓</button>
              <button onClick={() => { setDraft({ label: node.label, desc: node.desc }); setEditing(false) }}
                style={{ padding: '2px 6px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', fontFamily: MONO, fontSize: 7, cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', width: '100%' }}>
            {isCurrent && (
              <span style={{ fontFamily: MONO, fontSize: 6, fontWeight: 800, letterSpacing: '0.1em', color, background: `${color}15`, border: `1px solid ${color}30`, padding: '1px 6px', display: 'inline-block', marginBottom: 4 }}>NOW</span>
            )}
            {isComplete && (
              <span style={{ fontFamily: MONO, fontSize: 6, fontWeight: 800, letterSpacing: '0.1em', color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', padding: '1px 6px', display: 'inline-block', marginBottom: 4 }}>DONE</span>
            )}
            <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '-0.01em', color: labelColor, lineHeight: 1.25, marginBottom: 2 }}>{node.label}</p>
            {node.desc && <p style={{ fontFamily: MONO, fontSize: 8, color: isFuture ? `${color}18` : `${color}55`, lineHeight: 1.4 }}>{node.desc}</p>}
          </div>
        )}

        {/* Hover actions */}
        {hov && !editing && (
          <div style={{ position: 'absolute', top: -4, right: 4, display: 'flex', gap: 3, zIndex: 20 }}>
            <button onClick={e => { e.stopPropagation(); setEditing(true) }}
              style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa', cursor: 'pointer' }}>
              <Edit3 size={8}/>
            </button>
            {!isFirst && (
              <button onClick={e => { e.stopPropagation(); onDelete(node.id) }}
                style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer' }}>
                <Trash2 size={8}/>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Connector line */}
      {!isLast && (
        <div style={{ width: 28, height: 1, flexShrink: 0, background: isComplete ? 'rgba(52,211,153,0.3)' : isCurrent ? `${color}35` : `${color}12`, position: 'relative', top: -14 }}/>
      )}
    </div>
  )
}

/* small helper so we can do rgba from hex */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}

/* ── Dashboard row ── */
function DashboardRow({ path, onUpdatePath, onDeletePath, navigate }) {
  const IconComp = ICON_MAP[path.icon] || Target
  const [adding, setAdding] = useState(false)
  const [newNode, setNewNode] = useState({ label: '', desc: '' })
  const [rowHov, setRowHov] = useState(false)
  const c = path.color

  const completedCount = path.nodes.filter(n => n.status === 'complete').length
  const pct = path.nodes.length > 0 ? Math.round((completedCount / path.nodes.length) * 100) : 0

  const cycleStatus = nodeId => {
    const node = path.nodes.find(n => n.id === nodeId)
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(node.status) + 1) % STATUS_CYCLE.length]
    onUpdatePath({ ...path, nodes: path.nodes.map(n => n.id === nodeId ? { ...n, status: next } : n) })
  }
  const editNode = (nodeId, draft) =>
    onUpdatePath({ ...path, nodes: path.nodes.map(n => n.id === nodeId ? { ...n, ...draft } : n) })
  const deleteNode = nodeId =>
    onUpdatePath({ ...path, nodes: path.nodes.filter(n => n.id !== nodeId) })
  const addNode = () => {
    if (!newNode.label.trim()) return
    onUpdatePath({ ...path, nodes: [...path.nodes, { id: Date.now().toString(), ...newNode, status: 'future' }] })
    setNewNode({ label: '', desc: '' })
    setAdding(false)
  }

  return (
    <div
      onMouseEnter={() => setRowHov(true)}
      onMouseLeave={() => setRowHov(false)}
      style={{
        display: 'flex', alignItems: 'stretch',
        background: rowHov
          ? `linear-gradient(90deg, ${c}0d 0%, rgba(9,15,30,0.97) 30%)`
          : `linear-gradient(90deg, ${c}07 0%, rgba(6,11,20,0.97) 30%)`,
        border: `1px solid ${rowHov ? c+'25' : c+'12'}`,
        borderLeft: `3px solid ${c}`,
        transition: 'all 0.22s ease',
      }}
    >
      {/* Left identity panel */}
      <div style={{
        width: 200, flexShrink: 0,
        padding: '18px 20px',
        borderRight: `1px solid ${c}12`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        gap: 10,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${c}12`, border: `1px solid ${c}30`, boxShadow: rowHov ? `0 0 14px ${c}25` : 'none', transition: 'box-shadow 0.2s', flexShrink: 0 }}>
                <IconComp size={14} style={{ color: c }}/>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 900, letterSpacing: '-0.03em', color: '#f0f6ff', lineHeight: 1 }}>{path.label}</p>
            </div>
            {/* Open detail page */}
            <button onClick={() => navigate(`/roadmap/${path.id}`)}
              title="Open full view"
              style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: `1px solid ${c}20`, color: `${c}60`, cursor: 'pointer', opacity: rowHov ? 1 : 0, transition: 'opacity 0.15s', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.borderColor=`${c}60`}
              onMouseLeave={e => e.currentTarget.style.borderColor=`${c}20`}>
              <ArrowUpRight size={10}/>
            </button>
          </div>

          {/* Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ fontFamily: MONO, fontSize: 8, color: `${c}70`, letterSpacing: '0.06em' }}>{completedCount}/{path.nodes.length} done</span>
              <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 800, color: pct > 0 ? c : `${c}30`, letterSpacing: '-0.02em' }}>{pct}%</span>
            </div>
            <div style={{ height: 2, background: `${c}12`, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${c}70, ${c})`, transition: 'width 0.5s ease' }}/>
            </div>
          </div>
        </div>

        {/* Delete path */}
        {rowHov && (
          <button onClick={() => onDeletePath(path.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', color: 'rgba(248,113,113,0.55)', fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.15s', width: 'fit-content' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(248,113,113,0.12)'; e.currentTarget.style.color='#f87171'; e.currentTarget.style.borderColor='rgba(248,113,113,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(248,113,113,0.06)'; e.currentTarget.style.color='rgba(248,113,113,0.55)'; e.currentTarget.style.borderColor='rgba(248,113,113,0.15)' }}>
            <Trash2 size={9}/> Delete path
          </button>
        )}
      </div>

      {/* Milestone timeline */}
      <div style={{ flex: 1, padding: '22px 20px 18px', display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', minWidth: 0 }}>
        {path.nodes.map((node, i) => (
          <MilestoneNode
            key={node.id} node={node} index={i} color={c}
            isFirst={i === 0} isLast={i === path.nodes.length - 1}
            onToggle={cycleStatus} onEdit={editNode} onDelete={deleteNode}
          />
        ))}

        {/* Add milestone inline */}
        {adding ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 28, height: 1, background: `${c}12`, flexShrink: 0, position: 'relative', top: -20 }}/>
            <div style={{ width: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: `1.5px dashed ${c}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Plus size={12} style={{ color: c, opacity: 0.4 }}/>
              </div>
              <input autoFocus value={newNode.label}
                onChange={e => setNewNode(n => ({ ...n, label: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') addNode(); if (e.key === 'Escape') { setAdding(false); setNewNode({ label:'', desc:'' }) } }}
                placeholder="Name…"
                style={{ width: '100%', boxSizing: 'border-box', padding: '3px 6px', background: `${c}08`, border: `1px solid ${c}35`, color: '#f0f6ff', fontSize: 10, fontFamily: SANS, fontWeight: 700, outline: 'none', textAlign: 'center' }}/>
              <input value={newNode.desc}
                onChange={e => setNewNode(n => ({ ...n, desc: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') addNode(); if (e.key === 'Escape') { setAdding(false); setNewNode({ label:'', desc:'' }) } }}
                placeholder="Desc…"
                style={{ width: '100%', boxSizing: 'border-box', padding: '2px 6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', fontSize: 8, fontFamily: MONO, outline: 'none', textAlign: 'center' }}/>
              <div style={{ display: 'flex', gap: 3 }}>
                <button onClick={addNode} style={{ padding: '2px 10px', background: `${c}15`, border: `1px solid ${c}35`, color: c, fontFamily: MONO, fontSize: 7, fontWeight: 700, cursor: 'pointer' }}>Add</button>
                <button onClick={() => { setAdding(false); setNewNode({ label:'', desc:'' }) }} style={{ padding: '2px 8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.25)', fontFamily: MONO, fontSize: 7, cursor: 'pointer' }}>✕</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginLeft: 8 }}>
            <div style={{ width: 20, height: 1, background: `${c}10`, flexShrink: 0, position: 'relative', top: 0 }}/>
            <button onClick={() => setAdding(true)}
              style={{ marginLeft: 8, width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${c}08`, border: `1.5px dashed ${c}25`, color: `${c}50`, cursor: 'pointer', transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.background=`${c}15`; e.currentTarget.style.borderColor=`${c}55`; e.currentTarget.style.color=c }}
              onMouseLeave={e => { e.currentTarget.style.background=`${c}08`; e.currentTarget.style.borderColor=`${c}25`; e.currentTarget.style.color=`${c}50` }}>
              <Plus size={11}/>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Stat strip ── */
function StatChip({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: `${color}08`, border: `1px solid ${color}18`, flex: 1 }}>
      <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 900, letterSpacing: '-0.04em', color }}>{value}</span>
      <span style={{ fontFamily: MONO, fontSize: 8, color: `${color}70`, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.4 }}>{label}</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
export default function Roadmap() {
  const navigate = useNavigate()
  const [paths, setPaths] = useLocalStorage('trackr_roadmap_paths', DEFAULT_PATHS)
  const [showAddPath, setShowAddPath] = useState(false)
  const [newPathLabel, setNewPathLabel] = useState('')

  const updatePath  = updated => setPaths(ps => ps.map(p => p.id === updated.id ? updated : p))
  const deletePath  = id => setPaths(ps => ps.filter(p => p.id !== id))

  const addPath = preset => {
    const id = Date.now().toString()
    setPaths(ps => [...ps, {
      id, label: preset?.label || newPathLabel || 'New Path',
      icon: preset?.icon || 'Target',
      color: preset?.color || '#60a5fa',
      nodes: [
        { id: '1', label: 'Start Here', desc: preset?.defaultDesc || 'Your starting point', status: 'current' },
        { id: '2', label: 'First Step', desc: 'Define your next move', status: 'future' },
      ]
    }])
    setShowAddPath(false)
    setNewPathLabel('')
  }

  const completedNodes = paths.flatMap(p => p.nodes).filter(n => n.status === 'complete').length
  const totalNodes     = paths.flatMap(p => p.nodes).length
  const overallPct     = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0
  const activeCount    = paths.flatMap(p => p.nodes).filter(n => n.status === 'active').length

  return (
    <div style={{ fontFamily: SANS, maxWidth: 1200, margin: '0 auto', paddingTop: 4 }}>
      <BackToHome />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.04em', color: '#f0f6ff', marginBottom: 5, lineHeight: 1 }}>Life Roadmap</h1>
          <p style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(96,165,250,0.5)', letterSpacing: '0.04em' }}>
            click a circle to advance · hover a milestone to edit
          </p>
        </div>
        <button onClick={() => setShowAddPath(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', border: 'none', borderRadius: 999, cursor: 'pointer', color: '#fff', fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: '0 4px 20px rgba(99,102,241,0.35)', transition: 'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.filter='brightness(1.15)'; e.currentTarget.style.transform='translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.filter='none'; e.currentTarget.style.transform='none' }}>
          <Plus size={11}/> Add Path
        </button>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <StatChip label="overall progress" value={`${overallPct}%`} color="#60a5fa"/>
        <StatChip label="life paths" value={paths.length} color="#a78bfa"/>
        <StatChip label="milestones done" value={completedNodes} color="#34d399"/>
        <StatChip label="in progress" value={activeCount} color="#fb923c"/>
      </div>

      {/* Dashboard rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {paths.map(path => (
          <DashboardRow key={path.id} path={path} onUpdatePath={updatePath} onDeletePath={deletePath} navigate={navigate}/>
        ))}
      </div>

      {/* Add path modal */}
      {showAddPath && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(16px)', animation:'fadeIn 0.15s ease' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddPath(false) }}>
          <div style={{ width:'100%', maxWidth:500, background:'linear-gradient(160deg,#080f20,#060b14)', border:'1px solid rgba(96,165,250,0.15)', boxShadow:'0 40px 100px rgba(0,0,0,0.9)', padding:28, position:'relative', animation:'slideUp 0.22s cubic-bezier(0.34,1.4,0.64,1)' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg, rgba(96,165,250,0.5), transparent)' }}/>
            <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, color:'#60a5fa', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:4 }}>New Path</p>
            <h2 style={{ fontSize:20, fontWeight:900, color:'#f0f6ff', letterSpacing:'-0.03em', marginBottom:22 }}>Choose a life dimension</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:22 }}>
              {PATH_PRESETS.map(p => {
                const Icon = ICON_MAP[p.icon] || Target
                return (
                  <button key={p.label} onClick={() => addPath(p)}
                    style={{ padding:'14px 10px', background:`${p.color}08`, border:`1px solid ${p.color}20`, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:7, transition:'all 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.background=`${p.color}18`; e.currentTarget.style.borderColor=`${p.color}50`; e.currentTarget.style.transform='translateY(-3px)' }}
                    onMouseLeave={e => { e.currentTarget.style.background=`${p.color}08`; e.currentTarget.style.borderColor=`${p.color}20`; e.currentTarget.style.transform='none' }}>
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
                <button onClick={() => addPath(null)} style={{ padding:'10px 18px', background:'rgba(96,165,250,0.12)', border:'1px solid rgba(96,165,250,0.3)', color:'#60a5fa', fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer' }}>Create</button>
              </div>
            </div>
            <button onClick={() => setShowAddPath(false)}
              style={{ position:'absolute', top:14, right:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', cursor:'pointer', color:'rgba(255,255,255,0.4)', padding:'5px 6px', display:'flex', alignItems:'center' }}
              onMouseEnter={e => e.currentTarget.style.color='#f0f6ff'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
              <X size={13}/>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulseRing { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:0.12;transform:scale(1.2)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(24px) scale(0.96)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  )
}
