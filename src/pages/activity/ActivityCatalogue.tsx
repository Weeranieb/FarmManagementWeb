import React from 'react'
import { TextField, MenuItem } from '@mui/material'
import { FilterStringProps } from '../../models/props/filterprop'

const pairFilterMap = {
  FILL: 'เติม',
  MOVE: 'ย้าย',
  SELL: 'ขาย',
}

const ModeFilter: React.FC<FilterStringProps> = ({ value, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }
  return (
    <TextField
      label='ประเภท'
      variant='outlined'
      size='small'
      sx={{ width: 150, mr: 3 }}
      value={value}
      onChange={handleChange}
      select
    >
      <MenuItem value=''>ทั้งหมด</MenuItem>
      {Object.entries(pairFilterMap).map(([key, val]) => (
        <MenuItem key={key} value={key}>
          {val}
        </MenuItem>
      ))}
    </TextField>
  )
}

export default ModeFilter
