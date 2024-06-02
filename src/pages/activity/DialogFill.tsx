import * as React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { styled } from '@mui/system'

interface DialogFillProps {
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
  date: string
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 16, // Adjust the value for rounder corners
  },
}))

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingRight: theme.spacing(2),
}))

const DialogFill: React.FC<DialogFillProps> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = React.useState<NewActivityData>({
    pond: '',
    activity: '',
    farm: '',
    totalWeight: '',
    unit: '',
    date: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        เพิ่มข้อมูลกิจกรรม
        <IconButton edge='end' color='inherit' onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <DialogContent>
        <TextField
          margin='dense'
          name='pond'
          label='บ่อ'
          type='text'
          fullWidth
          variant='outlined'
          value={formData.pond}
          onChange={handleInputChange}
        />
        <TextField
          margin='dense'
          name='activity'
          label='กิจกรรม'
          type='text'
          fullWidth
          variant='outlined'
          value={formData.activity}
          onChange={handleInputChange}
        />
        <TextField
          margin='dense'
          name='farm'
          label='ฟาร์ม'
          type='text'
          fullWidth
          variant='outlined'
          value={formData.farm}
          onChange={handleInputChange}
        />
        <TextField
          margin='dense'
          name='totalWeight'
          label='น้ำหนักรวม'
          type='text'
          fullWidth
          variant='outlined'
          value={formData.totalWeight}
          onChange={handleInputChange}
        />
        <TextField
          margin='dense'
          name='unit'
          label='หน่วย'
          type='text'
          fullWidth
          variant='outlined'
          value={formData.unit}
          onChange={handleInputChange}
        />
        <TextField
          margin='dense'
          name='date'
          label='วันที่ทำ'
          type='text'
          fullWidth
          variant='outlined'
          value={formData.date}
          onChange={handleInputChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          ยกเลิก
        </Button>
        <Button onClick={handleFormSubmit} color='primary'>
          เพิ่ม
        </Button>
      </DialogActions>
    </StyledDialog>
  )
}

export default DialogFill
