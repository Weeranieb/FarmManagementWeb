import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  Popover,
  Paper,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { Logout, PersonAdd, Settings } from '@mui/icons-material'

const TopBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notificationEl, setNotificationEl] = useState<null | HTMLElement>(null)
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New message received', path: '/' },
    { id: 2, message: 'Server downtime scheduled', path: '/settings' },
  ])
  const navigate = useNavigate()

  const handleClickProfile = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleClickNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationEl(event.currentTarget)
  }

  const handleNotificationClose = () => {
    setNotificationEl(null)
  }

  const handleMenuItemClick = (route: string) => {
    navigate(route)
    handleClose()
  }

  const hasNotifications = notifications.length > 0

  return (
    <AppBar position='fixed' sx={{ backgroundColor: 'white' }}>
      <Toolbar>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }} />
        <IconButton
          size='large'
          edge='end'
          aria-label='notifications'
          onClick={handleClickNotifications}
          sx={{ mr: 2 }}
        >
          <Badge color='error' variant={hasNotifications ? 'dot' : 'standard'}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Avatar
          sx={{ width: 32, height: 32, cursor: 'pointer' }}
          onClick={handleClickProfile}
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
            <Avatar>U</Avatar>
            โปรไฟล์
          </MenuItem>
          <MenuItem
            sx={{ padding: '8px 20px' }}
            onClick={() => handleMenuItemClick('/addUser')}
          >
            <ListItemIcon>
              <PersonAdd fontSize='small' />
            </ListItemIcon>
            เพิ่มผู้ใช้งาน
          </MenuItem>
          <Divider />
          <MenuItem
            sx={{ padding: '8px 20px' }}
            onClick={() => handleMenuItemClick('/settings')}
          >
            <ListItemIcon>
              <Settings fontSize='small' />
            </ListItemIcon>
            ตั้งค่า
          </MenuItem>
          <MenuItem
            sx={{ padding: '8px 20px' }}
            onClick={() => handleMenuItemClick('/login')}
          >
            <ListItemIcon>
              <Logout fontSize='small' />
            </ListItemIcon>
            ออกจากระบบ
          </MenuItem>
        </Menu>
        <Popover
          open={Boolean(notificationEl)}
          anchorEl={notificationEl}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Paper>
            <List>
              {hasNotifications ? (
                notifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        cursor: 'pointer',
                      },
                    }}
                    onClick={() => {
                      navigate(notification.path)
                      handleNotificationClose()
                    }}
                  >
                    <ListItemText primary={notification.message} />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary='No notifications' />
                </ListItem>
              )}
            </List>
          </Paper>
        </Popover>
      </Toolbar>
    </AppBar>
  )
}

export default TopBar
