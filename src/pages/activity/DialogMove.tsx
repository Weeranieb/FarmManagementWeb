import React, { useEffect, useState, FC } from 'react'
import {
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import DateSelect from '../../components/DateSelect'
import DialogWrapper from '../../components/DialogWrapper'
import { AddMoveActivity } from '../../models/schema/activity'
import { getFarmListApi } from '../../services/farm.service'
import { Farm } from '../../models/schema/farm'
import { FarmWithActive } from '../../models/schema/activePond'
import { getFarmWithActiveApi } from '../../services/activePond.service'

interface DialogMoveProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AddMoveActivity) => void
}

const DialogMove: FC<DialogMoveProps> = ({ open, onClose, onSubmit }) => {
  const [farms, setFarms] = useState<Farm[]>([])
  const [fromActivePonds, setFromActivePonds] = useState<FarmWithActive[]>([])
  const [toActivePonds, setToActivePonds] = useState<FarmWithActive[]>([])

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
      [name]: value,
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
      title='กรอกข้อมูล: ย้าย'
      handleFormSubmit={handleFormSubmit}
    >
      <Grid container spacing={3} alignItems='center'>
        <Grid item xs={2} container alignItems='center' justifyContent='center'>
          <Typography variant='h6'>จาก</Typography>
        </Grid>
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
              value={formData.pondId.toString() || ''}
              onChange={handleSelectChange}
              label='บ่อ'
            >
              {fromActivePonds.map((pond) => (
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
                name='isClose'
                color='primary'
              />
            }
            label='ปิดบ่อ'
          />
        </Grid>
        <Grid item xs={2} container alignItems='center' justifyContent='center'>
          <Typography variant='h6'>ไปยัง</Typography>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth variant='outlined' margin='dense'>
            <InputLabel>ฟาร์ม</InputLabel>
            <Select
              name='toFarmId'
              value={formData.toFarmId.toString()}
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
              name='toPondId'
              value={formData.toPondId.toString() || ''}
              onChange={handleSelectChange}
              label='บ่อ'
            >
              {toActivePonds.map((pond) => (
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
              <MenuItem value='Kaphong'>ปลากะพง</MenuItem>
              <MenuItem value='Nil'>ปลานิล</MenuItem>
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
              <MenuItem value='Kilogram'>กิโลกรัม</MenuItem>
              <MenuItem value='Keed'>ขีด</MenuItem>
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
            label='ราคาต่อ (บาท) หน่วย'
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

export default DialogMove
