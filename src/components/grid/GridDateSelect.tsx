import { FC } from 'react'
import { FormHelperText, Grid } from '@mui/material'
import DateSelect from '../DateSelect'
import dayjs, { Dayjs } from 'dayjs'

interface Props {
  xs: number
  date: string
  name: string
  label: string
  handleDateChange: (date: Dayjs | null) => void
  error?: string
}

const GridDateSelect: FC<Props> = ({
  xs,
  date,
  name,
  label,
  handleDateChange,
  error,
}) => {
  return (
    <Grid item xs={xs} style={{ marginTop: '8px' }}>
      <DateSelect
        label={label}
        value={dayjs(date)}
        onChange={handleDateChange}
      />
      {error && (
        <FormHelperText style={{ color: 'red' }}>{error}</FormHelperText>
      )}
    </Grid>
  )
}

export default GridDateSelect
