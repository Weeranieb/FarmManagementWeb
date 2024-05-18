// src/components/SidebarHeader.tsx
import React from 'react'
import { Box, Typography } from '@mui/material'

const SidebarHeader: React.FC = () => {
  return (
    <Box sx={{ pt: 2, pb: 3, textAlign: 'center', backgroundColor: '#FAF8EE' }}>
      <Typography
        variant='h6'
        component='div'
        sx={{ fontFamily: 'Anton, sans-serif', fontSize: '2rem' }}
      >
        Boonma Farm
      </Typography>
    </Box>
  )
}

export default SidebarHeader
