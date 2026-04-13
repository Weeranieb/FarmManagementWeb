import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertCircle,
  BarChart3,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { PageHeader } from '../../components/PageHeader'
import { th } from '../../locales/th'
import { useFeedPriceHistoryPage } from './hooks'

const L = th.feedPriceHistory

export function FeedPriceHistoryPage() {
  const { navigate, feed, history, isLoading } = useFeedPriceHistoryPage()

  if (isLoading) {
    return (
      <div className='text-center py-12 text-gray-500'>{th.common.loading}</div>
    )
  }

  if (!feed) {
    return (
      <div className='text-center py-16 space-y-4'>
        <AlertCircle size={48} className='mx-auto text-gray-400' />
        <p className='text-gray-500 text-lg'>{L.notFound}</p>
        <button
          onClick={() => navigate('/feed-collections')}
          className='text-blue-600 hover:text-blue-700'
        >
          {L.backToList}
        </button>
      </div>
    )
  }

  const sorted = [...history].sort(
    (a, b) =>
      new Date(a.priceUpdatedDate).getTime() -
      new Date(b.priceUpdatedDate).getTime(),
  )
  const chartData = sorted.map((h) => ({
    date: new Date(h.priceUpdatedDate).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    }),
    price: h.price,
  }))

  const prices = history.map((h) => h.price)
  const currentPrice = sorted.length > 0 ? sorted[sorted.length - 1].price : 0
  const highestPrice = prices.length > 0 ? Math.max(...prices) : 0
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0

  const descSorted = [...sorted].reverse()

  return (
    <div className='space-y-6'>
      <PageHeader
        backTo='/feed-collections'
        title={feed.name}
        subtitle={`${L.subtitle} — ${feed.unit}`}
        icon={BarChart3}
      />

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl shadow-md p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <Package className='text-orange-600' size={24} />
            <p className='text-lg text-gray-800'>{L.currentPrice}</p>
          </div>
          <p className='text-3xl text-gray-900'>
            ฿{currentPrice.toLocaleString()}
          </p>
          <p className='text-sm text-gray-600 mt-1'>
            {L.per} {feed.unit}
          </p>
        </div>

        <div className='bg-white rounded-xl shadow-md p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <TrendingUp className='text-green-600' size={24} />
            <p className='text-lg text-gray-800'>{L.highestPrice}</p>
          </div>
          <p className='text-3xl text-gray-900'>
            ฿{highestPrice.toLocaleString()}
          </p>
          <p className='text-sm text-gray-600 mt-1'>{L.allTime}</p>
        </div>

        <div className='bg-white rounded-xl shadow-md p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <TrendingDown className='text-blue-600' size={24} />
            <p className='text-lg text-gray-800'>{L.lowestPrice}</p>
          </div>
          <p className='text-3xl text-gray-900'>
            ฿{lowestPrice.toLocaleString()}
          </p>
          <p className='text-sm text-gray-600 mt-1'>{L.allTime}</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className='bg-white rounded-xl shadow-md p-6'>
          <h2 className='text-xl text-gray-800 mb-6'>{L.chartTitle}</h2>
          <ResponsiveContainer width='100%' height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis dataKey='date' stroke='#6b7280' />
              <YAxis stroke='#6b7280' domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type='monotone'
                dataKey='price'
                stroke='#f59e0b'
                strokeWidth={3}
                dot={{ fill: '#f59e0b', r: 5 }}
                activeDot={{ r: 7 }}
                name={L.priceLabel}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className='bg-white rounded-xl shadow-md overflow-hidden'>
        <h2 className='text-xl text-gray-800 p-6 border-b border-gray-200'>
          {L.timelineTitle}
        </h2>
        {descSorted.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>{L.noHistory}</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-6 py-4 text-left text-sm text-gray-600'>
                    {L.colDate}
                  </th>
                  <th className='px-6 py-4 text-left text-sm text-gray-600'>
                    {L.colPrice}
                  </th>
                  <th className='px-6 py-4 text-left text-sm text-gray-600'>
                    {L.colChange}
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {descSorted.map((record, index) => {
                  const prevRecord =
                    index < descSorted.length - 1 ? descSorted[index + 1] : null
                  const change = prevRecord
                    ? ((record.price - prevRecord.price) / prevRecord.price) *
                      100
                    : null

                  return (
                    <tr
                      key={record.id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4 text-sm text-gray-900'>
                        {new Date(record.priceUpdatedDate).toLocaleDateString(
                          'th-TH',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          },
                        )}
                      </td>
                      <td className='px-6 py-4 text-gray-900'>
                        ฿{record.price.toLocaleString()}
                      </td>
                      <td className='px-6 py-4'>
                        {change != null && (
                          <span
                            className={`text-sm ${
                              change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {change >= 0 ? '+' : ''}
                            {change.toFixed(1)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
