import React, { useState } from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Switch,
} from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import HomeIcon from '@mui/icons-material/Home'
import TableChartIcon from '@mui/icons-material/TableChart'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import PaymentsIcon from '@mui/icons-material/Payments'
import InsightsIcon from '@mui/icons-material/Insights'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import SidebarHeader from './SidebarHeader'
import { ACCESS_TOKEN_NAME } from '../constants/localStorageConstants'
import { useDispatch } from 'react-redux'
import { clearUser } from '../redux/reducers/user'

const Sidebar: React.FC = () => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const handleSubMenuToggle = () => {
    setIsSubMenuOpen(!isSubMenuOpen)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // Implement your dark mode logic here
  }

  const modeIcon = isDarkMode ? <DarkModeIcon /> : <LightModeIcon />

  const items = [
    { text: 'หน้าแรก', icon: <HomeIcon />, route: '/' },
    { text: 'ฟาร์มและบ่อปลา', icon: <TableChartIcon />, route: '/farms' },
    {
      text: 'กรอกข้อมูล',
      icon: <EditIcon />,
      route: '',
      subItems: [
        { text: 'เหยื่อรายวัน', route: '/dailyFeed' },
        { text: 'เติม/ย้าย/ขาย', route: '/activity' },
        { text: 'รายการเหยื่อ', route: '/feed' },
      ],
    },
    { text: 'ลูกน้อง', icon: <AssignmentIndIcon />, route: '/worker' },
    { text: 'ค่าใช้จ่าย', icon: <PaymentsIcon />, route: '/bill' },
    { text: 'สถิติ', icon: <InsightsIcon />, route: '/stats' },
  ]

  const secondaryItems = [
    { text: 'ตั้งค่า', icon: <SettingsIcon />, route: '/settings' },
    { text: 'ออกจากระบบ', icon: <LogoutIcon />, route: '/login' },
  ]

  return (
    <Drawer
      variant='permanent'
      anchor='left'
      sx={{
        width: '18.125rem',
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: '18.125rem',
          boxSizing: 'border-box',
          backgroundColor: '#FAF8EE',
        },
      }}
    >
      <SidebarHeader />
      <List
        sx={{
          maxHeight: '50vh',
          // maxHeight: 'calc(100vh - 64px)', // Assuming SidebarHeader is 64px tall
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {items.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem
              onClick={() => {
                if (item.text === 'กรอกข้อมูล') {
                  handleSubMenuToggle()
                } else {
                  navigate(item.route)
                }
              }}
              sx={{
                fontSize: '1.074rem',
                p: 1.7,
                pl: 2,
                borderRadius: '0.543rem',
                backgroundColor:
                  location.pathname === item.route ? '#CEBCA1' : 'inherit',
                color: location.pathname === item.route ? 'white' : 'inherit',
                '&:hover': {
                  fontWeight: 'bolder',
                  borderRadius: '0.543rem',
                  border: '2px solid #CEBCA1',
                },
                '&.Mui-selected': {
                  backgroundColor: '#d0d0d0',
                },
                textDecoration: 'none',
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.route ? 'white' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {item.text === 'กรอกข้อมูล' && (
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {isSubMenuOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemIcon>
              )}
            </ListItem>
            {item.text === 'กรอกข้อมูล' && (
              <Collapse in={isSubMenuOpen} timeout='auto' unmountOnExit>
                <List sx={{ pl: 4 }}>
                  {item.subItems?.map((subItem) => (
                    <ListItem
                      component={RouterLink}
                      to={subItem.route}
                      key={subItem.text}
                      sx={{
                        fontSize: '1.074rem',
                        p: 1.7,
                        borderRadius: '0.543rem',
                        backgroundColor:
                          location.pathname === subItem.route
                            ? '#CEBCA1'
                            : 'inherit',
                        color:
                          location.pathname === subItem.route
                            ? 'white'
                            : 'inherit',
                        '&:hover': {
                          fontWeight: 'bolder',
                          borderRadius: '0.543rem',
                          border: '2px solid #CEBCA1',
                        },
                        textDecoration: 'none',
                      }}
                    >
                      <ListItemText primary={subItem.text} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
      <List
        sx={{
          width: '100%',
          mt: 3,
          pb: 2,
          pt: 2.5,
          position: 'relative',
          '::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '12%',
            width: '76%',
            borderBottom: '2px solid #D1D3D3',
          },
        }}
      >
        {secondaryItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem
              onClick={() => {
                if (item.text === 'กรอกข้อมูล') {
                  handleSubMenuToggle()
                } else {
                  if (item.text === 'ออกจากระบบ') {
                    dispatch(clearUser())
                    localStorage.removeItem(ACCESS_TOKEN_NAME)
                  }
                  navigate(item.route)
                }
              }}
              sx={{
                fontSize: '1.074rem',
                p: 1.7,
                pl: 2,
                borderRadius: '0.543rem',
                backgroundColor:
                  location.pathname === item.route ? '#CEBCA1' : 'inherit',
                color: location.pathname === item.route ? 'white' : 'inherit',
                '&:hover': {
                  fontWeight: 'bolder',
                  borderRadius: '0.543rem',
                  border: '2px solid #CEBCA1',
                },
                '&.Mui-selected': {
                  backgroundColor: '#d0d0d0',
                },
                textDecoration: 'none',
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.route ? 'white' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
      <ListItem sx={{ mt: 12 }}>
        <ListItemIcon>{modeIcon}</ListItemIcon>
        <ListItemText primary={isDarkMode ? 'Dark Mode' : 'Light Mode'} />
        <Switch checked={isDarkMode} onChange={toggleDarkMode} />
      </ListItem>
    </Drawer>
  )
}

export default Sidebar
