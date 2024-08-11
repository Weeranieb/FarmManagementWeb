import { FC, useState } from 'react'
import { DataGrid, GridSortModel } from '@mui/x-data-grid'
import { Box, TextField, MenuItem } from '@mui/material'
import DialogAdd from './DialogAdd'
import PageBar from '../../components/PageBar'
import { columns } from './BillColumns' // Import columns from the new file

const rows = [
  {
    id: '1.',
    type: 'ค่าไฟ',
    other: 'ย้าย',
    farm: 'ฟาร์ม 1',
    paidAmount: '20,000',
    paymentDate: '02/08/2566',
    updatedDate: '8/21/15',
  },
  {
    id: '2.',
    type: 'ค่าไฟ',
    other: 'ย้าย',
    farm: 'ฟาร์ม 1',
    paidAmount: '20,000',
    paymentDate: '02/08/2566',
    updatedDate: '8/21/15',
  },
]

const Bill: FC = () => {
  const [typeFilter, setTypeFilter] = useState('')
  const [farmFilter, setFarmFilter] = useState('')
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

  const handleFormSubmit = (newBill: any) => {
    console.log('New Bill:', newBill)
  }

  const filteredRows = rows.filter((row) => {
    return (
      (typeFilter === '' || row.type.includes(typeFilter)) &&
      (farmFilter === '' || row.farm.includes(farmFilter))
    )
  })

  return (
    <Box>
      <PageBar title='ค่าใช้จ่าย' handleDialogOpen={handleDialogOpen} />
      <Box display='flex' alignItems='center' p={2}>
        <TextField
          label='ประเภท'
          variant='outlined'
          size='small'
          sx={{ width: 170, mr: 3 }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          select
        >
          <MenuItem value=''>ทั้งหมด</MenuItem>
          <MenuItem value='ค่าไฟ'>ค่าไฟ</MenuItem>
          <MenuItem value='เงินเดือนลูกน้อง'>เงินเดือนลูกน้อง</MenuItem>
        </TextField>
        <TextField
          label='ฟาร์ม'
          variant='outlined'
          size='small'
          sx={{ width: 150, mr: 3 }}
          value={farmFilter}
          onChange={(e) => setFarmFilter(e.target.value)}
          select
        >
          <MenuItem value=''>ทั้งหมด</MenuItem>
          <MenuItem value='ฟาร์ม 1'>ฟาร์ม 1</MenuItem>
          <MenuItem value='ฟาร์ม 2'>ฟาร์ม 2</MenuItem>
        </TextField>
      </Box>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
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

export default Bill
