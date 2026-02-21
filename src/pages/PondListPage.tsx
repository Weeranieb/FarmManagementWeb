import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Eye, Fish, Building } from 'lucide-react'
import { mockPonds } from '../data/mockData'
import { StatusBadge } from '../components/StatusBadge'
import { th } from '../locales/th'

const L = th.ponds

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
          <h1 className='text-3xl text-gray-800 mb-2'>{L.title}</h1>
          <p className='text-gray-600'>{L.subtitle}</p>
        </div>
        <button className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all'>
          <Plus size={20} />
          <span>{L.addPond}</span>
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
              placeholder={L.searchPlaceholder}
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
            <option value='all'>{L.allStatus}</option>
            <option value='active'>{L.statusActive}</option>
            <option value='inactive'>{L.statusInactive}</option>
            <option value='maintenance'>{L.statusMaintenance}</option>
          </select>
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-md overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  {L.code}
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  {L.pondName}
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  {L.farm}
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  {L.areaHa}
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  {L.depthM}
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  {L.stock}
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  {L.status}
                </th>
                <th className='px-6 py-4 text-left text-sm text-gray-600'>
                  {L.actions}
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
                    <StatusBadge status={pond.status} className='px-3 py-1' />
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
