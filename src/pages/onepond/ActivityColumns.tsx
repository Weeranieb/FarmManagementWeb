import { GridColDef } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'

const handleInfoClick = () => {
  console.log('Info icon clicked') // Implement your logic here
}

export const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: '',
    flex: 0.05,
    hideSortIcons: true,
    align: 'right',
  },
  {
    field: 'type',
    headerName: 'กิจกรรม',
    flex: 0.3,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'date',
    headerName: 'วันที่',
    flex: 0.2,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'totalWeight',
    headerName: 'น้ำหนักรวม',
    flex: 0.15,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'unit',
    headerName: 'หน่วย',
    flex: 0.25,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'createdDate',
    headerName: 'เพิ่มข้อมูลวันที่',
    flex: 0.25,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'info',
    headerName: '',
    align: 'right',
    hideSortIcons: true,
    disableColumnMenu: true,
    flex: 0.05,
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
