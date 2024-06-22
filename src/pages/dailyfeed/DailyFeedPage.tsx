import React, { useState } from 'react'
import { Box, Typography, Grid, Divider } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import Search from './Search'
import DownloadForm from './DownloadForm'
import Upload from './Upload'
import DialogDownloadForm from './DialogDownloadForm'
import DialogTable from './DialogTable'

export interface SearchDailyFeedProps {
  date: string
  farm: string
  type: string
}

export interface DownloadFormInput {
  date: string
  farm: string
  type: string
  downloadType: 'year' | 'month' | ''
}
const DailyFeed: React.FC = () => {
  const [formData, setFormData] = useState<SearchDailyFeedProps>({
    date: dayjs().format('YYYY-MM-DD'),
    farm: '',
    type: '',
  })

  const [downloadFormData, setDownloadFormData] = useState<DownloadFormInput>({
    date: dayjs().format('YYYY-MM-DD'),
    farm: '',
    type: '',
    downloadType: '',
  })
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogOpenDownloadForm, setDialogOpenDownloadForm] = useState(false)

  const handleDialogDownloadFormClose = () => {
    setDialogOpenDownloadForm(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleDateChange = (date: Dayjs | null) => {
    const formattedDate = date ? date.format('YYYY-MM-DD') : ''
    setFormData((prevData) => ({
      ...prevData,
      date: formattedDate,
    }))
  }

  const handleFormSubmitDownloadForm = (data: DownloadFormInput) => {
    console.log(data)
  }

  const handleFormSubmitTable = () => {
    // setOpenDialog(true)
    console.log(formData)
  }

  const handleOpenDialogTable = () => {
    setOpenDialog(true)
  }

  const handleOpenDialogDownloadForm = (downloadType: 'year' | 'month') => {
    setDownloadFormData((prevData) => ({
      ...prevData,
      downloadType,
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
        searchFormData={formData}
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
        <Grid item xs={5}>
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
        <Grid item xs={5}>
          <Divider />
        </Grid>
      </Grid>

      {/* Text and Buttons Section */}
      <DownloadForm handleDialog={handleOpenDialogDownloadForm} />

      {/* Dropzone Section */}
      <Upload />

      {/* Dialog for Search Result */}
      {/* <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Search Result</DialogTitle>
        <DialogContent>
          <DialogContentText>Display search results here.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog> */}
      <DialogTable
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleFormSubmitTable}
      />

      {/* Dialog for Download Form Result */}
      <DialogDownloadForm
        open={dialogOpenDownloadForm}
        onClose={handleDialogDownloadFormClose}
        onSubmit={handleFormSubmitDownloadForm}
        downloadType={downloadFormData.downloadType}
      />
    </Box>
  )
}

export default DailyFeed
