import { ChevronRight, Home, Briefcase, Building2, User, Users, Settings,
  LayoutDashboard, Telescope, Rocket, CalendarDays, BarChart3,
  Clock, BookOpen, Map, Newspaper, LayoutList, Flame, Brain,
  PenLine, FileText, Mail, DollarSign, LayoutGrid,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '../ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import ProfileDropdown from './ProfileDropdown'
import { useCheckIn } from '../../hooks/useCheckIn'

const MONO = "'Geist Mono', 'Consolas', monospace"

const NAV_GROUPS = [
  {
    label: 'Jobs', icon: Briefcase,
    items: [
      { to: '/board',           icon: LayoutDashboard, label: 'Dashboard'    },
      { to: '/jobs',            icon: Briefcase,       label: 'Jobs'         },
      { to: '/ai',              icon: LayoutGrid,      label: 'Job Toolkit'  },
      { to: '/cv/builder',      icon: PenLine,         label: 'CV Builder'   },
      { to: '/cv/reviewer',     icon: FileText,        label: 'CV Reviewer'  },
      { to: '/cv/cover-letter', icon: Mail,            label: 'Cover Letter' },
      { to: '/stats',           icon: BarChart3,       label: 'Stats'        },
    ],
  },
  {
    label: 'Business', icon: Building2,
    items: [
      { to: '/growth',  icon: Telescope, label: 'Growth Lab'     },
      { to: '/startup', icon: Rocket,    label: 'Startup Studio' },
      { to: '/pitch',   icon: Building2, label: 'Pitch Lab'      },
    ],
  },
  {
    label: 'Personal', icon: User,
    items: [
      { to: '/life',       icon: LayoutList,   label: 'Life Plan'      },
      { to: '/debrief',    icon: Flame,        label: 'Daily Debrief'  },
      { to: '/clarity',    icon: Brain,        label: 'Mental Clarity' },
      { to: '/roundtable', icon: Users,        label: 'Round Table'    },
      { to: '/calendar',   icon: CalendarDays, label: 'Calendar'       },
    ],
  },
  {
    label: 'Community', icon: Users,
    items: [
      { to: '/blog',    icon: Newspaper,  label: 'Community' },
      { to: '/roadmap', icon: Map,        label: 'Roadmap'   },
      { to: '/library', icon: BookOpen,   label: 'Library'   },
      { to: '/plans',   icon: DollarSign, label: 'Pricing'   },
    ],
  },
]

function NavGroup({ group }) {
  const { pathname } = useLocation()
  const isGroupActive = group.items.some(i => pathname === i.to || pathname.startsWith(i.to + '/'))

  return (
    <Collapsible defaultOpen={isGroupActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isGroupActive} tooltip={group.label}>
            <group.icon />
            <span>{group.label}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {group.items.map(sub => {
              const active = pathname === sub.to || pathname.startsWith(sub.to + '/')
              return (
                <SidebarMenuSubItem key={sub.to}>
                  <SidebarMenuSubButton asChild isActive={active}>
                    <NavLink to={sub.to}>
                      <sub.icon />
                      <span>{sub.label}</span>
                    </NavLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function AppSidebar() {
  const { pathname } = useLocation()
  const homeActive = pathname === '/'
  const checkInData = useCheckIn()

  return (
    <SidebarPrimitive collapsible="icon" variant="floating" style={{ fontFamily: MONO }}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={homeActive} tooltip="Home">
                  <NavLink to="/">
                    <Home />
                    <span>Home</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {NAV_GROUPS.map(group => (
                <NavGroup key={group.label} group={group} />
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Time Report">
                  <NavLink to="/time-report">
                    <Clock />
                    <span>Time Report</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px' }}>
          <div style={{ position: 'relative' }}>
            <ProfileDropdown />
            {checkInData && (
              <span style={{
                position: 'absolute', top: 0, right: 0,
                width: 10, height: 10, borderRadius: '50%',
                background: '#ff6b6b', border: '2px solid #060a14',
                boxShadow: '0 0 8px #ff6b6b',
                animation: 'checkin-pulse 1.4s ease-in-out infinite',
                pointerEvents: 'none',
              }} />
            )}
          </div>
          <span style={{ fontFamily: MONO, fontSize: 13, color: '#b9cbe8' }} className="group-data-[collapsible=icon]:hidden">
            Profile
          </span>
        </div>
        <style>{`
          @keyframes checkin-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.3); }
          }
        `}</style>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </SidebarPrimitive>
  )
}

export default AppSidebar
export { SidebarProvider, SidebarInset, SidebarTrigger }
