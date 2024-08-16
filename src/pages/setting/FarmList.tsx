import { FC } from 'react'

import { useTranslation } from 'react-i18next'
import SearchBar from '../../components/SearchBar'
import { Box, Button } from '@mui/material'
import RowButton from '../../components/RowButton'

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

  return (
    <>
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
              console.log(`Clicked on ${row.name}`)
            }}
          />
        ))}
      </Box>
    </>
  )
}

export default FarmList
