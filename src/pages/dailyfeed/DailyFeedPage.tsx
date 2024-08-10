import React, { useState } from 'react'
import { Box, Typography, Grid, Divider } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import Search from './Search'
import DownloadForm from './DownloadForm'
import Upload from './Upload'
import DialogDownloadForm from './DialogDownloadForm'
import DialogTable from './DialogTable'
import {
  DownloadExcelProps,
  SearchDailyFeedProps,
} from '../../models/schema/dailyFeed'
import { downloadExcelForm } from '../../services/dailyFeed.service'

const DailyFeed: React.FC = () => {
  const [searchFormData, setSearchFormData] = useState<SearchDailyFeedProps>({
    date: dayjs().format('YYYY-MM-DD'),
    farmId: 0,
    feedId: 0,
  })

  const [downloadFormData, setDownloadFormData] = useState<DownloadExcelProps>({
    date: dayjs().format('YYYY-MM-DD'),
    farmId: 0,
    type: '',
    feedId: 0,
  })
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogOpenDownloadForm, setDialogOpenDownloadForm] = useState(false)

  const handleDialogDownloadFormClose = () => {
    setDialogOpenDownloadForm(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSearchFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleDateChange = (date: Dayjs | null) => {
    const formattedDate = date ? date.format('YYYY-MM-DD') : ''
    setSearchFormData((prevData) => ({
      ...prevData,
      date: formattedDate,
    }))
  }

  const handleFormSubmitDownloadForm = async (data: DownloadExcelProps) => {
    try {
      const fileBlob = await downloadExcelForm(data)

      // Create a link to download the file
      const url = window.URL.createObjectURL(fileBlob)
      const link = document.createElement('a')
      link.href = url

      // Set the download attribute to suggest a filename
      let filename = ''
      if (data.type === 'year') {
        filename = `ฟอร์มรายปี_${data.date.slice(0, 4)}_ไอดี_${
          data.feedId
        }.xlsx`
      } else if (data.type === 'month') {
        filename = `ฟอร์มรายเดือน_${data.date.slice(0, 7)}_ไอดี_${
          data.feedId
        }.xlsx`
      }
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()

      // Cleanup the URL and remove the link
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download the file:', error)
    }
  }

  const handleFormSubmitTable = () => {
    // setOpenDialog(true)
    console.log(searchFormData)
  }

  const handleOpenDialogTable = () => {
    setOpenDialog(true)
    console.log(searchFormData)
  }

  const handleOpenDialogDownloadForm = (type: 'year' | 'month') => {
    setDownloadFormData((prevData) => ({
      ...prevData,
      type,
    }))
    setDialogOpenDownloadForm(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        padding: 3,
        borderRadius: 1,
        boxShadow: 3,
        textAlign: 'center',
        pt: 5,
        pb: 5,
        maxWidth: '100%',
      }}
    >
      <Typography variant='h4' gutterBottom>
        เหยื่อปลารายวัน
      </Typography>

      {/* Filters Section */}
      <Search
        searchFormData={searchFormData}
        handleInputChange={handleInputChange}
        handleDateChange={handleDateChange}
        handleDialogSearch={handleOpenDialogTable}
      />

      {/* Divider and Text Section */}
      <Grid
        container
        alignItems='center'
        justifyContent='center'
        width={'50%'}
        sx={{ margin: '20px auto' }}
      >
        <Grid item xs={5} sx={{ paddingRight: '16px' }}>
          <Divider />
        </Grid>
        <Grid item xs={2}>
          <Typography
            variant='body1'
            sx={{ textAlign: 'center', color: 'grey.500', mt: 1 }}
          >
            อัปโหลด
          </Typography>
        </Grid>
        <Grid item xs={5} sx={{ paddingLeft: '16px' }}>
          <Divider />
        </Grid>
      </Grid>

      {/* Text and Buttons Section */}
      <DownloadForm handleDialog={handleOpenDialogDownloadForm} />

      {/* Dropzone Section */}
      <Upload />

      {/* Dialog for Search Result */}
      <DialogTable
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleFormSubmitTable}
        searchData={searchFormData}
      />

      {/* Dialog for Download Form Result */}
      <DialogDownloadForm
        open={dialogOpenDownloadForm}
        onClose={handleDialogDownloadFormClose}
        onSubmit={handleFormSubmitDownloadForm}
        type={downloadFormData.type}
      />
    </Box>
  )
}

export default DailyFeed
