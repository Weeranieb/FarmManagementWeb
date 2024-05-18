// src/components/Layout.tsx
import React from 'react'
import { Box } from '@mui/material'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#D1D3D3' }}>
      <TopBar />
      <Sidebar />
      <Box
        component='main'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          p: 2.5,
          mt: 8,
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: 'white',
            width: '100%',
            borderRadius: 4,
            maxWidth: '1200px',
            margin: '0 auto',
            pt: 1.25,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
