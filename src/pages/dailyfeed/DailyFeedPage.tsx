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
import { Dayjs } from 'dayjs'
import { useDropzone } from 'react-dropzone'
import DateSelect from '../../components/DateSelect'

const DailyFeed: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [selectedFarm, setSelectedFarm] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
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
        เหยื่อปลารายวัน
      </Typography>

      {/* Filters Section */}
      <Box display='flex' alignItems='center' justifyContent='center' p={2}>
        <TextField
          label='ประเภท'
          variant='outlined'
          size='medium'
          sx={{ width: 150, mr: 3 }}
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          select
        >
          <MenuItem value=''>ทั้งหมด</MenuItem>
          <MenuItem value='เหยื่อสด'>เหยื่อสด</MenuItem>
          <MenuItem value='อาหารเม็ด'>อาหารเม็ด</MenuItem>
        </TextField>

        <TextField
          label='ฟาร์ม'
          variant='outlined'
          size='medium'
          sx={{ width: 150, mr: 3 }}
          value={selectedFarm}
          onChange={(e) => setSelectedFarm(e.target.value)}
          select
        >
          <MenuItem value=''>ทั้งหมด</MenuItem>
          {farms.map((farm, index) => (
            <MenuItem key={index} value={farm}>
              {farm}
            </MenuItem>
          ))}
        </TextField>

        <DateSelect
          label='วันที่ทำ'
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          sx={{ width: '180px' }}
        />

        <Button
          variant='contained'
          color='primary'
          onClick={handleSearch}
          sx={{ height: '100%', ml: 2, minHeight: '40px' }}
        >
          Search
        </Button>
      </Box>

      {/* Divider and Text Section */}
      <Grid
        container
        alignItems='center'
        justifyContent='center'
        width={'50%'}
        sx={{ margin: '20px auto' }} // Center the grid horizontally
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '40px',
          marginTop: '40px',
        }}
      >
        <Typography
          variant='body1'
          sx={{ textAlign: 'center', marginRight: '10px' }}
        >
          ดาวน์โหลดฟอร์ม:
        </Typography>
        <Button
          variant='contained'
          color='primary'
          onClick={handleSearch}
          sx={{ height: '100%', minHeight: '40px', marginRight: '20px' }}
        >
          <Typography variant='body1'>รายเดือน</Typography>
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={handleSearch}
          sx={{ height: '100%', minHeight: '40px' }}
        >
          <Typography variant='body1'>รายปี</Typography>
        </Button>
      </Box>

      {/* Dropzone Section */}
      <Box
        sx={{
          backgroundColor: '#fff',
          padding: 3,
          borderRadius: 5,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          border: '2px dashed #ccc',
          cursor: 'pointer',
          transition: 'border .3s ease-in-out',
          width: '60%',
          margin: '0 auto',
          marginBottom: '20px',
          '&:hover': {
            border: '2px dashed #2196F3',
          },
        }}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <Typography variant='h5'>Drop the files here ...</Typography>
        ) : (
          <>
            <img
              src={process.env.PUBLIC_URL + '/icons/cloud-upload.png'}
              alt='Cloud Upload'
              style={{ width: '100px', marginBottom: '10px' }}
            />
            <Typography variant='h6'>
              Select a file or drag and drop here
            </Typography>
            <Typography variant='body2' sx={{ color: 'grey.500' }}>
              .xlsx, file size no more than 10 MB
            </Typography>
          </>
        )}
        {file && (
          <Typography variant='body1' sx={{ marginTop: 2 }}>
            file: {file.name}
          </Typography>
        )}
      </Box>

      {/* Dialog for Search Result */}
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

export default DailyFeed
