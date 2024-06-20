import * as React from 'react'
import {
  TextField,
  Grid,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from '@mui/material'
import { styled } from '@mui/system'
import DialogWrapperWithEdit from '../../components/DialogWrapperWithEdit'

interface DialogTableProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

const CustomTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: 'none',
  textAlign: 'center',
  '& .MuiInputBase-input': {
    padding: '8px 10px',
    fontSize: '0.8rem',
  },
}))

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '1.03rem',
  textAlign: 'center',
  paddingBottom: theme.spacing(1),
}))

const DialogTable: React.FC<DialogTableProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const initialData = Array.from({ length: 30 }, () => Array(15).fill(''))

  const [tableData, setTableData] = React.useState<string[][]>(initialData)

  const handleTableDataChange = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    setTableData((prevData) => {
      const updatedData = [...prevData]
      updatedData[rowIndex][colIndex] = value
      return updatedData
    })
  }

  const handleFormSubmit = () => {
    console.log(tableData)
    onSubmit(tableData)
    onClose()
  }

  const handleEdit = () => {
    console.log('edit')
  }

  return (
    <DialogWrapperWithEdit
      open={open}
      onClose={onClose}
      title='เหยื่อสด เดือนมิ.ย. ปี 2565'
      handleFormSubmit={handleFormSubmit}
      handleEdit={handleEdit}
      isLarge={true}
    >
      <Grid item xs={12}>
        <Table>
          <TableHead>
            <TableRow>
              <HeaderTableCell style={{ width: '5%' }}>วัน</HeaderTableCell>
              {[...Array(15)].map((_, index) => (
                <HeaderTableCell key={index}>{`บ่อ ${
                  index + 1
                }`}</HeaderTableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {tableData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <CustomTableCell>{rowIndex + 1}</CustomTableCell>
                {row.map((cell, colIndex) => (
                  <CustomTableCell key={colIndex}>
                    <TextField
                      value={cell}
                      onChange={(e) =>
                        handleTableDataChange(
                          rowIndex,
                          colIndex,
                          e.target.value
                        )
                      }
                      sx={{ width: 50 }}
                    />
                  </CustomTableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </DialogWrapperWithEdit>
  )
}

export default DialogTable
