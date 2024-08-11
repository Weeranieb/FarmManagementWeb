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
import { getFeedApi } from '../../services/feedCollection.service'
import { FeedCollection } from '../../models/schema/feed'
import { FarmWithActive } from '../../models/schema/activePond'
import { getFarmWithActiveApi } from '../../services/activePond.service'

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
  const [feedCollection, setFeedCollection] = useState<FeedCollection>()
  const [dailyFeed, setDailyFeed] = useState<DailyFeed[]>([])
  const [pondList, setPondList] = useState<FarmWithActive[]>([])
  const [tableData, setTableData] = useState<string[][]>([])
  const [editing, setEditing] = useState<{
    row: number
    col: number
  } | null>(null)

  // get year and month from searchData.date
  const year: number = parseInt(searchData.date.split('-')[0])
  const month: number = parseInt(searchData.date.split('-')[1])

  useEffect(() => {
    if (!open) return

    const fetchData = async () => {
      try {
        const [dailyFeedRes, feedRes, pondListRes] = await Promise.all([
          getDailyFeedByMonth(
            searchData.feedId,
            searchData.farmId,
            searchData.date
          ),
          getFeedApi(searchData.feedId),
          getFarmWithActiveApi(searchData.farmId),
        ])

        if (dailyFeedRes.result) setDailyFeed(dailyFeedRes.data)
        if (feedRes.result) setFeedCollection(feedRes.data)
        if (pondListRes.result) setPondList(pondListRes.data)
      } catch (error) {
        console.error('Error fetching data', error)
      }
    }

    fetchData()
  }, [open, searchData])

  useEffect(() => {
    if (dailyFeed.length === 0 || pondList.length === 0) return

    const length = new Date(year, month, 0).getDate()
    const initialTableData = Array.from({ length: length }, () =>
      Array(pondList.length).fill('')
    )
    dailyFeed.forEach((feed) => {
      const day = new Date(feed.feedDate).getDate() - 1 // adjust to 0-based index
      const pondIndex = pondList.findIndex((pond) => pond.id === feed.pondId)
      if (pondIndex >= 0) {
        initialTableData[day][pondIndex] = feed.amount
      }
    })

    setTableData(initialTableData)
  }, [dailyFeed, pondList, month, year])

  const handleTableDataChange = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    const numericValue = value === '' ? '' : parseFloat(value).toString()
    setTableData((prevData) => {
      const updatedData = [...prevData]
      updatedData[rowIndex][colIndex] = numericValue
      return updatedData
    })
  }

  const handleFormSubmit = () => {
    // Convert tableData from string[][] to DailyFeed[]
    const payload: DailyFeed[] = tableData.flatMap(
      (row, rowIndex) =>
        row
          .map((cell, colIndex) => {
            // Find corresponding pond and feed information
            const pond = pondList[colIndex]

            if (pond && cell !== '') {
              const existingFeed = dailyFeed.find(
                (feed) =>
                  feed.pondId === pond.id &&
                  new Date(feed.feedDate).getDate() === rowIndex + 1
              )

              // Create DailyFeed entry, including ID if available
              return {
                id: existingFeed ? existingFeed.id : -1,
                activePondId: existingFeed
                  ? existingFeed.activePondId
                  : undefined,
                pondId: pond.id,
                feedCollectionId: searchData.feedId,
                amount: parseFloat(cell),
                feedDate: `${year}-${month.toString().padStart(2, '0')}-${(
                  rowIndex + 1
                )
                  .toString()
                  .padStart(2, '0')}T00:00:00.000Z`,
                delflag: existingFeed ? existingFeed.delFlag : false,
                createdDate: existingFeed
                  ? existingFeed.createdDate
                  : undefined,
                createdBy: existingFeed ? existingFeed.createdBy : undefined,
                updatedDate: existingFeed
                  ? existingFeed.updatedDate
                  : undefined,
                updatedBy: existingFeed ? existingFeed.updatedBy : undefined,
              } as DailyFeed
            }

            return null
          })
          .filter((feed): feed is DailyFeed => feed !== null) // Filter out null entries
    )

    onSubmit(payload)
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
      title={`${feedCollection?.name} เดือน${AbbrvMonthsThai[month]} ปี ${
        year + 543
      }`}
      handleFormSubmit={handleFormSubmit}
      handleCancel={handleCancel}
      islarge
    >
      <Grid item xs={12} sx={{ paddingLeft: 0 }}>
        <Table sx={{ marginLeft: 0 }}>
          <TableHead>
            <TableRow>
              <HeaderTableCell style={{ width: '5%' }}>วัน</HeaderTableCell>
              {pondList.map((pond, index) => (
                <HeaderTableCell key={index}>{`${pond.name}`}</HeaderTableCell>
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
                        type='number'
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
