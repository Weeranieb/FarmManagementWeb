import * as React from 'react'
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import DateSelect from '../../components/DateSelect'
import DialogWrapper from '../../components/DialogWrapper'

interface DialogDownloadFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: DownloadFormInput) => void
}

interface DownloadFormInput {
  date: string
  farm: string
  type: string
}

const DialogDownloadForm: React.FC<DialogDownloadFormProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = React.useState<DownloadFormInput>({
    farm: '',
    type: '',
    date: dayjs().format('YYYY-MM-DD'),
  })

  const handleDateChange = (date: Dayjs | null) => {
    const formattedDate = date ? date.format('YYYY-MM-DD') : ''
    setFormData((prevData) => ({
      ...prevData,
      paymentDate: formattedDate,
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
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>ประเภท</InputLabel>
            <Select
              name='type'
              value={formData.type}
              onChange={handleSelectChange}
              label='ประเภท'
            >
              <MenuItem value='เหยื่อสด'>เหยื่อสด</MenuItem>
              <MenuItem value='อาหารเม็ด'>อาหารเม็ด</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>ฟาร์ม</InputLabel>
            <Select
              name='farm'
              value={formData.type}
              onChange={handleSelectChange}
              label='ฟาร์ม'
            >
              <MenuItem value=''>ทั้งหมด</MenuItem>
              <MenuItem value='ฟาร์ม 1'>ฟาร์ม 1</MenuItem>
              <MenuItem value='ฟาร์ม 2'>ฟาร์ม 2</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={4} style={{ marginTop: '8px' }}>
          <DateSelect
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
