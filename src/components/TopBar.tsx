import { FC, useState, MouseEvent } from 'react'
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
import {
  ACCESS_TOKEN_NAME,
  EXPIRED_DATE,
} from '../constants/localStorageConstants'
import { useDispatch, useSelector } from 'react-redux'
import { clearUser } from '../redux/reducers/user'
import { RootState } from '../redux/store'

const TopBar: FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notificationEl, setNotificationEl] = useState<null | HTMLElement>(null)
  const dataUser = useSelector((state: RootState) => state.user)
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New message received', path: '/' },
    { id: 2, message: 'Server downtime scheduled', path: '/setting' },
  ])
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleClickProfile = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleClickNotifications = (event: MouseEvent<HTMLElement>) => {
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
          {dataUser.user.firstName[0]}
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
            <Avatar>{dataUser.user.firstName[0]}</Avatar>
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
            onClick={() => handleMenuItemClick('/setting')}
          >
            <ListItemIcon>
              <Settings fontSize='small' />
            </ListItemIcon>
            ตั้งค่า
          </MenuItem>
          <MenuItem
            sx={{ padding: '8px 20px' }}
            onClick={() => {
              dispatch(clearUser())
              localStorage.removeItem(ACCESS_TOKEN_NAME)
              localStorage.removeItem(EXPIRED_DATE)
              handleMenuItemClick('/login')
            }}
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
