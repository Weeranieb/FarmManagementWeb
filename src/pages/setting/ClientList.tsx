import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Grid } from '@mui/material'
import RowButton from '../../components/RowButton'
import SearchBar from '../../components/SearchBar'
import { useNavigate } from 'react-router-dom'

const ClientList: FC = () => {
  const rows = [
    {
      id: 1,
      name: 'บุญมาฟาร์ม',
      code: 'Boonma',
    },
    {
      id: 2,
      name: 'ปรีชาฟาร์ม',
      code: 'Preecha',
    },
  ]

  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Box sx={{ p: 3 }}>
      <SearchBar
        handleDialogOpen={() => {
          console.log('open dialog')
        }}
      />
      <Grid container spacing={2} mt={1}>
        {rows.map((row) => (
          <Grid item xs={12} sm={4} key={row.id}>
            <RowButton
              name={row.name}
              id={row.id}
              code={row.code}
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
