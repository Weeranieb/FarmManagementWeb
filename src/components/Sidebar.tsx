import React, { useState } from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import HomeIcon from '@mui/icons-material/Home'
import TableChartIcon from '@mui/icons-material/TableChart'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import PaymentsIcon from '@mui/icons-material/Payments'
import InsightsIcon from '@mui/icons-material/Insights'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import SidebarHeader from './SidebarHeader'

const Sidebar: React.FC = () => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubMenuToggle = () => {
    setIsSubMenuOpen(!isSubMenuOpen)
  }

  const items = [
    { text: 'หน้าแรก', icon: <HomeIcon />, route: '/' },
    { text: 'ฟาร์มและบ่อปลา', icon: <TableChartIcon />, route: '/farm' },
    {
      text: 'กรอกข้อมูล',
      icon: <InsightsIcon />,
      route: '',
      subItems: [
        { text: 'เหยื่อรายวัน', route: '/dailyFeed' },
        { text: 'เติม/ย้าย/ขาย', route: '/activity' },
        { text: 'รายการเหยื่อ', route: '/feedCollection' },
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
      <List>
        {items.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem
              button
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
                  backgroundColor: '#CEBCA1',
                  fontWeight: 'bolder',
                  color: 'white',
                  borderRadius: '0.543rem',
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
                          backgroundColor: '#CEBCA1',
                          fontWeight: 'bolder',
                          color: 'white',
                          borderRadius: '0.543rem',
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
    </Drawer>
  )
}

export default Sidebar
