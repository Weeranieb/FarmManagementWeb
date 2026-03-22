import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Pencil, Building } from 'lucide-react'
import { th } from '../locales/th'
import { useAuthQuery } from '../hooks/useAuth'
import { useClient } from '../contexts/ClientContext'
import { UserLevel } from '../constants/userLevel'
import { useFarmGroupListQuery } from '../hooks/useFarmGroup'

const L = th.farmGroups

export function FarmGroupsListPage() {
  const { data: user } = useAuthQuery()
  const { selectedClientId } = useClient()
  const clientId = selectedClientId ? Number(selectedClientId) : undefined
  const isAdmin = user != null && user.userLevel >= UserLevel.ClientAdmin
  const [searchTerm, setSearchTerm] = useState('')

  const { data: farmGroups = [], isLoading } = useFarmGroupListQuery(clientId)

  const filtered = farmGroups.filter((fg) =>
    fg.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl text-gray-800 mb-2'>{L.title}</h1>
          <p className='text-gray-600'>{L.subtitle}</p>
        </div>
        {isAdmin && (
          <Link
            to='/farm-groups/new'
            className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg shadow-md hover:shadow-xl hover:from-blue-700 hover:to-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200'
          >
            <Plus size={20} />
            <span>{L.addFarmGroup}</span>
          </Link>
        )}
      </div>

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
        </div>
      </div>

      {isLoading ? (
        <p className='text-gray-600'>{th.common.loading}</p>
      ) : filtered.length === 0 ? (
        <div className='bg-white rounded-xl shadow-md p-12 text-center text-gray-500'>
          {searchTerm ? L.noFarmGroups : L.noFarmGroupsYet}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filtered.map((fg) => (
            <div
              key={fg.id}
              className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow'
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='flex items-center gap-3 flex-1'>
                  <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0'>
                    <Building size={20} className='text-blue-600' />
                  </div>
                  <h3 className='text-lg text-gray-900'>{fg.name}</h3>
                </div>
                {isAdmin && (
                  <Link
                    to={`/farm-groups/${fg.id}/edit`}
                    className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0'
                    aria-label={L.editFarmGroup}
                  >
                    <Pencil size={18} />
                  </Link>
                )}
              </div>
              <div className='mt-4'>
                <div className='flex flex-wrap gap-2'>
                  {fg.farms.map((f) => (
                    <span
                      key={f.id}
                      className='inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-500/40'
                    >
                      {L.farmNamePrefix}
                      {f.name}
                    </span>
                  ))}
                  {fg.farms.length === 0 && (
                    <span className='text-sm text-gray-400 italic'>-</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
