import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useFarmQuery } from '../../../hooks/useFarm'
import { pondApi } from '../../../api/pond'
import { pondKeys } from '../../../hooks/usePond'

export function useFarmDetailPage() {
  const { id } = useParams()
  const farmId = id != null ? Number(id) : NaN
  const {
    data: farm,
    isLoading: farmLoading,
    error: farmError,
  } = useFarmQuery(farmId, !!id)
  const { data: farmPonds = [] } = useQuery({
    queryKey: pondKeys.list(farmId),
    queryFn: () => pondApi.getPondList(farmId),
    enabled: Number.isFinite(farmId) && !!farm,
    staleTime: 2 * 60 * 1000,
  })
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  return {
    id,
    farmId,
    farm,
    farmLoading,
    farmError,
    farmPonds,
    isExportModalOpen,
    setIsExportModalOpen,
  }
}
