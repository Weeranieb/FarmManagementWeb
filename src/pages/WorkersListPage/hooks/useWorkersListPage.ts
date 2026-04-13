import { useState, useMemo } from 'react'
import { useAuthQuery } from '../../../hooks/useAuth'
import { useClient } from '../../../contexts/ClientContext'
import { UserLevel } from '../../../constants/userLevel'
import { useWorkerListQuery } from '../../../hooks/useWorker'
import { useFarmGroupListQuery } from '../../../hooks/useFarmGroup'
import { th } from '../../../locales/th'

const L = th.workers

export function useWorkersListPage() {
  const { data: user } = useAuthQuery()
  const { selectedClientId } = useClient()
  const clientId = selectedClientId ? Number(selectedClientId) : undefined
  const isAdmin = user != null && user.userLevel >= UserLevel.ClientAdmin
  const [searchTerm, setSearchTerm] = useState('')
  const [nationalityFilter, setNationalityFilter] = useState('all')

  const { data: workerData, isLoading } = useWorkerListQuery(clientId)
  const workers = workerData?.items ?? []

  const { data: farmGroups = [] } = useFarmGroupListQuery(clientId)

  const farmGroupMap = useMemo(() => {
    const map = new Map<number, { id: number; name: string }[]>()
    for (const fg of farmGroups) {
      map.set(fg.id, fg.farms)
    }
    return map
  }, [farmGroups])

  const nationalityFilterOptions = useMemo(
    () => ['all', 'Thai', 'Cambodian'] as const,
    [],
  )

  const nationalityLabel = (code: string) => {
    if (code === 'all') return L.allNationalities
    if (code === 'Thai') return L.nationalityThai
    if (code === 'Cambodian') return L.nationalityCambodian
    if (code === 'Myanmar') return L.nationalityMyanmar
    if (code === 'Lao') return L.nationalityLao
    return code
  }

  const filtered = workers.filter((w) => {
    const fullName = `${w.firstName} ${w.lastName ?? ''}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase())
    const matchesNat =
      nationalityFilter === 'all' || w.nationality === nationalityFilter
    return matchesSearch && matchesNat
  })

  return {
    isAdmin,
    searchTerm,
    setSearchTerm,
    nationalityFilter,
    setNationalityFilter,
    isLoading,
    filtered,
    farmGroupMap,
    nationalityFilterOptions,
    nationalityLabel,
  }
}
