import { TextField, Box, MenuItem, Button, Typography } from '@mui/material'
import React from 'react'
import DateSelect from '../../components/DateSelect'
import { SearchDailyFeedProps } from './DailyFeedPage'
import dayjs, { Dayjs } from 'dayjs'

interface SearchProps {
  searchFormData: SearchDailyFeedProps
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleDateChange: (date: Dayjs | null) => void
  handleDialogSearch: () => void
}

const Search: React.FC<SearchProps> = ({
  searchFormData,
  handleInputChange,
  handleDateChange,
  handleDialogSearch,
}) => {
  const farms = ['Farm 1', 'Farm 2', 'Farm 3']

  return (
    <Box display='flex' alignItems='center' justifyContent='center' p={2}>
      <TextField
        label='ประเภท'
        name='type'
        variant='outlined'
        size='medium'
        sx={{ width: 150, mr: 3 }}
        value={searchFormData.type}
        onChange={handleInputChange}
        select
      >
        <MenuItem value=''>ทั้งหมด</MenuItem>
        <MenuItem value='เหยื่อสด'>เหยื่อสด</MenuItem>
        <MenuItem value='อาหารเม็ด'>อาหารเม็ด</MenuItem>
      </TextField>

      <TextField
        label='ฟาร์ม'
        name='farm'
        variant='outlined'
        size='medium'
        sx={{ width: 150, mr: 3 }}
        value={searchFormData.farm}
        onChange={handleInputChange}
        select
      >
        <MenuItem value=''>ทั้งหมด</MenuItem>
        {farms.map((farm, index) => (
          <MenuItem key={index} value={farm}>
            {farm}
          </MenuItem>
        ))}
      </TextField>

      <DateSelect
        label='วันที่ทำ'
        value={dayjs(searchFormData.date)}
        onChange={(date) => handleDateChange(date)}
        sx={{ width: '180px' }}
      />

      <Button
        variant='contained'
        color='primary'
        onClick={handleDialogSearch}
        sx={{ height: '100%', ml: 5, minHeight: '40px' }}
      >
        <Typography variant='body1'>ค้นหา</Typography>
      </Button>
    </Box>
  )
}

export default Search
