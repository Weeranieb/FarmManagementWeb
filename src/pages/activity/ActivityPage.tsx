import * as React from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import {
  Box,
  TextField,
  MenuItem,
  IconButton,
  InputAdornment,
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'

const columns: GridColDef[] = [
  { field: 'id', headerName: 'NO', width: 70 },
  { field: 'tank', headerName: 'บ่อ', width: 150 },
  { field: 'activity', headerName: 'กิจกรรม', width: 150 },
  { field: 'farm', headerName: 'ฟาร์ม', width: 150 },
  { field: 'totalWeight', headerName: 'น้ำหนักรวม', width: 150 },
  { field: 'unit', headerName: 'หน่วย', width: 100 },
  { field: 'date', headerName: 'วันที่ทำ', width: 150 },
  { field: 'edit', headerName: 'เพิ่มข้อมูลวันที่', width: 160 },
]

const rows = [
  {
    id: 1,
    tank: 'บ่อ2',
    activity: 'ย้าย',
    farm: 'บ้านระกาศ',
    totalWeight: '4.3 ต้น',
    unit: '',
    date: '02/08/2566',
    edit: '8/21/15',
  },
]

const ExpenseList: React.FC = () => {
  return (
    <div>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        marginBottom={2}
      >
        <Box>
          <h2 style={{ margin: 0, padding: '0 10px' }}>กิจกรรม</h2>
        </Box>
        <Box display='flex' alignItems='center'>
          <TextField
            label='Search'
            variant='outlined'
            size='small'
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ marginRight: 1 }}
          />
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
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} />
      </div>
    </div>
  )
}

export default ExpenseList
