import { FC, useEffect, useState } from 'react'
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
import { getDailyFeedByMonth } from '../../services/dailyFeed.service'
import { DailyFeed, SearchDailyFeedProps } from '../../models/schema/dailyFeed'
import { AbbrvMonthsThai } from '../../utils/time'

interface DialogTableProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  searchData: SearchDailyFeedProps
}

const CustomTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid lightgrey',
  borderRight: '1px solid lightgrey',
  textAlign: 'center',
  height: '50px',
  padding: '5px 16px',
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

const DialogTable: FC<DialogTableProps> = ({
  open,
  onClose,
  onSubmit,
  searchData,
}) => {
  const initialData = Array.from({ length: 30 }, () => Array(15).fill(''))
  const [feedCollection, setFeedCollection] = useState<DailyFeed[]>([])
  // get year from searchData.date
  const year: number = parseInt(searchData.date.split('-')[0])
  const month: number = parseInt(searchData.date.split('-')[1])

  const [tableData, setTableData] = useState<string[][]>(initialData)
  const [editing, setEditing] = useState<{
    row: number
    col: number
  } | null>(null)

  useEffect(() => {
    if (!open) return
    const getDailyFeeds = async () => {
      const res = await getDailyFeedByMonth(
        searchData.feedId,
        searchData.farmId,
        searchData.date
      )
      console.log('getDailyFeeds -> res', res)
      if (res.result) setFeedCollection(res.data)
    }

    getDailyFeeds()
  }, [open, searchData])

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
      title={`เหยื่อสด เดือน${AbbrvMonthsThai[month]} ปี ${year + 543}`}
      handleFormSubmit={handleFormSubmit}
      handleCancel={handleCancel}
      islarge
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
