import {
  Box,
  Card,
  CardActions,
  CardContent,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AddAndUploadBar from '../../components/AddAndUploadBar'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useTranslation } from 'react-i18next'
import { Farm } from '../../models/schema/farm'
import { Pond } from '../../models/schema/pond'
import { getFarmApi } from '../../services/farm.service'
import ErrorAlert from '../../components/ErrorAlert'
import {
  createPondApi,
  deletePondApi,
  getPondListApi,
  updatePondApi,
} from '../../services/pond.service'
import DialogAddPond from './DialogAddPond'
import SuccessAlert from '../../components/SuccessAlert'
import Swal from 'sweetalert2'

const FarmDetail: FC = () => {
  // Parse id to a number
  const { id } = useParams<{ id: string }>()
  const farmId = id ? parseInt(id, 10) : undefined
  const { t } = useTranslation()

  const [farm, setFarm] = useState<Farm>()
  const [ponds, setPonds] = useState<Pond[]>([])
  const [currentPond, setCurrentPond] = useState<Pond | null>(null)
  const [dialogAddOpen, setDialogAddOpen] = useState(false)
  const [dialogUploadOpen, setDialogUploadOpen] = useState(false)

  const handleDialogOpen = (pond?: Pond) => {
    if (pond) {
      setCurrentPond(pond) // Set pond for editing
    } else {
      setCurrentPond(null) // For adding new pond
    }
    setDialogAddOpen(true)
  }

  const handleDialogClose = () => {
    setDialogAddOpen(false)
    setCurrentPond(null) // Reset after closing
  }

  const handleAddFormSubmit = async (payload: any) => {
    payload['farmId'] = parseInt(id ?? '', 10)
    try {
      let response: any
      if (currentPond) {
        // Editing an existing pond
        payload['id'] = currentPond.id
        response = await updatePondApi(payload)
      } else {
        // Adding a new pond
        response = await createPondApi(payload)
      }

      // Handle response
      if (response.result) {
        SuccessAlert()
        window.location.reload()
      } else {
        ErrorAlert(response)
      }
    } catch (err) {
      ErrorAlert(err)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: 'ยืนยันการลบข้อมูล',
        text: 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้? \nข้อมูลจะถูกลบถาวรและไม่สามารถกู้คืนได้!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ลบข้อมูล',
        cancelButtonText: 'ยกเลิก',
      })
      if (result.isConfirmed) {
        const res = await deletePondApi(id)
        if (res.result) {
          SuccessAlert()
          window.location.reload()
        } else {
          ErrorAlert(res)
        }
      }
    } catch (err) {
      ErrorAlert(err)
    }
  }

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
        handleDialogOpen={() => handleDialogOpen()}
      />
      <Grid container spacing={2} mt={1}>
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
                <IconButton
                  onClick={() => handleDialogOpen(pond)}
                  sx={{ color: '#9e9e9e' }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  sx={{ color: '#9e9e9e' }}
                  onClick={() => handleDelete(pond.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <DialogAddPond
        open={dialogAddOpen}
        onClose={handleDialogClose}
        onSubmit={handleAddFormSubmit}
        pond={currentPond} // Pass current pond for editing
      />
    </Box>
  )
}

export default FarmDetail
