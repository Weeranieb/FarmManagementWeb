import * as React from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import {
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Typography,
} from '@mui/material'
import {
  Search as SearchIcon,
  Info as InfoIcon,
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material'

import { GridSortModel } from '@mui/x-data-grid/models/gridSortModel'

const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: '',
    flex: 0.05,
    hideSortIcons: true,
  },
  { field: 'pond', headerName: 'บ่อ', flex: 0.15 },
  { field: 'activity', headerName: 'กิจกรรม', flex: 0.15 },
  {
    field: 'farm',
    headerName: 'ฟาร์ม',
    flex: 0.2,
    headerAlign: 'center',
    align: 'center',
  },
  { field: 'totalWeight', headerName: 'น้ำหนักรวม', flex: 0.2, align: 'right' },
  { field: 'unit', headerName: 'หน่วย', flex: 0.2 },
  {
    field: 'date',
    headerName: 'วันที่ทำ',
    flex: 0.2,
  },
  { field: 'edit', headerName: 'เพิ่มข้อมูลวันที่', flex: 0.2 },
  {
    field: 'info',
    headerName: '',
    align: 'right',
    hideSortIcons: true,
    disableColumnMenu: true,
    flex: 0.05,
    renderCell: (params) => {
      if (params.field === 'info') {
        return (
          <Box display='flex' alignItems='center'>
            <InfoIcon
              color='disabled'
              style={{ cursor: 'pointer' }}
              onClick={() => console.log('info', params.row.id)}
            />
          </Box>
        )
      }
      return params.value
    },
  },
  {
    field: 'more',
    headerName: '',
    align: 'left',
    hideSortIcons: true,
    disableColumnMenu: true,
    flex: 0.1,
    renderCell: (params) => {
      if (params.field === 'more') {
        return (
          <Box display='flex' alignItems='center'>
            <MoreHorizIcon
              color='disabled'
              style={{ cursor: 'pointer' }}
              onClick={() => console.log('more', params.row.id)}
            />
          </Box>
        )
      }
      return params.value
    },
  },
]

const rows = [
  {
    id: 1,
    pond: 'บ่อ 2',
    activity: 'ย้าย',
    farm: 'ฟาร์ม 1',
    totalWeight: '4.3',
    unit: 'ตัน',
    date: '02/08/2566',
    edit: '8/21/15',
    info: (
      <>
        <InfoIcon color='disabled' />
      </>
    ),
    more: (
      <>
        <MoreHorizIcon color='disabled' />
      </>
    ),
  },
  {
    id: 2,
    pond: 'บ่อ 3',
    activity: 'ย้าย',
    farm: 'ฟาร์ม 2',
    totalWeight: '4.3',
    unit: 'ตัน',
    date: '02/08/2566',
    edit: '8/21/15',
    actions: (
      <>
        <InfoIcon color='disabled' />
        <MoreHorizIcon color='disabled' />
      </>
    ),
  },
]

const ExpenseList: React.FC = () => {
  const [typeFilter, setTypeFilter] = React.useState('')
  const [farmFilter, setFarmFilter] = React.useState('')

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

  const filteredRows = rows.filter((row) => {
    return (
      (typeFilter === '' || row.activity.includes(typeFilter)) &&
      (farmFilter === '' || row.farm.includes(farmFilter))
    )
  })

  return (
    <div>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        p={2}
      >
        <Box>
          <Typography
            variant='h4'
            component='h4'
            style={{ margin: 0, padding: '0 10px' }}
            gutterBottom
            fontWeight='bold'
          >
            กิจกรรม
          </Typography>
        </Box>
        <Box display='flex' alignItems='center'>
          <Box display='flex' alignItems='center' sx={{ marginRight: 1 }}>
            <TextField
              variant='outlined'
              size='small'
              placeholder='Search'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TextField
            select
            variant='outlined'
            size='small'
            label='เพิ่ม'
            sx={{ width: 100, mr: 3 }}
          >
            <MenuItem value='เติม'>เติม</MenuItem>
            <MenuItem value='ย้าย'>ย้าย</MenuItem>
            <MenuItem value='ขาย'>ขาย</MenuItem>
          </TextField>
        </Box>
      </Box>
      <Box display='flex' alignItems='center' p={2}>
        <TextField
          label='ประเภท'
          variant='outlined'
          size='small'
          sx={{ width: 150, mr: 3 }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          select
        >
          <MenuItem value=''>ทั้งหมด</MenuItem>
          <MenuItem value='เติม'>เติม</MenuItem>
          <MenuItem value='ย้าย'>ย้าย</MenuItem>
          <MenuItem value='ขาย'>ขาย</MenuItem>
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
      <div style={{ height: 600, width: '100%' }}>
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
      </div>
    </div>
  )
}

export default ExpenseList
