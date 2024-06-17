import React from 'react'
import { DataGrid, GridSortModel } from '@mui/x-data-grid'
import DialogAdd from './DialogAdd'
import { Box } from '@mui/material'
import PageBar from '../../components/PageBar'
import { columns } from './FeedColumns'

const rows = [
  {
    id: '1.',
    name: 'เหยื่อสด',
    code: 'สด',
    price: 40,
    unit: 'ลัง',
    priceUpdatedDate: '02/08/2566',
  },
  {
    id: '2.',
    name: 'อาหารเม็ด',
    code: 'เม็ด',
    price: 940,
    unit: 'ถุง',
    priceUpdatedDate: '02/08/2566',
  },
]

const Feed: React.FC = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [initialSortModel, setInitialSortModel] = React.useState<GridSortModel>(
    [
      {
        field: 'id',
        sort: 'desc',
      },
    ]
  )

  const handleSortModelChange = (newSortModel: any) => {
    setInitialSortModel(newSortModel)
  }

  const handleDialogOpen = () => {
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
  }

  const handleFormSubmit = (newFeed: any) => {
    console.log('New Feed:', newFeed)
  }

  return (
    <Box>
      <PageBar title='รายการเหยื่อ' handleDialogOpen={handleDialogOpen} />
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          sortModel={initialSortModel}
          onSortModelChange={handleSortModelChange}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#FAF8EE',
              fontWeight: 'bolder',
              fontSize: '1.05rem',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'transparent',
            },
          }}
        />
      </Box>
      <DialogAdd
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleFormSubmit}
      />
    </Box>
  )
}

export default Feed
