import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  TrendingUp,
  BarChart3,
  Plus,
  X,
  Search,
  Pencil,
} from 'lucide-react'
import { th } from '../locales/th'
import { useAuthQuery } from '../hooks/useAuth'
import { UserLevel } from '../constants/userLevel'
import {
  useFeedCollectionListQuery,
  useCreateFeedCollectionMutation,
  useCreateFeedPriceHistoryMutation,
} from '../hooks/useFeedCollection'
import type { FeedCollectionPageItem } from '../api/feedCollection'

const L = th.feedCollections

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

/** Avoids RangeError when date input is cleared or invalid (would block mutate / fetch). */
function toPriceUpdatedDateISO(dateStr: string): string {
  const raw = dateStr?.trim()
  const base = raw || todayISO()
  const d = new Date(base)
  if (Number.isNaN(d.getTime())) {
    return new Date(todayISO() + 'T12:00:00').toISOString()
  }
  return d.toISOString()
}

export function FeedCollectionsPage() {
  const { data: user } = useAuthQuery()
  const isAdmin = user != null && user.userLevel >= UserLevel.ClientAdmin
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading } = useFeedCollectionListQuery(
    searchTerm || undefined,
  )
  const items = data?.items ?? []

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isUpdatePriceModalOpen, setIsUpdatePriceModalOpen] = useState(false)
  const [selectedFeed, setSelectedFeed] =
    useState<FeedCollectionPageItem | null>(null)

  const [addForm, setAddForm] = useState({
    name: '',
    unit: '',
    price: '',
    effectiveDate: todayISO(),
  })
  const [updatePriceForm, setUpdatePriceForm] = useState({
    price: '',
    date: todayISO(),
  })

  const createMutation = useCreateFeedCollectionMutation()
  const createPriceMutation = useCreateFeedPriceHistoryMutation()

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = parseFloat(addForm.price)
    createMutation.mutate(
      {
        name: addForm.name.trim(),
        unit: addForm.unit.trim(),
        feedPriceHistories:
          price > 0 && !Number.isNaN(price)
            ? [
                {
                  price,
                  priceUpdatedDate: toPriceUpdatedDateISO(
                    addForm.effectiveDate,
                  ),
                },
              ]
            : undefined,
      },
      {
        onSuccess: () => {
          setIsAddModalOpen(false)
          setAddForm({
            name: '',
            unit: '',
            price: '',
            effectiveDate: todayISO(),
          })
        },
      },
    )
  }

  function handleUpdatePriceSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFeed) return
    createPriceMutation.mutate(
      {
        feedCollectionId: selectedFeed.id,
        price: parseFloat(updatePriceForm.price),
        priceUpdatedDate: new Date(updatePriceForm.date).toISOString(),
      },
      {
        onSuccess: () => {
          setIsUpdatePriceModalOpen(false)
          setSelectedFeed(null)
        },
      },
    )
  }

  function openUpdatePriceModal(feed: FeedCollectionPageItem) {
    setSelectedFeed(feed)
    setUpdatePriceForm({
      price: feed.latestPrice?.toString() ?? '',
      date: todayISO(),
    })
    setIsUpdatePriceModalOpen(true)
  }

  function fmtPrice(v: number | null) {
    if (v == null) return '—'
    return `฿${v.toLocaleString()}`
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl text-gray-800 mb-2'>{L.title}</h1>
          <p className='text-gray-600'>{L.subtitle}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              createMutation.reset()
              setAddForm({
                name: '',
                unit: '',
                price: '',
                effectiveDate: todayISO(),
              })
              setIsAddModalOpen(true)
            }}
            className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg shadow-md hover:shadow-xl hover:from-blue-700 hover:to-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200'
          >
            <Plus size={20} />
            <span>{L.addFeed}</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className='bg-white rounded-xl shadow-md p-6'>
        <div className='relative'>
          <Search
            className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            size={20}
          />
          <input
            type='text'
            placeholder={L.searchPlaceholder}
            className='w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className='text-center py-12 text-gray-500'>
          {th.common.loading}
        </div>
      )}

      {/* Cards */}
      {!isLoading && items.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {items.map((feed) => (
            <div
              key={feed.id}
              className='bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow'
            >
              <div className='flex items-start justify-between mb-3'>
                <div className='p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg'>
                  <Package className='text-white' size={20} />
                </div>
                <Link
                  to={`/feed-collections/${feed.id}/history`}
                  className='p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                >
                  <BarChart3 size={18} />
                </Link>
              </div>

              <h3 className='text-base text-gray-900 mb-3'>{feed.name}</h3>

              <div className='flex items-baseline gap-2 mb-1'>
                <span className='text-xl text-gray-900'>
                  {fmtPrice(feed.latestPrice)}
                </span>
                <span className='text-gray-600 text-xs'>/ {feed.unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {!isLoading && items.length > 0 && (
        <div className='bg-white rounded-xl shadow-md overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-4 py-4 text-center text-sm text-gray-600 w-14'>
                    {L.colNo}
                  </th>
                  <th className='px-6 py-4 text-left text-sm text-gray-600'>
                    {L.colName}
                  </th>
                  <th className='px-6 py-4 text-left text-sm text-gray-600'>
                    {L.colUnit}
                  </th>
                  <th className='px-6 py-4 text-left text-sm text-gray-600'>
                    {L.colLatestPrice}
                  </th>
                  <th className='px-6 py-4 text-left text-sm text-gray-600'>
                    {L.colLastUpdated}
                  </th>
                  <th className='px-6 py-4 text-left text-sm text-gray-600'>
                    {L.colActions}
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {items.map((feed, index) => (
                  <tr
                    key={feed.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-4 py-4 text-sm text-gray-500 text-center tabular-nums'>
                      {index + 1}
                    </td>
                    <td className='px-6 py-4 text-gray-900'>{feed.name}</td>
                    <td className='px-6 py-4 text-sm text-gray-600'>
                      {feed.unit}
                    </td>
                    <td className='px-6 py-4 text-gray-900'>
                      <div className='flex items-center gap-2'>
                        {feed.latestPrice != null ? (
                          <>
                            <TrendingUp size={16} className='text-green-600' />
                            {fmtPrice(feed.latestPrice)}
                          </>
                        ) : (
                          '—'
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-600'>
                      {feed.latestPriceUpdatedDate
                        ? new Date(
                            feed.latestPriceUpdatedDate,
                          ).toLocaleDateString('th-TH')
                        : '—'}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <Link
                          to={`/feed-collections/${feed.id}/history`}
                          className='text-blue-600 hover:text-blue-700 text-sm'
                        >
                          {L.viewHistory}
                        </Link>
                        {isAdmin && (
                          <button
                            onClick={() => openUpdatePriceModal(feed)}
                            className='text-blue-600 hover:text-blue-700'
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className='text-center py-12 text-gray-500'>{L.empty}</div>
      )}

      {/* Add Feed Modal */}
      {isAddModalOpen && (
        <div className='fixed inset-0 bg-gray-900/20 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl p-8 w-96 relative'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl text-gray-800'>{L.addFeed}</h2>
              <button
                type='button'
                onClick={() => setIsAddModalOpen(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className='mb-4'>
                <label className='block text-sm text-gray-600 mb-1'>
                  {L.fieldName}
                </label>
                <input
                  type='text'
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm({ ...addForm, name: e.target.value })
                  }
                />
              </div>
              <div className='mb-4'>
                <label className='block text-sm text-gray-600 mb-1'>
                  {L.fieldUnit}
                </label>
                <input
                  type='text'
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
                  value={addForm.unit}
                  onChange={(e) =>
                    setAddForm({ ...addForm, unit: e.target.value })
                  }
                />
              </div>
              <div className='mb-4'>
                <label className='block text-sm text-gray-600 mb-1'>
                  {L.fieldPrice}
                </label>
                <input
                  type='number'
                  step='0.01'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
                  value={addForm.price}
                  onChange={(e) =>
                    setAddForm({ ...addForm, price: e.target.value })
                  }
                />
              </div>
              <div className='mb-4'>
                <label className='block text-sm text-gray-600 mb-1'>
                  {L.fieldPriceEffectiveDate}
                </label>
                <input
                  type='date'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
                  value={addForm.effectiveDate}
                  onChange={(e) =>
                    setAddForm({ ...addForm, effectiveDate: e.target.value })
                  }
                />
                <p className='text-xs text-gray-500 mt-1'>
                  {L.fieldPriceEffectiveDateHint}
                </p>
              </div>
              {createMutation.isError && (
                <p className='mb-3 text-sm text-red-600' role='alert'>
                  {L.saveFailed}
                  {createMutation.error instanceof Error
                    ? `: ${createMutation.error.message}`
                    : ''}
                </p>
              )}
              <button
                type='submit'
                disabled={createMutation.isPending}
                className='w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors'
              >
                {createMutation.isPending ? th.common.loading : L.addFeed}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Update Price Modal */}
      {isUpdatePriceModalOpen && selectedFeed && (
        <div className='fixed inset-0 bg-gray-900/20 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl p-8 w-96 relative'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl text-gray-800'>{L.updatePrice}</h2>
              <button
                onClick={() => setIsUpdatePriceModalOpen(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdatePriceSubmit}>
              <div className='mb-4'>
                <label className='block text-sm text-gray-600 mb-1'>
                  {L.fieldName}
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50'
                  value={selectedFeed.name}
                  readOnly
                />
              </div>
              <div className='mb-4'>
                <label className='block text-sm text-gray-600 mb-1'>
                  {L.fieldNewPrice}
                </label>
                <input
                  type='number'
                  step='0.01'
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
                  value={updatePriceForm.price}
                  onChange={(e) =>
                    setUpdatePriceForm({
                      ...updatePriceForm,
                      price: e.target.value,
                    })
                  }
                />
              </div>
              <div className='mb-4'>
                <label className='block text-sm text-gray-600 mb-1'>
                  {L.fieldDate}
                </label>
                <input
                  type='date'
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500'
                  value={updatePriceForm.date}
                  onChange={(e) =>
                    setUpdatePriceForm({
                      ...updatePriceForm,
                      date: e.target.value,
                    })
                  }
                />
              </div>
              <button
                type='submit'
                disabled={createPriceMutation.isPending}
                className='w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors'
              >
                {createPriceMutation.isPending
                  ? th.common.loading
                  : L.updatePrice}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
