// src/components/TopBar.tsx
import React from 'react'
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

const TopBar: React.FC = () => {
  return (
    <AppBar position='static'>
      <Toolbar>
        <IconButton edge='start' color='inherit' aria-label='menu'>
          <MenuIcon />
        </IconButton>
        <Typography variant='h6'>My App</Typography>
      </Toolbar>
    </AppBar>
  )
}

export default TopBar
