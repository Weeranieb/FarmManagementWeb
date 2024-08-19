export interface Base {
  delFlag?: boolean
  createdDate?: Date
  createdBy?: string
  updatedDate?: Date
  updatedBy?: string
}

export interface AddName {
  name: string
  code: string
}
