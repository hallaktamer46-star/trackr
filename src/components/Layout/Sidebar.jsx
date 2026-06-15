import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useSidebar } from '../../contexts/SidebarContext'
import {
  Home, LayoutDashboard, Briefcase, Telescope, Rocket, Building2,
  CalendarDays, BarChart3, Clock, BookOpen, Map, Newspaper,
  LayoutList, Flame, Brain, Users, PenLine, FileText, Mail,
  GraduationCap, ChevronLeft, ChevronRight, DollarSign,
} from 'lucide-react'

const MONO = 'Consolas, Menlo, Monaco, monospace'
const SANS = 'Geist, Inter, sans-serif'
export const SIDEBAR_W = 230

const SECTIONS = [
  {
    key: 'main',
    label: 'MAIN TOOLS',
    items: [
      { to: '/',        icon: Home,            label: 'Home',           end: true },
      { to: '/board',   icon: LayoutDashboard, label: 'Dashboard'               },
      { to: '/ai',      icon: Briefcase,       label: 'Job Toolkit'             },
      { to: '/growth',  icon: Telescope,       label: 'Growth Lab'              },
      { to: '/startup', icon: Rocket,          label: 'Startup Studio'          },
      { to: '/pitch',   icon: Building2,       label: 'Pitch Lab'               },
    ],
  },
  {
    key: 'cv',
    label: 'CV HUB',
    items: [
      { to: '/cv/builder',      icon: PenLine,  label: 'CV Builder',   accent: '#a3c9ff' },
      { to: '/cv/reviewer',     icon: FileText, label: 'CV Reviewer',  accent: '#4edea3' },
      { to: '/cv/cover-letter', icon: Mail,     label: 'Cover Letter', accent: '#ffb689' },
    ],
  },
  {
    key: 'personal',
    label: 'PERSONAL',
    items: [
      { to: '/life',       icon: LayoutList, label: 'Life Plan'      },
      { to: '/debrief',    icon: Flame,      label: 'Daily Debrief'  },
      { to: '/clarity',    icon: Brain,      label: 'Mental Clarity' },
      { to: '/roundtable', icon: Users,      label: 'Round Table'    },
    ],
  },
  {
    key: 'more',
    label: 'MORE',
    items: [
      { to: '/jobs',        icon: Briefcase,     label: 'Jobs'        },
      { to: '/calendar',    icon: CalendarDays,  label: 'Calendar'    },
      { to: '/stats',       icon: BarChart3,     label: 'Stats'       },
      { to: '/time-report', icon: Clock,         label: 'Time Report' },
      { to: '/blog',        icon: Newspaper,     label: 'Community'   },
      { to: '/roadmap',     icon: Map,           label: 'Roadmap'     },
      { to: '/library',     icon: BookOpen,      label: 'Library'     },
      { to: '/plans',       icon: DollarSign,    label: 'Pricing'     },
      { label: 'Market',    icon: BarChart3,     soon: true           },
      { label: 'Skills',    icon: GraduationCap, soon: true           },
    ],
  },
]

const DEFAULT_EXPANDED = { main: true, cv: true, personal: true, more: false }

