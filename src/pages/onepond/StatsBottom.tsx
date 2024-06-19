import React from 'react'
import { Grid, Card, CardContent, CardHeader } from '@mui/material'
import { LineChart, PieChart } from '@mui/x-charts'

const StatsBottom: React.FC = () => {
  return (
    <Grid container spacing={1}>
      <Grid item xs={8}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title='สรุป' />
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
                  // label: 'รายจ่าย',
                },
              ]}
              height={300}
              colors={['#fbb4ae']}
              grid={{ vertical: true, horizontal: true }}
              // margin={{ top: 40 }}
              margin={{ top: 10 }}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={4}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title='% รายจ่าย' />
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
