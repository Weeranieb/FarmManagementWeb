import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Pencil, Users as UsersIcon, Phone } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { th } from '../locales/th'
import { useAuthQuery } from '../hooks/useAuth'
import { useClient } from '../contexts/ClientContext'
import { UserLevel } from '../constants/userLevel'
import { useWorkerListQuery } from '../hooks/useWorker'
import { useFarmGroupListQuery } from '../hooks/useFarmGroup'

const L = th.workers

export function WorkersListPage() {
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

  return (
    <div className='space-y-6'>
      <PageHeader
        title={L.title}
        subtitle={L.subtitle}
        icon={UsersIcon}
        actions={
          isAdmin ? (
            <Link
              to='/workers/new'
              className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-blue-600 hover:to-blue-500'
            >
              <Plus size={18} />
              <span>{L.addWorker}</span>
            </Link>
          ) : undefined
        }
      />

      <div className='bg-white rounded-xl shadow-md p-6'>
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='flex-1 relative'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
              size={20}
            />
            <input
              type='text'
              placeholder={L.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
            />
          </div>
          <select
            value={nationalityFilter}
            onChange={(e) => setNationalityFilter(e.target.value)}
            className='px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
          >
            {nationalityFilterOptions.map((nat) => (
              <option key={nat} value={nat}>
                {nationalityLabel(nat)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className='text-gray-600'>{th.common.loading}</p>
      ) : filtered.length === 0 ? (
        <div className='bg-white rounded-xl shadow-md p-12 text-center text-gray-500'>
          {searchTerm || nationalityFilter !== 'all'
            ? L.noWorkersFound
            : L.noWorkersYet}
        </div>
      ) : (
        <div className='bg-white rounded-xl shadow-md overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-6 py-4 text-left text-sm text-gray-600'>
                    {L.name}
                  </th>
                  <th className='px-6 py-4 text-left text-sm text-gray-600'>
                    {L.contact}
                  </th>
                  <th className='px-6 py-4 text-left text-sm text-gray-600'>
                    {L.assignedFarms}
                  </th>
                  <th className='px-6 py-4 text-left text-sm text-gray-600'>
                    {L.nationality}
                  </th>
                  <th className='px-6 py-4 text-left text-sm text-gray-600'>
                    {L.salary}
                  </th>
                  {isAdmin && (
                    <th className='px-6 py-4 text-left text-sm text-gray-600'>
                      {L.actions}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {filtered.map((worker) => {
                  const assignedFarms =
                    farmGroupMap.get(worker.farmGroupId) ?? []
                  return (
                    <tr
                      key={worker.id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                            <UsersIcon size={20} className='text-green-600' />
                          </div>
                          <div>
                            <p className='text-gray-900'>
                              {`${worker.firstName} ${worker.lastName ?? ''}`.trim()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        <div className='flex items-center gap-2'>
                          <Phone size={16} className='text-gray-400' />
                          {worker.contactNumber || '–'}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        {assignedFarms.length > 0 ? (
                          <div className='flex flex-wrap gap-1'>
                            {assignedFarms.map((f) => (
                              <span
                                key={f.id}
                                className='inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs'
                              >
                                {th.farmGroups.farmNamePrefix}
                                {f.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className='text-sm text-gray-400 italic'>
                            {L.noFarmsAssigned}
                          </span>
                        )}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-900'>
                        {nationalityLabel(worker.nationality)}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-900'>
                        ฿{worker.salary.toLocaleString()}
                      </td>
                      {isAdmin && (
                        <td className='px-6 py-4'>
                          <Link
                            to={`/workers/${worker.id}/edit`}
                            className='p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors inline-flex'
                          >
                            <Pencil size={18} />
                          </Link>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
