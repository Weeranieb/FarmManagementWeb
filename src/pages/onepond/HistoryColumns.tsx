import React from 'react'
import { GridColDef } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

export const getColumns = (
  handleInfoClick: (id: number) => void
): GridColDef[] => [
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
    field: 'next',
    headerName: '',
    align: 'right',
    hideSortIcons: true,
    disableColumnMenu: true,
    flex: 0.15,
    renderCell: (params) => {
      return (
        <Box display='flex' alignItems='center'>
          <ArrowForwardIcon
            color='disabled'
            style={{ cursor: 'pointer' }}
            onClick={() => handleInfoClick(params.row.id)} // Pass the row ID to the click handler
          />
        </Box>
      )
    },
  },
]
