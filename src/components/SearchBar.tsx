import { FC } from 'react'
import { Box, TextField, InputAdornment, Button } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useTranslation } from 'react-i18next'

interface SearchBarProps {
  handleDialogOpen: () => void
}

const SearchBar: FC<SearchBarProps> = ({ handleDialogOpen }) => {
  const { t } = useTranslation()

  return (
    <Box display='flex' justifyContent='flex-end' alignItems='center'>
      <Box display='flex' alignItems='center'>
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
        />
        <Button
          variant='outlined'
          onClick={handleDialogOpen}
          sx={{
            backgroundColor: '#CEBCA1',
            color: '#4B4B4C',
            fontSize: '1.03rem',
            padding: '4px 20px',
            ml: 2,
          }}
        >
          {t('add')}
        </Button>
      </Box>
    </Box>
  )
}

export default SearchBar
