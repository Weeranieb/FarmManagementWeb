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
        // boxShadow: 3, // Adding shadow to make the box more attractive
        textAlign: 'center', // Center align the text
      }}
    >
      <Typography
        variant='h2' // Make the text larger
        gutterBottom
        sx={{
          fontWeight: 'bold', // Make the text bold
          // color: '#2E3B55', // Change the color to a more attractive one
          marginBottom: 2,
          position: 'relative',
          '::after': {
            content: '""',
            display: 'block',
            width: '70%', // Slightly longer than the text
            height: '4px', // Adjust the height of the line
            backgroundColor: '#d0d0d0', // Line color
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: '-30px', // Adjust the vertical position of the line
          },
        }}
      >
        ยินดีต้อนรับสู่{farmName}
      </Typography>
    </Box>
  )
}

export default HomePage
