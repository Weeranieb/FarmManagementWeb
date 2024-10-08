import { FC } from 'react'
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormHelperText,
} from '@mui/material'

interface Props {
  xs: number
  value: string
  name: string
  label: string
  objectMap:
    | Record<string | number, string | number>
    | { id: string | number; name: string | number }[] // Handle both object and array
  handleSelectChange: (event: SelectChangeEvent<string>) => void
  error?: string
}

const GridSelect: FC<Props> = ({
  xs,
  value,
  name,
  label,
  objectMap,
  handleSelectChange,
  error,
}) => {
  return (
    <Grid item xs={xs}>
      <FormControl fullWidth variant='outlined' margin='dense'>
        <InputLabel>{label}</InputLabel>
        <Select
          name={name}
          value={value}
          onChange={handleSelectChange}
          label={label}
          error={!!error}
        >
          {Array.isArray(objectMap)
            ? objectMap.map((item) => (
                <MenuItem key={item.id} value={item.id.toString()}>
                  {item.name}
                </MenuItem>
              ))
            : Object.entries(objectMap).map(([key, val]) => (
                <MenuItem key={key} value={key}>
                  {val}
                </MenuItem>
              ))}
        </Select>
        {error && (
          <FormHelperText style={{ color: '#d32f2f' }}>{error}</FormHelperText>
        )}
      </FormControl>
    </Grid>
  )
}

export default GridSelect
