import * as React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Fab,
} from '@mui/material'
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material'
import { styled } from '@mui/system'
import dayjs, { Dayjs } from 'dayjs'
import DateSelect from '../../components/DateSelect'

interface DialogSellProps {
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
  closePond: boolean
  tableData: TableData[]
}

interface TableData {
  fish: string
  size: string
  amount: string
  pricePerKg: string
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 50,
    maxHeight: '75vh',
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
  // paddingBottom: theme.spacing(3),
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(3),
}))

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '1.03rem',
  textAlign: 'center',
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

const AddRowFab = styled(Fab)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}))

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    padding: '8px 10px',
    fontSize: '0.8rem',
  },
}))

const CustomTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: 'none',
}))

const DialogSell: React.FC<DialogSellProps> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = React.useState<NewActivityData>({
    pond: '',
    activity: '',
    farm: '',
    totalWeight: '',
    unit: '',
    pricePerUnit: '',
    date: dayjs().format('YYYY-MM-DD'),
    closePond: false,
    tableData: [{ fish: '', size: '', amount: '', pricePerKg: '' }],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
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

  const handleTableDataChange = (index: number, key: string, value: string) => {
    setFormData((prevData) => {
      const updatedTableData = [...prevData.tableData]
      updatedTableData[index] = { ...updatedTableData[index], [key]: value }
      return { ...prevData, tableData: updatedTableData }
    })
  }

  const handleAddRow = () => {
    setFormData((prevData) => ({
      ...prevData,
      tableData: [
        ...prevData.tableData,
        { fish: '', size: '', amount: '', pricePerKg: '' },
      ],
    }))
  }

  const handleRemoveRow = (index: number) => {
    setFormData((prevData) => {
      const updatedTableData = prevData.tableData.filter((_, i) => i !== index)
      return { ...prevData, tableData: updatedTableData }
    })
  }

  const handleFormSubmit = () => {
    onSubmit(formData)
    onClose()
  }

  return (
    <StyledDialog open={open} onClose={onClose}>
      <StyledDialogTitle>
        กรอกข้อมูล: ขาย
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
          <Grid item xs={6} style={{ marginTop: '8px' }}>
            <DateSelect
              label='วันที่ทำ'
              value={dayjs(formData.date)}
              onChange={handleDateChange}
            />
          </Grid>
          <Grid item xs={6} container justifyContent='left' alignItems='center'>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.closePond}
                  onChange={handleInputChange}
                  name='closePond'
                  color='primary'
                />
              }
              label='ปิดบ่อ'
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} style={{ marginTop: '16px' }}>
          <Grid item xs={12}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: '5%' }}></TableCell>
                  <HeaderTableCell
                    sx={{
                      width: '20%',
                    }}
                  >
                    ปลา
                  </HeaderTableCell>
                  <HeaderTableCell
                    sx={{
                      width: '20%',
                    }}
                  >
                    ไซส์
                  </HeaderTableCell>
                  <HeaderTableCell
                    sx={{
                      width: '20%',
                    }}
                  >
                    จำนวน
                  </HeaderTableCell>
                  <HeaderTableCell
                    sx={{
                      width: '30%',
                    }}
                  >
                    ราคาต่อกิโล
                  </HeaderTableCell>
                  <TableCell style={{ width: '5%' }}></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {formData.tableData.map((row, index) => (
                  <TableRow key={index}>
                    <CustomTableCell>{index + 1}</CustomTableCell>
                    <CustomTableCell>
                      <CustomTextField
                        name='fish'
                        value={row.fish}
                        onChange={(e) =>
                          handleTableDataChange(index, 'fish', e.target.value)
                        }
                      />
                    </CustomTableCell>
                    <CustomTableCell>
                      <CustomTextField
                        name='size'
                        value={row.size}
                        onChange={(e) =>
                          handleTableDataChange(index, 'size', e.target.value)
                        }
                      />
                    </CustomTableCell>
                    <CustomTableCell>
                      <CustomTextField
                        name='amount'
                        value={row.amount}
                        onChange={(e) =>
                          handleTableDataChange(index, 'amount', e.target.value)
                        }
                      />
                    </CustomTableCell>
                    <CustomTableCell>
                      <CustomTextField
                        name='pricePerKg'
                        value={row.pricePerKg}
                        onChange={(e) =>
                          handleTableDataChange(
                            index,
                            'pricePerKg',
                            e.target.value
                          )
                        }
                      />
                    </CustomTableCell>
                    <CustomTableCell>
                      {index === formData.tableData.length - 1 ? (
                        <AddRowFab size='small' onClick={handleAddRow}>
                          <AddIcon />
                        </AddRowFab>
                      ) : (
                        <IconButton
                          size='small'
                          onClick={() => handleRemoveRow(index)}
                        >
                          <RemoveIcon sx={{ color: '#CEBCA1' }} />
                        </IconButton>
                      )}
                    </CustomTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

export default DialogSell
