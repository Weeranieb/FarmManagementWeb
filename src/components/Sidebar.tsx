import React, { useState } from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import HomeIcon from '@mui/icons-material/Home'
import TableChartIcon from '@mui/icons-material/TableChart'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import PaymentsIcon from '@mui/icons-material/Payments'
import InsightsIcon from '@mui/icons-material/Insights'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import SidebarHeader from './SidebarHeader'

const Sidebar: React.FC = () => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSubMenuToggle = () => {
    setIsSubMenuOpen(!isSubMenuOpen)
  }

  const items = [
    { text: 'หน้าแรก', icon: <HomeIcon />, route: '/' },
    { text: 'ฟาร์มและบ่อปลา', icon: <TableChartIcon />, route: '/farm' },
    {
      text: 'กรอกข้อมูล',
      icon: <InsightsIcon />,
      route: '', // No route for the button itself
      subItems: [
        { text: 'a', route: '/a' },
        { text: 'b', route: '/b' },
        { text: 'c', route: '/c' },
      ],
    },
    { text: 'ลูกน้อง', icon: <AssignmentIndIcon />, route: '/worker' },
    { text: 'ค่าใช้จ่าย', icon: <PaymentsIcon />, route: '/bill' },
    { text: 'สถิติ', icon: <InsightsIcon />, route: '/stats' },
  ]

  return (
    <Drawer
      variant='permanent'
      anchor='left'
      sx={{
        width: 290,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 290,
          boxSizing: 'border-box',
          backgroundColor: '#FAF8EE',
        },
      }}
    >
      <SidebarHeader />
      <List>
        {items.map((item, index) => (
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
                '&:hover': {
                  backgroundColor: '#CEBCA1',
                  fontWeight: 'bolder',
                  color: 'white',
                  borderRadius: '0.543rem',
                },
                '&.Mui-selected': {
                  backgroundColor: '#d0d0d0',
                },
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {item.text === 'กรอกข้อมูล' && (
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {isSubMenuOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemIcon>
              )}
            </ListItem>
            {item.text === 'กรอกข้อมูล' && isSubMenuOpen && (
              <List sx={{ pl: 2 }}>
                <ListItem
                  component={RouterLink}
                  to='/a'
                  sx={{
                    fontSize: '1.074rem',
                    p: 1.7,
                    '&:hover': {
                      backgroundColor: '#CEBCA1',
                      fontWeight: 'bolder',
                      color: 'white',
                      borderRadius: '0.543rem',
                    },
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <ListItemText primary='a' />
                </ListItem>
                <ListItem
                  component={RouterLink}
                  to='/b'
                  sx={{
                    fontSize: '1.074rem',
                    p: 1.7,
                    '&:hover': {
                      backgroundColor: '#CEBCA1',
                      fontWeight: 'bolder',
                      color: 'white',
                      borderRadius: '0.543rem',
                    },
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <ListItemText primary='b' />
                </ListItem>
                <ListItem
                  component={RouterLink}
                  to='/c'
                  sx={{
                    fontSize: '1.074rem',
                    p: 1.7,
                    '&:hover': {
                      backgroundColor: '#CEBCA1',
                      fontWeight: 'bolder',
                      color: 'white',
                      borderRadius: '0.543rem',
                    },
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <ListItemText primary='c' />
                </ListItem>
              </List>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  )
}

export default Sidebar
