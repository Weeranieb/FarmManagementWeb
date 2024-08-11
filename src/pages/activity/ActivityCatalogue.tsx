import { FC, ChangeEvent } from 'react'
import { TextField, MenuItem } from '@mui/material'
import { FilterStringProps } from '../../models/props/filterprop'
import { useTranslation } from 'react-i18next'

const pairFilterMap = {
  FILL: 'เติม',
  MOVE: 'ย้าย',
  SELL: 'ขาย',
}

const ModeFilter: FC<FilterStringProps> = ({ value, onChange }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }
  const { t } = useTranslation()
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
      <MenuItem value=''>{t('all')}</MenuItem>
      {Object.entries(pairFilterMap).map(([key, val]) => (
        <MenuItem key={key} value={key}>
          {val}
        </MenuItem>
      ))}
    </TextField>
  )
}

export default ModeFilter
