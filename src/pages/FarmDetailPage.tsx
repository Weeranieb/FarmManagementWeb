import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Grid, Fish, Activity } from 'lucide-react'
import { useFarmQuery } from '../hooks/useFarm'
import { pondApi } from '../api/pond'
import { formatFarmDisplayNameTH } from '../constants/masterDataFormatters'
import { StatusBadge } from '../components/StatusBadge'
import { th } from '../locales/th'

const L = th.farmDetail

export function FarmDetailPage() {
  const { id } = useParams()
  const farmId = id != null ? Number(id) : NaN
  const {
    data: farm,
    isLoading: farmLoading,
    error: farmError,
  } = useFarmQuery(farmId, !!id)
  const { data: farmPonds = [] } = useQuery({
    queryKey: ['ponds', 'farm', farmId],
    queryFn: () => pondApi.getPondList(farmId),
    enabled: Number.isFinite(farmId) && !!farm,
  })

  if (farmLoading || !id) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Link
            to='/farms'
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <ArrowLeft size={24} />
          </Link>
        </div>
        <div className='bg-white rounded-xl shadow-md p-12 text-center'>
          <p className='text-gray-500'>
            {farmLoading ? L.loading : L.farmNotFound}
          </p>
        </div>
      </div>
    )
  }

  if (farmError || !farm) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Link
            to='/farms'
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <ArrowLeft size={24} />
          </Link>
        </div>
        <div className='bg-white rounded-xl shadow-md p-12 text-center'>
          <p className='text-gray-500'>{L.farmNotFound}</p>
        </div>
      </div>
    )
  }

  const activePonds = farmPonds.filter((p) => p.status === 'active').length
  const maintenancePonds = farmPonds.filter(
    (p) => p.status === 'maintenance',
  ).length
  const totalStock = farmPonds.reduce((sum, p) => sum + (p.totalFish ?? 0), 0)

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Link
          to='/farms'
          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className='text-3xl text-gray-800'>
            {formatFarmDisplayNameTH(farm.name)}
          </h1>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-6 border border-blue-200'>
          <div className='flex items-center gap-3 mb-2'>
            <Fish className='text-blue-600' size={20} />
            <p className='text-sm text-gray-700 font-medium'>{L.totalStock}</p>
          </div>
          <p className='text-3xl text-blue-600 font-semibold'>
            {totalStock.toLocaleString()}
          </p>
          <p className='text-xs text-gray-600 mt-1'>{L.totalStockSuffix}</p>
        </div>
        <div className='bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-6 border border-green-200'>
          <div className='flex items-center gap-3 mb-2'>
            <Activity className='text-green-600' size={20} />
            <p className='text-sm text-gray-700 font-medium'>{L.activePonds}</p>
          </div>
          <p className='text-3xl text-green-600 font-semibold'>{activePonds}</p>
          <p className='text-xs text-gray-600 mt-1'>
            {L.pondsCountSuffix} {farmPonds.length} {L.pondsUnit}
          </p>
        </div>
        <div className='bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-lg p-6 border border-yellow-200'>
          <div className='flex items-center gap-3 mb-2'>
            <Grid className='text-yellow-600' size={20} />
            <p className='text-sm text-gray-700 font-medium'>
              {L.maintenancePonds}
            </p>
          </div>
          <p className='text-3xl text-yellow-600 font-semibold'>
            {maintenancePonds}
          </p>
          <p className='text-xs text-gray-600 mt-1'>
            {L.maintenancePondsSuffix}
          </p>
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-md p-6'>
        <h2 className='text-xl text-gray-800 mb-4'>
          {L.ponds} ({farmPonds.length})
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {farmPonds.map((pond) => (
            <Link
              key={pond.id}
              to={`/ponds/${pond.id}`}
              className='p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all'
            >
              <p className='text-lg text-gray-900 mb-2'>{pond.name}</p>
              <div className='flex items-center justify-between gap-2 text-sm'>
                <span className='text-gray-600'>
                  <Fish size={14} className='inline mr-1' />
                  {(pond.totalFish ?? 0).toLocaleString()}
                  {(pond.ageDays ?? 0) > 0 &&
                    ` · ${th.pondDetail.days(pond.ageDays!)}`}
                </span>
                <StatusBadge status={pond.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
