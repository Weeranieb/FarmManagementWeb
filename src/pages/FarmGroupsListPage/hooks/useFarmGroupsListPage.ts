import { useState } from 'react'
import { useIsClientAdmin } from '../../../hooks/useAuth'
import { useSelectedClientIdNum } from '../../../contexts/ClientContext'
import { useFarmGroupListQuery } from '../../../hooks/useFarmGroup'

export function useFarmGroupsListPage() {
  const clientId = useSelectedClientIdNum()
  const isAdmin = useIsClientAdmin()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: farmGroups = [], isLoading } = useFarmGroupListQuery(clientId)

  const filtered = farmGroups.filter((fg) =>
    fg.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return {
    isAdmin,
    searchTerm,
    setSearchTerm,
    isLoading,
    filtered,
  }
}
