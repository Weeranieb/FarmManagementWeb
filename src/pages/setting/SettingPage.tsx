import { FC, useEffect, useState, SyntheticEvent } from 'react'
import { Box, Tab, Tabs, Typography } from '@mui/material'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import FarmList from './FarmList'
import FarmDetail from './FarmDetail'

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const SettingPage: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [value, setValue] = useState(0)

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue)
    const path = ['general', 'farm-group', 'add-customer', 'add-farm-pond'][
      newValue
    ]
    navigate(`/setting/${path}`)
  }

  useEffect(() => {
    const paths = ['general', 'farm-group', 'add-customer', 'add-farm-pond']
    const index = paths.indexOf(location.pathname.split('/').pop() || '')
    if (index !== -1) {
      setValue(index)
    }
  }, [location])

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
          <Tab
            label='ทั่วไป'
            {...a11yProps(0)}
            component={Link}
            to='/setting/general'
            sx={{ fontSize: '1.12rem' }}
          />
          <Tab
            label='กลุ่มฟาร์ม'
            {...a11yProps(1)}
            component={Link}
            to='/setting/farm-group'
            sx={{ fontSize: '1.12rem' }}
          />
          <Tab
            label='เพิ่มลูกค้า'
            {...a11yProps(2)}
            component={Link}
            to='/setting/add-customer'
            sx={{ fontSize: '1.12rem' }}
          />
          <Tab
            label='เพิ่มฟาร์มและบ่อปลา'
            {...a11yProps(3)}
            component={Link}
            to='/setting/add-farm-pond'
            sx={{ fontSize: '1.12rem' }}
          />
        </Tabs>
      </Box>

      {/* Render components based on the route */}
      <Routes>
        <Route path='general' element={<Typography>ทั่วไป</Typography>} />
        <Route
          path='farm-group'
          element={<Typography>กลุ่มฟาร์ม</Typography>}
        />
        <Route
          path='add-customer'
          element={<Typography>เพิ่มลูกค้า</Typography>}
        />
        {/* <Route path='add-customer/:id' element={<CustomerDetails />} /> */}
        <Route path='add-farm-pond' element={<FarmList />} />
        <Route path='add-farm-pond/:id' element={<FarmDetail />} />
      </Routes>
      {/* <CustomTabPanel value={value} index={0}>
        ทั่วไป
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        กลุ่มฟาร์ม
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        เพิ่มลูกค้า
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <FarmList />
      </CustomTabPanel> */}
    </Box>
  )
}

export default SettingPage
