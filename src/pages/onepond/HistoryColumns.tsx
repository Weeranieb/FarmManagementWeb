import { GridColDef } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'

const handleInfoClick = () => {
  console.log('Info icon clicked') // Implement your logic here
}

export const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'Id',
    flex: 0.1,
    hideSortIcons: true,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'date',
    headerName: 'วันที่',
    flex: 0.4,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'netIncome',
    headerName: 'รายได้สุทธิ',
    flex: 0.35,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'info',
    headerName: '',
    align: 'right',
    hideSortIcons: true,
    disableColumnMenu: true,
    flex: 0.15,
    renderCell: (params) => {
      if (params.field === 'info') {
        return (
          <Box display='flex' alignItems='center'>
            <InfoIcon
              color='disabled'
              style={{ cursor: 'pointer' }}
              onClick={handleInfoClick}
            />
          </Box>
        )
      }
      return params.value
    },
  },
]
