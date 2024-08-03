import React, { useState } from 'react'
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material'
import { useDropzone } from 'react-dropzone'
import { uploadExcelForm } from '../../services/dailyFeed.service'
import ErrorAlert from '../../components/ErrorAlert'
import SuccessAlert from '../../components/SuccessAlert'

const Upload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
    setUploadSuccess(null)
    setUploadError(null)
    handleUpload(acceptedFiles[0])
  }

  // Upload the selected file
  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      await uploadExcelForm(formData).then((res) => {
        if (res.result) {
          SuccessAlert()
          window.location.reload()
          setUploadSuccess(true)
          setUploadError(null)
        } else {
          ErrorAlert(res)
          setUploadSuccess(null)
          setUploadError(res.error?.message || '')
        }
      })
    } catch (error) {
      setUploadSuccess(false)
      setUploadError('Failed to upload file. Please try again.')
      ErrorAlert(uploadError)
    } finally {
      setUploading(false)
    }
  }

  // Use Dropzone for drag-and-drop functionality
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
    maxSize: 10 * 1024 * 1024, // 10 MB
  })

  return (
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
          File: {file.name}
        </Typography>
      )}

      {/* Display a loading indicator when uploading */}
      {uploading && <CircularProgress sx={{ marginTop: 2 }} />}

      {/* Display success or error messages */}
      {uploadSuccess && (
        <Alert severity='success' sx={{ marginTop: 2 }}>
          File uploaded successfully!
        </Alert>
      )}
      {uploadError && (
        <Alert severity='error' sx={{ marginTop: 2 }}>
          {uploadError}
        </Alert>
      )}

      {/* Upload button for manual upload trigger */}
      {!uploading && file && (
        <Button
          variant='contained'
          color='primary'
          onClick={() => handleUpload(file)}
          sx={{ marginTop: 2 }}
        >
          Upload
        </Button>
      )}
    </Box>
  )
}

export default Upload
