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
import DeleteIcon from '@mui/icons-material/Delete'
import { useTranslation } from 'react-i18next'
import PageBarWithAdd from '../../components/PageBarWithAdd'
import { Farm } from '../../models/schema/farm'
import { FarmGroup } from '../../models/schema/farmGroup'
import {
  getFarmByFarmGroupIdApi,
  getFarmGroupApi,
} from '../../services/farmGroup.service'
import ErrorAlert from '../../components/ErrorAlert'
import DialogAddFarmInGroup from './DialogAddFarmInGroup'
import {
  createFarmOnFarmGroupApi,
  deleteFarmOnFarmGroupApi,
} from '../../services/farmOnFarmGroup.service'
import SuccessAlert from '../../components/SuccessAlert'
import Swal from 'sweetalert2'

const FarmGroupDetail: FC = () => {
  // farmGroup id
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const [farms, setFarms] = useState<Farm[]>([])
  const [farmGroup, setFarmGroup] = useState<FarmGroup>()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleDialogOpen = () => {
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
  }

  const handleFormSubmit = async (payload: any) => {
    payload['farmGroupId'] = parseInt(id ?? '', 10)
    await createFarmOnFarmGroupApi(payload)
      .then((res) => {
        if (res.result) {
          SuccessAlert()
          window.location.reload()
        } else {
          ErrorAlert(res)
        }
      })
      .catch((err) => {
        ErrorAlert(err)
      })
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
        const res = await deleteFarmOnFarmGroupApi(id)
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
    const farmGroupId = parseInt(id ?? '', 10)
    const getFarmGroup = async () => {
      if (id !== undefined) {
        await getFarmGroupApi(farmGroupId)
          .then((res) => {
            if (res.result) {
              setFarmGroup(res.data)
            } else {
              ErrorAlert(res)
            }
          })
          .catch((err) => ErrorAlert(err))
      }
    }

    const getFarms = async () => {
      if (id !== undefined) {
        await getFarmByFarmGroupIdApi(farmGroupId)
          .then((res) => {
            if (res.result) {
              setFarms(res.data)
            } else {
              ErrorAlert(res)
            }
          })
          .catch((err) => ErrorAlert(err))
      }
    }

    getFarmGroup()
    getFarms()
  }, [id])

  return (
    <Box sx={{ p: 3 }}>
      <PageBarWithAdd
        title={`${t('group')}: ${farmGroup?.name}`}
        handleDialogOpen={handleDialogOpen}
      />
      <Grid container spacing={2} mt={1}>
        {farms.map((farm) => (
          <Grid item xs={12} sm={6} md={3} key={farm.id}>
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6'>{farm.name}</Typography>
                <Typography variant='body2'>ID: {farm.id}</Typography>
              </CardContent>
              <CardActions
                sx={{ display: 'flex', justifyContent: 'flex-end', padding: 1 }}
              >
                <IconButton
                  sx={{ color: '#9e9e9e' }}
                  onClick={() => handleDelete(farm.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <DialogAddFarmInGroup
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleFormSubmit}
      />
    </Box>
  )
}

export default FarmGroupDetail
