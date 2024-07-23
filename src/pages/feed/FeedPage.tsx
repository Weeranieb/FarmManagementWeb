import React, { useCallback, useEffect, useState } from 'react'
import { DataGrid, GridPaginationModel, GridSortModel } from '@mui/x-data-grid'
import DialogAdd from './DialogAdd'
import { Box } from '@mui/material'
import PageBar from '../../components/PageBar'
import { useColumns } from './FeedColumns'
import { FeedCollection } from '../../models/schema/feed'
import { PageOptions } from '../../models/api/pageOptions'
import { firstCapital } from '../../utils/string'
import {
  createFeedCollectionApi,
  getFeedListApi,
} from '../../services/feedCollection.service'
import ErrorAlert from '../../components/ErrorAlert'
import SuccessAlert from '../../components/SuccessAlert'

const Feed: React.FC = () => {
  const [feedRows, setFeedRows] = useState<FeedCollection[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pageOption, setPageOption] = useState<PageOptions>({
    page: 0,
    pageSize: 10,
    orderBy: '"Id" desc',
    keyword: '',
  })

  const handlePageModelChange = async (newPageModel: GridPaginationModel) => {
    setPageOption({
      ...pageOption,
      page: newPageModel.page,
      pageSize: newPageModel.pageSize,
    })
  }

  const handleSortModelChange = useCallback(
    (sortModel: GridSortModel) => {
      if (sortModel.length && sortModel[0].field) {
        setPageOption({
          ...pageOption,
          orderBy: `"${firstCapital(sortModel[0].field)}" ${sortModel[0].sort}`,
        })
      }
    },
    [pageOption]
  )

  const handleDialogOpen = () => {
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
  }

  const handleFormSubmit = async (newFeed: any) => {
    console.log('New Feed:', newFeed)
    await createFeedCollectionApi(newFeed)
      .then((res) => {
        if (res.result) {
          SuccessAlert()
          window.location.reload()
        } else {
          ErrorAlert(res)
        }
      })
      .catch((err) => {
        ErrorAlert(err)
      })
  }

  const getFeedList = useCallback(async () => {
    setIsLoading(true)
    await getFeedListApi(pageOption)
      .then((res) => {
        if (res.result) setFeedRows(res.data.items)
        else ErrorAlert(res)
      })
      .catch((err) => ErrorAlert(err))
    setIsLoading(false)
  }, [pageOption])

  useEffect(() => {
    getFeedList()
  }, [getFeedList])

  return (
    <Box>
      <PageBar title='รายการเหยื่อ' handleDialogOpen={handleDialogOpen} />
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={feedRows}
          columns={useColumns()}
          onPaginationModelChange={handlePageModelChange}
          onSortModelChange={handleSortModelChange}
          paginationModel={{
            pageSize: pageOption.pageSize,
            page: pageOption.page,
          }}
          rowCount={feedRows.length || 0}
          paginationMode='server'
          disableRowSelectionOnClick
          loading={isLoading}
          autoHeight
          // onRowDoubleClick={handleRowDblClick}
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
      </Box>
      <DialogAdd
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleFormSubmit}
      />
    </Box>
  )
}

export default Feed
