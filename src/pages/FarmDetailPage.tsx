import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, Grid } from 'lucide-react'
import { mockFarms, mockPonds } from '../data/mockData'
import { th } from '../locales/th'

const L = th.farmDetail

export function FarmDetailPage() {
  const { id } = useParams()
  const farm = mockFarms.find((f) => f.id === id)
  const farmPonds = mockPonds.filter((p) => p.farmId === id)

  if (!farm) {
    return <div>{L.farmNotFound}</div>
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Link
          to='/farms'
          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className='text-3xl text-gray-800'>{farm.name}</h1>
          <p className='text-gray-600'>{farm.code}</p>
        </div>
      </div>

      {/* Farm Info */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl shadow-md p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <MapPin className='text-green-600' size={24} />
            <p className='text-lg text-gray-800'>{L.location}</p>
          </div>
          <p className='text-2xl text-gray-900'>{farm.location}</p>
        </div>
        <div className='bg-white rounded-xl shadow-md p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <Grid className='text-blue-600' size={24} />
            <p className='text-lg text-gray-800'>{L.area}</p>
          </div>
          <p className='text-2xl text-gray-900'>{farm.area} {L.hectares}</p>
        </div>
        <div className='bg-white rounded-xl shadow-md p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <Calendar className='text-purple-600' size={24} />
            <p className='text-lg text-gray-800'>{L.created}</p>
          </div>
          <p className='text-2xl text-gray-900'>{farm.createdAt}</p>
        </div>
      </div>

      {/* Ponds */}
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
              <p className='text-gray-600 text-sm'>{pond.code}</p>
              <p className='text-lg text-gray-900 mb-2'>{pond.name}</p>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-600'>{pond.area} ha</span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    pond.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {pond.status === 'active'
                    ? L.statusActive
                    : L.statusMaintenance}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
