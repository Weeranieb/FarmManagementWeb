import { Base } from './base'

export interface FarmWithActive {
  id: number
  code: string
  name: string
  activePondId: number | null
  hasHistory: boolean
}

export interface ActivePond extends Base {
  id: number
  pondId: number
  startDate: string
  endDate: string | null
  isActive: boolean
}
