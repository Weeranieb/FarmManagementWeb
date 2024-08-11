import { FC } from 'react'
import { Box, Typography } from '@mui/material'
import SetMealIcon from '@mui/icons-material/SetMeal'

const SidebarHeader: FC = () => {
  return (
    <Box sx={{ pt: 2, pb: 3, textAlign: 'center', backgroundColor: '#FAF8EE' }}>
      <Box display='flex' alignItems='center' justifyContent='center'>
        <SetMealIcon sx={{ mr: 1, fontSize: '2rem' }} />{' '}
        <Typography
          variant='h6'
          component='div'
          sx={{ fontFamily: 'Anton, sans-serif', fontSize: '2rem' }}
        >
          Boonma Farm
        </Typography>
      </Box>
    </Box>
  )
}

export default SidebarHeader
