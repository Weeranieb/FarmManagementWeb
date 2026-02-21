import { useState } from 'react'
import { Search, Plus, Phone, MapPin, X } from 'lucide-react'
import { mockMerchants } from '../data/mockData'
import { th } from '../locales/th'
import { useAuthQuery } from '../hooks/useAuth'
import { UserLevel } from '../constants/userLevel'

const L = th.merchants

export function MerchantsListPage() {
  const { data: user } = useAuthQuery()
  const isSuperAdmin = user?.userLevel === UserLevel.SuperAdmin
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    location: '',
  })

  const filteredMerchants = mockMerchants.filter((merchant) => {
    const matchesSearch =
      merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (merchant.code &&
        merchant.code.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call API POST /api/v1/merchant (super admin only)
    console.log('New merchant:', formData)
    setIsModalOpen(false)
    setFormData({ name: '', contact: '', location: '' })
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl text-gray-800 mb-2'>{L.title}</h1>
          <p className='text-gray-600'>{L.subtitle}</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all'
          >
            <Plus size={20} />
            <span>{L.addMerchant}</span>
          </button>
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

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredMerchants.map((merchant) => (
          <div
            key={merchant.id}
            className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow'
          >
            <h3 className='text-lg text-gray-900 mb-4'>{merchant.name}</h3>
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <Phone size={16} className='text-gray-400' />
                {merchant.contact}
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <MapPin size={16} className='text-gray-400' />
                {merchant.location}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isSuperAdmin && isModalOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-8 w-96 shadow-xl relative z-50'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl text-gray-800'>{L.modalTitle}</h2>
              <button
                className='text-gray-500 hover:text-gray-700'
                onClick={() => setIsModalOpen(false)}
                aria-label={L.modalClose}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    {L.name}
                  </label>
                  <input
                    type='text'
                    placeholder={L.placeholderName}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    {L.contact}
                  </label>
                  <input
                    type='text'
                    placeholder={L.placeholderContact}
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData({ ...formData, contact: e.target.value })
                    }
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    {L.location}
                  </label>
                  <input
                    type='text'
                    placeholder={L.placeholderLocation}
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  />
                </div>
              </div>
              <div className='mt-6'>
                <button
                  type='submit'
                  className='w-full px-4 py-2 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all'
                >
                  {L.submitAdd}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
