import React, { useEffect, useState, FC } from 'react'
import {
  IconButton,
  Grid,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Fab,
  FormHelperText,
} from '@mui/material'
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material'
import { styled } from '@mui/system'
import dayjs, { Dayjs } from 'dayjs'
import DialogWrapper from '../../components/DialogWrapper'
import { AddSellActivity } from '../../models/schema/activity'
import { Farm } from '../../models/schema/farm'
import { getFarmListApi } from '../../services/farm.service'
import { FarmWithActive } from '../../models/schema/activePond'
import { getFarmWithActiveApi } from '../../services/activePond.service'
import { FishTypeMap } from '../../constants/fishType'
import { SizeMap } from '../../constants/size'
import GridSelect from '../../components/grid/GridSelect'
import GridDateSelect from '../../components/grid/GridDateSelect'
import GridCheckbox from '../../components/grid/GridCheckbox'
import GridTextField from '../../components/grid/GridTextField'
import { getMerchantListApi } from '../../services/merchant.service'
import { Merchant } from '../../models/schema/merchant'

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

const CustomTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: 'none',
}))

const DialogSell: FC<DialogSellProps> = ({ open, onClose, onSubmit }) => {
  const [farms, setFarms] = useState<Farm[]>([])
  const [activePonds, setActivePonds] = useState<FarmWithActive[]>([])
  const [merchantList, setMerchantList] = useState<Merchant[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
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

    const getListMerchant = async () => {
      const merchantList = await getMerchantListApi()
      setMerchantList(merchantList.data)
    }

    getListFarms()
    getListMerchant()
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

  const validateFormData = (data: AddSellActivity) => {
    const newErrors: Record<string, string> = {}

    // Basic validations
    if (formData.farmId === 0) newErrors.farmId = 'Farm is required'
    if (formData.pondId === 0) newErrors.pondId = 'Pond is required'
    if (formData.merchantId === 0) newErrors.merchantId = 'Merchant is required'

    // Validate sell details
    data.sellDetails.forEach((detail, index) => {
      if (!detail.fishType)
        newErrors[`sellDetails[${index}].fishType`] = 'Fish type is required'
      if (!detail.size)
        newErrors[`sellDetails[${index}].size`] = 'Size is required'
      if (detail.amount <= 0)
        newErrors[`sellDetails[${index}].amount`] =
          'Amount must be greater than zero'
      if (detail.pricePerUnit <= 0)
        newErrors[`sellDetails[${index}].pricePerUnit`] =
          'Price per unit must be greater than zero'
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = () => {
    if (!validateFormData(formData)) return
    const formDataWithISODate = {
      ...formData,
      activityDate: dayjs(formData.activityDate).toISOString(),
    }
    onSubmit(formDataWithISODate)
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
        <GridSelect
          xs={4}
          value={formData.farmId.toString()}
          name='farmId'
          label='ฟาร์ม'
          objectMap={farms}
          handleSelectChange={handleSelectChange}
          error={errors.farmId}
        />
        <GridSelect
          xs={3}
          value={formData.pondId.toString()}
          name='pondId'
          label='บ่อ'
          objectMap={activePonds}
          handleSelectChange={handleSelectChange}
          error={errors.pondId}
        />
        <GridDateSelect
          xs={3}
          date={formData.activityDate}
          name='activityDate'
          label='วันที่ทำ'
          handleDateChange={handleDateChange}
        />
        <GridCheckbox
          xs={2}
          isCheck={formData.isClose}
          name='isClose'
          label='ปิดบ่อ'
          handleCheckbox={handleInputChange}
        />
        <GridTextField
          xs={4}
          value={formData.additionalCost?.toString() ?? ''}
          name='additionalCost'
          label='ค่าใช้จ่ายเพิ่มเติม (บาท)'
          handleInputChange={handleInputChange}
        />
        <GridSelect
          xs={3}
          value={formData.merchantId.toString()}
          name='merchantId'
          label='แม่ค้าที่จับ'
          objectMap={merchantList}
          handleSelectChange={handleSelectChange}
          error={errors.merchantId}
        />
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
                        name={`sellDetails[${index}].fishType`}
                        value={row.fishType}
                        size='small'
                        error={!!errors[`sellDetails[${index}].fishType`]}
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
                      {errors[`sellDetails[${index}].fishType`] && (
                        <FormHelperText style={{ color: '#d32f2f' }}>
                          {errors[`sellDetails[${index}].fishType`]}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </CustomTableCell>

                  <CustomTableCell>
                    <FormControl fullWidth margin='dense'>
                      <Select
                        name={`sellDetails[${index}].size`}
                        value={row.size}
                        size='small'
                        error={!!errors[`sellDetails[${index}].size`]}
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
                      {errors[`sellDetails[${index}].size`] && (
                        <FormHelperText style={{ color: '#d32f2f' }}>
                          {errors[`sellDetails[${index}].size`]}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </CustomTableCell>

                  <CustomTableCell>
                    <TextField
                      size='small'
                      name={`sellDetails[${index}].amount`}
                      value={row.amount.toString()}
                      type='number'
                      error={!!errors[`sellDetails[${index}].amount`]}
                      helperText={errors[`sellDetails[${index}].amount`]}
                      onChange={(e) =>
                        handleTableDataChange(index, 'amount', e.target.value)
                      }
                    />
                  </CustomTableCell>

                  <CustomTableCell>
                    <TextField
                      size='small'
                      name={`sellDetails[${index}].pricePerUnit`}
                      value={row.pricePerUnit.toString()}
                      type='number'
                      error={!!errors[`sellDetails[${index}].pricePerUnit`]}
                      helperText={errors[`sellDetails[${index}].pricePerUnit`]}
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
