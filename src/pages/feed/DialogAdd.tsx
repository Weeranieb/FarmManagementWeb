import { ChangeEvent, useState } from 'react'
import {
  TextField,
  IconButton,
  Grid,
  Typography,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Fab,
  SelectChangeEvent,
} from '@mui/material'
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material'
import { styled } from '@mui/system'
import dayjs, { Dayjs } from 'dayjs'
import { CreateFeedCollection } from '../../models/schema/feed'
import DateSelect from '../../components/DateSelect'
import DialogWrapper from '../../components/DialogWrapper'
import GridTextField from '../../components/grid/GridTextField'
import GridSelect from '../../components/grid/GridSelect'
import { FeedUnitMap } from '../../constants/feedUnit'

interface DialogAddProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateFeedCollection) => void
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
  const [formData, setFormData] = useState<CreateFeedCollection>({
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleTableDataChange = (index: number, key: string, value: string) => {
    setFormData((prevData) => {
      const updatedFeedPriceHistories = [...prevData.feedPriceHistories]
      updatedFeedPriceHistories[index] = {
        ...updatedFeedPriceHistories[index],
        [key]: key === 'price' ? parseFloat(value) || 0 : value,
      }
      return { ...prevData, feedPriceHistories: updatedFeedPriceHistories }
    })
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: isNaN(parseFloat(value)) ? value : parseFloat(value),
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
          priceUpdatedDate: dayjs().format('YYYY-MM-DD'), // Use the current date
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

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === 'farmId' || name === 'pondId' ? parseInt(value, 10) : value,
    }))
  }

  const handleDateChange = (index: number, date: Dayjs | null) => {
    const formattedDate = date ? date.format('YYYY-MM-DD') : ''
    setFormData((prevData) => {
      const updatedFeedPriceHistories = [...prevData.feedPriceHistories]
      updatedFeedPriceHistories[index] = {
        ...updatedFeedPriceHistories[index],
        priceUpdatedDate: formattedDate,
      }
      return { ...prevData, feedPriceHistories: updatedFeedPriceHistories }
    })
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (formData.name === '') newErrors.name = 'Name is required'
    if (formData.code === '') newErrors.code = 'Code is required'
    if (formData.unit === '') newErrors.unit = 'Unit is required'
    if (formData.feedPriceHistories.length === 0)
      newErrors.feedPriceHistories = 'Price history is required'
    else {
      formData.feedPriceHistories.forEach((row, index) => {
        if (!row.priceUpdatedDate)
          newErrors[`priceUpdatedDate${index}`] =
            'Price updated date is required'
        if (row.price <= 0)
          newErrors[`price${index}`] = 'Price must be greater than 0'
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = () => {
    if (validateForm()) {
      const formDataWithISODate = {
        ...formData,
        feedPriceHistories: formData.feedPriceHistories.map((row) => ({
          ...row,
          priceUpdatedDate: dayjs(row.priceUpdatedDate).toISOString(),
        })),
      }
      onSubmit(formDataWithISODate)
      onClose()
    }
  }

  return (
    <DialogWrapper
      open={open}
      onClose={onClose}
      title='เพิ่มข้อมูล'
      handleFormSubmit={handleFormSubmit}
      islarge={false}
    >
      <Grid container spacing={3}>
        <GridTextField
          xs={5}
          name='name'
          label='ชื่อเต็มอาหาร'
          value={formData.name}
          handleInputChange={handleInputChange}
          error={errors.name}
        />
        <GridTextField
          xs={4}
          name='code'
          label='ชื่อย่อ'
          value={formData.code}
          handleInputChange={handleInputChange}
          error={errors.code}
        />
        <GridSelect
          xs={3}
          name='unit'
          label='หน่วย'
          value={formData.unit}
          objectMap={FeedUnitMap}
          handleSelectChange={handleSelectChange}
          error={errors.unit}
        />
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
                  ราคาต่อหน่วย
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
                      onChange={(date) => handleDateChange(index, date)}
                    />
                  </CustomTableCell>
                  <CustomTableCell>
                    <TextField
                      name='price'
                      value={row.price.toString()}
                      type='number'
                      onChange={(e) =>
                        handleTableDataChange(index, 'price', e.target.value)
                      }
                      error={!!errors[`price${index}`]}
                      helperText={errors[`price${index}`]}
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
