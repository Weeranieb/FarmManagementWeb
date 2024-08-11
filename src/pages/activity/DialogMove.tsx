import { ChangeEvent, useEffect, useState, FC } from 'react'
import { Grid, SelectChangeEvent, Typography } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import DialogWrapper from '../../components/DialogWrapper'
import { AddMoveActivity } from '../../models/schema/activity'
import { getFarmListApi } from '../../services/farm.service'
import { Farm } from '../../models/schema/farm'
import { FarmWithActive } from '../../models/schema/activePond'
import { getFarmWithActiveApi } from '../../services/activePond.service'
import { FishTypeMap } from '../../constants/fishType'
import { UnitMap } from '../../constants/unit'
import GridSelect from '../../components/grid/GridSelect'
import GridCheckbox from '../../components/grid/GridCheckbox'
import GridTextField from '../../components/grid/GridTextField'
import GridDateSelect from '../../components/grid/GridDateSelect'

interface DialogMoveProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AddMoveActivity) => void
}

const DialogMove: FC<DialogMoveProps> = ({ open, onClose, onSubmit }) => {
  const [farms, setFarms] = useState<Farm[]>([])
  const [fromActivePonds, setFromActivePonds] = useState<FarmWithActive[]>([])
  const [toActivePonds, setToActivePonds] = useState<FarmWithActive[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [formData, setFormData] = useState<AddMoveActivity>({
    farmId: 0,
    pondId: 0,
    toFarmId: 0,
    toPondId: 0,
    amount: 0,
    fishType: '',
    fishWeight: 0,
    pricePerUnit: 0,
    fishUnit: '',
    additionalCost: 0,
    activityDate: dayjs().format('YYYY-MM-DD'),
    isNewPond: false,
    isClose: false,
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
        setFromActivePonds(activePondList.data)
      }

      getActivePond(formData.farmId)
    }
  }, [formData.farmId])

  useEffect(() => {
    if (formData.toFarmId !== 0) {
      const getActivePond = async (toFarmId: number) => {
        console.log('to farm id', toFarmId)
        const activePondList = await getFarmWithActiveApi(toFarmId)
        console.log('active pond list', activePondList.data)
        setToActivePonds(activePondList.data)
      }

      getActivePond(formData.toFarmId)
    }
  }, [formData.toFarmId])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: isNaN(parseFloat(value)) ? value : parseFloat(value),
    }))
  }

  const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
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
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === 'farmId' ||
        name === 'pondId' ||
        name === 'toFarmId' ||
        name === 'toPondId'
          ? parseInt(value, 10)
          : value,
    }))
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (formData.farmId === 0) newErrors.farmId = 'Farm is required'
    if (formData.pondId === 0) newErrors.pondId = 'Pond is required'
    if (formData.toFarmId === 0)
      newErrors.toFarmId = 'Destination farm is required'
    if (formData.toPondId === 0)
      newErrors.toPondId = 'Destination pond is required'
    if (formData.amount <= 0)
      newErrors.amount = 'Amount must be greater than zero'
    if (formData.pricePerUnit <= 0)
      newErrors.pricePerUnit = 'Price per unit must be greater than zero'
    if (!formData.activityDate)
      newErrors.activityDate = 'Activity date is required'
    if (formData.fishType === '') newErrors.fishType = 'Fish type is required'
    if (formData.fishUnit === '') newErrors.fishUnit = 'Fish unit is required'
    if (formData.fishWeight <= 0)
      newErrors.fishWeight = 'Fish weight must be greater than 0'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = () => {
    if (validateForm()) {
      const formDataWithISODate = {
        ...formData,
        activityDate: dayjs(formData.activityDate).toISOString(),
      }
      onSubmit(formDataWithISODate)
      onClose()
    }
  }

  return (
    <DialogWrapper
      open={open}
      onClose={onClose}
      title='กรอกข้อมูล: ย้าย'
      handleFormSubmit={handleFormSubmit}
      islarge={false}
    >
      <Grid container spacing={3} alignItems='center'>
        <Grid item xs={2} container alignItems='center' justifyContent='center'>
          <Typography variant='h6'>จาก</Typography>
        </Grid>
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
          objectMap={fromActivePonds}
          handleSelectChange={handleSelectChange}
          error={errors.pondId}
        />
        <GridCheckbox
          xs={3}
          isCheck={formData.isClose}
          name='isClose'
          label='ปิดบ่อ'
          handleCheckbox={handleCheckbox}
        />
        <Grid item xs={2} container alignItems='center' justifyContent='center'>
          <Typography variant='h6'>ไปยัง</Typography>
        </Grid>
        <GridSelect
          xs={4}
          value={formData.toFarmId.toString()}
          name='toFarmId'
          label='ฟาร์ม'
          objectMap={farms}
          handleSelectChange={handleSelectChange}
          error={errors.toFarmId}
        />
        <GridSelect
          xs={3}
          value={formData.toPondId.toString()}
          name='toPondId'
          label='บ่อ'
          objectMap={toActivePonds}
          handleSelectChange={handleSelectChange}
          error={errors.toPondId}
        />
        <GridCheckbox
          xs={3}
          isCheck={formData.isNewPond}
          name='isNewPond'
          label='เปิดบ่อใหม่'
          handleCheckbox={handleCheckbox}
        />
        <GridSelect
          xs={3}
          value={formData.fishType}
          name='fishType'
          label='ปลา'
          objectMap={FishTypeMap}
          handleSelectChange={handleSelectChange}
          error={errors.fishType}
        />
        <GridTextField
          xs={3}
          value={formData.fishWeight.toString()}
          name='fishWeight'
          label='น้ำหนักเฉลี่ย'
          type='number'
          handleInputChange={handleInputChange}
          error={errors.fishWeight}
        />
        <GridSelect
          xs={3}
          value={formData.fishUnit}
          name='fishUnit'
          label='หน่วย'
          objectMap={UnitMap}
          handleSelectChange={handleSelectChange}
          error={errors.fishUnit}
        />
        <GridTextField
          xs={3}
          value={formData.amount.toString()}
          name='amount'
          label='จำนวน'
          type='number'
          handleInputChange={handleInputChange}
          error={errors.amount}
        />
        <GridTextField
          xs={4}
          value={formData.pricePerUnit.toString()}
          name='pricePerUnit'
          label='ราคาต่อ (บาท) หน่วย'
          type='number'
          handleInputChange={handleInputChange}
          error={errors.pricePerUnit}
        />
        <GridTextField
          xs={4}
          value={formData.additionalCost?.toString() ?? ''}
          name='additionalCost'
          label='ค่าใช้จ่ายเพิ่มเติม (บาท)'
          type='number'
          handleInputChange={handleInputChange}
        />
        <GridDateSelect
          xs={4}
          date={formData.activityDate}
          name='activityDate'
          label='วันที่ทำ'
          handleDateChange={handleDateChange}
          error={errors.activityDate}
        />
      </Grid>
    </DialogWrapper>
  )
}

export default DialogMove
