import { GridColDef } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import { Info as InfoIcon, Delete as DeleteIcon } from '@mui/icons-material'
import Swal from 'sweetalert2'
import { timeToDate } from '../../utils/string'

const handleInfoClick = () => {
  console.log('Info icon clicked') // Implement your logic here
}

const handleDeleteClick = (id: number) => {
  Swal.fire({
    title: 'ยืนยันการลบข้อมูล',
    text: 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้? \nข้อมูลจะถูกลบถาวรและไม่สามารถกู้คืนได้!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'ลบข้อมูล',
    cancelButtonText: 'ยกเลิก',
  }).then((result) => {
    if (result.isConfirmed) {
      console.log('กำลังลบข้อมูลกิจกรรม ID:', id)
      Swal.fire('ลบข้อมูลสำเร็จ!', 'ข้อมูลของคุณถูกลบเรียบร้อยแล้ว.', 'success')
    }
  })
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
    field: 'name',
    headerName: 'รายการ',
    flex: 0.2,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'code',
    headerName: 'โค้ดเนม',
    flex: 0.15,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'price',
    headerName: 'ราคาล่าสุด',
    flex: 0.15,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'unit',
    headerName: 'หน่วย',
    flex: 0.15,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'updatedDate',
    headerName: 'อัปเดทวันที่',
    flex: 0.15,
    valueFormatter: (params) => {
      if (params.value == null) {
        return ''
      }
      return timeToDate(params.value)
    },
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
  {
    field: 'more',
    headerName: '',
    align: 'left',
    hideSortIcons: true,
    disableColumnMenu: true,
    flex: 0.1,
    renderCell: (params) => {
      if (params.field === 'more') {
        return (
          <Box display='flex' alignItems='center'>
            <DeleteIcon
              color='disabled'
              style={{ cursor: 'pointer' }}
              onClick={() => handleDeleteClick(params.row.id)}
            />
          </Box>
        )
      }
      return params.value
    },
  },
]
