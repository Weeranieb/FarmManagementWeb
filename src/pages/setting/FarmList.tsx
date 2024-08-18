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

const FarmList: FC = () => {
  const rows = [
    {
      id: 1,
      name: 'Farm 1',
      code: 'F1',
      clientName: 'Client 1',
    },
    {
      id: 2,
      name: 'Farm 2',
      code: 'F2',
      clientName: 'Client 2',
    },
  ]
  const navigate = useNavigate()

  const [selectedClient, setSelectedClient] = useState<number>(0)
  const [farms, setFarms] = useState<ClientWithFarms[]>([])

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
        handleDialogOpen={() => {
          console.log('open dialog')
        }}
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
    </Box>
  )
}

export default FarmList
