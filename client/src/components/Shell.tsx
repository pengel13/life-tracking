import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AREAS } from '../constants/areas.js'
import type { Area } from '../types/index.js'

function HomeIcon() {
  return (
    <svg
      width="20" height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 8.5L10 2l7.5 6.5V17.5a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5V8.5z" />
      <path d="M7.5 18v-6h5v6" />
    </svg>
  )
}

function areaAbbr(label: string): string {
  const parts = label.split(' ')
  if (parts.length >= 2 && /^\d$/.test(parts[parts.length - 1])) {
    return parts[0][0] + parts[parts.length - 1]
  }
  return label.slice(0, 2)
}

function AreaSquare({ area }: { area: Area }) {
  return (
    <span
      style={{ backgroundColor: area.color, borderRadius: '2px' }}
      className="w-9 h-9 flex items-center justify-center text-xs font-semibold text-white select-none"
    >
      {areaAbbr(area.label)}
    </span>
  )
}

export default function Shell() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isHome = pathname === '/'
  const activeAreaId = pathname.startsWith('/area/') ? pathname.split('/')[2] : null

  function SidebarItem({
    to,
    area,
    isActive,
    title,
    children,
  }: {
    to: string
    area?: Area
    isActive: boolean
    title: string
    children: React.ReactNode
  }) {
    const activeStyle = isActive && area
      ? { boxShadow: `inset 3px 0 0 ${area.color}`, backgroundColor: `${area.color}18` }
      : isActive
      ? { backgroundColor: 'rgba(148,163,184,0.1)' }
      : undefined

    return (
      <button
        onClick={() => navigate(to)}
        title={title}
        style={activeStyle}
        className="w-full h-12 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
      >
        {children}
      </button>
    )
  }

  function BottomItem({
    to,
    area,
    isActive,
    title,
    children,
  }: {
    to: string
    area?: Area
    isActive: boolean
    title: string
    children: React.ReactNode
  }) {
    return (
      <button
        onClick={() => navigate(to)}
        title={title}
        className="p-2 flex items-center justify-center transition-opacity"
        style={{
          opacity: isActive ? 1 : 0.45,
          color: isActive && !area ? '#e2e8f0' : undefined,
        }}
      >
        {children}
      </button>
    )
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className="hidden lg:flex fixed left-0 top-0 bottom-0 w-14 flex-col items-stretch py-2 z-40"
        style={{ backgroundColor: '#080f1e' }}
        aria-label="Main navigation"
      >
        <SidebarItem to="/" isActive={isHome} title="Home">
          <HomeIcon />
        </SidebarItem>

        <div className="mx-3 my-1 border-t border-slate-700/40" />

        {AREAS.map(area => (
          <SidebarItem
            key={area.id}
            to={`/area/${area.id}`}
            area={area}
            isActive={activeAreaId === area.id}
            title={area.label}
          >
            <AreaSquare area={area} />
          </SidebarItem>
        ))}
      </nav>

      {/* Mobile bottom bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-1 z-40 border-t border-slate-800/80"
        style={{ backgroundColor: '#080f1e' }}
        aria-label="Main navigation"
      >
        <BottomItem to="/" isActive={isHome} title="Home">
          <HomeIcon />
        </BottomItem>
        {AREAS.map(area => (
          <BottomItem
            key={area.id}
            to={`/area/${area.id}`}
            area={area}
            isActive={activeAreaId === area.id}
            title={area.label}
          >
            <AreaSquare area={area} />
          </BottomItem>
        ))}
      </nav>

      {/* Page content */}
      <main className="lg:ml-14 pb-16 lg:pb-0 min-h-screen">
        <Outlet />
      </main>
    </>
  )
}
