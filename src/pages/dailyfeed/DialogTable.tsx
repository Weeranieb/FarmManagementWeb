import * as React from 'react'
import {
  TextField,
  Grid,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Typography,
} from '@mui/material'
import { styled } from '@mui/system'
import DialogWrapperWithCancel from '../../components/DialogWrapperWithCancel'

interface DialogTableProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

const CustomTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid lightgrey',
  borderRight: '1px solid lightgrey',
  textAlign: 'center',
  '&:last-child': {
    borderRight: 0,
  },
  '& .MuiInputBase-input': {
    padding: '8px 10px',
    fontSize: '0.8rem',
    textAlign: 'right',
  },
}))

const HeaderTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '2px solid lightgrey',
  borderRight: '1px solid lightgrey',
  fontSize: '1.03rem',
  textAlign: 'center',
  paddingBottom: theme.spacing(1),
  '&:last-child': {
    borderRight: 0,
  },
}))

const DialogTable: React.FC<DialogTableProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const initialData = Array.from({ length: 30 }, () => Array(15).fill(''))

  const [tableData, setTableData] = React.useState<string[][]>(initialData)
  const [editing, setEditing] = React.useState<{
    row: number
    col: number
  } | null>(null)

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

  const handleCancel = () => {
    // refresh old value
    onClose()
  }

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setEditing({ row: rowIndex, col: colIndex })
  }

  const handleCellBlur = () => {
    setEditing(null)
  }

  return (
    <DialogWrapperWithCancel
      open={open}
      onClose={onClose}
      title='เหยื่อสด เดือนมิ.ย. ปี 2565'
      handleFormSubmit={handleFormSubmit}
      handleCancel={handleCancel}
      isLarge={true}
    >
      <Grid item xs={12} sx={{ paddingLeft: 0 }}>
        <Table sx={{ marginLeft: 0 }}>
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
                  <CustomTableCell
                    key={colIndex}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {editing?.row === rowIndex && editing?.col === colIndex ? (
                      <TextField
                        value={cell}
                        onChange={(e) =>
                          handleTableDataChange(
                            rowIndex,
                            colIndex,
                            e.target.value
                          )
                        }
                        onBlur={handleCellBlur}
                        sx={{ width: 50 }}
                        autoFocus
                        inputProps={{ style: { textAlign: 'right' } }}
                      />
                    ) : (
                      <Typography sx={{ width: 50 }}>{cell}</Typography>
                    )}
                  </CustomTableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </DialogWrapperWithCancel>
  )
}

export default DialogTable
