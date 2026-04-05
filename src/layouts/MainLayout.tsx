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
  Menu,
  X,
  Bell,
  ChevronDown,
  Database,
  Layers,
} from 'lucide-react'
import { useAuthQuery } from '../hooks/useAuth'
import { useLogoutMutation } from '../hooks/useAuth'
import { useClientListQuery } from '../hooks/useClient'
import { useClient } from '../contexts/ClientContext'
import { UserLevel } from '../constants/userLevel'
import { th } from '../locales/th'

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { data: user } = useAuthQuery()
  const logoutMutation = useLogoutMutation()
  const { data: clientList = [] } = useClientListQuery()
  const { selectedClientId, setSelectedClientId } = useClient()

  const isSuperAdmin = user?.userLevel === UserLevel.SuperAdmin
  const isAdminUser =
    user?.userLevel === UserLevel.SuperAdmin ||
    user?.userLevel === UserLevel.ClientAdmin
  const selectedClient = clientList.find(
    (c) => String(c.key) === selectedClientId,
  )
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

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  useEffect(() => {
    const currentRef = dropdownRef.current
    const handleClickOutside = (event: MouseEvent) => {
      if (currentRef && !currentRef.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
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

  return (
    <div className='min-h-screen bg-blue-50'>
      <header className='bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-md sticky top-0 z-30'>
        <div className='flex items-center justify-between px-3 py-2 min-h-0'>
          <div className='flex items-center gap-2.5'>
            <button
              type='button'
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className='p-1.5 hover:bg-white/10 rounded-lg transition-colors'
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-white/20 rounded-md flex items-center justify-center shrink-0'>
                <Fish size={18} className='text-white' />
              </div>
              <div className='leading-tight'>
                <h1 className='text-base font-semibold tracking-tight'>
                  {L.appName}
                </h1>
                <p className='text-[10px] text-blue-100/95 leading-snug'>
                  {L.appTagline}
                </p>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              className='p-1.5 hover:bg-white/10 rounded-lg transition-colors relative'
              aria-label='Notifications'
            >
              <Bell size={18} />
              <span className='absolute top-1 right-1 w-1.5 h-1.5 bg-blue-300 rounded-full' />
            </button>

            <div className='relative' ref={dropdownRef}>
              <div
                className='flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded-lg cursor-pointer transition-colors'
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <div className='w-7 h-7 bg-white/20 rounded-full flex items-center justify-center shrink-0'>
                  <User size={15} />
                </div>
                <div className='hidden md:block text-left leading-tight'>
                  <p className='text-xs font-medium truncate max-w-[10rem]'>
                    {displayName}
                  </p>
                  <p className='text-[10px] text-blue-100'>{L.profileRole}</p>
                </div>
                <ChevronDown
                  size={14}
                  className={`shrink-0 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>

              {isProfileDropdownOpen && (
                <div className='absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50'>
                  <div className='px-4 py-3 border-b border-gray-200 bg-gray-50'>
                    <p className='text-sm font-medium text-gray-900'>
                      {displayName}
                    </p>
                    <p className='text-xs text-gray-600'>
                      {user?.contactNumber || L.profileEmail}
                    </p>
                  </div>
                  <div className='py-2'>
                    <Link
                      to='/profile'
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className='flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors'
                    >
                      <User size={18} />
                      <span>{L.myProfile}</span>
                    </Link>
                    <Link
                      to='/profile'
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className='flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors'
                    >
                      <Settings size={18} />
                      <span>{L.settings}</span>
                    </Link>
                  </div>
                  <div className='border-t border-gray-200'>
                    <button
                      type='button'
                      onClick={() => {
                        setIsProfileDropdownOpen(false)
                        handleLogout()
                      }}
                      className='w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors'
                    >
                      <LogOut size={18} />
                      <span>{L.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className='flex min-h-0'>
        <aside
          className={`shrink-0 ${
            isSidebarOpen ? 'w-[11.5rem]' : 'w-0'
          } transition-all duration-300 overflow-hidden bg-gradient-to-b from-slate-50/90 to-white border-r border-gray-200/80 shadow-[4px_0_24px_-8px_rgba(15,23,42,0.08)] sticky top-[52px] h-[calc(100vh-52px)] z-20`}
        >
          <nav className='px-2.5 py-3 h-full flex flex-col gap-0'>
            {isAdminUser && (
              <div className='pb-3 mb-3 border-b border-gray-200/90'>
                <div className='mb-2'>
                  <label className='text-[10px] font-medium text-gray-500 uppercase tracking-wider px-1 block mb-2'>
                    {L.clientView}
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className='w-full px-2.5 py-2 text-xs border border-blue-200 rounded-xl bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 outline-none transition-shadow'
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
                {selectedClient && (
                  <div className='mt-2 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-2.5 py-2 shadow-sm'>
                    <p className='text-[11px] text-blue-900 flex items-center gap-2 min-w-0'>
                      <Users size={14} className='shrink-0 text-blue-600' />
                      <span className='font-medium truncate'>
                        {selectedClient.value}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className='flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-0.5 py-0.5 space-y-1'>
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-[13px] transition-all duration-200 ${
                      active
                        ? 'font-medium text-white bg-gradient-to-r from-blue-800 to-blue-600 shadow-md shadow-blue-900/20 ring-1 ring-white/15'
                        : 'text-gray-700 hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-gray-200/80'
                    }`}
                  >
                    <Icon
                      size={17}
                      className={`shrink-0 ${active ? 'opacity-100' : 'text-gray-500'}`}
                    />
                    <span className='min-w-0 leading-snug'>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {isSuperAdmin && (
              <div className='pt-3 mt-0.5 border-t border-gray-200/90 px-0.5'>
                <div className='px-1.5 mb-1.5'>
                  <p className='text-[10px] font-medium text-gray-500 uppercase tracking-wider'>
                    {L.navAdmin}
                  </p>
                </div>
                <Link
                  to='/admin/master-data'
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-[13px] transition-all duration-200 ${
                    isActive('/admin/master-data')
                      ? 'font-medium text-white bg-gradient-to-r from-blue-800 to-blue-600 shadow-md shadow-blue-900/20 ring-1 ring-white/15'
                      : 'text-gray-700 hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-gray-200/80'
                  }`}
                >
                  <Database
                    size={17}
                    className={`shrink-0 ${isActive('/admin/master-data') ? '' : 'text-gray-500'}`}
                  />
                  <span className='min-w-0 leading-snug'>
                    {L.navMasterData}
                  </span>
                </Link>
              </div>
            )}

            <div className='pt-3 border-t border-gray-200/90 px-0.5 space-y-1'>
              <Link
                to='/profile'
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-[13px] transition-all duration-200 ${
                  isActive('/profile')
                    ? 'font-medium text-white bg-gradient-to-r from-blue-800 to-blue-600 shadow-md shadow-blue-900/20 ring-1 ring-white/15'
                    : 'text-gray-700 hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-gray-200/80'
                }`}
              >
                <Settings
                  size={17}
                  className={`shrink-0 ${isActive('/profile') ? '' : 'text-gray-500'}`}
                />
                <span className='min-w-0 leading-snug'>{L.settings}</span>
              </Link>
              <button
                type='button'
                onClick={handleLogout}
                className='w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[13px] text-red-600 hover:bg-red-50/90 hover:shadow-sm hover:ring-1 hover:ring-red-100 transition-all duration-200'
              >
                <LogOut size={17} className='shrink-0' />
                <span className='min-w-0 leading-snug'>{L.logout}</span>
              </button>
            </div>
          </nav>
        </aside>

        <main className='flex-1 min-w-0 p-6 transition-all duration-300'>
          {isAdminUser && !selectedClientId ? (
            <div className='flex items-center justify-center min-h-[50vh]'>
              <p className='text-gray-500'>{L.selectClientToView}</p>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}
