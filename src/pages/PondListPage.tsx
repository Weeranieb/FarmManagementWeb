import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Eye, Plus, Fish, Building, Calendar } from 'lucide-react'
import { usePondListWithDetails, type PondWithFarmName } from '../hooks/usePond'
import { useClient } from '../contexts/ClientContext'
import { StatusBadge } from '../components/StatusBadge'
import { StockActionModal } from '../components/StockActionModal'
import { th } from '../locales/th'

const L = th.ponds
const fishTypeLabels = th.fishType as Record<string, string>
function fishTypeDisplayLabel(value: string): string {
  return fishTypeLabels[value] ?? value
}

export function PondsListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [farmFilter, setFarmFilter] = useState<string>('all')
  const [selectedPond, setSelectedPond] = useState<PondWithFarmName | null>(
    null,
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { selectedClientId } = useClient()
  const clientId = selectedClientId ? Number(selectedClientId) : undefined
  const { ponds, isLoading, error, refetch } = usePondListWithDetails(clientId)

  const farms = useMemo(() => {
    const seen = new Map<number, string>()
    ponds.forEach((p) => {
      if (!seen.has(p.farmId)) seen.set(p.farmId, p.farmName)
    })
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }))
  }, [ponds])

  const filteredPonds = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    return ponds.filter(
      (pond) =>
        (!term || pond.name.toLowerCase().includes(term)) &&
        (statusFilter === 'all' || pond.status === statusFilter) &&
        (farmFilter === 'all' || String(pond.farmId) === farmFilter),
    )
  }, [ponds, searchTerm, statusFilter, farmFilter])

  const activeCount = useMemo(
    () => ponds.filter((p) => p.status === 'active').length,
    [ponds],
  )

  const handleAddStock = (pond: PondWithFarmName) => {
    setSelectedPond(pond)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPond(null)
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-start justify-between gap-6'>
        <div>
          <h1 className='text-3xl text-gray-800 mb-2'>{L.title}</h1>
          <p className='text-gray-600'>{L.subtitle}</p>
        </div>
        <div className='grid grid-cols-2 gap-4 min-w-[280px]'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5'>
            <p className='text-sm text-gray-600 mb-1'>{L.totalPonds}</p>
            <p className='text-2xl font-semibold text-gray-900'>
              {ponds.length}
            </p>
          </div>
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5'>
            <p className='text-sm text-gray-600 mb-1'>{L.statusActive}</p>
            <p className='text-2xl font-semibold text-green-600'>
              {activeCount}
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
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
              className='w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
            />
          </div>
          <select
            value={farmFilter}
            onChange={(e) => setFarmFilter(e.target.value)}
            className='px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all'
          >
            <option value='all'>{L.farm} (ทั้งหมด)</option>
            {farms.map((farm) => (
              <option key={farm.id} value={String(farm.id)}>
                {L.farmWithName(farm.name)}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all'
          >
            <option value='all'>{L.allStatus}</option>
            <option value='active'>{L.statusActive}</option>
            <option value='maintenance'>{L.statusMaintenance}</option>
          </select>
        </div>
      </div>

      {!selectedClientId && (
        <div className='bg-amber-50 border border-amber-200 rounded-xl p-6'>
          <p className='text-amber-800'>{th.layout.selectClientToView}</p>
        </div>
      )}

      {isLoading && (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center'>
          <p className='text-gray-500'>{th.common.loading}</p>
        </div>
      )}

      {error && (
        <div className='bg-red-50 border border-red-200 rounded-xl p-6'>
          <p className='text-red-800'>
            {error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'}
          </p>
        </div>
      )}

      {!isLoading && !error && selectedClientId && (
        <>
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-gray-50 border-b border-gray-200'>
                    <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                      {L.pondName}
                    </th>
                    <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                      {L.farm}
                    </th>
                    <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                      {L.currentStock}
                    </th>
                    <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                      {L.status}
                    </th>
                    <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                      {L.species}
                    </th>
                    <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                      {L.ageDays}
                    </th>
                    <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                      {L.lastActivity}
                    </th>
                    <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                      {L.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {filteredPonds.map((pond) => (
                    <tr
                      key={pond.id}
                      className='hover:bg-gray-50/50 transition-colors group'
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <Link
                          to={`/ponds/${pond.id}`}
                          className='text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors'
                        >
                          {L.pondWithPrefix(pond.name)}
                        </Link>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center gap-2'>
                          <Building size={16} className='text-gray-400' />
                          <span className='text-sm text-gray-900'>
                            {L.farmWithName(pond.farmName)}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <Link
                          to={`/ponds/${pond.id}`}
                          className='flex items-center gap-2 text-sm text-gray-900 hover:text-blue-600 transition-colors group/stock'
                          title={L.viewStockHistory}
                        >
                          <Fish
                            size={16}
                            className='text-blue-600 group-hover/stock:text-blue-700'
                          />
                          <span className='font-medium'>
                            {(pond.totalFish ?? 0).toLocaleString()}
                          </span>
                        </Link>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <StatusBadge status={pond.status} />
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex flex-wrap gap-1.5'>
                          {(pond.fishTypes ?? []).length > 0 ? (
                            (pond.fishTypes ?? []).map((ft, idx) => (
                              <span
                                key={idx}
                                className='inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm font-medium'
                              >
                                {fishTypeDisplayLabel(ft)}
                              </span>
                            ))
                          ) : (
                            <span className='text-sm text-gray-500'>—</span>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='text-sm text-gray-500'>
                          {pond.ageDays != null && pond.ageDays > 0
                            ? pond.ageDays
                            : '—'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <Calendar size={14} className='text-gray-400' />
                          <span className='text-gray-500'>
                            {pond.latestActivityDate
                              ? new Date(
                                  pond.latestActivityDate,
                                ).toLocaleDateString('th-TH', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '—'}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center gap-2'>
                          <Link
                            to={`/ponds/${pond.id}`}
                            className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all inline-flex'
                            title={th.farms.viewDetails}
                          >
                            <Eye size={18} />
                          </Link>
                          <button
                            type='button'
                            onClick={() => handleAddStock(pond)}
                            className='p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all'
                            title={L.addStock}
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPonds.length === 0 && ponds.length > 0 && (
              <div className='text-center py-12'>
                <Fish size={48} className='mx-auto text-gray-300 mb-3' />
                <p className='text-gray-500'>{L.noMatch}</p>
              </div>
            )}

            {ponds.length === 0 && (
              <div className='text-center py-12'>
                <Fish size={48} className='mx-auto text-gray-300 mb-3' />
                <p className='text-gray-500'>{L.noPonds}</p>
              </div>
            )}
          </div>

          <StockActionModal
            pond={
              selectedPond
                ? {
                    id: selectedPond.id,
                    name: selectedPond.name,
                    code: selectedPond.name,
                    farmName: selectedPond.farmName,
                    status: selectedPond.status,
                    currentStock: selectedPond.totalFish ?? 0,
                    species: selectedPond.fishTypes ?? [],
                  }
                : null
            }
            isOpen={isModalOpen}
            onClose={closeModal}
            onFillSuccess={() => refetch()}
            availablePonds={ponds
              .filter((p) => p.id !== selectedPond?.id)
              .map((p) => ({
                id: p.id,
                name: p.name,
                code: p.name,
                farmName: p.farmName,
                status: p.status,
                currentStock: p.totalFish ?? 0,
                species: p.fishTypes ?? [],
              }))}
          />
        </>
      )}
    </div>
  )
}
