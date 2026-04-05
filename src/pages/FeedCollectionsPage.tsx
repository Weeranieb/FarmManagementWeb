import { useState, useEffect, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  Package,
  TrendingUp,
  BarChart3,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { th } from '../locales/th'
import { useAuthQuery } from '../hooks/useAuth'
import { UserLevel } from '../constants/userLevel'
import {
  useFeedCollectionListQuery,
  useCreateFeedCollectionMutation,
  useCreateFeedPriceHistoryMutation,
  useUpdateFeedCollectionMutation,
} from '../hooks/useFeedCollection'
import type { FeedCollectionPageItem } from '../api/feedCollection'
import {
  FEED_TYPE_FRESH,
  FEED_TYPE_PELLET,
  feedTypeLabelTh,
} from '../constants/feedType'
import {
  FeedCollectionAddModal,
  type FeedCollectionAddFormState,
} from '../components/feedCollections/FeedCollectionAddModal'
import {
  FeedCollectionEditDetailsModal,
  type FeedCollectionEditDetailsFormState,
} from '../components/feedCollections/FeedCollectionEditDetailsModal'
import {
  FeedCollectionUpdatePriceModal,
  type FeedCollectionUpdatePriceFormState,
} from '../components/feedCollections/FeedCollectionUpdatePriceModal'
import {
  todayISO,
  toPriceUpdatedDateISO,
} from '../components/feedCollections/formUtils'

const L = th.feedCollections

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
  const [isEditDetailsModalOpen, setIsEditDetailsModalOpen] = useState(false)
  const [selectedFeed, setSelectedFeed] =
    useState<FeedCollectionPageItem | null>(null)
  /** Fixed viewport position — dropdown must not live inside overflow-x-auto / overflow-hidden ancestors. */
  const [feedActionMenu, setFeedActionMenu] = useState<{
    feedId: number
    top: number
    right: number
  } | null>(null)

  useEffect(() => {
    if (feedActionMenu === null) return
    const closeIfOutside = (e: MouseEvent) => {
      const t = e.target as Element | null
      if (
        t?.closest?.('[data-feed-actions-menu]') ||
        t?.closest?.('[data-feed-actions-trigger]')
      ) {
        return
      }
      setFeedActionMenu(null)
    }
    document.addEventListener('mousedown', closeIfOutside)
    return () => document.removeEventListener('mousedown', closeIfOutside)
  }, [feedActionMenu])

  useEffect(() => {
    if (feedActionMenu === null) return
    const close = () => setFeedActionMenu(null)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [feedActionMenu])

  const [addForm, setAddForm] = useState<FeedCollectionAddFormState>({
    name: '',
    unit: '',
    feedType: FEED_TYPE_PELLET,
    fcr: '',
    price: '',
    effectiveDate: todayISO(),
  })
  const [editDetailsForm, setEditDetailsForm] =
    useState<FeedCollectionEditDetailsFormState>({
      id: 0,
      name: '',
      unit: '',
      feedType: FEED_TYPE_PELLET,
      fcr: '',
    })
  const [updatePriceForm, setUpdatePriceForm] =
    useState<FeedCollectionUpdatePriceFormState>({
      price: '',
      date: todayISO(),
    })

  const createMutation = useCreateFeedCollectionMutation()
  const createPriceMutation = useCreateFeedPriceHistoryMutation()
  const updateFeedMutation = useUpdateFeedCollectionMutation()

  function handleAddSubmit(e: FormEvent) {
    e.preventDefault()
    const price = parseFloat(addForm.price)
    const fcrNum = parseFloat(addForm.fcr)
    createMutation.mutate(
      {
        name: addForm.name.trim(),
        unit: addForm.unit.trim(),
        feedType: addForm.feedType,
        fcr:
          addForm.fcr.trim() !== '' && !Number.isNaN(fcrNum)
            ? fcrNum
            : undefined,
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
            feedType: FEED_TYPE_PELLET,
            fcr: '',
            price: '',
            effectiveDate: todayISO(),
          })
        },
      },
    )
  }

  function handleUpdatePriceSubmit(e: FormEvent) {
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

  function openEditDetailsModal(feed: FeedCollectionPageItem) {
    const ft =
      feed.feedType === FEED_TYPE_PELLET || feed.feedType === FEED_TYPE_FRESH
        ? feed.feedType
        : FEED_TYPE_PELLET
    setEditDetailsForm({
      id: feed.id,
      name: feed.name,
      unit: feed.unit,
      feedType: ft,
      fcr: feed.fcr != null ? String(feed.fcr) : '',
    })
    setIsEditDetailsModalOpen(true)
  }

  function handleEditDetailsSubmit(e: FormEvent) {
    e.preventDefault()
    const fcrNum = parseFloat(editDetailsForm.fcr)
    updateFeedMutation.mutate(
      {
        id: editDetailsForm.id,
        name: editDetailsForm.name.trim(),
        unit: editDetailsForm.unit.trim(),
        feedType: editDetailsForm.feedType,
        fcr:
          editDetailsForm.fcr.trim() !== '' && !Number.isNaN(fcrNum)
            ? fcrNum
            : undefined,
      },
      {
        onSuccess: () => setIsEditDetailsModalOpen(false),
      },
    )
  }

  function fmtPrice(v: number | null) {
    if (v == null) return '—'
    return `฿${v.toLocaleString()}`
  }

  const emptyAddForm = (): FeedCollectionAddFormState => ({
    name: '',
    unit: '',
    feedType: FEED_TYPE_PELLET,
    fcr: '',
    price: '',
    effectiveDate: todayISO(),
  })

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
              setAddForm(emptyAddForm())
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

              <h3 className='text-base text-gray-900 mb-1'>{feed.name}</h3>
              <p className='text-xs text-gray-500 mb-2'>
                {feedTypeLabelTh(feed.feedType)}
                {feed.fcr != null && feed.fcr !== undefined
                  ? ` · FCR ${feed.fcr}`
                  : ''}
              </p>

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
                    {L.colFeedType}
                  </th>
                  <th className='px-6 py-4 text-left text-sm text-gray-600'>
                    {L.colFcr}
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
                    <td className='px-6 py-4 text-sm text-gray-700'>
                      {feedTypeLabelTh(feed.feedType)}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-600 tabular-nums'>
                      {feed.fcr != null && feed.fcr !== undefined
                        ? feed.fcr
                        : '—'}
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
                            type='button'
                            data-feed-actions-trigger
                            title={L.manageFeedMenu}
                            aria-label={L.manageFeedMenu}
                            aria-expanded={feedActionMenu?.feedId === feed.id}
                            aria-haspopup='menu'
                            onClick={(e) => {
                              const r = (
                                e.currentTarget as HTMLButtonElement
                              ).getBoundingClientRect()
                              setFeedActionMenu((prev) =>
                                prev?.feedId === feed.id
                                  ? null
                                  : {
                                      feedId: feed.id,
                                      top: r.bottom + 6,
                                      right: r.right,
                                    },
                              )
                            }}
                            className='p-1 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors'
                          >
                            <SlidersHorizontal size={18} />
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

      <FeedCollectionAddModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        form={addForm}
        setForm={setAddForm}
        onSubmit={handleAddSubmit}
        isPending={createMutation.isPending}
        isError={createMutation.isError}
        error={createMutation.error}
      />

      <FeedCollectionEditDetailsModal
        open={isEditDetailsModalOpen}
        onClose={() => setIsEditDetailsModalOpen(false)}
        form={editDetailsForm}
        setForm={setEditDetailsForm}
        onSubmit={handleEditDetailsSubmit}
        isPending={updateFeedMutation.isPending}
        isError={updateFeedMutation.isError}
      />

      <FeedCollectionUpdatePriceModal
        open={isUpdatePriceModalOpen}
        feed={selectedFeed}
        onClose={() => setIsUpdatePriceModalOpen(false)}
        form={updatePriceForm}
        setForm={setUpdatePriceForm}
        onSubmit={handleUpdatePriceSubmit}
        isPending={createPriceMutation.isPending}
      />

      {feedActionMenu &&
        isAdmin &&
        (() => {
          const menuFeed = items.find((f) => f.id === feedActionMenu.feedId)
          if (!menuFeed) return null
          return createPortal(
            <div
              data-feed-actions-menu
              role='menu'
              className='fixed z-[200] min-w-[10.5rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg'
              style={{
                top: feedActionMenu.top,
                left: feedActionMenu.right,
                transform: 'translateX(-100%)',
              }}
            >
              <button
                type='button'
                role='menuitem'
                className='w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-blue-50'
                onClick={() => {
                  setFeedActionMenu(null)
                  openEditDetailsModal(menuFeed)
                }}
              >
                {L.editDetails}
              </button>
              <button
                type='button'
                role='menuitem'
                className='w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-blue-50'
                onClick={() => {
                  setFeedActionMenu(null)
                  openUpdatePriceModal(menuFeed)
                }}
              >
                {L.updatePrice}
              </button>
            </div>,
            document.body,
          )
        })()}
    </div>
  )
}
