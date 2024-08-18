import { FC, useEffect, useState } from 'react'
import { Box, TextField, InputAdornment, Button, MenuItem } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useTranslation } from 'react-i18next'
import { Client } from '../models/schema/client'
import { getAllClientsApi } from '../services/client.service'
import ErrorAlert from './ErrorAlert'

const ClientSearchBar: FC<{
  value: number
  handleOnChange: (value: number) => void
  handleDialogOpen: () => void
}> = ({ value, handleOnChange, handleDialogOpen }) => {
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

  return (
    <Box display='flex' justifyContent='space-between' alignItems='center'>
      <TextField
        select
        label={t('client')}
        variant='outlined'
        size='small'
        value={value}
        onChange={(event) => handleOnChange(Number(event.target.value))}
        sx={{ width: 150, mr: 2 }}
      >
        <MenuItem key='all' value={0}>
          {t('all')}
        </MenuItem>
        {clients.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {t(option.name)}
          </MenuItem>
        ))}
      </TextField>

      <Box display='flex' alignItems='center'>
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
          sx={{ mr: 2 }}
        />
        <Button
          variant='outlined'
          onClick={handleDialogOpen}
          sx={{
            backgroundColor: '#CEBCA1',
            color: '#4B4B4C',
            fontSize: '1.03rem',
            padding: '4px 20px',
          }}
        >
          {t('add')}
        </Button>
      </Box>
    </Box>
  )
}

export default ClientSearchBar
