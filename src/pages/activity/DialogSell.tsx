import React, { useEffect, useState, FC } from 'react'
import {
  IconButton,
  Grid,
  FormControl,
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
  InputLabel,
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

const SizeMap = {
  Fish_01: 'ปลา 1',
  Fish_02: 'ปลา 2',
  Fish_03: 'ปลา 3',
  Fish_04: 'ปลา 4',
  Fish_05: 'ปลา 5',
  Fish_06: 'ปลา 6',
  Fish_07: 'ปลา 7',
  Fish_08: 'ปลา 8',
  Fish_09: 'ปลา 9',
  Fish_10: 'ปลา 10',
  Fish_11: 'ปลา 11',
  Fish_12: 'ปลา 12',
}

const FishTypeMap = {
  Kaphong: 'ปลากะพง',
  Nil: 'ปลานิล',
}

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
      setFarms(farmList.data)
    }

    getListFarms()
  }, [])

  useEffect(() => {
    if (formData.farmId !== 0) {
      const getActivePond = async (farmId: number) => {
        const activePondList = await getFarmWithActiveApi(farmId)
        setActivePonds(activePondList.data)
      }

      getActivePond(formData.farmId)
    }
  }, [formData.farmId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target
    const newValue =
      type === 'checkbox'
        ? checked
        : isNaN(parseFloat(value))
        ? value
        : parseFloat(value)
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }))
  }

  const handleDateChange = (date: Dayjs | null) => {
    const formattedDate = date ? date.format('YYYY-MM-DD') : ''
    setFormData((prevData) => ({
      ...prevData,
      activityDate: formattedDate,
    }))
  }

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target
    if (name) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: parseInt(value, 10),
      }))
    }
  }

  const handleTableDataChange = (
    index: number,
    key: string,
    value: string | number
  ) => {
    setFormData((prevData) => {
      const updatedSellDetails = [...prevData.sellDetails]
      updatedSellDetails[index] = {
        ...updatedSellDetails[index],
        [key]: isNaN(parseFloat(value as string))
          ? value
          : parseFloat(value as string),
      }
      return { ...prevData, sellDetails: updatedSellDetails }
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
      const updatedSellDetails = prevData.sellDetails.filter(
        (_, i) => i !== index
      )
      return { ...prevData, sellDetails: updatedSellDetails }
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
        <Grid item xs={4}>
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
        <Grid item xs={3}>
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
        <Grid item xs={3} style={{ marginTop: '8px' }}>
          <DateSelect
            label='วันที่ทำ'
            value={dayjs(formData.activityDate)}
            onChange={handleDateChange}
          />
        </Grid>
        <Grid item xs={2} container justifyContent='left' alignItems='center'>
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
        <Grid item xs={4}>
          <TextField
            margin='dense'
            name='additionalCost'
            label='ค่าใช้จ่ายเพิ่มเติม (บาท)'
            type='text'
            fullWidth
            variant='outlined'
            value={formData.additionalCost?.toString() ?? ''}
            onChange={handleInputChange}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3} style={{ marginTop: '4px' }}>
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
                  ราคาต่อกิโลกรัม
                </HeaderTableCell>
                <TableCell style={{ width: '5%' }}></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {formData.sellDetails.map((row, index) => (
                <TableRow key={index}>
                  <CustomTableCell>{index + 1}</CustomTableCell>
                  <CustomTableCell>
                    <FormControl fullWidth margin='dense'>
                      <Select
                        name='fishType'
                        value={row.fishType}
                        size='small'
                        onChange={(e) =>
                          handleTableDataChange(
                            index,
                            'fishType',
                            e.target.value
                          )
                        }
                      >
                        {Object.entries(FishTypeMap).map(([key, value]) => (
                          <MenuItem key={key} value={key}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CustomTableCell>
                  <CustomTableCell>
                    <FormControl fullWidth margin='dense'>
                      <Select
                        name='size'
                        value={row.size}
                        size='small'
                        onChange={(e) =>
                          handleTableDataChange(index, 'size', e.target.value)
                        }
                      >
                        {Object.entries(SizeMap).map(([key, value]) => (
                          <MenuItem key={key} value={key}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CustomTableCell>
                  <CustomTableCell>
                    <TextField
                      size='small'
                      name='amount'
                      value={row.amount.toString()}
                      onChange={(e) =>
                        handleTableDataChange(index, 'amount', e.target.value)
                      }
                    />
                  </CustomTableCell>
                  <CustomTableCell>
                    <TextField
                      size='small'
                      name='pricePerUnit'
                      value={row.pricePerUnit.toString()}
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
