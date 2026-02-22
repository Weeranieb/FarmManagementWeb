import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Fish,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  BarChart3,
  History,
  UtensilsCrossed,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { DailyFeedTab } from '../components/DailyFeedTab'
import { farmKeys } from '../hooks/useFarm'
import { usePondQuery, pondKeys } from '../hooks/usePond'
import { useFarmQuery } from '../hooks/useFarm'
import { StockActionModal } from '../components/StockActionModal'
import { th } from '../locales/th'

const L = th.pondDetail
const PondsL = th.ponds
const fishTypeLabels = th.fishType as Record<string, string>
function fishTypeDisplayLabel(value: string): string {
  return fishTypeLabels[value] ?? value
}

interface PondCycle {
  cycleNumber: number
  status: 'active' | 'completed'
  startDate: string
  endDate: string | null
  initialStock: number
  finalStock: number
  totalCost: number
  totalRevenue: number
  profit: number
  durationDays: number
}

const mockPondCycles: Record<string, PondCycle[]> = {
  '1': [
    {
      cycleNumber: 3,
      status: 'active',
      startDate: '2024-09-15',
      endDate: null,
      initialStock: 5000,
      finalStock: 5000,
      totalCost: 125000,
      totalRevenue: 0,
      profit: -125000,
      durationDays: 120,
    },
    {
      cycleNumber: 2,
      status: 'completed',
      startDate: '2024-05-01',
      endDate: '2024-09-10',
      initialStock: 6000,
      finalStock: 5800,
      totalCost: 145000,
      totalRevenue: 290000,
      profit: 145000,
      durationDays: 132,
    },
    {
      cycleNumber: 1,
      status: 'completed',
      startDate: '2023-11-20',
      endDate: '2024-04-25',
      initialStock: 5500,
      finalStock: 5300,
      totalCost: 138000,
      totalRevenue: 265000,
      profit: 127000,
      durationDays: 157,
    },
  ],
  '2': [
    {
      cycleNumber: 2,
      status: 'active',
      startDate: '2024-09-20',
      endDate: null,
      initialStock: 4500,
      finalStock: 4500,
      totalCost: 98000,
      totalRevenue: 0,
      profit: -98000,
      durationDays: 120,
    },
    {
      cycleNumber: 1,
      status: 'completed',
      startDate: '2024-04-10',
      endDate: '2024-09-15',
      initialStock: 5000,
      finalStock: 4800,
      totalCost: 112000,
      totalRevenue: 240000,
      profit: 128000,
      durationDays: 158,
    },
  ],
}

interface Transaction {
  id: string
  date: string
  type: 'cost' | 'revenue'
  category: string
  description: string
  amount: number
  quantity?: number
}

const mockTransactions: Record<string, Transaction[]> = {
  '1': [
    {
      id: '1',
      date: '2024-09-15',
      type: 'cost',
      category: 'Stock Purchase',
      description: 'Initial stock - 5000 Catfish fingerlings',
      amount: 75000,
      quantity: 5000,
    },
    {
      id: '2',
      date: '2024-09-20',
      type: 'cost',
      category: 'Feed',
      description: 'Premium Fish Pellets - 500 kg',
      amount: 22750,
      quantity: 500,
    },
    {
      id: '3',
      date: '2024-10-05',
      type: 'cost',
      category: 'Feed',
      description: 'Premium Fish Pellets - 600 kg',
      amount: 27300,
      quantity: 600,
    },
    {
      id: '4',
      date: '2024-10-15',
      type: 'cost',
      category: 'Labor',
      description: 'Worker salaries (October)',
      amount: 15000,
    },
    {
      id: '5',
      date: '2024-11-01',
      type: 'cost',
      category: 'Feed',
      description: 'Premium Fish Pellets - 550 kg',
      amount: 25025,
      quantity: 550,
    },
    {
      id: '6',
      date: '2024-11-10',
      type: 'cost',
      category: 'Maintenance',
      description: 'Water quality testing & treatment',
      amount: 8500,
    },
    {
      id: '7',
      date: '2024-12-01',
      type: 'cost',
      category: 'Feed',
      description: 'Premium Fish Pellets - 700 kg',
      amount: 31850,
      quantity: 700,
    },
  ],
}

