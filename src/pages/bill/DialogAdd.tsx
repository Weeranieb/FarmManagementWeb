import * as React from 'react'
import {
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { styled } from '@mui/system'
import { Bill } from '../../models/schema/bill'
import DateSelect from '../../components/DateSelect'
import DialogWrapper from '../../components/DialogWrapper'

interface DialogAddProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Bill) => void
}

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
  const [formData, setFormData] = React.useState<Bill>({
    id: 0,
    type: '',
    other: '',
    paidAmount: 0,
    farmGroupId: 0,
    paymentDate: dayjs().format('YYYY-MM-DD'), // Initialize with today's date
  })

  const [isOtherType, setIsOtherType] = React.useState(false)

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
      paymentDate: formattedDate,
    }))
  }

  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
    if (name === 'type') {
      setIsOtherType(value === 'อื่นๆ')
    }
  }

  const handleFormSubmit = () => {
    onSubmit(formData)
    onClose()
  }

  return (
    <DialogWrapper open={open} onClose={onClose} title='กรอกข้อมูล'>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>ประเภทค่าใช้จ่าย</InputLabel>
            <Select
              name='type'
              value={formData.type}
              onChange={handleSelectChange}
              label='ประเภทค่าใช้จ่าย'
            >
              <MenuItem value='ค่าไฟ'>ค่าไฟ</MenuItem>
              <MenuItem value='เงินเดือนลูกน้อง'>เงินเดือนลูกน้อง</MenuItem>
              <MenuItem value='อื่นๆ'>อื่นๆ</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            margin='dense'
            name='other'
            label='รายละเอียด'
            type='text'
            fullWidth
            variant='outlined'
            value={formData.other}
            onChange={handleInputChange}
            disabled={!isOtherType}
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
        <Grid item xs={6} />
        <Grid item xs={6} style={{ marginTop: '8px' }}>
          <DateSelect
            label='วันที่จ่าย'
            value={dayjs(formData.paymentDate)}
            onChange={handleDateChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            margin='dense'
            name='paidAmount'
            label='ค่าใช้จ่าย'
            type='number'
            fullWidth
            variant='outlined'
            value={formData.paidAmount}
            onChange={handleInputChange}
          />
        </Grid>
      </Grid>
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
    </DialogWrapper>
  )
}

export default DialogAdd
