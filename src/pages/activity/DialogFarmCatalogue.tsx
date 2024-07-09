import React, { useEffect, useState } from 'react'
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material'
import { Farm } from '../../models/schema/farm'
import { getFarmListApi } from '../../services/farm.service'
import { FarmWithActive } from '../../models/schema/activePond'

interface DialogFarmFilterProps {
  formData: {
    farm: string
    pond: string
  }
  handleSelectChange: (e: SelectChangeEvent<string>) => void
}

const DialogFarmFilter: React.FC<DialogFarmFilterProps> = ({
  formData,
  handleSelectChange,
}) => {
  const [farms, setFarms] = useState<Farm[]>([])
  const [ponds, setPonds] = useState<FarmWithActive[]>([])

  useEffect(() => {
    const getFarms = async () => {
      try {
        const response = await getFarmListApi()
        setFarms(response.data)
      } catch (error) {
        console.error('Failed to fetch farms:', error)
      }
    }

    getFarms()
  }, [])

  return (
    <>
      <Grid item xs={6}>
        <FormControl fullWidth variant='outlined' margin='dense'>
          <InputLabel>ฟาร์ม</InputLabel>
          <Select
            name='farm'
            value={formData.farm}
            onChange={handleSelectChange}
            label='ฟาร์ม'
          >
            {farms.map((farm) => (
              <MenuItem key={farm.id} value={farm.id}>
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
            name='pond'
            value={formData.pond}
            onChange={handleSelectChange}
            label='บ่อ'
          >
            {ponds.map((pond) => (
              <MenuItem key={pond.id} value={pond.id}>
                {pond.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  )
}

export default DialogFarmFilter
