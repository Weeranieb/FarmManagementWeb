import {
  Building,
  Fish,
  Users,
  TrendingUp,
  Package,
  DollarSign,
  Activity,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Link } from 'react-router-dom'
import { mockFarms, mockPonds, mockWorkers } from '../mockData/mockData'

export function DashboardPage() {
  const stats = [
    {
      label: 'Total Farms',
      value: mockFarms.length,
      change: '+2',
      icon: Building,
      color: 'from-blue-600 to-blue-700',
    },
    {
      label: 'Active Ponds',
      value: mockPonds.filter((p) => p.status === 'active').length,
      change: '+3',
      icon: Fish,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Workers',
      value: mockWorkers.filter((w) => w.status === 'active').length,
      change: '+1',
      icon: Users,
      color: 'from-slate-700 to-slate-800',
    },
    {
      label: 'Monthly Revenue',
      value: '฿2.4M',
      change: '+12%',
      icon: DollarSign,
      color: 'from-blue-700 to-blue-800',
    },
  ]

  const monthlyData = [
    { month: 'Aug', production: 4000, revenue: 2400 },
    { month: 'Sep', production: 3000, revenue: 1398 },
    { month: 'Oct', production: 2000, revenue: 9800 },
    { month: 'Nov', production: 2780, revenue: 3908 },
    { month: 'Dec', production: 1890, revenue: 4800 },
    { month: 'Jan', production: 2390, revenue: 3800 },
  ]

  const feedData = [
    { name: 'Premium Pellets', value: 35 },
    { name: 'Standard Feed', value: 30 },
    { name: 'Shrimp Mix', value: 20 },
    { name: 'Organic Feed', value: 15 },
  ]

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']

  const recentActivities = [
    {
      id: 1,
      action: 'New pond created',
      detail: 'Pond D1 added to River Delta Farm',
      time: '2 hours ago',
      icon: Fish,
    },
    {
      id: 2,
      action: 'Worker hired',
      detail: 'Somchai Thanarak joined North Valley Farm',
      time: '5 hours ago',
      icon: Users,
    },
    {
      id: 3,
      action: 'Feed order placed',
      detail: '500kg Premium Fish Pellets ordered',
      time: '1 day ago',
      icon: Package,
    },
    {
      id: 4,
      action: 'Farm status updated',
      detail: 'Coastal Aqua Farm marked as active',
      time: '2 days ago',
      icon: Building,
    },
  ]

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div>
        <h1 className='text-3xl text-gray-800 mb-2'>Dashboard</h1>
        <p className='text-gray-600'>
          Welcome back! Here's what's happening with your farms today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow'
            >
              <div className='flex items-start justify-between mb-4'>
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}
                >
                  <Icon className='text-white' size={24} />
                </div>
                <span className='flex items-center gap-1 text-green-600 text-sm'>
                  <TrendingUp size={16} />
                  {stat.change}
                </span>
              </div>
              <p className='text-gray-600 text-sm mb-1'>{stat.label}</p>
              <p className='text-3xl text-gray-800'>{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Production & Revenue Chart */}
        <div className='bg-white rounded-xl shadow-md p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl text-gray-800'>Production & Revenue</h2>
            <Activity size={20} className='text-gray-400' />
          </div>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis dataKey='month' stroke='#6b7280' />
              <YAxis stroke='#6b7280' />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar
                dataKey='production'
                fill='#10b981'
                name='Production (kg)'
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey='revenue'
                fill='#3b82f6'
                name='Revenue (฿k)'
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feed Distribution */}
        <div className='bg-white rounded-xl shadow-md p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl text-gray-800'>Feed Distribution</h2>
            <Package size={20} className='text-gray-400' />
          </div>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={feedData}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill='#8884d8'
                dataKey='value'
              >
                {feedData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Recent Activities */}
        <div className='lg:col-span-2 bg-white rounded-xl shadow-md p-6'>
          <h2 className='text-xl text-gray-800 mb-4'>Recent Activities</h2>
          <div className='space-y-4'>
            {recentActivities.map((activity) => {
              const Icon = activity.icon
              return (
                <div
                  key={activity.id}
                  className='flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors'
                >
                  <div className='p-2 bg-green-100 rounded-lg'>
                    <Icon size={20} className='text-green-600' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-gray-800'>{activity.action}</p>
                    <p className='text-sm text-gray-600'>{activity.detail}</p>
                  </div>
                  <span className='text-xs text-gray-500'>{activity.time}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className='bg-white rounded-xl shadow-md p-6'>
          <h2 className='text-xl text-gray-800 mb-4'>Quick Actions</h2>
          <div className='space-y-3'>
            <Link
              to='/farms'
              className='block p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all'
            >
              <p className='text-sm opacity-90'>Manage</p>
              <p className='text-lg'>Farms</p>
            </Link>
            <Link
              to='/ponds'
              className='block p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all'
            >
              <p className='text-sm opacity-90'>View</p>
              <p className='text-lg'>Ponds</p>
            </Link>
            <Link
              to='/workers'
              className='block p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all'
            >
              <p className='text-sm opacity-90'>Manage</p>
              <p className='text-lg'>Workers</p>
            </Link>
            <Link
              to='/feed-collections'
              className='block p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all'
            >
              <p className='text-sm opacity-90'>Check</p>
              <p className='text-lg'>Feed Prices</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
