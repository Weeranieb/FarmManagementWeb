import { useParams } from 'react-router-dom'
import { mockPonds } from '../data/mockData'

export function PondDetailPage() {
  const { id } = useParams()
  const pond = mockPonds.find((p) => p.id === id)

  if (!pond) return <div>Pond not found</div>

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl text-gray-800'>{pond.name}</h1>
      <div className='bg-white rounded-xl shadow-md p-6'>
        <p>Code: {pond.code}</p>
        <p>Farm: {pond.farmName}</p>
        <p>Area: {pond.area} ha</p>
        <p>Depth: {pond.depth} m</p>
        <p>Current Stock: {pond.currentStock}</p>
        <p>Status: {pond.status}</p>
      </div>
    </div>
  )
}
