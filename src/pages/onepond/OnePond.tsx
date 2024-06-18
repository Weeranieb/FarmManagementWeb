import React from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import StatsTop from './StatsTop'
import StatsBottom from './StatsBottom'

const OnePond: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <Box>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        p={2}
      >
        <Typography
          variant='h4'
          component='h4'
          style={{ margin: 0, padding: '0 10px' }}
          gutterBottom
          fontWeight='bold'
        >
          บ่อ 1/2 (id: {id})
        </Typography>
      </Box>
      <StatsTop />
      <StatsBottom />
    </Box>
  )
}

export default OnePond
