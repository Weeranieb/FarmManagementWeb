import { useState } from 'react'
import { useAuthQuery } from '../../../hooks/useAuth'
import { useClient } from '../../../contexts/ClientContext'
import { UserLevel } from '../../../constants/userLevel'
import { useFarmGroupListQuery } from '../../../hooks/useFarmGroup'

export function useFarmGroupsListPage() {
  const { data: user } = useAuthQuery()
  const { selectedClientId } = useClient()
  const clientId = selectedClientId ? Number(selectedClientId) : undefined
  const isAdmin = user != null && user.userLevel >= UserLevel.ClientAdmin
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
