import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
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
} from 'lucide-react'

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/farms', label: 'Farms', icon: Building },
    { path: '/ponds', label: 'Ponds', icon: Fish },
    { path: '/workers', label: 'Workers', icon: Users },
    { path: '/merchants', label: 'Merchants', icon: Store },
    { path: '/feed-collections', label: 'Feed Collections', icon: Package },
  ]

  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    // In a real app, this would clear auth tokens
    window.location.reload()
  }

  return (
    <div className='min-h-screen bg-blue-50'>
      {/* Top Header */}
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
                <h1 className='text-xl'>BoonmaFarm</h1>
                <p className='text-xs text-blue-100'>Farm Management System</p>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-4'>
            <button className='p-2 hover:bg-white/10 rounded-lg transition-colors relative'>
              <Bell size={20} />
              <span className='absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full'></span>
            </button>

            <div className='flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors'>
              <div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
                <User size={18} />
              </div>
              <div className='hidden md:block text-sm'>
                <p>Admin User</p>
                <p className='text-xs text-blue-100'>Administrator</p>
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </header>

      <div className='flex'>
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'w-64' : 'w-0'
          } transition-all duration-300 overflow-hidden bg-white shadow-xl sticky top-[73px] h-[calc(100vh-73px)]`}
        >
          <nav className='p-4 space-y-2'>
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

            <div className='pt-4 mt-4 border-t border-gray-200 space-y-2'>
              <Link
                to='/profile'
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive('/profile')
                    ? 'bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                <Settings size={20} />
                <span>Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all'
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 p-6 transition-all duration-300`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
