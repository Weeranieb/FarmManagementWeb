import { Base } from './base'

export interface DownloadExcelProps {
  type: 'year' | 'month' | ''
  feedId: number
  farmId: number
  date: string
}

export interface SearchDailyFeedProps {
  feedId: number
  farmId: number
  date: string
}

export interface DailyFeed extends Base {
  id: number
  activePondId: number
  pondId: number
  feedCollectionId: number
  amount: number
  feedDate: string
}
