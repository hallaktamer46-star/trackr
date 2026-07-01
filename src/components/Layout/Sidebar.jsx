import { ChevronRight, Home, Briefcase, Building2, User, Users, Settings, Activity,
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
  SidebarGroupLabel,
  SidebarHeader,
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

  return (
    <SidebarPrimitive collapsible="icon" variant="floating">
      <SidebarHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px' }}>
          <div style={{
            width: 22, height: 22, flexShrink: 0,
            background: 'linear-gradient(135deg,#00d4ff,#60a5fa)',
            borderRadius: 6,
            boxShadow: '0 0 12px rgba(0,212,255,0.35)',
          }} />
          <span style={{
            fontFamily: MONO, fontSize: 13, fontWeight: 700, color: '#eaf4ff',
            letterSpacing: '0.02em', whiteSpace: 'nowrap',
          }} className="group-data-[collapsible=icon]:hidden">
            TRACKR
          </span>
        </div>
      </SidebarHeader>

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