export function PondDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const pondId = id != null ? Number(id) : undefined
  const {
    data: pond,
    isLoading: pondLoading,
    error: pondError,
  } = usePondQuery(pondId)
  const { data: farm } = useFarmQuery(pond?.farmId ?? 0, !!pond)
  const [activeTab, setActiveTab] = useState<
    'current' | 'history' | 'dailyfeed'
  >('current')
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [stockActionType, setStockActionType] = useState<
    'add' | 'transfer' | 'sell'
  >('add')

  if (pondId != null && (pondLoading || (pond == null && !pondError))) {
    return (
      <div className='space-y-6'>
        <div className='bg-white rounded-xl shadow-md p-12 text-center'>
          <p className='text-gray-500'>{th.common.loading}</p>
        </div>
      </div>
    )
  }

  if (pondError || !pond) {
    return (
      <div className='space-y-6'>
        <div className='bg-white rounded-xl shadow-md p-12 text-center'>
          <p className='text-gray-500'>{L.pondNotFound}</p>
          <Link
            to='/ponds'
            className='text-blue-600 hover:text-blue-700 mt-4 inline-block'
          >
            {L.backToPonds}
          </Link>
        </div>
      </div>
    )
  }

  const cycles = mockPondCycles[String(pond.id)] || []
  const currentCycle = cycles.find((c) => c.status === 'active')
  const transactions = mockTransactions[String(pond.id)] || []
  const completedCount = cycles.filter((c) => c.status === 'completed').length

  const costBreakdown = transactions
    .filter((t) => t.type === 'cost')
    .reduce(
      (acc, t) => {
        if (!acc[t.category]) acc[t.category] = 0
        acc[t.category] += t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const totalCost = Object.values(costBreakdown).reduce(
    (sum, val) => sum + val,
    0,
  )
  const totalRevenue = transactions
    .filter((t) => t.type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0)
  const profit = totalRevenue - totalCost

  const statusText =
    pond.status === 'active'
      ? PondsL.statusActive
      : pond.status === 'maintenance'
        ? PondsL.statusMaintenance
        : pond.status

  const pondForModal = {
    id: pond.id,
    name: pond.name,
    code: pond.name,
    farmId: String(pond.farmId),
    farmName: farm?.name ?? '—',
    status: pond.status,
    currentStock: pond.totalFish ?? 0,
    species: pond.fishTypes ?? [],
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link
            to='/ponds'
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            aria-label={L.backToPonds}
          >
            <ArrowLeft size={24} className='text-gray-600' />
          </Link>
          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-3xl text-gray-800'>{pond.name}</h1>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                  pond.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : pond.status === 'maintenance'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {statusText}
              </span>
            </div>
            <p className='text-gray-600 mt-1'>
              {L.farm}: {farm?.name ?? '—'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            className='flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm text-sm'
            onClick={() => {
              setStockActionType('add')
              setIsStockModalOpen(true)
            }}
          >
            <Plus size={16} />
            {L.addStock}
          </button>
          <button
            type='button'
            className='flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm text-sm'
            onClick={() => {
              setStockActionType('transfer')
              setIsStockModalOpen(true)
            }}
          >
            <ArrowRight size={16} />
            {L.transfer}
          </button>
          <button
            type='button'
            className='flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm text-sm'
            onClick={() => {
              setStockActionType('sell')
              setIsStockModalOpen(true)
            }}
          >
            <ShoppingCart size={16} />
            {L.sell}
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        <div className='lg:col-span-3 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200'>
              <div className='flex items-center gap-2 mb-1'>
                <Fish size={16} className='text-blue-600' />
                <p className='text-gray-600 text-xs'>{L.currentStockLabel}</p>
              </div>
              <p className='text-xl text-blue-600 font-semibold'>
                {(pond.totalFish ?? 0).toLocaleString()}
              </p>
            </div>
            <div className='bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-4 border border-purple-200'>
              <div className='flex items-center gap-2 mb-1'>
                <Activity size={16} className='text-purple-600' />
                <p className='text-gray-600 text-xs'>{L.ageDays}</p>
              </div>
              <p className='text-xl text-purple-600 font-semibold'>
                {pond.ageDays != null && pond.ageDays > 0 ? pond.ageDays : '—'}
              </p>
            </div>
            <div className='bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-4 border border-green-200'>
              <div className='flex items-center gap-2 mb-1'>
                <Calendar size={16} className='text-green-600' />
                <p className='text-gray-600 text-xs'>{L.beginDate}</p>
              </div>
              <p className='text-lg text-green-600 font-semibold'>
                {currentCycle?.startDate ?? pond.createdAt ?? '—'}
              </p>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-md'>
            <div className='border-b border-gray-200'>
              <nav className='flex gap-8 px-6' aria-label={L.tabsAriaLabel}>
                <button
                  type='button'
                  onClick={() => setActiveTab('current')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'current'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <BarChart3 size={18} />
                    {L.tabCurrentCycle}
                  </div>
                </button>
                <button
                  type='button'
                  onClick={() => setActiveTab('dailyfeed')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'dailyfeed'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <UtensilsCrossed size={18} />
                    {L.tabDailyFeed}
                  </div>
                </button>
                <button
                  type='button'
                  onClick={() => setActiveTab('history')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'history'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <History size={18} />
                    {L.tabCycleHistory} ({completedCount})
                  </div>
                </button>
              </nav>
            </div>

            <div className='p-6'>
              {activeTab === 'current' && (
                <div className='space-y-6'>
                  <div className='bg-white rounded-lg border border-gray-200'>
                    <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
                      <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                        <DollarSign size={20} className='text-gray-600' />
                        {L.costAnalysisTitle}
                      </h2>
                    </div>
                    <div className='p-6'>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                        <div className='bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg p-4 border border-red-200'>
                          <div className='flex items-center gap-2 mb-2'>
                            <TrendingDown size={18} className='text-red-600' />
                            <p className='text-xs text-red-700 font-medium'>
                              {L.totalCost}
                            </p>
                          </div>
                          <p className='text-2xl font-bold text-red-600'>
                            {L.currencySymbol}
                            {totalCost.toLocaleString()}
                          </p>
                        </div>
                        <div className='bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-4 border border-green-200'>
                          <div className='flex items-center gap-2 mb-2'>
                            <TrendingUp size={18} className='text-green-600' />
                            <p className='text-xs text-green-700 font-medium'>
                              {L.totalRevenue}
                            </p>
                          </div>
                          <p className='text-2xl font-bold text-green-600'>
                            {L.currencySymbol}
                            {totalRevenue.toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`rounded-lg p-4 border ${
                            profit >= 0
                              ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200'
                              : 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200'
                          }`}
                        >
                          <div className='flex items-center gap-2 mb-2'>
                            <DollarSign
                              size={18}
                              className={
                                profit >= 0
                                  ? 'text-blue-600'
                                  : 'text-orange-600'
                              }
                            />
                            <p
                              className={`text-xs font-medium ${
                                profit >= 0
                                  ? 'text-blue-700'
                                  : 'text-orange-700'
                              }`}
                            >
                              {profit >= 0 ? L.profit : L.loss}
                            </p>
                          </div>
                          <p
                            className={`text-2xl font-bold ${
                              profit >= 0 ? 'text-blue-600' : 'text-orange-600'
                            }`}
                          >
                            {L.currencySymbol}
                            {Math.abs(profit).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className='border-t border-gray-200 pt-6'>
                        <h3 className='text-sm font-semibold text-gray-800 mb-4'>
                          {L.costBreakdownByCategory}
                        </h3>
                        <div className='space-y-3'>
                          {Object.entries(costBreakdown).map(
                            ([category, amount]) => {
                              const percentage =
                                totalCost > 0 ? (amount / totalCost) * 100 : 0
                              return (
                                <div key={category}>
                                  <div className='flex items-center justify-between mb-1'>
                                    <span className='text-sm text-gray-700'>
                                      {category}
                                    </span>
                                    <span className='text-sm font-semibold text-gray-900'>
                                      {L.currencySymbol}
                                      {amount.toLocaleString()} (
                                      {percentage.toFixed(1)}%)
                                    </span>
                                  </div>
                                  <div className='w-full bg-gray-200 rounded-full h-2'>
                                    <div
                                      className='bg-blue-600 h-2 rounded-full transition-all'
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            },
                          )}
                        </div>
                      </div>

                      <div className='border-t border-gray-200 pt-6 mt-6'>
                        <h3 className='text-sm font-semibold text-gray-800 mb-4'>
                          {L.recentTransactions}
                        </h3>
                        <div className='space-y-2 max-h-96 overflow-y-auto pr-2'>
                          {transactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                            >
                              <div className='flex-1'>
                                <div className='flex items-center gap-3'>
                                  <div
                                    className={`p-2 rounded-lg ${
                                      transaction.type === 'cost'
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-green-100 text-green-600'
                                    }`}
                                  >
                                    {transaction.type === 'cost' ? (
                                      <TrendingDown size={16} />
                                    ) : (
                                      <ShoppingCart size={16} />
                                    )}
                                  </div>
                                  <div>
                                    <p className='text-sm font-medium text-gray-900'>
                                      {transaction.description}
                                    </p>
                                    <p className='text-xs text-gray-500'>
                                      {transaction.category} •{' '}
                                      {transaction.date}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className='text-right'>
                                <p
                                  className={`text-sm font-semibold ${
                                    transaction.type === 'cost'
                                      ? 'text-red-600'
                                      : 'text-green-600'
                                  }`}
                                >
                                  {transaction.type === 'cost' ? '-' : '+'}
                                  {L.currencySymbol}
                                  {transaction.amount.toLocaleString()}
                                </p>
                                {transaction.quantity != null && (
                                  <p className='text-xs text-gray-500'>
                                    {transaction.quantity} {L.units}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-lg font-semibold text-gray-800'>
                      {L.pondCycleHistory}
                    </h2>
                    <p className='text-sm text-gray-600'>
                      {L.cycleHistoryCount(completedCount)}
                    </p>
                  </div>

                  <div className='space-y-4'>
                    {cycles
                      .filter((c) => c.status === 'completed')
                      .map((cycle) => (
                        <div
                          key={cycle.cycleNumber}
                          role='button'
                          tabIndex={0}
                          className={`border rounded-lg transition-all cursor-pointer ${
                            selectedCycle === cycle.cycleNumber
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                          onClick={() =>
                            setSelectedCycle(
                              selectedCycle === cycle.cycleNumber
                                ? null
                                : cycle.cycleNumber,
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setSelectedCycle(
                                selectedCycle === cycle.cycleNumber
                                  ? null
                                  : cycle.cycleNumber,
                              )
                            }
                          }}
                        >
                          <div className='p-6'>
                            <div className='flex items-center justify-between mb-4'>
                              <div className='flex items-center gap-3'>
                                <div className='p-3 bg-blue-100 rounded-lg'>
                                  <History
                                    size={24}
                                    className='text-blue-600'
                                  />
                                </div>
                                <div>
                                  <h3 className='text-lg font-semibold text-gray-800'>
                                    {L.cycle(cycle.cycleNumber)}
                                  </h3>
                                  <p className='text-sm text-gray-600'>
                                    {cycle.startDate} → {cycle.endDate} (
                                    {L.days(cycle.durationDays)})
                                  </p>
                                </div>
                              </div>
                              <span className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium'>
                                {L.completed}
                              </span>
                            </div>

                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                              <div>
                                <p className='text-xs text-gray-600 mb-1'>
                                  {L.initialStock}
                                </p>
                                <p className='text-lg font-semibold text-gray-900'>
                                  {cycle.initialStock.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className='text-xs text-gray-600 mb-1'>
                                  {L.totalCostLabel}
                                </p>
                                <p className='text-lg font-semibold text-red-600'>
                                  {L.currencySymbol}
                                  {cycle.totalCost.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className='text-xs text-gray-600 mb-1'>
                                  {L.totalRevenueLabel}
                                </p>
                                <p className='text-lg font-semibold text-green-600'>
                                  {L.currencySymbol}
                                  {cycle.totalRevenue.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className='text-xs text-gray-600 mb-1'>
                                  {L.profitLabel}
                                </p>
                                <p
                                  className={`text-lg font-semibold ${
                                    cycle.profit >= 0
                                      ? 'text-blue-600'
                                      : 'text-orange-600'
                                  }`}
                                >
                                  {L.currencySymbol}
                                  {cycle.profit.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {selectedCycle === cycle.cycleNumber && (
                              <div className='mt-6 pt-6 border-t border-gray-200'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                  <div>
                                    <h4 className='text-sm font-semibold text-gray-800 mb-3'>
                                      {L.performanceMetrics}
                                    </h4>
                                    <div className='space-y-2'>
                                      <div className='flex justify-between'>
                                        <span className='text-sm text-gray-600'>
                                          {L.survivalRate}
                                        </span>
                                        <span className='text-sm font-medium text-gray-900'>
                                          {(
                                            (cycle.finalStock /
                                              cycle.initialStock) *
                                            100
                                          ).toFixed(1)}
                                          %
                                        </span>
                                      </div>
                                      <div className='flex justify-between'>
                                        <span className='text-sm text-gray-600'>
                                          {L.profitMargin}
                                        </span>
                                        <span className='text-sm font-medium text-gray-900'>
                                          {cycle.totalRevenue > 0
                                            ? (
                                                (cycle.profit /
                                                  cycle.totalRevenue) *
                                                100
                                              ).toFixed(1)
                                            : '0'}
                                          %
                                        </span>
                                      </div>
                                      <div className='flex justify-between'>
                                        <span className='text-sm text-gray-600'>
                                          {L.costPerDay}
                                        </span>
                                        <span className='text-sm font-medium text-gray-900'>
                                          {L.currencySymbol}
                                          {(
                                            cycle.totalCost / cycle.durationDays
                                          ).toLocaleString(undefined, {
                                            maximumFractionDigits: 0,
                                          })}
                                        </span>
                                      </div>
                                      <div className='flex justify-between'>
                                        <span className='text-sm text-gray-600'>
                                          {L.revenuePerDay}
                                        </span>
                                        <span className='text-sm font-medium text-gray-900'>
                                          {L.currencySymbol}
                                          {(
                                            cycle.totalRevenue /
                                            cycle.durationDays
                                          ).toLocaleString(undefined, {
                                            maximumFractionDigits: 0,
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className='text-sm font-semibold text-gray-800 mb-3'>
                                      {L.cycleInformation}
                                    </h4>
                                    <div className='space-y-2'>
                                      <div className='flex justify-between'>
                                        <span className='text-sm text-gray-600'>
                                          {L.duration}
                                        </span>
                                        <span className='text-sm font-medium text-gray-900'>
                                          {L.days(cycle.durationDays)} (
                                          {L.monthsApprox(
                                            Math.floor(cycle.durationDays / 30),
                                          )}
                                          )
                                        </span>
                                      </div>
                                      <div className='flex justify-between'>
                                        <span className='text-sm text-gray-600'>
                                          {L.stockHarvested}
                                        </span>
                                        <span className='text-sm font-medium text-gray-900'>
                                          {cycle.finalStock.toLocaleString()}{' '}
                                          {L.fish}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {completedCount === 0 && (
                    <div className='text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                      <History
                        size={48}
                        className='mx-auto text-gray-400 mb-3'
                      />
                      <p className='text-gray-600 mb-2'>
                        {L.noCompletedCycles}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {L.noCompletedCyclesHint}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'dailyfeed' && (
                <div className='space-y-6'>
                  <DailyFeedTab pondId={String(pond.id)} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='lg:col-span-1 space-y-6'>
          <div className='bg-white rounded-lg border border-gray-200 shadow-md p-5'>
            <h3 className='text-sm font-semibold text-gray-800 mb-3'>
              {L.species}
            </h3>
            <div className='flex flex-wrap gap-2'>
              {(pond.fishTypes ?? []).length > 0 ? (
                (pond.fishTypes ?? []).map(
                  (fishType: string, index: number) => (
                    <div
                      key={index}
                      className='flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm'
                    >
                      <Fish size={14} />
                      <span className='font-medium'>
                        {fishTypeDisplayLabel(fishType)}
                      </span>
                    </div>
                  ),
                )
              ) : (
                <p className='text-sm text-gray-500'>—</p>
              )}
            </div>
          </div>

          <div className='bg-white rounded-lg border border-gray-200 shadow-md p-5'>
            <h3 className='text-sm font-semibold text-gray-800 mb-3'>
              {L.lastActivity}
            </h3>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='p-2.5 bg-green-50 rounded-lg'>
                  <Calendar size={20} className='text-green-600' />
                </div>
                <div>
                  <p className='text-xs text-gray-600'>{L.date}</p>
                  <p className='text-sm text-gray-800 font-medium'>
                    {pond.latestActivityDate
                      ? new Date(pond.latestActivityDate).toLocaleDateString(
                          'th-TH',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          },
                        )
                      : '—'}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='p-2.5 bg-blue-50 rounded-lg'>
                  <Activity size={20} className='text-blue-600' />
                </div>
                <div>
                  <p className='text-xs text-gray-600'>{L.activityType}</p>
                  <p className='text-sm text-gray-800 font-medium capitalize'>
                    —
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg border border-gray-200 shadow-md p-5'>
            <h3 className='text-sm font-semibold text-gray-800 mb-3'>
              {L.additionalInfo}
            </h3>
            <div className='space-y-3'>
              <div>
                <p className='text-xs text-gray-600 mb-1'>{L.createdDate}</p>
                <p className='text-sm text-gray-800 font-medium'>
                  {pond.createdAt}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-600 mb-1'>{L.farmName}</p>
                <p className='text-sm text-gray-800 font-medium'>
                  {farm?.name ?? '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StockActionModal
        key={isStockModalOpen ? stockActionType : 'closed'}
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        pond={pondForModal}
        initialActionType={stockActionType}
        onFillSuccess={() => {
          queryClient.invalidateQueries({ queryKey: farmKeys.all })
          if (pondId != null) {
            queryClient.invalidateQueries({ queryKey: pondKeys.detail(pondId) })
          }
        }}
      />
    </div>
  )
}
