import { Link } from 'react-router-dom'
import { Search, Plus, Pencil, Building, Layers } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { th } from '../../locales/th'
import { useFarmGroupsListPage } from './hooks'

const L = th.farmGroups

export function FarmGroupsListPage() {
  const { isAdmin, searchTerm, setSearchTerm, isLoading, filtered } =
    useFarmGroupsListPage()

  return (
    <div className='space-y-6'>
      <PageHeader
        title={L.title}
        subtitle={L.subtitle}
        icon={Layers}
        actions={
          isAdmin ? (
            <Link
              to='/farm-groups/new'
              className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-blue-600 hover:to-blue-500'
            >
              <Plus size={18} />
              <span>{L.addFarmGroup}</span>
            </Link>
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
      ) : filtered.length === 0 ? (
        <div className='bg-white rounded-xl shadow-md p-12 text-center text-gray-500'>
          {searchTerm ? L.noFarmGroups : L.noFarmGroupsYet}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filtered.map((fg) => (
            <div
              key={fg.id}
              className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow'
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='flex items-center gap-3 flex-1'>
                  <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0'>
                    <Building size={20} className='text-blue-600' />
                  </div>
                  <h3 className='text-lg text-gray-900'>{fg.name}</h3>
                </div>
                {isAdmin && (
                  <Link
                    to={`/farm-groups/${fg.id}/edit`}
                    className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0'
                    aria-label={L.editFarmGroup}
                  >
                    <Pencil size={18} />
                  </Link>
                )}
              </div>
              <div className='mt-4'>
                <div className='flex flex-wrap gap-2'>
                  {fg.farms.map((f) => (
                    <Link
                      key={f.id}
                      to={`/farms/${f.id}`}
                      className='inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-500/40 hover:from-blue-500 hover:to-blue-600 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all'
                    >
                      {L.farmNamePrefix}
                      {f.name}
                    </Link>
                  ))}
                  {fg.farms.length === 0 && (
                    <span className='text-sm text-gray-400 italic'>-</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
