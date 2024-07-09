import React, { useEffect, useState } from 'react'
import { TextField, MenuItem } from '@mui/material'
import { Farm } from '../../models/schema/farm'
import { getFarmListApi } from '../../services/farm.service'
import { FilterNumberProps } from '../../models/props/filterprop'

const FarmFilter: React.FC<FilterNumberProps> = ({ value, onChange }) => {
  const [farms, setFarms] = useState<Farm[]>([])
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value))
  }
  return (
    <TextField
      label='ฟาร์ม'
      variant='outlined'
      size='small'
      sx={{ width: 150, mr: 3 }}
      value={value}
      onChange={handleChange}
      select
    >
      <MenuItem value={0}>ทั้งหมด</MenuItem>
      {farms.map((farm) => (
        <MenuItem key={farm.id} value={farm.id}>
          {farm.name}
        </MenuItem>
      ))}
    </TextField>
  )
}

export default FarmFilter
