import { FC } from 'react'
import { Box, Button, Typography } from '@mui/material'

interface DownloadFormProps {
  handleDialog: (type: 'year' | 'month') => void
}

const DownloadForm: FC<DownloadFormProps> = ({ handleDialog }) => {
  return (
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
        onClick={() => handleDialog('month')}
        sx={{
          height: '100%',
          minHeight: '40px',
          marginRight: '20px',
          minWidth: '100px',
        }}
      >
        <Typography variant='body1'>รายเดือน</Typography>
      </Button>
      <Button
        variant='contained'
        color='primary'
        onClick={() => handleDialog('year')}
        sx={{ height: '100%', minHeight: '40px', minWidth: '100px' }}
      >
        <Typography variant='body1'>รายปี</Typography>
      </Button>
    </Box>
  )
}

export default DownloadForm
