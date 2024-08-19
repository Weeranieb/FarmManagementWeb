import { FC, useEffect, useState } from 'react'
import { Box } from '@mui/material'
import RowButton from '../../components/RowButton'
import ClientSearchBar from '../../components/ClientSearchBar'
import { useNavigate } from 'react-router-dom'
import {
  getAllClientWithFarmApi,
  getSingleClientWithFarmApi,
} from '../../services/client.service'
import ErrorAlert from '../../components/ErrorAlert'
import { ClientWithFarms } from '../../models/schema/farm'
import DialogAddFarm from './DialogAddFarm'
import { createFarmApi } from '../../services/farm.service'
import SuccessAlert from '../../components/SuccessAlert'

const FarmList: FC = () => {
  const navigate = useNavigate()

  const [selectedClient, setSelectedClient] = useState<number>(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [farms, setFarms] = useState<ClientWithFarms[]>([])

  const handleDialogOpen = () => {
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
  }

  const handleFormSubmit = async (newFarm: any) => {
    await createFarmApi(newFarm)
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

  useEffect(() => {
    const getAllClientWithFarms = async () => {
      await getAllClientWithFarmApi()
        .then((res) => {
          if (res.result) {
            setFarms(res.data)
          } else {
            ErrorAlert(res)
          }
        })
        .catch((err) => ErrorAlert(err))
    }

    const getSingleClientWithFarms = async (clientId: number) => {
      await getSingleClientWithFarmApi(clientId)
        .then((res) => {
          if (res.result) {
            setFarms(res.data)
          } else {
            ErrorAlert(res)
          }
        })
        .catch((err) => ErrorAlert(err))
    }
    if (selectedClient === 0) {
      getAllClientWithFarms()
    } else {
      getSingleClientWithFarms(selectedClient)
    }
  }, [selectedClient])

  return (
    <Box sx={{ p: 3 }}>
      <ClientSearchBar
        value={selectedClient}
        handleOnChange={setSelectedClient}
        handleDialogOpen={handleDialogOpen}
      />
      <Box display='flex' flexDirection='column' mt={1}>
        {farms.map((row) => (
          <RowButton
            key={row.id}
            name={row.name}
            id={row.id}
            code={row.code}
            clientName={row.clientName}
            onClick={() => {
              navigate(`/setting/farm-pond/${row.id}`)
            }}
          />
        ))}
      </Box>
      <DialogAddFarm
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleFormSubmit}
      />
    </Box>
  )
}

export default FarmList
