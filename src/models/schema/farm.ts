import { AddName, Base } from './base'

export interface Farm extends Base {
  id: number
  clientId: number
  code: string
  name: string
}

export interface ClientWithFarms extends Farm {
  clientName: string
  clientId: number
}

export interface AddFarm extends AddName {
  clientId: number
}
