import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
} from '@mui/material'
import { LineChart, PieChart } from '@mui/x-charts'

const StatsBottom: React.FC = () => {
  return (
    <Grid container spacing={1}>
      <Grid item xs={8}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={
              <Box
                display='flex'
                alignItems='center'
                justifyContent='space-between'
                width='100%'
              >
                <Typography variant='h5'>สรุป</Typography>
                <Box display='flex' alignItems='center'>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#fbb4ae',
                      mr: 0.5,
                    }}
                  />
                  <Typography variant='body2'>รายรับ (แสนบาท)</Typography>
                </Box>
              </Box>
            }
          />
          <CardContent sx={{ paddingTop: 0 }}>
            <LineChart
              xAxis={[
                {
                  data: [1, 2, 3, 5, 8, 10],
                  label: 'วันที่',
                  labelStyle: { textAlign: 'right' },
                },
              ]}
              series={[
                {
                  data: [2, 5.5, 2, 8.5, 1.5, 5],
                },
              ]}
              height={300}
              colors={['#fbb4ae']}
              grid={{ vertical: true, horizontal: true }}
              margin={{ top: 10 }}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={4}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={
              <Box
                display='flex'
                alignItems='center'
                justifyContent='space-between'
                width='100%'
              >
                <Typography variant='h5'>% รายจ่าย</Typography>
              </Box>
            }
          />
          <CardContent sx={{ paddingTop: 0 }}>
            <PieChart
              colors={['#fbb4ae', '#b3cde3', '#ccebc5']}
              series={[
                {
                  data: [
                    { id: 0, value: 10, label: 'series A' },
                    { id: 1, value: 15, label: 'series B' },
                    { id: 2, value: 20, label: 'series C' },
                  ],
                  innerRadius: 0,
                  outerRadius: 100,
                  cx: '70%',
                  cy: '58%',
                },
              ]}
              slotProps={{
                legend: {
                  direction: 'row',
                  position: { vertical: 'top', horizontal: 'middle' },
                },
              }}
              height={300}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default StatsBottom
