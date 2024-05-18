// src/components/TopBar.tsx
import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Avatar } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import MenuIcon from '@mui/icons-material/Menu'

const TopBar: React.FC = () => {
  return (
    <AppBar position='fixed' sx={{ backgroundColor: 'white' }}>
      <Toolbar>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          My App
        </Typography>
        <IconButton
          size='large'
          edge='end'
          aria-label='notifications'
          sx={{ mr: 2 }}
        >
          <NotificationsIcon />
        </IconButton>
        <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>{' '}
        {/* Replace 'U' with user's initials or avatar image */}
      </Toolbar>
    </AppBar>
  )
}

export default TopBar
