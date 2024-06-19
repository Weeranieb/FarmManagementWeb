import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { DataGrid, GridSortModel } from '@mui/x-data-grid'
import { columns } from './ActivityColumns'

const rows = [
  {
    id: '1.',
    type: 'เหยื่อสด',
    date: 'สด',
    totalWeight: 400,
    createdDate: '02/08/2566',
  },
  {
    id: '2.',
    name: 'อาหารเม็ด',
    code: 'เม็ด',
    price: 940,
    unit: 'ถุง',
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
  {
    id: '2.',
    name: 'อาหารเม็ด',
    code: 'เม็ด',
    price: 940,
    unit: 'ถุง',
    priceUpdatedDate: '02/08/2566',
  },
]

// Define the columns for "ประวัติบ่อ"
const historyColumns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'date', headerName: 'วันที่', width: 150 },
  { field: 'netIncome', headerName: 'รายได้สุทธิ', width: 150 },
]

// Define the rows for "ประวัติบ่อ"
const historyRows = [
  { id: 1, date: '01/01/2566', netIncome: 5000 },
  { id: 2, date: '02/01/2566', netIncome: 6000 },
  // Add more rows as needed
]

const AllActivity: React.FC = () => {
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

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={8}>
        <Card sx={{ boxSizing: 'border-box' }}>
          <CardHeader
            title='กิจกรรมทั้งหมด'
            action={
              <IconButton
                aria-controls='simple-menu'
                aria-haspopup='true'
                onClick={handleClick}
              >
                <MoreVertIcon />
              </IconButton>
            }
          />
          <Menu
            id='simple-menu'
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Action 1</MenuItem>
            <MenuItem onClick={handleClose}>Action 2</MenuItem>
            <MenuItem onClick={handleClose}>Action 3</MenuItem>
          </Menu>
          <CardContent sx={{ overflow: 'hidden' }}>
            <Box sx={{ height: 'calc(100% - 30px)', overflow: 'auto' }}>
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
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={4}>
        <Card sx={{ boxSizing: 'border-box' }}>
          <CardHeader
            title='ประวัติบ่อ'
            action={
              <IconButton
                aria-controls='simple-menu'
                aria-haspopup='true'
                onClick={handleClick}
              >
                <MoreVertIcon />
              </IconButton>
            }
          />
          <Menu
            id='simple-menu'
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Action 1</MenuItem>
            <MenuItem onClick={handleClose}>Action 2</MenuItem>
            <MenuItem onClick={handleClose}>Action 3</MenuItem>
          </Menu>
          <CardContent sx={{ overflow: 'hidden' }}>
            <Box sx={{ height: 'calc(100% - 30px)', overflow: 'auto' }}>
              <DataGrid
                rows={historyRows}
                columns={historyColumns}
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
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AllActivity
