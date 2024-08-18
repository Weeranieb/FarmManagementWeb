import { FC } from 'react'
import { Box } from '@mui/material'
import RowButton from '../../components/RowButton'
import ClientSearchBar from '../../components/ClientSearchBar'
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
  const navigate = useNavigate()

  return (
    <Box sx={{ p: 3 }}>
      <ClientSearchBar
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
              navigate(`/setting/farm-pond/${row.id}`)
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

export default FarmList
