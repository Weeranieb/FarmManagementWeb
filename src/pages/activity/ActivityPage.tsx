import { useCallback, useEffect, useState, FC, MouseEvent } from 'react'
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
import { useColumns } from './ActivityColumns'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PageOptions } from '../../models/api/pageOptions'
import { getActivityListApi } from '../../services/activity.service'
import {
  ActivityList,
  AddFillActivity,
  AddMoveActivity,
  AddSellActivity,
} from '../../models/schema/activity'
import ModeFilter from './ActivityCatalogue'
import FarmFilter from './FarmCatalogue'
import { ActivityMode } from '../../constants/activity'
import SuccessAlert from '../../components/SuccessAlert'
import ErrorAlert from '../../components/ErrorAlert'

const ActivityPage: FC = () => {
  const navigate = useNavigate()
  const [rowActivity, setRows] = useState<ActivityList[]>([])
  const [modeFilter, setModeFilter] = useState('')
  const [farmFilter, setFarmFilter] = useState<number>(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState('')
  const [pageOption, setPageOption] = useState<PageOptions>({
    page: 0,
    pageSize: 10,
    orderBy: '"Id" desc',
    keyword: '',
  })

  const { t } = useTranslation()

  const handleRowDblClick = (row: GridRowParams): void => {
    // navigate(`/appowner/info/${row.id}`, {
    //   replace: true,
    // })
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
  const handleMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
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

  const handleFormSubmit = (
    newActivity: AddFillActivity | AddMoveActivity | AddSellActivity
  ) => {
    console.log('New Activity:', newActivity)
    // SuccessAlert()
    // ErrorAlert({ message: 'Error', code: 'Error' })

    //   onSubmit: async (values, actions) => {
    //     if (isAddMode) {
    //       await createAppOwnerApi(values)
    //         .then((res) => {
    //           if (res.result) {
    //             Swal.fire({
    //               icon: "success",
    //               title: "Successfully",
    //               showConfirmButton: false,
    //               timer: 1500,
    //             }).then(() => {
    //               navigate(`/domain/info/${res.data.id}`, {
    //                 replace: true,
    //               })
    //             })
    //           } else {
    //             Swal.fire(res.error.code, res.error.message, "error")
    //           }
    //         })
    //         .catch((err: any) => {
    //           return Swal.fire({
    //             icon: "error",
    //             title: err.code || err.error?.code,
    //             text: err.message || err.error?.message,
    //           })
    //         })
    //     } else {
    //       await updateAppOwnerApi(parseInt(id), values)
    //         .then((res) => {
    //           if (res.result) {
    //             Swal.fire({
    //               icon: "success",
    //               title: "Successfully",
    //               showConfirmButton: false,
    //               timer: 1500,
    //             }).then(() =>
    //               navigate(`/domain/info/${res.data.id}`, {
    //                 replace: true,
    //               })
    //             )
    //           } else {
    //             Swal.fire(res.error.code, res.error.message, "error")
    //           }
    //         })
    //         .catch((err: any) => {
    //           return Swal.fire({
    //             icon: "error",
    //             title: err.code || err.error?.code,
    //             text: err.message || err.error?.message,
    //           })
    //         })
    //     }
    //   },
    // })
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
            <MenuItem onClick={() => handleMenuItemClick(ActivityMode.Fill)}>
              {t('fill')}
            </MenuItem>
            <MenuItem onClick={() => handleMenuItemClick(ActivityMode.Move)}>
              {t('move')}
            </MenuItem>
            <MenuItem onClick={() => handleMenuItemClick(ActivityMode.Sell)}>
              {t('sell')}
            </MenuItem>
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
          columns={useColumns()}
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
      {selectedActivity === 'FILL' ? (
        <DialogFill
          open={dialogOpen}
          onClose={handleDialogClose}
          onSubmit={handleFormSubmit}
        />
      ) : selectedActivity === 'MOVE' ? (
        <DialogMove
          open={dialogOpen}
          onClose={handleDialogClose}
          onSubmit={handleFormSubmit}
        />
      ) : selectedActivity === 'SELL' ? (
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
