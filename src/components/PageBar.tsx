import React from 'react'
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

interface PageBarProps {
  title: string
  handleDialogOpen: () => void
}

const PageBar: React.FC<PageBarProps> = ({ title, handleDialogOpen }) => {
  return (
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
          {title}
        </Typography>
      </Box>
      <Box display='flex' alignItems='center' sx={{ pb: 4 }}>
        <Box display='flex' alignItems='center' sx={{ marginRight: 1 }}>
          <TextField
            variant='outlined'
            size='small'
            placeholder='ค้นหา'
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
          onClick={handleDialogOpen}
          sx={{
            backgroundColor: '#CEBCA1',
            color: '#4B4B4C',
            fontSize: '1.03rem',
            padding: '4px 20px',
          }}
        >
          เพิ่ม
        </Button>
      </Box>
    </Box>
  )
}

export default PageBar
