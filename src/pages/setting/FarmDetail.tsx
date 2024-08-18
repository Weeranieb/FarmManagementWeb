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
import { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AddAndUploadBar from '../../components/AddAndUploadBar'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useTranslation } from 'react-i18next'
import { Farm } from '../../models/schema/farm'
import { Pond } from '../../models/schema/pond'
import { getFarmApi } from '../../services/farm.service'
import ErrorAlert from '../../components/ErrorAlert'
import { getPondListApi } from '../../services/pond.service'

const FarmDetail: FC = () => {
  // Parse id to a number
  const { id } = useParams<{ id: string }>()
  const farmId = id ? parseInt(id, 10) : undefined
  const { t } = useTranslation()

  const [farm, setFarm] = useState<Farm>()
  const [ponds, setPonds] = useState<Pond[]>([])

  useEffect(() => {
    const getFarm = async () => {
      if (farmId !== undefined) {
        try {
          const res = await getFarmApi(farmId)
          if (res.result) {
            setFarm(res.data)
          } else {
            ErrorAlert(res)
          }
        } catch (err) {
          ErrorAlert(err)
        }
      }
    }

    const getPonds = async () => {
      if (farmId !== undefined) {
        await getPondListApi(farmId)
          .then((res) => {
            if (res.result) {
              setPonds(res.data)
            } else {
              ErrorAlert(res)
            }
          })
          .catch((err) => ErrorAlert(err))
      }
    }

    getFarm()
    getPonds()
  }, [farmId])

  return (
    <Box sx={{ p: 3 }}>
      <AddAndUploadBar
        title={farm ? farm.name : t('farm')}
        handleDialogOpen={() => console.log('open dialog')}
      />
      <Box display='flex' alignItems='center' sx={{ pb: 4, mt: 3 }}>
        <TextField
          variant='outlined'
          size='small'
          placeholder={t('search')}
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
                <Typography variant='body2'>
                  {t('id')}: {pond.id}
                </Typography>
              </CardContent>
              <CardActions
                sx={{ display: 'flex', justifyContent: 'flex-end', padding: 1 }}
              >
                <IconButton sx={{ color: '#9e9e9e' }}>
                  <EditIcon />
                </IconButton>
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

export default FarmDetail