function NavItem({ to, icon: Icon, label, end, soon, tag, accent }) {
  if (soon) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:9, padding:'5px 14px 5px 26px', opacity:0.25, cursor:'default' }}>
        <Icon size={12} style={{ color:'#3a5070', flexShrink:0 }}/>
        <span style={{ fontFamily:SANS, fontSize:12, color:'#3a5070', flex:1 }}>{label}</span>
        <span style={{ fontFamily:MONO, fontSize:7, color:'#1e3050', letterSpacing:'0.08em' }}>SOON</span>
      </div>
    )
  }
  return (
    <NavLink to={to} end={end} style={{ textDecoration:'none', display:'block' }}>
      {({ isActive }) => (
        <div
          style={{
            display:'flex', alignItems:'center', gap:9, padding:'5px 14px 5px 26px',
            background: isActive ? `${accent||'#60a5fa'}0f` : 'transparent',
            borderLeft: `2px solid ${isActive ? (accent||'#60a5fa') : 'transparent'}`,
            transition:'background 0.12s',
            cursor:'pointer',
          }}
          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background='rgba(96,165,250,0.05)' }}
          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background='transparent' }}
        >
          <Icon size={12} style={{ color: isActive ? (accent||'#60a5fa') : 'rgba(80,120,180,0.55)', flexShrink:0 }}/>
          <span style={{ fontFamily:SANS, fontSize:12, fontWeight:isActive?600:400, color:isActive?'#e2e2e8':'rgba(140,175,220,0.7)', flex:1, letterSpacing:'-0.01em' }}>
            {label}
          </span>
          {tag && (
            <span style={{ fontFamily:MONO, fontSize:7, fontWeight:700, color:accent, background:`${accent}12`, border:`0.5px solid ${accent}28`, padding:'1px 4px', letterSpacing:'0.06em', flexShrink:0 }}>
              {tag}
            </span>
          )}
        </div>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { open, toggle } = useSidebar()

  const [expanded, setExpanded] = useState(() => {
    try { return { ...DEFAULT_EXPANDED, ...JSON.parse(localStorage.getItem('trackr_sidebar_sections') || '{}') } }
    catch { return DEFAULT_EXPANDED }
  })

  useEffect(() => {
    try { localStorage.setItem('trackr_sidebar_sections', JSON.stringify(expanded)) } catch {}
  }, [expanded])

  const toggleSection = key => setExpanded(e => ({ ...e, [key]: !e[key] }))

  return (
    <div style={{
      position: 'fixed',
      top: 56,
      left: 0,
      bottom: 0,
      width: SIDEBAR_W,
      background: '#080b12',
      borderRight: '1px solid rgba(48,54,61,0.7)',
      zIndex: 20,
      transform: `translateX(${open ? 0 : -SIDEBAR_W}px)`,
      transition: 'transform 0.22s cubic-bezier(0.22,1,0.36,1)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}>

      {/* Close strip */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'8px 10px 6px', borderBottom:'1px solid rgba(48,54,61,0.4)', flexShrink:0 }}>
        <button onClick={toggle}
          style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', color:'#4a6fa5', padding:'4px 8px', fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', transition:'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color='#a3c9ff'}
          onMouseLeave={e => e.currentTarget.style.color='#4a6fa5'}>
          <ChevronLeft size={11}/> Close
        </button>
      </div>

      {/* Sections */}
      <div style={{ flex:1, paddingBottom:16 }}>
        {SECTIONS.map(({ key, label, items }) => {
          const isOpen = expanded[key]
          return (
            <div key={key}>
              {/* Section header — clickable */}
              <button
                onClick={() => toggleSection(key)}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  width:'100%', padding:'12px 14px 8px',
                  background: isOpen ? 'rgba(0,212,255,0.04)' : 'none',
                  border:'none', cursor:'pointer',
                  borderTop: key !== 'main' ? '1px solid rgba(48,54,61,0.4)' : 'none',
                  marginTop: key !== 'main' ? 2 : 0,
                  transition:'background 0.15s',
                }}
                onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background='rgba(96,165,250,0.04)' }}
                onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background='none' }}
              >
                <span style={{
                  fontFamily: '"Geist", Inter, sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isOpen ? '#00d4ff' : '#4a6fa5',
                  transition: 'color 0.15s',
                }}>
                  {label}
                </span>
                <ChevronRight
                  size={13}
                  style={{
                    color: isOpen ? '#00d4ff' : '#2a4878',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.18s ease, color 0.15s',
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Items — collapse/expand */}
              <div style={{
                overflow: 'hidden',
                maxHeight: isOpen ? items.length * 34 + 8 : 0,
                transition: 'max-height 0.22s cubic-bezier(0.22,1,0.36,1)',
              }}>
                {items.map(item => <NavItem key={item.to || item.label} {...item} />)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ padding:'10px 14px', borderTop:'1px solid rgba(48,54,61,0.4)', flexShrink:0 }}>
        <p style={{ fontFamily:MONO, fontSize:8, color:'rgba(30,50,80,0.5)', letterSpacing:'0.06em' }}>Trackr © 2026</p>
      </div>
    </div>
  )
}
