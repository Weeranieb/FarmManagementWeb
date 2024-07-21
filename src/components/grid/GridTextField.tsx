import { FC, ChangeEvent } from 'react'
import { Grid, TextField } from '@mui/material'

interface Props {
  xs: number
  value: string
  name: string
  label: string
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  type?: string
  error?: string
}

const GridTextField: FC<Props> = ({
  xs,
  value,
  name,
  label,
  handleInputChange,
  type = 'text',
  error,
}) => {
  return (
    <Grid item xs={xs}>
      <TextField
        margin='dense'
        name={name}
        label={label}
        type={type}
        fullWidth
        variant='outlined'
        value={value}
        onChange={handleInputChange}
        error={!!error}
        helperText={error}
      />
    </Grid>
  )
}

export default GridTextField
