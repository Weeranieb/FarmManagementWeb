import { Base } from './base'

export interface Pond extends Base {
  id: number
  farmId: number
  code: string
  name: string
}

export interface AddPond extends Base {
  farmId: number
}
