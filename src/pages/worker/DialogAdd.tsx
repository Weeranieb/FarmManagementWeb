import { FC, useState, ChangeEvent } from 'react'
import {
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { Worker } from '../../models/schema/worker'
import DateSelect from '../../components/DateSelect'
import DialogWrapper from '../../components/DialogWrapper'

interface DialogAddProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Worker) => void
}

const DialogAdd: FC<DialogAddProps> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Worker>({
    id: 0,
    clientId: 0,
    farmGroupId: 0,
    firstName: '',
    lastName: '',
    gender: 'M',
    contactNumber: '',
    country: '',
    salary: 0,
    hireDate: '',
    isActive: true,
  })

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'paidAmount' ? parseFloat(value) : value,
    }))
  }

  const handleDateChange = (date: Dayjs | null) => {
    const formattedDate = date ? date.format('YYYY-MM-DD') : ''
    setFormData((prevData) => ({
      ...prevData,
      hireDate: formattedDate,
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
      onSubmit={handleFormSubmit}
      islarge={false}
    >
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <TextField
            margin='dense'
            name='firstName'
            label='ชื่อ'
            type='text'
            fullWidth
            variant='outlined'
            value={formData.firstName}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            margin='dense'
            name='lastName'
            label='นามสกุล'
            type='text'
            fullWidth
            variant='outlined'
            value={formData.lastName}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl component='fieldset'>
            <FormLabel component='legend'>เพศ</FormLabel>
            <RadioGroup
              row
              name='gender'
              value={formData.gender}
              onChange={handleInputChange}
            >
              <FormControlLabel value='M' control={<Radio />} label='ชาย' />
              <FormControlLabel value='F' control={<Radio />} label='หญิง' />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>ประเทศ</InputLabel>
            <Select
              name='country'
              value={formData.country}
              onChange={handleSelectChange}
              label='ประเทศ'
            >
              <MenuItem value='Thailand'>🇹🇭 ไทย</MenuItem>
              <MenuItem value='Cambodia'>🇰🇭 กัมพูชา</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            margin='dense'
            name='salary'
            label='เงินเดือน'
            type='number'
            fullWidth
            variant='outlined'
            value={formData.salary}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={6} style={{ marginTop: '8px' }}>
          <DateSelect
            label='วันที่เริ่มงาน'
            value={dayjs(formData.hireDate)}
            onChange={handleDateChange}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>ฟาร์ม</InputLabel>
            <Select
              name='farmGroupId'
              value={formData.farmGroupId}
              onChange={handleSelectChange}
              label='ฟาร์ม'
            >
              <MenuItem value={1}>ฟาร์มบุญมา</MenuItem>
              <MenuItem value={2}>ฟาร์มบ้านระกาศ</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </DialogWrapper>
  )
}

export default DialogAdd
