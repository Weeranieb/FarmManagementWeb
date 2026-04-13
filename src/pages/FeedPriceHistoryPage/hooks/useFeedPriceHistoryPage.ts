import { useParams, useNavigate } from 'react-router-dom'
import {
  useFeedCollectionQuery,
  useFeedPriceHistoryQuery,
} from '../../../hooks/useFeedCollection'

export function useFeedPriceHistoryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const feedId = Number(id)

  const { data: feed, isLoading: feedLoading } = useFeedCollectionQuery(feedId)
  const { data: history = [], isLoading: historyLoading } =
    useFeedPriceHistoryQuery(feedId)

  return {
    navigate,
    feedId,
    feed,
    history,
    isLoading: feedLoading || historyLoading,
  }
}
