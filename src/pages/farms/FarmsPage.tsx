import React from 'react'
import {
  Grid,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'

const FarmsPage = () => {
  const farms = [
    {
      name: 'ฟาร์ม 1',
      route: '/farm/1',
      ponds: [{ name: 'บ่อ 1' }, { name: 'บ่อ 2' }],
    },
    {
      name: 'ฟาร์ม 2',
      route: '/farm/2',
      ponds: [{ name: 'บ่อ 1' }, { name: 'บ่อ 2' }],
    },
    {
      name: 'ฟาร์ม 3',
      route: '/farm/3',
      ponds: [{ name: 'บ่อ 1' }, { name: 'บ่อ 2' }],
    },
    {
      name: 'ฟาร์ม 4',
      route: '/farm/4',
      ponds: [{ name: 'บ่อ 1' }, { name: 'บ่อ 2' }],
    },
  ]

  const location = useLocation()
  const navigate = useNavigate()

  const handleListItemClick = (route: string) => {
    navigate(route)
  }

  return (
    <Grid container>
      <Grid item xs={12} md={4}>
        <Box
          sx={{
            width: '100%',
            p: 2,
            boxSizing: 'border-box',
            borderRight: '2px solid #A6ACAF',
            minHeight: 'calc(100vh - 120px)',
          }}
        >
          <Typography variant='h4' gutterBottom fontWeight='bold'>
            ฟาร์ม
          </Typography>
          <Divider />
          <List>
            {farms.map((farm, index) => (
              <ListItem
                key={index}
                onClick={() => handleListItemClick(farm.route)}
                sx={{
                  fontSize: '1.074rem',
                  p: 1.7,
                  pl: 2,
                  borderRadius: '0.543rem',
                  backgroundColor:
                    location.pathname === farm.route ? '#CEBCA1' : 'inherit',
                  color: location.pathname === farm.route ? 'white' : 'inherit',
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
                <ListItemText primary={farm.name} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Grid>
      <Grid item xs={12} md={8}>
        <Box
          sx={{
            width: '100%',
            p: 2,
            boxSizing: 'border-box',
            minHeight: 'calc(100vh - 120px)',
          }}
        >
          Right Side Content
        </Box>
      </Grid>
    </Grid>
  )
}

export default FarmsPage
