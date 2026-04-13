import {
  Search,
  Plus,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  Store,
} from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { th } from '../../locales/th'
import { useAuthQuery } from '../../hooks/useAuth'
import { UserLevel } from '../../constants/userLevel'
import { useMerchantsListPage } from './hooks'
import { MerchantAddModal } from './components/MerchantAddModal'
import { MerchantEditModal } from './components/MerchantEditModal'
import { MerchantDeleteConfirm } from './components/MerchantDeleteConfirm'

const L = th.merchants

export function MerchantsListPage() {
  const { data: user } = useAuthQuery()
  const isSuperAdmin = user?.userLevel === UserLevel.SuperAdmin
  const ctx = useMerchantsListPage()

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
              onClick={() => ctx.setIsAddModalOpen(true)}
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
              value={ctx.searchTerm}
              onChange={(e) => ctx.setSearchTerm(e.target.value)}
              className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'
            />
          </div>
        </div>
      </div>

      {ctx.isLoading ? (
        <p className='text-gray-600'>{th.common.loading}</p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {ctx.filteredMerchants.map((merchant) => (
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
                      onClick={() => ctx.setMerchantToEdit(merchant)}
                      className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                      aria-label={L.editMerchant}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      type='button'
                      onClick={() => ctx.setMerchantToDelete(merchant)}
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

      {isSuperAdmin && (
        <MerchantAddModal
          open={ctx.isAddModalOpen}
          onClose={() => ctx.setIsAddModalOpen(false)}
          formData={ctx.addFormData}
          setFormData={ctx.setAddFormData}
          onSubmit={ctx.handleAddSubmit}
          isPending={ctx.createMutation.isPending}
        />
      )}

      {isSuperAdmin && ctx.merchantToEdit && (
        <MerchantEditModal
          merchant={ctx.merchantToEdit}
          onClose={() => ctx.setMerchantToEdit(null)}
          setMerchant={ctx.setMerchantToEdit}
          onSubmit={ctx.handleEditSubmit}
          isPending={ctx.updateMutation.isPending}
        />
      )}

      {isSuperAdmin && ctx.merchantToDelete && (
        <MerchantDeleteConfirm
          onCancel={() => ctx.setMerchantToDelete(null)}
          onConfirm={ctx.handleDeleteConfirm}
          isPending={ctx.deleteMutation.isPending}
        />
      )}
    </div>
  )
}
