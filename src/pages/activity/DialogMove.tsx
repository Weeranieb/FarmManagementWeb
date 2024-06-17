import * as React from 'react'
import {
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import DateSelect from '../../components/DateSelect'
import DialogWrapper from '../../components/DialogWrapper'

interface DialogMoveProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: NewActivityData) => void
}

interface NewActivityData {
  pond: string
  activity: string
  farm: string
  toFarm: string
  toPond: string
  totalWeight: string
  unit: string
  pricePerUnit: string
  date: string
}

const DialogMove: React.FC<DialogMoveProps> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = React.useState<NewActivityData>({
    pond: '',
    activity: '',
    farm: '',
    toFarm: '',
    toPond: '',
    totalWeight: '',
    unit: '',
    pricePerUnit: '',
    date: dayjs().format('YYYY-MM-DD'), // Initialize with today's date
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleDateChange = (date: Dayjs | null) => {
    const formattedDate = date ? date.format('YYYY-MM-DD') : ''
    setFormData((prevData) => ({
      ...prevData,
      date: formattedDate,
    }))
  }

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target
    if (name) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
  }

  const handleFormSubmit = () => {
    onSubmit(formData)
    onClose()
  }

  return (
    // <StyledDialog open={open} onClose={onClose}>
    //   <StyledDialogTitle>
    //     กรอกข้อมูล: ย้าย
    //     <IconButton edge='end' color='inherit' onClick={onClose}>
    //       <CloseIcon />
    //     </IconButton>
    //   </StyledDialogTitle>
    //   <StyledDialogContent>
    <DialogWrapper
      open={open}
      onClose={onClose}
      title='กรอกข้อมูล: ย้าย'
      handleFormSubmit={handleFormSubmit}
    >
      <Grid container spacing={3} alignItems='center'>
        <Grid item xs={2} container alignItems='center' justifyContent='center'>
          <Typography variant='h6'>จาก</Typography>
        </Grid>
        <Grid item xs={5}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>ฟาร์ม</InputLabel>
            <Select
              name='farm'
              value={formData.farm}
              onChange={handleSelectChange}
              label='ฟาร์ม'
            >
              <MenuItem value='Farm1'>Farm1</MenuItem>
              <MenuItem value='Farm2'>Farm2</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={5}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>บ่อ</InputLabel>
            <Select
              name='pond'
              value={formData.pond}
              onChange={handleSelectChange}
              label='บ่อ'
            >
              <MenuItem value='Pond1'>Pond1</MenuItem>
              <MenuItem value='Pond2'>Pond2</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={2} container alignItems='center' justifyContent='center'>
          <Typography variant='h6'>ไปยัง</Typography>
        </Grid>
        <Grid item xs={5}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>ฟาร์ม</InputLabel>
            <Select
              name='toFarm'
              value={formData.toFarm}
              onChange={handleSelectChange}
              label='ฟาร์ม'
            >
              <MenuItem value='Farm1'>Farm1</MenuItem>
              <MenuItem value='Farm2'>Farm2</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={5}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>บ่อ</InputLabel>
            <Select
              name='toPond'
              value={formData.toPond}
              onChange={handleSelectChange}
              label='บ่อ'
            >
              <MenuItem value='Pond1'>Pond1</MenuItem>
              <MenuItem value='Pond2'>Pond2</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>ปลา</InputLabel>
            <Select
              name='activity'
              value={formData.activity}
              onChange={handleSelectChange}
              label='ปลา'
            >
              <MenuItem value='Fish1'>Fish1</MenuItem>
              <MenuItem value='Fish2'>Fish2</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <TextField
            margin='dense'
            name='totalWeight'
            label='น้ำหนัก'
            type='text'
            fullWidth
            variant='outlined'
            value={formData.totalWeight}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>หน่วย</InputLabel>
            <Select
              name='unit'
              value={formData.unit}
              onChange={handleSelectChange}
              label='หน่วย'
            >
              <MenuItem value='kg'>kg</MenuItem>
              <MenuItem value='g'>g</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            margin='dense'
            name='pricePerUnit'
            label='ราคาต่อหน่วย'
            type='text'
            fullWidth
            variant='outlined'
            value={formData.pricePerUnit}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={6} style={{ marginTop: '8px' }}>
          <DateSelect
            label='วันที่ทำ'
            value={dayjs(formData.date)}
            onChange={handleDateChange}
          />
        </Grid>
      </Grid>
    </DialogWrapper>
  )
}

export default DialogMove
