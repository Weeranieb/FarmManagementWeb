import React, { useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { getClientApi } from '../../services/client.service'

const HomePage: React.FC = () => {
  const [farmName, setFarmName] = React.useState('')

  const getFarmName = async () => {
    const data = await getClientApi()
    if (data.result) {
      setFarmName(data.data.name)
    } else {
      console.warn('Farm name not found in API response')
    }
  }

  useEffect(() => {
    getFarmName()
  }, [])

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        padding: 3,
        borderRadius: 1,
        pt: 30,
        textAlign: 'center',
      }}
    >
      <Typography
        variant='h2'
        gutterBottom
        sx={{
          fontWeight: 'bold',
          marginBottom: 2,
          position: 'relative',
          '::after': {
            content: '""',
            display: 'block',
            width: '70%',
            height: '4px',
            backgroundColor: '#d0d0d0',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: '-30px',
          },
        }}
      >
        ยินดีต้อนรับสู่{farmName}
      </Typography>
    </Box>
  )
}

export default HomePage
