import React, { useCallback, useEffect, useState } from 'react'
import { DataGrid, GridRowParams } from '@mui/x-data-grid'
import {
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Typography,
  Button,
  Menu,
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import { GridSortModel } from '@mui/x-data-grid/models/gridSortModel'
import { GridPaginationModel } from '@mui/x-data-grid/models/gridPaginationProps'
import DialogFill from './DialogFill'
import DialogMove from './DialogMove'
import DialogSell from './DialogSell'
import { columns } from './ActivityColumns'
import { useNavigate } from 'react-router-dom'
import { PageOptions } from '../../models/api/pageOptions'
import { getActivityListApi } from '../../services/activity.service'
import { ActivityList } from '../../models/schema/activity'
import ModeFilter from './ActivityCatalogue'
import FarmFilter from './FarmCatalogue'

const ActivityPage: React.FC = () => {
  const navigate = useNavigate()
  const [rowActivity, setRows] = useState<ActivityList[]>([])
  const [modeFilter, setModeFilter] = React.useState('')
  const [farmFilter, setFarmFilter] = React.useState<number>(0)
  // const [farmFilter, setFarmFilter] = useState<string | number>('')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedActivity, setSelectedActivity] = React.useState('')
  const [pageOption, setPageOption] = useState<PageOptions>({
    page: 0,
    pageSize: 10,
    orderBy: '"Id" desc',
    keyword: '',
  })

  const handleRowDblClick = (row: GridRowParams): void => {
    navigate(`/appowner/info/${row.id}`, {
      replace: true,
    })
  }

  const handlePageModelChange = async (newPageModel: GridPaginationModel) => {
    setPageOption({
      ...pageOption,
      page: newPageModel.page,
      pageSize: newPageModel.pageSize,
    })
  }

  let keywordTimeout: NodeJS.Timeout
  const handleSearch = (e: any) => {
    clearTimeout(keywordTimeout)

    keywordTimeout = setTimeout(async () => {
      setPageOption((prev) => ({
        ...prev,
        keyword: e.target.value,
      }))
    }, 700)
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

  const handleSortModelChange = useCallback(
    (sortModel: GridSortModel) => {
      if (sortModel.length && sortModel[0].field) {
        setPageOption({
          ...pageOption,
          orderBy: `${sortModel[0].field} ${sortModel[0].sort}`,
        })
      }
    },
    [pageOption]
  )

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

  const getActivityList = useCallback(async () => {
    setIsLoading(true)
    await getActivityListApi(pageOption, modeFilter, farmFilter).then((res) => {
      if (res.result) setRows(res.data.items)
    })
    setIsLoading(false)
  }, [pageOption, modeFilter, farmFilter])

  useEffect(() => {
    getActivityList()
  }, [getActivityList])

  return (
    <Box>
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
              placeholder='ค้นหาบ่อ'
              onChange={handleSearch}
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
        <ModeFilter value={modeFilter} onChange={setModeFilter} />
        <FarmFilter value={farmFilter} onChange={setFarmFilter} />
      </Box>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rowActivity}
          columns={columns}
          onPaginationModelChange={handlePageModelChange}
          onSortModelChange={handleSortModelChange}
          paginationModel={{
            pageSize: pageOption.pageSize,
            page: pageOption.page,
          }}
          rowCount={rowActivity.length || 0}
          paginationMode='server'
          disableRowSelectionOnClick
          loading={isLoading}
          autoHeight
          onRowDoubleClick={handleRowDblClick}
          pageSizeOptions={[10, 50, 100]}
          pagination
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
    </Box>
  )
}

export default ActivityPage
