import { FC } from 'react'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Dayjs } from 'dayjs'
import 'dayjs/locale/th'

interface DateSelectProps {
  label: string
  value: Dayjs | null
  onChange: (date: Dayjs | null) => void
  sx?: any
}

const DateSelect: FC<DateSelectProps> = ({ label, value, onChange, sx }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='th'>
      <DatePicker label={label} value={value} onChange={onChange} sx={sx} />
    </LocalizationProvider>
  )
}

export default DateSelect
