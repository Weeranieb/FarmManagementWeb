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
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { styled } from '@mui/system'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { Worker } from '../../models/schema/worker'

interface DialogAddProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Worker) => void
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
  const [formData, setFormData] = React.useState<Worker>({
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                <MenuItem value='Thailand'>ไทย</MenuItem>
                <MenuItem value='Cambodia'>กัมพูชา</MenuItem>
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label='วันที่เริ่มงาน'
                value={dayjs(formData.hireDate)}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
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
