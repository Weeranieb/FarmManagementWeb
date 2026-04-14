import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard,
  Building,
  Fish,
  Users,
  Store,
  Package,
  User,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  ChevronLeft,
  Database,
  Layers,
} from 'lucide-react'
import { useAuthQuery, useLogoutMutation } from '../hooks/useAuth'
import { useClientListQuery } from '../hooks/useClient'
import { useClient } from '../contexts/ClientContext'
import { UserLevel } from '../constants/userLevel'
import { th } from '../locales/th'

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { data: user } = useAuthQuery()
  const logoutMutation = useLogoutMutation()
  const { data: clientList = [] } = useClientListQuery()
  const { selectedClientId, setSelectedClientId } = useClient()

  const isSuperAdmin = user?.userLevel === UserLevel.SuperAdmin
  const isAdminUser =
    user?.userLevel === UserLevel.SuperAdmin ||
    user?.userLevel === UserLevel.ClientAdmin
  const L = th.layout

  const navItems = [
    { path: '/dashboard', label: L.navDashboard, icon: LayoutDashboard },
    { path: '/farms', label: L.navFarms, icon: Building },
    { path: '/ponds', label: L.navPonds, icon: Fish },
    { path: '/farm-groups', label: L.navFarmGroups, icon: Layers },
    { path: '/workers', label: L.navWorkers, icon: Users },
    { path: '/merchants', label: L.navMerchants, icon: Store },
    { path: '/feed-collections', label: L.navFeedCollections, icon: Package },
  ]

  const isActive = (path: string) => location.pathname.startsWith(path)

  const clientFreeRoutes = ['/admin', '/profile']
  const requiresClient = !clientFreeRoutes.some((prefix) =>
    location.pathname.startsWith(prefix),
  )

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false)
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isAdminUser && clientList.length > 0 && !selectedClientId) {
      setSelectedClientId(String(clientList[0].key))
    }
  }, [isAdminUser, clientList, selectedClientId, setSelectedClientId])

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.firstName || user?.username || L.profileUser

  const sidebarWide = isSidebarOpen

  const navLinkClass = (active: boolean, collapsed: boolean) =>
    [
      'flex items-center gap-3 rounded-xl text-sm transition-colors',
      collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
      active
        ? 'border border-blue-100 bg-blue-50 font-medium text-blue-700'
        : 'border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    ].join(' ')

  return (
    <div className='flex h-screen min-h-0 overflow-hidden bg-[var(--shell-page-bg,#f8fafc)]'>
      <aside
        className={`relative z-40 flex h-full min-h-0 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm transition-[width] duration-300 ${
          sidebarWide ? 'w-60' : 'w-16'
        }`}
      >
        <button
          type='button'
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className='absolute -right-3 top-5 z-50 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-600 shadow-md transition-colors hover:bg-slate-700'
          aria-expanded={sidebarWide}
          aria-label={
            sidebarWide ? L.sidebarToggleCollapse : L.sidebarToggleExpand
          }
        >
          <ChevronLeft
            size={12}
            className={`text-white transition-transform ${sidebarWide ? '' : 'rotate-180'}`}
          />
        </button>

        <div
          className={`flex shrink-0 items-center gap-3 border-b border-slate-100 py-4 ${
            sidebarWide ? 'px-4' : 'justify-center px-2'
          }`}
        >
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50'>
            <Fish size={20} className='text-blue-600' />
          </div>
          {sidebarWide && (
            <div className='min-w-0 overflow-hidden'>
              <p className='text-base font-semibold leading-tight text-slate-900'>
                {L.appName}
              </p>
              <p className='text-xs text-slate-500'>{L.appTagline}</p>
            </div>
          )}
        </div>

        <div className='flex min-h-0 flex-1 flex-col overflow-hidden py-3'>
          {isAdminUser && sidebarWide && (
            <div className='mb-3 border-b border-slate-100 px-3 pb-3'>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                aria-label={L.selectClientPlaceholder}
                className='w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30'
              >
                <option value='' disabled>
                  {L.selectClientPlaceholder}
                </option>
                {clientList.map((client) => (
                  <option key={client.key} value={String(client.key)}>
                    {client.value}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isAdminUser && !sidebarWide && (
            <div className='mb-3 flex justify-center border-b border-slate-100 px-2 pb-3'>
              <div
                className='flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100'
                title={L.selectClientPlaceholder}
              >
                <Users size={16} className='text-slate-500' />
              </div>
            </div>
          )}

          <nav className='min-h-0 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-2'>
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={!sidebarWide ? item.label : undefined}
                  className={navLinkClass(active, !sidebarWide)}
                >
                  <Icon
                    size={19}
                    className={`shrink-0 ${active ? 'text-blue-600' : 'text-slate-500'}`}
                  />
                  {sidebarWide && (
                    <span className='truncate'>{item.label}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          {isSuperAdmin && (
            <div className='mt-2 border-t border-slate-100 px-2 pt-3'>
              {sidebarWide && (
                <p className='mb-2 px-2 text-[10px] font-medium uppercase tracking-wider text-slate-500'>
                  {L.navAdmin}
                </p>
              )}
              <Link
                to='/admin/master-data'
                title={!sidebarWide ? L.navMasterData : undefined}
                className={navLinkClass(
                  isActive('/admin/master-data'),
                  !sidebarWide,
                )}
              >
                <Database
                  size={19}
                  className={`shrink-0 ${isActive('/admin/master-data') ? 'text-blue-600' : 'text-slate-500'}`}
                />
                {sidebarWide && (
                  <span className='truncate'>{L.navMasterData}</span>
                )}
              </Link>
            </div>
          )}

          <div className='mt-auto space-y-0.5 border-t border-slate-100 px-2 pt-3'>
            <div className='relative' ref={notifRef}>
              <button
                type='button'
                title={!sidebarWide ? L.notifications : undefined}
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 ${!sidebarWide ? 'justify-center' : ''}`}
              >
                <span className='relative shrink-0'>
                  <Bell size={19} />
                  <span className='absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-sky-400' />
                </span>
                {sidebarWide && <span>{L.notifications}</span>}
              </button>
              {isNotifOpen && (
                <div
                  className={`absolute z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ${
                    sidebarWide
                      ? 'bottom-full left-0 mb-2'
                      : 'bottom-0 left-full ml-2'
                  }`}
                >
                  <div className='border-b border-slate-100 bg-slate-50 px-4 py-3'>
                    <p className='text-sm font-medium text-slate-800'>
                      {L.notifications}
                    </p>
                  </div>
                  <div className='px-4 py-6 text-center text-sm text-slate-500'>
                    —
                  </div>
                </div>
              )}
            </div>

            <Link
              to='/profile'
              title={!sidebarWide ? L.settings : undefined}
              className={navLinkClass(isActive('/profile'), !sidebarWide)}
            >
              <Settings
                size={19}
                className={`shrink-0 ${isActive('/profile') ? 'text-blue-600' : 'text-slate-500'}`}
              />
              {sidebarWide && <span className='truncate'>{L.settings}</span>}
            </Link>

            <div className='relative' ref={dropdownRef}>
              <button
                type='button'
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-100 ${!sidebarWide ? 'justify-center' : ''}`}
              >
                <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100'>
                  <User size={15} className='text-blue-700' />
                </div>
                {sidebarWide && (
                  <>
                    <div className='min-w-0 flex-1 overflow-hidden'>
                      <p className='truncate text-sm font-medium leading-tight text-slate-900'>
                        {displayName}
                      </p>
                      <p className='truncate text-xs text-slate-500'>
                        {L.profileRole}
                      </p>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`shrink-0 text-slate-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </>
                )}
              </button>

              {isProfileDropdownOpen && (
                <div
                  className={`absolute z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ${
                    sidebarWide
                      ? 'bottom-full left-0 mb-2'
                      : 'bottom-0 left-full ml-2'
                  }`}
                >
                  <div className='border-b border-slate-100 bg-slate-50 px-4 py-3'>
                    <p className='text-sm font-medium text-slate-900'>
                      {displayName}
                    </p>
                    <p className='text-xs text-slate-600'>
                      {user?.contactNumber || L.profileEmail}
                    </p>
                  </div>
                  <div className='py-1'>
                    <Link
                      to='/profile'
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className='flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-blue-50'
                    >
                      <User size={16} />
                      <span>{L.myProfile}</span>
                    </Link>
                    <Link
                      to='/profile'
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className='flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-blue-50'
                    >
                      <Settings size={16} />
                      <span>{L.settings}</span>
                    </Link>
                  </div>
                  <div className='border-t border-slate-100'>
                    <button
                      type='button'
                      disabled={logoutMutation.isPending}
                      onClick={() => {
                        setIsProfileDropdownOpen(false)
                        handleLogout()
                      }}
                      className='flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      <LogOut size={16} />
                      <span>
                        {logoutMutation.isPending
                          ? th.common.loading
                          : L.logout}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <main className='min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden'>
        <div className='p-6 lg:p-8'>
          {isAdminUser && !selectedClientId && requiresClient ? (
            <div className='flex min-h-[50vh] items-center justify-center'>
              <p className='text-slate-500'>{L.selectClientToView}</p>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  )
}
