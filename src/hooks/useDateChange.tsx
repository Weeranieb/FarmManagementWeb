import { useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'

type DateChangeHandler = (date: Dayjs | null) => void

const useDateChange = (
  initialDate: Dayjs = dayjs()
): [Dayjs, DateChangeHandler] => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(initialDate)

  const handleDateChange: DateChangeHandler = (date) => {
    setSelectedDate(date || dayjs())
  }

  return [selectedDate, handleDateChange]
}

export default useDateChange
