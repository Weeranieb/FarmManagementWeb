// src/components/Layout.tsx
import React from 'react'
import { Box, CssBaseline } from '@mui/material'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#D1D3D3' }}>
      <CssBaseline />
      <TopBar />
      <Sidebar />
      <Box component='main' sx={{ flexGrow: 1, p: 3, mt: 8, overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  )
}

export default Layout
