import { Box, InputAdornment, TextField } from '@mui/material'
import { FC } from 'react'
import { useParams } from 'react-router-dom'
import AddAndUploadBar from '../../components/AddAndUploadBar'
import SearchIcon from '@mui/icons-material/Search'

const FarmDetail: FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <Box sx={{ p: 3 }}>
      <AddAndUploadBar
        title={'ฟาร์ม 1'}
        handleDialogOpen={() => console.log('open dialog')}
      />
      <Box display='flex' alignItems='center' sx={{ pb: 4, mt: 3 }}>
        <TextField
          variant='outlined'
          size='small'
          placeholder='ค้นหา'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
      </Box>
    </Box>
  )
}

export default FarmDetail
