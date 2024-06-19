import React from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, Stack, Divider } from '@mui/material'
import StatsTop from './StatsTop'
import StatsBottom from './StatsBottom'
import ActiveButton from '../../components/ActiveButton'
import AllActivity from './AllActivity'

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
        <Stack direction='row' spacing={2} alignItems='center'>
          <Typography
            variant='h4'
            component='h4'
            style={{ margin: 0, padding: '0 10px' }}
            gutterBottom
            fontWeight='bold'
          >
            บ่อ 1/2 (id: {id})
          </Typography>
          <ActiveButton isActive={true} />
        </Stack>
      </Box>
      <Box>
        <StatsTop />
      </Box>
      <Divider
        sx={{
          margin: '12px 0',
          height: '4px',
          backgroundColor: 'rgba(0, 0, 0, 0.12)',
        }}
      />
      <Box>
        <StatsBottom />
      </Box>
      <Divider
        sx={{
          margin: '12px 0',
          height: '4px',
          backgroundColor: 'rgba(0, 0, 0, 0.12)',
        }}
      />
      <Box>
        <AllActivity />
      </Box>
    </Box>
  )
}

export default OnePond
