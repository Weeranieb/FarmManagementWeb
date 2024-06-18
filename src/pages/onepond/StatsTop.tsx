import { Box, Card, CardContent, Typography } from '@mui/material'
import React from 'react'

const StatsTop: React.FC = () => {
  const cardData = [
    { title: 'วันที่เริ่มเลี้ยง', text: '27 พ.ย. 2566' },
    { title: 'จำนวนวันที่เลี้ยง', text: '1 ปี 3 เดือน 5 วัน' },
    { title: 'ต้นทุน', text: '฿ 100,000' },
    { title: 'รายได้สุทธิ', text: '฿ 300,000' },
  ]

  return (
    <Box display='flex' justifyContent='space-around' flexWrap='wrap' p={2}>
      {cardData.map((card, index) => (
        <Card
          key={index}
          style={{
            margin: '10px',
            width: 'calc(25% - 30px)',
            borderRadius: '10px',
            backgroundColor: '#FAF8EE',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <CardContent>
            <Typography
              variant='subtitle1'
              component='div'
              style={{
                marginBottom: '12px',
                fontWeight: 'bold',
                color: '#555',
              }}
            >
              {card.title}
            </Typography>
            <Typography
              variant='h5'
              color='text.primary'
              style={{ color: '#333', textAlign: 'center' }}
            >
              {card.text}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

export default StatsTop
