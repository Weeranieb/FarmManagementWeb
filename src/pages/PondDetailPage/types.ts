export interface PondCycle {
  cycleNumber: number
  status: 'active' | 'completed'
  startDate: string
  endDate: string | null
  initialStock: number
  finalStock: number
  totalCost: number
  totalRevenue: number
  profit: number
  durationDays: number
}

export interface Transaction {
  id: string
  date: string
  type: 'cost' | 'revenue'
  category: string
  description: string
  amount: number
  quantity?: number
}
