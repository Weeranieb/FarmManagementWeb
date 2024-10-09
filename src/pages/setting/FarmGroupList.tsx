import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Grid } from '@mui/material'
import RowButton from '../../components/RowButton'
import SearchBar from '../../components/SearchBar'
import { useNavigate } from 'react-router-dom'
import SuccessAlert from '../../components/SuccessAlert'
import ErrorAlert from '../../components/ErrorAlert'
import {
  createFarmGroupApi,
  deleteFarmGroupApi,
  getAllFarmGroupApi,
} from '../../services/farmGroup.service'
import DialogAddFarmGroup from './DialogAddFarmGroup'
import { FarmGroup } from '../../models/schema/farmGroup'
import Swal from 'sweetalert2'

const FarmGroupList: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [farmGroups, setFarmGroups] = useState<FarmGroup[]>([])

  useEffect(() => {
    const getFarmGroupList = async () => {
      await getAllFarmGroupApi()
        .then((res) => {
          if (res.result) {
            setFarmGroups(res.data)
          } else {
            ErrorAlert(res)
          }
        })
        .catch((err) => ErrorAlert(err))
    }

    getFarmGroupList()
  }, [])

  const handleDialogOpen = () => {
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
  }

  const handleFormSubmit = async (newFarmGroup: any) => {
    await createFarmGroupApi(newFarmGroup)
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
        const res = await deleteFarmGroupApi(id)
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

  return (
    <Box sx={{ p: 3 }}>
      <SearchBar title={t('farmGroup')} handleDialogOpen={handleDialogOpen} />
      <Grid container spacing={2} mt={1}>
        {farmGroups.map((row) => (
          <Grid item xs={12} sm={4} key={row.id}>
            <RowButton
              name={row.name}
              id={row.id}
              code={row.code}
              onClick={() => {
                navigate(`/setting/farm-group/${row.id}`)
              }}
              onDelete={() => {
                handleDelete(row.id)
              }}
            />
          </Grid>
        ))}
      </Grid>
      <DialogAddFarmGroup
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleFormSubmit}
      />
    </Box>
  )
}

export default FarmGroupList
