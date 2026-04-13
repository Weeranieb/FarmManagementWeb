import { TrendingUp, Activity, Package, LayoutDashboard } from 'lucide-react'
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
import { PageHeader } from '../../components/PageHeader'
import { useDashboardPage } from './hooks'

export function DashboardPage() {
  const { stats, monthlyData, feedData, COLORS, recentActivities, D } =
    useDashboardPage()

  return (
    <div className='space-y-6'>
      <PageHeader
        title={D.title}
        subtitle={D.subtitle}
        icon={LayoutDashboard}
      />

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

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-xl shadow-md p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl text-gray-800'>{D.productionRevenue}</h2>
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
                name={D.productionKg}
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey='revenue'
                fill='#3b82f6'
                name={D.revenueK}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className='bg-white rounded-xl shadow-md p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl text-gray-800'>{D.feedDistribution}</h2>
            <Package size={20} className='text-gray-400' />
          </div>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={feedData}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={(props) =>
                  `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`
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

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 bg-white rounded-xl shadow-md p-6'>
          <h2 className='text-xl text-gray-800 mb-4'>{D.recentActivities}</h2>
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

        <div className='bg-white rounded-xl shadow-md p-6'>
          <h2 className='text-xl text-gray-800 mb-4'>{D.quickActions}</h2>
          <div className='space-y-3'>
            <Link
              to='/farms'
              className='block p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all'
            >
              <p className='text-sm opacity-90'>{D.manage}</p>
              <p className='text-lg'>{D.farms}</p>
            </Link>
            <Link
              to='/ponds'
              className='block p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all'
            >
              <p className='text-sm opacity-90'>{D.view}</p>
              <p className='text-lg'>{D.ponds}</p>
            </Link>
            <Link
              to='/workers'
              className='block p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all'
            >
              <p className='text-sm opacity-90'>{D.manage}</p>
              <p className='text-lg'>{D.workers}</p>
            </Link>
            <Link
              to='/feed-collections'
              className='block p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all'
            >
              <p className='text-sm opacity-90'>{D.check}</p>
              <p className='text-lg'>{D.feedPrices}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
