import { Box, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'

const Upload = () => {
  const [file, setFile] = useState<File | null>(null)

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
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
          file: {file.name}
        </Typography>
      )}
    </Box>
  )
}

export default Upload
