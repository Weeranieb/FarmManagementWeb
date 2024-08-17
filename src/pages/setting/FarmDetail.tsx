import {
  Box,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { FC } from 'react'
import { useParams } from 'react-router-dom'
import AddAndUploadBar from '../../components/AddAndUploadBar'
import SearchIcon from '@mui/icons-material/Search'
import { useTranslation } from 'react-i18next'

const FarmDetail: FC = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const ponds = [
    { id: 1, name: 'Pond 1' },
    { id: 2, name: 'Pond 2' },
    { id: 3, name: 'Pond 3' },
    { id: 4, name: 'Pond 4' },
    { id: 5, name: 'Pond 5' },
    { id: 6, name: 'Pond 6' },
    { id: 7, name: 'Pond 7' },
    { id: 8, name: 'Pond 8' },
    { id: 9, name: 'Pond 9' },
    { id: 10, name: 'Pond 10' },
  ]

  return (
    <Box sx={{ p: 3 }}>
      <AddAndUploadBar
        title={'ฟาร์ม 1'}
        handleDialogOpen={() => console.log('open dialog')}
      />
      <Box display='flex' alignItems='center' sx={{ pb: 4, mt: 3 }}>
        <TextField
          variant='outlined'
          size='small'
          placeholder='ค้นหา'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
      </Box>
      <Grid container spacing={2}>
        {ponds.map((pond) => (
          <Grid item xs={12} sm={6} md={3} key={pond.id}>
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6'>{pond.name}</Typography>
                <Typography variant='body2'>ID: {pond.id}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default FarmDetail
