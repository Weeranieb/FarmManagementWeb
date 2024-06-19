import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
} from '@mui/material'
import { BarChart, PieChart } from '@mui/x-charts'
import { axisClasses } from '@mui/x-charts/ChartsAxis'

const StatsBottom: React.FC = () => {
  const valueFormatter = (value: number | null) => `${value} แสนบาท`
  const dataset = [
    {
      month: 'ส.ค. 68',
      cost: 100,
    },
    {
      month: 'ก.ย.',
      cost: 200,
    },
    {
      month: 'ต.ค.',
      cost: 300,
    },
    {
      month: 'พ.ย.',
      cost: 400,
    },
    {
      month: 'ธ.ค.',
      cost: 500,
    },
    {
      month: 'ม.ค. 69',
      cost: 600,
    },
  ]

  const chartSetting = {
    yAxis: [
      {
        label: 'จำนวนเงิน (แสนบาท)',
      },
    ],
    series: [{ dataKey: 'cost', valueFormatter }],
    height: 300,
    sx: {
      [`& .${axisClasses.directionY} .${axisClasses.label}`]: {
        transform: 'translateX(-10px)',
      },
    },
    margin: { top: 10, bottom: 20 },
    color: '#fbb4ae',
  }

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
            <BarChart
              dataset={dataset}
              colors={['#fbb4ae']}
              xAxis={[
                {
                  scaleType: 'band',
                  dataKey: 'month',
                  tickPlacement: 'middle',
                  tickLabelPlacement: 'middle',
                },
              ]}
              {...chartSetting}
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
