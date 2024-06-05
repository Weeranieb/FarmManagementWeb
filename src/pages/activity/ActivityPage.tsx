import React, { useState } from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import {
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Typography,
  Button,
  Menu,
} from '@mui/material'
import {
  Search as SearchIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { GridSortModel } from '@mui/x-data-grid/models/gridSortModel'
import DialogFill from './DialogFill'
import DialogMove from './DialogMove'
import Swal from 'sweetalert2'
import DialogSell from './DialogSell'
import { styled } from '@mui/system'

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
        <DeleteIcon color='disabled' />
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
        <DeleteIcon color='disabled' />
      </>
    ),
  },
]

const Activity: React.FC = () => {
  // make column in scope of the component
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
    {
      field: 'totalWeight',
      headerName: 'น้ำหนักรวม',
      flex: 0.2,
      align: 'center',
    },
    { field: 'unit', headerName: 'หน่วย', flex: 0.2 },
    {
      field: 'date',
      headerName: 'วันที่ทำ',
      flex: 0.2,
    },
    {
      field: 'edit',
      headerName: 'เพิ่มข้อมูลวันที่',
      flex: 0.2,
      align: 'center',
    },
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
                onClick={handleInfoClick}
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
              <DeleteIcon
                color='disabled'
                style={{ cursor: 'pointer' }}
                onClick={() => handleDeleteClick(params.row.id)}
              />
            </Box>
          )
        }
        return params.value
      },
    },
  ]

  const [typeFilter, setTypeFilter] = React.useState('')
  const [farmFilter, setFarmFilter] = React.useState('')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedActivity, setSelectedActivity] = React.useState('')

  const [initialSortModel, setInitialSortModel] = React.useState<GridSortModel>(
    [
      {
        field: 'id',
        sort: 'desc',
      },
    ]
  )

  const handleInfoClick = () => {
    setDialogOpen(true) // Open the dialog when Info icon is clicked
  }

  const handleDeleteClick = (id: number) => {
    Swal.fire({
      title: 'ยืนยันการลบข้อมูล',
      text: 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้? \nข้อมูลจะถูกลบถาวรและไม่สามารถกู้คืนได้!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        // เริ่มต้นการลบข้อมูลที่นี่
        console.log('กำลังลบข้อมูลกิจกรรม ID:', id)
        Swal.fire(
          'ลบข้อมูลสำเร็จ!',
          'ข้อมูลของคุณถูกลบเรียบร้อยแล้ว.',
          'success'
        )
      }
    })
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleMenuItemClick = (activity: string) => {
    handleDialogOpen(activity)
    setAnchorEl(null)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleSortModelChange = (newSortModel: any) => {
    setInitialSortModel(newSortModel)
  }

  const handleDialogOpen = (activity: string) => {
    setSelectedActivity(activity)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
  }

  const handleFormSubmit = (newActivity: any) => {
    console.log('New Activity:', newActivity)
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
          <Button
            variant='outlined'
            onClick={handleMenuClick}
            sx={{
              backgroundColor: '#CEBCA1',
              color: '#4B4B4C',
              fontSize: '1.03rem',
              padding: '4px 20px',
            }}
          >
            เพิ่ม
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={() => handleMenuItemClick('เติม')}>
              เติม
            </MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('ย้าย')}>
              ย้าย
            </MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('ขาย')}>ขาย</MenuItem>
          </Menu>
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
      {selectedActivity === 'เติม' ? (
        <DialogFill
          open={dialogOpen}
          onClose={handleDialogClose}
          onSubmit={handleFormSubmit}
        />
      ) : selectedActivity === 'ย้าย' ? (
        <DialogMove
          open={dialogOpen}
          onClose={handleDialogClose}
          onSubmit={handleFormSubmit}
        />
      ) : selectedActivity === 'ขาย' ? (
        <DialogSell
          open={dialogOpen}
          onClose={handleDialogClose}
          onSubmit={handleFormSubmit}
        />
      ) : null}
    </div>
  )
}

export default Activity
