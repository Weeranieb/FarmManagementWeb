// src/components/Sidebar.tsx
import React from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import InboxIcon from '@mui/icons-material/Inbox'
import MailIcon from '@mui/icons-material/Mail'
import { Link as RouterLink } from 'react-router-dom'
import SidebarHeader from './SidebarHeader'

const Sidebar: React.FC = () => {
  const items = [
    { text: 'Inbox', icon: <InboxIcon />, route: '/inbox' },
    { text: 'Starred', icon: <MailIcon />, route: '/starred' },
    { text: 'Send email', icon: <InboxIcon />, route: '/send-email' },
    { text: 'Drafts', icon: <MailIcon />, route: '/drafts' },
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
          <ListItem
            key={item.text}
            component={RouterLink}
            to={item.route}
            sx={{
              fontSize: '1.074rem', // Font size
              '&:hover': {
                backgroundColor: '#CEBCA1', // Hover effect color
                fontWeight: 'bolder', // Text thickness on hover
                color: 'white',
                borderRadius: '0.543rem',
              },
              '&.Mui-selected': {
                backgroundColor: '#d0d0d0', // Selected item color
              },
              textDecoration: 'none', // Remove default link styling
              color: 'inherit', // Inherit text color from parent
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText
              primaryTypographyProps={{
                fontSize: 'inherit',
                fontWeight: 'inherit',
              }}
              primary={item.text}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  )
}

export default Sidebar
