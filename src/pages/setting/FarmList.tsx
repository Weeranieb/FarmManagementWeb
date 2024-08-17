import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Box } from '@mui/material'
import RowButton from '../../components/RowButton'
import SearchBar from '../../components/ClientSearchBar'
import { useNavigate } from 'react-router-dom'

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

  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Box sx={{ p: 3 }}>
      <SearchBar
        handleDialogOpen={() => {
          console.log('open dialog')
        }}
      />
      <Box display='flex' flexDirection='column' mt={1}>
        {rows.map((row) => (
          <RowButton
            key={row.id}
            name={row.name}
            id={row.id}
            code={row.code}
            clientName={row.clientName}
            onClick={() => {
              navigate(`/setting/add-farm-pond/${row.id}`)
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

export default FarmList
