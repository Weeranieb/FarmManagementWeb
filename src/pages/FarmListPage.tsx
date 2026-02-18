import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Edit, Eye, Calendar } from 'lucide-react'
import { useFarmsQuery } from '../hooks/useFarm'
import { th } from '../locales/th'

const L = th.farms

export function FarmsListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: farms = [], isLoading, error } = useFarmsQuery()

  const filteredFarms = useMemo(() => {
    if (!farms.length) return []

    return farms.filter((farm) => {
      const matchesSearch =
        farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farm.code.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [farms, searchTerm])

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl text-gray-800 mb-2'>{L.title}</h1>
          <p className='text-gray-600'>{L.subtitle}</p>
        </div>
        <button className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all'>
          <Plus size={20} />
          <span>{L.addFarm}</span>
        </button>
      </div>

      {/* Filters */}
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

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-white rounded-xl shadow-md p-6'>
          <p className='text-gray-600 text-sm mb-1'>{L.totalFarms}</p>
          <p className='text-3xl text-gray-800'>{farms.length}</p>
        </div>
        <div className='bg-white rounded-xl shadow-md p-6'>
          <p className='text-gray-600 text-sm mb-1'>{L.filteredResults}</p>
          <p className='text-3xl text-green-600'>{filteredFarms.length}</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='bg-white rounded-xl shadow-md p-12 text-center'>
          <p className='text-gray-500'>{L.loadingFarms}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-xl shadow-md p-6'>
          <p className='text-red-800'>
            {L.errorLoading}{' '}
            {error instanceof Error ? error.message : L.unknownError}
          </p>
        </div>
      )}

      {/* Farms List */}
      {!isLoading && !error && (
        <>
          <div className='bg-white rounded-xl shadow-md overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th className='px-6 py-4 text-left text-sm text-gray-600'>
                      {L.code}
                    </th>
                    <th className='px-6 py-4 text-left text-sm text-gray-600'>
                      {L.farmName}
                    </th>
                    <th className='px-6 py-4 text-left text-sm text-gray-600'>
                      {L.createdAt}
                    </th>
                    <th className='px-6 py-4 text-left text-sm text-gray-600'>
                      {L.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {filteredFarms.map((farm) => (
                    <tr
                      key={farm.id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4 text-sm text-gray-900'>
                        {farm.code}
                      </td>
                      <td className='px-6 py-4'>
                        <Link
                          to={`/farms/${farm.id}`}
                          className='text-green-600 hover:text-green-700 font-medium'
                        >
                          {farm.name}
                        </Link>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        <div className='flex items-center gap-2'>
                          <Calendar size={16} className='text-gray-400' />
                          {new Date(farm.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <Link
                            to={`/farms/${farm.id}`}
                            className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                            title={L.viewDetails}
                          >
                            <Eye size={18} />
                          </Link>
                          <button
                            className='p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors'
                            title={L.editFarm}
                          >
                            <Edit size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredFarms.length === 0 && farms.length > 0 && (
            <div className='bg-white rounded-xl shadow-md p-12 text-center'>
              <p className='text-gray-500'>
                {L.noMatchingSearch}
              </p>
            </div>
          )}

          {farms.length === 0 && !isLoading && (
            <div className='bg-white rounded-xl shadow-md p-12 text-center'>
              <p className='text-gray-500'>
                {L.noFarmsYet}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
