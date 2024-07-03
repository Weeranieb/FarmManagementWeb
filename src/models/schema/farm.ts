import { Base } from './base'

export interface Farm extends Base {
  id: number
  clientId: number
  code: string
  name: string
}
