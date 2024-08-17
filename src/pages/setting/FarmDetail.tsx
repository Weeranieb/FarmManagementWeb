import { Box } from '@mui/material'
import { FC } from 'react'
import { useParams } from 'react-router-dom'
import AddAndUploadBar from '../../components/AddAndUploadBar'

const FarmDetail: FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <Box sx={{ p: 3 }}>
      <AddAndUploadBar handleDialogOpen={() => console.log('open dialog')} />
    </Box>
  )
}

export default FarmDetail
