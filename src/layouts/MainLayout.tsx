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
    if (
      isAdminUser &&
      clientList.length > 0 &&
      !selectedClientId
    ) {
      setSelectedClientId(String(clientList[0].key))
    }
  }, [isAdminUser, clientList, selectedClientId, setSelectedClientId])

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.firstName || user?.username || L.profileUser

  return (
    <div className='min-h-screen bg-blue-50'>
      <header className='bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg sticky top-0 z-30'>
        <div className='flex items-center justify-between px-4 py-4'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className='p-2 hover:bg-white/10 rounded-lg transition-colors'
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center'>
                <Fish size={24} className='text-white' />
              </div>
              <div>
                <h1 className='text-xl'>{L.appName}</h1>
                <p className='text-xs text-blue-100'>{L.appTagline}</p>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-4'>
            <button
              type='button'
              className='p-2 hover:bg-white/10 rounded-lg transition-colors relative'
            >
              <Bell size={20} />
              <span className='absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full' />
            </button>

            <div className='relative' ref={dropdownRef}>
              <div
                className='flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors'
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
                  <User size={18} />
                </div>
                <div className='hidden md:block text-sm'>
                  <p>{displayName}</p>
                  <p className='text-xs text-blue-100'>{L.profileRole}</p>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
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

      <div className='flex'>
        <aside
          className={`${
            isSidebarOpen ? 'w-64' : 'w-0'
          } transition-all duration-300 overflow-hidden bg-white shadow-xl sticky top-[73px] h-[calc(100vh-73px)]`}
        >
          <nav className='p-4 space-y-2 h-full flex flex-col'>
            {isAdminUser && (
              <div className='pb-4 mb-4 border-b border-gray-200'>
                <div className='mb-2'>
                  <label className='text-xs text-gray-500 uppercase tracking-wider px-2 block mb-2'>
                    {L.clientView}
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className='w-full px-3 py-2 text-sm border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-blue-50 text-gray-800'
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
                  <div className='bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 rounded-lg p-2 mt-2'>
                    <p className='text-xs text-blue-800 flex items-center gap-2'>
                      <Users size={14} />
                      <span className='font-medium'>{selectedClient.value}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className='flex-1 overflow-y-auto space-y-2'>
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      active
                        ? 'bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {isSuperAdmin && (
              <div className='pt-4 border-t border-gray-200'>
                <div className='px-2 mb-2'>
                  <p className='text-xs text-gray-500 uppercase tracking-wider'>
                    {L.navAdmin}
                  </p>
                </div>
                <Link
                  to='/admin/master-data'
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive('/admin/master-data')
                      ? 'bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  <Database size={20} />
                  <span>{L.navMasterData}</span>
                </Link>
              </div>
            )}

            <div className='pt-4 border-t border-gray-200 space-y-2'>
              <Link
                to='/profile'
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive('/profile')
                    ? 'bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                <Settings size={20} />
                <span>{L.settings}</span>
              </Link>
              <button
                type='button'
                onClick={handleLogout}
                className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all'
              >
                <LogOut size={20} />
                <span>{L.logout}</span>
              </button>
            </div>
          </nav>
        </aside>

        <main className='flex-1 p-6 transition-all duration-300'>
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
