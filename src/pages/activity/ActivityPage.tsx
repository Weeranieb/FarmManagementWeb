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

const columns: GridColDef[] = [
  { field: 'id', headerName: '', width: 70 },
  { field: 'pond', headerName: 'บ่อ', width: 150 },
  { field: 'activity', headerName: 'กิจกรรม', width: 150 },
  { field: 'farm', headerName: 'ฟาร์ม', width: 150 },
  { field: 'totalWeight', headerName: 'น้ำหนักรวม', width: 150 },
  { field: 'unit', headerName: 'หน่วย', width: 100 },
  { field: 'date', headerName: 'วันที่ทำ', width: 150 },
  { field: 'edit', headerName: 'เพิ่มข้อมูลวันที่', width: 160 },
  {
    field: 'actions',
    headerName: '',
    width: 100,
    renderCell: (params) => {
      if (params.field === 'actions') {
        return (
          <Box display='flex' alignItems='center'>
            <InfoIcon color='disabled' />
            <MoreHorizIcon color='disabled' />
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
    totalWeight: '4.3 ต้น',
    unit: 'กิโลกรัม',
    date: '02/08/2566',
    edit: '8/21/15',
    actions: (
      <>
        <InfoIcon color='disabled' />
        <MoreHorizIcon color='disabled' />
      </>
    ),
  },
  {
    id: 2,
    pond: 'บ่อ 3',
    activity: 'ย้าย',
    farm: 'ฟาร์ม 2',
    totalWeight: '4.3 ต้น',
    unit: 'กิโลกรัม',
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
  const [dateFilter, setDateFilter] = React.useState('')

  const filteredRows = rows.filter((row) => {
    return (
      (typeFilter === '' || row.activity.includes(typeFilter)) &&
      (farmFilter === '' || row.farm.includes(farmFilter)) &&
      (dateFilter === '' || row.date.includes(dateFilter))
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
            sx={{ width: 150, mr: 3 }}
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
        <TextField
          label='วันที่'
          variant='outlined'
          size='small'
          sx={{ width: 150, mr: 3 }}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </Box>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
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
