import { FC, useEffect, useState } from 'react'
import { Box, Grid } from '@mui/material'
import RowButton from '../../components/RowButton'
import SearchBar from '../../components/SearchBar'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Client } from '../../models/schema/client'
import { getAllClientsApi } from '../../services/client.service'
import ErrorAlert from '../../components/ErrorAlert'

const ClientList: FC = () => {
  const { t } = useTranslation()
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    const getClients = async () => {
      await getAllClientsApi()
        .then((res) => {
          if (res.result) setClients(res.data)
          else ErrorAlert(res)
        })
        .catch((err) => ErrorAlert(err))
    }

    getClients()
  }, [])

  const navigate = useNavigate()

  return (
    <Box sx={{ p: 3 }}>
      <SearchBar
        title={t('client')}
        handleDialogOpen={() => {
          console.log('open dialog')
        }}
      />
      <Grid container spacing={2} mt={1}>
        {clients.map((row) => (
          <Grid item xs={12} sm={6} key={row.id}>
            <RowButton
              name={row.name}
              id={row.id}
              onClick={() => {
                navigate(`/setting/client/${row.id}`)
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default ClientList
