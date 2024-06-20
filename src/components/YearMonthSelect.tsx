import React from 'react'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'

interface DateSelectProps {
  label: string
  value: Dayjs | null
  onChange: (date: Dayjs | null) => void
  sx?: any
}

const YearMonthSelect: React.FC<DateSelectProps> = ({
  label,
  value,
  onChange,
  sx,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        sx={sx}
        views={['year', 'month']}
        minDate={dayjs('2010-01-01')}
        maxDate={dayjs('2040-01-01')}
      />
    </LocalizationProvider>
  )
}

export default YearMonthSelect
