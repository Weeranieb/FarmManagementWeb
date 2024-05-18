// src/components/Layout.tsx
import React from 'react'
import { Box, CssBaseline } from '@mui/material'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <TopBar />
      <Sidebar />
      <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  )
}

export default Layout
