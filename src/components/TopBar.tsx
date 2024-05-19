import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import NotificationsIcon from '@mui/icons-material/Notifications'

const TopBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMenuItemClick = (route: string) => {
    navigate(route)
    handleClose()
  }

  return (
    <AppBar position='fixed' sx={{ backgroundColor: 'white' }}>
      <Toolbar>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }} />
        <IconButton
          size='large'
          edge='end'
          aria-label='notifications'
          sx={{ mr: 2 }}
        >
          <NotificationsIcon />
        </IconButton>
        <Avatar
          sx={{ width: 32, height: 32, cursor: 'pointer' }}
          onClick={handleClick}
        >
          U
        </Avatar>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            sx={{ padding: '8px 20px' }}
            onClick={() => handleMenuItemClick('/profile')}
          >
            Profile
          </MenuItem>
          <MenuItem
            sx={{ padding: '8px 20px' }}
            onClick={() => handleMenuItemClick('/settings')}
          >
            Settings
          </MenuItem>
          <MenuItem
            sx={{ padding: '8px 20px' }}
            onClick={() => handleMenuItemClick('/logout')}
          >
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default TopBar
