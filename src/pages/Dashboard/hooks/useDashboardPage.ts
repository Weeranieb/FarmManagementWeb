import { useMemo } from 'react'
import { Building, Fish, Users, Package, DollarSign } from 'lucide-react'
import { th } from '../../../locales/th'

const D = th.dashboard

export function useDashboardPage() {
  return useMemo(
    () => ({
      stats: [
        {
          label: D.totalFarms,
          value: 0,
          change: '+2',
          icon: Building,
          color: 'from-blue-600 to-blue-700',
        },
        {
          label: D.activePonds,
          value: 0,
          change: '+3',
          icon: Fish,
          color: 'from-blue-500 to-blue-600',
        },
        {
          label: D.workers,
          value: 0,
          change: '+1',
          icon: Users,
          color: 'from-slate-700 to-slate-800',
        },
        {
          label: D.monthlyRevenue,
          value: '฿2.4M',
          change: '+12%',
          icon: DollarSign,
          color: 'from-blue-700 to-blue-800',
        },
      ],
      monthlyData: [
        { month: D.months.aug, production: 4000, revenue: 2400 },
        { month: D.months.sep, production: 3000, revenue: 1398 },
        { month: D.months.oct, production: 2000, revenue: 9800 },
        { month: D.months.nov, production: 2780, revenue: 3908 },
        { month: D.months.dec, production: 1890, revenue: 4800 },
        { month: D.months.jan, production: 2390, revenue: 3800 },
      ],
      feedData: [
        { name: D.feedTypes.premiumPellets, value: 35 },
        { name: D.feedTypes.standardFeed, value: 30 },
        { name: D.feedTypes.shrimpMix, value: 20 },
        { name: D.feedTypes.organicFeed, value: 15 },
      ],
      COLORS: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
      recentActivities: [
        {
          id: 1,
          action: D.newPondCreated,
          detail: D.pondAddedToFarm('บ่อ D1', 'ฟาร์ม River Delta'),
          time: D.hoursAgo(2),
          icon: Fish,
        },
        {
          id: 2,
          action: D.workerHired,
          detail: D.workerJoinedFarm('สมชาย ธนารักษ์', 'ฟาร์ม North Valley'),
          time: D.hoursAgo(5),
          icon: Users,
        },
        {
          id: 3,
          action: D.feedOrderPlaced,
          detail: D.feedOrderDetail('500 กก.', 'อาหารเม็ดพรีเมียม'),
          time: D.dayAgo(1),
          icon: Package,
        },
        {
          id: 4,
          action: D.farmStatusUpdated,
          detail: D.farmMarkedActive('ฟาร์ม Coastal Aqua'),
          time: D.dayAgo(2),
          icon: Building,
        },
      ],
      D,
    }),
    [],
  )
}
