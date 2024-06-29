import { Base } from './base'

export interface User extends Base {
  id: number
  clientId: number
  username: string
  firstName: string
  lastName?: string
  userLevel: number
  contactNumber: string
}
