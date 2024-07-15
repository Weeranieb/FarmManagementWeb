import React, { useEffect, useState } from 'react'
import {
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import DateSelect from '../../components/DateSelect'
import DialogWrapper from '../../components/DialogWrapper'
import { Farm } from '../../models/schema/farm'
import { getFarmListApi } from '../../services/farm.service'
import { FarmWithActive } from '../../models/schema/activePond'
import { getFarmWithActiveApi } from '../../services/activePond.service'
import { AddFillActivity } from '../../models/schema/activity'
import { FishTypeMap } from '../../constants/fishType'
import { UnitMap } from '../../constants/unit'

interface DialogFillProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AddFillActivity) => void
}

const DialogFill: React.FC<DialogFillProps> = ({ open, onClose, onSubmit }) => {
  const [farms, setFarms] = useState<Farm[]>([])
  const [activePonds, setActivePonds] = useState<FarmWithActive[]>([])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: isNaN(parseFloat(value)) ? value : parseFloat(value),
    }))
  }

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleFormSubmit = () => {
    onSubmit(formData)
    onClose()
  }

  return (
    <DialogWrapper
      open={open}
      onClose={onClose}
      title='กรอกข้อมูล: เติม'
      handleFormSubmit={handleFormSubmit}
    >
      <Grid container spacing={3}>
        <Grid item xs={5}>
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
        <Grid item xs={4}>
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
        <Grid item xs={3} container justifyContent='left' alignItems='center'>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isNewPond}
                onChange={handleCheckbox}
                name='isNewPond'
                color='primary'
              />
            }
            label='เปิดบ่อใหม่'
          />
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>ปลา</InputLabel>
            <Select
              name='fishType'
              value={formData.fishType}
              onChange={handleSelectChange}
              label='ปลา'
            >
              {Object.entries(FishTypeMap).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <TextField
            margin='dense'
            name='fishWeight'
            label='น้ำหนักเฉลี่ย'
            type='text'
            fullWidth
            variant='outlined'
            value={formData.fishWeight.toString()}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>หน่วย</InputLabel>
            <Select
              name='fishUnit'
              value={formData.fishUnit}
              onChange={handleSelectChange}
              label='หน่วย'
            >
              {Object.entries(UnitMap).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <TextField
            margin='dense'
            name='amount'
            label='จำนวน'
            type='text'
            fullWidth
            variant='outlined'
            value={formData.amount.toString()}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            margin='dense'
            name='pricePerUnit'
            label='ราคาต่อหน่วย (บาท/หน่วย)'
            type='text'
            fullWidth
            variant='outlined'
            value={formData.pricePerUnit.toString()}
            onChange={handleInputChange}
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
        <Grid item xs={4} style={{ marginTop: '8px' }}>
          <DateSelect
            label='วันที่ทำ'
            value={dayjs(formData.activityDate)}
            onChange={handleDateChange}
          />
        </Grid>
      </Grid>
    </DialogWrapper>
  )
}

export default DialogFill
