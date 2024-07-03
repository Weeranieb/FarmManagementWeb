import React, { useEffect, useState } from 'react'
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
import { useNavigate } from 'react-router-dom'
import { getFarmListApi } from '../../services/farm.service'
import { FarmWithActive } from '../../models/schema/activePond'
import { Farm } from '../../models/schema/farm'
import { getFarmWithActiveApi } from '../../services/activePond.service'

const FarmsPage = () => {
  const [farms, setFarms] = useState<Farm[]>([])
  const [activePonds, setActivePonds] = useState<FarmWithActive[]>([])
  const [selectedFarm, setSelectedFarm] = useState<number | null>(null)
  const [selectedPond, setSelectedPond] = useState<number | null>(null)
  const navigate = useNavigate()

  const getListFarms = async () => {
    const farmList = await getFarmListApi()
    console.log('farm list', farmList.data)
    setFarms(farmList.data)
  }

  const getActivePond = async (farmId: number) => {
    console.log('farm id', farmId)
    const activePondList = await getFarmWithActiveApi(farmId)
    console.log('active pond list', activePondList.data)
    setActivePonds(activePondList.data)
  }

  useEffect(() => {
    getListFarms()
  }, [])

  useEffect(() => {
    if (selectedFarm !== null) {
      getActivePond(selectedFarm)
    }
  }, [selectedFarm])

  const handleFarmClick = (farmId: number) => {
    setSelectedFarm(farmId)
    setSelectedPond(null)
  }

  const handlePondClick = (
    pondId: number,
    hasHistory: boolean,
    activePondId?: number
  ) => {
    if (!hasHistory) {
      navigate(`/pond/${pondId}`)
      return
    }
    // navigate(`/pond/${activePondId}`)
    setSelectedPond(pondId)
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
            {farms.map((farm) => (
              <ListItem
                key={farm.id}
                onClick={() => handleFarmClick(farm.id)}
                sx={{
                  fontSize: '1.074rem',
                  p: 1.7,
                  pl: 2,
                  borderRadius: '0.543rem',
                  backgroundColor:
                    selectedFarm === farm.id ? '#FAF8EE' : 'inherit',
                  borderRight:
                    selectedFarm === farm.id ? '10px solid #CEBCA1' : 'inherit',
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
                      fontSize: selectedFarm === farm.id ? '1.2rem' : 'inherit',
                      fontWeight:
                        selectedFarm === farm.id ? 'bolder' : 'inherit',
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
              activePonds.map((pond, pondIndex) => (
                <Button
                  key={pond.id}
                  variant='outlined'
                  onClick={() =>
                    handlePondClick(
                      pond.id,
                      pond.hasHistory,
                      pond.activePondId as number | undefined
                    )
                  }
                  sx={{
                    fontSize: '1.074rem',
                    borderRadius: '50px',
                    border: '3px solid #CEBCA1',
                    margin: '8px',
                    minWidth: 'calc((100% - 60px) / 3)',
                    minHeight: '50px',
                    backgroundColor:
                      selectedPond === pond.id ? '#CEBCA1' : 'white',
                    color: selectedPond === pond.id ? 'white' : 'inherit',
                    fontWeight: selectedPond === pond.id ? 'bolder' : 'normal',
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
