import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { farmKeys } from '../../../hooks/useFarm'
import { pondApi } from '../../../api/pond'
import { usePondQuery, pondKeys } from '../../../hooks/usePond'
import { useFarmQuery } from '../../../hooks/useFarm'
import { useClientDetailQuery } from '../../../hooks/useClient'
import type { StockActionModalPond } from '../../../components/stock-action-modal/types'
import { mockPondCycles, mockTransactions } from '../mockData'

export function usePondDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const pondId = id != null ? Number(id) : undefined
  const {
    data: pond,
    isLoading: pondLoading,
    error: pondError,
  } = usePondQuery(pondId)
  const { data: farm, isPending: farmPending } = useFarmQuery(
    pond?.farmId ?? 0,
    !!pond,
  )
  const hasFarmClientId = Boolean(farm?.clientId)
  const { data: clientDetail, isFetched: clientDetailFetched } =
    useClientDetailQuery(farm?.clientId ?? 0, hasFarmClientId)
  const dailyFeedClientContextReady =
    !farmPending && (!hasFarmClientId || clientDetailFetched)
  const { data: pondListInFarm } = useQuery({
    queryKey: pondKeys.list(pond?.farmId ?? 0),
    queryFn: () => pondApi.getPondList(pond!.farmId),
    enabled: !!pond?.farmId,
    staleTime: 2 * 60 * 1000,
  })

  const availablePonds = useMemo(() => {
    if (!pondListInFarm || !pond) return undefined
    return pondListInFarm
      .filter((p) => p.id !== pond.id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        code: p.name,
        farmName: farm?.name ?? '—',
        status: p.status,
        currentStock: p.totalFish ?? 0,
        species: p.fishTypes ?? [],
      }))
  }, [pondListInFarm, pond, farm?.name])

  const farmPondsForDailyLog = useMemo(
    () =>
      (pondListInFarm ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
      })),
    [pondListInFarm],
  )

  const [activeTab, setActiveTab] = useState<
    'current' | 'history' | 'dailyfeed'
  >('current')
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [stockActionType, setStockActionType] = useState<
    'add' | 'transfer' | 'sell'
  >('add')

  const cycles = useMemo(
    () => (pond ? (mockPondCycles[String(pond.id)] ?? []) : []),
    [pond],
  )
  const transactions = useMemo(
    () => (pond ? (mockTransactions[String(pond.id)] ?? []) : []),
    [pond],
  )
  const completedCount = useMemo(
    () => cycles.filter((c) => c.status === 'completed').length,
    [cycles],
  )

  const costBreakdown = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'cost')
      .reduce(
        (acc, t) => {
          if (!acc[t.category]) acc[t.category] = 0
          acc[t.category] += t.amount
          return acc
        },
        {} as Record<string, number>,
      )
  }, [transactions])

  const totalCost = useMemo(
    () => Object.values(costBreakdown).reduce((sum, val) => sum + val, 0),
    [costBreakdown],
  )
  const totalRevenue = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'revenue')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  )
  const profit = totalRevenue - totalCost

  const pondForModal = useMemo((): StockActionModalPond => {
    if (!pond) {
      return {
        id: 0,
        name: '',
        code: '',
        farmId: '0',
        farmName: '—',
        status: 'active',
        currentStock: 0,
        species: [],
      }
    }
    return {
      id: pond.id,
      name: pond.name,
      code: pond.name,
      farmId: String(pond.farmId),
      farmName: farm?.name ?? '—',
      status: pond.status,
      currentStock: pond.totalFish ?? 0,
      species: pond.fishTypes ?? [],
    }
  }, [pond, farm?.name])

  function invalidateAfterStockFill() {
    queryClient.invalidateQueries({ queryKey: farmKeys.all })
    queryClient.invalidateQueries({ queryKey: pondKeys.lists() })
    if (pondId != null) {
      queryClient.invalidateQueries({ queryKey: pondKeys.detail(pondId) })
    }
  }

  return {
    pondId,
    pond,
    pondLoading,
    pondError,
    farm,
    farmPending,
    clientDetail,
    hasFarmClientId,
    dailyFeedClientContextReady,
    availablePonds,
    farmPondsForDailyLog,
    activeTab,
    setActiveTab,
    selectedCycle,
    setSelectedCycle,
    isStockModalOpen,
    setIsStockModalOpen,
    isExportModalOpen,
    setIsExportModalOpen,
    stockActionType,
    setStockActionType,
    cycles,
    transactions,
    completedCount,
    costBreakdown,
    totalCost,
    totalRevenue,
    profit,
    pondForModal,
    invalidateAfterStockFill,
  }
}
