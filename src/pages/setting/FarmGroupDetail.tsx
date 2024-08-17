import {
  Box,
  Card,
  CardActions,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { FC } from 'react'
import { useParams } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search'
import DeleteIcon from '@mui/icons-material/Delete'
import { useTranslation } from 'react-i18next'
import PageBarWithAdd from '../../components/PageBarWithAdd'

const FarmGroupDetail: FC = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const ponds = [
    { id: 1, name: 'ฟาร์ม 1' },
    { id: 2, name: 'ฟาร์ม 2' },
    { id: 3, name: 'ฟาร์ม 3' },
    { id: 4, name: 'ฟาร์ม 4' },
  ]

  return (
    <Box sx={{ p: 3 }}>
      <PageBarWithAdd
        title={'กลุ่ม: บ้านบุญมา'}
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
              <CardActions
                sx={{ display: 'flex', justifyContent: 'flex-end', padding: 1 }}
              >
                <IconButton sx={{ color: '#9e9e9e' }}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default FarmGroupDetail
