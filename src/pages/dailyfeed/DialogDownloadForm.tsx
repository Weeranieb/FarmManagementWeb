import { FC, useEffect, useState } from 'react'
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import YearMonthSelect from '../../components/YearMonthSelect'
import DialogWrapper from '../../components/DialogWrapper'
import { DownloadFormInput } from './DailyFeedPage'
import { FeedCollection } from '../../models/schema/feed'
import { Farm } from '../../models/schema/farm'
import { getFarmListApi } from '../../services/farm.service'
import { getFeedListApi } from '../../services/feedCollection.service'

interface DialogDownloadFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: DownloadFormInput) => void
  downloadType: 'year' | 'month' | ''
}

const DialogDownloadForm: FC<DialogDownloadFormProps> = ({
  open,
  onClose,
  onSubmit,
  downloadType,
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

  const [formData, setFormData] = useState<DownloadFormInput>({
    farm: '',
    type: '',
    date: dayjs().format('YYYY-MM-DD'),
    downloadType: '',
  })

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      downloadType,
    }))
  }, [downloadType])

  const handleDateChange = (date: Dayjs | null) => {
    const formattedDate = date ? date.format('YYYY-MM-DD') : ''
    setFormData((prevData) => ({
      ...prevData,
      date: formattedDate,
    }))
  }

  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleFormSubmit = () => {
    console.log('formData Submit', formData)
    onSubmit(formData)
    onClose()
  }

  return (
    <DialogWrapper
      open={open}
      onClose={onClose}
      title='กรอกข้อมูล'
      handleFormSubmit={handleFormSubmit}
    >
      <Grid container spacing={3} alignItems='center'>
        <Grid item xs={4}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>ประเภท</InputLabel>
            <Select
              name='type'
              value={formData.type}
              onChange={handleSelectChange}
              label='ประเภท'
            >
              {feedCollection.map((feed, index) => (
                <MenuItem key={index} value={feed.id}>
                  {feed.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>ฟาร์ม</InputLabel>
            <Select
              name='farm'
              value={formData.farm}
              onChange={handleSelectChange}
              label='ฟาร์ม'
            >
              {farms.map((farm, index) => (
                <MenuItem key={index} value={farm.id}>
                  {farm.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={4} style={{ marginTop: '8px' }}>
          <YearMonthSelect
            label='เดือน/ปี'
            value={dayjs(formData.date)}
            onChange={handleDateChange}
          />
        </Grid>
      </Grid>
    </DialogWrapper>
  )
}

export default DialogDownloadForm
