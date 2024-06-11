import { Base } from './base'

export interface Worker extends Base {
  id: number
  clientId: number
  farmGroupId: number
  firstName: string
  lastName?: string
  gender: string
  contactNumber?: string
  country: string
  salary: number
  hireDate?: string
  isActive: boolean
}
