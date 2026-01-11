import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Eye, Fish, Building } from 'lucide-react'
import { mockPonds } from '../data/mockData'

export function PondsListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredPonds = mockPonds.filter((pond) => {
    const matchesSearch =
      pond.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pond.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || pond.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl text-gray-800 mb-2'>Ponds</h1>
          <p className='text-gray-600'>Manage your aquaculture ponds</p>
        </div>
        <button className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all'>
          <Plus size={20} />
          <span>Add Pond</span>
        </button>
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
              placeholder='Search ponds...'
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
            <option value='maintenance'>Maintenance</option>
          </select>
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-md overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  Code
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  Pond Name
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  Farm
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  Area (ha)
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  Depth (m)
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  Stock
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
              {filteredPonds.map((pond) => (
                <tr
                  key={pond.id}
                  className='hover:bg-gray-50 transition-colors'
                >
                  <td className='px-6 py-4 text-sm text-gray-900'>
                    {pond.code}
                  </td>
                  <td className='px-6 py-4'>
                    <Link
                      to={`/ponds/${pond.id}`}
                      className='text-green-600 hover:text-green-700'
                    >
                      {pond.name}
                    </Link>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-600'>
                    <div className='flex items-center gap-2'>
                      <Building size={16} className='text-gray-400' />
                      {pond.farmName}
                    </div>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-900'>
                    {pond.area}
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-900'>
                    {pond.depth}
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-900'>
                    <div className='flex items-center gap-2'>
                      <Fish size={16} className='text-blue-600' />
                      {pond.currentStock.toLocaleString()}
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                        pond.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : pond.status === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {pond.status}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <Link
                      to={`/ponds/${pond.id}`}
                      className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex'
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
