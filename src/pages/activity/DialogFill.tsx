import { FC, useEffect, useState, ChangeEvent } from 'react'
import { Grid, SelectChangeEvent } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import DialogWrapper from '../../components/DialogWrapper'
import { Farm } from '../../models/schema/farm'
import { getFarmListApi } from '../../services/farm.service'
import { FarmWithActive } from '../../models/schema/activePond'
import { getFarmWithActiveApi } from '../../services/activePond.service'
import { AddFillActivity } from '../../models/schema/activity'
import { FishTypeMap } from '../../constants/fishType'
import { UnitMap } from '../../constants/unit'
import GridCheckbox from '../../components/grid/GridCheckbox'
import GridSelect from '../../components/grid/GridSelect'
import GridTextField from '../../components/grid/GridTextField'
import GridDateSelect from '../../components/grid/GridDateSelect'

interface DialogFillProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AddFillActivity) => void
}

const DialogFill: FC<DialogFillProps> = ({ open, onClose, onSubmit }) => {
  const [farms, setFarms] = useState<Farm[]>([])
  const [activePonds, setActivePonds] = useState<FarmWithActive[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const getListFarms = async () => {
      const farmList = await getFarmListApi()
      console.log('farm list', farmList.data)
      setFarms(farmList.data)
    }

    getListFarms()
  }, [])

  const [formData, setFormData] = useState<AddFillActivity>({
    farmId: 0,
    pondId: 0,
    amount: 0,
    fishType: '',
    fishWeight: 0,
    pricePerUnit: 0,
    fishUnit: '',
    activityDate: dayjs().format('YYYY-MM-DD'),
    additionalCost: 0,
    isNewPond: false,
  })

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
        name === 'farmId' || name === 'pondId' ? parseInt(value, 10) : value,
    }))
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (formData.farmId === 0) newErrors.farmId = 'Farm is required'
    if (formData.pondId === 0) newErrors.pondId = 'Pond is required'
    if (formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0'
    if (formData.fishType === '') newErrors.fishType = 'Fish type is required'
    if (formData.fishUnit === '') newErrors.fishUnit = 'Fish unit is required'
    if (formData.fishWeight <= 0)
      newErrors.fishWeight = 'Fish weight must be greater than 0'
    if (formData.pricePerUnit <= 0)
      newErrors.pricePerUnit = 'Price per unit must be greater than 0'
    if (!formData.activityDate)
      newErrors.activityDate = 'Activity date is required'

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
      title='กรอกข้อมูล: เติม'
      handleFormSubmit={handleFormSubmit}
    >
      <Grid container spacing={3}>
        <GridSelect
          xs={5}
          value={formData.farmId.toString()}
          name='farmId'
          label='ฟาร์ม'
          objectMap={farms}
          handleSelectChange={handleSelectChange}
          error={errors.farmId}
        />
        <GridSelect
          xs={4}
          value={formData.pondId.toString()}
          name='pondId'
          label='บ่อ'
          objectMap={activePonds}
          handleSelectChange={handleSelectChange}
          error={errors.pondId}
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
          label='ราคาต่อหน่วย (บาท/หน่วย)'
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

export default DialogFill
