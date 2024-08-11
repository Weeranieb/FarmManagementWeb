import { FC, useState, MouseEvent } from 'react'
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
import { getColumns as getHistoryColumns } from './HistoryColumns'
import { useNavigate } from 'react-router-dom'

const rows = [
  {
    id: '1.',
    type: 'เติม',
    date: '02/08/2566',
    totalWeight: 400,
    unit: 'กก.',
    createdDate: '02/08/2566',
  },
  {
    id: '2.',
    type: 'ย้าย',
    date: '02/08/2566',
    totalWeight: 400,
    unit: 'กก.',
    createdDate: '02/08/2566',
  },
]

// Define the rows for "ประวัติบ่อ"
const historyRows = [
  { id: 1, date: '01/01/2566', netIncome: 5000 },
  { id: 2, date: '02/01/2566', netIncome: 6000 },
  // Add more rows as needed
]

const AllActivity: FC = () => {
  const navigate = useNavigate()

  const handleHistoryClick = (id: number) => {
    navigate(`/pond/${id}`)
  }

  const [initialSortModel, setInitialSortModel] = useState<GridSortModel>([
    {
      field: 'id',
      sort: 'desc',
    },
  ])

  const handleSortModelChange = (newSortModel: any) => {
    setInitialSortModel(newSortModel)
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={8} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
          <CardContent
            sx={{
              flex: 1,
              // overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1 }}>
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
      <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
          <CardContent
            sx={{
              flex: 1,
              // overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <DataGrid
                rows={historyRows}
                columns={getHistoryColumns(handleHistoryClick)}
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
