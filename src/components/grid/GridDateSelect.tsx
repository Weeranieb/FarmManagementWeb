import { FC } from 'react'
import { Grid } from '@mui/material'
import DateSelect from '../DateSelect'
import dayjs, { Dayjs } from 'dayjs'

interface Props {
  xs: number
  date: string
  name: string
  label: string
  handleDateChange: (date: Dayjs | null) => void
}

const GridDateSelect: FC<Props> = ({
  xs,
  date,
  name,
  label,
  handleDateChange,
}) => {
  return (
    <Grid item xs={xs} style={{ marginTop: '8px' }}>
      <DateSelect
        label={label}
        value={dayjs(date)}
        onChange={handleDateChange}
      />
    </Grid>
  )
}

export default GridDateSelect
