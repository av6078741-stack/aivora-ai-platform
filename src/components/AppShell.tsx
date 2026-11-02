import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Clock,
  HelpCircle,
  Home,
  LayoutGrid,
  Menu,
  MessageSquare,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Plus,
  Search,
  Settings,
  Shield,
  Sun,
  X,
} from 'lucide-react'
import { LogoLockup, LogoMark } from './Logo'
import { StatusBadge } from './StatusBadge'
import { NewChatButton } from './NewChatButton'
import { tools } from '@/lib/tools'
import {
  searchConversations,
  sortConversations,
  updateSettings,
  useConversations,
  useSettings,
} from '@/lib/store'

const primaryNav = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/chat', label: 'AI Chat', icon: MessageSquare },
  { to: '/tools', label: 'All AI Tools', icon: LayoutGrid },
  { to: '/history', label: 'History', icon: Clock },
] as const

const sidebarTools = [
  'writing',
  'study',
  'coding',
  'translate',
  'image',
  'video',
  'website',
  'app',
  'docs',
  'research',
]

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const settings = useSettings()

  useEffect(() => setDrawerOpen(false), [pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  const toggleTheme = () => updateSettings({ theme: isDark ? 'light' : 'dark' })

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-xl focus:bg-elev focus:px-4 focus:py-2"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-line bg-elev/70 transition-[width] duration-300 lg:flex ${collapsed ? 'w-[76px]' : 'w-[284px]'}`}
        aria-label="Main navigation"
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          pathname={pathname}
        />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${drawerOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!drawerOpen}
      >
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-[86%] max-w-[320px] border-r border-line bg-elev shadow-2xl transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
          aria-label="Main navigation"
          {...(!drawerOpen ? { inert: true } : {})}
        >
          <SidebarContent
            pathname={pathname}
            onClose={() => setDrawerOpen(false)}
          />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-bg/80 px-3 backdrop-blur sm:px-4">
          <button
            className="icon-btn lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="lg:hidden">
            <LogoLockup compact />
          </div>
          <span className="font-display hidden text-sm font-semibold tracking-[0.14em] min-[380px]:inline lg:hidden">
            AIVORA <span className="text-gradient">AI</span>
          </span>
          <div className="flex-1" />
          <Link
            to="/history"
            className="icon-btn"
            aria-label="Search conversations"
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>
          <button
            onClick={toggleTheme}
            className="icon-btn"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </button>
          <NewChatButton className="btn-primary !min-h-9 !px-3">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
            <span className="sr-only sm:hidden">New Chat</span>
          </NewChatButton>
          <Link
            to="/settings"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-surface-2 text-xs font-semibold text-muted hover:text-ink"
            aria-label="Profile and settings (guest)"
            title="Guest — accounts arrive in a later release"
          >
            G
          </Link>
        </header>

        <main id="main" className="relative min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({
  collapsed = false,
  onToggleCollapse,
  onClose,
  pathname,
}: {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onClose?: () => void
  pathname: string
}) {
  const conversations = useConversations()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const activeChatId = useRouterState({
    select: (s) => (s.location.search as { c?: string }).c,
  })
  const recent = searchConversations(sortConversations(conversations), query).slice(0, 30)
  const pinnedCount = conversations.filter((c) => c.pinned).length

  const navItem = (active: boolean) =>
    `flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm transition ${
      active
        ? 'bg-surface-2 text-ink shadow-[inset_0_0_0_1px_var(--border-strong)]'
        : 'text-muted hover:bg-surface hover:text-ink'
    } ${collapsed ? 'justify-center px-0' : ''}`

  return (
    <div className="flex h-full w-full flex-col">
      <div
        className={`flex h-16 shrink-0 items-center gap-2 px-4 ${collapsed ? 'justify-center px-2' : 'justify-between'}`}
      >
        {collapsed ? <LogoMark size={36} /> : <LogoLockup />}
        {onClose && (
          <button onClick={onClose} className="icon-btn" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        )}
        {onToggleCollapse && !collapsed && (
          <button
            onClick={onToggleCollapse}
            className="icon-btn"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      {collapsed && onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="icon-btn mx-auto mb-2"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="h-[18px] w-[18px]" />
        </button>
      )}

      <div className={`px-3 ${collapsed ? 'px-2' : ''}`}>
        <button
          onClick={() => navigate({ to: '/chat', search: { new: Date.now() } })}
          className={`btn-primary w-full ${collapsed ? '!px-0' : ''}`}
          aria-label="New chat"
        >
          <Plus className="h-4 w-4" />
          {!collapsed && 'New Chat'}
        </button>
      </div>

      <nav className="mt-3 min-h-0 flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin" aria-label="Sections">
        <ul className="space-y-0.5">
          {primaryNav.map((item) => {
            const active =
              item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={navItem(active)}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && item.label}
                </Link>
              </li>
            )
          })}
          <li>
            <Link
              to="/history"
              search={{ filter: 'pinned' }}
              className={navItem(false)}
              title={collapsed ? 'Saved chats' : undefined}
            >
              <Pin className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && (
                <>
                  Saved Chats
                  {pinnedCount > 0 && (
                    <span className="ml-auto text-xs text-faint">{pinnedCount}</span>
                  )}
                </>
              )}
            </Link>
          </li>
        </ul>

        {!collapsed && (
          <>
            <p className="mt-6 mb-2 px-3 text-[0.7rem] font-semibold tracking-[0.12em] text-faint uppercase">
              AI Tools
            </p>
            <ul className="space-y-0.5">
              {sidebarTools.map((id) => {
                const tool = tools.find((t) => t.id === id)!
                const active = pathname === `/tools/${id}`
                return (
                  <li key={id}>
                    <Link
                      to="/tools/$toolId"
                      params={{ toolId: id }}
                      className={navItem(active)}
                    >
                      <tool.icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="truncate">{tool.name}</span>
                      {tool.status === 'planned' && (
                        <StatusBadge status="planned" className="ml-auto" small />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="mt-6 mb-2 flex items-center justify-between px-3">
              <p className="text-[0.7rem] font-semibold tracking-[0.12em] text-faint uppercase">
                Recent
              </p>
              <span className="text-[0.65rem] text-faint">on this device</span>
            </div>
            {conversations.length > 0 && (
              <label className="relative mb-2 block">
                <span className="sr-only">Search conversations</span>
                <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search chats"
                  className="field !py-2 !pl-8 text-xs"
                />
              </label>
            )}
            {recent.length === 0 ? (
              <p className="px-3 py-2 text-xs leading-relaxed text-faint">
                {conversations.length
                  ? 'No chats match your search.'
                  : 'Your conversations will appear here.'}
              </p>
            ) : (
              <ul className="space-y-0.5">
                {recent.map((c) => {
                  const active = pathname === '/chat' && activeChatId === c.id
                  return (
                    <li key={c.id}>
                      <Link
                        to="/chat"
                        search={{ c: c.id }}
                        className={`${navItem(active)} !min-h-9`}
                      >
                        {c.pinned ? (
                          <Pin className="h-3.5 w-3.5 shrink-0 text-cyan" />
                        ) : (
                          <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        )}
                        <span className="truncate">{c.title}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </nav>

      <div className={`shrink-0 border-t border-line p-3 ${collapsed ? 'px-2' : ''}`}>
        <ul className="space-y-0.5">
          <li>
            <Link to="/settings" className={navItem(pathname === '/settings')} title={collapsed ? 'Settings' : undefined}>
              <Settings className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && 'Settings'}
            </Link>
          </li>
          <li>
            <Link to="/help" className={navItem(pathname === '/help')} title={collapsed ? 'Help & Feedback' : undefined}>
              <HelpCircle className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && 'Help & Feedback'}
            </Link>
          </li>
          <li>
            <Link to="/privacy" className={navItem(pathname === '/privacy')} title={collapsed ? 'Privacy' : undefined}>
              <Shield className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && 'Privacy'}
            </Link>
          </li>
        </ul>
        {!collapsed && (
          <p className="mt-3 px-3 text-[0.7rem] text-faint">
            <Link to="/privacy" className="hover:text-muted">Privacy Policy</Link>
            {' · '}
            <Link to="/terms" className="hover:text-muted">Terms of Service</Link>
          </p>
        )}
      </div>
    </div>
  )
}
