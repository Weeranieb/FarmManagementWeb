import * as React from 'react'
import {
  TextField,
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
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material'
import { styled } from '@mui/system'
import dayjs, { Dayjs } from 'dayjs'
import { FeedCollection } from '../../models/schema/feed'
import DateSelect from '../../components/DateSelect'
import DialogWrapper from '../../components/DialogWrapper'

interface DialogAddProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: FeedCollection) => void
}

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
    <DialogWrapper
      open={open}
      onClose={onClose}
      title='เพิ่มข้อมูล'
      handleFormSubmit={handleFormSubmit}
    >
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
                    <DateSelect
                      label='วันที่'
                      value={dayjs(row.priceUpdatedDate)}
                      onChange={handleDateChange}
                    />
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
    </DialogWrapper>
  )
}

export default DialogAdd
