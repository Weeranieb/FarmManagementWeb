// src/pages/HomePage.tsx
import React from 'react'
import { Box, Typography } from '@mui/material'

const HomePage: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: 'white',
        padding: 3,
        borderRadius: 1,
        // boxShadow: 1,
      }}
    >
      <Typography variant='h4' gutterBottom>
        Welcome to the Home Page
      </Typography>
      <Typography variant='body1'>
        This is the main content area. You can add more content and components
        here.
      </Typography>
    </Box>
  )
}

export default HomePage
