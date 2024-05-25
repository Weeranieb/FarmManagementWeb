import React, { useState } from 'react'
import {
  Grid,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'

const FarmsPage = () => {
  const farms = [
    {
      name: 'ฟาร์ม 1',
      ponds: [
        { name: 'บ่อ 1', id: 1 },
        { name: 'บ่อ 2', id: 2 },
        { name: 'บ่อ 3', id: 3 },
        { name: 'บ่อ 4', id: 4 },
        { name: 'บ่อ 5', id: 5 },
        { name: 'บ่อ 6', id: 6 },
        { name: 'บ่อ 7', id: 7 },
        { name: 'บ่อ 8', id: 8 },
        { name: 'บ่อ 9', id: 9 },
        { name: 'บ่อ 10', id: 10 },
      ],
    },
    {
      name: 'ฟาร์ม 2',
      ponds: [
        { name: 'บ่อ 1', id: 1 },
        { name: 'บ่อ 2', id: 2 },
      ],
    },
    {
      name: 'ฟาร์ม 3',
      ponds: [
        { name: 'บ่อ 1', id: 1 },
        { name: 'บ่อ 2', id: 2 },
      ],
    },
    {
      name: 'ฟาร์ม 4',
      ponds: [
        { name: 'บ่อ 1', id: 1 },
        { name: 'บ่อ 2', id: 2 },
      ],
    },
  ]

  const navigate = useNavigate()
  const [selectedFarm, setSelectedFarm] = useState<number | null>(null)
  const [selectedPond, setSelectedPond] = useState<number | null>(null)

  const handleFarmClick = (index: number) => {
    setSelectedFarm(index)
    setSelectedPond(null)
  }

  const handlePondClick = (pondIndex: number, activePondId: number) => {
    navigate(`/pond/${activePondId}`)
    setSelectedPond(pondIndex)
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
          <Divider sx={{ borderBottomWidth: 2, mb: 2, color: '#D9D9D9' }} />
          <List>
            {farms.map((farm, farmIndex) => (
              <ListItem
                key={farmIndex}
                onClick={() => handleFarmClick(farmIndex)}
                sx={{
                  fontSize: '1.074rem',
                  p: 1.7,
                  pl: 2,
                  borderRadius: '0.543rem',
                  backgroundColor:
                    selectedFarm === farmIndex ? '#FAF8EE' : 'inherit',
                  borderRight:
                    selectedFarm === farmIndex
                      ? '10px solid #CEBCA1'
                      : 'inherit',
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
                <ListItemText
                  primary={farm.name}
                  primaryTypographyProps={{
                    style: {
                      fontSize:
                        selectedFarm === farmIndex ? '1.2rem' : 'inherit',
                      fontWeight:
                        selectedFarm === farmIndex ? 'bolder' : 'inherit',
                    },
                  }}
                />
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
          <Typography variant='h4' gutterBottom fontWeight='bold'>
            บ่อ
          </Typography>
          <Box
            display='flex'
            flexWrap='wrap'
            justifyContent='center'
            sx={{
              width: '100%',
            }}
          >
            {selectedFarm !== null &&
              farms[selectedFarm].ponds.map((pond, pondIndex) => (
                <Button
                  key={pondIndex}
                  variant='outlined'
                  onClick={() => handlePondClick(pondIndex, pond.id)}
                  sx={{
                    borderRadius: '50px',
                    border: '3px solid #CEBCA1',
                    margin: '8px',
                    minWidth: 'calc((100% - 60px) / 3)',
                    minHeight: '50px',
                    backgroundColor:
                      selectedPond === pondIndex ? '#CEBCA1' : 'white',
                    color: selectedPond === pondIndex ? 'white' : 'inherit',
                    fontWeight:
                      selectedPond === pondIndex ? 'bolder' : 'normal',
                    '&:hover': {
                      fontWeight: 'bolder',
                      backgroundColor: '#CEBCA1',
                      color: 'white',
                    },
                  }}
                >
                  {pond.name}
                </Button>
              ))}
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}

export default FarmsPage
