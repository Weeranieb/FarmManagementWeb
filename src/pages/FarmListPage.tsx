import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Edit, Eye, MapPin, Grid } from 'lucide-react'
import { mockFarms } from '../data/mockData'

export function FarmsListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredFarms = mockFarms.filter((farm) => {
    const matchesSearch =
      farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farm.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || farm.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl text-gray-800 mb-2'>Farms</h1>
          <p className='text-gray-600'>Manage your aquaculture farms</p>
        </div>
        <button className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all'>
          <Plus size={20} />
          <span>Add Farm</span>
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
              placeholder='Search farms by name, code, or location...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
          >
            <option value='all'>All Status</option>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-white rounded-xl shadow-md p-6'>
          <p className='text-gray-600 text-sm mb-1'>Total Farms</p>
          <p className='text-3xl text-gray-800'>{mockFarms.length}</p>
        </div>
        <div className='bg-white rounded-xl shadow-md p-6'>
          <p className='text-gray-600 text-sm mb-1'>Active Farms</p>
          <p className='text-3xl text-green-600'>
            {mockFarms.filter((f) => f.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Farms List */}
      <div className='bg-white rounded-xl shadow-md overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  Code
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  Farm Name
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  Location
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  Area (ha)
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  Ponds
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  Status
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  Actions
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
                      className='text-green-600 hover:text-green-700'
                    >
                      {farm.name}
                    </Link>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-600'>
                    <div className='flex items-center gap-2'>
                      <MapPin size={16} className='text-gray-400' />
                      {farm.location}
                    </div>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-900'>
                    {farm.area}
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-900'>
                    <div className='flex items-center gap-2'>
                      <Grid size={16} className='text-blue-600' />
                      {farm.pondCount}
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                        farm.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {farm.status}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-2'>
                      <Link
                        to={`/farms/${farm.id}`}
                        className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                      >
                        <Eye size={18} />
                      </Link>
                      <button className='p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors'>
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

      {filteredFarms.length === 0 && (
        <div className='bg-white rounded-xl shadow-md p-12 text-center'>
          <p className='text-gray-500'>No farms found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
