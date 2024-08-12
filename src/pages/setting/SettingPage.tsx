import { ReactNode, FC, useEffect, useState, SyntheticEvent } from 'react'
import { Box, Tab, Tabs, TextField, Typography } from '@mui/material'

interface TabPanelProps {
  children?: ReactNode
  index: number
  value: number
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const SettingPage: FC = () => {
  const [value, setValue] = useState(0)

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
      <div
        role='tabpanel'
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    )
  }

  return (
    <Box>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        p={2}
      >
        <Box>
          <Typography
            variant='h4'
            component='h4'
            style={{ margin: 0, padding: '0 10px' }}
            gutterBottom
            fontWeight='bold'
          >
            ตั้งค่า
          </Typography>
        </Box>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label='ทั่วไป' {...a11yProps(0)} />
          <Tab label='กลุ่มฟาร์ม' {...a11yProps(1)} />
          <Tab label='เพิ่มลูกค้า' {...a11yProps(2)} />
          <Tab label='เพิ่มฟาร์มและบ่อปลา' {...a11yProps(3)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        ทั่วไป
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        กลุ่มฟาร์ม
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        เพิ่มลูกค้า
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        เพิ่มฟาร์มและบ่อปลา
      </CustomTabPanel>
    </Box>
  )
}

export default SettingPage
