import { GridPaginationModel } from '@mui/x-data-grid/models/gridPaginationProps'

export interface PageOptions extends GridPaginationModel {
  orderBy: string
  keyword: string
}
