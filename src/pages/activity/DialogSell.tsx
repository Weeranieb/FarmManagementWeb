import React, { useEffect, useState, FC } from 'react'
import {
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
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material'
import { styled } from '@mui/system'
import dayjs, { Dayjs } from 'dayjs'
import DateSelect from '../../components/DateSelect'
import DialogWrapper from '../../components/DialogWrapper'
import { AddSellActivity } from '../../models/schema/activity'
import { Farm } from '../../models/schema/farm'
import { getFarmListApi } from '../../services/farm.service'
import { FarmWithActive } from '../../models/schema/activePond'
import { getFarmWithActiveApi } from '../../services/activePond.service'

interface DialogSellProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AddSellActivity) => void
}

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '1.03rem',
  textAlign: 'center',
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

const DialogSell: FC<DialogSellProps> = ({ open, onClose, onSubmit }) => {
  const [farms, setFarms] = useState<Farm[]>([])
  const [activePonds, setActivePonds] = useState<FarmWithActive[]>([])

  const [formData, setFormData] = useState<AddSellActivity>({
    farmId: 0,
    pondId: 0,
    merchantId: 0,
    activityDate: dayjs().format('YYYY-MM-DD'),
    additionalCost: 0,
    isClose: false,
    sellDetails: [
      {
        size: '',
        fishUnit: 'Kilogram',
        amount: 0,
        pricePerUnit: 0,
        fishType: '',
      },
    ],
  })

  useEffect(() => {
    const getListFarms = async () => {
      const farmList = await getFarmListApi()
      console.log('farm list', farmList.data)
      setFarms(farmList.data)
    }

    getListFarms()
  }, [])

  useEffect(() => {
    if (formData.farmId !== 0) {
      const getActivePond = async (farmId: number) => {
        console.log('farm id', farmId)
        const activePondList = await getFarmWithActiveApi(farmId)
        console.log('active pond list', activePondList.data)
        setActivePonds(activePondList.data)
      }

      getActivePond(formData.farmId)
    }
  }, [formData.farmId])

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
      const updatedSellDetail = [...prevData.sellDetails]
      updatedSellDetail[index] = { ...updatedSellDetail[index], [key]: value }
      return { ...prevData, tableData: updatedSellDetail }
    })
  }

  const handleAddRow = () => {
    setFormData((prevData) => ({
      ...prevData,
      sellDetails: [
        ...prevData.sellDetails,
        {
          size: '',
          fishUnit: 'Kilogram',
          amount: 0,
          pricePerUnit: 0,
          fishType: '',
        },
      ],
    }))
  }

  const handleRemoveRow = (index: number) => {
    setFormData((prevData) => {
      const updatedSellDetail = prevData.sellDetails.filter(
        (_, i) => i !== index
      )
      return { ...prevData, tableData: updatedSellDetail }
    })
  }

  const handleFormSubmit = () => {
    onSubmit(formData)
    onClose()
  }

  return (
    <DialogWrapper
      open={open}
      onClose={onClose}
      title='กรอกข้อมูล: ขาย'
      handleFormSubmit={handleFormSubmit}
    >
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>ฟาร์ม</InputLabel>
            <Select
              name='farmId'
              value={formData.farmId.toString()}
              onChange={handleSelectChange}
              label='ฟาร์ม'
            >
              {farms.map((farm) => (
                <MenuItem key={farm.id} value={farm.id.toString()}>
                  {farm.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>บ่อ</InputLabel>
            <Select
              name='pondId'
              value={formData.pondId.toString()}
              onChange={handleSelectChange}
              label='บ่อ'
            >
              {activePonds.map((pond) => (
                <MenuItem key={pond.id} value={pond.id.toString()}>
                  {pond.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} style={{ marginTop: '8px' }}>
          <DateSelect
            label='วันที่ทำ'
            value={dayjs(formData.activityDate)}
            onChange={handleDateChange}
          />
        </Grid>
        <Grid item xs={6} container justifyContent='left' alignItems='center'>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isClose}
                onChange={handleInputChange}
                name='isClose'
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
              {formData.sellDetails.map((row, index) => (
                <TableRow key={index}>
                  <CustomTableCell>{index + 1}</CustomTableCell>
                  <CustomTableCell>
                    <CustomTextField
                      name='fishType'
                      value={row.fishType}
                      onChange={(e) =>
                        handleTableDataChange(index, 'fishType', e.target.value)
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
                      name='pricePerUnit'
                      value={row.pricePerUnit}
                      onChange={(e) =>
                        handleTableDataChange(
                          index,
                          'pricePerUnit',
                          e.target.value
                        )
                      }
                    />
                  </CustomTableCell>
                  <CustomTableCell>
                    {index === formData.sellDetails.length - 1 ? (
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

export default DialogSell
