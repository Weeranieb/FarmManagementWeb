import React from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Button,
} from '@mui/material'
import {
  Search as SearchIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { GridSortModel } from '@mui/x-data-grid/models/gridSortModel'
import Swal from 'sweetalert2'
import DialogAdd from './DialogAdd'

const rows = [
  {
    id: '1.',
    name: 'เหยื่อสด',
    code: 'สด',
    price: 40,
    unit: 'ลัง',
    priceUpdatedDate: '02/08/2566',
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
    id: '2.',
    name: 'อาหารเม็ด',
    code: 'เม็ด',
    price: 940,
    unit: 'ถุง',
    priceUpdatedDate: '02/08/2566',
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
]

const Feed: React.FC = () => {
  // make column in scope of the component
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '',
      flex: 0.05,
      hideSortIcons: true,
      align: 'right',
    },
    {
      field: 'name',
      headerName: 'รายการ',
      flex: 0.2,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'code',
      headerName: 'โค้ดเนม',
      flex: 0.15,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'price',
      headerName: 'ราคาล่าสุด',
      flex: 0.15,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'unit',
      headerName: 'หน่วย',
      flex: 0.15,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'priceUpdatedDate',
      headerName: 'อัปเดทวันที่',
      flex: 0.15,
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

  const [dialogOpen, setDialogOpen] = React.useState(false)
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
            รายการเหยื่อ
          </Typography>
        </Box>
        <Box display='flex' alignItems='center' sx={{ pb: 4 }}>
          <Box display='flex' alignItems='center' sx={{ marginRight: 1 }}>
            <TextField
              variant='outlined'
              size='small'
              placeholder='ค้นหา'
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
            onClick={handleDialogOpen}
            sx={{
              backgroundColor: '#CEBCA1',
              color: '#4B4B4C',
              fontSize: '1.03rem',
              padding: '4px 20px',
            }}
          >
            เพิ่ม
          </Button>
        </Box>
      </Box>
      <div style={{ height: 600, width: '100%' }}>
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
      </div>
      <DialogAdd
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}

export default Feed
