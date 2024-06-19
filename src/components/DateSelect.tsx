import React from 'react'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Dayjs } from 'dayjs'

interface DateSelectProps {
  label: string
  value: Dayjs | null
  onChange: (date: Dayjs | null) => void
  sx?: any
}

const DateSelect: React.FC<DateSelectProps> = ({
  label,
  value,
  onChange,
  sx,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker label={label} value={value} onChange={onChange} sx={sx} />
    </LocalizationProvider>
  )
}

export default DateSelect
