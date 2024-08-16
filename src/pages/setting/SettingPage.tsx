import { ReactNode, FC, useEffect, useState, SyntheticEvent } from 'react'
import { Box, Tab, Tabs, Typography } from '@mui/material'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FarmList from './FarmList'

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
      <CustomTabPanel value={value} index={0}>
        ทั่วไป
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <FarmList />
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
