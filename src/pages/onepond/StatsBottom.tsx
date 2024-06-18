import { Grid, Box } from '@mui/material'
import { BarChart, PieChart } from '@mui/x-charts'
import React from 'react'

const StatsBottom: React.FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={9}>
        <Box sx={{ border: '1px solid', padding: 2, height: '100%' }}>
          <BarChart
            series={[
              { data: [35, 44, 24, 34] },
              { data: [51, 6, 49, 30] },
              { data: [15, 25, 30, 50] },
              { data: [60, 50, 15, 25] },
            ]}
            height={290}
            xAxis={[{ data: ['Q1', 'Q2', 'Q3', 'Q4'], scaleType: 'band' }]}
            margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
          />
        </Box>
      </Grid>
      <Grid item xs={3}>
        <Box sx={{ border: '1px solid', padding: 2, height: '100%' }}>
          <PieChart
            series={[
              {
                data: [
                  { id: 0, value: 10, label: 'series A' },
                  { id: 1, value: 15, label: 'series B' },
                  { id: 2, value: 20, label: 'series C' },
                ],
              },
            ]}
            width={400}
            height={200}
          />
        </Box>
      </Grid>
    </Grid>
  )
}

export default StatsBottom
