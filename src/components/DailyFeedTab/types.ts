import type { FarmPondOption } from '../TemplateImportModal'

export interface DailyFeedTabProps {
  pondId: number
  farmId: number
  farmPonds: FarmPondOption[]
  showTouristCatch: boolean
  cycleStartDate?: string | null
}

export type DayRow = {
  freshMorning: number
  freshEvening: number
  pelletMorning: number
  pelletEvening: number
  deathFishCount: number
  touristCatchCount: number
}

export type DirtyMonthState = {
  rows: Record<number, DayRow>
  freshFcId: number | null
  pelletFcId: number | null
  originalRows: Record<number, DayRow>
}
