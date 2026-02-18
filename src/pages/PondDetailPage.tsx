import { useParams } from 'react-router-dom'
import { mockPonds } from '../data/mockData'
import { th } from '../locales/th'

const L = th.pondDetail

export function PondDetailPage() {
  const { id } = useParams()
  const pond = mockPonds.find((p) => p.id === id)

  if (!pond) return <div>{L.pondNotFound}</div>

  const statusText =
    pond.status === 'active'
      ? th.ponds.statusActive
      : pond.status === 'maintenance'
        ? th.ponds.statusMaintenance
        : pond.status

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl text-gray-800'>{pond.name}</h1>
      <div className='bg-white rounded-xl shadow-md p-6'>
        <p>{L.code}: {pond.code}</p>
        <p>{L.farm}: {pond.farmName}</p>
        <p>{L.area}: {pond.area} ha</p>
        <p>{L.depth}: {pond.depth} m</p>
        <p>{L.currentStock}: {pond.currentStock}</p>
        <p>{L.status}: {statusText}</p>
      </div>
    </div>
  )
}
