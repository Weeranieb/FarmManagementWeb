export interface FarmWithActive {
  id: number
  code: string
  name: string
  activePondId: number | null
  hasHistory: boolean
}
