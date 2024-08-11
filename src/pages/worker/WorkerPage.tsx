import { FC, useState } from 'react'
import { DataGrid, GridSortModel } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import DialogAdd from './DialogAdd'
import PageBar from '../../components/PageBar'
import { columns } from './WorkerColumns' // Import columns from the new file

const rows = [
  {
    id: '1.',
    name: 'วีรชัย แป้นถึง',
    country: 'กัมพูชา',
    salary: 50000,
    startDate: '02/08/2566',
    updatedDate: '8/21/15',
  },
  {
    id: '2.',
    name: 'วีรชน แป้นถึง',
    country: 'ไทย',
    salary: 80000,
    startDate: '02/08/2566',
    updatedDate: '8/21/15',
  },
]

const Worker: FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false)

  const [initialSortModel, setInitialSortModel] = useState<GridSortModel>([
    {
      field: 'id',
      sort: 'desc',
    },
  ])

  const handleSortModelChange = (newSortModel: any) => {
    setInitialSortModel(newSortModel)
  }

  const handleDialogOpen = () => {
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
  }

  const handleFormSubmit = (newWorker: any) => {
    console.log('New Worker:', newWorker)
  }

  return (
    <Box>
      <PageBar title='รายการลูกน้อง' handleDialogOpen={handleDialogOpen} />
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

export default Worker
