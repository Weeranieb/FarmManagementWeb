import * as React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { styled } from '@mui/system'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'

interface DialogAddProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: NewActivityData) => void
}

interface NewActivityData {
  pond: string
  activity: string
  farm: string
  totalWeight: string
  unit: string
  pricePerUnit: string
  date: string
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 50,
  },
}))

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.text.primary,
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '1.85rem',
  paddingLeft: theme.spacing(5),
  paddingBottom: theme.spacing(1),
  paddingTop: theme.spacing(4),
  paddingRight: theme.spacing(3),
}))

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  marginTop: theme.spacing(4),
  paddingLeft: theme.spacing(5),
  paddingRight: theme.spacing(5),
  paddingBottom: theme.spacing(3),
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingBottom: theme.spacing(3),
}))

const CustomButton = styled(Button)(({ theme }) => ({
  fontSize: '1.1rem',
  color: theme.palette.text.primary,
  padding: theme.spacing(1.5, 4),
  border: `2px solid ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.secondary.main,
  borderRadius: 50,
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
}))

const DialogAdd: React.FC<DialogAddProps> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = React.useState<NewActivityData>({
    pond: '',
    activity: '',
    farm: '',
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
    <StyledDialog open={open} onClose={onClose}>
      <StyledDialogTitle>
        กรอกข้อมูล
        <IconButton edge='end' color='inherit' onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent>
        <Grid container spacing={3}>
          <Grid item xs={6}>
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
          <Grid item xs={6}>
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label='วันที่ทำ'
                value={dayjs(formData.date)}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </StyledDialogContent>
      <StyledDialogActions>
        <Grid container justifyContent='center'>
          <CustomButton
            onClick={handleFormSubmit}
            color='primary'
            variant='contained'
          >
            บันทึก
          </CustomButton>
        </Grid>
      </StyledDialogActions>
    </StyledDialog>
  )
}

export default DialogAdd
