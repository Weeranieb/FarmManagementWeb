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
        เหยื่อปลารายวัน
      </Typography>

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
          <Typography variant='h5'>Drop the files here ...</Typography>
        ) : (
          <>
            <img
              src={process.env.PUBLIC_URL + '/icons/cloud-upload.png'}
              alt='Cloud Upload'
              style={{ width: '100px', marginBottom: '10px' }}
            />
            <Typography variant='h6'>
              Select a file or a drag and drop here
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
