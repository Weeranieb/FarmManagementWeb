import { useState, useMemo } from 'react'
import { useFarmListQuery } from '../../../hooks/useFarm'
import { useClient } from '../../../contexts/ClientContext'

export function useFarmsListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { selectedClientId } = useClient()
  const clientId = selectedClientId ? Number(selectedClientId) : undefined
  const { data, isLoading, error } = useFarmListQuery(clientId)
  const farms = useMemo(() => data?.farms ?? [], [data?.farms])

  const filteredFarms = useMemo(() => {
    if (!farms.length) return []
    const term = searchTerm.toLowerCase().trim()
    return farms.filter(
      (farm) =>
        (!term || farm.name.toLowerCase().includes(term)) &&
        (statusFilter === 'all' || farm.status === statusFilter),
    )
  }, [farms, searchTerm, statusFilter])

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    data,
    isLoading,
    error,
    farms,
    filteredFarms,
  }
}
