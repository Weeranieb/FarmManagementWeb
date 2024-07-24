import { TextField, Box, MenuItem, Button, Typography } from '@mui/material'
import { ChangeEvent, useState, FC, useEffect } from 'react'
import DateSelect from '../../components/DateSelect'
import { SearchDailyFeedProps } from './DailyFeedPage'
import dayjs, { Dayjs } from 'dayjs'
import { FeedCollection } from '../../models/schema/feed'
import { getFeedListApi } from '../../services/feedCollection.service'
import { getFarmListApi } from '../../services/farm.service'
import { Farm } from '../../models/schema/farm'

interface SearchProps {
  searchFormData: SearchDailyFeedProps
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleDateChange: (date: Dayjs | null) => void
  handleDialogSearch: () => void
}

const Search: FC<SearchProps> = ({
  searchFormData,
  handleInputChange,
  handleDateChange,
  handleDialogSearch,
}) => {
  const [feedCollection, setFeedCollection] = useState<FeedCollection[]>([])
  const [farms, setFarms] = useState<Farm[]>([])
  useEffect(() => {
    const getFeedList = async () => {
      const res = await getFeedListApi({
        page: 0,
        pageSize: 100,
        orderBy: '"Name"',
      })
      if (res.result) setFeedCollection(res.data.items)
    }

    const getFarms = async () => {
      const res = await getFarmListApi()
      if (res.result) setFarms(res.data)
    }

    getFeedList()
    getFarms()
  }, [])

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
        {feedCollection.map((feed, index) => (
          <MenuItem key={index} value={feed.id}>
            {feed.name}
          </MenuItem>
        ))}
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
        {farms.map((farm, index) => (
          <MenuItem key={index} value={farm.id}>
            {farm.name}
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
