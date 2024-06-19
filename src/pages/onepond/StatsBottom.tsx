import React from 'react'
import { Grid, Box } from '@mui/material'
import { LineChart, PieChart } from '@mui/x-charts'

const StatsBottom: React.FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={8}>
        <Box
          sx={{
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            padding: '16px',
            height: '100%',
          }}
        >
          <LineChart
            xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
            series={[
              {
                data: [2, 5.5, 2, 8.5, 1.5, 5],
              },
            ]}
            height={300}
          />
        </Box>
      </Grid>
      <Grid item xs={4}>
        <Box
          sx={{
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            padding: '16px',
            height: '100%',
            display: 'flex',
          }}
        >
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
        </Box>
      </Grid>
    </Grid>
  )
}

export default StatsBottom
