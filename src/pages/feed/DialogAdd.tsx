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
  Typography,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Fab,
} from '@mui/material'
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material'
import { styled } from '@mui/system'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { FeedCollection } from '../../models/schema/feed'

interface DialogAddProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: FeedCollection) => void
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

const CustomTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: 'none',
  textAlign: 'center',
  '& .MuiInputBase-input': {
    padding: '8px 10px',
    fontSize: '0.8rem',
  },
}))

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '1.03rem',
  textAlign: 'center',
  paddingBottom: theme.spacing(1),
}))

const AddRowFab = styled(Fab)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}))

const DialogAdd: React.FC<DialogAddProps> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = React.useState<FeedCollection>({
    // id: 0,
    name: '',
    code: '',
    unit: '',
    feedPriceHistories: [
      {
        id: 0,
        feedCollectionId: 0,
        priceUpdatedDate: dayjs().format('YYYY-MM-DD'),
        price: 0,
      },
    ],
  })

  const handleTableDataChange = (index: number, key: string, value: string) => {
    setFormData((prevData) => {
      const updatedFeedPriceHistories = [...prevData.feedPriceHistories]
      updatedFeedPriceHistories[index] = {
        ...updatedFeedPriceHistories[index],
        [key]: value,
      }
      return { ...prevData, feedPriceHistories: updatedFeedPriceHistories }
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleAddRow = () => {
    setFormData((prevData) => ({
      ...prevData,
      feedPriceHistories: [
        ...prevData.feedPriceHistories,
        {
          id: 0,
          feedCollectionId: prevData?.id || 0,
          priceUpdatedDate: '',
          price: 0,
        },
      ],
    }))
  }

  const handleRemoveRow = (index: number) => {
    setFormData((prevData) => {
      const updatedFeedPriceHistories = prevData.feedPriceHistories.filter(
        (_, i) => i !== index
      )
      return { ...prevData, feedPriceHistories: updatedFeedPriceHistories }
    })
  }

  const handleDateChange = (date: Dayjs | null) => {
    const formattedDate = date ? date.format('YYYY-MM-DD') : ''
    setFormData((prevData) => ({
      ...prevData,
      date: formattedDate,
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
          <Grid item xs={5}>
            <FormControl fullWidth variant='outlined' margin='dense'>
              <TextField
                name='name'
                label='ชื่อ'
                value={formData.name}
                onChange={handleInputChange}
                variant='outlined'
              />
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth variant='outlined' margin='dense'>
              <TextField
                name='code'
                label='ชื่อย่อ'
                value={formData.code}
                onChange={handleInputChange}
                variant='outlined'
              />
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <FormControl fullWidth variant='outlined' margin='dense'>
              <TextField
                name='unit'
                label='หน่วย'
                value={formData.unit}
                onChange={handleInputChange}
                variant='outlined'
              />
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={3} style={{ marginTop: '16px' }}>
          <Grid item xs={12}>
            <Typography variant='h5' style={{ fontWeight: 'bold' }}>
              ประวัติราคา
            </Typography>
          </Grid>
        </Grid>
        <Grid>
          <Grid item xs={12}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: '5%' }}></TableCell>
                  <HeaderTableCell
                    sx={{
                      width: '45%',
                    }}
                  >
                    วันที่
                  </HeaderTableCell>
                  <HeaderTableCell
                    sx={{
                      width: '45%',
                    }}
                  >
                    ราคา
                  </HeaderTableCell>
                  <TableCell style={{ width: '5%' }}></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {formData.feedPriceHistories.map((row, index) => (
                  <TableRow key={index}>
                    <CustomTableCell>{index + 1}</CustomTableCell>
                    <CustomTableCell>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label='วันที่ทำ'
                          value={dayjs(row.priceUpdatedDate)}
                          onChange={handleDateChange}
                        />
                      </LocalizationProvider>
                    </CustomTableCell>
                    <CustomTableCell>
                      <TextField
                        name='price'
                        value={row.price}
                        onChange={(e) =>
                          handleTableDataChange(index, 'price', e.target.value)
                        }
                      />
                    </CustomTableCell>
                    <CustomTableCell>
                      {index === formData.feedPriceHistories.length - 1 ? (
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

export default DialogAdd
