import { FC, ChangeEvent } from 'react'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

interface Props {
  xs: number
  isCheck: boolean
  name: string
  label: string
  handleCheckbox: (event: ChangeEvent<HTMLInputElement>) => void
}

const GridCheckbox: FC<Props> = ({
  xs,
  isCheck,
  name,
  label,
  handleCheckbox,
}) => {
  return (
    <Grid item xs={xs} container justifyContent='left' alignItems='center'>
      <FormControlLabel
        control={
          <Checkbox
            checked={isCheck}
            onChange={handleCheckbox}
            name={name}
            color='primary'
          />
        }
        label={label}
      />
    </Grid>
  )
}

export default GridCheckbox
