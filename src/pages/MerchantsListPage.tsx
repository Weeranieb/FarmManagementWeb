import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Plus,
  Phone,
  MapPin,
  X,
  Pencil,
  Trash2,
  Store,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { th } from '../locales/th'
import { useAuthQuery } from '../hooks/useAuth'
import { UserLevel } from '../constants/userLevel'
import {
  merchantApi,
  type MerchantResponse,
  type CreateMerchantRequest,
  type UpdateMerchantRequest,
} from '../api/merchant'

const L = th.merchants

const MERCHANT_LIST_QUERY_KEY = ['merchants'] as const

export function MerchantsListPage() {
  const queryClient = useQueryClient()
  const { data: user } = useAuthQuery()
  const isSuperAdmin = user?.userLevel === UserLevel.SuperAdmin
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addFormData, setAddFormData] = useState({
    name: '',
    contactNumber: '',
    location: '',
  })
  const [merchantToEdit, setMerchantToEdit] = useState<MerchantResponse | null>(
    null,
  )
  const [merchantToDelete, setMerchantToDelete] =
    useState<MerchantResponse | null>(null)

  const { data: merchants = [], isLoading } = useQuery({
    queryKey: MERCHANT_LIST_QUERY_KEY,
    queryFn: () => merchantApi.getMerchantList(),
  })

  const createMutation = useMutation({
    mutationFn: (body: CreateMerchantRequest) =>
      merchantApi.createMerchant(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MERCHANT_LIST_QUERY_KEY })
      setIsAddModalOpen(false)
      setAddFormData({ name: '', contactNumber: '', location: '' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (body: UpdateMerchantRequest) =>
      merchantApi.updateMerchant(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MERCHANT_LIST_QUERY_KEY })
      setMerchantToEdit(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => merchantApi.deleteMerchant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MERCHANT_LIST_QUERY_KEY })
      setMerchantToDelete(null)
    },
  })

  const filteredMerchants = merchants.filter((merchant) => {
    const term = searchTerm.toLowerCase()
    return (
      merchant.name.toLowerCase().includes(term) ||
      (merchant.contactNumber &&
        merchant.contactNumber.toLowerCase().includes(term)) ||
      (merchant.location && merchant.location.toLowerCase().includes(term))
    )
  })

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      name: addFormData.name,
      contactNumber: addFormData.contactNumber,
      location: addFormData.location,
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!merchantToEdit) return
    updateMutation.mutate({
      id: merchantToEdit.id,
      name: merchantToEdit.name,
      contactNumber: merchantToEdit.contactNumber,
      location: merchantToEdit.location,
    })
  }

  const handleDeleteConfirm = () => {
    if (!merchantToDelete) return
    deleteMutation.mutate(merchantToDelete.id)
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={L.title}
        subtitle={L.subtitle}
        icon={Store}
        actions={
          isSuperAdmin ? (
            <button
              type='button'
              onClick={() => setIsAddModalOpen(true)}
              className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-blue-600 hover:to-blue-500'
            >
              <Plus size={18} />
              <span>{L.addMerchant}</span>
            </button>
          ) : undefined
        }
      />

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

      {isLoading ? (
        <p className='text-gray-600'>{th.common.loading}</p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredMerchants.map((merchant) => (
            <div
              key={merchant.id}
              className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow'
            >
              <div className='flex items-start justify-between gap-2'>
                <h3 className='text-lg text-gray-900 mb-4 flex-1'>
                  {merchant.name}
                </h3>
                {isSuperAdmin && (
                  <div className='flex items-center gap-1 shrink-0'>
                    <button
                      type='button'
                      onClick={() => setMerchantToEdit(merchant)}
                      className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                      aria-label={L.editMerchant}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      type='button'
                      onClick={() => setMerchantToDelete(merchant)}
                      className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                      aria-label={L.deleteMerchant}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Phone size={16} className='text-gray-400 shrink-0' />
                  {merchant.contactNumber || '–'}
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <MapPin size={16} className='text-gray-400 shrink-0' />
                  {merchant.location || '–'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isSuperAdmin && isAddModalOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-8 w-96 shadow-xl relative z-50'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl text-gray-800'>{L.modalTitle}</h2>
              <button
                type='button'
                className='text-gray-500 hover:text-gray-700'
                onClick={() => setIsAddModalOpen(false)}
                aria-label={L.modalClose}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    {L.name}
                  </label>
                  <input
                    type='text'
                    placeholder={L.placeholderName}
                    value={addFormData.name}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, name: e.target.value })
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
                    value={addFormData.contactNumber}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        contactNumber: e.target.value,
                      })
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
                    value={addFormData.location}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        location: e.target.value,
                      })
                    }
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  />
                </div>
              </div>
              <div className='mt-6'>
                <button
                  type='submit'
                  disabled={createMutation.isPending}
                  className='w-full px-4 py-2 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50'
                >
                  {createMutation.isPending ? th.common.loading : L.submitAdd}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSuperAdmin && merchantToEdit && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-8 w-96 shadow-xl relative z-50'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl text-gray-800'>{L.editModalTitle}</h2>
              <button
                type='button'
                className='text-gray-500 hover:text-gray-700'
                onClick={() => setMerchantToEdit(null)}
                aria-label={L.modalClose}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    {L.name}
                  </label>
                  <input
                    type='text'
                    placeholder={L.placeholderName}
                    value={merchantToEdit.name}
                    onChange={(e) =>
                      setMerchantToEdit({
                        ...merchantToEdit,
                        name: e.target.value,
                      })
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
                    value={merchantToEdit.contactNumber}
                    onChange={(e) =>
                      setMerchantToEdit({
                        ...merchantToEdit,
                        contactNumber: e.target.value,
                      })
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
                    value={merchantToEdit.location}
                    onChange={(e) =>
                      setMerchantToEdit({
                        ...merchantToEdit,
                        location: e.target.value,
                      })
                    }
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  />
                </div>
              </div>
              <div className='mt-6'>
                <button
                  type='submit'
                  disabled={updateMutation.isPending}
                  className='w-full px-4 py-2 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50'
                >
                  {updateMutation.isPending ? th.common.loading : L.submitEdit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSuperAdmin && merchantToDelete && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-8 w-96 shadow-xl relative z-50'>
            <h2 className='text-xl text-gray-800 mb-2'>
              {L.deleteConfirmTitle}
            </h2>
            <p className='text-gray-600 mb-6'>{L.deleteConfirmMessage}</p>
            <div className='flex gap-3 justify-end'>
              <button
                type='button'
                onClick={() => setMerchantToDelete(null)}
                className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
              >
                {L.deleteConfirmNo}
              </button>
              <button
                type='button'
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50'
              >
                {deleteMutation.isPending
                  ? th.common.loading
                  : L.deleteConfirmYes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
