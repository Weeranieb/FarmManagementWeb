import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  MenuItem,
  Grid,
  Divider,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Dayjs } from 'dayjs'
import { useDropzone } from 'react-dropzone'

const HomePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [selectedFarm, setSelectedFarm] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const farms = ['Farm 1', 'Farm 2', 'Farm 3'] // Example farm names

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  })

  const handleSearch = () => {
    setOpenDialog(true)
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
        ยินดีต้อนรับสู่บุญมาฟาร์ม
      </Typography>

      <Grid container spacing={4} justifyContent='center'>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box
            sx={{
              backgroundColor: '#f9f9f9',
              padding: 3,
              borderRadius: 1,
              boxShadow: 1,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              border: '2px dashed #2196F3',
              cursor: 'pointer',
              transition: 'border .3s ease-in-out',
              '&:hover': {
                border: '2px dashed #0D47A1',
              },
            }}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <Typography variant='body1' color='primary'>
                Drop the files here ...
              </Typography>
            ) : (
              <Typography variant='body1'>
                Drag 'n' drop some files here, or click to select files
              </Typography>
            )}
            {file && (
              <Typography variant='body2' sx={{ marginTop: 2 }}>
                {file.name}
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box
            sx={{
              backgroundColor: '#f9f9f9',
              padding: 3,
              borderRadius: 1,
              boxShadow: 1,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
            }}
          >
            <Typography variant='h6' gutterBottom>
              Search
            </Typography>
            <Box sx={{ mb: 2, width: '100%' }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label='Select Date'
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ mb: 2, width: '100%' }}>
              <TextField
                select
                label='Select Farm'
                value={selectedFarm}
                onChange={(e) => setSelectedFarm(e.target.value)}
                fullWidth
              >
                {farms.map((farm) => (
                  <MenuItem key={farm} value={farm}>
                    {farm}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Button
              variant='contained'
              color='primary'
              onClick={handleSearch}
              fullWidth
            >
              Search
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Search Result</DialogTitle>
        <DialogContent>
          <DialogContentText>Display search results here.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default HomePage
