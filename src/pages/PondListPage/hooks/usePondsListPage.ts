import { useState, useMemo } from 'react'
import {
  usePondListWithDetails,
  type PondWithFarmName,
} from '../../../hooks/usePond'
import { useClient } from '../../../contexts/ClientContext'

export function usePondsListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [farmFilter, setFarmFilter] = useState<string>('all')
  const [selectedPond, setSelectedPond] = useState<PondWithFarmName | null>(
    null,
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { selectedClientId } = useClient()
  const clientId = selectedClientId ? Number(selectedClientId) : undefined
  const { ponds, isLoading, error, refetch } = usePondListWithDetails(clientId)

  const farms = useMemo(() => {
    const seen = new Map<number, string>()
    ponds.forEach((p) => {
      if (!seen.has(p.farmId)) seen.set(p.farmId, p.farmName)
    })
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }))
  }, [ponds])

  const filteredPonds = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    return ponds.filter(
      (pond) =>
        (!term || pond.name.toLowerCase().includes(term)) &&
        (statusFilter === 'all' || pond.status === statusFilter) &&
        (farmFilter === 'all' || String(pond.farmId) === farmFilter),
    )
  }, [ponds, searchTerm, statusFilter, farmFilter])

  const activeCount = useMemo(
    () => ponds.filter((p) => p.status === 'active').length,
    [ponds],
  )

  const handleAddStock = (pond: PondWithFarmName) => {
    setSelectedPond(pond)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPond(null)
  }

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    farmFilter,
    setFarmFilter,
    selectedPond,
    isModalOpen,
    selectedClientId,
    ponds,
    isLoading,
    error,
    refetch,
    farms,
    filteredPonds,
    activeCount,
    handleAddStock,
    closeModal,
  }
}
