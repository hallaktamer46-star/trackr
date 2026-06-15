import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Briefcase, BookOpen, Activity, DollarSign, Heart, Plane,
  Dumbbell, Coffee, Music, Plus, X, Target, Star, Sunset, Brain,
  Salad, Check, MapPin, Edit3, Trash2, ArrowLeft, ChevronRight,
  Zap, Flag
} from 'lucide-react'

const MONO = 'Consolas, Menlo, Monaco, monospace'
const SANS = 'Geist, Inter, sans-serif'

const ICON_MAP = { Briefcase, BookOpen, Activity, DollarSign, Heart, Plane, Dumbbell, Coffee, Music, Brain, Target, Star, Sunset, Salad }

function useLocalStorage(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init } catch { return init }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }, [key, v])
  return [v, setV]
}

const STATUS_CYCLE = ['current', 'active', 'future', 'complete']
const STATUS_META = {
  current:  { label: 'YOU ARE HERE', color: null /* uses path color */, bg: null },
  active:   { label: 'IN PROGRESS',  color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  complete: { label: 'COMPLETE',     color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  future:   { label: 'UPCOMING',     color: null,       bg: null },
}

function NodeCard({ node, index, color, isLast, onToggleStatus, onEdit, onDelete, isFirst }) {
  const [hov, setHov] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ label: node.label, desc: node.desc })

  const meta = STATUS_META[node.status] || STATUS_META.future
  const nodeColor = (node.status === 'current' || node.status === 'future' && false) ? color : meta.color || (node.status === 'future' ? `${color}30` : color)
  const isCurrent = node.status === 'current'
  const isComplete = node.status === 'complete'
  const isFuture = node.status === 'future'

  const accentColor = isComplete ? '#34d399' : isCurrent ? color : node.status === 'active' ? '#60a5fa' : `${color}35`
  const textOpacity = isFuture ? 0.45 : 1

  return (
    <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
      {/* Timeline stem + circle */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 24, flexShrink: 0, width: 48 }}>
        {/* Number bubble */}
        <div
          onClick={() => onToggleStatus(node.id)}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: isComplete
              ? 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(52,211,153,0.06))'
              : isCurrent
                ? `linear-gradient(135deg, ${color}28, ${color}08)`
                : node.status === 'active'
                  ? 'linear-gradient(135deg, rgba(96,165,250,0.18), rgba(96,165,250,0.05))'
                  : 'rgba(255,255,255,0.02)',
            border: `1.5px solid ${accentColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
            boxShadow: isCurrent
              ? `0 0 24px ${color}30, 0 0 8px ${color}20`
              : isComplete ? '0 0 16px rgba(52,211,153,0.2)' : 'none',
            transition: 'all 0.22s cubic-bezier(0.34,1.4,0.64,1)',
            position: 'relative', zIndex: 1,
          }}
        >
          {/* Pulse ring on current */}
          {isCurrent && (
            <div style={{ position:'absolute', inset:-7, borderRadius:'50%', border:`1px solid ${color}25`, animation:'pulseRing 2.2s ease-in-out infinite', pointerEvents:'none' }}/>
          )}
          {isComplete
            ? <Check size={18} style={{ color: '#34d399' }}/>
            : isCurrent
              ? <MapPin size={16} style={{ color }}/>
              : <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 800, color: accentColor, letterSpacing: '-0.03em' }}>{index + 1}</span>
          }
        </div>
        {/* Connecting line */}
        {!isLast && (
          <div style={{
            width: 1, flex: 1, minHeight: 32,
            background: isComplete
              ? 'linear-gradient(180deg, rgba(52,211,153,0.4), rgba(52,211,153,0.1))'
              : isCurrent
                ? `linear-gradient(180deg, ${color}50, ${color}10)`
                : 'rgba(255,255,255,0.05)',
            marginTop: 4,
          }}/>
        )}
      </div>

      {/* Content card */}
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          flex: 1, marginBottom: isLast ? 0 : 16,
          background: isCurrent
            ? `linear-gradient(135deg, ${color}0c, rgba(6,11,20,0.97))`
            : isComplete
              ? 'linear-gradient(135deg, rgba(52,211,153,0.06), rgba(6,11,20,0.97))'
              : node.status === 'active'
                ? 'linear-gradient(135deg, rgba(96,165,250,0.06), rgba(6,11,20,0.97))'
                : 'rgba(13,20,38,0.6)',
          border: `1px solid ${isCurrent ? color + '35' : isComplete ? 'rgba(52,211,153,0.2)' : node.status === 'active' ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.05)'}`,
          borderLeft: `2px solid ${accentColor}`,
          padding: '18px 20px',
          opacity: isFuture ? 0.65 : 1,
          transition: 'all 0.22s',
          transform: hov && !isFuture ? 'translateX(3px)' : 'none',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {isCurrent && <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg, ${color}60, transparent)`, pointerEvents:'none' }}/>}

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              autoFocus value={draft.label}
              onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
              style={{ padding:'8px 12px', background:'rgba(255,255,255,0.04)', border:`1px solid ${color}30`, color:'#f0f6ff', fontSize:15, fontFamily:SANS, fontWeight:700, outline:'none', letterSpacing:'-0.02em' }}/>
            <input
              value={draft.desc}
              onChange={e => setDraft(d => ({ ...d, desc: e.target.value }))}
              style={{ padding:'6px 12px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)', fontSize:11, fontFamily:MONO, outline:'none' }}/>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => { onEdit(node.id, draft); setEditing(false) }}
                style={{ padding:'5px 14px', background:`${color}18`, border:`1px solid ${color}40`, color, fontFamily:MONO, fontSize:9, fontWeight:700, cursor:'pointer', letterSpacing:'0.08em' }}>Save</button>
              <button onClick={() => { setDraft({ label: node.label, desc: node.desc }); setEditing(false) }}
                style={{ padding:'5px 12px', background:'transparent', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.35)', fontFamily:MONO, fontSize:9, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom: node.desc ? 6 : 0 }}>
              <div>
                {(isCurrent || node.status === 'active' || isComplete) && (
                  <span style={{
                    fontFamily:MONO, fontSize:7, fontWeight:800, letterSpacing:'0.14em',
                    color: isCurrent ? color : isComplete ? '#34d399' : '#60a5fa',
                    background: isCurrent ? `${color}15` : isComplete ? 'rgba(52,211,153,0.1)' : 'rgba(96,165,250,0.1)',
                    border: `1px solid ${isCurrent ? color+'30' : isComplete ? 'rgba(52,211,153,0.25)' : 'rgba(96,165,250,0.25)'}`,
                    padding:'2px 8px', display:'inline-block', marginBottom:8,
                  }}>{meta.label}</span>
                )}
                <p style={{ fontFamily:SANS, fontSize:17, fontWeight:800, letterSpacing:'-0.03em', color: isFuture ? 'rgba(200,220,255,0.45)' : '#f0f6ff', lineHeight:1.2, marginBottom: node.desc ? 4 : 0 }}>{node.label}</p>
              </div>

              {/* Action buttons appear on hover */}
              {hov && (
                <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                  <button onClick={() => setEditing(true)}
                    style={{ width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(96,165,250,0.08)', border:'1px solid rgba(96,165,250,0.2)', color:'#60a5fa', cursor:'pointer', transition:'all 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(96,165,250,0.18)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(96,165,250,0.08)'}>
                    <Edit3 size={11}/>
                  </button>
                  {!isFirst && (
                    <button onClick={() => onDelete(node.id)}
                      style={{ width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', color:'#f87171', cursor:'pointer', transition:'all 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(248,113,113,0.18)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(248,113,113,0.08)'}>
                      <Trash2 size={11}/>
                    </button>
                  )}
                </div>
              )}
            </div>

            {node.desc && (
              <p style={{ fontFamily:MONO, fontSize:10, color: isFuture ? `${color}30` : isCurrent ? `${color}80` : 'rgba(160,190,255,0.45)', lineHeight:1.6 }}>{node.desc}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function RoadmapDetail() {
  const { pathId } = useParams()
  const navigate = useNavigate()
  const [paths, setPaths] = useLocalStorage('trackr_roadmap_paths', [])
  const [adding, setAdding] = useState(false)
  const [newNode, setNewNode] = useState({ label: '', desc: '' })

  const path = paths.find(p => p.id === pathId)

  useEffect(() => {
    if (paths.length > 0 && !path) navigate('/roadmap', { replace: true })
  }, [paths, path, navigate])

  if (!path) return null

  const IconComp = ICON_MAP[path.icon] || Target
  const c = path.color
  const completedCount = path.nodes.filter(n => n.status === 'complete').length
  const pct = path.nodes.length > 0 ? Math.round((completedCount / path.nodes.length) * 100) : 0

  const updatePath = updated => setPaths(ps => ps.map(p => p.id === updated.id ? updated : p))

  const toggleStatus = nodeId => {
    const node = path.nodes.find(n => n.id === nodeId)
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(node.status) + 1) % STATUS_CYCLE.length]
    updatePath({ ...path, nodes: path.nodes.map(n => n.id === nodeId ? { ...n, status: next } : n) })
  }

  const editNode = (nodeId, draft) => {
    updatePath({ ...path, nodes: path.nodes.map(n => n.id === nodeId ? { ...n, ...draft } : n) })
  }

  const deleteNode = nodeId => {
    updatePath({ ...path, nodes: path.nodes.filter(n => n.id !== nodeId) })
  }

  const addNode = () => {
    if (!newNode.label.trim()) return
    updatePath({ ...path, nodes: [...path.nodes, { id: Date.now().toString(), ...newNode, status: 'future' }] })
    setNewNode({ label: '', desc: '' })
    setAdding(false)
  }

  return (
    <div style={{ fontFamily: SANS, maxWidth: 760, margin: '0 auto', paddingTop: 4, paddingBottom: 80 }}>

      {/* Back button */}
      <button
        onClick={() => navigate('/roadmap')}
        style={{
          display:'flex', alignItems:'center', gap:7, padding:'8px 14px',
          background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
          color:'rgba(200,220,255,0.5)', fontFamily:MONO, fontSize:9, fontWeight:700,
          letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer',
          marginBottom:32, transition:'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color='#f0f6ff'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)' }}
        onMouseLeave={e => { e.currentTarget.style.color='rgba(200,220,255,0.5)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)' }}
      >
        <ArrowLeft size={11}/> All Paths
      </button>

      {/* Hero header */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        padding: '36px 36px 32px',
        background: `linear-gradient(145deg, ${c}12 0%, rgba(6,11,20,0.99) 60%)`,
        border: `1px solid ${c}28`,
        borderTop: `2px solid ${c}`,
        marginBottom: 40,
        boxShadow: `0 0 80px ${c}10`,
      }}>
        {/* Top bar glow */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg, ${c}80, ${c}20, transparent)` }}/>
        {/* Background blob */}
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:`radial-gradient(circle, ${c}09 0%, transparent 70%)`, pointerEvents:'none' }}/>
        {/* Big watermark icon */}
        <div style={{ position:'absolute', bottom:-20, right:20, opacity:0.06, pointerEvents:'none' }}>
          <IconComp size={160} color={c}/>
        </div>

        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:20, position:'relative', zIndex:1 }}>
          <div style={{ flex:1 }}>
            {/* Category label */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', background:`${c}15`, border:`1px solid ${c}40`, boxShadow:`0 0 20px ${c}25` }}>
                <IconComp size={18} style={{ color: c }}/>
              </div>
              <span style={{ fontFamily:MONO, fontSize:8, fontWeight:800, letterSpacing:'0.16em', color:`${c}bb`, textTransform:'uppercase' }}>Life Path</span>
            </div>

            <h1 style={{ fontFamily:SANS, fontSize: 42, fontWeight:900, letterSpacing:'-0.045em', color:'#f0f6ff', lineHeight:1, marginBottom:12 }}>
              {path.label}
            </h1>
            <p style={{ fontFamily:MONO, fontSize:10, color:`${c}70`, letterSpacing:'0.04em' }}>
              {path.nodes.length} milestones · click any node to cycle its status
            </p>
          </div>

          {/* Progress ring area */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
            <span style={{ fontFamily:SANS, fontSize:36, fontWeight:900, letterSpacing:'-0.04em', color: pct > 0 ? c : `${c}40`, lineHeight:1 }}>{pct}%</span>
            <span style={{ fontFamily:MONO, fontSize:8, color:`${c}60`, letterSpacing:'0.08em' }}>{completedCount}/{path.nodes.length} done</span>
            {/* Mini progress bar */}
            <div style={{ width:120, height:3, background:`${c}12`, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg, ${c}80, ${c})`, transition:'width 0.6s ease' }}/>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ paddingLeft: 0 }}>
        {path.nodes.map((node, i) => (
          <NodeCard
            key={node.id}
            node={node}
            index={i}
            color={c}
            isFirst={i === 0}
            isLast={i === path.nodes.length - 1 && !adding}
            onToggleStatus={toggleStatus}
            onEdit={editNode}
            onDelete={deleteNode}
          />
        ))}

        {/* Add node inline */}
        {adding ? (
          <div style={{ display:'flex', gap:0, position:'relative' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginRight:24, flexShrink:0, width:48 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,0.02)', border:`1.5px dashed ${c}40`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Plus size={18} style={{ color: c, opacity:0.5 }}/>
              </div>
            </div>
            <div style={{ flex:1, border:`1px dashed ${c}25`, padding:'18px 20px', display:'flex', flexDirection:'column', gap:10 }}>
              <input autoFocus value={newNode.label} onChange={e => setNewNode(n => ({ ...n, label: e.target.value }))}
                placeholder="Milestone name…"
                onKeyDown={e => e.key === 'Enter' && addNode()}
                style={{ padding:'8px 12px', background:'rgba(255,255,255,0.04)', border:`1px solid ${c}30`, color:'#f0f6ff', fontSize:15, fontFamily:SANS, fontWeight:700, outline:'none', letterSpacing:'-0.02em' }}/>
              <input value={newNode.desc} onChange={e => setNewNode(n => ({ ...n, desc: e.target.value }))}
                placeholder="Short description…"
                onKeyDown={e => e.key === 'Enter' && addNode()}
                style={{ padding:'6px 12px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)', fontSize:11, fontFamily:MONO, outline:'none' }}/>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={addNode}
                  style={{ padding:'6px 18px', background:`${c}18`, border:`1px solid ${c}40`, color:c, fontFamily:MONO, fontSize:9, fontWeight:700, cursor:'pointer', letterSpacing:'0.08em', textTransform:'uppercase' }}>Add</button>
                <button onClick={() => { setAdding(false); setNewNode({ label:'', desc:'' }) }}
                  style={{ padding:'6px 12px', background:'transparent', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.3)', fontFamily:MONO, fontSize:9, cursor:'pointer' }}>Cancel</button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', gap:0 }}>
            <div style={{ width:48, marginRight:24, display:'flex', justifyContent:'center' }}>
              <div style={{ width:1, height:24, background:`${c}10` }}/>
            </div>
            <button
              onClick={() => setAdding(true)}
              style={{
                display:'flex', alignItems:'center', gap:8, padding:'11px 20px',
                background:'transparent', border:`1px dashed ${c}25`,
                color:`${c}70`, fontFamily:MONO, fontSize:9, fontWeight:700,
                letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer',
                transition:'all 0.18s', marginTop:12,
              }}
              onMouseEnter={e => { e.currentTarget.style.background=`${c}08`; e.currentTarget.style.borderColor=`${c}50`; e.currentTarget.style.color=c }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor=`${c}25`; e.currentTarget.style.color=`${c}70` }}
            >
              <Plus size={11}/> Add milestone
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulseRing { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:0.15;transform:scale(1.18)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
      `}</style>
    </div>
  )
}
