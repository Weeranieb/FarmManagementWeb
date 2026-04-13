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
import { PageHeader } from '../../components/PageHeader'
import { th } from '../../locales/th'
import { feedTypeLabelTh } from '../../constants/feedType'
import { FeedCollectionAddModal } from '../../components/feedCollections/FeedCollectionAddModal'
import { FeedCollectionEditDetailsModal } from '../../components/feedCollections/FeedCollectionEditDetailsModal'
import { FeedCollectionUpdatePriceModal } from '../../components/feedCollections/FeedCollectionUpdatePriceModal'
import { useFeedCollectionsPage } from './hooks'

const L = th.feedCollections

function fmtPrice(v: number | null) {
  if (v == null) return '—'
  return `฿${v.toLocaleString()}`
}

export function FeedCollectionsPage() {
  const ctx = useFeedCollectionsPage()

  return (
    <div className='space-y-6'>
      <PageHeader
        title={L.title}
        subtitle={L.subtitle}
        icon={Package}
        actions={
          ctx.isAdmin ? (
            <button
              type='button'
              onClick={ctx.openAddModal}
              className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-blue-600 hover:to-blue-500'
            >
              <Plus size={18} />
              <span>{L.addFeed}</span>
            </button>
          ) : undefined
        }
      />

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
            value={ctx.searchTerm}
            onChange={(e) => ctx.setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {ctx.isLoading && (
        <div className='text-center py-12 text-gray-500'>
          {th.common.loading}
        </div>
      )}

      {!ctx.isLoading && ctx.items.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {ctx.items.map((feed) => (
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

      {!ctx.isLoading && ctx.items.length > 0 && (
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
                {ctx.items.map((feed, index) => (
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
                        {ctx.isAdmin && (
                          <button
                            type='button'
                            data-feed-actions-trigger
                            title={L.manageFeedMenu}
                            aria-label={L.manageFeedMenu}
                            aria-expanded={
                              ctx.feedActionMenu?.feedId === feed.id
                            }
                            aria-haspopup='menu'
                            onClick={(e) => {
                              const r = (
                                e.currentTarget as HTMLButtonElement
                              ).getBoundingClientRect()
                              ctx.setFeedActionMenu((prev) =>
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

      {!ctx.isLoading && ctx.items.length === 0 && (
        <div className='text-center py-12 text-gray-500'>{L.empty}</div>
      )}

      <FeedCollectionAddModal
        open={ctx.isAddModalOpen}
        onClose={() => ctx.setIsAddModalOpen(false)}
        form={ctx.addForm}
        setForm={ctx.setAddForm}
        onSubmit={ctx.handleAddSubmit}
        isPending={ctx.createMutation.isPending}
        isError={ctx.createMutation.isError}
        error={ctx.createMutation.error}
      />

      <FeedCollectionEditDetailsModal
        open={ctx.isEditDetailsModalOpen}
        onClose={() => ctx.setIsEditDetailsModalOpen(false)}
        form={ctx.editDetailsForm}
        setForm={ctx.setEditDetailsForm}
        onSubmit={ctx.handleEditDetailsSubmit}
        isPending={ctx.updateFeedMutation.isPending}
        isError={ctx.updateFeedMutation.isError}
      />

      <FeedCollectionUpdatePriceModal
        open={ctx.isUpdatePriceModalOpen}
        feed={ctx.selectedFeed}
        onClose={() => ctx.setIsUpdatePriceModalOpen(false)}
        form={ctx.updatePriceForm}
        setForm={ctx.setUpdatePriceForm}
        onSubmit={ctx.handleUpdatePriceSubmit}
        isPending={ctx.createPriceMutation.isPending}
      />

      {ctx.feedActionMenu &&
        ctx.isAdmin &&
        (() => {
          const menuFeed = ctx.items.find(
            (f) => f.id === ctx.feedActionMenu!.feedId,
          )
          if (!menuFeed) return null
          return createPortal(
            <div
              data-feed-actions-menu
              role='menu'
              className='fixed z-[200] min-w-[10.5rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg'
              style={{
                top: ctx.feedActionMenu.top,
                left: ctx.feedActionMenu.right,
                transform: 'translateX(-100%)',
              }}
            >
              <button
                type='button'
                role='menuitem'
                className='w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-blue-50'
                onClick={() => {
                  ctx.setFeedActionMenu(null)
                  ctx.openEditDetailsModal(menuFeed)
                }}
              >
                {L.editDetails}
              </button>
              <button
                type='button'
                role='menuitem'
                className='w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-blue-50'
                onClick={() => {
                  ctx.setFeedActionMenu(null)
                  ctx.openUpdatePriceModal(menuFeed)
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
