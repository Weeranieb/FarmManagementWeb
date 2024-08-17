import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Grid } from '@mui/material'
import RowButton from '../../components/RowButton'
import SearchBar from '../../components/SearchBar'
import { useNavigate } from 'react-router-dom'

const FarmGroupList: FC = () => {
  const rows = [
    {
      id: 1,
      name: 'บ้านบุญมา',
      code: 'Boonma',
    },
    {
      id: 2,
      name: 'บ้านระกาศ',
      code: 'BanRakat',
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
                navigate(`/setting/farm-group/${row.id}`)
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default FarmGroupList
